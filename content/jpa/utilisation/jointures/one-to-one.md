+++
title = "@OneToOne"
weight = 10
+++

> [!ressource] Ressources
> - [KooR - Mapping d'une relation @OneToOne](https://koor.fr/Java/TutorialJEE/jee_jpa_one_to_one.wp)

 Une difficulté réside dans le fait, qu'en base de données, il existe trois manière de réaliser une telle association. JPA supporte ces trois manières et vous propose, pour chacune d'entre elles, un mapping adapté. Ces trois possibilités de réalisation d'une relation « One-To-One » seront ainsi nommées :

- Mapping d'une relation @OneToOne sans table d'association.
- Mapping d'une relation @OneToOne avec attribut inverse.
- Mapping d'une relation @OneToOne avec table d'association.

## Sans table d'association
Voici un exemple d'implémentation d'une relation` @OneToOne` sans table d'association, avec deux entités : `Personne` et `Passeport`. L'idée est qu'une personne possède un passeport, et cette relation est directement mappée sans passer par une table intermédiaire.

```java
@Entity
public class Personne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @OneToOne(cascade = CascadeType.ALL)  // La relation est unidirectionnelle et utilise un cascade
    @JoinColumn(name = "passeport_id")    // Définit la clé étrangère dans la table 'personne'
    private Passeport passeport;

    // Getter, Setter
```

```java
@Entity
public class Passeport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    private Personne personne;
```

- Relation `@OneToOne` :
    - Dans l'entité Personne, l'annotation @OneToOne indique qu'une personne a un seul passeport.
    L'annotation @JoinColumn(name = "passeport_id") est utilisée pour créer une clé étrangère dans la table personne pointant vers la table passeport.

- Cascade
    - Le type de cascade `CascadeType.ALL` est utilisé ici pour propager toutes les opérations (persist, remove, etc.) de l'entité Personne à l'entité Passeport.


## Avec attribut inversé

Nous allons repartir de l'exemple précédent et nous allons permettre, à partir de la classe `Passport` de retrouver l'instance de la classe `Personne` associée. Comme en base de données, la clé de référence est dans la table opposée, on doit dire quelle est la propriété de la classe `Personne` qui défini l'association (dans notre cas, la propriété `passport`).

```java
@Entity
public class Personne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @OneToOne(cascade = CascadeType.ALL)  // La relation est unidirectionnelle et utilise un cascade
    @JoinColumn(name = "passeport_id")    // Définit la clé étrangère dans la table 'personne'
    private Passeport passeport;

    // Getter, Setter
```

```java
@Entity
public class Passeport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    @OneToOne( mappedBy = "passport" )
    private Personne personne;
```

Grâce à ce mécanisme, nous sommes capable de retrouver une personne via son passport

```java
EntityManagerFactory entityManagerFactory = null;
EntityManager entityManager = null;
try {
    entityManagerFactory = Persistence.createEntityManagerFactory("persistence-unit");
    entityManager = entityManagerFactory.createEntityManager();

    Passport passport = entityManager.find( Passport.class, 1 );
    Personne personne = passport.getPersonne();
    System.out.println( personne );

} finally {
    if ( entityManager != null ) entityManager.close();
    if ( entityManagerFactory != null ) entityManagerFactory.close();
}
```

- Sans le l'utilisation du `mappedBy` vous n'aurez qu'une relation unidirectionnel, c'est-à-dire que seule l'entité `Personne` a connaissance de l'existence de la relation avec `Passeport` (et non l'inverse).
- L'utilisation du `mappedBy` permet d'avoir une relation bidirectionnelle.

## Avec table d'association
 Pour rappel, le terme de table d'association est aussi parfois appelé table de jointure. Il s'agit d'une table en base de données permettant d'associer deux enregistrements situés dans deux autres tables de la base de données en utilisant des *foreign keys*.

 ```java
 @Entity
public class Personne {
    ...
    @OneToOne
    @JoinTable(name = "personne_passeport", // Table d'association
               joinColumns = @JoinColumn(name = "personne_id"),  // Clé étrangère pour Personne
               inverseJoinColumns = @JoinColumn(name = "passeport_id"))  // Clé étrangère pour Passeport
    private Passeport passeport;
 ```

 La table d'association ne peut être définie que du côté propriétaire de la relation. Donc dans `Passport` nous utilisons `mappedBy`

 ```java
 @Entity
public class Passeport {
    ...

    @OneToOne(mappedBy = "passeport")  // Relation bidirectionnelle, gestion de la relation faite par Personne
    private Personne personne;
 ```
