+++
title = "MultipleBagFetchException"
weight = 50
+++

> [!ressource] Ressource
> - [Vlad Mihalcea - How to fix MultipleBagFetchException](https://vladmihalcea.com/hibernate-multiplebagfetchexception/)

Voici un piège que vous rencontrerez tôt ou tard, et dont le message d'erreur est particulièrement obscur.

## La situation

Une entité avec deux collections :

```java
@Entity
public class Commande {
    @Id private Long id;

    @OneToMany(mappedBy = "commande")
    private List<LigneCommande> lignes = new ArrayList<>();

    @OneToMany(mappedBy = "commande")
    private List<Paiement> paiements = new ArrayList<>();
}
```

Pour éviter le [problème N+1]({{< relref "jpa_deeper/fetch/index" >}}), vous appliquez ce que vous avez appris et vous faites un `JOIN FETCH` sur les deux collections :

```java
em.createQuery("""
    SELECT c FROM Commande c
    JOIN FETCH c.lignes
    JOIN FETCH c.paiements
    WHERE c.id = :id
    """, Commande.class);
```

Et vous obtenez :

```
org.hibernate.loader.MultipleBagFetchException:
    cannot simultaneously fetch multiple bags
```

## Pourquoi ?

Un **bag** est le terme Hibernate pour une collection **non ordonnée et autorisant les doublons** — c'est exactement ce qu'est un `List` sans `@OrderColumn`.

Le problème est mathématique. Si une commande a 3 lignes et 2 paiements, la jointure SQL produit un **produit cartésien** de 3 × 2 = 6 lignes :

| commande | ligne | paiement |
|---|---|---|
| 1 | L1 | P1 |
| 1 | L1 | P2 |
| 1 | L2 | P1 |
| 1 | L2 | P2 |
| 1 | L3 | P1 |
| 1 | L3 | P2 |

Chaque ligne apparaît 2 fois, chaque paiement 3 fois. Avec un `Set`, Hibernate peut dédoublonner. Avec un `List` (un *bag*), il n'a **aucun moyen** de savoir si `L1` apparaissant deux fois est un doublon artificiel de la jointure ou un vrai doublon métier. Il refuse donc de deviner, et lève une exception.

> [!affirmation] Le bon réflexe
> Cette exception n'est pas une limitation arbitraire d'Hibernate : c'est **une protection**. Elle vous empêche de récupérer silencieusement des données fausses. Sans elle, vous auriez des collections dupliquées et des montants totaux erronés.

## Les solutions

### (Fausse) Solution 1 : utiliser des `Set`

> [!Ressource] Ressource
> - [Set is the worst "solution"](https://stackoverflow.com/questions/4334970/hibernate-throws-multiplebagfetchexception-cannot-simultaneously-fetch-multipl/51055523#51055523)

```java
@OneToMany(mappedBy = "commande")
private Set<LigneCommande> lignes = new HashSet<>();

@OneToMany(mappedBy = "commande")
private Set<Paiement> paiements = new HashSet<>();
```

L'exception disparaît, Hibernate dédoublonne correctement. **Mais** la requête SQL exécutée reste le produit cartésien : avec 100 lignes et 50 paiements, la base transfère 5 000 lignes pour n'en garder que 150. Le problème de performance existe toujours, il est simplement devenu invisible.

Cette solution suppose par ailleurs un `equals()`/`hashCode()` correct sur vos entités.

### Solution 2 (recommandée) : deux requêtes

La meilleure solution est en général de **ne pas** tout charger d'un coup :

```java
// Requête 1 : la commande + ses lignes
Commande commande = em.createQuery("""
        SELECT c FROM Commande c
        JOIN FETCH c.lignes
        WHERE c.id = :id
        """, Commande.class)
    .setParameter("id", id)
    .getSingleResult();

// Requête 2 : les paiements de la même commande
em.createQuery("""
        SELECT c FROM Commande c
        JOIN FETCH c.paiements
        WHERE c.id = :id
        """, Commande.class)
    .setParameter("id", id)
    .getSingleResult();
```

La deuxième requête peut sembler inutile puisqu'on ignore son résultat. En réalité elle est essentielle : les deux requêtes s'exécutant dans **le même contexte de persistance**, Hibernate reconnaît qu'il s'agit de la même instance de `Commande` (grâce au [cache de premier niveau]({{< relref "jpa_deeper/cache" >}})) et **remplit** simplement sa collection `paiements`.

Résultat : deux requêtes simples de 100 et 50 lignes, au lieu d'une requête de 5 000 lignes.

### Solution 3 : `@BatchSize` ou Entity Graph

Pour des cas plus larges, on peut aussi laisser les collections en `LAZY` et laisser Hibernate les charger par paquets :

```java
@OneToMany(mappedBy = "commande")
@BatchSize(size = 25)
private List<LigneCommande> lignes = new ArrayList<>();
```

Hibernate émettra alors un `SELECT ... WHERE commande_id IN (?, ?, ?, …)` pour 25 commandes à la fois, ce qui transforme un N+1 en N/25+1.
