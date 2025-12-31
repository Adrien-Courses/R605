+++
title = "Pool de connexions"
weight = 15
+++

> [!ressource] Ressource
> - [The anatomy of Connection Pooling - Vlad Mihalcea](https://vladmihalcea.com/the-anatomy-of-connection-pooling/)
> - [Maximum number of database connections](https://vladmihalcea.com/maximum-database-connections/)
> [TD1 JDBC - Pool Connection]({{< relref "td_tp/jdbc/td1" >}})

## Ouvrir une connexion est une opération coûteuse

L'ouverture et la fermeture des connexions à la base de données sont des opérations très coûteuses. Donc réutiliser des connexions présente les avantages suivants :
- évite à la fois la surcharge de la base de données et celle du pilote pour établir une connexion TCP
- empêche la destruction des tampons de mémoire temporaires associés à chaque connexion à la base de données
- réduit les déchets d'objets JVM côté client.

### Statistiques

![pooling stat](pool_stats.png)

Lorsqu'on utilise une solution de mise en pool des connexions, le temps d'acquisition d'une connexion est réduit d'un facteur compris entre deux et quatre. => En réduisant l'intervalle d'acquisition des connexions, le temps de réponse global des transactions
est également raccourci. 

## Comment ça fonctionne ?

![pool fonctionnement](pool_fonctionnement.png)

1. Lorsqu'une connexion est demandée, le pool recherche les connexions non attribuées.
2. Si le pool en trouve une libre, il la transmet au client.
3. S'il n'y a pas de connexion libre, le pool tente d'atteindre sa taille maximale autorisée.
4. Si le pool a déjà atteint sa taille maximale, il réessaie plusieurs fois avant d'abandonner avec
une exception d'échec d'acquisition de connexion.
5. Lorsque le client ferme la connexion logique, celle-ci est libérée et retourne au pool sans fermer la connexion physique sous-jacente.

Ainsi, l'exception classique `Connection is not available, request timed out after 30000ms` est levé pendant l'étape 4 car nous n'avons pas réussi à acquérir une connexion à temps (latence réseau ou requête trop longue)

### Cycle de vie
Le cycle de vie logique de la connexion se présente comme suit

![pool_schema](pool_schema.png)

Contrairement à une [utilisation sans pool]({{< relref "jdbc/api_jdbc/datasource#schéma" >}}), où la connexion physique est retournée telle quelle, un pool de connexions fournit un proxy.

Ce proxy permet notamment de détourner le comportement des méthodes `getConnection()` et `close()`. Lorsqu’une connexion est empruntée, le pool marque la connexion comme « allouée » afin d’empêcher son utilisation simultanée par plusieurs consommateurs.
À l’appel de `close()`, le proxy intercepte l’opération et notifie le pool, qui remet alors la connexion dans l’état « non allouée », la rendant à nouveau disponible sans fermer la connexion physique sous-jacente.

=> Ainsi la création/fermeture d'une connexion n'est pas réalisée physiquement mais "simulée virtuellement".

## Exemple

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
