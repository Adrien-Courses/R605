+++
title = "Mise en place"
weight = 10
+++

> [!ressource] Ressource
> https://docs.spring.io/spring-data/jpa/reference/repositories/create-instances.html#jpa.java-config

## Dépendance Maven
Nous avons besoin d'inclure la dépendance suivante

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

Comme son nom l'indique c'est un *starter* c'est-à-dire une dépendance qui embarque d'autres dépendances. En effet, nous y retrouvons notamment
- `javax.persistence:javax.persistence-api` : l'API JPA
- `org.hibernate:hibernate-core` : une implémentation de JPA
- `org.springframework.data:spring-data-jpa` : qui fournit un ensemble de features
  - `JpaRepository`, `CrudRepository`, `PagingAndSortingRepository` classes
  - Repository Query Methods
  - JPQL & Criteria API support
  - Transaction management


## Configuration de application.properties
Avec JPA nous définissions un fichier `persistence.xml`, nous pouvons le conserver mais dans des applications simples nous utilisons uniquement le fichier `application.properties` qui reprend les propriétés primaires
```
# Configuration de la base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/ma_base
spring.datasource.username=postgres
spring.datasource.password=admin
spring.datasource.driver-class-name=org.postgresql.Driver

# Hibernate DDL Auto (create, update, validate, none)
spring.jpa.hibernate.ddl-auto=update

# Activer les logs SQL
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```