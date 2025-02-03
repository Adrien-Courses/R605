+++
title = "Définition"
weight = 1
+++

> [!ressource] Ressources
> - [Migrating from Hibernate’s to JPA’s Criteria API](https://thorben-janssen.com/migration-criteria-api/)
> - [Github - R605-EXEMPLE-JPA-Criteria](https://github.com/Adrien-Courses/R605-EXEMPLE-JPA-Criteria)

## Définition
> The Java Persistence Criteria API is used to define dynamic queries through the construction of object-based query definition objects, rather than use of the string-based approach of JPQL. The criteria API allows dynamic queries to be built programmatically offering better integration with the Java language than a string-based 4th GL approach. 

Dans le passé, Hibernate proposait également sa propre API propriétaire Criteria. Elle est obsolète dans Hibernate 5 et vous devez l'éviter lors de la mise en œuvre de nouveaux cas d'utilisation. **Since Hibernate 5.2, the Hibernate Criteria API is deprecated, and new development is focused on the JPA Criteria API.**. L'ensemble des avantages de l'une et autre API est l'excellant article [Migrating from Hibernate’s to JPA’s Criteria API](https://thorben-janssen.com/migration-criteria-api/)

## Exemple 
Le code suivant retourne toutes les instances de type `Pet`. Nous détaillerons dans la page suivante le code ci-dessous
```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("MaBaseDeTestPU");    
EntityManager em = emf.createEntityManager();  

CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class);
Root<Pet> pet = cq.from(Pet.class);
cq.select(pet);
TypedQuery<Pet> q = em.createQuery(cq);
List<Pet> allPets = q.getResultList();
```
C'est l'équivalent de la requête
```sql
SELECT * FROM Pet
```

L'exemple ci-dessus est simpliste et l'utilisation de la méthode suivante aurait suffit

```java
List<Pet> = em.createQuery("SELECT p FROM Pet p", Pet.class).getResultList();
```

## Pourquoi l'utiliser ?
Très bonne remarque ! En effet, jusqu'à présent, les opérations de base sur les entités (`persist`, `merge`, `remove`) ne permettaient pas de contrôler les conditions WHERE lors de leur exécution. Plusieurs solutions sont possibles :
- faire un filtre directement en Java
- utiliser JPQL + méthode `createQuery`
- utiliser l'API Criteria

### WHERE en Java
Imaginons que nous voulons récupérer tous les animaux de compagnie d'un propriétaire donné, de type "chien" et âgés de moins de 5 ans, triés par ordre alphabétique.

```java
// Récupération d'un propriétaire par son ID
Owner owner = em.find(Owner.class, ownerId);

// Récupération des animaux de compagnie du propriétaire
List<Pet> pets = new ArrayList<>();
for (Pet pet : owner.getPets()) {
    if (pet.getType().equals("dog") && pet.getAge() < 5) {
        pets.add(pet);
    }
}
// Trier les animaux par ordre alphabétique
pets.sort(Comparator.comparing(Pet::getName));
```
- Il faut écrire du code Java pour filtrer et trier les résultats.
- Les performances peuvent être médiocres, surtout si la collection d'animaux de compagnie est volumineuse.
- Si la logique de filtrage devient plus complexe, le code devient rapidement difficile à maintenir.

De plus, en SQL nous avons la possibilité d'écrire une requête qui répond à ce besoin.

**Résultat**
Il y aura deux appel SQL (FETCH.LAZY)
- un premier pour récupérer le `owner`
- et le second lorsqu'on execute la méthode `owner.getPets()` 

```
[Hibernate] 
    select
        o1_0.id,
        o1_0.name 
    from
        owners o1_0 
    where
        o1_0.id=?
[Hibernate] 
    select
        p1_0.owner_id,
        p1_0.id,
        p1_0.age,
        p1_0.name,
        p1_0.type 
    from
        pets p1_0 
    where
        p1_0.owner_id=?
```

### WHERE avec JPQL

Une alternative consiste à écrire une requête SQL préparée puis utiliser `createQuery` (voir [EntityManager Operation]({{< relref "jpa/specification/entityManager_operations" >}})) puis ensuite saisir les paramètres

```java
Long ownerId = 1L;  // Replace with the actual owner ID
String jpql = "SELECT p FROM Pet p WHERE p.type = :type AND p.age < :age AND p.owner.id = :ownerId ORDER BY p.name ASC";

TypedQuery<Pet> query = em.createQuery(jpql, Pet.class);
query.setParameter("type", "dog");
query.setParameter("age", 5);
query.setParameter("ownerId", ownerId);

List<Pet> filteredPets = query.getResultList();

for (Pet pet : filteredPets) {
    System.out.println(pet);
}
```

**Résultat**
Un seul appel SQl

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

### WHERE avec API Criteria

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
Un seul appel SQl

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

### Complément : JOIN FETCH
On notera que dans les deux dernière solution nous n'avons que le `pet` représenté par `p1_0`. 
- Si nous souhaitons en plus récupérer le propriétaire en appelant `pet.getOwner().getName()` alors une nouvelle requête SQL est exécutée

```
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

[Hibernate] 
    select
        o1_0.id,
        o1_0.name 
    from
        owners o1_0 
    where
        o1_0.id=?
```

Ainsi, si nous souhaitons à la fois charger les animaux et le propriétaires en une seule requête nous pouvons utiliser le `JOIN FETCH`

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

## Conclusion
L'API criteria permet de remplacer les mot-clés JPQL (`SELECT`, `FROM`, `WHERE`) par des équivalent `select()`, `from()`, `where()` ...