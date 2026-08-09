+++
title = "Les écritures en masse"
weight = 30
+++

> [!ressource] Ressources
> - [Vlad Mihalcea - The best way to do batch processing with JPA and Hibernate](https://vladmihalcea.com/how-to-batch-insert-and-update-statements-with-hibernate/)
> - Rappel du cours : [Batching JDBC]({{< relref "jdbc/statement_optimisation/batching/index" >}})

Deuxième cas où l'ORM est structurellement mal placé : modifier **beaucoup de lignes d'un coup**. Par exemple *« augmenter de 5 % le prix de tous les produits de la catégorie Informatique »*, ou *« archiver les 200 000 commandes de plus de 3 ans »*.

## Le mauvais réflexe

```java
List<Produit> produits = em.createQuery(
        "SELECT p FROM Produit p WHERE p.categorie = :cat", Produit.class)
    .setParameter("cat", "Informatique")
    .getResultList();

for (Produit p : produits) {
    p.setPrix(p.getPrix().multiply(new BigDecimal("1.05")));
}
// le dirty checking fera le reste au commit
```

Ce code est **élégant** et **fonctionnellement correct** — c'est bien ce qui le rend dangereux. Mais pour 100 000 produits, il implique :

1. un `SELECT` qui ramène 100 000 lignes en mémoire ;
2. la création de 100 000 objets Java, tous conservés dans le contexte de persistance ;
3. la conservation d'un **instantané** (*snapshot*) de chaque objet pour le [dirty checking]({{< relref "limites_orm/dirty_checking" >}}), soit **le double** de l'empreinte mémoire ;
4. l'émission de 100 000 ordres `UPDATE ... WHERE id = ?` au flush.

Résultat typique : plusieurs minutes d'exécution, et souvent un `OutOfMemoryError`.

## Solution 1 : le bulk update JPQL

Si la règle métier peut s'exprimer en une requête, laissez la base la faire :

```java
int nb = em.createQuery("""
        UPDATE Produit p
        SET p.prix = p.prix * 1.05
        WHERE p.categorie = :cat
        """)
    .setParameter("cat", "Informatique")
    .executeUpdate();
```

Une seule requête, aucune entité chargée. Le gain se compte en ordres de grandeur.

Avec Spring Data JPA, on utilise `@Modifying` :

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE Produit p SET p.prix = p.prix * 1.05 WHERE p.categorie = :cat")
int augmenterPrix(@Param("cat") String categorie);
```

> [!definition] ⚠️ Le piège du bulk update
> Un bulk update est exécuté **directement en base** : il ne passe ni par le contexte de persistance, ni par le [cache de premier niveau]({{< relref "jpa_deeper/cache" >}}). Les entités déjà chargées en mémoire gardent donc leur **ancienne valeur**, et le cache de second niveau devient obsolète.
>
> Les callbacks (`@PreUpdate`, `@PreRemove`), la [cascade]({{< relref "jpa/mapping_associations/cascade" >}}) et l'[optimistic locking]({{< relref "jpa_deeper/optimistic_locking/index" >}}) sont également **ignorés** : c'est à vous d'incrémenter `version` dans la requête si vous en dépendez.
>
> D'où l'usage de `clearAutomatically = true`, qui vide le contexte après l'exécution.

## Solution 2 : le batching, quand on doit vraiment passer par les entités

Parfois la logique métier est trop complexe pour tenir dans un `UPDATE` (calculs conditionnels, appels à d'autres services…). Il faut alors charger les entités, mais **par paquets**, en vidant régulièrement le contexte de persistance :

```properties
hibernate.jdbc.batch_size=50
hibernate.order_inserts=true
hibernate.order_updates=true
```

```java
for (int i = 0; i < produits.size(); i++) {
    em.persist(produits.get(i));

    if (i % 50 == 0) {   // même valeur que batch_size
        em.flush();      // envoie le paquet à la base
        em.clear();      // libère la mémoire : les entités deviennent DETACHED
    }
}
```

C'est exactement le [batching JDBC]({{< relref "jdbc/statement_optimisation/batching/index" >}}) vu en début de cours, piloté par Hibernate.

> [!affirmation] Attention à la stratégie d'identifiant
> Le batching des `INSERT` est **totalement désactivé** si vos entités utilisent `@GeneratedValue(strategy = GenerationType.IDENTITY)`. Pourquoi ? Parce qu'Hibernate a besoin de connaître l'identifiant pour gérer l'entité dans le contexte de persistance, et qu'avec `IDENTITY` cet identifiant n'est connu **qu'après** l'exécution de l'`INSERT`. Il ne peut donc rien regrouper.
>
> Pour du traitement de masse, préférez `SEQUENCE` (avec un *pooled optimizer*), qui permet de réserver les identifiants à l'avance.

## Solution 3 : sortir de l'ORM

Pour un import de plusieurs millions de lignes, la bonne réponse n'est ni JPA ni même JDBC classique, mais les outils dédiés du SGBD : `COPY` (PostgreSQL), `LOAD DATA INFILE` (MySQL), ou un ETL. Un ORM n'a tout simplement pas été conçu pour cet usage.
