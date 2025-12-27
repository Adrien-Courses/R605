+++
title = "ACID non suffisant"
weight = 30
+++

> [!Ressource] Ressource
> - [🚩  What is the Lost Update anomaly and the best way to fix it - Vlad Mihalcea](https://youtu.be/Qcpsx2INYdU)
> - [How to prevent lost updates in long conversations - Vlad Mihalcea](https://vladmihalcea.com/preventing-lost-updates-in-long-conversations/)

Les deux sections précédentes sur le [Contrôle de la concurrence]({{< relref "jdbc/transaction/controle_concurrence/index" >}}) et le [Niveau d'isolation]({{< relref "jdbc/transaction/isolation_level/index" >}}) permettent d'assurer une transaction ACID au sens base de données.

## Pourquoi ACID n'est pas suffisant ?
ACID garantit la cohérence technique des transactions au niveau de la base de données, mais cela ne suffit plus dès que l’on raisonne en transactions logiques métier, souvent réparties sur plusieurs interactions.
1. Une première transaction lit des données et les expose à l’utilisateur (=> une transaction)
2. ’utilisateur modifie ces données côté frontend, puis les renvoie au backend (=> une seconde transaction)

**Ces deux étapes font partie d’une même intention métier, mais sont exécutées dans deux transactions techniques séparées.**

> [!definition] Définition
> Une transaction logique est une unité de travail au niveau de l'application qui peut s'étendre sur plusieurs transactions physiques (base de données). En d'autre terme c'est un cas métier complet et logiquement transactionnel mais qui sera execute par plusieurs transaction physique

### Exemple concret

![acid ne suffit pas](acid_insuffisant.png)


1. Alice demande l'affichage d'un produit.

2. Le produit est récupéré dans la base de données et renvoyé au navigateur.

3. Alice demande une modification du produit.

4. Comme Alice n'a pas conservé de copie de l'objet précédemment affiché, elle doit le recharger une nouvelle fois.

5. Le produit est mis à jour et enregistré dans la base de données.

6. La mise à jour du traitement par lots a été perdue et Alice ne s'en rendra jamais compte.


Étant donné que la transaction logique Alice englobe **deux requêtes Web distinctes, chacune étant associée à une transaction de base de données distincte, sans mécanisme de contrôle de concurrence supplémentaire**, même le niveau d'isolation le plus élevé (i.e SERIALIZABLE) ne peut empêcher le phénomène de perte de mise à jour.

## Limite des niveaux d’isolation
Le niveau d’isolation — y compris [SERIALIZABLE]({{< relref "jdbc/transaction/isolation_level/lequel_choisir#serializable" >}}) — **ne garantit la cohérence que à l’intérieur d’une transaction unique**.
Dès lors qu’une logique métier s’étend sur plusieurs transactions :
- L’isolation ne peut plus empêcher les modifications concurrentes
- Les hypothèses faites lors de la première lecture peuvent devenir invalides
- La cohérence métier n’est plus garantie automatiquement

> [!affirmation] Affirmation
> SERIALIZABLE fonctionne tant que la logique métier est contenue dans une seule transaction. Dès qu’elle est fragmentée dans le temps et entre plusieurs transactions, le niveau d’isolation ne suffit plus à assurer une logique transactionnelle correcte.

## Solution
> Pushing database transaction boundaries into the application layer **requires an application-level concurrency control**. To ensure application-level repeatable reads we need to preserve state across multiple user requests, but in the absence of database locking, we need to rely on an application-level concurrency control. [^2]

Une solution consiste à délégué le travail à la couche applicative, par exemple en faisant du [Optimistic locking décrit dans la page suivante]({{< relref "optimistic_locking" >}}).


[^2]: [https://vladmihalcea.com/preventing-lost-updates-in-long-conversations/](https://vladmihalcea.com/preventing-lost-updates-in-long-conversations/) - Conclusion 