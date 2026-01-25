+++
title = "Contrôle de la concurrence"
weight = 20
+++

> [!ressource] Ressource
> - [🚩 Youtube : Transactions and Concurrency Control Patterns - Vlad Mihalcea](https://youtu.be/onYjxRcToto)
> - [From Chaos to Order: The Importance of Concurrency Control within the Database](https://blogs.oracle.com/maa/from-chaos-to-order-the-importance-of-concurrency-control-within-the-database-2-of-6)

Dans la page [précédente]({{< relref "acces_concurrent" >}}) nous avons évoqué le problème de l'accès concurrent à la donnée.

## Solutions
Pour gérer les conflits de données, plusieurs mécanismes de contrôle de la concurrence ont été développés au fil des ans.
Il existe essentiellement deux stratégies pour gérer les collisions de données :
- **Eviter les conflits (*Conflict Avoidance*)** : par exemple, le [verrouillage en deux phases]({{< relref "two_phase_locking" >}}), nécessite un verrouillage pour contrôler l'accès aux ressources partagées;
- **Détecter les conflits (*Conflict Detection*)** par exemple, le [contrôle de concurrence multiversions]({{< relref "mvcc" >}}), offre une meilleure concurrence, au prix d'un assouplissement de la sérialisabilité et de l'acceptation éventuelle de diverses anomalies de données.
