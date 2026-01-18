+++
title = "Isolation vs PLock vs OLock"
weight = "40"
+++

> [!ressource] Ressource
> - [Pessimistic vs Optimistic Locking](https://newsletter.systemdesigncodex.com/p/pessimistic-vs-optimistic-locking)
> - [Pessimistic locking vs Serializable transaction isolation level](https://stackoverflow.com/questions/47441027/pessimistic-locking-vs-serializable-transaction-isolation-level)
> - [TP Isolation et Locking]({{< relref "td_tp/isolation_locking/tp1" >}})

>  [!affirmation] Affirmation
>Lorsqu'on a un accès concurrent à la donnée, nous avons plusieurs solutions pour le régler :
>- soit utiliser les [locks optimistes]({{< relref "jdbc/transaction/acid_non_suffisant/optimistic_locking/index" >}}) ou [pessimistes]({{< relref "jdbc/transaction/acid_non_suffisant/pessimistic_locking" >}})
>- soit utiliser un [niveau d'isolation]({{< relref "jdbc/transaction/isolation_level/" >}}) plus strict

- Isolation levels sont renforcés par la base de données directement (et pas Java)
- O/P Locking quant à eux sont directement liés à l'application

## Exemple

L'article [Spring Transaction Best Practices](https://vladmihalcea.com/spring-transaction-best-practices/) montre un exemple concret d'accès concurrent à une donnée et évoque plusieurs solutions pour le résoudre

> To prevent the Lost Update anomaly, there are various solutions we could try:
> - we could use optimistic locking, as explained in this [article](https://vladmihalcea.com/optimistic-locking-version-property-jpa-hibernate/)
> - we could use a pessimistic locking approach by locking Alice’s account record using a FOR UPDATE directive, as explained in this [article](https://vladmihalcea.com/how-does-database-pessimistic-locking-interact-with-insert-update-and-delete-sql-statements/)
> - we could use a stricter isolation level

### Optimistic locking
> [!definition] Définition
>  Il part du principe que « les conflits sont rares ». Au lieu de verrouiller les données à l'avance, il permet à plusieurs utilisateurs d'accéder et même de modifier les mêmes données simultanément, et ne vérifie les conflits qu'au moment de la validation.

Consisterait à ajouter une [version]({{< relref "jdbc/transaction/acid_non_suffisant/optimistic_locking" >}}) sur l'account. Lors de l'update si la version n'est plus la même alors `OptimisticLockException`

Il est souvent utilisé dans les API REST; lorsqu'on récupère une information dans une requête et qu'on met à jour dans une autre requête. Par exemple deux personnes récupèrent un client `GET /client/id` en parallèle et le mettent à jour `PATCH /client/id`

### Pessimistic locking
> [!definition] Définition
> Il part du principe que des conflits sont susceptibles de se produire, il verrouille donc les données de manière préventive avant toute mise à jour.

C'est la solution que nous avons présentée dans [Pessimistic Locking]({{< relref "jdbc/transaction/acid_non_suffisant/pessimistic_locking" >}}) où nous mettons un [verrou exclusif]({{< relref "jdbc/transaction/controle_concurrence/two_phase_locking#type-de-lock-verrous" >}}) pour empêcher les lectures et écritures en parallèle

### Stricter isolation level
Elle consiste à s'appuyer sur les [niveaux d'isolation]({{< relref "jdbc/transaction/isolation_level/#4-niveaux" >}}). 