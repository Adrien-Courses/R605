+++
title = "Lequel choisir ?"
weight = 10
+++

Chaque [niveau d'isolation]({{< relref "jdbc/transaction/isolation_level/index" >}}) a ces avantages et inconvénients.

## Serializable
Les SGBD n’utilisent pas SERIALIZABLE par défaut pour une raison simple mais fondamentale : le coût en performance, en concurrence et en complexité est trop élevé pour la majorité des usages.

SERIALIZABLE garantit que :

> l’exécution concurrente est équivalente à une exécution strictement séquentielle.

Pour y parvenir, un SGBD doit :
- bloquer fortement ([2PL strict]({{< relref "jdbc/transaction/two_phase_locking" >}})), ou
- détecter et annuler des transactions (SSI, OCC)

=> **Dans les deux cas, le parallélisme réel diminue.** car
- Verrous conservés jusqu’au commit
- Verrous de plage / prédicat
- Blocage des écritures et parfois des lectures

Donc :
- files d’attente
- latence accrue
- risque de famine

## Read Committed
La plupart des SGBD choisissent READ COMMITTED comme niveau d'isolation par défaut car :
- il permet d'avoir des performances élevés
- tout en évitant les anomalies fatales comme le *dirty writes* et le *dirty reads* (mais les autres anomalie peuvent compromettre les données)

![read commited](read_commited.png)

## Lequel choisir ?
Au final ca dépend de cas métier. 

Quelques exemples dans l'article suivant [Understanding Isolation Levels in Transactions with Java Spring](https://medium.com/@a.r.m.monesan_9577/understanding-isolation-levels-in-transactions-with-java-spring-c414b43b6df1)