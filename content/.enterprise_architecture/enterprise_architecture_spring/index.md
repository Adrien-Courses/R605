+++
title = "Architecture d'entreprise Spring"
weight = 50
+++

> [!ressource] Ressources
> - [José Paumard - Différences entre Java EE et Spring](https://www.youtube.com/watch?v=YFMil-YpL0w&t=140s&pp=ygUcY291cnMgZW4gbGlnbmUgc3ByaW5nIHZzIGplZQ%3D%3D)

Dans la section précédente nous avons réalisé une architecture d'entreprise en utilisant uniquement la spécification Jakarta EE. Néanmoins aujourd'hui l'industrie logicielle en Java utilise majoritairement le framework Spring.
Spring va nous offrir une niveau d'abstraction de plus pour créer notre application d'entreprise

![](https://nintriva.com/wp-content/uploads/2024/01/Java-EE-vs.-Spring-Boot-Key-Differences--1024x719.webp)

Quelques exemples :
- Avec Jakarta EE nous utilisions l'annocation `@Inject` qui fait partie de la spécification Java CDI (Contexts and Dependency Injection)
- De son côté Spring, a créé son propre container nommé Spring IoC (Inversion of Control) et son annotation `@Autowired`

En terme d'abstraction on peut évoquer la persistance des données
- Pour le moment, nous utilisions la spécification JPA et l'implémentation Hibernate mais nous écrivons ensuite pas mal de code.
- De son côté Spring, offre une couche d'abstraction avec Spring Data
    > Part of the large Spring Data family, Spring Data JPA is built as an abstraction layer over the JPA. So, we have all the features of JPA plus the Spring ease of development. For years, developers have written boilerplate code to create a JPA DAO for basic functionalities. Spring helps to significantly reduce this amount of code by providing minimal interfaces and actual implementations.

    - Nous ferons rarement appel à l'entityManager alors que dans le TP précédent nous devons systématiquement réaliser cet appel. Ainsi Spring, va l'appeler pour nous et éviter la redondance de code
    - De mêmes, nous n'aurons plus besoin d'écrire les méthodes CRUD mais simplement de définir un interface qui implémente `JPARepository`
