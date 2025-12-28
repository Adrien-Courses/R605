+++
title = "Stratégies de propagation"
weight = 20
+++

> [!ressource] Ressource
> - [Transaction Propagation Explained in Detail !](https://medium.com/@javatechie/transaction-propagation-explained-in-detail-8c3a5c39fbb2)

On déclare `autocommit=false` car notre transaction logique utilise un ou plusieurs DAO[^1] pour accomplir une logique métier. 
Dans l'exemple ci-dessous, lorsqu'on réaliser une commande (*order*) nous allons créer une nouvelle commande avec ces items, puis mettre à jour les réductions 

![declarative transaction](declarative_trx.png)

Par défaut, tout sera exécuté dans une même est uniquement transaction. Mais vous avez la possibilité de choisir la stratégie de propagation, par exemple 3 transactions différentes.

## Les stratégies de propagation

> [!ressource] Ressource
> - [Understanding transaction pitfalls](https://web.archive.org/web/20170213005145/http://www.ibm.com/developerworks/library/j-ts1/index.html)

| **Propagation**     | **Description**                                                                 |
|---------------------|---------------------------------------------------------------------------------------------|
| `REQUIRED`          | Démarre une transaction si aucune n’est en cours (comportement par défaut).                |
| `REQUIRES_NEW`      | Suspend la transaction actuelle et en démarre une nouvelle.                                |
| `SUPPORTS`          | Utilise la transaction en cours si elle existe, sinon exécute sans transaction.            |
| `NOT_SUPPORTED`     | Suspend la transaction actuelle et exécute sans transaction.                               |
| `MANDATORY`         | Nécessite une transaction déjà existante, sinon une exception est levée.                   |
| `NESTED`            | Exécute dans une sous-transaction si une transaction existe, sinon en démarre une nouvelle.|
| `NEVER`             | Doit s'exécuter sans transaction ; échoue s’il y en a une.

### REQUIRED vs REQUIRES_NEW
> **The REQUIRES_NEW transaction attribute always starts a new transaction when the method is started**, whether or not an existing transaction is present. [...] When you use the REQUIRES_NEW transaction attribute, if an existing transaction context is present, the current transaction is suspended and a new transaction started. Once that method ends, the new transaction commits and the original transaction resumes. 


```java
// L'exemple utilise est avec Spring pour simplifier
@Transactionnal(propagation=Propagation.REQUIRED)
public TradeData placeTrade(TradeData trade) throws Exception { 
    try { 
        insertTrade(trade); 
        updateAcct(trade); 
        return trade; 
    } catch (Exception up) { //log the error throw up; 
    } 
}

@Transactional(propagation=Propagation.REQUIRES_NEW)
public long insertTrade(TradeData trade) throws Exception {...}
 
@Transactional(propagation=Propagation.REQUIRES_NEW)
public void updateAcct(TradeData trade) throws Exception {...}
```

1. `placeTrade()` démarre une transaction
2. `insertTrade()` démarre une nouvelle et indépendante transaction
3. `updateAcct()` démarre une nouvelle et indépendante transaction

=> Si une erreur ce produit dans `updateAcct()`, alors il y a aura un rollback uniquement de cette transaction. L'insertion du trade, lui ne sera pas rollback.

Si à la place on déclare `propagation=Propagation.REQUIRED` (ou rien car par défaut), alors nous n'avons qu'une seule et unique transaction.


[^1]: Data Access Objet, est un patron de conception qui abstrait l'accès la base de données. Il encapsule les opérations de persistance comme `findAll()` ou `findById()`, lesquelles ouvrent une connexion, exécutent une requête, et retournent les résultats. Ainsi, la couche métier (service) peut interagir avec les données sans gérer directement les opérations JDBC