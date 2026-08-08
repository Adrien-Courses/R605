+++
title = "EntityManager Opérations"
weight = 21
+++

Ci-dessous la liste des opérations les plus communes sur un `entityManager`

```java
// 1. Persist : Enregistrer une nouvelle entité
Person person = new Person("Alice", 25);
em.persist(person);

// 2. Find : Rechercher une entité par sa clé primaire
Person foundPerson = em.find(Person.class, person.getId());

// 3. Merge : Mettre à jour une entité détachée
Person detachedPerson = new Person("Bob", 30);
detachedPerson.setName("Updated Bob");
Person managedPerson = em.merge(detachedPerson);

// 4. Remove : Supprimer une entité
em.remove(managedPerson);

// 5. Query : Exécuter une requête JPQL
List<Person> persons = em.createQuery("SELECT p FROM Person p", Person.class)
                         .getResultList();
```

> [!definition] Attention
> Les opérations `persist()` et `remove()` ne seront réellement effectuées en base de données qu'après un commit `em.getTransaction().commit()` (cf [transactions]({{< relref "jpa/specification/transaction" >}}))

![write_behing_cache](write_behing_cache.png)