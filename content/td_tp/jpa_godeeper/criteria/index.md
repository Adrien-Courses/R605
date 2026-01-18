+++
title = "TP4 JPA Criteria API"
weight = 20
+++

> [!ressource] Ressource
> - https://github.com/Adrien-Courses/R605-TP-JPA-criteria-api
> - [Correction https://github.com/Adrien-Courses/R605-TP-JPA-criteria-api-correction](https://github.com/Adrien-Courses/R605-TP-JPA-criteria-api-correction)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consignes
> [!affirmation] Objectif
> Apprendre à utiliser l'API Criteria, toujours utiliser l'API Criteria sauf si explicitement demandé d'utiliser du JPQL

### Partie 1 - Implémenter les requêtes suivantes
1. Récupérer tous les livres de la base de données avec l'API Criteria.
2. Récupérer les livres d’un auteur donné. (Paramètre : authorName) **VIA API Criteria**
3. Trouver les livres publiés après une année donnée. (Paramètre : year) **VIA JPQL**
4. Trouver les livres dont le prix est compris dans une certaine fourchette. (Paramètres : minPrice, maxPrice)

-- M'appeler

<!--
public List<Book> getBooksByAuthor(String authorName) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Book> query = cb.createQuery(Book.class);
    Root<Book> root = query.from(Book.class);

    query.select(root)
         .where(cb.equal(root.get("author"), authorName));

    return entityManager.createQuery(query).getResultList();
}

// Vérifié requête paramétrée
`
public List<Book> getBooksPublishedAfter(int year) {
    String jpql = "SELECT b FROM Book b WHERE b.publicationYear > :year";
    return entityManager.createQuery(jpql, Book.class)
                        .setParameter("year", year)
                        .getResultList();
}
-->

### Partie 2 - Ajouter une Bibliothèque
Nous avons maintenant une entité `Library` qui représente une bibliothèque. Une bibliothèque peut contenir plusieurs livres (relation One-To-Many). L'objectif est d'écrire des requêtes JPA utilisant l'API Criteria pour récupérer les données en tenant compte des relations.

1. Créer l'entité `Library` et adapter `Book`

-- M'appeler

<!--
vérifier la bidirection + methode add/remove
-->

2. Récupérer toutes les bibliothèques avec leurs livres.
   - Coder une méthode avec l'API Criteria et une autre avec JPQL
3. Récupérer les livres appartenant à une bibliothèque donnée (libraryName).
4. Trouver les bibliothèques qui possèdent au moins un livre d’un auteur donné (authorName).

— M’appeler

### Complément
Pour les questions 3. et 4. de la partie 2 nous pouvons remarquer la chose suivante

- `getBooksByLibraryName(String libraryName)` va conduire à deux requêtes SQL
- `getLibrariesWithBooksByAuthor(String authorName)` à une seule

<!--
    public List<Library> getLibrariesWithBooksByAuthor(String authorName) {
        EntityManager entityManager = App.entityManagerFactory.createEntityManager();
        try {
            CriteriaBuilder cb = entityManager.getCriteriaBuilder();
            CriteriaQuery<Library> query = cb.createQuery(Library.class);
            Root<Library> root = query.from(Library.class);
            Join<Library, Book> bookJoin = root.join("books"); // Jointure classique

            query.select(root)
                 .where(cb.equal(bookJoin.get("author"), authorName));

            return entityManager.createQuery(query).getResultList();
        } finally {
            entityManager.close();
        }
    }
    
    public List<Book> getBooksByLibraryName(String libraryName) {
        EntityManager entityManager = App.entityManagerFactory.createEntityManager();
        try {
            CriteriaBuilder cb = entityManager.getCriteriaBuilder();
            CriteriaQuery<Book> query = cb.createQuery(Book.class);
            Root<Book> root = query.from(Book.class);
            Join<Book, Library> libraryJoin = root.join("library"); // Jointure normale

            query.select(root)
                 .where(cb.equal(libraryJoin.get("name"), libraryName));

            return entityManager.createQuery(query).getResultList();
        } finally {
            entityManager.close();
        }
    }
-->


#### Pourquoi ?
- Commençons  par `getLibrariesWithBooksByAuthor(String authorName)` où la Root est `Library`
  - utilise la relation `OneToMany` vers les Book et que par défaut il y a du `FETCH.LAZY` aucune requête additionnelle est créée

- Maintenant si on s'intéresse à `getBooksByLibraryName(String libraryName)` où la Root est `Book`
  - utilise la relation `ManyToOne` vers la library et que par défaut il y a du `FETCH.EAGER` donc Hibernate essaie de complètement initialiser l'entité Library
    > Hibernate uses a secondary select instead. This is because the entity query fetch policy cannot be overridden, so **Hibernate requires a secondary select to ensure that the EAGER association is fetched** prior to returning the result to the user. [^1]

#### Corriger !
Corriger `getBooksByLibraryName(String libraryName)` pour n'avoir qu'une seule requête, sachant que l'objectif n'est pas de mettre `ManyToOne` en `FETCH.EAGER`.
- Piste : regarder la différence entre un JOIN et un FETCH JOIN (https://stackoverflow.com/a/17439679/9399016)
<!---
        // Use fetch instead of join
        Fetch<Book, Library> libraryFetch = root.fetch("library");
        Join<Book, Library> libraryJoin = (Join<Book, Library>) libraryFetch;
-->

[^1]: https://docs.jboss.org/hibernate/orm/5.2/userguide/html_single/chapters/fetching/Fetching.html


