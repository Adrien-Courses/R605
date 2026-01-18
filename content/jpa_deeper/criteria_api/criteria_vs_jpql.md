+++
title = "Criteria vs JPQL"
weight = 30
+++

> [!ressource] Ressource
> https://vladmihalcea.com/hibernate-sqm-semantic-query-model/

## Hibernate 3, 4 et 5
> Criteria API génère simplement un JPQL, qu'Hibernate analyse conformément à sa grammaire HQL afin de générer la requête SQL sous-jacente spécifique à la base de données.

![criteria vs jpql](criteria_jpql.png)

## Hibernate 6 
> JPQL est compilé en SQM, et l'API Criteria crée immédiatement les nœuds SQM, ce qui améliore son efficacité.

![criteria vs jpql](criteria_jpql2.png)