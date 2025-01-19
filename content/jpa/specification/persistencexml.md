+++
title = "persistence.xml"
weight = 10
+++

> [!ressource] Ressources
> - [Décrire une unité de persistence dans un fichier persistence.xml](https://youtu.be/A51OKCrpMOI?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Le fichier persistence.xml contient la configuration de base pour le mapping notamment en fournissant les informations sur la connexion à la base de données à utiliser. Il est stocké dans  `resources/META-INF/persitence.xml`
- L'ensemble des classes des entités qui compose l'unité de persistance peut être spécifié explicitement dans le fichier persistence.xml ou déterminé dynamiquement à l'exécution par recherche de toutes les classes possédant une annotation @javax.persistence.Entity.
- Des propriétés génériques connues par JPA (url de connexion, user et password)
- Des propriétés spécifiques à l'ORM choisi (ici Hibernate)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence version="2.2"
             xmlns="http://xmlns.jcp.org/xml/ns/persistence" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd">
    <persistence-unit name="monapp-unit" transaction-type="RESOURCE_LOCAL">
        <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>

		<class>fr.adriencaubel.jpaexample.core.entity.Client</class>

        <properties>
            <!-- Configuring JDBC properties -->
            <property name="javax.persistence.jdbc.driver" value="com.mysql.jdbc.Driver" />
            <property name="javax.persistence.jdbc.url" value="jdbc:mysql://localhost:3306/monapp?useSSL=false" />
            <property name="javax.persistence.jdbc.user" value="user" />
            <property name="javax.persistence.jdbc.password" value="password" />

            <!-- Hibernate properties -->
            <property name="hibernate.show_sql" value="true" />
            <property name="hibernate.dialect" value="org.hibernate.dialect.MySQL8Dialect" />
            <property name="hibernate.hbm2ddl.auto" value="validate" />

            <!-- Configuring Connection Pool -->
            <property name="hibernate.dbcp.initialSize" value="5" />

            <!-- Set the cache provider -->
            <property name="hibernate.cache.provider_class" value="org.hibernate.cache.NoCacheProvider"/>
        </properties>
    </persistence-unit>
</persistence>
```

Toutes ces propriétés sont regroupés dans une notion de `persitence-unit` qui est propre à JPA. Avec JPA, une application peut avoir plusieurs persitence-units et chacune étant associée à un `provider` (e.g. `HibernatePersistenceProvider`).

Ainsi, on pourrait avoir 3 classes gérées par Hibernate et 2 autres classes gérées par EclipseLink.

## Exploiter le persistence.xml
Pour exploiter un persistence-unit JPA doit interpréter le fichier de configuration via la classe `EntityManagerFactory`

```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("monapp-unit");
```
