+++
title = "Atomicité SQL/JDBC"
description = "L'atomicité d'une transaction en SQL et en Java : désactiver l'autocommit et piloter commit et rollback manuellement depuis JDBC."
weight = 20
+++

> [!definition] Définition
> L'atomicité garantit que chaque transaction est traitée comme une seule "unité", qui réussit complètement ou échoue
complètement

## En SQL

```sql
BEGIN TRANSACTION;

-- Étape 1 : Débiter le compte source
UPDATE account
SET balance = balance - 100
WHERE id = 1;

-- Étape 2 : Créditer le compte destinataire
UPDATE account
SET balance = balance + 100
WHERE id = 2;

-- COMMIT Si tout s’est bien passé OU ROLLBACK on annule tout
COMMIT ou ROLLBACK;
```

## En Java
Par défaut, avec JDBC, chaque instruction est faite dans une transaction indépendante (`autocommit=true`)

```java
Connection conn = DriverManager.getConnection(url, user, password);
try {
    // Transaction 1
    PreparedStatement debit = conn.prepareStatement("UPDATE account SET balance = balance - 100 WHERE id = 1");
    debit.executeUpdate(); // COMMIT immédiat

    // Transaction 2
    PreparedStatement credit = conn.prepareStatement("UPDATE account SET balance = balance + 100 WHERE id = 2");
    credit.executeUpdate(); // COMMIT immédiat, si échec alors transaction 1 non rollback
} catch (Exception e) {
    // rollback inutile ici
    conn.rollback();
}
```

### Gérer manuellement les transactions
Le mode de validation automatique par défaut doit être désactivé et la transaction devra être gérée
manuellement. La transaction est validée si toutes les instructions s'exécutent avec succès, sinon une annulation est déclenchée en cas d'échec

On déclare `connection.setAutoCommit(false);`, ce qui nous oblige à gérer manuellement la transaction
- `connection.commit();` si tout se déroule correctement
- `connection.rollback();` qui annulera l'ensemble des transferts

```java
Connection conn = DriverManager.getConnection(url, user, password);
conn.setAutoCommit(false); // 🔴 on dit qu'on gèrera nous même le .commit() et le .rollback()

try {
    // Pas de transaction
    PreparedStatement debit = conn.prepareStatement("UPDATE account SET balance = balance - 100 WHERE id = 1");
    debit.executeUpdate(); // pas de commit immédiat

    // Pas de transaction
    PreparedStatement credit = conn.prepareStatement("UPDATE account SET balance = balance + 100 WHERE id = 2");
    credit.executeUpdate(); // pas de commit immédiat

    conn.commit(); // commit atomique => 1 unique transaction
} catch (Exception e) {
    conn.rollback(); // rollback complet
}
```