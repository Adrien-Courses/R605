+++
title = "Lazy Exception"
weight = 10
+++

> [!ressource] Ressource
> [LazyInitializationException – What it is and the best way to fix it](https://thorben-janssen.com/lazyinitializationexception/)

La section [précédente]({{< relref "jpa_deeper/fetch/index" >}}) va nous permettre de comprendre l'exception `LazyInitializationException`

## Définition

> [!definition] Javadoc LazyInitializationException
> Indicates an attempt to access unfetched data outside the context of an open stateful Session. [^1]

Cette erreur se produit lorsque qu'hibernate essaye de charger une relation `LAZY` en dehors de son contexte de persistence.

## Rappels
Par défaut, beaucoup de relations sont en chargement paresseux
```java
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;
```

Cela signifie :
- Hibernate ne charge pas les orders immédiatement
- Il attend qu'on appelle explicitement la relation (faire un `.getOrders()`)
    - pour rappel, ceci va exécuter une nouvelle requêtes SQL `SELECT * FROM Orders WHERE fk_id_x = y`

### Mais, que lorsque la session est ouverte

Hibernate ne peut charger une relation lazy que si :
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

[^1]: https://docs.hibernate.org/orm/7.2/javadocs/org/hibernate/LazyInitializationException.html