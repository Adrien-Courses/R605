+++
title = "@OneToMany"
weight = 11
+++

> [!ressource] Ressources
> - [The best way to map a @OneToMany relationship with JPA and Hibernate](https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/)

## Relation unidirectionnelle
Nous souhaitons représenter la relation un utilisateur peut avoir plusieurs commandes. C’est la classe Commande qui tiendra l’association, en effet, si nous représentons la structure relationnelle SQL nous avons
- une classe `Utilisateur` qui contient contient une collection de `commandes`
- une classe `Commande`

```java
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToMany(
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Commande> commandes = new ArrayList<>();
```

```java
@Entity
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
```

Mais si nous exécutons le code suivant, nous n'aurons pas uniquement que deux tables (dont `t_commande` avec la FK) mais 3 tables :
- `t_utilisateur`
- `t_commande`
- `t_utilisateur_commande`


{{< mermaid align="center" zoom="true" >}}
erDiagram
    T_UTILISATEUR {
        Long id PK
    }

    T_COMMANDE {
        Long id PK
    }

    T_UTILISATEUR_COMMANDE {
        Long utilisateur_id FK
        Long commande_id FK
    }

    T_UTILISATEUR ||--o{ T_UTILISATEUR_COMMANDE : "" 
    T_COMMANDE ||--o{ T_UTILISATEUR_COMMANDE : ""
{{< /mermaid >}}


## Relation unidirectionnelle deux tables
Pour résoudre le problème de la table de jointure supplémentaire , il suffit d'ajouter la colonne `@JoinColumn`. L'annotation aide Hibernate à comprendre qu'il existe une colonne de clé étrangère `fk_utilisateur_id` dans la table `t_commande` qui définit cette association.

```java
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name ="fk_utilisateur_id")
    private List<Commande> commandes = new ArrayList<>();
}
```

{{< mermaid align="center" zoom="true" >}}
erDiagram
    T_UTILISATEUR {
        Long id PK
    }

    T_COMMANDE {
        Long id PK
        Long fk_utilisateur_id FK
    }

    T_UTILISATEUR ||--o{ T_COMMANDE : "a"
{{< /mermaid >}}

### Performance
L'article cité en ressource (un MUST READ), nous montre qu'en appliquant uniquement cette stratégie nous nous exposons à un problème de performance. 

Par exemple, si on souhaite insérer une nouvelle commande à un utilisateur. En Java nous réalisons le code suivant
```java
Utilisateur utilisateur = new Utilisateur("Adrien");
utilisateur.setCommandes().add(new Commande("Premier Commentaire"));
utilisateur.setCommandes().add(new Commande("Second Commentaire"));
```

Les instructions SQL seront jouées

```sql
insert into utilisateur (nom, id)
values ('Adrien', 1)

-- Création des commentaires
insert into commentaire (desc, id)
values ('Premier Commentaire', 1)

insert into commentaire (desc, id)
values ('Second Commentaire', 2)

-- Mise à jour des commentaire pour rajouter une valeur dans fk_utilisateur_id
update commentaire set fk_utilisateur_id = 1 where id = 1
update commentaire set fk_utilisateur_id = 1 where id = 2
```

Nous remarquons que l'insertion d'un commentaire ce fait en deux étapes.

## Relation bidirectionnelle
La meilleure façon de mapper une association `@OneToMany` est de s'appuyer sur le côté `@ManyToOne` pour propager tous les changements d'état de l'entité

```java
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(
        mappedBy = "utilisateur",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Commande> commandes = new ArrayList<>();
    
    /**
     * Ajoute une commande à l'utilisateur et synchronise l'association bidirectionnelle.
     */
    public void addCommande(Commande commande) {
        commandes.add(commande);
        commande.setUtilisateur(this);
    }

    /**
     * Retire une commande de l'utilisateur et synchronise l'association bidirectionnelle.
     */
    public void removeCommande(Commande commande) {
        commandes.remove(commande);
        commande.setUtilisateur(null);
    }
```

```java
@Entity
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // par defaut EAGER => moins performant
    @JoinColumn(name = "fk_utilisateur_id") // Optionnel : préciser le nom de la colonne
    private Utilisateur utilisateur;
}
```

Dans cette dernière solution nous pouvons noter plusieurs choses :
- l'utilisation du `mappedBy`, qui nous permet de dire qui est le *owner* de la FK (ici `Commande`)
  - voir [MappedBy]({{% relref "mappedBy.md" %}})
- pour assurer la synchronisation bidirectionnelle nous avons ajouté les méthodes `addCommande` et `removeCommande`
  - voir [Copie défensive]({{% relref "copie_defensive.md" %}})

### Performance
Cette fois-ci nous n'avons pas deux étapes pour créer une nouvelle commande

```sql
insert into utilisateur (nom, id)
values ('Adrien', 1)

-- Insertion directement avec la fk_utilisateur_id
insert into commentaire (fk_utilisateur_id, desc, id)
values (1, 'Premier Commentaire', 1)

insert into commentaire (fk_utilisateur_id, desc, id)
values (1, 'Second Commentaire', 2)
```
