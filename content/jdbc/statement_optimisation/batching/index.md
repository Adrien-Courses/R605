+++
title = "Batching"
weight = 10
+++

## Objectifs

> [!definition] Définition
> JDBC 2.0 a introduit les mises à jour par lots, afin que plusieurs instructions DML puissent être regroupées en une seule requête de base de données. L'envoi de plusieurs instructions dans une seule requête réduit le nombre d'allers-retours vers la base de données, ce qui diminue le temps de réponse des transactions.

### Benchmark
![](batch_performance.png)



## Exemple

```java
PreparedStatement ps = c.prepareStatement("INSERT INTO employees VALUES (?, ?)");

ps.setString(1, "John");
ps.setString(2,"Doe");
ps.addBatch();

ps.clearParameters();
ps.setString(1, "Dave");
ps.setString(2,"Smith");
ps.addBatch();

ps.clearParameters();
int[] results = ps.executeBatch();
```