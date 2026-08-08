+++
title = "PrepareStatement"
weight = 5
+++

> [!ressource] Ressources
> - [Créer un PreparedStatement sur une requête SQL simple](https://youtu.be/Cb7lh0-sNZI?list=PLzzeuFUy_Cnheztz2UEfV1UMeeowaevwt)

## Statement

```java
Connection conn = DriverManager.getConnection("url");

Statement stmt = con.createStatement();
String sql = "SELECT * FROM users WHERE name + 'name';"

ResultSet rs = stmt.executeQuery(sql)
```

Or, cette pratique de concaténer une requête SQL avec un paramètre (ici name) permet des Injections SQL.
Ces chaînes paramétrées (e.i. Statement) doivent donc être utilisées de façon limitée avec beaucoup de précaution. Une façon plus simple est d'éviter de les utiliser et préférer les `PreparedStatement`

## PreparedStatement

```java
PreparedStatement ps = con.prepareStatement("SELECT * FROM users");

ps.executeQuery(); // sans paramètre
ps.executeUpdate();
```

Les différences sont très subtiles :
- On crée une requête qui est définie à la création du `prepareStatement`, là où avec le statement on pouvait avoir plusieurs requêtes SQL `stmt.executeQuery(sql)`, `stmt.executeQuery(sql2)`
- la requête SQL est paramétrable via le `?` puis préciser la valeur du paramètre

```java
PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE name = ?");
ps.setString(1, "Paul"); // /!\ On commence à 1 et pas à 0

ResultSet rs = ps.executeQuery();

ps.setString(1, "Ines");
ResultSet rs2 = ps.executeQuery();
```

### Avec paramètres nommés (pas possible avec JDBC)
JDBC ne supporte pas les paramètres nommés. 

```java
PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE name = :nom");
ps.setString("nom", "Paul"); 
ResultSet rs = ps.executeQuery();
```
```