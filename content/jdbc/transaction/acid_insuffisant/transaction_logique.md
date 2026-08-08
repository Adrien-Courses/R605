+++
title = "Transactions Logique"
weight = 10
+++

> [!definition] Définition
> Une transaction logique est une unité de travail au niveau de l'application qui peut s'étendre sur plusieurs transactions physiques (base de données). En d'autres termes c'est un cas métier complet et logiquement transactionnel mais qui sera exécuté par plusieurs transactions physiques

## Exemple 1

![acid ne suffit pas](acid_insuffisant.png)


1. Alice demande l'affichage d'un produit.

2. Le produit est récupéré dans la base de données et renvoyé au navigateur.

3. Alice demande une modification du produit.

4. Comme Alice n'a pas conservé de copie de l'objet précédemment affiché, elle doit le recharger une nouvelle fois.

5. Le produit est mis à jour et enregistré dans la base de données.

6. La mise à jour du traitement par lots a été perdue et Alice ne s'en rendra jamais compte.


Étant donné que la transaction logique Alice englobe **deux requêtes Web distinctes, chacune étant associée à une transaction de base de données distincte, sans mécanisme de contrôle de concurrence supplémentaire**, même le niveau d'isolation le plus élevé (i.e SERIALIZABLE) ne peut empêcher le phénomène de perte de mise à jour.

## Limite des niveaux d’isolation
Le niveau d’isolation — y compris [SERIALIZABLE]({{< relref "jdbc/transaction/isolation_level/lequel_choisir#serializable" >}}) — **ne garantit la cohérence qu'à l’intérieur d’une transaction unique**.
Dès lors qu’une logique métier s’étend sur plusieurs transactions :
- L’isolation ne peut plus empêcher les modifications concurrentes
- Les hypothèses faites lors de la première lecture peuvent devenir invalides
- La cohérence métier n’est plus garantie automatiquement

Si on reprend le schéma du dessus, avec des transaction de niveau `SERIALIZABLE`, nous voyons bien que les verrous ne servent à rien

1. `GET product/1`
```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT stock FROM produit WHERE id = 1;
COMMIT; -- fermeture de la transaction
```

2. Un batch UPDATE , mais comme la
transaction 1 est finie il nʼy a pas de verrou.
Le batch UPDATE et commit sans aucun
problème

3. `POST GET product/1/buy` ouverture dʼune **nouvelle** transaction
```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
UPDATE produit SET stock = stock - 1 WHERE id = 1;
COMMIT;
```

## Exemple 2

Un autre exemple, pour illustrer ce même problème

![acid_insuffisant](acid_insuffisant2.png)

- Les deux utilisateurs ont vu le même état initial "OPEN", mais ont pris deux décisions opposées.
- Ils agissent dans deux transactions indépendantes, peut-être même en SERIALIZABLE.
- Comme chaque UPDATE est valide individuellement, la base les accepte.
- Le dernier commit gagne → lʼautre modification est écrasée sans alerte.

> [!affirmation] Affirmation
> SERIALIZABLE fonctionne tant que la logique métier est contenue dans une seule transaction. Dès qu’elle est fragmentée dans le temps et entre plusieurs transactions, le niveau d’isolation ne suffit plus à assurer une logique transactionnelle correcte.

## Solution
> Pushing database transaction boundaries into the application layer **requires an application-level concurrency control**. To ensure application-level repeatable reads we need to preserve state across multiple user requests, but in the absence of database locking, we need to rely on an application-level concurrency control. [^2]

Une solution consiste à déléguer le travail à la couche applicative, par exemple 
- en faisant du [Pessimistic Locking]({{< relref "jdbc/transaction/acid_non_suffisant/pessimistic_locking/index" >}}) (app stateful).
- ou en faisant du [Optimistic locking]({{< relref "jdbc/transaction/acid_non_suffisant/optimistic_locking/index" >}}) (app stateless).


[^2]: [https://vladmihalcea.com/preventing-lost-updates-in-long-conversations/](https://vladmihalcea.com/preventing-lost-updates-in-long-conversations/) - Conclusion 