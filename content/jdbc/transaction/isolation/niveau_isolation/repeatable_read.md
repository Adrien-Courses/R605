+++
title = "Repeatable Read"
weight = 40
+++

> [!definition] Définition
> Avec REPEATABLE READ quand on lit deux fois la même ligne dans une même transaction on obtient la même valeur

| Niveau d’isolation | Lecture sale *(Dirty read)* | Lecture non répétable *(Non-repeatable read)* | Fantôme *(Phantom)* | Mise à jour perdue *(Lost update)* |
| :----------------: | :-------------------------: | :-------------------------------------------: | :-----------------: | :--------------------------------: |
|  READ UNCOMMITTED  |         ❌ Autorisée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisée            |
|   READ COMMITTED   |          ✅ Empêchée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisée            |
|   REPEATABLE READ  |          ✅ Empêchée         |                   ✅ Empêchée                  |     ❌ Autorisée     |             ✅ Empêchée             |

## Illustration

![repeatable_read1](repeatable_read1.png)

## Problème 1
1. résout le problème des lectures sales + lecture non répétable 

2. MAIS, Bob à écrasée silencieusement la valeur d'Alice (**lost update**)

En effet, suivant l'implémentation du REPEATABLE READ on prévient ou pas le lost update. Certain SGBD vont faire un `SELECT ... FOR UPDATE` avec REPEATABLE READ => pas de lost update

![repeatable_read1](repeatable_read2.png)

## Problème 2
Néanmoins, nous avons un second problème

![repeatable_read1](repeatable_read3.png)

- Dans une même transaction, nous obtenons deux résultats différents; *phantom read*