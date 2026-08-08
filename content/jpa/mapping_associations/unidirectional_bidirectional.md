+++
title = "Uni/Bidirectionnelle"
weight = 5
+++

> [!ressource] Ressource
> [Map Associations with JPA and Hibernate](https://thorben-janssen.com/ultimate-guide-association-mappings-jpa-hibernate/#uniOneToOne)

> You can map each of them as a uni- or bidirectional association. That means you can either model them as an attribute on only one of the associated entities or on both.** That has no impact on your database mapping, but it defines in which direction you can use the relationship in your domain model and JPQL or Criteria queries**.

Un premier constat, très important: *en Java nous pouvons représenter l’association de trois manières*. Supposons le cas d'une personne et d'un passeport.

- Dans une `Personne` on place un lien vers un `Passeport` (unidir.)
- Dans un `Passeport` on place un lien vers une `Personne` (unidir.)
- On place un lien dans les deux côtés (bidir.)

```java
// Cas 1
public class Personne {
    private Passeport passeport
}

// Cas 2
public class Passeport {
    private Personne personne
}

// Cas 3
public class Personne {
    private Passeport passeport
}
public class Passeport {
    private Personne personne
}
```

*Rappelons que dans une base relationnelle, le problème ne se pose pas: une association représentée par une clé étrangère est par nature bidirectionnelle.* Néanmoins déterminer comment relier nos objets (les trois choix sont possibles) impactera :
- La navigation entres nos entités Java
- Le fait ou non de pouvoir écrire une requête JPQL ou Criteria
- Les performances (e.g. [@OneToMany unidirectionnelle performance]({{< relref "one-to-many#performance" >}}))

## Exemple
Si nous souhaitons représenter qu'une Commande est constituée de plusieurs lignes (LigneCommande) alors le code suivant est suffisant
```java
@Entity
public class Order {
    @OneToMany
    @JoinColumn(name = “fk_order”) // indique à Hibernate d'utiliser la colonne fk_order de la table OrderItem pour relier les deux tables
    private List<OrderItem> items = new ArrayList<OrderItem>();
}
```

On peut maintenant récupérer toutes les lignes d'une commande, ou encore ajouter/supprimer des lignes. Et nous ne pourrons naviguer que dans ce sens (Order --> OrderItem)

Ainsi, nous ne pouvons pas directement accéder à la commande (Order) d'un OrderItem sans effectuer une requête explicite. Il nous faut rendre la relation bidirectionnelle

```java
@Entity
public class Order {
    @OneToMany(mappedBy = “order”) // utilisation de la propriété mappedBy
    private List<OrderItem> items = new ArrayList<OrderItem>();
}
```

```java
@Entity
public class OrderItem {
    @ManyToOne
    @JoinColumn(name = “fk_order”) // optionnel, permet de préciser le nom de la colonne
    private Order order;
}
```

Nous reviendrons en détail sur les impacts et les conséquentes des différentes solutions dans les sections suivantes
