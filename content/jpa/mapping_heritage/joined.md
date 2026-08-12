+++
title = "Stratégie JOINED"
description = "La stratégie JOINED donne une table par classe reliée par une clé primaire partagée : le modèle relationnel le plus propre, au prix de jointures."
weight = 30
+++

> [!ressource] Ressource
> - [ 08 - 05 - Mapper une hiérarchie de classes en mode JOINED ](https://youtu.be/M9UOBnCLalI?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Chaque classe de la hiérarchie possède **sa propre table**, qui ne contient que ses attributs propres. Une entité fille est alors en relation **1:1** avec son parent : un `Employee` ne peut pas exister sans le `User` correspondant.

```
user     : ID | NAME
employee : ID | SALARY
```

Le point clé est que **l'ID est partagé** : pour un employé donné, la ligne dans `user` et la ligne dans `employee` portent le même identifiant. La clé primaire de `employee` est aussi une clé étrangère vers `user`.

## Le mapping

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @GeneratedValue
    private int id;

    private String name;
}

@Entity
public class Employee extends User {

    private int salary;
}
```

Le schéma généré

```sql
CREATE TABLE user (
    id   INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE employee (
    id     INT PRIMARY KEY REFERENCES user(id),   -- PK et FK à la fois
    salary INT NOT NULL                            -- ✅ la contrainte est possible
);
```

Le nom de la colonne de jointure se personnalise avec `@PrimaryKeyJoinColumn`.

```java
@Entity
@PrimaryKeyJoinColumn(name = "user_id")
public class Employee extends User { ... }
```

## Les opérations CRUD

C'est ici que se paie le coût de la stratégie : les données d'une même instance sont réparties sur plusieurs tables.

- `em.persist(employee)` : **deux `INSERT`**, un dans `user` puis un dans `employee` ;

  ```sql
  INSERT INTO user (id, name) VALUES (2, 'Bob');
  INSERT INTO employee (id, salary) VALUES (2, 45000);
  ```

- `em.find(Employee.class, 2)` : une **jointure** entre les deux tables ;

  ```sql
  SELECT u.*, e.* FROM user u JOIN employee e ON u.id = e.id WHERE u.id = 2;
  ```

- `employee.setSalary(10000)` : un seul `UPDATE`, car `salary` appartient à une table précise ;
- `em.remove(employee)` : **deux `DELETE`**, dans l'ordre inverse de l'insertion.

## Le coût des requêtes polymorphiques

C'est le vrai point de vigilance. Une requête sur la classe racine doit interroger **toutes** les tables de la hiérarchie.

```java
em.createQuery("select u from User u", User.class);
```

```sql
SELECT u.*, e.*, m.*
FROM user u
LEFT JOIN employee e ON u.id = e.id
LEFT JOIN manager  m ON u.id = m.id;
```

Avec une hiérarchie profonde, le nombre de `LEFT JOIN` croît avec le nombre de sous-classes, et la requête se dégrade rapidement. C'est l'inverse exact de [SINGLE_TABLE]({{< relref "single_table" >}}), où cette requête est un simple `SELECT`.

## La pagination

Elle fonctionne correctement. Les `LEFT JOIN` étant en 1:1, ils **ne multiplient pas les lignes** : une entité correspond toujours à une ligne du résultat. Hibernate applique donc `LIMIT`/`OFFSET` en SQL, et c'est la table racine qui pilote la requête.

```sql
SELECT u.*, e.*
FROM user u
LEFT JOIN employee e ON u.id = e.id
ORDER BY u.name
LIMIT 20 OFFSET 0;
```

Un index sur `user.name` reste utilisable pour le tri. Le surcoût se limite aux jointures sur les lignes effectivement retournées, ce qui reste modéré.

## L'avantage décisif : l'intégrité

Contrairement à `SINGLE_TABLE`, chaque colonne n'existe que pour les lignes qui la concernent. Les contraintes `NOT NULL` redeviennent donc possibles.

```java
@Entity
public class Employee extends User {

    @Column(nullable = false)   // ✅ respecté, aucune ligne user ne pollue la table employee
    private int salary;
}
```

Le modèle relationnel obtenu est **normalisé** : aucune colonne creuse, aucune donnée dupliquée. C'est celui qu'un DBA écrirait à la main.

## Quand l'utiliser

- quand les classes filles ont **beaucoup d'attributs propres**, dont certains obligatoires ;
- quand l'intégrité doit être garantie **par la base** et non par l'application ;
- quand la hiérarchie est amenée à s'enrichir : ajouter une sous-classe crée une table, sans impacter les existantes.

À éviter si les requêtes polymorphiques sur la classe racine sont fréquentes et critiques en performance.
