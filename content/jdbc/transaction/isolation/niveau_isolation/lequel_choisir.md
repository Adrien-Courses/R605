+++
title = "Lequel choisir ?"
weight = 60
+++

Chaque niveau d'isolation a ses avantages et inconvénients.

## Serializable
Pour des raisons de performance, les SGBD n’utilisent pas `SERIALIZABLE`. Pour la majorité des usages, il est tolérable d'avoir avec *Phatom Read*. En effet, `SERIALIZABLE` garantit que :

> l’exécution concurrente est équivalente à une exécution strictement séquentielle.

Pour y parvenir, un SGBD doit :
- bloquer fortement ([2PL strict]({{< relref "two_phase_locking" >}})), ou
- détecter et annuler des transactions (SSI, OCC)

=> **Dans les deux cas, le parallélisme réel diminue.** car
- Verrous conservés jusqu’au commit
- Verrous de plage / prédicat
- Blocage des écritures et parfois des lectures


## Read Committed ou Repeatable Read
La plupart des SGBD choisissent `READ COMMITTED` ou `REPEATABLE READ` comme niveau d'isolation par défaut. Suivant le SGBD

Par exemple, dans la documentation de MySQL [17.7.2.1 Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html) nous pouvons lire

> This is the default isolation level for InnoDB. Consistent reads within the same transaction read the snapshot established by the first read. This means that if you issue several plain (nonlocking) SELECT statements within the same transaction, these SELECT statements are consistent also with respect to each other. See Section 17.7.2.3, “Consistent Nonlocking Reads”. 

Ici, MySQL nous dit qu'ils garantissent le principe de *lecture répétable* (tous les autres SELECT simples dans la même transaction liront la même version des lignes, même si d’autres transactions ont fait des UPDATE/INSERT/DELETE entre temps). Pour ce faire il se base sur des lecture snapshot (voir MVCC)

>  For locking reads (SELECT with FOR UPDATE or FOR SHARE), UPDATE, and DELETE statements, locking depends on whether the statement uses a unique index with a unique search condition, or a range-type search condition.
> - For a unique index with a unique search condition, InnoDB locks only the index record found, not the gap before it.
> - For other search conditions, InnoDB locks the index range scanned, using gap locks or next-key locks to block insertions by other sessions into the gaps covered by the range. For information about gap locks and next-key locks, see Section 17.7.1, “InnoDB Locking”. 

Pour les UPDATE et DELETE, il utilise les verrous

## Lequel choisir ?
Au final, ça dépend des cas métier. 

- Quelques autres dans l'article suivant [Understanding Isolation Levels in Transactions with Java Spring](https://medium.com/@a.r.m.monesan_9577/understanding-isolation-levels-in-transactions-with-java-spring-c414b43b6df1)
