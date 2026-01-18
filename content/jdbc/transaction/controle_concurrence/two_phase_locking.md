+++
title = "Two-Phase Locking"
weight = 10
+++

> [!ressource] Ressource
> - [How does the 2PL (Two-Phase Locking) algorithm work](https://vladmihalcea.com/2pl-two-phase-locking/)
> - [How two phase locking prevents lost updates](https://linisnil.com/posts/how-two-phase-locking-prevents-lost-updates/)

## Type de Lock (verrous)
Chaque système de base de données possède sa propre hiérarchie de verrouillage, mais les types les plus courants restent les suivants :
- *shared (read) lock*, empêcher l'écriture d'un enregistrement tout en autorisant les lectures simultanées; le verrou est partagé entre les lecteurs
- *exclusive (write) lock*, interdit à la fois les opérations de lecture et d'écriture

## Two-phase Locking

![two_phase_locking](two_phase_locking.png)

1. Alice et Bob sélectionnent tous les deux un enregistrement de type *post*, acquérant chacun un verrou partagé (*shared lock*) sur cet enregistrement, afin de garantir la cohérence de la lecture et d’empêcher toute modification concurrente pendant l’accès aux données

2. Lorsque Bob tente de mettre à jour l’entrée *post*, son instruction est bloquée par le gestionnaire de verrous (*Lock Manager*), car Alice détient toujours un verrou partagé sur cette ligne de la base de données.

3. Ce n’est qu’après la fin de la transaction d’Alice et la libération de tous ses verrous que Bob peut reprendre son opération de mise à jour.

4. La mise à jour de Bob provoque une montée de verrou (*lock upgrade*) : le verrou partagé est remplacé par un verrou exclusif (*exclusive lock*), ce qui empêche toute autre opération concurrente de lecture ou d’écriture.

5. Alice démarre une nouvelle transaction et exécute une requête `SELECT` sur la même entrée *post*, mais cette instruction est bloquée par le gestionnaire de verrous, car Bob possède un verrou exclusif sur cet enregistrement.

6. Après la validation (*commit*) de la transaction de Bob, tous les verrous sont libérés et la requête d’Alice peut reprendre ; elle obtient alors la valeur la plus récente de cet enregistrement en base de données.


## Deadlock
L'utilisation du verrouillage pour contrôler l'accès aux ressources partagées est susceptible d'entraîner des *deadlocks*, et le planificateur de transactions ne peut à lui seul empêcher leur apparition. Par exemple 

T1
- lock(X) sur la ligne A
- veut lock(X) sur la ligne B → bloquée

T2
- lock(X) sur la ligne B
- veut lock(X) sur la ligne A → bloquée

Résultat
- T1 attend B détenu par T2
- T2 attend A détenu par T1

![deadlock](deadlock.png)

## Problèmes du 2PL
Je vous invite à lire la partie suivante [MVCC - Pourquoi MVCC, défauts du 2PL ?]({{< relref "jdbc/transaction/mvcc#pourquoi-mvcc-défauts-du-2pl-" >}})