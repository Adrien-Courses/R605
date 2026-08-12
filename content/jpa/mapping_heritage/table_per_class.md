+++
title = "Stratégie TABLE_PER_CLASS"
description = "La stratégie TABLE_PER_CLASS donne à chaque classe concrète une table autonome contenant aussi les colonnes héritées, au prix de requêtes polymorphiques en UNION."
weight = 40
+++

> [!ressource] Ressource
> - [ 08 - 03 - Mapper une hiérarchie de classes en mode TABLE_PER_CLASS ](https://youtu.be/mb6tEK3C5_o?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Chaque classe concrète possède **sa propre table, complète et autonome** : elle contient ses attributs propres **et** ceux hérités du parent.

```
user     : ID | NAME
employee : ID | NAME | SALARY
```

C'est la différence essentielle avec [JOINED]({{< relref "joined" >}}) : la colonne `name` est **dupliquée** dans chaque table, il n'y a plus aucune jointure entre elles.

## Le mapping

```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class User {

    @Id
    private int id;

    private String name;
}

@Entity
public class Employee extends User {

    private int salary;
}
```

> [!warning] Attention à la génération d'identifiants
> `GenerationType.IDENTITY` est **interdit** avec cette stratégie. Comme chaque table gère sa propre séquence d'auto-incrément, deux entités de tables différentes recevraient le même identifiant — alors que l'unicité doit être garantie sur toute la hiérarchie (un `User` d'id 1 et un `Employee` d'id 1 seraient indiscernables lors d'une requête polymorphique).
>
> Il faut donc une séquence partagée, par exemple `GenerationType.TABLE` ou `GenerationType.SEQUENCE`.

## Les opérations CRUD

Sur une classe concrète, tout est simple et optimal : chaque table est autonome, aucune jointure n'est nécessaire.

- `em.persist(employee)` : un seul `INSERT`, dans la table correspondant au type réel ;
- `em.find(Employee.class, 2)` : un seul `SELECT`, sans jointure ;
- `employee.setSalary(10000)` : un seul `UPDATE` ;
- `em.remove(employee)` : un seul `DELETE`.

## Le coût : les requêtes polymorphiques

C'est le point faible, et il est sévère. Une requête sur la classe racine doit parcourir **toutes** les tables de la hiérarchie et en fusionner les résultats par `UNION`.

```java
em.createQuery("select u from User u", User.class);
```

```sql
SELECT id, name, NULL AS salary, 0 AS clazz FROM user
UNION ALL
SELECT id, name, salary,        1 AS clazz FROM employee;
```

Chaque sous-classe ajoute une branche à l'`UNION`. La base ne peut exploiter aucun index sur le résultat fusionné, et un `em.find(User.class, 1)` — où le type réel est inconnu — doit lui aussi interroger toutes les tables.

Ce coût touche aussi les **associations vers la classe mère** : une clé étrangère vers `User` est impossible à déclarer au niveau de la base, puisqu'aucune table unique ne contient tous les utilisateurs. L'intégrité référentielle est perdue.

## La pagination

Elle reste **correcte** — aucune multiplication de lignes ici, donc Hibernate applique bien `LIMIT`/`OFFSET` en SQL — mais elle est **coûteuse**.

```sql
SELECT * FROM (
    SELECT id, name, NULL AS salary, 0 AS clazz FROM user
    UNION ALL
    SELECT id, name, salary,        1 AS clazz FROM employee
) t
ORDER BY t.name
LIMIT 20 OFFSET 0;
```

Le `LIMIT` porte sur le résultat de l'`UNION`. Pour renvoyer 20 lignes, la base doit en principe lire l'intégralité de chaque table, fusionner, trier, puis tout jeter sauf 20. Comme le tri porte sur un ensemble fusionné, **aucun index ne le sert directement** : c'est le vrai coût, davantage que l'`UNION` elle-même.

Deux nuances

- **les filtres sont poussés dans les branches** : un `where u.name like 'A%'` est réinjecté dans chaque `SELECT` de l'`UNION`, les index de sélection restent donc exploitables ;
- **certains moteurs optimisent le tri** : PostgreSQL peut faire un *Merge Append* si chaque branche dispose d'un index sur la colonne de tri — il fusionne alors des flux déjà triés et s'arrête après 20 lignes. La condition est stricte, l'index devant exister sur **toutes** les tables.

Dans tous les cas, la pagination profonde (`OFFSET 10000`) reste mauvaise, la base devant produire puis jeter 10 000 lignes issues de la fusion.

## Quand l'utiliser

C'est la stratégie la moins recommandée des trois, mais elle a son domaine.

- quand les sous-classes sont manipulées **indépendamment**, et que les requêtes polymorphiques sur la classe racine sont rares ou inexistantes ;
- quand les classes filles partagent peu de choses et divergent fortement.

Dans ce cas de figure, il faut cependant se poser la question : si l'on n'interroge jamais la classe mère, celle-ci a-t-elle vraiment besoin d'être une entité ? Un [`@MappedSuperclass`]({{< relref "mappedsuperclass" >}}) produit le même schéma — une table complète par classe fille — en énonçant explicitement qu'aucune requête polymorphique n'est possible.

| | `TABLE_PER_CLASS` | `@MappedSuperclass` |
| --- | --- | --- |
| Schéma généré | une table par classe concrète | identique |
| La classe mère est une entité | ✅ | ❌ |
| Requêtes polymorphiques | possibles, mais coûteuses (`UNION`) | impossibles |
| `List<User>` dans une association | ✅ | ❌ |
