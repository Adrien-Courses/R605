+++
title = "Spring Initializr"
weight = 10
+++

Spring Initializr (disponible sur [start.spring.io](https://start.spring.io/)) est un outil web qui permet de générer rapidement la structure d'un projet Spring :
- Choisir le type de projet (Maven/Gradle)
- Spécifier les métadonnées (Group, Artifact, etc.)
- Ajouter les dépendances souhaitées

## Dépendances
1. Spring Web (spring-boot-starter-web)
   - Permet de créer des API REST
   - Inclut Apache Tomcat comme serveur embarqué par défaut
   - Gère les annotations @RestController, @RequestMapping, etc.
   - Inclut la gestion des requêtes HTTP et la sérialisation JSON

2. Spring Data JPA (spring-boot-starter-data-jpa)
    - Fournit l'intégration avec JPA (Java Persistence API)
    - Permet l'utilisation des repositories (@Repository)
    - Gère la persistance des entités (@Entity)
    - Inclut Hibernate comme implémentation JPA par défaut

3. MySQL Driver (mysql-connector-java)
   - Driver JDBC officiel pour MySQL
   - Permet la connexion et la communication à la base de données MySQL

![spring initiazr](../images/spring_initializr.png)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

![dépendances spring](../images/dependances.png)

## Structure du projet
Vous pouvez télécharger le projet et l'ouvrir avec Eclipse
- application.properties permet de configurer notre projet Spring
- `JpaSpringEnterpriseArchitectureApplication` contient une méthode `main()` pour lancer notre application
  - > For servlet stack applications, the spring-boot-starter-web includes Tomcat by including spring-boot-starter-tomcat, but you can use spring-boot-starter-jetty instead.

![Structure projet eclipse](../images/structure_projet_eclipse.png)
