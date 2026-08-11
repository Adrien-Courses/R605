+++
title = "@Fetch(FetchMode.SUBSELECT)"
description = "Le FetchMode.SUBSELECT d'Hibernate charge toutes les collections d'un même résultat en une seule requête supplémentaire, en réutilisant la requête initiale en sous-requête."
weight = 35
+++

> [!ressource] Ressource
> - [The best way to use the @Fetch annotation with JPA and Hibernate](https://vladmihalcea.com/hibernate-facts-the-importance-of-fetch-strategy/)

`@Fetch(FetchMode.SUBSELECT)` est une annotation **Hibernate** (elle ne fait pas partie de JPA) qui change la façon dont les collections paresseuses sont initialisées.

```java
@OneToMany(mappedBy = "etudiant")
@Fetch(FetchMode.SUBSELECT)
private List<Livre> livresLus;
```

## Le principe

Au lieu d'émettre une requête par étudiant, Hibernate n'en émet **qu'une seule** pour tous les étudiants du résultat précédent — en réutilisant la requête initiale sous forme de sous-requête.

```java
List<Etudiant> etudiants = em.createQuery("select e from Etudiant e where e.promotion = 'M2'",
                                          Etudiant.class)
                             .getResultList();

etudiants.get(0).getLivresLus().size();   // déclenche le chargement de TOUTES les collections
```

```sql
-- 1. la requête initiale
SELECT * FROM etudiant WHERE promotion = 'M2';

-- 2. une seule requête pour toutes les collections
SELECT * FROM livre
WHERE etudiant_id IN (SELECT e.id FROM etudiant e WHERE e.promotion = 'M2');
```

Deux requêtes au total, quel que soit le nombre d'étudiants. La première initialisation d'une collection déclenche le chargement de **toutes** les collections des entités issues de la même requête.

## Différence avec @BatchSize

Les deux annotations poursuivent le même but mais ne procèdent pas pareil.

| | `@BatchSize` | `FetchMode.SUBSELECT` |
| --- | --- | --- |
| Nombre de requêtes | 1 + N/taille | 1 + 1 |
| Comment les parents sont désignés | liste d'identifiants (`IN (1, 2, 3…)`) | la requête initiale rejouée en sous-requête |
| Portée | les entités en attente dans le contexte | les entités issues de la même requête |
| Applicable à un `em.find()` | ✅ | ❌ (il faut une requête initiale à rejouer) |

## Limites

- **ce n'est pas du JPA standard** : l'annotation est propriétaire Hibernate ;
- **la requête initiale est réexécutée** comme sous-requête. Si elle est coûteuse (jointures multiples, filtres complexes), la base la calcule une seconde fois. C'est le principal reproche : `@BatchSize` passe une simple liste d'identifiants, ce qui est souvent moins cher ;
- **le comportement est implicite** : comme pour `@BatchSize`, rien dans le code appelant n'indique ce qui sera chargé ni quand ;
- **le déclenchement est tout ou rien** : initialiser une seule collection charge celles de toutes les entités de la requête, y compris celles dont on n'avait pas besoin ;
- **incompatible avec la pagination** au sens où la sous-requête ne reprend pas les bornes `LIMIT`/`OFFSET` de la requête initiale.

> [!note] En pratique
> Utile quand on parcourt systématiquement l'intégralité d'un résultat de requête et que le `join fetch` n'est pas possible. Dans les autres cas, [`@BatchSize`]({{< relref "batch_size" >}}) est plus prévisible, et une [méthode dédiée avec `JOIN FETCH`]({{< relref "join_fetch" >}}) reste préférable.
