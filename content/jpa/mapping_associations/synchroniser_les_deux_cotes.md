+++
title = "Synchroniser les deux côtés"
description = "Dans une relation bidirectionnelle, seul le côté propriétaire écrit la clé étrangère, mais les deux doivent être mis à jour : pourquoi, et comment le garantir avec des méthodes addX/removeX."
weight = 50
+++

> [!ressource] Ressources
> - [How to synchronize bidirectional entity associations with JPA and Hibernate](https://vladmihalcea.com/jpa-bidirectional-sync-methods/)
> - [The best way to map a @OneToMany relationship with JPA and Hibernate](https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/)
> - [Mise en oeuvre dans le TD3]({{< relref "td_tp/jpa_mapping/td3/" >}})

> [!affirmation] Objectif
> Une [relation bidirectionnelle]({{< relref "jpa/mapping_associations/unidirectional_bidirectional" >}}) est représentée par **deux champs Java** pour une **seule** relation en base. Rien dans le langage ne les relie : c'est au développeur de les tenir cohérents.

Reprenons le cas d'une `Commande` composée de plusieurs `LigneDetail`.

```java
@Entity
public class Commande {

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL)
    private List<LigneDetail> ligneDetails = new ArrayList<>();
}

@Entity
public class LigneDetail {

    @ManyToOne
    @JoinColumn(name = "commande_id")
    private Commande commande;
}
```

## Un seul côté est écrit en base

C'est le point de départ de tout le raisonnement. La clé étrangère `commande_id` se trouve dans la table `LigneDetail`, et elle est pilotée par le champ `LigneDetail.commande` — le **côté propriétaire**.

Le `mappedBy` sur la collection signifie littéralement : *« je ne suis pas responsable de la persistance de cette relation, va voir de l'autre côté »*.

La collection ne sert qu'à deux choses

- déterminer quelles entités la [cascade]({{< relref "cascade" >}}) va visiter ;
- détecter les orphelins, si [`orphanRemoval = true`]({{< relref "orphan_removal" >}}).

Elle n'écrit **jamais** la clé étrangère.

## Les deux échecs symétriques

### Modifier seulement le côté inverse

```java
LigneDetail ligne = new LigneDetail();
commande.getLigneDetails().add(ligne);
// em.perist(commande); inutile car commande est un entité MANAGED
// em.persit(ligne); ligne.commande valant NULL ne fera rien
```

```sql
INSERT INTO LigneDetail (commande_id) VALUES (NULL);
```

L'`INSERT` a bien lieu — la cascade `PERSIST` traverse la collection et atteint la nouvelle ligne — mais `commande_id` vaut `NULL`, puisque cette valeur provient de `ligne.commande`, jamais renseigné. **La ligne existe, la relation non.**

### Modifier seulement le côté propriétaire

```java
ligne.setCommande(commande);
em.persist(ligne);       // obligatoire ici, c'est lui qui déclenche l'INSERT
// em.persist(commande); ne fonctionne pas : commande.ligneDetails ne contient pas
//                       la ligne, donc la cascade ne l'atteint jamais
em.flush();
```

> [!note] Note
> C'est le miroir du cas précédent : la cascade se propage le long de la collection, donc l'entité à passer à `persist()` dépend du côté que l'on a modifié. Voir [Sur quelle entité appeler persist() ?]({{< relref "cascade#sur-quelle-entité-appeler-persist-" >}})

```sql
INSERT INTO LigneDetail (commande_id) VALUES (1);   -- ✅ la base est correcte
```

Cette fois la base est juste. Mais l'objet, lui, ment :

```java
commande.getLigneDetails().size();   // ⚠️ ne contient pas la nouvelle ligne
```

Hibernate **ne rafraîchit pas** une collection déjà chargée quand on modifie le côté propriétaire. Et comme le contexte de persistance rend toujours la même instance de `Commande`, la collection reste périmée pendant toute la transaction.

C'est le cas le plus sournois. Le code qui suit — un calcul de total, une sérialisation JSON, une règle métier — travaille sur un graphe faux. Ça marche en base, ça échoue en mémoire, et le bug disparaît dès qu'on relit depuis une nouvelle session : il est donc très difficile à reproduire.

> [!warning] À retenir
> La relation est bidirectionnelle **en Java**, elle doit donc être mise à jour des deux côtés. Elle n'est persistée que par **un seul**.

## Les méthodes de synchronisation

Plutôt que de répéter les deux affectations partout, on les encapsule dans le parent.

```java
@Entity
public class Commande {

    public void addLigneDetail(LigneDetail ligneDetail) {
        ligneDetails.add(ligneDetail);
        ligneDetail.setCommande(this);
    }

    public void removeLigneDetail(LigneDetail ligneDetail) {
        ligneDetails.remove(ligneDetail);
        ligneDetail.setCommande(null);
    }
}
```

L'appelant n'a plus qu'un seul geste à faire, et l'oubli devient impossible.

```java
commande.addLigneDetail(new LigneDetail());
```

> [!note] Convention
> Ces méthodes se placent sur le **parent**, celui qui porte la collection. C'est lui qui connaît les deux extrémités de la relation.

### Le rôle de equals()

`ligneDetails.remove(ligneDetail)` s'appuie sur `equals()`. Sans implémentation correcte sur `LigneDetail`, le retrait échoue silencieusement — la collection reste inchangée, et rien n'est supprimé. C'est une cause fréquente d'« `orphanRemoval` qui ne fonctionne pas ».

## Empêcher le contournement

Rien n'oblige un développeur à passer par ces méthodes.

```java
commande.getLigneDetails().add(ligne);   // possible, et cassé
```

Une première réponse consiste à ne pas exposer la liste directement.

```java
public List<LigneDetail> getLigneDetails() {
    return Collections.unmodifiableList(ligneDetails);
}
```

Toute modification hors des méthodes de synchronisation lève alors une `UnsupportedOperationException`, ce qui déplace l'erreur à l'endroit exact du problème.

> [!warning] Et la copie défensive ?
> Retourner `new ArrayList<>(ligneDetails)` est une autre approche, mais elle pose d'autres problèmes — voir [Copie défensive]({{< relref "mappedBy/copie_defensive" >}}). `Collections.unmodifiableList` est préférable : c'est une **vue** sur la vraie collection, donc Hibernate continue de la gérer normalement, là où une copie sort du périmètre du contexte de persistance.

## Faut-il vraiment du bidirectionnel ?

La synchronisation est le **prix** du bidirectionnel. Avant de le payer, il vaut la peine de se demander s'il est utile.

Si la navigation depuis le parent n'est pas nécessaire, un simple `@ManyToOne` unidirectionnel supprime le problème à la racine : une seule référence, qui est aussi le côté propriétaire.

```java
@Entity
public class LigneDetail {
    @ManyToOne
    @JoinColumn(name = "commande_id")
    private Commande commande;
}
// Commande n'a pas de collection
```

Voir [Uni/Bidirectionnelle]({{< relref "unidirectional_bidirectional" >}}) pour la comparaison complète des variantes.

## En pratique

Ces mécanismes sont mis en application, avec le SQL réellement exécuté à chaque étape, dans les travaux dirigés

- [TD3 — l'ajout d'une ligne]({{< relref "td_tp/jpa_mapping/td3" >}}) ;
- [TD3(bis) — la suppression d'une ligne]({{< relref "td_tp/jpa_mapping/td3-bis" >}}).
