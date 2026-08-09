+++
title = "Multi-Version Conc. Control"
description = "Le contrôle de concurrence multiversion (MVCC) : pourquoi il a été conçu pour dépasser les limites du 2PL, et ce qu'il apporte en débit transactionnel."
weight = 20
+++

> [!ressource] Ressource
> - [How does MVCC (Multi-Version Concurrency Control) work](https://vladmihalcea.com/how-does-mvcc-multi-version-concurrency-control-work/)

> [!affirmation] Affirmation
> Là où 2PL évitait les conflits, le MVCC lui met en place une stratégie de **détection** des conflits
 
## Pourquoi MVCC, défauts du 2PL ?
Lorsque vous utilisez [2PL]({{< relref "two_phase_locking" >}}), chaque lecture nécessite l'acquisition d'un verrou partagé, tandis qu'une opération d'écriture nécessite l'acquisition d'un verrou exclusif.
- *shared lock* bloque les écritures, mais permet à d'autres lecteurs d’acquérir le même verrou partagé
- *exclusive lock* bloque à la fois les lecteurs et les rédacteurs qui concourent pour le même verrou.

Bien que le verrouillage puisse fournir un plan de transactions, le coût des conflits de verrouillage peut nuire à la fois au temps de réponse des transactions et à l'évolutivité. 
- Le temps de réponse peut augmenter car les transactions doivent attendre que les verrous soient libérés, 
- et les transactions de longue durée peuvent également ralentir la progression des autres transactions simultanées. 

**=> Pour pallier ces lacunes, les fournisseurs de bases de données ont opté pour des mécanismes de contrôle de concurrence optimistes.** Si le 2PL empêche les conflits, le contrôle de concurrence multiversion (MVCC) utilise plutôt une stratégie de détection des conflits.

## Explication MVCC
1. Chaque enregistrement de la base de données possède un numéro de version.

2. Les lectures simultanées s'effectuent sur l'enregistrement ayant le numéro de version le plus élevé.

3. Les opérations d'écriture s'effectuent sur une copie de l'enregistrement, et non sur l'enregistrement lui-même.

4. Les utilisateurs continuent à lire l'ancienne version pendant que la copie est mise à jour.

5. Une fois l'opération d'écriture réussie, l'identifiant de version est incrémenté.

6. Les lectures simultanées suivantes utilisent la version mise à jour.

7. Lorsqu'une nouvelle mise à jour a lieu, une nouvelle version est à nouveau créée, et le cycle se poursuit.

![mvcc](mvcc_explained.png)

Que ce soit Reader1 ou Reader2 qui lise en premier, Reader1 lisant la clé=A obtiendra toujours la valeur=2 (séquence=101), tandis que Reader2 lisant la clé=A obtiendra la valeur=3 (séquence=102). S'il y a des lectures ultérieures sans spécification d'instantané, elles obtiendront les données les plus récentes. Le diagramme de séquence ci-dessous facilite la compréhension ;

| Étape | Action                                            | solde vu                      | Verrou                   | Résultat                         |
| ----- | ------------------------------------------------- | ----------------------------- | ------------------------ | -------------------------------- |
| Début | Valeur initiale                                   | 100                           | —                        | —                                |
| T1    | `BEGIN` → `SELECT WHERE id=1` | **100**                       | 🔓 pas de verrou         | lecture snapshot                 |
| T2    | `BEGIN` → `SELECT WHERE id=1` | **100**                       | 🔓 pas de verrou         | lecture snapshot                 |
| T1    | calcule 100 - 30 = 70                             | —                             | —                        | —                                |
| T2    | calcule 100 - 50 = 50                             | —                             | —                        | —                                |
| T1    | `UPDATE ... SET solde = 70 `       | 🔒 écrit une nouvelle version | tentative de mise à jour |                                  |
| T2    | `UPDATE ... SET solde = 50`       | 🔒 tentative concurrente      | ❌ conflit                |                                  |
| T1    | `COMMIT`                                          | OK                            | ✅ validé                 | `solde = 70`                     |
| T2    | `COMMIT`                                          | ❌ **échec : tuple modifié**   | ❌ annulé                 | erreur de conflit de mise à jour |


### Avantages

MVCC permet aux deux transactions de lire sans se bloquer, mais :
- Au moment où T2 veut modifier, elle se rend compte que la ligne a changé depuis sa lecture initiale
- Cela provoque une erreur de concurrence, `ERROR: could not serialize access due to concurrent update`
