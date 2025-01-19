+++
title = "Définition"
weight = 1
+++

> [!ressource] Ressources
> - [Migrating from Hibernate’s to JPA’s Criteria API](https://thorben-janssen.com/migration-criteria-api/)

## Définition
> The Java Persistence Criteria API is used to define dynamic queries through the construction of object-based query definition objects, rather than use of the string-based approach of JPQL. The criteria API allows dynamic queries to be built programmatically offering better integration with the Java language than a string-based 4th GL approach. 

Dans le passé, Hibernate proposait également sa propre API propriétaire Criteria. Elle est obsolète dans Hibernate 5 et vous devez l'éviter lors de la mise en œuvre de nouveaux cas d'utilisation. **Since Hibernate 5.2, the Hibernate Criteria API is deprecated, and new development is focused on the JPA Criteria API.**. L'ensemble des avantages de l'une et autre API est l'excellant article [Migrating from Hibernate’s to JPA’s Criteria API](https://thorben-janssen.com/migration-criteria-api/)

## Pourquoi l'utiliser
Très bonne remarque ! En effet, jusqu'à présent, les opérations de base sur les entités (`persist`, `merge`, `remove`) ne permettaient pas de contrôler les conditions WHERE lors de leur exécution. Voyons comment l'API Criteria permet d'étendre ces opérations de base.

### Exemple 
Le code suivant retourne tous les instances de type `Pet`. Nous détaillerons dans la page suivante le code ci-dessous
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
SELECT p
FROM Pet p
```

L'exemple ci-dessus est simpliste et l'utilisation de la méthode `find()` aurait suffit. Maintenant, imaginons que nous voulons récupérer tous les animaux de compagnie d'un propriétaire donné, de type "chien" et âgés de moins de 5 ans, triés par ordre alphabétique.

{{% expand title="Avec find()" %}}
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
{{% /expand %}}

{{% expand title="Avec JPA Criteria API." %}}
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
{{% /expand %}}
