+++
title = "@ElementCollection et @CollectionTable"
weight = 70
+++

> [!ressource] Ressources
> - [De String à collection : comment une évolution métier m’a fait découvrir @ElementCollection](https://blog.takima.fr/de-string-a-collection-comment-une-evolution-metier-ma-fait-decouvrir-elementcollection/) 
> - [How to optimize unidirectional collections with JPA and Hibernate](https://vladmihalcea.com/how-to-optimize-unidirectional-collections-with-jpa-and-hibernate/)
> - [Difference between @OneToMany and @ElementCollection?](https://stackoverflow.com/questions/8969059/difference-between-onetomany-and-elementcollection)


En base de données, une colonne ne peut contenir qu'une seule valeur. Pour stocker plusieurs valeurs rattachées à une entité (les surnoms d'un animal, les tags d'un article, les numéros de téléphone d'un client), il faut donc une tab
le séparée. `@ElementCollection` permet de créer cette table sans avoir à écrire une entité pour elle.

## Exemple

Reprenons une entité `Pet` à laquelle nous voulons associer plusieurs surnoms.

```java
@Entity
public class Pet {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ElementCollection
    @CollectionTable(
        name = "pet_nickname",                      // nom de la table créée
        joinColumns = @JoinColumn(name = "pet_id")  // clé étrangère vers Pet
    )
    @Column(name = "nickname")                      // nom de la colonne des valeurs
    private List<String> nicknames = new ArrayList<>();
}
```

- `@ElementCollection` indique que le champ **est une collection de valeurs (et non d'entités).**
- `@CollectionTable` décrit la table qui stocke ces valeurs (facultatif : sans elle, Hibernate génère un nom par défaut `pet_nicknames`).
- `@Column` nomme la colonne qui contient la valeur.

Cela donne le schéma suivant

```sql
CREATE TABLE pet (
    id   BIGINT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE pet_nickname (
    -- pas de PK ici
    pet_id   BIGINT REFERENCES pet(id),
    nickname VARCHAR(255)
);
```

L'utilisation est celle d'une simple liste Java

```java
Pet pet = new Pet("Buddy");
pet.getNicknames().add("Bud");
pet.getNicknames().add("Doudou");

em.persist(pet);    // les surnoms sont insérés automatiquement
```

Il n'y a pas besoin de `cascade` : les éléments appartiennent entièrement à l'entité propriétaire. Ils sont insérés, mis à jour et supprimés avec elle, et ils n'ont pas d'identité propre — on ne peut pas les charger indépendamment de
 `Pet`.

## Avec un objet embarqué

La collection peut aussi contenir des `@Embeddable` lorsqu'une valeur simple ne suffit pas.

```java
@Embeddable
public class Address {
    private String street;
    private String city;
}

@Entity
public class Owner {
    ...

    @ElementCollection
    @CollectionTable(name = "owner_address", joinColumns = @JoinColumn(name = "owner_id"))
    private List<Address> addresses = new ArrayList<>();
}
```

Chaque champ de `Address` devient une colonne de la table `owner_address`.

## Quand l'utiliser ?

| Besoin | Choix |
| --- | --- |
| Valeurs sans identité, toujours lues avec le parent | `@ElementCollection` |
| Objets manipulables seuls, référencés ailleurs, avec leur propre id | `@OneToMany` |


## Performance

> Compared to an inverse one-to-many association, the ElementCollection is more difficult to optimize. If the collection is frequently updated then a collection of elements is better substituted by a one-to-many association. Element collections are more suitable for data that seldom changes, when we don’t want to add an extra Entity just for representing the foreign key side. [^1]

Le problème vient du fait que la table de collection n'a pas de clé primaire : Hibernate ne sait pas cibler une ligne précise. Dès qu'on ajoute ou retire un élément d'une `List`, il supprime **toutes** les lignes du parent puis réinsère la collection entière.

> By default, any collection operation ends up recreating the whole data set. This behavior is only acceptable for an in-memory collection and it’s not suitable from a database perspective. The database has to delete all existing rows, only to re-add them afterward. The more indexes we have on this table, the greater the performance penalty. [^1]

Pour éviter ça, deux solutions :

- utiliser un `Set` plutôt qu'une `List` : la ligne entière sert de clé, Hibernate peut faire un `DELETE` ciblé ;
- ajouter `@OrderColumn` si l'ordre compte : une colonne d'index est créée et sert de clé, seules les lignes à partir de la position modifiée sont retouchées.

```java
@ElementCollection
@CollectionTable(name = "pet_nickname", joinColumns = @JoinColumn(name = "pet_id"))
@Column(name = "nickname")
private Set<String> nicknames = new HashSet<>();
```



[^1]: [How to optimize unidirectional collections with JPA and Hibernate](https://vladmihalcea.com/how-to-optimize-unidirectional-collections-with-jpa-and-hibernate/)