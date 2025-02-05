+++
title = "TP5 EE Container"
weight = 10
+++

> [!danger] Rappel
> Dans la section dédiée au [transaction JPA]({{< relref "jpa/specification/transaction/index" >}}) nous avons souligné deux cas
> - si nous sommes dans un contexte Java SE (l'ensemble des TP précédent) nous devions gérer les transactions et l'injection de dépendances
> - si nous utilisons un container EE, alors nous pouvons nous passer de la gestion des transactions et déléguer l'injection au [CDI]({{< relref "cdi" >}})

L'objectif de ce TP est donc de découvrir ces concepts en implémentant une architecture en couche tout en factorisant le code nécessaire.

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}}) <br><br>


## 2. Déployer l'application
Le déploiement de l'application est un peu plus compliqué que le simple lancement de la méthode `main()`

1. Télécharger le projet est l'ouvrir dans Eclipse ou IntelliJ
2. Lancer Docker Desktop + `docker compose up` pour la base de données
3. Installer TomEE et l'intégrer avec [Eclipse]({{< relref "installation_tomee_eclipse" >}}) ou [IntelliJ]({{< relref "installation_tomee_intelliJ" >}}) 
4. Lancer **en mode debug** pour bénéficier du How Swap
5. Rendez-vous sur l'url pour voir si tout fonctionne (attention au port)

## 3. Consignes
### Partie 1. GenericDAO
- Créer une entité générique BaseEntity qui contiendra l'identifiant commun à toutes les entités.
- Créer une classe générique `GenericDAO<T>` pour gérer les opérations CRUD.
  - Injecter l'entityManager avec `@PersistenceContext(unitName = "myPU")`
  - Coder les méthode `create()`, `find()`, `update()`, `delete()` et `findAll()`<br>
  
- Créer une entité Student avec les annotations JPA.
- Créer un DAO spécifique StudentDAO qui hérite du GenericDAO.
- Créer un service `StudentService` sous forme d’un EJB pour gérer les étudiants.
- Créer une ressource REST `StudentController` pour exposer les opérations via une API REST.

### Partie 2. Pagination
L'objectif de cette deuxième partie est d'ajouter une fonctionnalité de pagination aux requêtes de récupération des données dans notre GenericDAO.

- Ajouter la méthode `List<T> findAllPaginated(int page, int size)`
- Ajouter la méthode `long count()`

Modifier en conséquence `StudentService` pour exploiter la pagination et `StudentController`
    - Controller : `Response getAllStudents(@QueryParam("page") @DefaultValue("0") int page, @QueryParam("size") @DefaultValue("10") int size)`

### Partie 3. Spécification/Criteria API
Nous allons ajouter une méthode `findByCriteria(Map<String, Object> criteria)` qui permet de rechercher des entités selon des conditions dynamiques.

Pour coder cette fonction appuyer vous sur la notion de *predicate* qui peuvent être chainés via `and` ou `or` (nous on fera du `and`). Exemple [^1]

```java
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class);
Root<Pet> pet = cq.from(Pet.class);
Predicate predicate1 = cb.equal(pet.get(Pet_.name), "Fido");  // création d'un prédicat
Predicate predicate2 = cb.equal(pet.get(Pet_.color), "brown"); // création d'un second prédicat
cq.where(predicate1.and(predicate2)); // chaine via and
```

[^1]: https://stackoverflow.com/a/47604610/9399016