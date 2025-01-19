+++
title = "Concepts de base"
weight = 20
+++

> [!ressource] Ressources
> - [JakartaEE - Using the Criteria API to Create Queries](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/persist/persistence-criteria/persistence-criteria.html)

## Types d'opération
Il n’est possible de réaliser que trois types d’opérations avec l’API Criteria qui sont la lecture, la modification et la suppression (SELECT, UPDATE et DELETE). Chacune de ces opérations a ses propres classes qui sont :
  - `CriteriaQuery` pour le SELECT.
  - `CriteriaUpdate` pour l’UPDATE.
  - `CriteriaDelete` pour le DELETE.

## La classe CriteriaBuilder
La classe **CriteriaBuilder** est le principal point d'entrée de l'API Criteria. Elle fournit des méthodes pour créer les éléments fondamentaux d'une requête, notamment :

- `createQuery()` : Crée une instance de **CriteriaQuery** pour définir la requête.
- `equal()`, `greaterThan()`, `like()`, etc. : Créent des prédicats pour filtrer les données.
- `sum()`, `avg()`, `max()`, etc. : Créent des expressions d'agrégation.

```java
CriteriaBuilder cb = em.getCriteriaBuilder();  // Créer un CriteriaBuilder depuis EntityManager
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class); // Utiliser le CB pour créer une requête
```

## La classe CriteriaQuery
La classe **CriteriaQuery** représente la requête en elle-même et permet de définir les différents éléments constitutifs de la requête, tels que :

- **Définition de la source**  (`.from()`) : elle renvoie un objet Root<T>, qui représente cette entité dans la requête et permet d'accéder aux attributs de celle-ci.
- **Les sélections** (`.select()`) : pour définir les champs à récupérer.
- **Les filtres** (`.where()`) : pour appliquer des conditions de filtrage.
- **Les jointures** (`.join()`) : pour lier plusieurs entités.
- **Les tris** (`.orderBy()`) : pour ordonner les résultats.
- **Les agrégations** (`.groupBy()`, `.having()`) : pour grouper et appliquer des conditions sur les groupes.

```java
Root<Pet> pet = cq.from(Pet.class);
cq.select(pet);
```

Une fois la requête construite, elle peut être exécutée via **l'EntityManager**.

```java
TypedQuery<Pet> q = em.createQuery(cq);
List<Pet> allPets = q.getResultList(); // permet d'exécuter la requête
```

## Les expressions de prédicats
Les **expressions de prédicats** sont les éléments de base pour définir les conditions de filtrage dans une requête Criteria. Voici quelques exemples d’utilisation :

- `cb.equal(root.get("name"), "John")` : Filtre les entités où le champ `name` est égal à "John".
- `cb.greaterThan(root.get("age"), 18)` : Filtre les entités où l'`age` est supérieur à 18.
- `cb.like(root.get("email"), "%@example.com")` : Filtre les entités dont l'email se termine par "@example.com".
- `cb.isNull(root.get("address"))` : Filtre les entités où l'`address` est null.

Ces prédicats peuvent être combinés avec des opérateurs logiques (`and()`, `or()`, `not()`) pour créer des conditions de filtrage complexes.

## Exemple complet
```java
// Créer un objet de type CriteriaQuery
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class);

// Construire la requête
Root<Pet> pet = cq.from(Pet.class);
Join<Pet, Owner> owner = pet.join("owner");

cq.select(pet)
  .where(
    cb.equal(pet.get("type"), "dog"),
    cb.lessThan(pet.get("age"), 5),
    cb.equal(owner.get("id"), ownerId)
  )
  .orderBy(cb.asc(pet.get("name")));

// Executer la requête
TypedQuery<Pet> q = em.createQuery(cq);
List<Pet> filteredPets = q.getResultList();
```
