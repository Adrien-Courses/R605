+++
title = "Exemple concret"
weight = 10
+++

## Illustration
Pour illustrer l'importance du cycle de vie, considérons la table `Cours` suivante
```
+----+-------+--------------+----------------------------------------+-------------------------+
| id | duree | promotion_id | description                            | name                    |
+----+-------+--------------+----------------------------------------+-------------------------+
|  1 |    40 |            1 | Programmation Java avancée             | Java                    |
+----+-------+--------------+----------------------------------------+-------------------------+
```

### Récupérer deux fois la même instance
Supposons un cas réel, où vous récupérer une première fois l'instance depuis votre base de données, puis une minute plus tard vous avez besoin de récupérer de nouveau cette même instance. Nous devons nous assurer que les données soient bien synchronisée.
Pour ce faire, lorsqu'une entité est récupérée depuis la base de données elle est placé dans l'état `MANAGE`, , ce qui signifie qu'elle est désormais sous le contrôle de l'`EntityManager`. À partir de là, chaque fois que vous accédez à cette même entité avec la même instance d'`EntityManager`, Hibernate renverra directement l'entité en mémoire sans requête supplémentaire, car elle est déjà gérée (et donc stockée dans le cache de premier niveau).

```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("org.hibernate.tutorial.jpa");
EntityManager em = emf.createEntityManager();

Cours cours = em.find(Cours.class, 1L);  // Chargement initial depuis la base de données
System.out.println(cours);               // Affiche l'instance : Cours@28b523a

// Une minute plus tard...

Cours cours2 = em.find(Cours.class, 1L); // Hibernate renvoie l'instance déjà gérée
System.out.println(cours2);              // Affiche la même instance : Cours@28b523a
```

Néanmoins, si une application tierce modifie directement les données en base pendant la minute d’attente, Hibernate n’en sera pas informé par défaut, car il utilise le cache de premier niveau associé à `l’EntityManager`. Dans ce cas, l’entité reste dans son état initial en mémoire et ne reflète pas les éventuelles modifications faites directement dans la base de données.

Pour remédier à cela, nous pouvons demander explicitement à Hibernate de rafraîchir l'entité en mémoire avec les données actuelles de la base, en utilisant la méthode `refresh`

 ```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("org.hibernate.tutorial.jpa");
EntityManager em = emf.createEntityManager();

Cours cours = em.find(Cours.class, 1L); 
System.out.println(cours);                   // Affiche l'instance : Cours@28b523a
System.out.println(cours.getDescription());  // Affiche la description initiale

// Attente simulant une modification externe en base
// UPDATE Cours SET description = "Une nouvelle description" WHERE id = 1;
Thread.sleep(20000);                     

Cours cours2 = em.find(Cours.class, 1L); 
System.out.println(cours2);                  // Affiche toujours la même instance : Cours@28b523a
System.out.println(cours.getDescription());  // Affiche la description inchangée en mémoire

// Rafraîchissement de l'entité pour recharger les données depuis la base
em.refresh(cours2);
System.out.println(cours2);                   // Affiche la même instance : Cours@28b523a
System.out.println(cours2.getDescription());  // Affiche la description actualisée : Une nouvelle description
```

Si on regarde la console, on voit bien une nouvelle requête SQL
```
fr.adriencaubel.jpa.entities.Cours@7a606260
Programmation Java avancee
-- after 20s
fr.adriencaubel.jpa.entities.Cours@7a606260
Programmation Java avancee

[Hibernate] 
    select
        c1_0.id,
        c1_0.description,
        ...
    from
        Cours c1_0 
    
fr.adriencaubel.jpa.entities.Cours@7a606260
Changement description
```

### Détacher l'entité
Lorsqu’une entité est détachée, elle passe de l’état `MANAGED` à l’état `DETACHED`. Cela signifie qu’elle n'est plus suivie par `l’EntityManager`, donc aucune modification ultérieure de cet objet ne sera automatiquement synchronisée avec la base de données. En d’autres termes, l’entité détachée est désormais en dehors du contexte de persistance d’Hibernate.

```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("org.hibernate.tutorial.jpa");
EntityManager em = emf.createEntityManager();

Cours cours = em.find(Cours.class, 1L);
System.out.println(cours);     // Cours@7a606260     

em.detach(cours);

// Nouveau appel SQL
Cours cours2 = em.find(Cours.class, 1L);
System.out.println(cours2);   // Objet différent : Cours@28b523a
```

### Re-attacher une entité détachée

Si on modifie une entité `DETACHED` et qu'on souhaite persister ses nouvelles valeurs nous devons la rattacher pour l'`EntityManager` persiste son état. Mais que devienne les entités ?
- On pourrait s'attendre à ce qu'une fois merge l'entité soit redevienne celle d'avant le détachement. Mais non, JPA va recréer une nouvelle entité

```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("org.hibernate.tutorial.jpa");
EntityManager em = emf.createEntityManager();

Cours cours = em.find(Cours.class, 1L);
System.out.println(cours);

em.detach(cours);
        
Cours _cours = em.merge(cours);

System.out.println(cours);
System.out.println(_cours);
```

> So, when using merge, the detached object instance will continue to remain detached even after the merge operation.

Pour s'en assurer si nous essayons de faire un `em.persist(cours);` à la suite du code précédent nous obtenons l'erreur suivante

```
...
System.out.println(cours);
System.out.println(_cours);
em.persist(cours);

Exception in thread "main" jakarta.persistence.EntityExistsException: detached entity passed to persist: fr.adriencaubel.jpa.entities.Cours
```

Pour en savoir plus [https://stackoverflow.com/a/60661154](https://stackoverflow.com/a/60661154)
