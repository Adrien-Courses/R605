+++
title = "JPQL"
weight = 10
+++

> [!info] Objectif 
> JPQL is used to make queries against entities stored in a relational database. It is heavily inspired by SQL, and its queries resemble SQL queries in syntax, but operate against JPA entity objects rather than directly with database tables. [^1]

```java
public List<Author> getAuthorsByLastName(String lastName) {
    String queryString = "SELECT a FROM Author a " +           // Author est le nom de l'entité JPA (classe Java)
                         "WHERE a.lastName IS NULL OR LOWER(a.lastName) = LOWER(:lastName)";  // lastName est l'attribut Java

    TypedQuery<Author> query = getEntityManager().createQuery(queryString, Author.class);
    query.setParameter("lastName", lastName);
    return query.getResultList();
}
```

[^1]: https://en.wikipedia.org/wiki/Jakarta_Persistence_Query_Language