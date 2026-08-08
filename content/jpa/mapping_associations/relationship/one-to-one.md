+++
title = "@OneToOne"
weight = 30
+++

> [!ressource] Ressources
> - [KooR - Mapping d'une relation @OneToOne](https://koor.fr/Java/TutorialJEE/jee_jpa_one_to_one.wp)
> - [The best way to map a @OneToOne relationship with JPA and Hibernate](https://vladmihalcea.com/the-best-way-to-map-a-onetoone-relationship-with-jpa-and-hibernate/)

![](https://youtu.be/GRV69QNSdVg)

Cette relation consiste à assurer la correspondance entre deux entités de manière exclusive, où chaque instance d'une entité est directement liée à une unique instance de l'autre entité.
- Une personne à un unique passeport
- Un passeport appartient à une seule personne

Plusieurs solutions permettent de résoudre ce problème, l'étude sémitique de chaque d'entre elle nous permettra :
- de comprendre les compromis à faire
- comprendre l'utilité de la propriété `mappedBy`
- et finalement l'utilisation du `CASCADE`

## x1 OneToOne = Unidirectionnelle
Premièrement nous pouvons écrire le bout de code permettant d'avoir une relation unidirectionnelle entres nos deux classes. 

```java
@Entity
public class Personne {
    @OneToOne 
    private Passeport passeport;
}
```

Voilà. 

Maintenant si on souhaite aller plus loin et pouvoir naviguer dans les deux directions plusieurs options s'offrent à nous 
- avoir deux relations unidirectionnelles
- ou avoir une relation bidirectionnelle 

### Code non executable
Avant de rentrer les des solutions pour naviguer dans les deux sens, une petit aparté. On pourra penser qu'écrire le code suivant serait suffisant :
- préciser la relation `@OneToOne` uniquement dans la classe `Personne`

```java
@Entity
public class Personne {
    @OneToOne private Passeport passeport;
}

@Entity
public class Passeport {
    private Person person; // aucune annotation
}
```

Néanmoins ce code conduit à l'exception `JdbcTypeRecommendationException`, en effet :
- `Password` est annoté de `@Entity`
- et fait référence à `Personne` aussi une entité et sans annotation JPA pour définir le type de la relation

Alors on pourrait tout simplement ne pas préciser l'attribut `Person person` dans la classe `Passeport` mais dans ce cas nous n'aurons pas de relation bidirectionnelle entre les deux classes. 


## x2 OneToOne = x2 unidirectionnelles
Ainsi si nous souhaitons conserver la navigation dans les deux sens nous devons conserver l'attribut. Une solution consiste d'y rajouter l'annotation `@OneToOne` également

```java
@Entity
public class Personne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @OneToOne
    private Passeport passeport;
}
```

```java
@Entity
public class Passeport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    @OneToOne
    private Personne personne;
}
```

### Résultat
En précisant deux fois l'annotation `OneToOne` nous avons avons deux Fk (une dans chaque table). 
- On parle de **deux relations unidirectionnelles et non d'une relation bidirectionnelle**

```
Personne
| id  | nom      | passeport_id |
| --- | -------- | ------------ |
| 1   | John Doe | 101          |

Passeport
| id  | numero    | personne_id |
| --- | --------- | ----------- |
| 101 | A12345678 | 1           |
```

Mais dans la plupart des cas, nous n'avons pas besoin de clés étrangères dans les deux tables pour une relation univoque.

## OneToOne + MappedBy = bidirectionnelle
Notre objectif est donc d'avoir la représentation suivante

```
| id  | nom      |
| --- | -------- |
| 1   | John Doe |


| id  | numero    | personne_id |
| --- | --------- | ----------- |
| 101 | A12345678 | 1           |
```

Pour ce faire, nous devons utiliser la propriété `mappedBy`, il permet d'indiquer :
- Le *inverse side* de la relation, c'est-à-dire le côté qui contient l’attribut mappedBy (nous `Personne`)
- Le *owning side* de la relation, c'est-à-dire le côté de la relation qui onws la clé étrangère (nous `Password`)

> La valeur à donner à mappedBy est le côté inverse de la relation, celui qui **ne** contient **pas** la FK

```java
/* (Inverse Side) */
@Entity
public class Personne {
    @OneToOne(mappedBy = "personne")  // Inverse side, la FK n'est pas dans Personne
    private Passeport passeport;
}
```

```java
/* (Owning Side) */
@Entity
public class Passeport {
    @OneToOne // Foreign key will be here
    // @JoinColumn(name = "fk_personne_id) nom de colonne explicite
    private Personne personne;
}
```

### Résultat
Nous obtenons bien de résultat souhaité

```
| id  | nom      |
| --- | -------- |
| 1   | John Doe |

| id  | numero    | personne_id |
| --- | --------- | ----------- |
| 101 | A12345678 | 1           |
```

### Code 
Ci-dessous le code pour arriver à ce résultat

```java
entityManager.getTransaction().begin();

Passeport passeport = new Passeport();
passeport.setNumero("A12345678");

// Create Personne entity and associate it with the Passeport
Personne personne = new Person();
personne.setNom("John Doe");
personne.setPasseport(passeport);

// Persist both entities
entityManager.persist(passeport);
entityManager.persist(personne);

entityManager.getTransaction().commit();
```

Nous remarquons que avons du persister nos deux entités.

```java
entityManager.persist(passeport);
entityManager.persist(personne);
```

Il serait intéressant de persister automatiquement l'entité `Passeport` lorsqu'on persiste l'entité `Personne`

### OneToOne + MappedBy + Cascade
Ainsi la dernière amélioration consiste à rajouter la propriété `CASCADE`

```java
@Entity
public class Personne {
    @OneToOne(mappedBy = "personne", cascade = CascadeType.ALL)
    private Passeport passeport;
}
```
```java
@Entity // aucun changement pour Passeport
public class Passeport {
    @OneToOne
    private Personne personne;
}
```

En persistant uniquement la `personne`, le `passeport` s'est automatiquement vu persisté également

```java
entityManager.getTransaction().begin();

// Crée un passeport
Passeport passeport = new Passeport();
passeport.setNumero("A12345678");

// Crée une personne et associe le passeport
Personne personne = new Personne();
personne.setNom("John Doe");
personne.setPasseport(passeport); // Cascade permettra de persister le passeport

// Persiste uniquement la personne (le passeport sera persisté automatiquement)
entityManager.persist(personne);

entityManager.getTransaction().commit();
```