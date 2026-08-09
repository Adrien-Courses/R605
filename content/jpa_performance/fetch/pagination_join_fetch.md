+++
title = "Pagination + JOIN FETCH"
weight = 60
+++

> [!ressource] Ressource
> - [Vlad Mihalcea - How to fix HHH000104 firstResult/maxResults specified with collection fetch](https://vladmihalcea.com/fix-hibernate-hhh000104-entity-fetch-pagination-warning-message/)

Voici le piège le plus spectaculaire du chapitre, parce que **rien ne plante**. Le code s'exécute, les résultats sont corrects, les tests passent. Et l'application s'effondre en production.

## La situation

Vous avez deux bonnes pratiques, apprises séparément dans ce cours :

- pour éviter le [N+1]({{< relref "jpa_deeper/fetch/index" >}}) : faire un `JOIN FETCH` ;
- pour éviter de tout charger : **paginer**.

Vous les combinez :

```java
List<Commande> page = em.createQuery("""
        SELECT c FROM Commande c
        JOIN FETCH c.lignes
        ORDER BY c.date DESC
        """, Commande.class)
    .setFirstResult(0)
    .setMaxResults(10)   // je ne veux que 10 commandes
    .getResultList();
```

Vous obtenez bien 10 commandes. Mais dans les logs, discrètement :

```
WARN HHH90003004: firstResult/maxResults specified with collection fetch;
applying in memory
```

## Ce qui se passe réellement

Relisez la fin du message : **`applying in memory`**.

Le problème vient du produit cartésien décrit dans la page [`MultipleBagFetchException`]({{< relref "limites_orm/multiple_bag_fetch" >}}). Avec un `JOIN FETCH` sur une collection, une commande de 5 lignes occupe **5 lignes** dans le `ResultSet` SQL. Un `LIMIT 10` en SQL ne renverrait donc pas 10 commandes, mais 2 commandes et un bout de la troisième — un résultat incohérent.

Hibernate ne peut donc pas traduire votre pagination en `LIMIT`. Il fait la seule chose qui préserve la correction du résultat :

1. il exécute la requête **sans aucun `LIMIT`** ;
2. la base lui renvoie **toutes** les commandes avec toutes leurs lignes ;
3. il reconstruit tous les objets en mémoire ;
4. et il **jette** tout sauf les 10 premiers.

> [!definition] ⚠️ Le vrai danger
> Le résultat est **fonctionnellement correct**. C'est précisément ce qui rend le bug si dangereux : aucun test fonctionnel ne le détectera. Sur les 50 commandes de votre base de TP, personne ne voit rien. Sur les 2 millions de commandes de la production, l'application tombe en `OutOfMemoryError` — ou monopolise la base pendant 40 secondes pour afficher un tableau de 10 lignes.

C'est l'illustration parfaite du thème de ce chapitre : **l'abstraction masque le coût réel**. Rien dans le code Java ne laisse deviner que `setMaxResults(10)` a cessé de faire son travail.

## Les solutions

### Solution 1 (recommandée) : la requête en deux temps

On sépare le problème : d'abord **quelles** commandes (paginable en SQL, car une commande = une ligne), ensuite **leur contenu**.

```java
// 1. Paginer sur les identifiants uniquement → un vrai LIMIT en SQL
List<Long> ids = em.createQuery("""
        SELECT c.id FROM Commande c
        ORDER BY c.date DESC
        """, Long.class)
    .setFirstResult(0)
    .setMaxResults(10)
    .getResultList();

// 2. Charger ces 10 commandes avec leurs lignes, sans pagination
List<Commande> page = em.createQuery("""
        SELECT DISTINCT c FROM Commande c
        JOIN FETCH c.lignes
        WHERE c.id IN :ids
        ORDER BY c.date DESC
        """, Commande.class)
    .setParameter("ids", ids)
    .getResultList();
```

Deux requêtes, mais toutes deux exécutées **entièrement** par la base, sans filtrage en mémoire. C'est d'ailleurs la stratégie qu'utilise Spring Data JPA lorsqu'on combine un `@EntityGraph` et un `Pageable`.

### Solution 2 : `@BatchSize`

On abandonne le `JOIN FETCH`, on pagine normalement (vrai `LIMIT`), et on laisse Hibernate charger les collections par paquets :

```java
@OneToMany(mappedBy = "commande")
@BatchSize(size = 20)
private List<LigneCommande> lignes = new ArrayList<>();
```

### Solution 3 : ne pas charger d'entités

Si la page ne sert qu'à **afficher** un tableau, une [projection DTO]({{< relref "jpa_deeper/projection" >}}) résout le problème à la racine : sans collection à charger, la pagination redevient un simple `LIMIT`.

## La leçon

> [!affirmation] Comment se protéger de ce type de bug
> Ce piège n'est détectable que si vous **regardez le SQL généré**. Prenez l'habitude, dès vos TP :
> - d'activer les logs SQL (`hibernate.show_sql`, ou mieux : `spring.jpa.properties.hibernate.generate_statistics=true`) ;
> - de **lire les WARN** d'Hibernate, qui signalent souvent exactement ce genre de dégradation silencieuse ;
> - de tester sur un volume de données réaliste, pas sur 20 lignes.
