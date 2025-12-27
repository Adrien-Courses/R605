+++
title = "Multi-Version Conc. Control"
weight = 20
+++

> [!ressource] Ressource
> - [How does MVCC (Multi-Version Concurrency Control) work](https://vladmihalcea.com/how-does-mvcc-multi-version-concurrency-control-work/)

## Pourquoi MVCC, défauts du 2PL ?
Lorsque vous utilisez [2PL]({{< relref "two_phase_locking" >}}), chaque lecture nécessite l'acquisition d'un verrou partagé, tandis qu'une opération d'écriture nécessite l'acquisition d'un verrou exclusif.
- *shared lock* bloque les écritures, mais permet à d'autres lecteurs d’acquérir le même verrou partagé
- *exclusive lock* bloque à la fois les lecteurs et les rédacteurs qui concourent pour le même verrou.

Bien que le verrouillage puisse fournir un plan de transactions, le coût des conflits de verrouillage peut nuire à la fois au temps de réponse des transactions et à l'évolutivité. 
- Le temps de réponse peut augmenter car les transactions doivent attendre que les verrous soient libérés, 
- et les transactions de longue durée peuvent également ralentir la progression des autres transactions simultanées. 

**=> Pour pallier ces lacunes, les fournisseurs de bases de données ont opté pour des mécanismes de contrôle de concurrence optimistes.** Si le 2PL empêche les conflits, le contrôle de concurrence multiversion (MVCC) utilise plutôt une stratégie de détection des conflits.

### Explication MVCC
1. Chaque enregistrement de la base de données possède un numéro de version.

2. Les lectures simultanées s'effectuent sur l'enregistrement ayant le numéro de version le plus élevé.

3. Les opérations d'écriture s'effectuent sur une copie de l'enregistrement, et non sur l'enregistrement lui-même.

4. Les utilisateurs continuent à lire l'ancienne version pendant que la copie est mise à jour.

5. Une fois l'opération d'écriture réussie, l'identifiant de version est incrémenté.

6. Les lectures simultanées suivantes utilisent la version mise à jour.

7. Lorsqu'une nouvelle mise à jour a lieu, une nouvelle version est à nouveau créée, et le cycle se poursuit.

![mvcc](mvcc_explained.png)

Que ce soit Reader1 ou Reader2 qui lise en premier, Reader1 lisant la clé=A obtiendra toujours la valeur=2 (séquence=101), tandis que Reader2 lisant la clé=A obtiendra la valeur=3 (séquence=102). S'il y a des lectures ultérieures sans spécification d'instantané, elles obtiendront les données les plus récentes. Le diagramme de séquence ci-dessous facilite la compréhension ; le code source mermaid est




