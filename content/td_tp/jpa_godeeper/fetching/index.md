+++
title = "TP3 JPA Fetching"
weight = 10
+++

> [!ressource] Ressource
> - https://github.com/Adrien-Courses/R605-TP-JPA-FETCH
> - [Initializing a Proxy Entity with Hibernate](https://howtodoinjava.com/hibernate/use-hibernate-initialize-to-initialize-proxycollection/)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Présentation
> [!affirmation] Objectif
> Comprendre le fetching et commencer à créer une architecture en couche

Un clients :
- peut avoir effectué plusieurs commandes
- peut avoir ajouté des articles en favoris

Nous avons donc représenter l'entité `Client` suivante

```java
@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String email;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY) // Ne charge pas automatiquement les commandes
    private List<Commande> commandes = new ArrayList<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY) // Ne charge pas automatiquement les favoris
    private List<Article> favoris = new ArrayList<>();
}
```

En plus des entités, nous avons deux classes supplémentaires
- `ClientDAO` qui permet de manipuler nos entités, par exemple la méthode `getAllClients()` permets de récupérer tous les clients
- `ClientService` qui représente la couche service, elle permet d'ajouter de la logique métier

## 3. Consignes
Nous simulons la construction d'une API pour un siteweb
- premièrement nous souhaitons avoir un tableau (HTML) avec la liste des clients avec deux colonne leur email et leur nom
- ensuite, nous pouvons cliquer sur un des client pour afficher la *fiche client* qui contient plus d'information
  - email + nom du client
  - et également l'ensemble de ses commandes et de ses favoris

### a) Compléter getAllClient()
Nous souhaitons afficher la liste des clients (email + nom)
- compléter la méthode `ClientService#getAllClients()`

On lancera le code depuis la méthode `main()`

-- *M'appeler*
<!-- vérifier qu'il est fait de l'injection de dépendance dans main()
ClientDAO clientDAO = new ClientDAO();
ClientService clientService = new ClientService(clientDAO);
-->

### b) Compléter getFicheClient(int)
De la même manière que `getAllClient()` compléter `getFicheClient(int)` pour afficher les informations suivantes
- email et nom du client
- la liste des commandes du clients ainsi que ses favoris

Que constatez-vous ?
<!--
public void getFicheClient(int clientId) {
    List<Client> clients = clientDAO.getAllClients();
    for(Client client : clients) {
        System.out.println(client.getEmail() + " " + client.getNom());
        System.out.println(client.getCommandes());
    }
}

LazyInitializationException car getAllClients fin de la transaction + em fermé donc plus accès aux info not fetch
-->

Quelle est la façon la plus "simple" pour corriger ce problème ? est-ce une bonne solution ?
<!--
Au lieu de FETCH.LAZY mettre FETCH.EAGER partout
-->

-- *M'appeler*
<!--
Vérifier le EAGER et leur demander de trouver des alternative;
en gros coder deux méthodes dans le DAO se qui permet de garder le LAZY 
et pour celle affichant l'espace client plusieurs solution
- hibernate.initialize()
- JOIN FETCH
- ou Projection DTO
-->

### c) Réfléchir à des solutions
-- *M'appeler*

<!--
en gros coder deux méthodes dans le DAO se qui permet de garder le LAZY 
et pour celle affichant l'espace client plusieurs solution
- hibernate.initialize()
- JOIN FETCH
- ou Projection DTO

ME DIRE QUE CA DOIT ETRE CODE DANS COUCHE DAO ET PAS SERVICE
-->


## Implémenter plusieurs solutions
Ci-dessous plusieurs solutions pour répondre au problème

### 1. Propriété enable_lazy_load_no_trans
   - On peut ajouter dans le fichier `persistance.xml` la propriété ci-dessous qui permet de bypass tous les problèmes liés au lazy.
   - Combien de requête sont exécutées ?

```xml
<property name="hibernate.enable_lazy_load_no_trans" value="true" />
```


<!--
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
-->

Supprimer la propriété pour les prochaines questions

### 2. Hibernate.initialize()
   - Combien de requête sont exécutées ?
<!--
3 requete executé -> pas foufou perf donc regarder autre chose
-->

### 3. JOIN FETCH
Faire des jointures SQL en utilisant `createQuery()` et JPQL
   - Combien de requête sont exécutées ?
<!--
TypedQuery<Client> query = entityManager.createQuery(
    "SELECT c FROM Client c " +
    "LEFT JOIN FETCH c.commandes " +
    "LEFT JOIN FETCH c.favoris " +
    "WHERE c.id = :clientId", 
    Client.class
);

query.setParameter("clientId", clientId);
client = query.getResultStream().findFirst().orElse(null);

CECI va provoquer l'exception MultipleBagFetchException
- => remplacer List par Set dans les oneToMany
- coder deux méthode fetchOrder() et fetchFavoris()

Sinon la réponse est 1
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
-->

### 4.Entity Graph
Section *4. Named Entity Graph* de l'article https://thorben-janssen.com/5-ways-to-initialize-lazy-relations-and-when-to-use-them/
   - Combien de requête sont exécutés ?

<!--
Pareil que JOIN FETCH

Ici List<> fonctionne 
-->


## 4. Compléments
Pour les étudiants en avance, vous pouvez coder les méthodes suivante :
- `saveClient(Client client)`
- `saveOrUpdateClient(Client client)` (merge)
- `addCommandeToClient(int clientId, Commande commande)`
  - On peut se poser la question si cette méthode va dans la couche service ou DAO 

<!--
    public void addCommandeToClient(int clientId, Commande commande) {
        Client client = clientDAO.getClientWithDetailsEntityGraph(clientId);

        client.addCommande(commande); 
        clientDAO.saveOrUpdateClient(client); // Persist client (cascade saves orders)
    }

ATTENTION BIEN UTILISER une méthode qui récupère aussi les commande e.g. getClientWithDetailsEntityGraph
car si on utilise que getClietnById on n'a pas les oneToMany donc LazyException -> Pour un update il nous faut toute l'entité souvent

-->