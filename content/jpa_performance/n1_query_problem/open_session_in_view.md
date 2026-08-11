+++
title = "Open Session In View"
description = "L'Open Session In View fait disparaître la LazyInitializationException en gardant la session ouverte pendant le rendu de la vue, au prix de N+1 invisibles et d'une connexion mobilisée trop longtemps."
weight = 70
+++

> [!ressource] Ressources
> - [The Open Session In View Anti-Pattern](https://vladmihalcea.com/the-open-session-in-view-anti-pattern/)
> - [A Guide to Spring’s Open Session in View](https://www.baeldung.com/spring-open-session-in-view)

## Le pattern

L'*Open Session In View* est un pattern qui consiste à **maintenir la `Session` Hibernate ouverte au-delà de la couche métier**, jusqu'à la fin du traitement de la requête.

Le déroulé normal est le suivant

1. la couche métier ouvre une session et une transaction ;
2. elle charge les entités nécessaires ;
3. elle commit et **ferme la session** ;
4. la couche de présentation reçoit les entités et les affiche.

Toute association non chargée à l'étape 2 provoque une [LazyInitializationException]({{< relref "lazyexception" >}}) à l'étape 4.

Avec l'Open Session In View, la session est ouverte **avant** l'entrée dans la couche métier et fermée **après** le rendu de la vue. Les étapes deviennent

1. ouverture de la session ;
2. la couche métier ouvre une transaction, charge, puis commit — mais la session reste ouverte ;
3. la couche de présentation lit les entités : les associations non chargées sont initialisées **à la volée** ;
4. fermeture de la session, une fois la réponse produite.

![osiv.png](osiv.png)

## Pourquoi ça « marche »

L'objectif affiché est de faire disparaître la `LazyInitializationException`. Et il est atteint : puisque la session est encore ouverte au moment du rendu, Hibernate peut initialiser n'importe quelle association paresseuse à la demande.

```java
User user = userService.getUser(1);   // ne charge que User

// couche de présentation
for (Order order : user.getOrders()) {   // ✅ pas d'exception, la session est ouverte
    ...
}
```

Le problème semble donc réglé. Il ne l'est pas — il est **masqué**.

## Pourquoi c'est un anti-pattern

### Les requêtes sont émises depuis la couche de présentation

Le plan de chargement n'est plus décidé par la couche métier mais par l'affichage. Ajouter un champ dans un template, ou une propriété dans une réponse JSON, suffit à déclencher de nouvelles requêtes SQL — sans qu'aucune ligne de la couche d'accès aux données n'ait changé.

La responsabilité est inversée : c'est la vue qui pilote la base de données.

### Les N+1 deviennent invisibles

C'est la conséquence la plus coûteuse. Afficher une liste de 100 utilisateurs avec leurs commandes produit 101 requêtes, exactement comme le [N+1 classique]({{< relref "n1_query_problem" >}}) — mais

- aucune exception n'est levée ;
- les requêtes n'apparaissent nulle part dans le code de la couche métier ;
- en développement, avec quelques lignes de jeu de test, tout est instantané.

Sans le filet de la `LazyInitializationException`, plus rien ne signale que le chargement a été oublié. L'Open Session In View ne cause pas le N+1, mais il **supprime le mécanisme qui le rendait visible**.

### La connexion est mobilisée pendant tout le rendu

C'est le point le plus grave. Comme des requêtes peuvent encore survenir pendant l'affichage, la connexion à la base est conservée jusqu'à la fin du traitement, rendu et écriture de la réponse compris.

Une connexion reste donc immobilisée pendant une phase qui n'a plus rien à voir avec la base de données. Sous forte charge, avec un client lent ou une réponse volumineuse, le pool de connexions se vide et l'application se met à attendre — alors que la base, elle, est inactive.


## Quoi faire à la place

Le principe est de **décider du plan de chargement dans la couche d'accès aux données**, et de fermer la session avant le rendu.

- charger explicitement l'association via une [méthode dédiée avec `JOIN FETCH`]({{< relref "join_fetch" >}}) ou un [Entity Graph]({{< relref "entity_graph" >}}) ;
- ou, mieux, **ne pas exposer l'entité** à la couche de présentation et retourner un DTO construit par une projection : la vue n'a alors plus aucun accès au graphe d'entités, et le problème ne peut plus se poser.

La `LazyInitializationException` redevient alors ce qu'elle doit être : un signal, levé dès le développement, à chaque endroit où le chargement n'a pas été décidé explicitement.

## Le cas de Spring Boot

Spring Boot implémente ce pattern via l'`OpenEntityManagerInViewInterceptor`, et il est **activé par défaut**.

```yaml
spring:
  jpa:
    open-in-view: true   # valeur par défaut
```

C'est ce qui explique qu'une API REST retournant directement une entité fonctionne sans erreur : quand Jackson sérialise l'objet et appelle `user.getOrders()`, la session est encore ouverte.

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Integer id) {
    return userService.getUser(id);   // ne charge que User, et pourtant le JSON contient les orders
}
```

Spring Boot émet d'ailleurs un avertissement au démarrage

```
spring.jpa.open-in-view is enabled by default. Therefore, database queries may be
performed during view rendering. Explicitly configure spring.jpa.open-in-view to
disable this warning
```

La recommandation est de le désactiver explicitement

```yaml
spring:
  jpa:
    open-in-view: false
```

> [!warning] À retenir
> Ce n'est pas un détail de configuration : c'est un choix d'architecture. Le désactiver fait réapparaître des `LazyInitializationException` — ce sont autant de chargements implicites qui étaient déjà là, mais que l'application payait silencieusement.
