+++
title = "DataSource"
weight = 30
+++

Pour le moment nous créons une connexion à la base de données via le `DriverManager`. Mais depuis la version 2.0 de l'API JDBC nous pouvons utiliser l'interface `DataSource`

> A factory for connections to the physical data source that this DataSource object represents. An alternative to the DriverManager facility, a DataSource object is the preferred means of getting a connection. An object that implements the DataSource interface will typically be registered with a naming service based on the Java™ Naming and Directory (JNDI) API. 

`DataSource` n'est qu'une interface, nous devons donc utiliser une classe. Et par chance, les fournisseurs de drivers JDBC sont dans l'obligation d'en fournir une.
- par exemple, le driver *MySQL ConnectorJ* fournit la classe `MySQLDataSource`

```java
MySQLDataSource dataSource = new MySQLDataSource();
dataSource.setUrl("url");
dataSource.setUser("username");
dataSource.setPassword("password");

Connection connection = dataSource.getConnection();
```

## Avantage DataSource
Nous ne sommes pas obligé de donnée l'url de connexion exacte qui est propre à chaque drivers :
- `jdbc:mysql://`
- `jdbc:postgres://`

Nous allons simplement donner le serveur, le port ou encore la table
```java
dataSource.setServeurName("localhost");
dataSource.setPort(3306);
dataSource.setDatabaseName("client");
...
```
