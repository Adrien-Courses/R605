+++
title = "Autocommit"
weight = 30
+++

Par défaut, chaque `Connection` débute en *auto-commit=true*. Par conséquent, chaque *Statement* sera exécuté dans une transaction séparée. ce mode *auto-commit=true* ne nous permet pas de valider un groupe d'opérations dans la même transaction.

## Avec auto-commit=true
Dans l'exemple suivant, une somme d'argent est transférée entre deux comptes bancaires. Le solde
doit toujours rester constant ; ainsi, si un compte est débité, l'autre doit toujours être crédité
du même montant.

```java
// par défaut auto-commit vaut true
try(Connection connection = dataSource.getConnection();
    PreparedStatement transferStatement = connection.prepareStatement(
    "UPDATE account SET balance = ? WHERE id = ?"
    )) 
{
    transferStatement.setLong(1, Math.negateExact(cents));
    transferStatement.setLong(2, fromAccountId);
    transferStatement.executeUpdate();
    transferStatement.setLong(1, cents);
    transferStatement.setLong(2, toAccountId);
    transferStatement.executeUpdate();
}
```

En raison du mode *auto-commit*, **si la deuxième instruction échoue, seules ces modifications spécifiques peuvent être annulées ; la première instruction, déjà validée, ne peut plus être annulée.**

## Avec auto-commit=false
Le mode de validation automatique par défaut doit être désactivé et la transaction devra être gérée
manuellement. La transaction est validée si toutes les instructions s'exécutent avec succès et une annulation est
déclenchée en cas d'échec

```java
try(Connection connection = dataSource.getConnection()) {
    connection.setAutoCommit(false);
    try(PreparedStatement transferStatement = connection.prepareStatement(
    "UPDATE account SET balance = ? WHERE id = ?"
    )) 
    {
        transferStatement.setLong(1, Math.negateExact(cents));
        transferStatement.setLong(2, fromAccountId);
        transferStatement.executeUpdate();
        transferStatement.setLong(1, cents);
        transferStatement.setLong(2, toAccountId);
        transferStatement.executeUpdate();
        connection.commit();
    } catch (SQLException e) {
        connection.rollback();
    throw e;
    }
}
```

Ici on déclare `connection.setAutoCommit(false);`, ce qui nous oblige a gérer manuellement la transaction
- `connection.commit();` si tout ce déroule correctement
- `connection.rollback();` qui annulera l'ensemble des transferts