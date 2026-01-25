+++
title = "Lost Update"
weight = 10
+++

> [!ressource] Ressource
> - [A beginner’s guide to database locking and the lost update phenomena](https://vladmihalcea.com/a-beginners-guide-to-database-locking-and-the-lost-update-phenomena/)

> [!affirmation] Affirmation
> Peut être l'une des anomalies les plus connues et qu'on souhaite éviter à tout prix

## Explication du problème

![lost update](lost_update.png)

Dans cet exemple, Bob nʼest pas au courant
quʼAlice vient de modifier la quantité de 7 à 6,
donc sa mise à jour est écrasée par la
modification de Bob.

1. `SELECT qty FROM stock WHERE id=1`
2. On calcule en app
3. `UPDATE stock SET qty = …` alors une autre
transaction peut passer entre les deux → et
on écrase sa modification.

**Si les deux transactions visent à modifier les mêmes colonnes, la deuxième transaction écrasera la première**, d'un point de vue SQL aucun problème mais d'un point de vue logique métier ce n'est pas bon.

## Comment corriger ce problème ?

On peut prévenir d'un *Lost Update* en utilisant des verrous `SELECT ... FOR UPDATE`.

Ainsi, au lieu de faire un simple `SELECT`, Alice fait un `SELECT ... FOR UPDATE`. Ceci empêchera Bob de sélectionner en même temps, il doit attendre que le verrou soit libéré.

![lost_update_solution](lost_update_solution.png)