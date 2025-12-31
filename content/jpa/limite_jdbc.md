+++
title = "Limite de JDBC"
weight = 10
+++

Bien que JDBC offre une API commune de bas niveau qui cache les spécificité de chaque SGBD, nous rencontrons quand même les difficultés suivantes

- Est verbeuse
- JDBC impose de connaître le moteur de la base de données cible, or chaque SGBD peut offrir quelques variantes ou fonctionnalités complémentaires qui ne peuvent pas être utilisé avec JDBC. Par exemple, le mot clé `LIMIT` n'est pas un standard SQL mais une spécificité de MySQL.

=> Dans ce contexte, le recours à un ORM (Object-Relational Mapping) apparaît comme une solution pertinente. Un ORM permet d’établir une correspondance systématique entre le modèle objet de l’application et le schéma relationnel de la base de données. Il offre ainsi un niveau d’abstraction plus élevé, en masquant les détails liés à l’écriture des requêtes SQL et à la gestion des interactions avec la base de données.

![limite.png](limite.png)

JPA est une spécification, elle décrit des interfaces. Hibernate est une des implémentations de JPA qui fait donc office d'ORM.