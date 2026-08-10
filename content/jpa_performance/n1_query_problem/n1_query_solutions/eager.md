+++
title = "FetchType.EAGER"
description = "Pourquoi passer une association en FetchType.EAGER ne supprime pas les N+1 requêtes et pénalise toutes les requêtes de l'entité."
weight = 10
+++

Le premier réflexe est souvent de forcer le chargement dans le mapping.

```java
@OneToMany(mappedBy = "etudiant", fetch = FetchType.EAGER)
private List<Livre> livresLus;
```

## Ça ne supprime pas le N+1

Sur une requête JPQL, Hibernate exécute la requête principale, puis **une requête par étudiant** pour remplir la collection.

```java
em.createQuery("select e from Etudiant e", Etudiant.class).getResultList();
```

```sql
SELECT * FROM etudiant;
SELECT * FROM livre WHERE etudiant_id = 1;
SELECT * FROM livre WHERE etudiant_id = 2;
-- ...
```

Le seul changement est que ces requêtes sont déclenchées **plus tôt**, sans qu'on les ait demandées. Le nombre d'allers-retours avec la base est identique.

> [!note] Note
> L'`EAGER` ne produit une jointure que sur un `em.find()`. Dès qu'on passe par JPQL ou Criteria, Hibernate exécute la requête telle qu'elle est écrite, puis complète les associations `EAGER` par des requêtes supplémentaires.

## Le coût est imposé à toutes les requêtes

C'est le reproche principal. L'`EAGER` s'applique **partout** : toutes les requêtes sur `Etudiant` paieront le chargement des livres, y compris celles qui n'en ont pas besoin.

- un comptage d'étudiants ;
- un écran de liste qui n'affiche que les noms ;
- une recherche par nom.

Le coût est inscrit dans le mapping alors que le besoin appartient au cas d'usage. Et comme le mapping est partagé par toute l'application, un `EAGER` ajouté pour un écran dégrade tous les autres.

> [!warning] À retenir
> Le mapping doit rester `LAZY` partout. C'est la requête, et non l'entité, qui décide de ce qui est chargé.
