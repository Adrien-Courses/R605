+++
title = "@BatchSize"
description = "L'annotation Hibernate @BatchSize charge les associations par paquets : le N+1 n'est pas supprimé mais divisé, et cela reste compatible avec la pagination."
weight = 30
+++

Lorsque le `join fetch` n'est pas utilisable — typiquement parce que la requête est paginée — l'annotation Hibernate `@BatchSize` permet de limiter les dégâts.

```java
@OneToMany(mappedBy = "etudiant")
@BatchSize(size = 20)
private List<Livre> livresLus;
```

Au lieu d'une requête par étudiant, Hibernate regroupe les identifiants et charge les collections par paquets de 20.

```sql
SELECT * FROM livre WHERE etudiant_id IN (?, ?, ?, ... );
```

Avec 100 étudiants, on passe donc de 101 requêtes à 6 (1 + 100/20). Le N+1 n'est pas éliminé, mais il est **divisé par la taille du batch**.

## Quand l'utiliser

- quand la requête est paginée et interdit le `join fetch` ;
- quand plusieurs collections doivent être chargées et qu'un seul `join fetch` est possible ;
- comme filet de sécurité global, pour éviter qu'un N+1 oublié quelque part ne dégénère.

> [!note] Note
> `@BatchSize` peut aussi se placer sur l'entité elle-même (`@BatchSize` sur la classe `Livre`), ce qui s'applique alors à tout chargement de proxies de cette entité, y compris via un `@ManyToOne`.

## Limites

- ce n'est pas du JPA standard mais une annotation **Hibernate** ;
- le comportement est implicite : contrairement à `findAllWithLivres()`, rien dans le code appelant n'indique ce qui sera chargé ;
- il reste plusieurs allers-retours. C'est une atténuation, pas une correction.
