+++
title = "L'interface Repository"
weight = 20
+++

> [!ressource] Ressource
> https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html

> The central interface in the Spring Data repository abstraction is Repository.

![](interface_repository.png)

Les implémentations de cette interfaces nous permettent de pouvoir accéder facilement aux opérations de CRUD et de Pagination par exemple. Évitant ainsi à tous les DAO de recoder ce même boilerplate (comme dans le TP5).

```java
public interface CrudRepository<T, ID> extends Repository<T, ID> {

  <S extends T> S save(S entity);      

  Optional<T> findById(ID primaryKey); 

  Iterable<T> findAll();               

  long count();                        

  void delete(T entity);               

  boolean existsById(ID primaryKey);   
}
```

```java
public interface PagingAndSortingRepository<T, ID>  {

  Iterable<T> findAll(Sort sort);

  Page<T> findAll(Pageable pageable);
}
```

## Créer notre repository
Supposons que nous avons codé une entité JPA `Student` et que nous souhaitions pouvoir effectuer des opérations de CRUD sur celle-ci. Dans ce cas, nous n'avons besoin que de définir une nouvelle classe qui hérite de `JPARepository` (elle même héritant de `PagingAndSortingRepository` et `CrudRepository`)

```java
public interface StudentRepository extends JPARepository<Student, Long> {
    // pas besoin de coder les opérations de CRUD
}
```

Nous n'avons pas besoin de coder les opérations de CRUD, elles sont hérités. Et nous pouvons très simplement utiliser notre nouvelle interface

```java
main() {
    studentRepository.save(new Student(...));
    List<Student> students = studentRepository.findAll();
    ...
}
```