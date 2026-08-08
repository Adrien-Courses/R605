+++
title = "TD2 JPA Cycle de vie Cache"
weight = 20
+++

> [!ressource] Ressource
> [The JPA and Hibernate first-level cache](https://vladmihalcea.com/jpa-hibernate-first-level-cache/)
> 
> [https://github.com/Adrien-Courses/R605-TP-JPA-cycledevie-cache-L1](https://github.com/Adrien-Courses/R605-TP-JPA-cycledevie-cache-L1)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consigne

> [!affirmation] Objectif
> Après avoir étudié le cycle de vie dans le TD précédent, regardons la notion de cache L1

```java
public static void initializeData() {
      EntityManagerFactory emf = Persistence.createEntityManagerFactory("jpa-cycledevie-cache");
      EntityManager em = emf.createEntityManager();
      
      Course newCourse = new Course("Java JPA", 30, "Introduction à JPA");
      Course newCourseDP = new Course("Design Pattern", 60, "Trop cool les DP");
      Course newCourseLinux = new Course("Linux", 40, "Découverte shell");

      em.getTransaction().begin();
      em.persist(newCourse);
      em.persist(newCourseDP);
      em.persist(newCourseLinux);

      if(true) {
        while(true) {
          }
      }
      
      
      em.getTransaction().commit();

      em.close();
      emf.close();

      System.out.println("Course inserted successfully: " + newCourse.getName());
}
```

Si nous nous rendons en BDD et exécutons le code suivant `SELECT * FROM Course` quel va être le résultat ?
- En vous appuyant sur l'article en ressource expliquez le résultat

<!-- la table est vide tant quo'"n a pas commit, ca reste dans le cache 
Et je oense que si on joue avec le flush bmode on peut modifier le comportement
"-->

### Complément
En supprimant la boucle, l'id ne commence pas à 1, pourquoi ?
- [How do Identity, Sequence, and Table (sequence-like) generators work in JPA and Hibernate](https://vladmihalcea.com/hibernate-identity-sequence-and-table-sequence-generator/)