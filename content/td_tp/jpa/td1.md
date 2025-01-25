+++
title = "TD1 JPA Cycle de vie"
weight = 20
+++

> [!ressource] Ressource
> [https://github.com/Adrien-Courses/R605-TP-JPA-cycledevie](https://github.com/Adrien-Courses/R605-TP-JPA-cycledevie)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consigne

> [!affirmation] Objectif
> Dans ce TD nous mettons en oeuvre la section sur le [cycle de vie d'une entité]({{< relref "jpa/specification/cyle_de_vie" >}})

### 2.1 Récupérer deux fois la même entité
- Compléter le code de la méthode `getSameEntityTwice()` pour récupérer deux fois la même entité, que remarquez-vous ?
  - est-ce qu'on nouveau appel à la base de données est exécuté ?
  - quelle est la valeur de la référence après le second appel ? 

<br>

- Bloquer le Thread pendant plusieurs seconde le temps de mettre à jour directement en base de données une nouvelle valeur pour la description du cours
  ```java
  // Attente simulant une modification externe en base
  // UPDATE Cours SET description = "Une nouvelle description" WHERE id = 1;
  Thread.sleep(20000); 
  ```
  - Que remarquez vous lors de la seconde récupération ? Comment corriger le problème et que remarquez-vous ?
  <!-- SOLUTION : on utilise refresh() et on remarque qu'un appel à la BDD est effectué -->

### 2.2 Détacher l'entité
Compléter le code de la méthode `detachedEntity()` pour effectuer les actions suivantes 
- Récupérer une première fois l'entité en base de données puis détachez là.
- Récupérer une seconde fois cette même entité, que remarquez-vous ?


### 2.3 Re-attacher une entité détachée
Si on modifie une entité `DETACHED` et qu’on souhaite persister ses nouvelles valeurs nous devons la rattacher pour l’EntityManager persiste son état. Mais que devienne les entités ?

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

Quel sera le résultat ?