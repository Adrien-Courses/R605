+++
title = "Read Committed"
weight = 30
+++

> [!definition] Définition
> Avec READ COMMITTED on ne lit que les valeurs commit

| Niveau d’isolation | Lecture sale *(Dirty read)* | Lecture non répétable *(Non-repeatable read)* | Fantôme *(Phantom)* | Mise à jour perdue *(Lost update)* |
| :----------------: | :-------------------------: | :-------------------------------------------: | :-----------------: | :--------------------------------: |
|  READ UNCOMMITTED  |         ❌ Autorisée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisée            |
|   READ COMMITTED   |          ✅ Empêchée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisée            |


## Illustration

![read_commited](read_commited.png)

## Problème
1. résout le problème des lectures sales (dirty read) ✅

2. MAIS, dans la même transaction de Bob, nous avons eu deux valeurs différentes (***non-repeatable read***)


C'est un problème parce que Bob peut faire des calculs ou des décisions en supposant que les données ne changent pas :
- calculs de stock
- facturation
- logique métier (ex : “si qty >= 10 alors…”)

et obtenir un résultat incohérent car la donnée change “en plein milieu”.