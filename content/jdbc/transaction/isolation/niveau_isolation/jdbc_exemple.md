+++
title = "Exemple JDBC"
weight = 70
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

    // Désactiver l’autocommit (pour contrôler la transaction)
    connection.setAutoCommit(false);

    // 2. Définir le niveau d’isolation souhaité
    connection.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);

    // 3. Commencer à exécuter des requêtes
    PreparedStatement stmt = connection.prepareStatement("SELECT * FROM client");
    ResultSet rs = stmt.executeQuery();

    while(rs.next()) {
        String nom = rs.getString("nom");
        String prenom = rs.getString("prenom");
        System.out.println("Statement 1 : "+ nom + " " + prenom);
    }

    // Mettre un point d'arrêt ici
    System.out.println("Mettre un point d'arrêt");

    // 4. Executer de nouveau
    PreparedStatement stmt2 = connection.prepareStatement("SELECT * FROM client");
    ResultSet rs2 = stmt2.executeQuery();

    while(rs2.next()) {
        String nom = rs2.getString("nom");
        String prenom = rs2.getString("prenom");
        System.out.println("Statement 2 : "+ nom + " " + prenom);
    }
}
```

Comme on est en `Repeatable Read`, si entre le point 3. et 4. on modifie une donnée en base (par exemple) le nom alors aucun changement après l'étape 4, on évite les **lecture non répétable**

Néanmoins, si on insère une nouvelle ligne, alors celle si apparaîtra à l'étape 4. On a un **phantom read**


```
SELECT #1 → "Dupont"

                            autre transaction UPDATE + COMMIT → "Martin"

SELECT #2 → toujours "Dupont". -- car Repeatable Read
```


## Récupérer le niveau d'isolation
```java
int isolation = connection.getTransactionIsolation();

if (isolation == Connection.TRANSACTION_SERIALIZABLE) {
    System.out.println("Serializable isolation");
}
```

Note : Avec JPA/Hibernate nous pouvons également le modifier