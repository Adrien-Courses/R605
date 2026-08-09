+++
title = "Les alternatives (complémentaires)"
weight = 70
+++

> [!ressource] Ressources
> - [jOOQ - Documentation](https://www.jooq.org/doc/latest/manual/)
> - [Spring JdbcClient / JdbcTemplate](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html)
> - [Vlad Mihalcea - JPA vs jOOQ](https://vladmihalcea.com/jooq-facts-from-jpa-land-instant-sql-schema-migrations/)

Après tous ces pièges, la conclusion pourrait sembler être « abandonnons JPA ». Ce serait une erreur d'analyse.

> [!affirmation] Le message du chapitre
> Ces outils ne sont **pas des concurrents** de JPA : ce sont des **compléments**. Dans une même application, il est parfaitement normal — et même recommandé — d'utiliser JPA pour le domaine métier et du SQL pour le reporting. Le mauvais réflexe est de vouloir tout faire avec un seul outil.

## Répartition typique dans une application réelle

| Besoin | Outil adapté | Pourquoi |
|---|---|---|
| Créer / modifier une entité métier, gérer un graphe d'objets | **JPA / Hibernate** | Dirty checking, cascade, cycle de vie, optimistic locking : tout ce qui vous ferait écrire 200 lignes de JDBC |
| CRUD standard, pagination, tri | **Spring Data JPA** | Zéro boilerplate |
| Écran de consultation, liste, recherche | **Projection DTO** (JPA) ou **SQL** | Pas d'entité gérée, pas de dirty checking |
| Reporting, agrégats, fonctions fenêtrées | **SQL natif / jOOQ** | JPQL ne sait pas les exprimer |
| Traitement de masse (millions de lignes) | **JDBC batch / outils du SGBD** | Le contexte de persistance n'est pas dimensionné pour ça |

Selon les projets, on observe souvent une répartition de l'ordre de 80 % JPA / 20 % SQL — les 20 % correspondant précisément aux cas décrits dans ce chapitre.

## Rester dans JPA : les requêtes natives

La solution la plus simple ne demande aucune nouvelle dépendance : JPA sait exécuter du SQL brut.

```java
List<CaParVille> stats = em.createNativeQuery("""
        SELECT a.ville, SUM(c.montant) AS total
        FROM commande c
        JOIN client cl ON cl.id = c.client_id
        JOIN adresse a  ON a.id = cl.adresse_id
        GROUP BY a.ville
        """, "CaParVilleMapping")
    .getResultList();
```

- ✅ Accès à 100 % de SQL, y compris les fonctionnalités propriétaires du SGBD.
- ✅ On reste dans la même transaction et la même connexion que le reste du code JPA.
- ❌ Le SQL est une simple `String` : **aucune vérification à la compilation**, et si vous renommez une colonne, vous ne le saurez qu'à l'exécution.
- ❌ Le SQL devient dépendant du SGBD.

## Spring `JdbcClient` / `JdbcTemplate`

Dans l'écosystème Spring, c'est l'outil naturel pour les lectures qui ne méritent pas d'entités. Il reprend le JDBC vu en début de cours, mais **sans le boilerplate** : plus de `try/finally`, plus de gestion manuelle du `ResultSet`, et les `SQLException` (des exceptions vérifiées) sont converties en exceptions non vérifiées.

```java
List<CaParVille> stats = jdbcClient.sql("""
        SELECT ville, SUM(montant) AS total
        FROM v_commandes
        WHERE annee = :annee
        GROUP BY ville
        """)
    .param("annee", 2025)
    .query(CaParVille.class)
    .list();
```

- ✅ Simple, léger, prévisible : le SQL exécuté est **exactement** celui que vous avez écrit.
- ✅ Partage la même `DataSource` et la même transaction que JPA.
- ❌ Toujours du SQL en `String`, non vérifié à la compilation.
- ❌ Aucune aide sur les écritures complexes (pas de cascade, pas de dirty checking).

## jOOQ

jOOQ propose une approche différente : il **génère du code Java à partir de votre schéma de base**, puis vous écrivez du SQL… en Java typé.

```java
Result<Record2<String, BigDecimal>> stats = dsl
    .select(ADRESSE.VILLE, sum(COMMANDE.MONTANT))
    .from(COMMANDE)
    .join(CLIENT).on(CLIENT.ID.eq(COMMANDE.CLIENT_ID))
    .join(ADRESSE).on(ADRESSE.ID.eq(CLIENT.ADRESSE_ID))
    .groupBy(ADRESSE.VILLE)
    .fetch();
```

- ✅ **Vérifié à la compilation** : si une colonne est renommée en base, le projet ne compile plus. C'est l'argument décisif de jOOQ.
- ✅ Accès complet à SQL : fonctions fenêtrées, CTE, requêtes récursives, spécificités du SGBD.
- ✅ Autocomplétion dans l'IDE sur les tables et colonnes.
- ❌ Étape de génération de code à intégrer au build (le schéma doit exister avant de compiler).
- ❌ Licence commerciale pour les SGBD propriétaires (Oracle, SQL Server) ; gratuit pour PostgreSQL, MySQL, MariaDB…
- ❌ Ne remplace pas JPA sur les écritures : c'est à vous de gérer le graphe d'objets.

## Comment choisir ?

Quelques questions simples à se poser devant un besoin d'accès aux données :

1. **Est-ce que je modifie un objet métier ?** → JPA.
2. **Est-ce que je lis pour afficher, sans modifier ?** → projection DTO, ou SQL si la requête est complexe.
3. **Est-ce que ma requête contient un `GROUP BY`, une fonction fenêtrée, ou une CTE ?** → SQL natif ou jOOQ.
4. **Est-ce que je touche des dizaines de milliers de lignes ?** → bulk update, ou outil dédié du SGBD.

> [!affirmation] Conclusion du cours
> Un ORM est un excellent outil **pour ce pour quoi il a été conçu**. Le connaître, ce n'est pas seulement savoir écrire des annotations : c'est savoir **quand ne pas s'en servir**. Et dans tous les cas, cela suppose de savoir lire le SQL qu'il produit — ce qui nous ramène exactement là où le cours a commencé, avec [JDBC]({{< relref "jdbc/index" >}}).
