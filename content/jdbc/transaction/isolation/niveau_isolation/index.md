+++
title = "Niveaux d'isolation"
weight = 30
+++

> [!ressource] Ressource
> - [Database Isolation Levels](https://bytebytego.com/guides/what-are-database-isolation-levels/)
> - [A beginner’s guide to transaction isolation levels in enterprise Java - Vlad Mihalcea](https://vladmihalcea.com/a-beginners-guide-to-transaction-isolation-levels-in-enterprise-java/)


> [!affirmation] Affirmation
> - 2PL ou MVCC sont des outils utilisés par le SGBD pour mettre en œuvre les niveaux d’isolation définis par le standard SQL.
> - => Ce sont les niveaux d’isolation qui définissent si une transaction bénéficie d'une isolation totale ou partielle.


## Définition
> [!definition] Définition
> L'isolation de la base de données permet à une transaction de s'exécuter comme s'il n'y avait aucune autre transaction en cours d'exécution simultanément.

L'isolation est garantie par [MVCC]({{< relref "mvcc" >}}) ou les [Locks]({{< relref "two_phase_locking" >}})



## Exemple (avant de rentrer dans les explications)

Les niveaux d’isolation SQL (ANSI) :
- `READ UNCOMMITTED`
- `READ COMMITTED`
- `REPEATABLE READ`
- `SERIALIZABLE`

=> Ils décrivent ce qui est possible/interdit : dirty reads, non-repeatable reads, phantom reads, etc.

### Exemple 

| Niveau d'isolation | Mécanismes utilisés (exemples)                | Garanties                                 |
| ------------------ | --------------------------------------------- | ----------------------------------------- |
| `READ COMMITTED`   | MVCC ou 2PL léger                             | dirty read évité, mais pas le lost update |
| `REPEATABLE READ`  | MVCC ou 2PL                                   | lecture stable, mais phantom possible     |
| `SERIALIZABLE`     | 2PL strict ou MVCC détection de conflits | aucune anomalie                           |


=> Chaque niveau d'isolation [autorise certaines anomalie, voici pourquoi]({{< relref = "jdbc/transaction/isolation/niveau_isolation/pourquoi_anomalies" >}})
















