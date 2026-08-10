+++
title = "JOIN FETCH dans une méthode dédiée"
description = "Garder un mapping LAZY et exposer une méthode de repository par plan de chargement : findAll() et findAllWithLivres()."
weight = 20
+++

C'est la solution que je retiens par défaut : garder le mapping `LAZY` et exposer, dans le repository, **une méthode par plan de chargement**.

```java {3, 9}
public class EtudiantRepository {
    // ne charge que l'étudiant
    public List<Etudiant> findAll() {
        return em.createQuery("select e from Etudiant e", Etudiant.class)
                .getResultList();
    }

    // charge l'étudiant et ses livres en une seule requête
    public List<Etudiant> findAllWithLivres() {
        return em.createQuery(
                        "select distinct e from Etudiant e join fetch e.livresLus",
                        Etudiant.class)
                .getResultList();
    }
}
```

Une seule requête SQL est émise, avec la jointure.

```sql
SELECT e.*, l.*
FROM etudiant e
LEFT JOIN livre l ON e.id = l.etudiant_id;
```

## Pourquoi cette écriture

- **le mapping reste neutre** : aucune requête n'est pénalisée par un besoin qui ne la concerne pas ;
- **le coût est lisible** : `findAllWithLivres()` annonce explicitement à l'appelant qu'il ramène davantage de données. Pas besoin d'ouvrir l'entité pour savoir ce que la méthode va coûter ;
- **c'est du JPQL standard** : pas d'annotation propriétaire ni de comportement implicite.

> [!definition] JOIN vs JOIN FETCH
> `join` sert uniquement à exprimer une condition ou une jointure dans la requête ; l'association n'est pas initialisée. `join fetch` demande en plus à Hibernate de **peupler** la collection avec le résultat de la jointure.

## Le distinct (nécessaire en Hibernate <= 5)

> [Excellent article : Hibernate 5 et la duplication d’entités : petit plongeon dans le code](https://www.sfeir.dev/back/hibernate-5-et-la-duplication-dentites-plongeons-dans-le-code-dhibernate/)

Le `distinct` est nécessaire côté Java : la jointure renvoie une ligne par livre, donc le même étudiant apparaît plusieurs fois dans le résultat.

```java
"select distinct e from Etudiant e join fetch e.livresLus"
```

> [!note] Note
> Depuis Hibernate 6, la déduplication des entités est automatique et le `distinct` n'est plus nécessaire dans ce cas : *Le problème des entités dupliquées est résolu dans Hibernate 6 (livré dans Spring Boot 3), car celui-ci introduit une meilleure gestion et automatique des entités dupliquées.* [^1]

## Limites

- on ne peut pas faire plusieurs `join fetch` de collections dans la même requête (voir [MultipleBagFetchException]({{< relref "multiple_bag_fetch" >}})) ;
- le `join fetch` se combine mal avec la pagination (voir [Pagination + JOIN FETCH]({{< relref "pagination_join_fetch" >}}) pour Hibernate <= 6) — dans ce cas se rabattre sur [`@BatchSize`]({{< relref "batch_size" >}}) ;
- avec plusieurs associations, le nombre de méthodes devient vite ingérable — c'est le cas d'usage des [Entity Graph]({{< relref "entity_graph" >}}).

[^1]: [Hibernate 5 et la duplication d’entités : petit plongeon dans le code](https://www.sfeir.dev/back/hibernate-5-et-la-duplication-dentites-plongeons-dans-le-code-dhibernate/)