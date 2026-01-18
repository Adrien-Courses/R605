+++
title = "TP1 Isolation et Locking"
weight = 10
+++

> [!ressource] Ressource
> [https://github.com/Adrien-Courses/R605-TP-IsolationLocking-PhantomRead](https://github.com/Adrien-Courses/R605-TP-IsolationLocking-PhantomRead)

## 1. Télécharger et lancer le projet

- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

## Consigne
Un système de réservation de places pour un événement. 
Modèle simplifié :
- Event - id - capacity (ex: 100) 
- Reservation - id - event_id - user_id 

Règle métier : **Le nombre de réservations pour un événement ne doit jamais dépasser sa capacité.**

### 1. Exécuter le test
Il n'y a qu'une seule place de disponible, mais deux threads concurrents réservent la place.

- Executer le test
- Et vérifier qu'il échoue (2 places réservées au lieu d'une)

### 2. Quel est le bug concurrent présent dans ce code ?
- Dirty read ? 
- Non-repeatable read ? 
- Phantom read ? 
- Lost update ?

<!--
Dirty read ❌
On ne lit pas de données non validées (en général interdit par défaut).

Non-repeatable read ❌
Aucune ligne existante n’est modifiée entre deux lectures.

Lost update ❌
Il n’y a pas de mise à jour concurrente sur une même ligne.



Le bug ne vient pas de l’écriture,
il vient du fait que la décision métier est prise à partir d’un COUNT non verrouillé.

-->

Et pourquoi une transaction seule ne suffit-elle pas ici ?


### 4. Proposer des solutions
- Quelles sont les solutions possibles ?