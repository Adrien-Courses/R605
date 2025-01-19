+++
archetype = "home"
title = "JDBC, JPA, Spring DATA JPA"
description = "IUT de Rodez JPA"
+++

La persistance des données est une problématique centrale dans le développement d'applications.  En Java, plusieurs outils et frameworks offrent des solutions pour gérer la persistance des données :
- [JDBC (Java Database Connectivity)]({{< relref "jdbc/index" >}}) : L'API de base fournie par Java pour interagir avec les bases de données relationnelles. Bien que bas niveau, JDBC offre un contrôle total sur les opérations SQL et reste un fondement de nombreuses solutions de persistance.  
- [JPA (Java Persistence API)]({{< relref "jpa/index" >}}) : Une spécification standardisée qui simplifie le mapping objet-relationnel (ORM) et automatise de nombreuses tâches liées à la persistance. JPA introduit un modèle orienté objet pour travailler avec les bases de données, réduisant considérablement la complexité par rapport à JDBC.
- [Spring Data JPA]({{< relref "enterprise_architecture_spring/index" >}}) : Une extension de JPA intégrée à l'écosystème Spring, conçue pour encore simplifier la gestion des données. Elle propose une abstraction supplémentaire qui minimise le code nécessaire pour les opérations CRUD et permet de se concentrer sur la logique métier.