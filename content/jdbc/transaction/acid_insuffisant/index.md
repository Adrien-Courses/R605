+++
title = "ACID insuffisant"
description = "Pourquoi ACID ne suffit pas : dès qu'une règle métier s'étale sur plusieurs transactions physiques, les garanties du SGBD ne protègent plus de rien."
weight = 30
+++

> [!Ressource] Ressource
> - [🚩  What is the Lost Update anomaly and the best way to fix it - Vlad Mihalcea](https://youtu.be/Qcpsx2INYdU)
> - [How to prevent lost updates in long conversations - Vlad Mihalcea](https://vladmihalcea.com/preventing-lost-updates-in-long-conversations/)

Les deux sections précédentes sur le [Contrôle de la concurrence]({{< relref "jdbc/transaction/isolation/controle_concurrence/index" >}}) et le [Niveau d'isolation]({{< relref "jdbc/transaction/isolation/niveau_isolation/index" >}}) permettent d'assurer une transaction ACID physique.
Mais que ce passe-t-il lorsque nous avons une logique métier transactionnelle répartie sur plusieurs transaction physique ?

## Pourquoi ACID n'est pas suffisant ?

![](https://youtu.be/Qcpsx2INYdU)

ACID garantit la cohérence technique des transactions au niveau de la base de données, mais cela ne suffit plus dès que l’on raisonne en transactions logiques métier, souvent réparties sur plusieurs interactions.
1. Une première transaction lit des données et les expose à l’utilisateur (=> une transaction)
2. L'utilisateur modifie ces données côté frontend, puis les renvoie au backend (=> une seconde transaction)

```
Onglet A charge la commande -> status = OPEN
Onglet B charge la commande -> status = OPEN

Onglet A valide -> status = VALIDATED
Onglet B annule -> status = CANCELED
```

**Ces deux étapes font partie d’une même intention métier, mais sont exécutées dans deux transactions techniques séparées.** Du point de vue du SGBD, tout est techniquement correct — chaque action est dans une transaction bien
isolée. Si nous ne mettons aucun contrôle en place c'est la dernière exécution qui fait foi



