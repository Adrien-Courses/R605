+++
title = "Composant JPA (Embeddable)"
weight = 11
+++

> [!definition] Définition
> Un composant, au contraire, est un objet sans identifiant, qui ne peut être persistant que par rattachement à une entité.

La notion de composant résulte du constat qu’une ligne dans une base de données peut parfois être décomposée en plusieurs sous-ensembles dotés chacun d’une logique autonome.
- Réutilisable dans plusieurs entités
- Pas de table séparée
- Mappage intégré dans la table principale
- Permet de structurer des données complexes

## Exemple
L'exemple classique est celui d'une adresse. Par exemple un client et une société peuvent avoir une adresse donc chacune des deux tables aura les colonnes suivantes *rue*, *ville* et *code postal*.

```
Societe
| id  | ... | rue | ville | code_postal |
|     |     |     |       |             |

Client
| id  | ... | rue | ville | code_postal |
|     |     |     |       |             |
```

Via les composants nous n'avons pas à écrire l'ensemble des attributs dans nos deux classes Java mais pouvons coder une classe `Adresse` qui :
- n'a pas d'identifiant unique
- ne sera pas représentée sous la forme d'une table

Permettant ainsi la réduction du code dupliqué

```java
@Embeddable
public class Adresse {
    @Column(name = "rue")
    private String rue;
    
    @Column(name = "ville")
    private String ville;
    
    @Column(name = "code_postal")
    private String codePostal;
}

@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nom;
    
    @Embedded
    private Adresse adresse;
}

@Entity
public class Societe {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nomEntreprise;
    
    @Embedded
    private Adresse adresse;
}
```

## Surcharge nom colonne
Supposons une petite différence au niveau du nom des colonnes en base de données
- les deux tables ont la notion d'adresse mais pas le même nom d'attribut

```
Societe
| id  | ... | soc_rue | soc_ville | soc_code_postal |
|     |     |         |           |                 |

Client
| id  | ... | rue | ville | code_postal |
|     |     |     |       |             |
```

```java
// Adresse et Client restent identiques

@Entity
public class Societe {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nomEntreprise;
    
    @Embedded
        @AttributeOverrides({
            @AttributeOverride(name = "rue", column = @Column(name = "soc_rue")),
            @AttributeOverride(name = "ville", column = @Column(name = "soc_ville")),
            @AttributeOverride(name = "codePostal", column = @Column(name = "soc_code_postal"))
    })
    private Adresse adresse;
}
```

Nous pouvons surcharger le nom des colonnes via l'annotation `AttributeOverride`
- l'attribut `rue` de la classe `Adresse` correspondra à la colonne `soc_rue` dans la table `societe`