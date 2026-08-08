+++
title = "Projections"
weight = 30
+++

> [!ressource] Ressource
> https://thorben-janssen.com/projections-with-jpa-and-hibernate/

> [!definition] Définition
> Les projections sont des techniques qui permettent de sélectionner et de récupérer uniquement les données nécessaires d'une base de données.

Elles permettent ainsi de
- réduire la quantité de données transférées
- améliorer donc la performance du système

Ainsi au lieu de tout récupérer (`SELECT *`), nous sélectionnons les colonnes qui nous intéressent 

```java
em.createQuery("SELECT b.title, b.publisher, b.author.name FROM Book b");
```

Note :
-  `b.author.name` est autorisé car dans la classe `Book` nous avons une relation `@ManyToOne private Author author;`
  

## Types de Projections

JPA supporte principalement trois types de projections :
-  **Projections d'entités** : Récupération complète des entités.
-  **Projections de valeurs scalaires** : Sélection de colonnes spécifiques
-  **Projections DTO** : Utilisation d'objets personnalisés pour transporter des données spécifiques.
  

### Projection d'entité
C'est la plus commune, on récupère toute l'entité, soit via un `find()`, soit avec JPQL

```
TypedQuery<Book> query = entityManager.createQuery("SELECT b FROM Book b", Book.class);
List<Book> books = query.getResultList();
```

### Projections de Valeurs Scalaires
Les projections de valeurs scalaires permettent de sélectionner des colonnes spécifiques ou des résultats de fonctions agrégées, sans charger des entités complètes.

```java
// Récupère un tableau d'Object
TypedQuery<Object[]> query = entityManager.createQuery("SELECT b.title, b.publisher FROM Book b", Object[].class);

List<Object[]> results = query.getResultList();
for (Object[] result : results) {
    String title = (String) result[0];
    String publisher = (String) result[1];
}
```

Très pratique, mais pas très lisible, il serait intéressant d'utiliser un type précis au lieu de `Object` => DTO

### Projections DTO (Data Transfer Object)
Les projections DTO impliquent l'utilisation de classes personnalisées pour encapsuler les données nécessaires, offrant une structure claire.

```java
public class BookDTO {
    private String title;
    private String authorName;
    private String publisher;
}
```

```java
// Pas Object[] mais typé avec le DTO
TypedQuery<BookDTO> query = entityManager.createQuery("SELECT new com.example.BookDTO(b.title, b.author.name, b.publisher) FROM Book b", BookDTO.class);

List<BookDTO> bookDTOs = query.getResultList();
```

## Note importante
Contrairement aux projections d'entités, les projections scalaires et DTO ne font plus partie du contexte de persistance et ne suivent plus le cycle de vie. 
- Ainsi si vous mettez à jour le DTO, la nouvelle donnée ne sera pas persistée en base de données
- Par conséquent **les projections scalaires et DTO ne peuvent être utilisées que pour de la lecture**
  
### Choisir sa projection
Le choix du type de projection dépend du cas d'utilisation :

- Opérations d'écriture : Les projections d'entités sont obligatoires en raison de la gestion automatique du cycle de vie des entités par le contexte de persistance.
- Opérations en lecture seule : Les projections de valeurs scalaires ou DTO sont préférables pour réduire le surcoût et améliorer les performances.