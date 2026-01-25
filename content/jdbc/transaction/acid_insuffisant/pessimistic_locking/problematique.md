+++
title = "Est-ce la bonne approche ?"
weight = 20
+++

Si on met systématique un verrou, alors toute autre transaction voulant lire en mode FOR UPDATE ou écrire sur
cette même ligne sera :
- bloquée jusquʼà la fin de la transaction (commit/rollback)
- ou rejetée si un timeout/détection de deadlock survient


En effet, si pour un besoin de statistique sur le stock nous avons besoin de `SELECT stock FROM produit WHERE id = 1` alors nous devrons attendre que le verrou soit levé, même si le traitement tier (ici statistique) est non
critique.

> [!affirmation] Affirmation
> Pessimistic locking would not help us in this case since Aliceʼs read and the write happen in different HTTP requests and database
transactions. (https://vladmihalcea.com/optimistic-vs-pessimistic-locking/)

=> Trouver une autre solution que les verrous : [optimistic locking]({{< relref "jdbc/transaction/acid_insuffisant/optimistic_locking/index" >}})