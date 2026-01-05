+++
title = "Parent/Child side"
weight = 4
+++

En base de données relationnelle, la *foreign-key* est associé au *child side* seulement. Le *parent side*, n'a aucune connaissance de qu'une relation parent-enfant existe.

Ainsi, d'un point de vue base de données nous avons uniquement une relation unidirectionnelle (*child side FK* référence *parent side PK*)

Mais comme nous allons le voir dans la [page suivante]({{< relref "jpa/mapping_associations/unidirectional_bidirectional" >}}), en Java nous avons la possibilité de créer une relation bidirectionnelle (sans affecter le modèle de base de données)

