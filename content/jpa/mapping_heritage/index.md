+++
title = "Mapping JPA Héritage"
description = "Mapper l'héritage avec JPA : les trois stratégies SINGLE_TABLE, JOINED et TABLE_PER_CLASS, leurs compromis et l'annotation @Inheritance."
weight = 50
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

Ce code Java est valide, mais il ne dit rien de la façon dont ces deux entités seront stockées. C'est tout l'enjeu : il n'existe pas de traduction évidente de l'héritage vers le modèle relationnel, seulement trois compromis possibles.

## L'annotation @Inheritance

La stratégie se déclare sur la **classe racine** de la hiérarchie, et s'applique à toute sa descendance.

```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class User {

}
```

> [!note] Note
> En l'absence d'annotation `@Inheritance`, JPA applique la stratégie [SINGLE_TABLE]({{< relref "single_table" >}}) par défaut.

## Les 3 stratégies de mapping

Reprenons `User` et `Employee`, et regardons le schéma produit par chacune.

**[SINGLE_TABLE]({{< relref "single_table" >}})** — une seule table pour toute la hiérarchie, plus une colonne discriminante

```
user : ID | DTYPE | NAME | SALARY
```

**[JOINED]({{< relref "joined" >}})** — une table par classe, reliées par une clé primaire partagée (relation 1:1, un *employee* dépend d'un *user* pour exister)

```
user     : ID | NAME
employee : ID | SALARY
```

**[TABLE_PER_CLASS]({{< relref "table_per_class" >}})** — une table complète et autonome par classe concrète, les colonnes héritées étant dupliquées

```
user     : ID | NAME
employee : ID | NAME | SALARY
```

## Comparaison

| | [SINGLE_TABLE]({{< relref "single_table" >}}) | [JOINED]({{< relref "joined" >}}) | [TABLE_PER_CLASS]({{< relref "table_per_class" >}}) |
| --- | --- | --- | --- |
| Nombre de tables | 1 | 1 par classe | 1 par classe concrète |
| `persist` d'une fille | 1 `INSERT` | 1 `INSERT` par niveau | 1 `INSERT` |
| `find` sur une fille | 1 `SELECT` | jointure | 1 `SELECT` |
| Requête polymorphique | 1 `SELECT` ✅ | `LEFT JOIN` sur toutes les tables | `UNION` sur toutes les tables ❌ |
| Pagination | ✅ index exploité | ✅ piloté par la table racine | ⚠️ tri sur le résultat de l'`UNION` |
| Contraintes `NOT NULL` | ❌ impossibles sur les filles | ✅ | ✅ |
| Modèle normalisé | ❌ colonnes creuses | ✅ | ❌ colonnes dupliquées |
| Clé étrangère vers la racine | ✅ | ✅ | ❌ impossible |

## Comment choisir

- **[SINGLE_TABLE]({{< relref "single_table" >}})** si les classes filles ajoutent peu d'attributs et que les lectures priment. C'est le défaut, et souvent le bon choix.
- **[JOINED]({{< relref "joined" >}})** si les classes filles ont de nombreux attributs obligatoires et que l'intégrité doit être garantie par la base.
- **[TABLE_PER_CLASS]({{< relref "table_per_class" >}})** rarement — et dans ce cas, se demander d'abord si un [`@MappedSuperclass`]({{< relref "mappedsuperclass" >}}) ne conviendrait pas mieux.

Ces trois stratégies supposent que la classe mère soit une **entité**. Si ce n'est pas le cas — si l'on veut seulement factoriser des attributs communs sans jamais interroger la classe mère — c'est vers [`@MappedSuperclass`]({{< relref "mappedsuperclass" >}}) qu'il faut se tourner.
