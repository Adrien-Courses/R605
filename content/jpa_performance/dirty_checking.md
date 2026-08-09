+++
title = "Le coût du dirty checking"
description = "Le coût caché du dirty checking : le snapshot de chaque entité gérée, la charge au flush, et comment garder un contexte de persistance léger."
weight = 40
+++

> [!ressource] Ressource
> - [Vlad Mihalcea - The anatomy of Hibernate dirty checking](https://vladmihalcea.com/the-anatomy-of-hibernate-dirty-checking/)
> - Rappel du cours : [Flushing & Dirty Checking]({{< relref "jpa/specification/cycle_de_vie/flushing" >}})

Le [dirty checking]({{< relref "jpa/specification/cycle_de_vie/flushing" >}}) est sans doute la fonctionnalité la plus confortable de JPA : vous modifiez un objet Java, et l'`UPDATE` apparaît tout seul. Mais cette magie a un coût, et ce coût est **proportionnel à la taille du contexte de persistance**.

## Comment ça marche réellement

Quand une entité devient `MANAGED`, Hibernate ne se contente pas de garder une référence vers l'objet. Il en conserve aussi une **copie de l'état initial**, champ par champ : le *snapshot*.

Au moment du flush, Hibernate parcourt **toutes** les entités gérées, et pour chacune compare **chaque propriété** à son snapshot afin de déterminer ce qui a changé.

```
Coût d'un flush ≈ (nombre d'entités gérées) × (nombre de propriétés par entité)
```

Deux conséquences directes :

- **Mémoire** : une entité chargée occupe environ **deux fois** sa taille (l'objet + son snapshot).
- **CPU** : le coût du flush ne dépend pas du nombre d'entités *modifiées*, mais du nombre d'entités *gérées*.

## Le scénario qui fait mal

```java
@Transactional
public void traiter() {
    List<Commande> commandes = repository.findAll(); // 50 000 entités gérées

    for (Commande c : commandes) {
        if (c.estEnRetard()) {
            c.setStatut(Statut.RETARD);          // on en modifie 12
        }
        auditRepository.save(new Audit(c.getId())); // ← déclenche un flush !
    }
}
```

Vous avez modifié **12** commandes. Mais :

- chaque `save()` (ou toute requête JPQL, à cause du [`FlushModeType.AUTO`]({{< relref "jpa/specification/cycle_de_vie/flushing" >}})) peut déclencher un flush ;
- chaque flush parcourt les **50 000** entités et leurs snapshots ;
- soit 50 000 × 50 000 comparaisons sur l'ensemble de la boucle.

Le code paraît linéaire à la lecture ; il est en réalité **quadratique**. C'est un profil de bug typique : imperceptible sur les 20 lignes du jeu de test, mortel sur les données de production.

## Comment limiter le coût

**1. Garder les contextes de persistance petits et courts.** C'est la règle principale. Une transaction ne devrait charger que ce dont elle a besoin. Une transaction qui gère 100 000 entités est presque toujours le signe qu'on aurait dû faire un [bulk update]({{< relref "jpa_performance/bulk" >}}).

**2. Utiliser les requêtes en lecture seule.** Si vous ne modifiez rien, dites-le : Hibernate n'a alors pas besoin de conserver de snapshot.

```java
// JPA / Hibernate
List<Produit> produits = em.createQuery("SELECT p FROM Produit p", Produit.class)
    .setHint("org.hibernate.readOnly", true)
    .getResultList();
```

```java
// Spring Data JPA
@Transactional(readOnly = true)
public List<Produit> lister() { ... }
```

**3. Utiliser des projections DTO.** Un DTO n'est pas une entité : il n'est **pas géré**, donc pas de snapshot, pas de dirty checking, pas de coût au flush. C'est la solution idéale pour tous les écrans de consultation. Voir [Projections]({{< relref "jpa_requetes/projection" >}}).

**4. Découper avec `flush()` + `clear()`** dans les traitements par lots, comme vu dans la page [écritures en masse]({{< relref "jpa_performance/bulk" >}}).

> [!affirmation] À retenir
> Le contexte de persistance est un **cache de travail transactionnel**, pas un cache applicatif. Il est conçu pour contenir quelques dizaines d'entités le temps d'une unité de travail métier — pas des dizaines de milliers.
