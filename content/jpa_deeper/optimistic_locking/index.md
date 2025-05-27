+++
title = "Optimistic locking"
weight = 50
+++

> [!ressource] Ressource
> - [DDD Aggregates: Optimistic Concurrency](https://www.jamesmichaelhickey.com/optimistic-concurrency/)
> - https://vladmihalcea.com/optimistic-locking-version-property-jpa-hibernate/

Note, ci-dessous nous allons coder avec Spring Data JPA pour limiter les détails techniques.

## Le problème
> [!ressource] Ressource
> - https://github.com/Adrien-Courses/R605-TD-Spring-optimistic-locking
*Que se passe-t-il si nous modifions en même temps une même ressource ?*

Supposons la règle métier suivante "Une commande ne peut pas avoir plus d'un item", mais à un moment donné on ajoute en même un item à une même commande, si nous ne gérons rien alors l'invariant ne sera pas respecté.

Pour simuler notre cas :
1. Lancer une première requête HTTP avec un `Thread.sleep()` de 10 secondes après avoir ajouter l'item à la commande
2. En même temps lancer une seconde requête mais sans attente sur le Thread

```java
@Transactional
public void addItem(UUID id) throws InterruptedException, IllegalAccessException {
    Orders ts = repository.findById(id).orElseThrow();
    ts.addOrderLine("first item");
    repository.save(ts);
    Thread.sleep(10000); // le commit n'a pas lieu lors du save() mais lorsqu'on sort de la méthode, on peut donc mettre le sleep() ici
}

@Transactional
public void addItemBis(UUID id) throws IllegalAccessException {
    Orders ts = repository.findById(id).orElseThrow();
    ts.addOrderLine("second item");
    repository.save(ts);
}

// Class Order
public void addOrderLine(String name) throws IllegalAccessException {
    if(items.size() < 1) {
        // On peut ajouter au max une ligne
        OrderItem oi = new OrderItem();
        oi.setName(name);
        items.add(oi);
        oi.setOrder(this);
        lastUpdate = LocalDateTime.now();
    } else {
        throw new IllegalAccessException("vous ne pouvez pas avoir deux items");
    }
}
```

1. `addItem()` est appelé, il récupère la commande id=1 et ajoute une ligne
2. `addItemBis()` est appelé, il récupère la commande id=1, ajoute la ligne et dedans on vérifie si items.size() == 0; c'est bien le cas
3. `addItemBis()` se finie, on a donc un item dans notre commande
4. `addItem()` se finie, on a un deuxième item dans notre commande => pas bon au niveau métier

## Optimistic locking
> [!ressource] Ressource
> - https://github.com/Adrien-Courses/R605-TD-Spring-optimistic-locking (branche partie-2)

Cela permet à chaque opération d'obtenir la version actuelle du magasin de données. Il peut s'agir d'une base de données relationnelle, d'un document ou d'une source d'événements. Peu importe.

Ensuite, la version est testée par rapport au magasin de données à chaque fois que l'agrégat est réécrit. Si la version n'est pas synchronisée (c'est-à-dire si quelqu'un d'autre a écrit dans le magasin pendant que l'opération était en cours de traitement), l'opération échoue.

- Il faut ajouter une colonne `@Version` qui sera géré par Hibernate
- Lors de la requête SQL la version sera vérifié et si elle ne correspond pas à celle récupéré lors du `findy` une exception est levée

### Explication
1. `addItem()` est appelé, il récupère la commande id=1 et ajoute une ligne
   - La version est celle stocké en base, disons version=1

2. `addItemBis()` est appelé, il récupère la commande id=1, ajoute la ligne et dedans on vérifie si items.size() == 0; c'est bien le cas
    - Ceci génère la trace suivante, la version initiale était 1, lors de l'insertion on regarde si la version est toujours 1 et c'est bien le cas
    - Puis, la version est incrémentée

```
Hibernate: 
    update
        orders 
    set
        last_update=?,
        version=? 
    where
        id=? 
        and version=?
2025-05-27T20:04:29.291+02:00 TRACE 72904 --- [nio-4545-exec-3] org.hibernate.orm.jdbc.bind              : binding parameter [1] as [TIMESTAMP] - [2025-05-27T20:04:29.268629]
2025-05-27T20:04:29.292+02:00 TRACE 72904 --- [nio-4545-exec-3] org.hibernate.orm.jdbc.bind              : binding parameter [2] as [BIGINT] - [2]
2025-05-27T20:04:29.292+02:00 TRACE 72904 --- [nio-4545-exec-3] org.hibernate.orm.jdbc.bind              : binding parameter [3] as [UUID] - [123e4567-e89b-12d3-a456-426614174000]
2025-05-27T20:04:29.292+02:00 TRACE 72904 --- [nio-4545-exec-3] org.hibernate.orm.jdbc.bind              : binding parameter [4] as [BIGINT] - [1]
```

4. `addItem()` se finie
   - On vérifie s'il existe toujours la ligne avec la version du point *1.*, c'est-à-dire `version=1`
  
```
Hibernate: 
    update
        orders 
    set
        last_update=?,
        version=? 
    where
        id=? 
        and version=?
2025-05-27T20:10:16.882+02:00 TRACE 76665 --- [nio-4545-exec-2] org.hibernate.orm.jdbc.bind              : binding parameter [1] as [TIMESTAMP] - [2025-05-27T20:10:06.858578]
2025-05-27T20:10:16.883+02:00 TRACE 76665 --- [nio-4545-exec-2] org.hibernate.orm.jdbc.bind              : binding parameter [2] as [BIGINT] - [2]
2025-05-27T20:10:16.884+02:00 TRACE 76665 --- [nio-4545-exec-2] org.hibernate.orm.jdbc.bind              : binding parameter [3] as [UUID] - [123e4567-e89b-12d3-a456-426614174000]
2025-05-27T20:10:16.886+02:00 TRACE 76665 --- [nio-4545-exec-2] org.hibernate.orm.jdbc.bind              : binding parameter [4] as [BIGINT] - [1]
```

Ce n'est plus le cas, la version a été modifiée par le point deux à `version=2`, cela veut donc dire qu'il y a eu un accès concurrent, donc une exception est levée

`org.hibernate.StaleObjectStateException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect) : [com.example.timesheet.Orders#123e4567-e89b-12d3-a456-426614174000]`