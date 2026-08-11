+++
title = "LazyInitializationException"
description = "LazyInitializationException : pourquoi Hibernate ne peut pas charger une relation LAZY hors session, avec trois cas concrets et leurs solutions."
weight = 15
+++

> [!ressource] Ressource
> [LazyInitializationException – What it is and the best way to fix it](https://thorben-janssen.com/lazyinitializationexception/)

L'exception `LazyInitializationException` est l'une des erreurs les plus courantes lors de l'utilisation de JPA et d'Hibernate. Elle survient lorsque vous tentez d'accéder à une association chargée de manière différée après la fermeture du contexte de persistance (session Hibernate). Ce guide explique les causes de ce problème et propose plusieurs solutions.

## Définition

> [!definition] Javadoc LazyInitializationException
> Indicates an attempt to access unfetched data outside the context of an open stateful Session. [^1]

Cette erreur se produit lorsque qu'hibernate essaye de charger une relation [*Lazy*]({{< relref "jpa/mapping_associations/fetching" >}}) en dehors de son contexte de persistence.

## Rappels
Par défaut, beaucoup de relations sont en [chargement paresseux]({{< relref "jpa/mapping_associations/fetching" >}})
```java
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;
```

Cela signifie :
- Hibernate ne charge pas les orders immédiatement
- Il attend qu'on appelle explicitement la relation (faire un `.getOrders()`)
    - pour rappel, ceci va exécuter une nouvelle requêtes SQL `SELECT * FROM Orders WHERE fk_id_x = y` => implicant généralement des problèmes de [N+1 queries]({{< relref "jpa_performance/n1_query_problem/" >}})

### Mais, que lorsque la session est ouverte

Hibernate **ne peut charger une relation lazy que si** :
- la session est encore ouverte
- la transaction est active

## Exemples

### Exemple 1 — Session fermée trop tôt

```java
User user = entityManager.find(User.class, 1);

entityManager.close(); // session fermée

user.getOrders().size(); // ❌ crash LazyInitializationException car Hibernate essaie de SELECT * FROM orders WHERE user_id = 1; sur une session fermée
```

### Exemple 2 — Retour d’une entité hors transaction

```java
public class UserService {

    @PersistenceContext
    private EntityManager entityManager;

    public User getUser(Integer id) {
        return entityManager.find(User.class, id);
        // Orders ne sont pas chargés ici (LAZY)
    }
}
```

```java
public class OrderService {

    private UserService userService;

    public void afficherCommandes(Integer userId) {

        User user = userService.getUser(userId); // Cette méthode charge uniquement User : SELECT * FROM user WHERE id = 1;

        // ❌ La session est déjà fermée ici, impossible d'appeler SELECT * FROM orders WHERE user_id = 1
        for (Order order : user.getOrders()) {
            System.out.println(order.getTotal());
        }
    }
}
```

### Exemple 3 — API REST (sérialisation JSON)
Les deux exemples précédent, nous permettent de comprendre ce phénomène avec une API Rest, et par exemple lorsqu'on utilise Spring.

On souhaite retourner un JSON au format suivant
```
{
  "id": 1,
  "orders": [...]
}
```

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Integer id) {
    return userService.getUser(id);
}
```

Quand Jackson transforme l’objet en JSON, il appelle automatiquement
- `user.getId()` : aucun problème ✅
- `user.getOrders()` : mais la session est déjà fermée

## Solutions
Nous avons déjà abordés les solutions possible : 
- passer en `EAGER`, mais problème de performance car on chargera toujours l'ensemble des relations
- créer une méthode `findById` et une autre `findByIdJoinOrder` via un `JOIN FETCH`, c'est cette solution à privilégier
- pour le troisième exemple, par defaut spring met en place du [Open Session In View]({{< relref "jpa_performance/n1_query_problem/open_session_in_view" >}}) (le `user.getOrders()` est exécuté sans exception), mais c'est un anti-pattern : l'exception disparaît, le N+1 reste

### Le cas de Hibernate.initialize()

Hibernate propose une méthode utilitaire qui force l'initialisation d'une association **tant que la session est encore ouverte**.

```java
@Transactional
public User getUser(Integer userId) {
    User user = userRepository.findById(userId).orElseThrow();

    Hibernate.initialize(user.getOrders());   // émet le SELECT maintenant

    return user;   // l'entité peut sortir de la session sans risque
}
```

La collection étant déjà peuplée au moment où l'entité quitte le service, la couche appelante peut la parcourir sans lever d'exception.

C'est un dépannage pratique, mais il faut être conscient de ses limites.

- **Ce n'est pas une solution au N+1**. Un `Hibernate.initialize()` par entité, dans une boucle, produit exactement les mêmes requêtes que le chargement paresseux qu'il remplace.

  ```java
  for (User user : users) {
      Hibernate.initialize(user.getOrders());   // ❌ toujours une requête par utilisateur
  }
  ```

- **Le chargement reste une requête séparée.** Là où `findByIdJoinOrder()` ramène l'utilisateur et ses commandes en une seule jointure, `Hibernate.initialize()` en émet systématiquement deux.
- **C'est une API Hibernate**, pas du JPA standard. L'équivalent portable est `Hibernate.isInitialized()` / un simple accès à la collection (`user.getOrders().size()`), avec la même mécanique.

> [!note] En pratique
> `Hibernate.initialize()` dépanne quand on ne maîtrise pas la requête d'origine — par exemple une entité remontée par un code tiers. Dès qu'on écrit soi-même la requête, une [méthode dédiée avec `JOIN FETCH`]({{< relref "join_fetch" >}}) reste préférable : une seule requête, et le plan de chargement lisible dans la signature.

[^1]: https://docs.hibernate.org/orm/7.2/javadocs/org/hibernate/LazyInitializationException.html