+++
title = "Quoi de neuf"
weight = 98
+++

## 2026-27 — en cours

Le fil rouge de cette édition est la **performance** : savoir écrire un mapping correct ne suffit pas, encore faut-il être conscient des requêtes réellement envoyées à la base et du coût de l'abstraction ORM.

**Prévu**
- [Les limites d'un ORM]({{< relref "limites_orm/" >}}) — ce qu'un ORM ne résout pas, et les cas où revenir à du SQL est le bon réflexe.
- Le problème du **N+1 select** : le reconnaître dans les logs SQL, comprendre d'où il vient, et les stratégies pour l'éviter.
- Les **JOIN** : quand les écrire explicitement plutôt que de laisser l'ORM décider, et l'impact sur le nombre de requêtes.

## 2025-26

Suite à la lecture du livre [High-Performance Java Persistence](https://vladmihalcea.com/books/high-performance-java-persistence/) de Vlad Mihalcea, le cours descend d'un cran vers ce que fait réellement la base de données sous JDBC.

- [Isolation SQL/JDBC]({{< relref "jdbc/transaction/isolation/" >}}) — les niveaux d'isolation, les anomalies que chacun autorise, et comment les piloter depuis JDBC.
- [ACID insuffisant]({{< relref "jdbc/transaction/acid_insuffisant/" >}}) — pourquoi respecter ACID ne met pas à l'abri de tous les problèmes de concurrence.

## 2024-25

Premier jet du cours, structuré autour des trois briques de la persistance en Java.

- [JDBC]({{< relref "jdbc/index" >}}) — l'API de base, bas niveau, qui donne le contrôle total sur le SQL.
- [JPA]({{< relref "jpa/index" >}}) — la spécification de mapping objet-relationnel.
- [Spring Data JPA]({{< relref "spring_data_jpa/index" >}}) — l'abstraction Spring qui réduit le code des opérations courantes.

---

Les supports projetés en cours sont archivés par année sur la page [Ressources]({{< relref "ressources/" >}}).
