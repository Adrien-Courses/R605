+++
title = "TP3 JPA Fetching Correction"
weight = 11
+++
<!-- tags = ["explorerexclude"] -->

## a) Compléter getAllClient()
Nous souhaitons afficher la liste des clients (email + nom)
- compléter la méthode `ClientService#getAllClients()`

On lancera le code depuis la méthode `main()`

**Correction**
- Utiliser l'injection de dépendance
- Fermer le entityManager + utiliser try catch
  - On ferme l'entityManager car sinon la connexion reste ouverte jusqu'à la fin de l'appel (e.g jusqu'au frontend) -> perte de performance (connexion non rendue au pool)

## b) Compléter getFicheClient(int)
De la même manière que `getAllClient()` compléter `getFicheClient(int)` pour afficher les informations suivantes
- email et nom du client
- la liste des commandes du client ainsi que ses favoris

```java
public void getFicheClient(int clientId) {
    Client client = clientDAO.getClientWithDetailsEntityGraph(clientId);
    System.out.println(client.getEmail() + " " + client.getNom());
    System.out.println(client.getCommandes());
    System.out.println(client.getFavoris());
}
```

Que constatez-vous ?
- LazyInitializationException car nous essayons de récupérer les favoris et les commandes en dehors du contexte où client a été récupéré de la BDD


Quelle est la façon la plus "simple" pour corriger ce problème ? est-ce une bonne solution ?
- Au lieu de FETCH.LAZY mettre FETCH.EAGER partout

## c) Réfléchir à des solutions
**Correction**

La solution a privilégier est de coder plusieurs méthodes dans le DAO
- `getClientById()` qui retourne que les informations du client
- `getClientByIdWithDetail()` qui retourne l'ensemble des informations du clients plus celles des associations

Pour ce faire plusieurs possibilité, c'est le point d)


## d) Implémenter plusieurs solutions
Ci-dessous plusieurs solutions pour répondre au problème

1. **Propriété enable_lazy_load_no_trans**
- Combien de requêtes sont exécutées ?
  
Cinq

```
-- SELECT du getClientById()
[Hibernate] 
    select
        c1_0.id,
        c1_0.email,
        c1_0.nom 
    from
        Client c1_0 
    where
        c1_0.id=?
        
johndoe@example.com John Doe

-- SELECT du getCommandes()
[Hibernate] 
    select
        c1_0.client_id,
        c1_0.id,
        c1_0.dateAchat,
        c1_0.montant 
    from
        Commande c1_0 
    where
        c1_0.client_id=?

[Hibernate] 
    select
        c1_0.id,
        c1_0.email,
        c1_0.nom 
    from
        Client c1_0 
    where
        c1_0.id=?

[fr.adriencaubel.entity.Commande@65d90b7f, fr.adriencaubel.entity.Commande@2a42019a, fr.adriencaubel.entity.Commande@6fc0e448]

-- SELECT du getFavoris()
[Hibernate] 
    select
        f1_0.client_id,
        f1_0.id,
        f1_0.nom,
        f1_0.prix 
    from
        Article f1_0 
    where
        f1_0.client_id=?

[Hibernate] 
    select
        c1_0.id,
        c1_0.email,
        c1_0.nom 
    from
        Client c1_0 
    where
        c1_0.id=?

[fr.adriencaubel.entity.Article@7c0e4e4e, fr.adriencaubel.entity.Article@20231384]
```

2. **Hibernate.initialize()**  
   - Combien de requêtes sont exécutées ?

```java
public Client getClientByIdWithDetailsHibernateInitiaze(int clientId) {
    EntityManager entityManager = ENTITY_MANAGER_FACTORY.createEntityManager();        
    Client client = null;
    try {
        client = entityManager.find(Client.class, clientId);
        Hibernate.initialize(client.getCommandes());
        Hibernate.initialize(client.getFavoris());
    } finally {
        entityManager.close();
    }
    return client;
}
```

3 requêtes, chaque `Hibernate.initialize()` fait un `SELECT` à la base de données


2. **JOIN FETCH** : faire des jointures SQL
   - Combien de requêtes sont exécutées ?

NOTE : 
- avec cette solution on doit remplacer `List` par un `Set` dans la classe `Client` sinon `MultipleBagFetchException`
- si on souhaite garder les `LIST` alors coder deux méthodes distinctes `fetchCommandes` et `fetchFavoris`

