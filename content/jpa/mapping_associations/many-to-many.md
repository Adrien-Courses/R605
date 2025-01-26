+++
title = "@ManyToMany"
weight = 40
+++

> [!ressource] Ressources
> - [KooR - Mapping d'une relation @ManyToMany](https://koor.fr/Java/TutorialJEE/jee_jpa_many_to_many.wp)
> - [Best way to map the JPA and Hibernate ManyToMany relationship](https://vladmihalcea.com/the-best-way-to-use-the-manytomany-annotation-with-jpa-and-hibernate/)

Contrairement à ce que nous avions vu dans les chapitres précédents, il n'y a qu'une seule manière de réaliser une relation de type « Many-To-Many » en base de données : il faut impérativement passer par une table d'association. 

## Cas unidirectionnelle 
```java
@Entity
public  class Musicien  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToMany
    private Collection<Instrument> instruments ;

    // reste de la classe
}

@Entity
public  class Instrument  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // reste de la classe
}
```

De manière optionnelle, nous pouvons préciser la table de jointure ainsi que le nom des colonne

```java
@JoinTable(
    name = "musicien_instrument",
    joinColumns = @JoinColumn(name = "musicien_id"),
    inverseJoinColumns = @JoinColumn(name = "instrument_id")
)
private Set<Instrument> instruments = new HashSet<>();
```

Avec une seul direction, seule l'entité `Musicien` peut accéder à la liste des instruments. Ainsi si on souhaite savoir quels musiciens jouent un instrument particulier, nous devons soit :
- Effectuer une requête spécifique sur la table d'association.
- Modifier la structure pour inclure la bidirectionnalité.

## Cas bidirectionnelle
```java
@Entity
public  class Musicien  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToMany
    private Collection<Instrument> instruments ;

    // reste de la classe
}

@Entity
public  class Instrument  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToMany(mappedBy="instruments")
    private Collection<Musicien> musiciens ;

    // reste de la classe
}
```

Dans ce deuxième cas, la structure de tables générée est la même. Notons encore une fois que c'est la présence de l'attribut `mappedBy` qui crée le caractère bidirectionnel de la relation. Si l'on ne le met pas, alors JPA créera une seconde table de jointure. 
