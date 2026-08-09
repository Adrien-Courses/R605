+++
title = "Criteria Builder"
weight = 20
+++

> [!affirmation] Objectif
> CriteriaBuilder permet de construire des morceaux de requête

## Qu’est-ce que `CriteriaBuilder` ?

`CriteriaBuilder` est **l’objet principal** qui fournit toutes les méthodes nécessaires pour construire :

- des requêtes (`CriteriaQuery`)
- des conditions (`Predicate`)
- des expressions (`Expression`)
- des fonctions (`count`, `sum`, `max`, etc.)
- des opérations logiques (`and`, `or`, `not`)
- des tris (`orderBy`)

## Comment obtenir un `CriteriaBuilder`

Le `CriteriaBuilder` est fourni par l’`EntityManager`.

```java
EntityManager em = ...;

CriteriaBuilder cb = em.getCriteriaBuilder();
```

## Quelques méthodes

L'ensemble des méthodes est disponible dans la [Javadoc](https://docs.oracle.com/javaee/7/api/javax/persistence/criteria/CriteriaBuilder.html). Ci-dessous nous en présentons quelques une.

| Méthode | JavaDoc officielle | Signature |
|--------|---------------------|-----------|
| `equal` | Crée un prédicat pour tester l’égalité entre deux expressions. | `Predicate equal(Expression<?> x, Object y)` |
| `greaterThan` | Crée un prédicat pour tester si une expression est strictement supérieure à une autre. | `<Y extends Comparable<? super Y>> Predicate greaterThan(Expression<? extends Y> x, Y y)` |
| `and` | Crée une conjonction de prédicats. Un prédicat AND est vrai si tous les prédicats le sont. | `Predicate and(Predicate... restrictions)` |
| `like` | Crée un prédicat pour tester si une expression de type chaîne correspond à un motif (`LIKE`). | `Predicate like(Expression<String> x, String pattern)` |

On remarque de type principaux : `Expression` et `Predicate`

### Comprendre Expression
> Une `Expression<T>` représente une valeur dans une requête.

Cela peut être :
- un champ (name, age)
- une fonction (count, sum)
- un calcul (age + 10)
- une valeur constante

```java
// accéder à un attribut; root.get("name") retourne une Expression<String>
Expression<String> nameExp = root.get("name");
```

```java
// fonction SQL COUNT
Expression<Long> countExp = cb.count(root);
```

### Comprendre Predicate

> Un Predicate représente une condition logique (`WHERE`). Il est toujours construit via CriteriaBuilder
> - `Predicate equal(Expression<?> x, Object y)`

```java
// WHERE name = 'Adrien'
Predicate condition = cb.equal(root.get("name"), "Adrien");
```

```java
// WHERE age > 18
Predicate condition = cb.greaterThan(root.get("age"), 18);
```

On peut également combiner plusieurs prédicat via `and(Predicate... restrictions)` 

```java
Predicate p1 = cb.equal(root.get("active"), true);
Predicate p2 = cb.greaterThan(root.get("age"), 18);

Predicate andCondition = cb.and(p1, p2);
```

### Exemple complet
Note : pour le moment, nous n'avons pas vu comment construire ni l'objet CriteriaQuery, ni l'objet Root

```java
CriteriaBuilder cb = em.getCriteriaBuilder();  // 1. Créer un objet CriteriaBuilder
CriteriaQuery<User> query = cb.createQuery(User.class);

Root<User> root = query.from(User.class);

Predicate condition = cb.equal(root.get("name"), "Adrien");  // 2. créer un prédicat 

query.select(root).where(condition);  // 3. exploiter un prédicat

List<User> results = em.createQuery(query).getResultList();
```