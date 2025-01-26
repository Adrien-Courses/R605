+++
title = "Retour mappedBy"
weight = 50
+++

> [!ressource] Ressources
> - [What is the difference between Unidirectional and Bidirectional JPA and Hibernate associations?](https://stackoverflow.com/questions/5360795/what-is-the-difference-between-unidirectional-and-bidirectional-jpa-and-hibernat)

> [!affirmation] Affirmation
> Si on ne précise pas le `mappedBy` une table de jointure sera créée, voir par exemple [OneToMany relation]({{< relref "one-to-many.md" >}})


On revient brièvement sur l'annotation `@mappedBy` et son utilité.

> The main difference is that bidirectional relationship provides navigational access in both directions, so that you can access the other side without explicit queries. Also it allows you to apply cascading options to both directions. [^1]

[^1]: https://stackoverflow.com/questions/5360795/what-is-the-difference-between-unidirectional-and-bidirectional-jpa-and-hibernat

- Via une relation bidirectionnelle nous aurons access au getter et setter des deux côtés de la relation (du parent -> l'enfant et de l'enfant -> le parent)
- Concernant la gestion du *cascading*
  - Nous pouvons le mettre que d'un seul côté (supprimer un post supprimera tous les commentaires)
  - Et/ou de l'autre côté également (supprimer tous les commentaires supprimera le post)
  
## Explications

Nous souhaitons représenter le fait qu'un `Post` a plusieurs commentaires.

```java
class Post {
    @OneToMany(
        mappedBy = "post",
        cascade = CascadeType.ALL,
    )
    private List<Comment> comments = new ArrayList<>();
}
```

```java
class Comment {
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}
```

### Conséquence du mappedBy
- L'attribut `mappedBy` indique que le côté `@ManyToOne` est responsable de la gestion de la colonne de clé étrangère.
  -  En effet, nous souhaitons que la FK soit bien dans la table `Comment`
  -  Donc en valeur du `mappedBy` nous mettons l'attribut dont nous **ne** souhaitons **pas** qu'il contienne la FK <br><br>

### Conséquence du CascadeType
> [!ressource] Ressources
> - [A beginner’s guide to JPA and Hibernate Cascade Types](https://vladmihalcea.com/a-beginners-guide-to-jpa-and-hibernate-cascade-types/)

- La collection est utilisée uniquement pour récupérer les entités enfants et pour propager les changements d'état de l'entité parente aux enfants.
  - En effet, la suppression d'un `post` doit entraîné la suppressions des commentaires associés
  - MAIS la suppression d'un `comment` ne doit pas entraîné la suppression du post

### Terminologie 

> [!ressource] Ressources
> - [What is the "owning side" in an ORM mapping?](https://stackoverflow.com/a/21068644/9399016)

- Le `inverse side` est le côté qui contient l'attribut `mappedBy` (nous `Post`)
- Le `owning side` est le côté de la relation qui *onws* la clé étrangère (nous `Comment`)

> The `mappedBy` attribute tells that the `@ManyToOne` side is in charge of managing the Foreign Key column, and the collection is used only to fetch the child entities and to cascade parent entity state changes to children (e.g., removing the parent should also remove the child entities).


### Synchroniser les deux côté de la relation

> [!ressource] Ressources
> - [How to synchronize bidirectional entity associations with JPA and Hibernate](https://vladmihalcea.com/jpa-hibernate-synchronize-bidirectional-entity-associations/)

Nous avons déjà évoqué le sujet dans la section dédiée [copie defensive]({{% relref "copie_defensive.md" %}}). 
Même si nous avons défini l’attribut `mappedBy` et que l’association `@ManyToOne` du côté enfant gère la colonne de clé étrangère, nous devons toujours synchroniser les deux côtés de l’association bidirectionnelle. Et l'un des meilleurs moyen est d'ajouter cette méthode dans la classe `Post`.

```java
public void addComment(PostComment comment) {
    comments.add(comment);
    comment.setPost(this);
}

public void removeComment(PostComment comment) {
    comments.remove(comment);
    comment.setPost(null);
}
```

## Exemple complémentaire

Par exemple si dans notre classe `User` nous définissons
```java
@Entity
@Table(name = "T_Users")
public class User {

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Command> commands = new HashSet<>();
```

- `orphanRemoval = true` s'assure que si nous supprimons (en code java) une commande d'un utilisateur, alors la commande sera automatique supprimer en base de données (et pas seulement la colonne Fk passée à `NULL`)
- `cascade = CascadeType.ALL` s'assure que si un utilisateur est supprimé alors toutes ses commandes le seront aussi.

```java
try {
    // Créer un nouvel utilisateur
    User user = new User("john_doe", "password123", 0);
    
    // Créer des commandes et les associer à l'utilisateur
    Command command1 = new Command();
    Command command2 = new Command();
    
    // Ajouter les commandes à l'utilisateur
    user.addCommand(command1);
    user.addCommand(command2);
    
    // Persister l'utilisateur, ce qui persiste également les commandes
    entityManager.persist(user);
    
    // Valider la transaction
    transaction.commit();
} catch (Exception e) {
    ...
} finally {
    // Fermer l'EntityManager
    entityManager.close();
    entityManagerFactory.close();
}
```
