+++
title = "Read Uncommitted"
weight = 20
+++

> [!definition] Définition
> Avec READ UNCOMMITED on peut lire une donnée qu’une autre transaction a modifiée mais pas encore commit.

Nous commençons notre étude avec le niveau d'isolation le moins élevé.

| Niveau d’isolation | Lecture sale *(Dirty read)* | Lecture non répétable *(Non-repeatable read)* | Fantôme *(Phantom)* | Mise à jour perdue *(Lost update)* |
| :----------------: | :-------------------------: | :-------------------------------------------: | :-----------------: | :--------------------------------: |
|  READ UNCOMMITTED  |         ❌ Autorisée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisé


## Illustration

![read_uncommited](read_uncommited.png)


## Problème

`READ UNCOMMITTED` permet de lire une valeur qui nʼa jamais officiellement existé. On a une **Lecture sale** (dirty read)