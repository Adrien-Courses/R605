+++
title = "Copie défensive / Synchronisation"
weight = 60
+++

> [!ressource] Ressources
> - [José Paumard - Protéger le contenu d'une relation multivaluée par copie défensive](https://youtu.be/dwX66leY3WM?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)
> - [How to synchronize bidirectional entity associations with JPA and Hibernate](https://vladmihalcea.com/jpa-hibernate-synchronize-bidirectional-entity-associations/)
> - [Save Child Objects Automatically Using JPA](https://www.baeldung.com/jpa-save-child-objects-automatically)

```java
public class Commune {
    @ManyToOne
    public Departement departement
}
```

```java
public class Departement {
    @OneToMany(mappedBy="departement")
    public List<Commune> communes
}
```

## Le problème
Nous souhaitons récupérer l'ensemble des communes du département et par erreur nous les supprimons. Si nous appelons une méthode de persistance (`entityManager.merge()`) après avoir vidé la liste, JPA essaiera de mettre à jour la base de données.

```java
List<Commune> communes = departement.getCommunes();
communes.clear();
```

## La copie défensive
Ainsi, par précaution l'ensemble des modifications de la liste `commune` doivent avoir lieu à l'intérieur de la classe `Département`. Dans notre cas, la méthode `getCommunes()` devrait retourner une *copie défensive* de la liste
```java
public List<Commune> getCommunes() {
    return new ArrayList<>(this.communes);
}
```

## Mais ...
Mais seule la *copie défensive* ne suffit pas, en effet nous pouvons avoir besoin d'ajouter et de supprimer une commune à un département.

Supposons la méthode suivante dans la classe `Commune` 
```java
void setDepartement(Departement d) {
    this.departement = d;
    d.getCommunes().add(this); // this étant la nouvelle commune à ajouter au département
}
```

Ceci ne fonctionnera pas car `getCommunes()` renvoie une *copie défensive*. Ainsi si on persiste en l'état nous n'aurons pas en base de données la nouvelle communes du département. Or c'est bien ce que l'on souhaite réaliser, mettre à jour la liste des communes du département en base de données. Pour régler ce problème, nous allons ajouter les méthodes suivantes à notre `Departement`

```java
public void addCommune(Commune c) {
    this.communes.add(c);
}

public void removeCommune(Commune c) {
    this.communes.remove(c);
}
```

```java
void setDepartement(Departement d) {
    this.departement = d;
    d.addCommune(this); // this étant la nouvelle commune à ajouter au département
}
```

La *copie défensive* impose donc de créer des méthodes permettant de muter ces éléments internes

> The reason for this issue is that, for the bidirectional relationship, we need to explicitly specify the reference to the parent entity.
