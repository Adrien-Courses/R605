+++
title = "Java Persistence API"
weight = 20
+++

> [!ressource] Ressource
> [Jakarta Persistence - Documentation](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2)
> [Jakarta Persistence - Javadoc](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/package-summary)

JPA est simplement une API (d'où le nom Java Persistence API) qui nécessite une implémentation pour être utilisée. Une analogie serait l'utilisation de JDBC qui est une API pour accéder aux bases de données, mais vous avez besoin d'une implémentation (un driver JAR ) pour pouvoir vous connecter à une base de données.

![jpa implementation](jpa/specification/images/jpa_impl.png)

Ainsi les principaux *providers* JPA sont Hibernate et EclipseLink

## Concrètement JPA
- Les correspondances se font via des annotations JPA dans les
classes
- JPA s’appuie sur JDBC pour communiquer avec une base de
données.

![JPA schema](jpa/specification/images/jpa_schema.png)
