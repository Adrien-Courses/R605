+++
title = "Isolation SQL/JDBC"
weight = 20
+++

Nous allons nous intéresser au principe d'isolation. Bien que cette partie soit complexe, elle reste essentielle pour maîtriser des concepts comme l'Optimistic Locking

> [!definition] Définition
> L'isolation garantit que l'exécution simultanée des transactions laisse la base de données dans le même état que celui qui aurait
été obtenu si les transactions avaient été exécutées séquentiellement.

Pour comprendre ce principe, je vous propose de regarder [le problème dʼaccès concurrent]({{< relref "acces_concurrent" >}}) à la base de données.
