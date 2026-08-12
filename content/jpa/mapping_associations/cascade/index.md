+++
title = "Cascade"
description = "Les types de cascade JPA : PERSIST, MERGE, REMOVE, REFRESH, DETACH et ALL, et la propagation des opérations du parent vers ses enfants."
weight = 60
+++

> [!ressource] Ressource
> - [A beginner’s guide to JPA and Hibernate Cascade Types](https://vladmihalcea.com/a-beginners-guide-to-jpa-and-hibernate-cascade-types/)
> - [Why you should avoid CascadeType.REMOVE for to-many associations and what to do instead](https://thorben-janssen.com/avoid-cascadetype-delete-many-assocations/)
> - [How does JPA orphanRemoval=true differ from the ON DELETE CASCADE DML clause](https://stackoverflow.com/questions/4329577/how-does-jpa-orphanremoval-true-differ-from-the-on-delete-cascade-dml-clause)

En JPA/Hibernate, la cascade est un mécanisme qui permet de propager automatiquement certaines opérations (comme `persist`, `remove`, `merge`, etc.) d'une entité parent à ses entités enfants. Cela simplifie la gestion des relations en évitant d’avoir à sauvegarder ou supprimer manuellement chaque entité associée.

## Les différents types

- `CascadeType.PERSIST` : Lorsqu’une entité est sauvegardée (persist), ses entités associées sont également sauvegardées.
- `CascadeType.REMOVE` : Si l’entité principale est supprimée (remove), toutes ses entités associées le sont aussi.
- `CascadeType.REFRESH` : Recharge l'entité depuis la base de données et annule les modifications non sauvegardées.
- `CascadeType.DETACH` : Lorsque l’entité principale est détachée (detach), ses entités associées le sont aussi.

- `CascadeType.MERGE` : Lorsqu'une entité détachée est réattachée (merge), ses entités associées le sont aussi.

- `CascadeType.ALL` : Combine tous les types de cascade (`PERSIST`, `MERGE`, `REMOVE`, `REFRESH`, `DETACH`).

> [!note] Note
> Par défaut, **aucune cascade n'est appliquée**. Il faut donc la déclarer explicitement.
>
> À ne pas confondre avec [`orphanRemoval`]({{< relref "orphan_removal" >}}), qui traite le cas d'un enfant retiré de la collection alors que le parent, lui, reste en vie.

## Exemple
Supposons une entité `Owner` qui possède plusieurs animaux `Pet`, nous représentons donc la relation `@OneToMany` suivante

```java
@Entity
public class Owner {
    ...

    @OneToMany(mappedBy = "owner")
    private List<Pet> pets = new ArrayList();
}

@Entity
public class Pet {
    ...

    @ManyToOne
    @JoinColumn(name = "owner_id")  
    private Owner owner;            // assure le bidirectionnel
}
```

Puis nous créons les instances suivantes

```java
Owner owner = new Owner("John Doe");

Pet pet1 = new Pet("Buddy", "dog", 3);
Pet pet2 = new Pet("Charlie", "dog", 4);

owner.addPet(pet1);
owner.addPet(pet2);
```

Si nous souhaitons persister en base de données l'ensemble des éléments alors nous devons faire les appels suivants

```java
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(owner); // explicitement confirmer la persistance pour les trois entités
em.persist(pet1);  // en commençant par le owner
em.persist(pet2); 
em.getTransaction().commit();
```

Il faut donc faire attention à l'ordre de persistance, si nous essayons de persister en premier les animaux nous obtiendrons une `TransientPropertyValueException`
- signifiant qu'Hibernate essaie de sauvegarder un `Pet`, mais que sa propriété `owner` (fk) fait référence à un `Owner` qui n'a pas encore été persisté.

=> Ceci est donc contraignant, nous pouvons laisser JPA/Hibernate propager en cascade les instructions de persistance via la propriété `cascade`.

```java
@Entity
public class Owner {
    ...

    @OneToMany(mappedBy = "owner", cascade=CascadeType.ALL)
    private List<Pet> pets = new ArrayList();
}

@Entity
public class Pet {
    ... // Identique
}
```

Maintenant en précisant uniquement le `owner` l'ensemble des entités associées vont être persistées en base

```java
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(owner); // uniquement owner
em.getTransaction().commit();
...
em.getTransaction().begin();
em.remove(owner); // owner et ses pets supprimés car cascade
em.getTransaction().commit();
```

## Exemple 2

```java
Commande commande = em.find(Commande.class, 1L);   // managed

LigneDetail ligne = new LigneDetail();              // transient
commande.getLigneDetails().add(ligne);

transaction.commit();   // flush → cascade PERSIST → INSERT INTO LigneDetail
```

Au moment du commit 
1. le dirty checking — comparer chaque entité à son état d'origine pour émettre les UPDATE nécessaires ;
2. le parcours des cascades — visiter les associations qui déclarent un CascadeType.

C'est la seconde qui nous intéresse. En parcourant `commande.getLigneDetails()`, Hibernate y trouve un objet `transient` — la nouvelle LigneDetail, jamais persistée. Comme l'association déclare `cascade = CascadeType.ALL`, donc PERSIST, il l'insère.

### Et sans la cascade ?
Hibernate lève une exception, parce qu'il trouve une entité *managed* qui référence un objet non persisté (comme dans l'exemple 1 `TransientPropertyValueException`)

```
object references an unsaved transient instance
 – save the transient instance before flushing : LigneDetail
```

## Ce que la cascade ne fait pas

C'est le contresens le plus fréquent, et le mot `ALL` y est pour beaucoup.

> [!warning] À retenir
> La cascade propage **les opérations que vous invoquez** sur le parent (`persist`, `remove`, `merge`…) vers ses enfants. Elle ne réagit **pas** aux modifications de la collection.

Autrement dit, retirer un enfant de la collection ne le supprime pas, même avec `CascadeType.ALL`.

```java
@OneToMany(mappedBy = "commande", cascade = CascadeType.ALL)
private List<LigneDetail> ligneDetails = new ArrayList<>();
```

```java
commande.getLigneDetails().remove(ligneDetail);
// → aucune requête. La ligne reste en base, avec sa FK intacte.
```

Aucune opération n'a été invoquée sur `commande` : la cascade n'a donc rien à propager. Pour que le retrait de la collection déclenche un `DELETE`, il faut [`orphanRemoval = true`]({{< relref "orphan_removal" >}}) — c'est justement la fonctionnalité qui existe parce que la cascade ne le fait pas.

### Le piège inverse : la résurrection

> [!ressource] Ressources
> https://stackoverflow.com/questions/11649249/deleted-object-would-be-re-saved-by-cascade-remove-deleted-object-from-associat

Plus surprenant encore, avec `CascadeType.ALL` la cascade peut **annuler** une suppression que vous avez explicitement demandée.

```java
LigneDetail ligneDetail = commande.getLigneDetails().get(0);

em.remove(ligneDetail);   // la ligne est toujours dans commande.getLigneDetails()
```

Au flush, Hibernate parcourt la collection pour appliquer la cascade `PERSIST`, y retrouve l'entité marquée pour suppression, et la réattache. Le `DELETE` n'a jamais lieu.

Il faut donc retirer l'enfant de la collection **en plus** du `em.remove()`.

```java
commande.getLigneDetails().remove(ligneDetail);   // empêche la résurrection
em.remove(ligneDetail);                           // provoque le DELETE
```

Ces deux comportements sont mis en pratique dans le [TD3(bis)]({{< relref "td_tp/jpa_mapping/td3-bis" >}}).