+++
title = "JPA Criteria API"
weight = 20
+++

> [!ressource] Ressource
> - [Using the Criteria API to Create Queries - JakartaEE documentation](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/persist/persistence-criteria/persistence-criteria.html)
> - [Programmatic Criteria Queries using JPA Criteria API](https://www.initgrep.com/posts/java/jpa/create-programmatic-queries-using-criteria-api)

Les requêtes Criteria sont un graphe d’objets où chaque partie du graphe représente une portion atomique de la requête. Les différentes étapes de construction de ce graphe se traduisent globalement ainsi :

- L’interface `CriteriaQuery` définit les fonctionnalités nécessaires pour construire une requête de haut niveau.  
  Le type spécifié pour la requête, par exemple `criteriaQuery<Class<T> resultClass>`, correspond au type du résultat retourné.  
  Si aucun type n’est fourni, le résultat sera de type `Object`.  
  Une requête Criteria contient des méthodes permettant de :
  - spécifier les éléments retournés dans le résultat,
  - restreindre les résultats selon certaines conditions,
  - regrouper les résultats,
  - définir un ordre de tri,
  - et bien plus encore.

- L’interface `Root` représente les entités racines impliquées dans la requête.  
  Il peut y avoir plusieurs racines définies dans une même requête Criteria.

- L’interface `Path` représente le chemin vers un attribut dans l’entité racine.  
  Elle étend également l’interface `Expression`, qui contient des méthodes retournant des `Predicate`.

- La méthode `builder.count()` est une méthode d’agrégation.  
  Elle retourne une expression utilisée pour la sélection du résultat.  
  Lorsque des méthodes d’agrégation sont utilisées comme arguments dans la méthode `select`, le type de la requête doit correspondre au type de retour de la méthode d’agrégation.

- Une instance de `TypedQuery` est nécessaire pour exécuter la `CriteriaQuery`.

![relation](relation_heritage.png)

Dans le diagramme ci-dessus, observez les classes sur fond bleu. L'arborescence des relations explique la hiérarchie d'héritage entre les différentes interfaces présentes dans l'API Criteria.

- `Selection` se trouve au sommet et est étendue par `Expression`. 
    - `Expression` est à son tour étendue par les interfaces `Predicate` et `Path`. 
    - `From` étant `Path` qui est à son tour le parent des interfaces `Root` et `Join`.

<br>

- L'interface `Root` est également une expression. 
    - Cela signifie que nous pouvons interroger une entité complète en passant `Root` comme paramètre à la méthode `select`. 
    - Si nous voulons récupérer un attribut sélectionné, nous pouvons récupérer le chemin d'accès à l'attribut à l'aide de `root.get(attributeName)`. Cette méthode renvoie un objet `Path` qui hérite de `Expression`.

## Exemple complet
Voici un exemple complet, les pages suivantes détaillerons pas à pas la création d'une requêtes

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

1. Cette requête illustre les étapes de base pour créer une requête Criteria.

2. Utiliser une instance de `EntityManager` pour créer un objet `CriteriaBuilder`.

3. Créer un objet requête en instanciant l’interface `CriteriaQuery`.  
  Les attributs de cet objet requête seront ensuite modifiés avec les détails de la requête.

4. Définir la racine de la requête en appelant la méthode `from` sur l’objet `CriteriaQuery`.

5. Spécifier le type du résultat de la requête en appelant la méthode `select` de l’objet `CriteriaQuery`.

6. Préparer la requête pour son exécution en créant une instance de `TypedQuery<T>`, en précisant le type du résultat attendu.

7. Exécuter la requête en appelant la méthode `getResultList` sur l’objet `TypedQuery<T>`.  
  Comme cette requête retourne une collection d’entités, le résultat est stocké dans une `List`.


C'est l'équivalent de la requête
```sql
SELECT * FROM Pet
```

L'exemple ci-dessus est simpliste et l'utilisation de la méthode suivante aurait suffi

```java
List<Pet> = em.createQuery("SELECT p FROM Pet p", Pet.class).getResultList();
```

## Pourquoi l'utiliser ?
Très bonne remarque ! En effet, jusqu'à présent, les opérations de base sur les entités (`persist`, `merge`, `remove`) ne permettaient pas de contrôler les conditions WHERE lors de leur exécution. Plusieurs solutions sont possibles :
- faire un filtre directement en Java, mais très peu performant 
- utiliser JPQL + méthode `createQuery`
- utiliser l'API Criteria