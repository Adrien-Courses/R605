+++
title = "ACID"
weight = 5
+++

> [!resource] Ressources
> - [https://en.wikipedia.org/wiki/ACID](https://en.wikipedia.org/wiki/ACID)

- **L'atomicité** garantit que plusieurs opérations dans une transaction agissent comme une seule unité : soit elles réussissent toutes, soit elles échouent toutes.

- **La cohérence** garantit que la base de données reste dans un état valide qui respecte les règles et contraintes définies.

- **L'isolation** empêche les transactions simultanées d'interférer les unes avec les autres.

- **La durabilité** garantit qu'une fois qu'une transaction est validée, les résultats sont permanents, même après une défaillance du système. 

## C et D (géré par le SGBD)
- Côté SGBD : la cohérence “structurelle” via les contraintes d’intégrité (PK/FK, NOT NULL, CHECK, UNIQUE…), triggers, etc. (idée générale rappelée dans la définition ACID).

- Côté SGBD : WAL/journal, fsync, crash recovery, etc. (principe ACID : une fois commit, ça doit survivre aux pannes).

## A et I (SGBD + développeur)

### Atomicité
Dans une transaction : tout ou rien (commit/rollback). `BEGIN; update A; insert B; COMMIT;` → si une étape échoue, rollback.

Mais côté développeur, nous devons délimiter correctement la transaction (où elle commence/termine).

### Isolation
Le SGBD empêche (ou réduit) les anomalies de concurrence via verrous / MVCC, et le niveaux d'isolation

Le développeur, lui, choisi le niveau d'isolation adapté pour éviter les anomalies : dirty reads, non-repeatable reads, phantoms, lost updates etc

> [!affirmation] Affirmation
> **Vous êtes à l'aise avec le principe d'atomicité. Dans les sections suivantes nous allons [détailler l'isolation]({{< relref "jdbc/transaction/isolation/index" >}}) pour découvrir la complexité de ce concept**