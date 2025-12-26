+++
title = "Caching"
weight = 20
+++

> [!definition] Définition
> Le *Statement Caching* est une technique qui permet de réutiliser l’exécution des requêtes préparées sans avoir à les recompiler / réinterpréter à chaque appel.

Il existe deux niveaux de mise en cache :
- [Côté serveur (Database-side)]({{< relref "server_side" >}})
- [Côté client (JDBC driver-side)]({{< relref "client_side" >}})