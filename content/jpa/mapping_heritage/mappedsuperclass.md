+++
title = "@MappedSuperClass"
description = "L'annotation @MappedSuperclass : factoriser des attributs communs sans créer d'entité, et la contrainte sur les requêtes polymorphiques."
weight = 10
+++

> [!ressource] Ressource
> [ 08 - 07 - Mapper des champs factorisés dans une class abstraite avec MappedSuperClass ](https://youtu.be/_BYzCo4CvZc?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

> [!affirmation] Objectif
> Il arrive parfois que la relation d’héritage n’ait pas de sens dans le modèle relationnel. Dans ce cas, la classe parente n’est pas vraiment une entité au sens JPA, on parle de mapped superclass.

L’utilisation de `@MappedSuperclass` implique qu’il n’existe pas de relation entre les classes filles pour JPA. Comme la super classe n’est pas un entité, il n’est pas possible d’effectuer des requêtes sur la super classe ni d’utiliser des requêtes polymorphiques.
- On veut juste récupérer les champs (attribut java) de la classe mère

## Exemple
```java
@MappedSuperclass
public abstract class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @ManyToOne
    private Client client;
}
```

```java
@Entity
public class Devis extends Document {

    private Double montantEstime;
}
```

```java
@Entity
public class Facture extends Document {

    private Double montantTotal;
    private Boolean estPayee;
}
```

- Ici, on n'utilise pas `@Inheritance`, donc chaque sous-classe (Devis et Facture) aura sa propre table avec toutes les colonnes héritées de Document.
- Si tu veux par exemple une table unique pour toutes les entités (single table strategy), on peut utiliser `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` sur Document au lieu de `@MappedSuperclass`. 

## Principale contrainte
On ne pourra pas faire de `List<Document>`

```java
public class Client {
    @OneToMany(mappedBy = "client", ...) // 🔴 Interdit car Document n'est pas une entité
    private List<Document> documents; 
}
```

Des solutions :
- Se demander si document ne devrait pas être une entité ?
- Utiliser deux listes dans la classe `Client`

## La pagination

Sur une entité concrète, la pagination est **optimale**. Chaque table est autonome et complète, **par contre il n'existe aucune requête polymorphique** : on pagine donc toujours une table unique, avec un index pleinement exploité.

```sql
SELECT * FROM facture ORDER BY date DESC LIMIT 20 OFFSET 0;
```

Le piège est ailleurs : **on ne peut pas paginer la hiérarchie**. Si le besoin est « les 20 derniers documents du client, devis et factures confondus », aucune requête JPQL ne peut l'exprimer puisque `Document` n'est pas une entité. Il faut charger les deux listes séparément et les fusionner côté Java.

```java
List<Devis> devis = em.createQuery("select d from Devis d order by d.date desc", Devis.class)
                      .setMaxResults(20).getResultList();

List<Facture> factures = em.createQuery("select f from Facture f order by f.date desc", Facture.class)
                           .setMaxResults(20).getResultList();

// puis fusionner, retrier et tronquer à 20 en mémoire
```

Cela fonctionne pour la première page, mais se dégrade vite : pour obtenir la page *N*, il faut ramener *N*×20 lignes de **chaque** table avant de trier, et le nombre total d'éléments reste indéterminable sans un `count` par table.

> [!note] À retenir
> C'est le prolongement direct de la contrainte ci-dessus. Si un besoin de vue transverse et paginée existe, c'est le signe que `Document` devrait être une entité — et donc que [SINGLE_TABLE]({{< relref "single_table" >}}) ou [JOINED]({{< relref "joined" >}}) serait le bon choix.