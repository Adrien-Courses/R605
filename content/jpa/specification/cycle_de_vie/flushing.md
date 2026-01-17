+++
title = "Flushing & Dirty Checking"
weight = 30
+++

> [!ressource] Ressources
> - [The anatomy of Hibernate dirty checking mechanism](https://vladmihalcea.com/the-anatomy-of-hibernate-dirty-checking/)
> - [The JPA and Hibernate first-level cache](https://vladmihalcea.com/jpa-hibernate-first-level-cache/)
> - [Flushing - doc hibernate](https://docs.hibernate.org/orm/5.2/userguide/html_single/chapters/flushing/Flushing.html)

Une session hibernate agit comme un cache de premier niveau. L'ensemble des entités `MANAGED` sont stockées dans une `Map`. Ainsi lorsqu'une requête arrive on vérifie en premier si l'entité est présente dans le cache (et on la retourne si oui) avant de faire une requête à la base de données
- Cela contribue à réduire le nombre de connexions à la base de données
- de persister en batch les changements
- => ne pas dégrader les performances

Cependant, le problème suivant se pose : "comment assurer que les données entre le cache et la base de données sont correctement synchronisée" ?

## Flush mode
> [!definition] Définition
> Flushing (vidage) is the process of synchronizing the state of the persistence context with the underlying database

La stratégie de *flush* est définie par le paramètre `flushMode` de la session Hibernate en cours d'exécution. Bien que JPA ne définisse que deux stratégies de vidage (`AUTO` et `COMMIT`), Hibernate propose un éventail beaucoup plus large de types de vidage :


- `ALWAYS` : Flushes the Session before every query.
- `AUTO` : This is the default mode and it flushes the Session only if necessary.
- `COMMIT` : The Session tries to delay the flush until the current Transaction is committed, although it might flush prematurely too.
- `MANUAL` : The Session flushing is delegated to the application, which must call Session.flush() explicitly in order to apply the persistence context changes.

## Dirty Checking
> [!definition] Définition
> Dirty Checking (vérification des modification) is the mechanism by which Hibernate automatically detects changes made to persistent entities and synchronizes those changes with the database

![dirty checking](dirtychecking.png)

- Le Dirty Checking prend un snapshot du dernier état connu de l'entité. Cela se produit généralement lorsqu'un objet persistant est chargé pour la première fois à partir de la base de données. 
- Pendant la session, si une propriété de l'entité est modifiée, cette entité devient *Dirty* (sale). - Plus tard, lors du *flushing* (vidage) du contexte de persistance, Hibernate vérifie chaque entité *dirties* (sales) associée à la session par rapport au snapshot créé précédemment et la met à jour dans la base de données.

L'ensemble du processus est automatique. Hibernate crée des requêtes SQL et met à jour les lignes correspondantes dans la base de données.

### Attention aux modifications externes
Si un tiers modifie une valeur directement en base de données, le **dirty checking** ne peut pas le détecter.  
Hibernate ne surveille pas les changements effectués en dehors du **contexte de persistance**.

```java
Article a1 = em.find(Article.class, 1); // managed
```

- À ce stade, `a1` est dans l’état `MANAGED`.
- Il est stocké dans le cache de premier niveau (Persistence Context).
- Sa valeur correspond à un instantané du moment du chargement.

Supposons qu’un autre système modifie ensuite le prix de l’article en base.  Ce changement est externe à Hibernate. Il n’est donc pas reflété automatiquement côté Java.

Plus tard, on accède à nouveau à l’identifiant `id=1`
```java
Article a2 = em.find(Article.class, 1);
```

Dans ce cas, Hibernate ne refait pas de requête SQL. L’entité est récupérée depuis le cache de premier niveau. On obtient donc l’ancien prix, obsolète.

=> il faut mettre en place des mécanismes de cohérence. Par exemple, via un contrôle de version avec [Optimistic Update]({{< relref "jdbc/transaction/acid_non_suffisant/optimistic_locking/optimistic_locking_exemple" >}})