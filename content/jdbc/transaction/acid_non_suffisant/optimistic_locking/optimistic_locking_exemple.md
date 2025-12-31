+++
title = "Optimistic Locking Exemple"
weight = 10
+++

Dans une application web moderne (REST, microservices) est par nature stateless :
chaque requête est indépendante, et aucun état applicatif n’est conservé entre deux appels.
La question devient donc : **comment conserver l’information nécessaire au contrôle de concurrence sans rendre l’application stateful ?**

> [!affirmation] Affirmation 
> La réponse est simple : le client devient porteur de l’état minimal nécessaire, à savoir la version de l’entité.


## Exposer la version au client
Dans un contexte stateless, le serveur ne peut pas se souvenir de la version d’une entité lue précédemment.
Si le client ne renvoie pas cette version lors d’une mise à jour :
- Hibernate est incapable de détecter un conflit concurrent
- une modification plus récente peut être écrasée silencieusement

Pour éviter cela, la version doit faire partie intégrante du contrat d’API.

### Design
Concrètement :
- la version est incluse dans le DTO de réponse (lecture)
- la version est obligatoire dans le DTO d’entrée (PUT, PATCH, POST de mise à jour)

Ainsi, à chaque requête d’écriture, Hibernate peut vérifier que l’entité n’a pas été modifiée depuis la dernière lecture et lever une exception d’optimistic locking en cas de conflit.

```java
    public record UpdateAccountCommand(
            long id,
            long version,
            BigDecimal balance
    ) {}

    public void updateBalance(UpdateAccountCommand command) {

        int updatedRows = updateAccount(
                command.id(),
                command.version(),
                command.balance()
        );

        // Si aucune ligne n'est mise à jour, cela signifie que la version à changer
        if (updatedRows == 0) {
            throw new OptimisticLockException(
                "Concurrent modification detected for account " + command.id()
            );
        }
    }

    private int updateAccount(
            long id,
            long version,
            BigDecimal balance
    ) {

        String sql = """
            UPDATE account
            SET balance = ?, version = version + 1
            WHERE id = ? AND version = ?
        """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setBigDecimal(1, balance);
            ps.setLong(2, id);
            ps.setLong(3, version);

            return ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
```

=> `WHERE id = ? AND version = ?` si 0 lignes trouvée alors renvoie 0 ce qui va lever une exception