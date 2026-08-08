+++
title = "@ManyToOne"
weight = 10
+++

> [!ressource]
> - [ManyToOne JPA and Hibernate association best practices](https://vladmihalcea.com/manytoone-jpa-hibernate/)

## @ManyToOne unidirectionnelle 

![manytoone](manytoone.png)

Au lieu de mapper la colonne de clé étrangère `post_id`, `PostComment` utilise une relation `@ManyToOne`
avec l'entité parent `Post`. `PostComment` peut être associé à une référence d'objet `Post` existante,
et `PostComment` peut également être récupéré avec l'entité `Post`.

```java
public class PostComment {
    private Integer post_id; // ❌ préférer faire une référence
}
```

```java
public class PostComment {
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}
```

### Code SQL généré

Si l'attribut `@ManyToOne` est défini sur une référence d'entité Post valide, alors Hibernate génère une instruction `INSERT` qui remplit la colonne `post_id` avec l'identifiant de l'entité Post associée.

```java
Post post = entityManager.find(Post.class, 1L);
PostComment comment = new PostComment("My review");
comment.setPost(post);
entityManager.persist(comment);
```

Donnera l'instruction SQL

```sql
INSERT INTO post_comment (post_id, review, id) VALUES (1, 'My review', 2)
```

Si plus tard, si l'attribut `Post` de `PostComment` est défini à `null`, nous obtiendrons

```java
comment.setPost(null);
```

Un update avec un `SET = NULL`

```sql
UPDATE post_comment SET post_id = NULL, review = 'My review' WHERE id = 2
```

## @ManyToOne bidirectionnelle  

Voir la section sur le `@OneToMany`


<!---

Supposons que nous avons un Order et un OrderLine. 
- Nous pouvons choisir d’avoir une relation unidirectionnelle `OneToMany` entre Order et OrderLine (Order contiendrait une collection de OrderLines). 
- Ou bien, nous pouvons opter pour une association `ManyToOne` entre OrderLine et Order (OrderLine contiendrait une référence à son Order). 
- Enfin, nous pouvons choisir d’avoir les deux, auquel cas l’association devient une relation bidirectionnelle `OneToMany/ManyToOne`.

Au final nous retombons sur le même sujet que la section précédent.



























--->















<!--- 
> [!ressource] Ressources
> - [KooR - Mapping d'une relation @ManyToOne](https://koor.fr/Java/TutorialJEE/jee_jpa_many_to_one.wp)

Attention : en base de données, vous avez deux manières de représenter une relation de type « Many-to-One ».
- Mapping d'une relation @ManyToOne sans table d'association : dans ce cas, la clé de jointure, permettant la mise en relation, sera portée par la table associée à la classe.
    - également le cas de la relation bidirectionnelle 
- Mapping d'une relation @ManyToOne avec table d'association : dans ce cas, une troisième table (non associée à une entité JPA) servira à stocker les paires de clés de mise en relations.

## Sans table d'association
Nous souhaitons représenter la relation un utilisateur peut avoir plusieurs commandes. C'est la classe `Commande` qui tiendra l'association, en effet, si nous représentons la structure relationnelle SQL nous avons
```sql
CREATE TABLE T_Users (
    idUser              int         PRIMARY KEY AUTO_INCREMENT,
    login               varchar(20) NOT NULL,
    password            varchar(20) NOT NULL,
    connectionNumber    int         NOT NULL DEFAULT 0
);

CREATE TABLE T_Commands (
    idCommand       int         PRIMARY KEY AUTO_INCREMENT,
    idUser          int         NOT NULL REFERENCES T_Users(IdUser),
    commandDate     datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

```java
@Entity
@Table(name = "T_Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idUser;

    private String login;

    private String password;

    private int connectionNumber;
```

```java

@Entity
@Table(name = "T_Commands")
public class Command {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idCommand;

    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User user;
```

Si vous le souhaitez, il est possible de cascader certaines actions initiées sur une instance de la classe Command à l'instance de type User qui lui est associée. Les actions pouvant être cascadées sont : `DETACH`, `MERGE`, `PERSIST` `REFRESH` et `REMOVE`. Par exemple, si l'on cascade le `REMOVE`, une suppression d'une instance de commande entraînera une suppression automatiquement de l'utilisateur associée. Nous reviendrons sur ces possibilités ultérieurement. En utilisant la constante CascadeType.ALL on demande à cascader toutes ces actions. 

```java
@Entity 
@Table(name = "T_Commands")
public class Command {

    @ManyToOne( cascade = CascadeType.ALL )
    @JoinColumn( name="idUser" )
    private User user;            
}
```

Et,  il est aussi possible d'imposer la présence d'une instance de type User pour chaque commande en fixant l'attribut nullable à false sur l'annotation @JoinColumn : `@JoinColumn( name="idUser", nullable=false )`

## Relation bidirectionnelle  
```java
@Entity
@Table(name = "T_Users")
public class User {
    ...

    // Bidirectional relationship
    @OneToMany(mappedBy = "user")
    private Set<Command> commands;
```

Et la classe `Commande` reste inchangée

## Avec table d'association
Nous aurons une table de jointure permettant de faire l'association
```sql
CREATE TABLE T_Commands_Users_Associations (
    IdCommand   int   NOT NULL REFERENCES T_Commands(IdCommand),
    IdUser      int   NOT NULL UNIQUE REFERENCES T_Users(IdUser)
);
```

```java
@Entity
@Table(name = "T_Commands")
public class Command {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idCommand;

    @ManyToOne
    @JoinTable(
        name = "T_Commands_Users_Associations",
        joinColumns = @JoinColumn(name = "idCommand"),
        inverseJoinColumns = @JoinColumn(name = "idUser")
    )
    private User user;
}
```

```java
@Entity
@Table(name = "T_Users")
public class User {
    ...

    // Bidirectional relationship with Command
    @OneToMany(mappedBy = "user")
    private Set<Command> commands = new HashSet<>();
```

-->