```java
public Client getClientByIdWithDetailsJoinFetch(int clientId) {
    EntityManager entityManager = ENTITY_MANAGER_FACTORY.createEntityManager();        
    Client client = null;
    try {
        TypedQuery<Client> query = entityManager.createQuery(
                "SELECT c FROM Client c " +
                "LEFT JOIN FETCH c.commandes " +
                "LEFT JOIN FETCH c.favoris " +
                "WHERE c.id = :clientId", 
                Client.class
            );
        query.setParameter("clientId", clientId);
        client = query.getResultStream().findFirst().orElse(null);
    } finally {
        entityManager.close();
    }
    return client;
}
```

1 seule requête exécutée
```
select
    c1_0.id,
    c2_0.client_id,
    c2_0.id,
    c2_0.dateAchat,
    c2_0.montant,
    c1_0.email,
    f1_0.client_id,
    f1_0.id,
    f1_0.nom,
    f1_0.prix,
    c1_0.nom 
from
    Client c1_0 
left join
    Commande c2_0 
        on c1_0.id = c2_0.client_id 
left join
    Article f1_0 
        on c1_0.id = f1_0.client_id 
where
    c1_0.id = ?
```

3. **Entity Graph** : section *4. Named Entity Graph* de l'article https://thorben-janssen.com/5-ways-to-initialize-lazy-relations-and-when-to-use-them/
   - Combien de requêtes sont exécutées ?

```java
@Entity
@NamedEntityGraph(
name = "Client.detail",
    attributeNodes = {
        @NamedAttributeNode("commandes"),
        @NamedAttributeNode("favoris")
    }
)
public class Client { ... }
```

```java
public Client getClientWithDetailsEntityGraph(int clientId) {
    EntityManager entityManager = ENTITY_MANAGER_FACTORY.createEntityManager();    
    Client client = null;
    try {
        // Load EntityGraph
        EntityGraph entityGraph = entityManager.getEntityGraph("Client.detail");

        // Query with EntityGraph to fetch related collections
        Map hints = new HashMap<>();
        hints.put("javax.persistence.fetchgraph", entityGraph);
        
        client = entityManager.find(Client.class, clientId, hints);

    } finally {
        entityManager.close();
    }

    return client;
}
```

1 seule requête exécutée, identique au JOIN FETCH
```
select
    c1_0.id,
    c2_0.client_id,
    c2_0.id,
    c2_0.dateAchat,
    c2_0.montant,
    c1_0.email,
    f1_0.client_id,
    f1_0.id,
    f1_0.nom,
    f1_0.prix,
    c1_0.nom 
from
    Client c1_0 
left join
    Commande c2_0 
        on c1_0.id = c2_0.client_id 
left join
    Article f1_0 
        on c1_0.id = f1_0.client_id 
where
    c1_0.id = ?
```

Note : on peut garder `List` avec cette solution

## 4. Compléments
Pour les étudiants en avance, vous pouvez coder les méthodes suivantes :
- `saveClient(Client client)`
- `saveOrUpdateClient(Client client)` (merge)
- `addCommandeToClient(int clientId, Commande commande)`
  - On peut se poser la question si cette méthode va dans la couche service ou DAO 


```java
// Dans ClientDAO
public void saveOrUpdateClient(Client client) {
    EntityManager entityManager = ENTITY_MANAGER_FACTORY.createEntityManager();
    try {
        entityManager.getTransaction().begin();
        entityManager.merge(client); // Merge handles both save & update
        entityManager.getTransaction().commit();
    } catch (Exception e) {
        entityManager.getTransaction().rollback();
        throw e;
    } finally {
        entityManager.close();
    }
}
```

```java
public void addCommandeToClient(int clientId, Commande commande) {
    Client client = clientDAO.getClientWithDetailsEntityGraph(clientId); // Attention à récupérer Client et toutes ses associations

    client.addCommande(commande); 
    clientDAO.saveOrUpdateClient(client); // Persist client (cascade saves orders)
}
```

Note : si on avait simplement utilisé `getClientById()` alors la liste des commandes n'aurait pas été dans l'état `MANAGE` donc `LazyInitializationException`
