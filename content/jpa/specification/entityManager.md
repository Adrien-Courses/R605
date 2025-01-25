+++
title = "EntityManager"
weight = 20
+++

> [!ressource] Ressources
> - [Créer un entity manager pour une unité de persistence](https://youtu.be/khzMpNTT39w?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

![alt text](jpa/specification/images/emf.png)

Les interactions entre la base de données et les beans entités sont assurées par un objet de type `javax.persistence.EntityManager` : il permet de lire et rechercher des données mais aussi de les mettre à jour (ajout, modification, suppression). L'EntityManager est donc au coeur de toutes les actions de persistance.

```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("MaBaseDeTestPU");    
EntityManager em = emf.createEntityManager();    
EntityTransaction transac = em.getTransaction();
transac.begin();

Personne nouvellePersonne = new Personne();
nouvellePersonne.setNom("nom4");
nouvellePersonne.setPrenom("prenom4");

em.persist(nouvellePersonne);

transac.commit();

em.close();    
emf.close();  
```
