+++
title = "Transaction"
weight = 20
+++

JEE propose une solution pour les transaction au travers de l'API JTA (Java Transaction API).  

Pour le moment nous n'utilisions pas de transaction ? Et si, par défaut Java utilise le mode *auto-commit* (démarrer automatiquement la transaction et sera validé dès la mise à jour en base de données).

Mais ce mode *auto-commit* ne nous permet pas de valide regrouper opérations dans la même transaction. Nous devons donc le désactiver sur la Connection

```java
Connection connection = DriverManager.getConnection("url");
connection.setAutoCommit(false);
```

Maintenant toutes les opérations vous être mise en attente de commit, et c'est à nous manuellement de déclencher le commit (lorsqu'on considère que tout c'est bien passé)

```java
connection.commit();
```

Et s'il y a eu un problème, alors une exception `SQLException` est automatiquement levée. Donc nous réaliserons un rollback

```java
connection.rollback() 
```

## Code complet
```java
Connection connection = null;

try {
    Connection connection = DriverManager.getConnection("url");
    connection.setAutoCommit(false);

    PreparedStatement pS = connection.prepareStatement("UPDATE client SET nom=? WHERE id=?");
    pS.setString(1, "Adrien");
    ps.setLong(2, 1L)

    connection.commit(); // on commit
} catch(SQLException e) {
    connection.rollback();
}
```