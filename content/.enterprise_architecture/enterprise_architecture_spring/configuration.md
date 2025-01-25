+++
title = "Configuration"
weight = 20
+++

Si vous lancer votre projet vous obtenez l'erreur ci-dessous. En effet, en ayant préciser la dépendances `spring-data` nous devons maintenant configurer l'accès à notre base de données

```
***************************
APPLICATION FAILED TO START
***************************

Description:

Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.

Reason: Failed to determine a suitable driver class


Action:

Consider the following:
	If you want an embedded database (H2, HSQL or Derby), please put it on the classpath.
	If you have database settings to be loaded from a particular profile you may need to activate it (no profiles are currently active).
```

## application.properties
Pour résoudre cette erreur de démarrage, nous devons configurer l'accès à la base de données dans le fichier `application.properties` (ou `application.yml`).

```properties
# Configuration MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/nom_de_votre_base
spring.datasource.username=votre_username
spring.datasource.password=votre_password

# Configuration JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

On retrouve les propriétés que nous avions définit dans les fichiers `persistance.xml` mais préfixées de `spring`.
