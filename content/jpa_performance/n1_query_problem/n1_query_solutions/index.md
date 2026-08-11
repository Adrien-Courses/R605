+++
title = "Solutions aux N+1 requêtes"
description = "Panorama des solutions JPA au problème des N+1 requêtes : EAGER, JOIN FETCH, @BatchSize, SUBSELECT, Entity Graph et projections DTO."
weight = 5
+++

> [!ressource] Ressource
> - [N+1 query problem with JPA and Hibernate](https://vladmihalcea.com/n-plus-1-query-problem/)

Plusieurs solutions existent pour supprimer les N+1 requêtes. Elles ne se valent pas : certaines déplacent le problème, d'autres le règlent mais introduisent d'autres contraintes.

## Les différentes solutions

| Solution | Principe | Verdict |
| --- | --- | --- |
| [`FetchType.EAGER`]({{< relref "eager" >}}) | forcer le chargement dans le mapping | ❌ ne règle rien et pénalise toutes les requêtes |
| [`JOIN FETCH` dans une méthode dédiée]({{< relref "join_fetch" >}}) | une méthode de repository par plan de chargement | ✅ ma préférée |
| [`@BatchSize`]({{< relref "batch_size" >}}) | charger les associations par paquets | ⚠️ atténue le problème sans le supprimer |
| [`@Fetch(FetchMode.SUBSELECT)`]({{< relref "subselect" >}}) | toutes les collections en une requête, via une sous-requête | ⚠️ efficace mais implicite et non standard |
| [Entity Graph]({{< relref "entity_graph" >}}) | le plan de chargement passé en paramètre de la requête | ✅ quand les combinaisons se multiplient |
| [Projection DTO]({{< relref="jpa_requetes/projection" >}}) | ne charger aucune entité, juste les colonnes utiles | ✅ en lecture seule |

## Ma préférence : les méthodes dédiées

L'approche que je retiens est celle des **méthodes de repository dédiées** : le mapping reste `LAZY` partout, et le repository expose une méthode par plan de chargement.

```java
findAll()                // ne charge que l'étudiant
findAllWithLivres()      // ajoute un join fetch sur les livres
```

C'est le meilleur compromis pour trois raisons

- **le mapping reste neutre** : aucune requête ne paie un chargement dont elle n'a pas besoin ;
- **le coût est lisible** : le nom de la méthode annonce ce qu'elle ramène, sans avoir à ouvrir l'entité ;
- **c'est du JPQL standard** : pas d'annotation propriétaire, pas de comportement implicite.

Son défaut connu est la **combinatoire** : avec plusieurs associations, le nombre de méthodes explose (`findAllWithLivresAndAdresses`, `findAllWithLivresAndCursus`…). C'est le seul cas où je bascule vers un [Entity Graph]({{< relref "entity_graph" >}}), qui permet de garder une requête générique et de passer le plan de chargement en paramètre.
