+++
title = "Pool de connexions"
weight = 40
+++

> [!ressource] Ressource
> [TP3 JDBC - Pool Connection]({{< relref "td_tp/jdbc/tp3" >}})

![pool connexion](jdbc/images/poolconnection.png)

L'ouverture d'une connexion est un processus coûteux et long. Le pool maintient des connexions ouvertes entre les requêtes, évitant ainsi le coût d'établissement d'une nouvelle connexion à chaque fois.

Les requêtes suivantes peuvent réutiliser une connexion existante, ce qui permet un gain de performances significatif.

Plusieurs librairies existent pour gérer les pool de connexions
- Apache DBCP (Database Connection Pool)
- c3p0
- HikariCP

A partir de ce moment, nous n'allons plus utiliser la classe `MySqlDataSource` mais une datasource plus générique `BasicDataSource` de Apache DBCP (nous utilisons cette librairie). Apache DBCP sera capable de devenir le driver à utiliser via l'url


```java
BasicDataSource dataSource = new BasicDataSource();
dataSource.setUrl("url");
dataSource.setUsername("username");
dataSource.setPassword("password");

Connection connection = dataSource.getConnection(); // Crée une connection et l'ajoute dans le pool
...
connection.close(); // La connection ne sera pas fermée MAIS rendu dans le pool (la marque disponible)
```

Si nous avons besoin de deux connexion
- soit la première connexion est marquée comme disponible alors on l'utilise et nous n'aurons qu'une connexion dans notre pool
- soit elle n'est pas disponible et une nouvelle connexion est ouverte

Note : un pool de connexion n'est pas forcément excessif car le traitement d'une requête est rapide. Néanmoins, si les connexion ne sont pas rendues (`.close()`) ou que les requêtes ne sont pas optimisée (trop longue) alors effectivement notre pool de connexions peut venir conséquent.

## Pré-ouvrir des connexions
On peut également pré-ouvrir des connexions, car nous savons qu'au minimum nous aurons besoin de *n* connexions.

```java
dataSource.setInitialSize(5);
...

Connection connection = dataSource.getConnection();
```

Si on se met en débug juste après l'exécution du `.getDataSource()` et que nous exécutons la commande SQL `SHOW PROCESSLIST`

![pool connexion](../images/poolconnection2.png)

(Note : dbeaver ouvrir de lui deux connexions pour fonctionner)
