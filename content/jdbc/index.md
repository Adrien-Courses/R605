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