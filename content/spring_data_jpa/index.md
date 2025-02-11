+++
title = "Spring Data JPA"
weight = 40
+++

> [!ressource] Ressource
> https://docs.spring.io/spring-data/jpa/reference/jpa.html

Dans ce cours nous avons étudié l'API JPA, au travers des différents cours :
- Cycle de vie d'une entité
- Définition d'une entité
- Association / Mapping
- L'API Criteria et les Projection

Puis dans le TP5, nous avons commencé à structurer un projet en définissant :
- un DAO Générique
- de la pagination
- des filtres de recherche

## Pourquoi Spring Data JPA ?
> Implementing a data access layer for an application can be quite cumbersome. Too much boilerplate code has to be written to execute the simplest queries. Add things like pagination, auditing, and other often-needed options, and you end up lost.

L'ensemble de ces concepts vont nous permettre de comprendre plus rapidement Spring Data JPA qui simplifie considérablement l'accès aux bases de données en réduisant le boilerplate code et en offrant des fonctionnalités avancées comme
- pagination et tri intégrés
- Requêtes avancées via JPQL, SQL natif, Criteria API et Specifications
- Gestion des transactions automatique

Spring Data JPA est donc une abstraction de JPA (elle même une abstraction de JDBC)

![springdatajpa.png](springdatajpa.png)

> [!affirmation] Note
> Dans cette section, nous nous concentrerons uniquement sur les apports de Spring Data JPA