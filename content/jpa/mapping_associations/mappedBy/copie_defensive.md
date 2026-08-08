+++
title = "Copie défensive"
weight = 60
+++

> [!ressource] Ressources
> - [José Paumard - Protéger le contenu d'une relation multivaluée par copie défensive](https://youtu.be/dwX66leY3WM?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)

Précédemment, nous avons vu que le *mappedBy* permet de synchroniser les deux côté de la relation. Mais rien ne nous empêche d'écrite le code suivant.

```java 
public class Departement { @OneToMany(mappedBy="departement") public List<Commune> communes }
public class Commune { @ManyToOne public Departement departement }
```

Puis de récupérer la liste des communes d'un département et de les supprimer ou d'ajouter une nouvelle commune sans utiliser les méthode add/remove qui sont garante de la synchronisation.

```java
departement.getCommunes().clear();
departement.getCommunes().add(new Commune()); // possible mais pas propre
```

Dans sa vidéo, José Paumard nous présente la copie défensive. C'est-à-dire que la méthode `getCommunes()` ne retourne pas la vraie liste mais une copie

```java
public List<Commune> getCommunes() {
    // return this.communes; DEVIENT
    return new ArrayList<>(communes)
}
```

En créant une nouvelle liste :
- `departement.getCommunes().clear()` n'aura plus d'effet sur les informations en base de données car la liste (new ArrayList<>) est une nouvelle liste non managée par JPA ([cycle de vie]({{< relref "jpa/specification/cyle_de_vie" >}}))
- MAIS les objets de type `Commune`, eux reste managé par JPA, nous pouvons faire `departement.getCommunes().get(0).setName("new name")` et ceci sera persisté en base de données


## Copie défensive, une bonne idée ?
La copie défensive permet d'éviter qu'un développeur passe outre les méthode `addCommune` et `removeCommune`. Néanmoins l'objectif d'une entité est de propager l'état, si on souhaite faire une action sur une entité il ne nous faut pas une copie (qui est par définition non managée par JPA).

> No, you don’t need defensive copies. Those will actually work against you with Hibernate since the goal o an entity is to propagate changes. Otherwise, you’d use a DTO. [^1]

[^1]: https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/