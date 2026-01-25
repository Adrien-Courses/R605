+++
title = "Conclusion"
weight = "50"
+++

> [!ressource] Ressource
> - [Pessimistic vs Optimistic Locking](https://newsletter.systemdesigncodex.com/p/pessimistic-vs-optimistic-locking)
> - [Pessimistic locking vs Serializable transaction isolation level](https://stackoverflow.com/questions/47441027/pessimistic-locking-vs-serializable-transaction-isolation-level)
> - [TP Isolation et Locking]({{< relref "td_tp/isolation_locking/tp1" >}})

Dans cette longue section dédiée aux transactions nous avons
- revue la notion [d'atomicité]({{< relref "jdbc/transaction/atomicite/" >}}) en SQL et en JAVA avec l'instruction `setAutoCommit(true/false)`
- puis étudier en détail la notion [d'isolation]({{< relref "jdbc/transaction/isolation/" >}})

Cette notion d'isolation nous a permis de comprendre comment on résout [l'accès concurrent à la donnée]({{< relref "jdbc/transaction/isolation/controle_concurrence/" >}})
- tout d'abord les SGBD implémente des mécanismes de Two-Phase Locking et de MVCC
- mais, pour des raisons de performance nous ne souhaitons pas forcément les mettre en oeuvre complètement
- ainsi, plusieurs [niveaux d'isolation]({{< relref "jdbc/transaction/isolation/niveau_isolation/" >}}) sont définis autorisant certaines [anomalies]({{< relref "jdbc/transaction/isolation/anomalies/" >}})

Mais malgré ce mécanisme, il nous reste le problème des transaction logiques, où [ACID n'est pas suffisant]({{< relref "jdbc/transaction/acid_insuffisant/" >}})
- une [solution naive (et fausse)]({{< relref "jdbc/transaction/acid_insuffisant/fausse_solution" >}}) de contrôler uniquement dans le code Java ne suffit pas
- nous devons soit implémenter une approche [pessimiste]({{< relref "jdbc/transaction/acid_insuffisant/pessimistic_locking/" >}}), mais qui va provoquer des latences
- soit implémenter une approche [optimiste]({{< relref "jdbc/transaction/acid_insuffisant/optimistic_locking/" >}}) qui consiste à détecter les conflits via `@version`