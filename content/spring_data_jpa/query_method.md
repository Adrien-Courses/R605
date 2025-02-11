+++
title = "Derived Query Methods"
weight = 30
+++

> [!ressource] Ressources
> - https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html
> - https://thorben-janssen.com/ultimate-guide-derived-queries-with-spring-data-jpa/

Spring Data JPA agit comme une couche au-dessus de JPA et vous offre deux façons de définir votre requête :
- Vous pouvez laisser Spring Data JPA dériver la requête à partir du nom d'une méthode.
- Vous pouvez définir votre propre requête JPQL ou native en utilisant une annotation `@Query`

## Depuis une méthode
Supposons une classe `Produit` qui dispose du champs `nom` et puis nous définissons la méthode suivante

```java
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByNom(String nom);
}
```

Spring Data JPA implémente automatiquement cette méthode sans aucune écriture SQL manuelle en

```sql
SELECT * FROM produit WHERE nom = :nom
```

### Respecter les conventions
Nous devons juste prêter garde à respecter les conventions définies par Spring Data JPA, disponible [ici](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query-methods.query-creation)

| Keyword           | SQL Equivalent | Exemple                        | SQL      Généré                  |
| ----------------- | -------------- | ------------------------------ | -------------------------------- |
| **`And`**         | `AND`          | `findByNomAndPrix`             | `WHERE nom = ? AND prix = ?`     |
| **`Or`**          | `OR`           | `findByNomOrCategorie`         | `WHERE nom = ? OR categorie = ?` |
| **`Between`**     | `BETWEEN`      | `findByPrixBetween`            | `WHERE prix BETWEEN ? AND ?`     |
| **`LessThan`**    | `<`            | `findByPrixLessThan`           | `WHERE prix < ?`                 |
| **`GreaterThan`** | `>`            | `findByPrixGreaterThan`        | `WHERE prix > ?`                 |
| **`Like`**        | `LIKE`         | `findByNomLike`                | `WHERE nom LIKE ?`               |
| **`NotLike`**     | `NOT LIKE`     | `findByNomNotLike`             | `WHERE nom NOT LIKE ?`           |
| **`IsNull`**      | `IS NULL`      | `findByDescriptionIsNull`      | `WHERE description IS NULL`      |
| **`IsNotNull`**   | `IS NOT NULL`  | `findByDescriptionIsNotNull`   | `WHERE description IS NOT NULL`  |
| **`OrderBy`**     | `ORDER BY`     | `findByCategorieOrderByNomAsc` | `ORDER BY nom ASC`               |

## Depuis @Query
```java
public interface UserRepository extends JpaRepository<User, Long> {

  @Query("select u from User u where u.emailAddress = ?1")
  User findByEmailAddress(String emailAddress);
}
```

### Utilisation du LIKE
```java
public interface UserRepository extends JpaRepository<User, Long> {

  @Query("select u from User u where u.firstname like %?1")
  List<User> findByFirstnameEndsWith(String firstname);
}
```