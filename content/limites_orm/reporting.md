+++
title = "Reporting et requêtes analytiques"
weight = 20
+++

> [!ressource] Ressource
> - [Vlad Mihalcea - The best way to map a projection query to a DTO](https://vladmihalcea.com/the-best-way-to-map-a-projection-query-to-a-dto-with-jpa-and-hibernate/)

Un ORM est conçu pour un usage très précis : **charger un graphe d'objets, le modifier, le sauvegarder**. C'est ce qu'on appelle une charge *transactionnelle* (OLTP) : peu de lignes, mais des écritures.

Le **reporting** est exactement l'inverse : beaucoup de lignes, aucune écriture, et un résultat qui n'a pas la forme de vos entités.

## Le mauvais réflexe

Imaginons le besoin suivant : *« le chiffre d'affaires par ville et par mois pour l'année en cours »*.

Le réflexe ORM serait de charger les entités et de calculer en Java :

```java
List<Commande> commandes = em.createQuery(
        "SELECT c FROM Commande c WHERE c.date >= :debut", Commande.class)
    .setParameter("debut", debutAnnee)
    .getResultList();

Map<String, BigDecimal> caParVille = new HashMap<>();
for (Commande c : commandes) {
    String ville = c.getClient().getAdresse().getVille(); // 💥 N+1
    caParVille.merge(ville, c.getMontant(), BigDecimal::add);
}
```

Ce code est catastrophique pour au moins trois raisons :

1. **On charge tout en mémoire.** 500 000 commandes deviennent 500 000 objets Java gérés par le contexte de persistance, alors que le résultat final tient en 30 lignes.
2. **On déclenche un [N+1]({{< relref "jpa_deeper/fetch/index" >}})** en naviguant vers le client puis l'adresse.
3. **On refait en Java ce que la base sait faire mieux.** Un `GROUP BY` sur un index est l'opération pour laquelle un SGBD a été optimisé pendant 40 ans.

## Le bon réflexe : projeter, agréger côté base

La base doit renvoyer **le résultat**, pas la matière première. On utilise une [projection]({{< relref "jpa_deeper/projection" >}}) vers un DTO :

```java
public record CaParVille(String ville, int mois, BigDecimal total) {}
```

```java
List<CaParVille> stats = em.createQuery("""
        SELECT new com.exemple.CaParVille(
                 c.client.adresse.ville,
                 MONTH(c.date),
                 SUM(c.montant))
        FROM Commande c
        WHERE c.date >= :debut
        GROUP BY c.client.adresse.ville, MONTH(c.date)
        """, CaParVille.class)
    .setParameter("debut", debutAnnee)
    .getResultList();
```

Une seule requête, 30 lignes retournées, aucune entité gérée par le contexte de persistance. C'est déjà **plusieurs ordres de grandeur** plus rapide.

> [!affirmation] Règle simple
> Dès qu'une requête contient un `GROUP BY`, une fonction d'agrégation, ou qu'elle ne sert qu'à **afficher** des données sans les modifier : **ne chargez pas d'entités**. Projetez vers un DTO.

## Quand JPQL lui-même ne suffit plus

JPQL reste un langage volontairement limité : il ne connaît qu'un sous-ensemble de SQL. Il ne sait pas exprimer :

- les **fonctions fenêtrées** (`ROW_NUMBER()`, `RANK()`, `LAG()`, `SUM(...) OVER (PARTITION BY ...)`) ;
- les **CTE** (`WITH ... AS`) et les requêtes récursives (parcours d'arborescence) ;
- les `PIVOT`, `UNION` complets, les *hints* d'optimisation ;
- toute la richesse propriétaire de votre SGBD (JSON dans PostgreSQL, recherche plein texte…).

Or ce sont précisément les outils du reporting. Dans ce cas, on assume une **requête native** :

```java
List<Object[]> resultat = em.createNativeQuery("""
        SELECT ville, mois, total
        FROM (
          SELECT a.ville,
                 EXTRACT(MONTH FROM c.date) AS mois,
                 SUM(c.montant) AS total,
                 RANK() OVER (PARTITION BY a.ville ORDER BY SUM(c.montant) DESC) AS rang
          FROM commande c
          JOIN client cl ON cl.id = c.client_id
          JOIN adresse a ON a.id = cl.adresse_id
          GROUP BY a.ville, EXTRACT(MONTH FROM c.date)
        ) t
        WHERE rang <= 3
        """)
    .getResultList();
```

Ce n'est pas un échec de votre part : c'est **l'usage correct de l'outil correct**. On y revient dans la page [alternatives]({{< relref "limites_orm/alternatives" >}}).
