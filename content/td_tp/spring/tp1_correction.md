+++
title = "TP1 Correction"
weight = 11
+++

> [!ressource] Ressource
> - https://github.com/Adrien-Courses/R601-TP-SPRINGJPA-Decouverte/tree/final (branche final)

## Créer une commande
Dans `CommandeService`
- appeler `ClientService` pour récupérer le `clientId` du RequestModel
- appeler `ArticleService` pour récupérer tous les `articleIds` du RequestModel

```java
public Commande createCommande(CommandeRequestModel commandeRequestModel) {
    // Récupérer le client
    Client client = clientService.getById(commandeRequestModel.getClientId());
    
    // Récupérer les articles
    List<Article> articles = articleService.findAllById(commandeRequestModel.getArticleIds());
    
    // Vérifier si tous les articles sont actifs
    List<Article> articlesInactifs = articles.stream()
            .filter(article -> !article.isActif())
            .collect(Collectors.toList());

    if (!articlesInactifs.isEmpty()) {
        throw new IllegalArgumentException("Impossible de créer la commande. Les articles suivants sont inactifs: " 
            + articlesInactifs.stream()
                .map(Article::getNom)
                .collect(Collectors.joining(", ")));
    }
    
    Commande commande = new Commande();
    commande.setClient(client);
    commande.setArticles(articles);
    commande.setCreatedOn(LocalDateTime.now());
    
    return commandeRepository.save(commande);
}
```

## Récupérer toutes les commandes
La principale difficulté est sur le type de retour 

1. Que se passe-t-il si on retourne directement un objet de type `Commande` ?
- On a des références circulaires
```java
@GetMapping
public ResponseEntity<List<Commande>> getAllCommandes() {
    List<Commande> commandes = commandeService.getAllCommandes();
    return ResponseEntity.ok(commandes);
}
```

2. Pour éviter ceci, on va retourner un DTO (a.k.a ResponseModel)
- Ceci nous permettra également de répondre au besoin fonctionnel : *retourner le total de la commande*
  
```java
public class CommandeResponseModel {
	private Long id;
    private LocalDateTime dateCommande;
    private ClientResponseModel client;
    private List<Long> articleIds;
    private Double total;

    // Constructeur
    public CommandeResponseModel(Commande commande) {
        this.id = commande.getId();
        this.dateCommande = commande.getCreatedOn();
        this.client = new ClientResponseModel(commande.getClient());
        this.articleIds = commande.getArticles().stream()
                                  .map(Article::getId)
                                  .collect(Collectors.toList());
        
        this.total = commande.getArticles().stream()
                .mapToDouble(ligne -> ligne.getPrix())
                .sum();
    }
}
```

```java
@GetMapping
public ResponseEntity<List<CommandeResponseModel>> getAllCommandes() {
    List<Commande> commandes = commandeService.getAllCommandes();
    
    List<CommandeResponseModel> commandeResponseModels = toResponseModel(commandes);
    
    return ResponseEntity.ok(commandeResponseModels);
}

private List<CommandeResponseModel> toResponseModel(List<Commande> commandes) {
    List<CommandeResponseModel> commandeResponseModels = new ArrayList<CommandeResponseModel>();
    for(Commande commande : commandes) {
        CommandeResponseModel commandeResponseModel = new CommandeResponseModel(commande);
        commandeResponseModels.add(commandeResponseModel);

    }
    return commandeResponseModels;
}
```

### Complément
Dans le `application.yml` ajoutez `spring.jpa.open-in-view=false`
- Nous avons donc une `LazyInitializeException` pourquoi ?
  - Car dans le constructeur de `CommandeResponseModel` on essaie d'accéder aux clients et aux articles. Or comme nous sommes en dehors du contexte de transaction, exception
  - => Pour résoudre ceci, lorsque nous chargeons une commande nous devons également charger les clients et article (cf [Optimisation des lectures]({{< relref "jpa_deeper/fetch/" >}}))

Dans `CommandeRepository` on ajoute une méthode `findAllWithClientAndArticles`
```java
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    @Query("SELECT DISTINCT c FROM Commande c "
        + "LEFT JOIN FETCH c.client "
        + "LEFT JOIN FETCH c.articles")
    List<Commande> findAllWithClientAndArticles();

       // OU

    @EntityGraph(attributePaths = {"client", "articles"})
    @Query("SELECT DISTINCT c FROM Commande c")
    List<Commande> findAllWithClientAndArticlesEntityGraph();
}
```

Puis on modifie la couche service pour appeler l'une des deux méthodes
```java
public List<Commande> getAllCommandes() {
    List<Commande> commandes = commandeRepository.findAllWithClientAndArticlesEntityGraph();
    return commandes;
}
```