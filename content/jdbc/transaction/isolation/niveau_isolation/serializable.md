+++
title = "Serializable"
description = "Le niveau d'isolation SERIALIZABLE illustré pas à pas : la garantie la plus forte du standard SQL, et le prix à payer en parallélisme."
weight = 50
+++

> [!definition]
> Niveau le plus élevé. Il garantit que lʼexécution concurrente des transactions produit un résultat équivalent à celui quʼon obtiendrait si les transactions avaient été exécutées séquentiellement, lʼune après lʼautre(cʼest-à-dire de façon sérialisée).

| Niveau d’isolation | Lecture sale *(Dirty read)* | Lecture non répétable *(Non-repeatable read)* | Fantôme *(Phantom)* | Mise à jour perdue *(Lost update)* |
| :----------------: | :-------------------------: | :-------------------------------------------: | :-----------------: | :--------------------------------: |
|  READ UNCOMMITTED  |         ❌ Autorisée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisée            |
|   READ COMMITTED   |          ✅ Empêchée         |                  ❌ Autorisée                  |     ❌ Autorisée     |             ❌ Autorisée            |
|   REPEATABLE READ  |          ✅ Empêchée         |                   ✅ Empêchée                  |     ❌ Autorisée     |             ✅ Empêchée             |
|    SERIALIZABLE    |          ✅ Empêchée         |                   ✅ Empêchée     

## Illustration

![serializable](serializable.png)