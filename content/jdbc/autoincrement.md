+++
title = "Auto Increment"
weight = 50
+++

Il est commun que les id soient géré

```java
public void create(Client client) {
    Connection connection = null;
    try {
        BasicDataSource dataSource = new BasicDataSource();
        dataSource.setUrl("url");
        dataSource.setUsername("username");
        dataSource.setPassword("password");

        Connection connection = dataSource.getConnection();

        PreparedStatement preparedStatement = connection.prepareStatement(
            "INSERT INTO CLIENT (firstname, lastname) VALUES (?, ?)", 
            Statement.RETURN_GENERATED_KEYS
        );

        preparedStatement.setString(1, client.getFirstname());
        preparedStatement.setString(2, client.getLastname());

        // Insertion en base de données
        preparedStatement.executeUpdate();

        // Après l'INSERT, la méthode récupère la clé auto-générée de la table Client
        ResultSet rs = preparedStatement.getGeneratedKeys();
        if (rs.next()) {
            client.setId(rs.getLong(1)); // on set la valeur au client
        }

        System.out.println("Client créé");
    } catch (SQLException e) {
        e.printStackTrace();
        try {
            if (connection != null) connection.rollback();
        } catch (SQLException e1) {
            e1.printStackTrace();
        }
    }
}
```

Ainsi l'objet `client` passé en paramètre est modifié pour lui donner l'id et l'appelant pourra exploiter cette information.
