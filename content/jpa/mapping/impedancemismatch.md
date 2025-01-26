+++
title = "Impedance mismatch"
weight = 5
+++

> [!ressource] Ressources
> - [What is object/relational mapping? - The object/relational mismatch](https://hibernate.org/orm/what-is-an-orm/)
> - [Problème de l'impedance mismatch en mapping objet relationnel](https://youtu.be/3euGF3YaN2Y?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

> [!definition] Définition
> The object/relational impedance mismatch refers to differences in how entities are represented in the relational data model, compared to how they’re represented in an object-oriented programming language. 

Avant d'aller plus loin, regardons quelles sont les problématiques soulevées par ce *Mapping O/R*. 

- Dans le monde Objet, nous avons des relations d'héritage, des listes, des maps, etc etc
- De l'autre côté en relationnel nous pouvons représenter des relations entre nos différentes tables, 1:1, 1:n ou encore n:m

Par exemple on peut se demander comment de l'héritage en OO va-t-il être transformer en BDD ? Et c'est au programmeur de l'application qu'il incombe de résoudre ces problèmes. Heureusement, nous pouvons tirer parti d'un [ORM (Object-Relational Mapping)](https://gayerie.dev/epsi-b3-orm/javaee_orm/intro.html) qui, comme l’indique leur nom, permettent de créer une correspondance entre un modèle objet et un modèle relationnel de base de données