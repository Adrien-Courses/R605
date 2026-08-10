+++
title = "Entity Graph"
description = "L'Entity Graph découple le plan de chargement de la requête : une seule requête générique et les associations à charger passées en paramètre."
weight = 40
+++

> [!ressource] Ressource
> - [Entity Graph – The best way to handle multiple JPA fetch joins](https://thorben-janssen.com/jpa-entity-graph/)

## Le problème : la combinatoire des méthodes dédiées

L'approche par [méthode dédiée]({{< relref "join_fetch" >}}) fonctionne très bien tant que les besoins de chargement restent peu nombreux. Ajoutons maintenant une relation `Etudiant` vers `Adresse` et une relation vers `Cursus`. Le repository devient

```java
findAll()
findAllWithLivres()
findAllWithAdresses()
findAllWithCursus()
findAllWithLivresAndAdresses()
findAllWithLivresAndCursus()
findAllWithAdressesAndCursus()
...
```

Chaque association ajoutée multiplie le nombre de combinaisons possibles, et chaque méthode duplique la même requête JPQL à un `join fetch` près.

## La solution : découpler le plan de chargement

Un **Entity Graph** décrit les associations à charger, indépendamment de la requête. La requête reste générique, le plan de chargement est passé en paramètre.

### Graphe dynamique

```java
EntityGraph<Etudiant> graph = em.createEntityGraph(Etudiant.class);
graph.addAttributeNodes("livresLus");

List<Etudiant> etudiants = em.createQuery("select e from Etudiant e", Etudiant.class)
                             .setHint("jakarta.persistence.fetchgraph", graph)
                             .getResultList();
```

Ce qui permet d'écrire une méthode de repository unique

```java
public List<Etudiant> findAll(EntityGraph<Etudiant> graph) {
    return em.createQuery("select e from Etudiant e", Etudiant.class)
             .setHint("jakarta.persistence.fetchgraph", graph)
             .getResultList();
}
```

### Graphe nommé

Le graphe peut aussi être déclaré sur l'entité et réutilisé par son nom.

```java
@Entity
@NamedEntityGraph(
    name = "Etudiant.avecLivres",
    attributeNodes = @NamedAttributeNode("livresLus")
)
public class Etudiant { ... }
```

```java
EntityGraph<?> graph = em.getEntityGraph("Etudiant.avecLivres");
```

### Sous-graphes

Un graphe peut descendre de plusieurs niveaux, ce que le `join fetch` ne permet d'exprimer qu'en enchaînant les jointures.

```java
EntityGraph<Etudiant> graph = em.createEntityGraph(Etudiant.class);
graph.addSubgraph("livresLus").addAttributeNodes("auteur");
```

## fetchgraph ou loadgraph

Deux hints existent, et la différence porte sur les attributs **absents** du graphe.

| Hint | Attributs du graphe | Attributs absents |
| --- | --- | --- |
| `jakarta.persistence.fetchgraph` | chargés en EAGER | traités comme LAZY |
| `jakarta.persistence.loadgraph` | chargés en EAGER | conservent leur `FetchType` d'origine |

Avec un mapping `LAZY` partout, les deux se comportent de la même façon. `fetchgraph` reste plus explicite.

## Limites

- les mêmes que le `join fetch` en ce qui concerne la pagination : charger une collection en EAGER empêche Hibernate de paginer en SQL ;
- les noms d'attributs sont des **chaînes de caractères** : aucune vérification à la compilation, un renommage de champ casse le graphe silencieusement (le métamodèle JPA statique permet d'atténuer ce point) ;
- l'appelant doit construire le graphe, ce qui est plus verbeux qu'un simple appel à `findAllWithLivres()`.

> [!note] En pratique
> Je reste sur des méthodes dédiées tant que les combinaisons sont peu nombreuses, et je bascule sur les Entity Graph quand le repository commence à accumuler les variantes.
