+++
title = "@ManyToMany"
weight = 40
+++

> [!ressource] Ressources
> - [KooR - Mapping d'une relation @ManyToMany](https://koor.fr/Java/TutorialJEE/jee_jpa_many_to_many.wp)

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

Dans ce deuxième cas, la structure de tables générée est la même. Notons encore une fois que c'est la présence de l'attribut mappedBy qui crée le caractère bidirectionnel de la relation. Si l'on ne le met pas, alors JPA créera une seconde table de jointure. 
