+++
title = "Fetch Eager/Lazy"
description = "FetchType LAZY ou EAGER : les stratégies de chargement des relations JPA, leurs valeurs par défaut et comment choisir."
weight = 70
+++

> [!ressource] Ressource
> - http://orm.bdpedia.fr/optimisation.html
> - https://blog.paumard.org/cours/jpa/chap03-entite-chargement.html
> [ Build faster persistence layers with Spring Data JPA 3 by Thorben Janssen @ Spring I/O 2024 ](https://youtu.be/t27Uozc2Z58)

## Définition

> [!definition] Définition
> - `FetchType.LAZY` : indique que la relation doit être chargée à la demande ;
> - `FetchType.EAGER` : indique que la relation doit être chargée en même temps que l'entité qui la porte.

Il est essentiel de comprendre comment sont chargées les relations entre entités pour optimiser les performances de l'application. Deux stratégies principales existent : *Lazy Fetching* (chargement paresseux) et *Eager Fetching* (chargement immédiat).

### Default fetching
- Par défaut, `@OneToMany` et `@ManyToMany` adoptent une approche Lazy Fetching
- Par défaut, `@OneToOne` et `@ManyToOne` adoptent une approche Eager Fetching

## Fetch Lazy
Les relations ne sont pas chargées immédiatement lors de la requête initiale. Elles sont récupérées uniquement lorsqu'elles sont explicitement accédées dans le code.

```java
@Entity
public class Etudiant {
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "etudiant") // fetch = FetchType.LAZY par défaut
    private List<Livre> livresLus;
}
```

### Exemple
Dans cet exemple, les livres lus par un étudiant ne seront chargés en mémoire que lorsqu'on accédera à la liste `livresLus`.

```java
Etudiant etudiant = entityManager.find(Etudiant.class, etudiantId);
    
List<Livre> livres = etudiant.getLivresLus();
```

Comme nous effectué un chargement *lazy* (paresseux), deux requêtes SQL vont être nécessaires pour récupérer les livres lus d'un étudiant
- `SELECT * FROM etudiant WHERE id = ?;`
- puis `SELECT * FROM livre WHERE etudiant_id = ?;`


## Fetch Eager
Le Eager Fetching force le chargement immédiat des relations lors de la requête initiale. Une seule requête avec jointure (`JOIN`) est exécutée pour récupérer l'étudiant et ses livres lus.

```java
@Entity
public class Etudiant {
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "etudiant", fetch = FetchType.EAGER) // Chargement immédiat
    private List<Livre> livresLus;
}
```

### Exemple
```java
Etudiant etudiant = entityManager.find(Etudiant.class, etudiantId);
    
List<Livre> livres = etudiant.getLivresLus();
```

Cette fois lorsqu'on récupère l'étudiant on récupère également l'ensemble des livres lus, donc une seule requête SQL

```
SELECT e.*, l.* 
FROM etudiant e 
LEFT JOIN livre l ON e.id = l.etudiant_id 
WHERE e.id = ?;
```

## Quel mode choisir ?
Et bien ça dépend.

- Dans le cas où l'on sait que la relation *livres* sera explorée systématiquement après la lecture d'un *étudiant*, il serait plus malin de n'émettre qu'un seul SELECT, avec une jointure, de manière à peupler la relation *livres* à l'avance. 
  - => Cela ne ferait qu'un seul aller-retour avec la base de données, et serait de ce fait beaucoup plus performant. 
- En revanche, dans le cas d'une relation qui, pour des raisons applicatives, ne serait pas explorée, ou rarement, alors l'exécution de la jointure lors du SELECT serait un surcoût inutile.

### En pratique

Le `EAGER` peut sembler pratique — la relation est toujours disponible — mais il impose son coût à **toutes** les requêtes portant sur l'entité, y compris celles qui n'ont pas besoin de la relation. La recommandation est donc de garder un mapping `LAZY` partout, et de décider du chargement au niveau de la requête, selon le cas d'usage.

C'est ce que nous détaillons dans les articles suivants, qui partent du problème le plus courant du chargement paresseux : les [N+1 requêtes]({{< relref "jpa_performance/n1_query_problem/" >}}).

Plusieurs solutions existent, nous en étudierons certaines dans le [TP3 JPA Fetching]({{< relref "td_tp/jpa_godeeper/fetching" >}})