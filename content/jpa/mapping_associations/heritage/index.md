+++
title = "Héritage"
weight = 70
+++

> [!ressource] Ressource
> https://gayerie.dev/epsi-b3-orm/javaee_orm/jpa_inheritance.html

En OO il est naturel d'avoir des classes qui héritent les unes des autres, tandis qu'en base de données relationnelle une table ne va pas hériter d'une autre table; Problème d'[Impedance mismatch]({{< relref "/jpa/mapping/impedancemismatch" >}})

## Héritage d'entité
```java
@Entity
public class User {
    @Id
    private int id
    private String name;
}

@Entity
public class Employee extends User {
    // Pas besoin de id, elle est hérité
    private int salary
}
```

## 3 stratégies de mapping
- Héritage avec une table par classe `TABLE_PER_CLASS`
```
Employee : ID | Name | Salary
User :     ID | Name
```

- Héritage avec une seule table `SINGLE_TABLE`
```
User : ID | Name | Salary
```

- Héritage avec  jointure (relation 1:1 une *employee* depend d'un *user* pour existé) `JOINED`
  - L'ID dans User et Employee seront les mêmes pour un employee
```
User :     ID | Name
Employee : ID | Salary
```


### Stratégie TABLE_PER_CLASS
> [!ressource] Ressource
> [ 08 - 03 - Mapper une hiérarchie de classes en mode TABLE_PER_CLASS ](https://youtu.be/mb6tEK3C5_o?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Pour les opérations CRUD aucun problème :

- `em.persist(...)` suivant le type enregistrera dans la bonne table
- `em.find(User.class, 1)` suivant la valeur du premier paramètre SELECT dans la bonne table
- `user.setName(...)` de même aucun problème, le type de l'objet est précis
- `em.remove(user)` on connaît également le type

### Stratégie SINGLE_TABLE
> [!ressource]
> [ 08 - 04 - Mapper une hiérarchie de classes en mode SINGLE_TABLE](https://youtu.be/swXo45QrYWo?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Nous allons avoir une table unique pour ces deux entités, avec l'ensemble des colonnes de `User` et `Employee`
```
User : ID | Name | Salary
```

- Si on met des instances de `User` alors on utilisera que les deux premières colonnes
- Si on met des instances de `Employee` alors on utilisera les trois colonnes

On rencontre déjà un premier problème, car avec JPA on peut mettre `@Column(nullable = false) int salary` or les `user` auront ce champ à NULL.
Par conséquent, en choisissant la stratégie `SINGLE_TABLE` on ne pourra pas utiliser `nullable` sur les entités qui étendent l'entité de base

- `em.persist(...)` même table donc aucun problème
- `em.find(User.class, 1)`
  - Est-ce que le User qui a l'id 1 est réellement un User ?
  - La seule façon de s'en sortir est d'ajouter une colonne technique `DTYPE` qui sera complété lors de l'insertion et qui précisera `User` ou `Employee`
- `employee.setSalary(10000)` aucun problème car on a le type de l'objet
- `em.remove(employee)` on sait que l'instance est une instance d'employee donc aucun problème

### Stratégie JOINED
> [!ressource]
> [ 08 - 05 - Mapper une hiérarchie de classes en mode JOINED ](https://youtu.be/M9UOBnCLalI?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Une entité qui étend une autre entité est en relation 1:1 avec cette entité

```
User :     ID | Name
Employee : ID | Salary
```

L'ID dans User et Employee seront les mêmes pour un employee

- `em.persist(employee)` deux requêtes `INSERT` nécessaires, une pour la table User et une autre pour Employee
- `em.find(Employee, 2)` il nous faudra une jointure sur les deux tables
- `employee.setSalary(10000)` aucun problème avec la mise à jour car la propriété salaire est dans la classe `Employee` qui elle met est associée à une table précise => un seul update en base
- `em.remove(employee)` deux requêtes `DELETE` nécessaires

## L’annotation @Inheritance
```java
@Entity
@Inheritance(strategy=InheritanceType.TABLE_PER_CLASS)
public class User {

}
```