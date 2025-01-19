+++
title = "Exercice - Bidirection relation"
weight = 61
+++

Dans les cas pratiques suivant, nous souhaitons comprendre l'utilité de la relation bidirectionnelle expliquée dans les sections [OneToMany relation]({{% relref "one-to-many.md" %}}) et [MappedBy]({{% relref "MappedBy.md" %}}).
Pour ce faire nous prenons le cas :
- d'une `Commande`
- qui est composée de plusieurs lignes `LigneDetail` (i.e. un bon de commande est composé de plusieurs lignes représentant chacune des articles)

{{< mermaid align="center" zoom="true" >}}
erDiagram
    COMMANDE {
        LONG id
    }

    LIGNE_DETAIL {
        LONG id
        LONG commande_id FK
    }

    COMMANDE ||--o{ LIGNE_DETAIL : contains
{{< /mermaid >}}

```java
@Entity
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneDetail> ligneDetails = new ArrayList<LigneDetail>();
}

@Entity
public class LigneDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    private Commande commande;
}
```

## Si on ne synchronique pas ...
Dans un premier temps, regardons ce qu'il se passe si nous ne synchronisons pas les deux côtés de la relation.

### 1. Supprimer une ligne d'une commande (NOT WORKING)
```java
@Test
public void testRemoveLigneDetail() {
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();
    
    // Récupérer la commande id=2
    Commande commande = session.find(Commande.class, 2L);

    //  Récupérer une ligne associée à la commande (ici la première ligne)
    LigneDetail ligneDetail = commande.getLigneDetails().get(0);

    // NOT WORKING      
    session.delete(ligneDetail); // ligne non nécessaire car orphanRemoval is true + cascade set sur ligneDetails

    transaction.commit();
}
```
{{% expand "Résultat" %}}
```
[Hibernate] 
    select
        c1_0.id 
    from
        Commande c1_0 
    where
        c1_0.id=?
[Hibernate] 
    select
        ld1_0.commande_id,
        ld1_0.id 
    from
        LigneDetail ld1_0 
    where
        ld1_0.commande_id=?
```

Aucun delete !

{{% /expand %}}

### 2. Non suffisant
```java
@Test
public void testRemoveLigneDetail() {
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();
    
    // Récupérer la commande id=2
    Commande commande = session.find(Commande.class, 2L);

    //  Récupérer une ligne associée à la commande (ici la première ligne)
    LigneDetail ligneDetail = commande.getLigneDetails().get(0);
    ligneDetail.setCommande(null) // THIS ADDED

    // NOT WORKING      
    session.delete(ligneDetail);

    transaction.commit();
}
```

{{% expand "Résultat" %}}
```
[Hibernate] 
    select
        c1_0.id 
    from
        Commande c1_0 
    where
        c1_0.id=?
[Hibernate] 
    select
        ld1_0.commande_id,
        ld1_0.id 
    from
        LigneDetail ld1_0 
    where
        ld1_0.commande_id=?
[Hibernate] 
    update 
        LigneDetail 
    set
        commande_id=?  (à null)
    where
        id=?
```

La `ligneDetail` n'a pas été supprimée mais seulement update avec la FK `commande_id` à NULL. Ainsi, même si nous n'avons plus la relation vers la commande mais nous avons une ligneDetail orpheline ...

```
mysql> select * from LigneDetail;
+-------------+----+
| commande_id | id |
+-------------+----+
|        NULL | 1  |  -- LigneDetail orpheline
+-------------+----+
```

{{% /expand %}}

### 3. Supprimer une ligne d'une commande (WORKING)
Dans le code precedent, la ligne était toujours associée à la commande.
Nous devons donc supprimer également cette association 
```java
@Test
public void testRemoveLigneDetailWorking() {
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();
    
    Commande commande = session.find(Commande.class, 3L);
    
    LigneDetail ligneDetail = commande.getLigneDetails().get(0);
    commande.getLigneDetails().remove(ligneDetail); // ADD THIS
            
    session.delete(ligneDetail); 
    
    transaction.commit();
}
```

{{% expand "Résultat" %}}
```
[Hibernate] 
    select
        c1_0.id 
    from
        Commande c1_0 
    where
        c1_0.id=?
[Hibernate] 
    select
        ld1_0.commande_id,
        ld1_0.id 
    from
        LigneDetail ld1_0 
    where
        ld1_0.commande_id=?
[Hibernate] 
    delete 
    from
        LigneDetail 
    where
        id=?
```

Nous avons bien un delete !

{{% /expand %}}

### 4. Supprimer une ligne d'une commande BIDIRECTIONAL

Mais, ceci n'est pas parfait
> By using the bidirectional add sync methods, we can ensure that the persist entity state transition is going to be propagated properly. Without synchronizing both sides of the JPA association, it’s not guaranteed that the entity state will be properly synchronized with the database. [source](https://vladmihalcea.com/jpa-bidirectional-sync-methods/)

```java
@Test
public void testRemoveLigneDetailWorking() {
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();
    
    Commande commande = session.find(Commande.class, 3L);
    
    LigneDetail ligneDetail = commande.getLigneDetails().get(0);
    commande.getLigneDetails().remove(ligneDetail); // ADD THIS
    ligneDetail.setCommande(null); // ADD THIS

    session.delete(ligneDetail); 
    
    transaction.commit();
}
```

{{% expand "Résultat" %}}
```
[Hibernate] 
    select
        c1_0.id 
    from
        Commande c1_0 
    where
        c1_0.id=?
[Hibernate] 
    select
        ld1_0.commande_id,
        ld1_0.id 
    from
        LigneDetail ld1_0 
    where
        ld1_0.commande_id=?
[Hibernate] 
    delete 
    from
        LigneDetail 
    where
        id=?
```

Nous avons bien un delete !

{{% /expand %}}

On peut donc se demander si l'option 3. avec seulement la ligne `commande.getLigneDetails().remove(ligneDetail);` est suffisante.
Alors la réponse est ça-dépend :
- ça dépend du mapping qui a été fait; dans notre cas nous n'avions pas besoin de `ligneDetail.setCommande(null)` car nous avons mis orphanRemoval à true
- sans ce orphanRemoval à true alors nous nous serions retrouvé comme dans le cas 1.

Donc oui, par convention on synchronise les deux côtés de la relations (pour éviter d'avoir à ce référer au mapping et éviter les ambiguïtés)



### Créer une commande avec le même Id
Que se passe-t-il si on crée un nouvel objet commande qui a le même id qu'un déjà sauvegardé en base de données et qu'on y ajoute une nouvelle ligne ?

Actuellement en base de données
```
mysql> select * from Commande;
+----+
| id |
+----+
|  1 |
+----+

mysql> select * from LigneDetail;
+-------------+----+
| commande_id | id |
+-------------+----+
|           1 |  1 |
+-------------+----+
```

```java
@Test
public void testAjouterLigneDetailANouvelleCommande() {
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();

    // Création d'un nouvel objet commande et on y associe id=1
    Commande commande = new Commande();
    commande.setId(1L);

    
    List<LigneDetail> ligneDetails = new ArrayList<LigneDetail>();
    LigneDetail ligneDetail = new LigneDetail();
    ligneDetail.setCommande(commande); // On side
    ligneDetails.add(ligneDetail);
    
    
    commande.setLigneDetails(ligneDetails); // Other side 

    session.saveOrUpdate(commande);

    transaction.commit();
    sessionFactory.close();
}
```

```
mysql> select * from Commande;
+----+
| id |
+----+
|  1 |
+----+

mysql> select * from LigneDetail;
+-------------+----+
| commande_id | id |
+-------------+----+
|           1 |  1 |
|           1 |  2 |
+-------------+----+

Et seulement le SQL suivant a été exécuté
[Hibernate] 
    insert 
    into
        LigneDetail
        (commande_id) 
    values
        (?)
```

### Créer une commande avec find()
Maintenant si on souhaite faire la même chose mais en utilisant `find()` alors ça ne fonctionne pas

```java
@Test
public void testFindCommandeEtAjouterLigneDetail() {
    // Begin a transaction
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();

    Commande commande = session.find(Commande.class, 1L);

    List<LigneDetail> ligneDetails = new ArrayList<LigneDetail>();
    LigneDetail ligneDetail = new LigneDetail();
    ligneDetail.setCommande(commande);
    ligneDetails.add(ligneDetail);
    
    
    commande.setLigneDetails(ligneDetails);


    session.saveOrUpdate(commande);

    transaction.commit();
    sessionFactory.close();
}

jakarta.persistence.RollbackException: Error while committing the transaction
Caused by: org.hibernate.HibernateException: A collection with orphan deletion was no longer referenced by the owning entity instance: fr.adriencaubel.hibernatetesting.Commande.ligneDetails
```

Pour que ça fonctionne nous devons ajouter 

```java
@Test
public void testFindCommandeEtAjouterLigneDetailWorking() {
    // Begin a transaction
    Session session = sessionFactory.openSession();
    Transaction transaction = session.beginTransaction();

    Commande commande = session.find(Commande.class, 1L);

    LigneDetail ligneDetail = new LigneDetail();
    ligneDetail.setCommande(commande);
    commande.getLigneDetails().add(ligneDetail);

    // Save the updated Commande object
    session.saveOrUpdate(commande);
    transaction.commit();
    sessionFactory.close();
} 
```
