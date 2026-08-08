+++
title = "Les anomalies"
weight = 30
+++

> [!note] Note
> Avant d'étudier cette sous-section sur les anomalies, je vous invite à lire la page d'introduction sur les [niveaux d'isolation]({{< relref "
jdbc/transaction/isolation/niveau_isolation/index" >}}) et la page [Pourquoi autoriser des anomalies]({{< relref "jdbc/transaction/isolation/niveau_isolation/pourquoi_anomalies" >}})

- Lecture sale (dirty read) : lire une donnée non encore validée par une autre transaction.
- Lecture non répétable : lire deux fois la même donnée avec un résultat différent.
- Mise à jour perdue (lost update) : une modification écrase une autre sans le savoir
- Lecture fantôme (phantom) : une nouvelle ligne apparaît entre deux lectures avec la même requête.

Nous allons expliquer le *Lost Update*, les autres anomalies seront illustrée dans les niveaux d'isolation