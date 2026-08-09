+++
title = "Exemples complets"
weight = 30
+++

Ci-dessous, plusieurs exemples qui reprennent l'ensemble des deux pages précédentes

## WHERE avec API Criteria

Et finalement une autre option est d'utiliser l'API Criteria

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class);
Root<Pet> pet = cq.from(Pet.class);
Join<Pet, Owner> owner = pet.join("owner");

cq.select(pet)
  .where(
    cb.equal(pet.get("type"), "dog"),
    cb.lessThan(pet.get("age"), 5),
    cb.equal(owner.get("id"), ownerId)
  )
  .orderBy(cb.asc(pet.get("name")));

TypedQuery<Pet> q = em.createQuery(cq);
List<Pet> filteredPets = q.getResultList();
```

- La construction de la requête est modulaire et peut être facilement étendue ou modifiée.
- Les performances sont généralement meilleures car la requête est optimisée par le fournisseur JPA.

**Résultat**
Un seul appel SQL

```java
[Hibernate] 
    select
        p1_0.id,
        p1_0.age,
        p1_0.name,
        p1_0.owner_id,
        p1_0.type 
    from
        pets p1_0 
    where
        p1_0.type=? 
        and p1_0.age<? 
        and p1_0.owner_id=? 
    order by
        p1_0.name
```

## JOIN

Ainsi, si nous souhaitons à la fois charger les animaux et les propriétaires en une seule requête nous pouvons utiliser le `JOIN FETCH`

```java
Long ownerId = 1L; // Replace with the actual owner ID
String jpql = "SELECT p FROM Pet p JOIN FETCH p.owner WHERE p.type = :type AND p.age < :age AND p.owner.id = :ownerId ORDER BY p.name ASC";

TypedQuery<Pet> query = em.createQuery(jpql, Pet.class);
query.setParameter("type", "dog");
query.setParameter("age", 5);
query.setParameter("ownerId", ownerId);

List<Pet> filteredPets = query.getResultList();

// Display results
filteredPets.forEach(System.out::println);

filteredPets.forEach(pet -> {
  System.out.println(pet.getOwner().getName());
});
```

**Résultat**
Lors du `pet.getOwner().getName()` le propriétaire est déjà chargé

```
[Hibernate] 
    select
        p1_0.id,
        p1_0.age,
        p1_0.name,
        p1_0.owner_id,
        o1_0.id,
        o1_0.name,
        p1_0.type 
    from
        pets p1_0 
    join
        owners o1_0 
            on o1_0.id = p1_0.owner_id 
    where
        p1_0.type = ? 
        and p1_0.age < ? 
        and p1_0.owner_id = ? 
    order by
        p1_0.name
```

## Exemple update

> [!affirmation] Attention
> À toujours exécuter le code dans une transaction

```java
// Start a transaction
em.getTransaction().begin();

// Create CriteriaBuilder and CriteriaUpdate
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaUpdate<Pet> update = cb.createCriteriaUpdate(Pet.class);

// Define the root entity (Pet)
Root<Pet> pet = update.from(Pet.class);

// Join with Owner
Join<Pet, Owner> owner = pet.join("owner");

// Set the update: increase age by 1
update.set(pet.get("age"), cb.sum(pet.get("age"), 1))
      .where(
          cb.equal(pet.get("type"), "dog"),
          cb.lessThan(pet.get("age"), 5),
          cb.equal(owner.get("id"), ownerId)
      );

// Execute the update
Query query = em.createQuery(update);
int updatedCount = query.executeUpdate();

// Commit transaction
em.getTransaction().commit();
```