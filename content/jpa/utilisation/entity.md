+++
title = "Entité JPA"
weight = 10
+++

> [!ressource] Ressources
> - [Liste des annotations](https://jakarta.ee/specifications/persistence/2.2/apidocs/javax/persistence/package-summary)

Ci-dessous un exemple d'une entité JPA

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
@Column(name = "intitule")
private String intitule;
```

- `@Entity`, définit une classe comme étant une entité EJB dont les instances
pourront être rendues persistantes
- `@Table(name = "sport")`, définit la table primaire mappée sur la class
- `@Id`, si l'attribut est un identifiant d'objet
- `@Column`, optionnel, précision de paramètres
- `@GeneratedValue`, si la clé primaire est générée automatique-
ment par ex. par le SGBD (IDENTITY) ou le moteur JPA (AUTO)
