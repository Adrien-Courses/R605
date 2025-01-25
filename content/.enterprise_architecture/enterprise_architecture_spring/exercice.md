+++
title = "Exercice"
weight = 30
+++

> [!ressource] Ressources
> - [https://github.com/Adrien-Courses/R605-TP-JPA-SPRING](https://github.com/Adrien-Courses/R605-TP-JPA-SPRING)
> - [Don’t expose your JPA entities in your REST API](https://thorben-janssen.com/dont-expose-entities-in-api/)

**Note : pour avoir un auto-reload sans ajouter de dépendances, lancer le projet en mode Debug**

## Objectifs
Créer une application permettant à un client de passer une commande composé d'articles

- Créer les entités JPA
- Créer les endpoints suivants :
  - Créer un client
    - Rechercher un client par son nom et prénom
  - Créer un article
  - Créer une commande
    - Dans le retour, donner le prix total de la commande (sans l'enregistrer en base de données)
  - Modifier une commande

- Gérer le fait qu'un article ne soit plus disponible à la ventre (supprimé de la BDD?), sachant qu'il peut être enregistré (FK) dans une ou plusieurs commandes

## Informations complémentaires
### Rest API
- Dans la section précédente pour créer une architecture avec JEE nous avions utiliser les annotations `@Path`, `@Get` du package `jakarta.ws.rs.`.
- De son côté `spring-web` fournit ces propres annotations comme `@RestController`, `@GetMapping`

### Injection de dépendances
- Il en va de même pour l'injection de dépendances. Nous utilisions `@Inject`. 
- Spring fournit son annotation `@Autowired`. Également nous pouvons dire à spring de manager nos classes en les annotations avec `@Component`, `@Service`, `@Repository`

### JPA
Finalement concernant la couche repository, nous allons utiliser la couche d'abstraction `spring-data`. Ainsi nous n'avons plus besoin d'écrire les méthode `save()`, `delete()` elles seront hérité de `JPARepository`

```java
public interface ClientRepository extends JPARepository<Client, Integer> {
    // définir des méthodes complémentaires
    List<Client> findByEmailAddressAndLastname(String emailAddress, String lastname);
}
```

De plus, cette approche permet d'utiliser les [JPA Query Methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html). Par exemple ci-dessus nous n'avons pas besoin d'écrire l'implémentation de la méthode `findByEmailAddressAndLastname`, spring traduira automatiquement cette méthode en SQL.


## Suppression d'un article associé à une commande
Une commande contenant les articles `3` et `4` a été passé. Mais, nous souhaitons supprimer l'article `3` car il n'est plus disponible à la vente

```
mysql> select * from commande;
+----+----------------------------+-----------+
| id | created_on                 | client_id |
+----+----------------------------+-----------+
|  1 | 2024-11-01 17:44:47.004270 |         1 |
+----+----------------------------+-----------+
4 rows in set (0.00 sec)

mysql> select * from commande_article;
+-------------+------------+
| commande_id | article_id |
+-------------+------------+
|           1 |          3 |
|           1 |          4 |
+-------------+------------+
```

### Methode delete()
Naïvement nous pourrions coder dans `ArticleService` la méthode suivante et déclenchée par l'endpoint `http://localhost:8080/v1/articles/{idArticle}`

```java
public void deleteArticle(Long id) {
    Article article = articleRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Article non trouvé"));
    
    articleRepository.delete(article);
}
```

Néanmoins, si nous exécutons le code suivant pour supprimer l'article `3`, nous obtenons une erreur

```
java.sql.SQLIntegrityConstraintViolationException: 
    Cannot delete or update a parent row: a foreign key constraint fails 
        (`jpa-spring-architecture`.`commande_article`, CONSTRAINT `FK917crfksxm1c5m0cwtes73epp` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`))

```

Cette erreur se produit lorsque vous essayez de supprimer un enregistrement dans la table `article`, mais qu'il existe des enregistrements dans la table `commande_article` qui font référence à l'article que vous tentez de modifier.

C'est une violation de contrainte de clé étrangère, ce qui signifie que vous ne pouvez pas `supprimer` parent (dans la table `article`) car des enregistrements enfants (dans la table `commande_article`) en dépendent encore.

### Suppression en cascade
Si vous voulez une suppression automatique des enregistrements enfants (`commande_article`) lors de la suppression du parent (`article`), vous pouvez modifier la relation d'entité JPA pour utiliser `cascade = CascadeType.ALL` ou `cascade = CascadeType`.REMOVE.

```java
public class Article {
    ...
    @ManyToMany(mappedBy = "articles", cascade = CascadeType.ALL)
    private List<Commande> commandes = new ArrayList<>();
}
```

Si nous ré-exécutons l'appel à l'api, cette fois-ci nous avons supprimé l'article et les commandes où il apparaît.

```
mysql> select * from article;
+----+------------+------+
| id | nom        | prix |
+----+------------+------+
|  4 | Livre Java |   25 |
+----+------------+------+
1 row in set (0.00 sec)

mysql> select * from commande_article;
Empty set (0.00 sec)
```
> L'ensemble de code permettant d'exécuter le code jusqu'à cette étape est disponible [https://github.com/Adrien-Courses/R605-TP-JPA-SPRING/tree/before-delete-article](https://github.com/Adrien-Courses/R605-TP-JPA-SPRING/tree/before-delete-article).
### Suppression logique
Mais est-ce réellement la bonne solution ? Cela signifie que nous ne gardons pas l'historique des commandes utilisateurs :
- impossible à l'utilisateur de consulter ces commandes passées si un des articles à été supprimé
- impossible à l'entreprise de faire des statistiques sur les commandes 
- ...

C'est donc très contraignant de supprimer physiquement un enregistrement. Au lieu de cela, vous pouvez implémenter un mécanisme de suppression logique en ajoutant un indicateur `isActif` à votre entité Article.
Nous en profiterons également :
- pour créer une méthode permettant de retourner les article actifs ou inactifs suivant un filtre
  - GET /api/articles           // Tous les articles
  - GET /api/articles?actif=true    // Articles actifs seulement
  - GET /api/articles?actif=false   // Articles inactifs seulement
- ne pas pouvoir faire une commande avec un article inactif

**Note : nous pouvons supprimer le `CascadeType.ALL` défini précédemment**

> Le code https://github.com/Adrien-Courses/R605-TP-JPA-SPRING/tree/desactiver-article
> Point intéressant : en utilisant un Boolean dans le controller pour le filtre actif, nous avons true, false ET null => un seul endpoint pour les 3 demandes
