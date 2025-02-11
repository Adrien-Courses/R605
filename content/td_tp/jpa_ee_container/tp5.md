+++
title = "TP5 EE Container"
weight = 10
+++

> [!ressource] Ressource
> https://github.com/Adrien-Courses/R605-TP-JPA-EE-container.git

> [!danger] Rappel
> Dans la section dédiée au [transaction JPA]({{< relref "jpa/specification/transaction/index" >}}) nous avons souligné deux cas
> - si nous sommes dans un contexte Java SE (l'ensemble des TP précédent) nous devions gérer les transactions et l'injection de dépendances
> - si nous utilisons un container EE, alors nous pouvons nous passer de la gestion des transactions et déléguer l'injection au [CDI]({{< relref "cdi" >}})

L'objectif de ce TP est donc de découvrir ces concepts en implémentant une architecture en couche tout en factorisant le code nécessaire.

## 1. Installer TomEE et lancer le projet
Pour ce projet, nous avons besoin d'un container EE, nous allons utiliser TomEE.

1. Installer TomEE et l'intégrer avec [Eclipse]({{< relref "installation_tomee_eclipse" >}}) ou [IntelliJ]({{< relref "installation_tomee_intelliJ" >}}) <br><br>

2. Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}}) <br><br>
3. Lancer Docker Desktop + `docker compose up` pour la base de données

4. Lancer **en mode debug** pour bénéficier du How Swap
5. Rendez-vous sur l'url pour voir si tout fonctionne (attention au port)
     - `http://localhost:9080/jpa-ee-container/helloworld`


## 2. Consignes
Note : pour créer des objets JSON vous pouvez regarder
- `javax.json` : https://docs.oracle.com/javaee/7/api/javax/json/JsonObjectBuilder.html
- Utiliser des Map

### Partie 1. GenericDAO
- Créer une entité générique BaseEntity qui contiendra l'identifiant commun à toutes les entités.
- Créer une classe générique `GenericDAO<T>` pour gérer les opérations CRUD.
  - Injecter l'entityManager avec `@PersistenceContext(unitName = "myPU")`
  - Coder les méthodes `create()`, `find()`, `delete()` et `findAll()`<br>
  
- Créer une entité Student avec les annotations JPA.
- Créer un DAO spécifique StudentDAO qui hérite du GenericDAO.
- Créer un service `StudentService` sous forme d’un EJB pour gérer les étudiants.
- Créer une ressource REST `StudentController` pour exposer les opérations via une API REST.

Exemple 
`curl -X GET "http://localhost:8080/jpa-ee-container/students" -H "Accept: application/json"`

### Partie 1b. Rajouter les Soirées
Les étudiants peuvent participer à des soirées; lorsqu'on récupère un étudiant nous souhaitons lister les soirées où il a participer.

<!-- Si ne retourne pas dto alors pb de référence circulaire --->


-- M'appeler 
- comment régler les références circulaires ?
- comment éviter la `LazyInitializationException`

<!--
1. DTO de réponse

2. On va rajouter une méthode DANS le DAO findWithSoirees
public Student getStudent(Long id) {
    // Student student = studentDao.find(id);
    // Hibernate.initialize(student.getSoirees()); // horrible
    
    Student student = studentDao.findWithSoirees(id);
    
    return student;
}

-->

### Partie 2. Pagination
L'objectif de cette deuxième partie est d'ajouter une fonctionnalité de pagination aux requêtes de récupération des données dans notre GenericDAO.

- Ajouter la méthode `List<T> findAllPaginated(int page, int size)`
- Ajouter la méthode `long count()`

Modifier en conséquence `StudentService` pour exploiter la pagination et `StudentController`

```java
// Controller
Response getAllStudents(@QueryParam("page") @DefaultValue("0") int page, @QueryParam("size") @DefaultValue("10") int size) {
}
```

-- M'appeler
- à quoi ressemble le retour de l'API ?

<!--
1, Il faut la page + taille ET également le nombre d'élément total

    public List<T> findAllPaginated(int page, int size) {
        return em.createQuery("SELECT e FROM " + entityClass.getSimpleName() + " e", entityClass)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    // Méthode pour compter le nombre total d'entités
    public long count() {
        return em.createQuery("SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e", Long.class)
                .getSingleResult();
    }
-->

### Partie 3. Spécification/Criteria API
Nous allons ajouter une méthode `findByCriteria(Map<String, Object> criteria)` qui permet de rechercher des entités selon des conditions dynamiques.
- Dans `GenericDAO` nous allons coder cette fonction. On peut s'appuyer la notion de *predicate* qui peuvent être chaînés via `and` ou `or` (nous on fera du `and`). Exemple [^1]

```java
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class);
Root<Pet> pet = cq.from(Pet.class);
Predicate predicate1 = cb.equal(pet.get(Pet_.name), "Fido");  // création d'un prédicat
Predicate predicate2 = cb.equal(pet.get(Pet_.color), "brown"); // création d'un second prédicat
cq.where(predicate1.and(predicate2)); // chaine via and
```

- Puis dans les classes concrètent qui hérite de `GenericDAO` nous allons créer nos Prédicats puis appeler cette méthode
  - Coder `List<Student> searchStudents(String name, Integer age)`
  - qui va créer un prédicat puis appeler la méthode `findByCriteria`

<!--
    public List<Student> searchStudents(String name, Integer age) {
        Map<String, Object> criteria = new HashMap<>();
        if (name != null && !name.isEmpty()) {
            criteria.put("name", name);
        }
        if (age != null) {
            criteria.put("age", age);
        }
        return findByCriteria(criteria);
    }
-->


<!--
Verison améliorer car il faut traiter les LazyException, au lieu de faire un foreach puis Hibernate.initialiaz() on peut s'appuyer sur JOIN

    public List<T> findByCriteria(Map<String, Object> criterias) {
    	CriteriaBuilder cb = em.getCriteriaBuilder();
    	CriteriaQuery<T> cq = cb.createQuery(entityClass);
    	Root<T> root = cq.from(entityClass);
    	
    	List<Predicate> predicates = new ArrayList<Predicate>();
    	
    	for(Map.Entry<String, Object> entries : criterias.entrySet()) {
    		predicates.add(cb.equal(root.get(entries.getKey()), entries.getValue()));
    	}
    	
    	cq.where(cb.and(predicates.toArray(new Predicate[0])));
    	
        return em.createQuery(cq).getResultList();    
    }
    
    public List<T> findByCriteria(Map<String, Object> criterias, List<String> fetchRelations) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<T> cq = cb.createQuery(entityClass);
        Root<T> root = cq.from(entityClass);

        for (String relation : fetchRelations) {
            root.fetch(relation, JoinType.LEFT);
        }

        List<Predicate> predicates = new ArrayList<>();
        
        for (Map.Entry<String, Object> entry : criterias.entrySet()) {
            predicates.add(cb.equal(root.get(entry.getKey()), entry.getValue()));
        }
        
        cq.where(cb.and(predicates.toArray(new Predicate[0])));

        return em.createQuery(cq).getResultList();    
    }

-->

[^1]: https://stackoverflow.com/a/47604610/9399016


### Complément
Pour ce qui ont fini, vous pouvez rajouter la notion d'héritage
- Étudiant et Professeurs sont des Personnes
- Les Personnes peuvent participer à des soirées