+++
title = "ACID"
weight = 10
+++

> [!resource] Ressources
> - [https://en.wikipedia.org/wiki/ACID](https://en.wikipedia.org/wiki/ACID)

Commençons cette section sur les transactions par un rappel clé sur l'acronyme ACID

- **L'atomicité** garantit que plusieurs opérations dans une transaction agissent comme une seule unité : soit elles réussissent toutes, soit elles échouent toutes.

- **La cohérence** garantit que la base de données reste dans un état valide qui respecte les règles et contraintes définies.

- **L'isolation** empêche les transactions simultanées d'interférer les unes avec les autres.

- **La durabilité** garantit qu'une fois qu'une transaction est validée, les résultats sont permanents, même après une défaillance du système. 

## Côté SGBD
La consistance et la durabilité sont gérés par la base de données. 
- Côté SGBD cohérance : la cohérence “structurelle” via les contraintes d’intégrité (PK/FK, NOT NULL, CHECK, UNIQUE…), triggers, etc. (idée générale rappelée dans la définition ACID).
- Côté SGBD durabilité : WAL/journal, fsync, crash recovery, etc. (principe ACID : une fois commit, ça doit survivre aux pannes).


## Côté développeur
Le développeur lui peut intervenir sur lʼatomicité et lʼisolation.
- Côté développeur l'atomicité : peut définir le contexte transactionnel
- Côté développeur l'isolation : choisit le niveau d'isolation adapté pour éviter les anomalies : dirty reads, non-repeatable reads, phantoms, lost updates etc

> [!affirmation] Affirmation
> **Vous êtes à l'aise avec le principe d'atomicité. Dans les sections suivantes nous allons [détailler l'isolation]({{< relref "jdbc/transaction/isolation/index" >}}) pour découvrir la complexité de ce concept**