+++
title = "Cascade"
weight = 60
+++

> [!ressource] Ressource
> http://orm.bdpedia.fr/dynamic.html#s2-persistance-transitive

En JPA/Hibernate, la cascade est un mécanisme qui permet de propager automatiquement certaines opérations (comme `persist`, `remove`, `merge`, etc.) d'une entité parent à ses entités enfants. Cela simplifie la gestion des relations en évitant d’avoir à sauvegarder ou supprimer manuellement chaque entité associée.

## Les différents types

- `CascadeType.PERSIST` : Lorsqu’une entité est sauvegardée (persist), ses entités associées sont également sauvegardées.
- `CascadeType.REMOVE` : Si l’entité principale est supprimée (remove), toutes ses entités associées le sont aussi.
- `CascadeType.REFRESH` : Recharge l'entité depuis la base de données et annule les modifications non sauvegardées.
- `CascadeType.DETACH` : Lorsque l’entité principale est détachée (detach), ses entités associées le sont aussi.

- `CascadeType.ALL` : Combine tous les types de cascade (`PERSIST`, `MERGE`, `REMOVE`, `REFRESH`, `DETACH`).

## Exemple
Supposons une entité `Owner` qui possède plusieurs animaux `Pet`, nous représentons donc la relation `@OneToMany` suivante

```java
@Entity
public class Owner {
    ...

    @OneToMany(mappedBy = "owner")
    private List<Pet> pets = new ArrayList();
}

@Entity
public class Pet {
    ...

    @ManyToOne
    @JoinColumn(name = "owner_id")  
    private Owner owner;            // assure le bidirectionnel
}
```

Puis nous créons les instances suivante

```java
Owner owner = new Owner("John Doe");

Pet pet1 = new Pet("Buddy", "dog", 3);
Pet pet2 = new Pet("Charlie", "dog", 4);

owner.addPet(pet1);
owner.addPet(pet2);
```

Si nous souhaitons persister en base de données l'ensemble des elements alors nous devons faire les appels suivant

```java
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(owner); // explicitement confirmer la persistance pour les trois entités
em.persist(pet1);  // en commençant par le owner
em.persist(pet2); 
em.getTransaction().commit();
```

Il faut donc faire attention à l'ordre de persistance, si nous essayons de persister en premier les animaux nous obtiendrons une `TransientPropertyValueException`
- signifiant qu'Hibernate essaie de sauvegarder un `Pet`, mais que sa propriété `owner` (fk) fait référence à un `Owner` qui n'a pas encore été persisté.

=> Ceci est donc contraignant, nous pouvons laisser JPA/Hibernate propager en cascade les instructions de persistance via la propriété `cascade`.

```java
@Entity
public class Owner {
    ...

    @OneToMany(mappedBy = "owner", cascade=CascadeType.ALL)
    private List<Pet> pets = new ArrayList();
}

@Entity
public class Pet {
    ... // Identique
}
```

Maintenant en précisant uniquement le `owner` l'ensemble des entités associées vont être persistées en base

```java
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(owner); // uniquement owner
em.getTransaction().commit();
...
em.getTransaction().begin();
em.remove(owner); // owner et ses pets supprimés car cascade
em.getTransaction().commit();
```