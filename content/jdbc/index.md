+++
title = "JDBC"
weight = 10
+++

> [!ressource] Ressources
> - [https://www.jmdoudoux.fr/java/dej/chap-jdbc.htm](https://www.jmdoudoux.fr/java/dej/chap-jdbc.htm)
> - [José Paumard - API JDBC](https://www.youtube.com/playlist?list=PLzzeuFUy_Cnheztz2UEfV1UMeeowaevwt)
> - [Marco Behler - JDBC Tutorial - Crash Course](https://youtu.be/KgXq2UBNEhA)

Java DataBase Connectivity (JDBC) est une API de bas niveau pour se connecter et interagir avec la base de données

```java
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mabase", "utilisateur", "motdepasse");

ResultSet rs = conn.createStatement().executeQuery("SELECT * FROM matable");
```

## L'API JDBC
Elle est décrite dans les package `java.sql` et `javax.sql` et si on se rend sur la documentation officielle https://docs.oracle.com/en/java/javase/11/docs/api/java.sql/module-summary.html puis dans [java.sql](https://docs.oracle.com/en/java/javase/11/docs/api/java.sql/java/sql/package-summary.html) on peut lire dans la description les éléments suivants

![JDBC classes](jdbc_classes.png)

On y retrouve les principales classes et interfaces qui composent l'api `java.sql`. Et les 4 types de base de JDBC sont : DriverManager, Connection, Statement, et ResultSet, chacune correspondant à une étape de l'accès aux données. En effet l'interaction avec une base de données nécessite plusieurs étapes :

1. Obtenir une instance de Connection qui se connecte à la base de données
2. Obtenir une instance de Statement à partir de la connexion
3. Configurer et exécuter une requête SQL via le Statement
4. Exploiter les résultats retournés par la base de données
5. Fermer les différentes instances utilisées

## 1. Connexion à la base de données
### Chargement du pilote (drivers)
La connexion à une base de données requiert au préalable le chargement du pilote JDBC qui sera utilisé pour communiquer avec la base de données. Le chargement du pilote permet à Java de communiquer avec le système de gestion de base de données spécifique. Une fois chargé, le pilote s'enregistre auprès du DriverManager, qui peut ensuite l'utiliser pour créer des connexions à la base de données demandée.

> Il est important de noter qu'à partir de Java 6 et JDBC 4.0, le chargement explicite du pilote n'est plus nécessaire si le pilote est compatible JDBC 4.0. Nous avons juste besoin d'ajouter le pilote dans le classpath et il sera automatiquement détecté

```java
// Chargement du pilote
Class.forName("com.mysql.jdbc.Driver");
```

| **Base de données**   | **Classe d'implémentation**                  |
| --------------------- | -------------------------------------------- |
| HSQLDB                | org.hsqldb.jdbcDriver                        |
| H2                    | org.h2.Driver                                |
| MariaDB Connector/J   | org.mariadb.jdbc.Driver                      |
| Microsoft SQL Server  | com.microsoft.sqlserver.jdbc.SQLServerDriver |
| MySQL Connector/J 5.1 | com.mysql.jdbc.Driver                        |
| Oracle OCI            | oracle.jdbc.driver.OracleDriver              |
| PostgreSQL            | org.postgresql.Driver                        |

### Établir la connexion
Pour se connecter à une base de données, on obtient une instance de type Connection via la méthode getConnection() de la classe DriverManager, en fournissant l'URL de la base. Le DriverManager sélectionne alors un pilote parmi ceux chargés.

L'url de connexion suit la syntaxe suivante : `jdbc:<subprotocol>:<subname>`

Important : lorsque la connexion n'est plus utile, il faut explicitement invoquer sa méthode close() afin de libérer toutes les autres ressources de la base de données que la connexion peut conserver (try-with-ressources)

```java
try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mabase", "user", "pdw")) {
    // Utilisez la connexion ici et faire un appel BDD
    // Traitez le ResultSet...
} catch (SQLException e) {
    e.printStackTrace();
}
```

## 2. Accès à la base de données
Une fois la connexion établie, il est possible d'interagir avec une base de données, notamment pour exécuter des requêtes SQL. De même, nous devons invoquer la méthode `close()` (try-with-ressources) pour indiquer que l'exploitation est terminée.

- Exécuter un `SELECT`, utiliser la méthode `executeQuery()` : un objet ResultSet est retourné
- Exécuter un `INSERT, UPDATE, DELETE`, utiliser la méthode `executeUpdate()` : type de retour un entier signifiant le nombre d'enregistrements impactés

```java
ResultSet resultats = null;
String requete = "SELECT * FROM client";

try {
    Statement stmt = con.createStatement();
    resultats = stmt.executeQuery(requete); // un objet ResultSet est retourné dans le cas d'un SELECT
} catch (SQLException e) {
    //traitement de l'exception
}
```

```java
requete = "INSERT INTO client VALUES (3,'client 3','prenom 3')";
try {
   Statement stmt = con.createStatement();
   int nbMaj = stmt.executeUpdate(requete); // un entier est retourné dans le cas d'un UPDATE
   affiche("nb mise a jour = "+nbMaj);
} catch (SQLException e) {
   e.printStackTrace();
}
```

### Parcourir un ResultSet
> A table of data representing a database result set, which is usually generated by executing a statement that queries the database. 

On obtient un ResultSet après avoir invoqué `executeQuery() : ResultSet<T>`, nous pouvons maintenant itérer sur cet objet pour obtenir les lignes. 

```java
ResultSet rs = stmt.executeQuery(requete);

while (rs.next()) {
   String nom = rs.getString("nom");
   int age = rs.getInt("age");
}
```

On peut également obtenir les meta-datas via `ResultSetMetaData rsmd = rs.getMetaData();`
