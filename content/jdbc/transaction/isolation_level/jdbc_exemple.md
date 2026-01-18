+++
title = "Exemple code"
weight = 20
+++

- Le niveau d'isolation s'applique par connexion, et non globalement.
- Vous le définissez généralement avant d'exécuter toute requête SQL dans la transaction.
- De nombreuses bases de données requièrent `autoCommit = false` pour que l'isolation soit effective.

## Changer le niveau d'isolation

```java
public static void main(String[] args) throws SQLException {
    Connection connection = DriverManager.getConnection(
            "jdbc:postgresql://localhost:5432/mydb",
            "user",
            "password"
    );

    // Disable auto-commit to start a transaction
    connection.setAutoCommit(false);

    // Set isolation level
    connection.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);

    // Do database work here...

    connection.commit();
    connection.close();
}
```

## Récupérer le niveau d'isolation
```java
int isolation = connection.getTransactionIsolation();

if (isolation == Connection.TRANSACTION_SERIALIZABLE) {
    System.out.println("Serializable isolation");
}
```

Note : Avec JPA/Hibernate nous pouvons également le modifier