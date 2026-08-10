+++
title = "MappedSuperClass"
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