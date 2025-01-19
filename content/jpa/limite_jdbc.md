+++
title = "Limite de JDBC"
weight = 10
+++

JDBC est une API de bas niveau, lorsque nous écrivions nos méthodes, nous devons à chaque fois effectuer la traduction entre la classe Java `Client` et sa représentation en SQL.
- Nous avons donc une grande quantité de code très identique les unes des autres où souvent seul les attributs de la requête SQL changent
- De plus, JDBC impose de connaître le moteur de la base de données cible, or chaque SGBD peut offrir quelques variantes ou fonctionnalités complémentaires qui ne peuvent pas être utilisé avec JDBC. Par exemple, le mot clé `LIMIT` n'est pas un standard SQL mais une spécificité de MySQL.
- => Il faudrait donc automatiser l'écriture de nos requête s'en tenir compte des SGBD

```java
public Client getById(long id) {
    Connection conn = null;
    Client client = null;
    try {
        DataSource dataSource = DataSourceProvider.getSingleDataSourceInstance();
        conn = dataSource.getConnection();

        PreparedStatement preparedStatement = conn.prepareStatement(
            "SELECT nom, prenom FROM Client WHERE ID=?"
        );
        preparedStatement.setLong(1, id);

        ResultSet rs = preparedStatement.executeQuery();

        if (rs.next()) {
            client = new Client();
            client.setId(id);
            client.setNom(rs.getString("NOM"));
            client.setPrenom(rs.getString("PRENOM"));
        }

        System.out.println("Client lu");
    } catch (SQLException e) {
        ....
    }
    return client;
}
```
