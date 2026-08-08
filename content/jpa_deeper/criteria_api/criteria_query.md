+++
title = "Criteria Query"
weight = 20
+++

> [!affirmation] Objectif
> CriteriaQuery permet d'assembler la requête complète

Après avoir compris `CriteriaBuilder`, l’étape suivante est de maîtriser `CriteriaQuery`.

## Qu’est-ce que `CriteriaQuery` ?

`CriteriaQuery` est une interface qui permet de construire une requête typée. Elle représente donc **la requête elle-même**, c’est-à-dire la structure globale :
- **Définition de la source**  (`.from()`) : elle renvoie un objet Root<T>, qui représente cette entité dans la requête et permet d'accéder aux attributs de celle-ci.
- **Les sélections** (`.select()`) : pour définir les champs à récupérer.
- **Les filtres** (`.where()`) : pour appliquer des conditions de filtrage.
- **Les jointures** (`.join()`) : pour lier plusieurs entités.
- **Les tris** (`.orderBy()`) : pour ordonner les résultats.
- **Les agrégations** (`.groupBy()`, `.having()`) : pour grouper et appliquer des conditions sur les groupes.


## Comment obtenir un `CriteriaQuery` ?

Depuis un `CriteriaBuilder` on obtient une instance typé Une requête Criteria suit toujours ce schéma :
- CriteriaBuilder
- CriteriaQuery
- Root
- select
- where
- TypedQuery

```java
CriteriaBuilder cb = em.getCriteriaBuilder();

CriteriaQuery<User> query = cb.createQuery(User.class);
```

## Quelques méthodes

L'ensemble des méthodes est disponible dans la [Javadoc](https://docs.oracle.com/javaee/7/api/javax/persistence/criteria/CriteriaQuery.html). Ci-dessous nous en présentons quelques une.

| Méthode | JavaDoc officielle | Signature |
|--------|---------------------|-----------|
| `from()` | Crée et ajoute une racine de requête correspondant à l’entité donnée, formant ainsi la clause `FROM`. | `<X> Root<X> from(Class<X> entityClass)` |
| `select()` | Spécifie l’élément à retourner dans le résultat de la requête. Remplace toute sélection précédente. | `CriteriaQuery<T> select(Selection<? extends T> selection)` |
| `where()` | Modifie la requête pour appliquer les restrictions données. Remplace toute restriction précédente. | `CriteriaQuery<T> where(Expression<Boolean> restriction)` |
| `groupBy()` | Spécifie les expressions utilisées pour regrouper les résultats de la requête. Remplace tout groupement précédent. | `CriteriaQuery<T> groupBy(Expression<?>... grouping)` |


## 1. Définir la racine : from

```java
// Equivalent SQL : FROM User u
Root<User> root = query.from(User.class);
```

Soit nous exploitons directement l'objet `root` dans un select, par exemple `query.select(root);`. Soit nous pouvons créer une jointure

### Jointures : join

```java
// Join<Source, Destination>
Join<User, Department> dept = root.join("department");

query.where(cb.equal(dept.get("name"), "IT"));
```

## 2. Sélectionner des résultats : select

```java
// Equivalent SQL : SELECT u
query.select(root);
```

### Sélectionner un champ précis

On retombe sur l'expression de la page [précédente]({{< relref "jpa_deeper/criteria_api/criteria_builder#comprendre-expression" >}}) : `Expression<String> nameExp = root.get("name");`

```java
query.select(root.get("name"));
```


## 3. Exécution avec TypedQuery

Une fois la requête terminée

```java
TypedQuery<User> typedQuery = em.createQuery(query);

List<User> results = typedQuery.getResultList();
```

## Exemple complet

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> query = cb.createQuery(User.class);

Root<User> root = query.from(User.class);

Predicate active = cb.equal(root.get("active"), true);
Predicate adult = cb.greaterThan(root.get("age"), 18);

query.select(root)
     .where(cb.and(active, adult))
     .orderBy(cb.asc(root.get("name")));

List<User> users = em.createQuery(query).getResultList();
```