+++
title = "TP5 Correction"
weight = 11
+++

> [!ressource] Ressource
> https://github.com/Adrien-Courses/R605-TP-JPA-EE-container.git **BRANCHE final**

> [!danger] Rappel
> Dans la section dédiée au [transaction JPA]({{< relref "jpa/specification/transaction/index" >}}) nous avons souligné deux cas
> - si nous sommes dans un contexte Java SE (l'ensemble des TP précédents) nous devions gérer les transactions et l'injection de dépendances
> - si nous utilisons un container EE, alors nous pouvons nous passer de la gestion des transactions et déléguer l'injection au [CDI]({{< relref "cdi" >}})

## Structure du projet
Le projet est structuré par domaine technique, les différents packages représentent nos différentes couches `Controller`, `Service` et `Repository/DAO`

De plus, nous avons un `GenericDAO<T>` qui va nous permettre d'éviter le code boilerplate. Et comme souligné ci-dessus, étant donné que nous sommes dans un contexte *container EE* nous n'avons pas besoin de gérer explicitement les transactions.

```java
@Stateless
public class GenericDao<T extends  BaseEntity> {

    @PersistenceContext
    private EntityManager em;

    private Class<T> entityClass;

    public GenericDao() {}

    public GenericDao(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    public T create(final T t) {}
    public T update(final T t) {}
    public void delete(final Object id) {}

    public T find(final Object id) {
        return em.find(entityClass ,id);
    }
}
```

- `@PersistenceContext` via TomEE nous bénéficions du [CDI]({{< relref "cdi" >}}) qui permet d'injecter la dépendance `EntityManager`
- `entityClass` nous permet de connaître la classe concrète
- pas besoin de gérer les transactions


## Partie 1

### 1. Coder le service StudentService
- `StudentService` appelle `StudentDAO`

```java
public class StudentService {
    @Inject // Injection de dépendances
    private StudentDao studentDao;

    public Student getStudent(Long id) {
        return studentDao.find(id);
    }
}
```

- Dans `studentDao` nous n'avons pas besoin de recoder la méthode `find()`
- Ce sera celle de la super-classe qui sera appelée 


### 2. Rajouter les soirées
- Nous avons donc une relation `OneToMany`, on fera attention aux éléments suivants :
  - utiliser `mappedBy` pour avoir une relation bidirectionnelle 
  - ne pas oublier les méthode `addSoiree(Soiree s)` et `removeStudent(Soiree s)` pour garantir la synchronisation des objets

> [!definition] Attention
> La relation est en réalité n:m et pas 1:n, mais passons ...

```java
@Entity
public class Student extends BaseEntity {
    private String name;
    private int age;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Soiree> soirees;

    // méthodes addSoiree(Soiree e) et removeSoiree(Soiree e)
}

@Entity
public class Soiree extends BaseEntity {
    private String name;
    
    @ManyToOne
    private Student student;
}
```

### 3. Récupérer un étudiant avec ses soirées
Dans `StudentService` rajoutons la méthode

```java
public class StudentService {
    ...
    public Student findWithSoiree(Long id) {
        Student student = studentDao.find(id);
        student.getSoirees(); // Illegal LazyInitializationException
        return student;
    }
}
```

- Si nous réalisons le code ci-dessus, alors une `LazyInitializationException` sera levée; en effet nous ne pouvons pas accéder à la liste des soirée si nous ne sommes pas dans la même transaction. (cf [TP3]({{<relref "td_tp/jpa_godeeper/fetching/#implémenter-plusieurs-solutions" >}}))
- Une solution consiste donc à utiliser une JOINTURE, en codant une nouvelle méthode dans `StudentDao`

```java
public class StudentDao {
    ...
    public Student findWithSoirees(Long id) {
        return em.createQuery(
                "SELECT s FROM Student s LEFT JOIN FETCH s.soirees WHERE s.id = :id", Student.class)
            .setParameter("id", id)
            .getSingleResult();
    }
}
```

### 3b. Afficher un étudiant et ses soirées (JSON)
Nous avons un problème de référence circulaire car :
- un `student` à un attribut `soirees`
- et une `soirees` à un attribut `student`

```
{
    id: 1
    name: Adrien
    age: 24
    soirees: [
        {
            id: 1
            name: super soiree
            student: {
                id: 1
                name: Adrien
                age: 24
                soirees: [
                    ...
                ]
            }
        },
        {
            id: 2
            ...
        }
    ]
}
```

Plusieurs options permettent d'éviter les références circulaires :
- supprimer l'attribut `student` dans la classe `Soirees`, mais ceci casse la relation bidirectionnelle, et comme rappelé dans le paragraphe [OneToMany relation-bidirectionnelle]({{< relref "jpa/mapping_associations/one-to-many#relation-bidirectionnelle" >}}) <br><br>

- une autre option consiste à rajouter l'annotation `@JsonIgnore` sur l'attribut `student` dans la classe `Soirees` pour ne pas afficher les étudiants au format JSON. Mais pour moi cette solution n'est pas la bonne car elle contourne le problème. <br><br>

- En effet, le problème vient du faire que nous retournons à la Vue notre schéma relationnelle. Or, comme vu dans le premier cours nous n'avons pas à exposer notre architecture de base de données à notre Vue. En effet si dans les étudiants avions un champs `password` souhaitons-nous le retourner dans le JSON ?! Par conséquent, la solution est de créer un `StudentDTO`
    - Et dans la couche Service ou Controller (au choix) nous ferons la conversion entre `Student` et `StudentDTO`: `public StudentDTO toDTO(Student student)`


## Partie 2 - pagination
Pour le moment, tous les étudiants sont remontés. Par soucis de performance, nous devons mettre en place de la pagination.
- Depuis le Controller on demandera la *page* et le nombre d'élément souhaités (*size*)
- Puis dans le DAO nous coderons la requête SQL permettant de limiter le nombre d'éléments

```java
public class GenericDao<T extends  BaseEntity> {
    ...

    // Ajout de la méthode de pagination
    public List<T> findAllPaginated(int page, int size) {
        return em.createQuery("SELECT e FROM " + entityClass.getSimpleName() + " e", entityClass)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }
}
```

- Pour coder la pagination SQL nous allons utiliser un `createQuery` puis deux méthodes
  - la première permettant d'aller au premier résultat à remonter
  - la deuxième pour spécifier le nombre d'élément à remonter

=> Par conséquent, en 4 lignes, nous venons de coder la pagination pour l'ensemble de nos classes.

### MAIS pour les jointures ?
Néanmoins, comment récupérer *tous les étudiants avec leurs soirées* ?
- car si nous appelons cette méthode nous rencontrerons une `LazyInitializationException` comme dans la *Partie 1 point 3.*

Il faut comme dans le cas précédent créer une jointure. Néanmoins au lieu de créer une nouvelle méthode dans `StudentDAO` essayons de créer une méthode générique
- Pour ce faire, nous allons utiliser une liste pour représenter notre jointure, dans laquelle nous préciserons les attributs de jointure (ici `a` et `b`)
```
SELECT s
FROM Student s
JOIN s.soirees
JOIN s.y
JOIN s.z
```

```java
public List<T> findAllPaginatedAndJoin(int page, int size, List<String> fetchRelations) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<T> cq = cb.createQuery(entityClass);
    Root<T> root = cq.from(entityClass);

    for (String relation : fetchRelations) {
        root.fetch(relation, JoinType.LEFT);
    }

    return em.createQuery(cq)
                .setFirstResult(page * size)  // ajout de la pagination
                .setMaxResults(size)
                .getResultList();  
}
```

Et dans `StudentDAO` nous pouvons construire la méthode suivante

```java
public List<Student> findAllWithPaginationAndJoin(int page, int size) {
    // Permet le JOIN à soirée
    return findByCriteria(criteria, List.of("soirees"));
}
```

## Partie 3 - recherche via criteria
Il nous reste un point à aborder. Comment rechercher des étudiants ?
- pour ce faire on va se baser sur l'API Criteria

```
SELECT s
FROM Student s
WHERE name = :name
AND age = :age
AND y = :y
```

Pour représenter nos critère nous allons utilise une `Map<String, Object>`, dans le `GenericDAO` nous codons la méthode suivante

```java
public List<T> findByCriteria(Map<String, Object> criterias, List<String> fetchRelations) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<T> cq = cb.createQuery(entityClass);
    Root<T> root = cq.from(entityClass);

    // Jointure pour éviter LazyInitializationException
    for (String relation : fetchRelations) {
        root.fetch(relation, JoinType.LEFT);
    }

    // Critère de recherche
    List<Predicate> predicates = new ArrayList<>();
    for (Map.Entry<String, Object> entry : criterias.entrySet()) {
        predicates.add(cb.equal(root.get(entry.getKey()), entry.getValue()));
    }
    
    cq.where(cb.and(predicates.toArray(new Predicate[0])));

    return em.createQuery(cq).getResultList();    
}
```

Et finalement dans notre classe `StudentDAO`

```java
public List<Student> searchStudents(String name, Integer age) {
    Map<String, Object> criteria = new HashMap<>();
    if (name != null && !name.isEmpty()) {
        criteria.put("name", name);
    }
    if (age != null) {
        criteria.put("age", age);
    }

    // Join à soirée
    return findByCriteria(criteria, List.of("soirees"));
    }
```

Attention, nous ne pouvons pas coder simplement

```java
findByCriteria(criteria, Map.of("name", name, "age", age));
```

Car si `name` ou `age` sont null, alors vous allez vous retrouver avec la requête suivante qui faussera les résultats
```
WHERE name = NULL
AND age = NULL
```