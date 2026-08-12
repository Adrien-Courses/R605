+++
title = "Stratégie SINGLE_TABLE"
description = "La stratégie SINGLE_TABLE stocke toute la hiérarchie dans une seule table avec une colonne discriminante : la plus rapide, mais au prix des colonnes nullables."
weight = 20
+++

> [!ressource] Ressource
> - [ 08 - 04 - Mapper une hiérarchie de classes en mode SINGLE_TABLE](https://youtu.be/swXo45QrYWo?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

C'est la stratégie **par défaut** : si aucune annotation `@Inheritance` n'est présente, c'est celle-ci qui s'applique.

Toute la hiérarchie est stockée dans une **seule table**, qui contient la réunion des colonnes de toutes les classes.

```
user : ID | DTYPE | NAME | SALARY
```

- pour une instance de `User`, seules les deux premières colonnes sont renseignées ;
- pour une instance de `Employee`, les trois le sont.

## Le mapping

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
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

## La colonne discriminante

Une table unique pose immédiatement une question : la ligne d'identifiant 1 correspond-elle à un `User` ou à un `Employee` ?

```java
em.find(User.class, 1);   // que doit renvoyer Hibernate ?
```

La réponse passe par une **colonne technique**, le *discriminant*, renseignée à l'insertion et lue au chargement pour instancier la bonne classe. Par défaut elle s'appelle `DTYPE` et contient le nom de l'entité.

| ID | DTYPE | NAME | SALARY |
| --- | --- | --- | --- |
| 1 | User | Alice | *NULL* |
| 2 | Employee | Bob | 45000 |

Elle se personnalise avec `@DiscriminatorColumn` sur la classe mère et `@DiscriminatorValue` sur chaque classe fille.

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("USR")
public class User { ... }

@Entity
@DiscriminatorValue("EMP")
public class Employee extends User { ... }
```

Hibernate ajoute alors automatiquement la condition au chargement.

```sql
SELECT * FROM user WHERE id = 2 AND user_type = 'EMP';
```

## Les opérations CRUD

- `em.persist(employee)` : une seule table, donc **un seul `INSERT`** ;
- `em.find(User.class, 1)` : un seul `SELECT`, sans jointure. C'est la stratégie la plus rapide en lecture ;
- `employee.setSalary(10000)` : un seul `UPDATE` ;
- `em.remove(employee)` : un seul `DELETE`.

Les requêtes polymorphiques sont également immédiates.

```sql
-- select u from User u
SELECT * FROM user;
```

## La pagination

C'est le cas idéal. Une seule table, donc `LIMIT`/`OFFSET` s'applique directement, et un index sur la colonne de tri est pleinement exploité.

```sql
SELECT * FROM user ORDER BY name LIMIT 20 OFFSET 0;
```

La base s'arrête dès qu'elle a 20 lignes, sans rien lire de plus. Le discriminant ajoute simplement un `WHERE dtype = 'EMP'` si l'on pagine sur une sous-classe.

## La contrainte majeure : les colonnes nullables

C'est le défaut structurel de cette stratégie. Les colonnes des classes filles doivent pouvoir être `NULL`, puisqu'elles ne sont renseignées que pour certaines lignes.

```java
@Entity
public class Employee extends User {

    @Column(nullable = false)   // 🔴 ignoré : les lignes User auront salary à NULL
    private int salary;
}
```

En choisissant `SINGLE_TABLE`, on renonce donc aux contraintes `NOT NULL` sur tout ce qui n'appartient pas à la classe racine. **L'intégrité doit être portée par le code applicatif**, plus par la base.

Deux conséquences secondaires

- la table s'élargit à chaque sous-classe ajoutée, et devient creuse si la hiérarchie est profonde ;
- avec beaucoup de colonnes majoritairement vides, l'espace disque et le cache sont utilisés inefficacement.

## Quand l'utiliser

C'est le choix par défaut raisonnable quand

- les classes filles ajoutent **peu d'attributs** ;
- la hiérarchie est **stable et peu profonde** ;
- les lectures, en particulier polymorphiques, sont fréquentes.

À l'inverse, si chaque sous-classe apporte de nombreux champs obligatoires, la stratégie [JOINED]({{< relref "joined" >}}) préserve l'intégrité des données.
