+++
title = "Dynamic Web App"
weight = 6
+++

## Prérequis
- Nous allons utilisé TomEE, téléchargeable ici [TomEE Webprofile ZIP](https://www.apache.org/dyn/closer.cgi/tomee/tomee-10.0.0-M3/apache-tomee-10.0.0-M3-webprofile.zip)
   - TomEE embarque nativement une CDI implémentation
- Jax-RS est une spécification pour implémenter les services REST en Java
  - Jersey est une implémentation très populaire (GlassFish et Payara)
  - Apache CXF est une implémentation propulsée par TomEE donc nous utiliserons celle-ci 

## Créer une Dynamic webapp avec Maven
> [!ressource] Ressources
> - [How to Create Dynamic Web Project using Maven in Eclipse?](https://crunchify.com/how-to-create-dynamic-web-project-using-maven-in-eclipse/)

- Ou en ligne de commande `mvn archetype:generate -DgroupId=com.example -DartifactId=my-webapp -DarchetypeArtifactId=maven-archetype-webapp -DinteractiveMode=false`
- Puis importer le projet dans Eclipse

### Dépendances Maven
- `jakarta.api` qui embarque l'ensemble de la spécification JEE
    ![jakarta-ee](images/jakarta-ee.png)
    - TomEE est un Jakarta EE-compatible application server (il implémente l'ensemble de la spécification)
- `org.apache.tomee` est l'implémentation JAX-RS privilégiée par TomEE
- `hibernate` et le `connector` qui sont respectivement une implémentation de JPA et un driver

```xml
<dependencies>
    <!-- JEE Api -->
    <dependency>
        <groupId>org.apache.tomee</groupId>
        <artifactId>jakartaee-api</artifactId>
        <version>10.0-M2</version>
        <scope>provided</scope>
    </dependency>

    <!-- JAX-RS implémentation -->
    <dependency>
        <groupId>org.apache.tomee</groupId>
        <artifactId>openejb-cxf-rs</artifactId>
        <version>10.0.0-M4-SNAPSHOT</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.hibernate.orm</groupId>
        <artifactId>hibernate-core</artifactId>
        <version>6.6.1.Final</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
</dependencies>
```

### web.xml
Nous signifions que les requêtes à partir de http://[hôte]/[contexte racine]/api/ seront gérées par JAX-RS.

> The `/WEB-INF/web.xml` file is the Web Application Deployment Descriptor of your application. This file is an XML document that defines everything about your application that a server needs to know : servlets and other components like filters or listeners, initialization parameters, container-managed security constraints, resources, welcome pages, etc.

Avec TomEE l'écriture du `web.xml` est très simple
```xml
<!-- /webapp/WEB-INF/web.xml -->
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
         metadata-complete="false"
         version="2.5">

  <display-name>OpenEJB REST Example</display-name>
</web-app>
```

### persistance.xml et resources.xml
> [!ressource] Ressources
> - [TomEE - DataSource Configuration](https://tomee.apache.org/latest/docs/datasource-config.html)

Le fichier `persistance.xml` ou on précise le provider ainsi que ces propriétés.
- Le provider va permettre de créer automatiquement dès le lancement de l'application les tables.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence" version="2.2">
    <persistence-unit name="fr.adriencaubel.jpa-jee-enterprise-architecture">
        <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
        
        <properties>
            <property name="hibernate.show_sql" value="true" />
            <property name="hibernate.dialect" value="org.hibernate.dialect.MySQL8Dialect"/>
            <property name="hibernate.hbm2ddl.auto" value="create-drop"/>
            
            <property name="openjpa.jdbc.SynchronizeMappings" value="buildSchema(ForeignKeys=true)"/>
        </properties>
        
    </persistence-unit>
</persistence>
```

Puis le fichier `resources.xml` qui définit la configuration TomEE.

```xml
<tomee>
  <Resource id="jdbc/jpa-jee-architecture" type="javax.sql.DataSource">
    JdbcDriver = com.mysql.cj.jdbc.Driver
    JdbcUrl = jdbc:mysql://localhost:3307/jpa-jee-architecture
    UserName = root
    Password = password
    JtaManaged = true
  </Resource>
</tomee>
```