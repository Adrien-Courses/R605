+++
title = "@ManyToOne"
weight = 20
+++

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
