+++
title = "Entité JPA"
weight = 10
+++

> [!ressource] Ressources
> - [Jakarta Entities - Documentation](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#entities)


```java
// définit l'entité mappant la table « sport » dans le schéma par défaut
@Entity
@Table(name = "sport")
public class Sport implements Serializable {
    // définit l'attribut identifiant « codeSport » qui mappe la clé primaire
    // « code_sport » et qui est obligatoire
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_sport")
    private Integer codeSport;
    // l'attribut « intitule » mappe la colonne « intitule » : optionnel car ont
    // le même nom, le mapping se ferait implicitement et par défaut
    @Column(name = "intitule", nullable = false)
    private String intitule;

    public Sport() { }
}
```

## Entité et Table 
- Une entité, déclarée par l’annotation `@Entity` définit une classe Java comme étant persistante et donc associée à une table dans la base de données.
- Par défaut, une entité est associée à la table portant le même nom que la classe. Mais il est possible d'indiquer le nom de la table par une annotation `@Table`

## Constructeur

- La norme JPA requiert de créer un constructeur vide pour chaque entité.  

## Identifiant

> [!ressource] Ressource
> [How do Identity, Sequence, and Table (sequence-like) generators work in JPA and Hibernate](https://vladmihalcea.com/hibernate-identity-sequence-and-table-sequence-generator/)

- `@Id` permet de définir que l'attribut est l'identifiant de l'objet (*Primary Key*)
- `@GeneratedValue`, si la clé primaire est générée automatiquement par ex. par le SGBD (IDENTITY) ou le moteur JPA (AUTO)

On indique ici la stratégie de génération de l’identifiant unique, soit en laissant Hibernate faire le meilleur choix (plus simple) avec `AUTO`, soit en indiquant
d’autres options `TABLE, SEQUENCE, IDENTITY, UUID`

## Colonnes
- Par défaut, toutes les propriétés non-statiques d’une classe-entité sont considérées comme devant être stockées dans la base
- `@Column` (optionnelle) permet de préciser des paramètres

Les principaux attributs pour `@Column` sont :
- `name` indique le nom de la colonne dans la table;
- `length` indique la taille maximale de la valeur de la propriété;
- `nullable` (false ou true) indique si la colonne accepte ou non des valeurs à NULL
- `unique` indique que la valeur de la colonne est unique

```java
@Column(name = "email", length = 255, nullable = false, unique = true)
private String email;
```