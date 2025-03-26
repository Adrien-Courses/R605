+++
title = "Spécifications"
weight = 50
+++

> [!ressource] Ressources
> - https://docs.spring.io/spring-data/jpa/reference/jpa/specifications.html
> - [The best way to use the Spring Data JPA Specification](https://vladmihalcea.com/spring-data-jpa-specification/)
> - [Un des premiers articles sur les Specification et leurs lien avec les Predicate](https://spring.io/blog/2011/04/26/advanced-spring-data-jpa-specifications-and-querydsl)

> [!affirmation] Rappel
> - Nous avons déjà aborder la notion de spécification avec JPA, voir [API Criteria]({{< relref "jpa_deeper/criteria_api/" >}})

```java
public interface CustomerRepository extends CrudRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
}
```

- L'interface `JpaSpecificationExecutor` permet de bénéficier de la méthode `List<T> findAll(Specification<T> spec);`

## Interface Specification
L'interface `Specification` ne dispose que d'une seule méthode
```java
public interface Specification<T> {
  Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder);
}
```

Et cette interface vient nous aider à créer facilement des prédicats. En effet, avec [API Criteria]({{< relref "jpa_deeper/criteria_api/" >}}) les prédicats ne sont pas faciles à externaliser et à réutiliser parce qu'il faut d'abord mettre en place le `CriteriaBuilder`, le `CriteriaQuery` et le `Root`.

```java
CriteriaBuilder builder = em.getCriteriaBuilder();
CriteriaQuery<Customer> query = builder.createQuery(Customer.class);
Root<Customer> root = query.from(Customer.class);

Predicate hasBirthday = builder.equal(root.get(Customer_.birthday), today);
Predicate isLongTermCustomer = builder.lessThan(root.get("createdAt"), today.minusYears(2); 

query.where(builder.and(hasBirthday, isLongTermCustomer));

em.createQuery(query.select(root)).getResultList();
```

## Créer des prédicats

L'interface `Specification` va donc nous aider à construire rapidement des prédicats

```java
public CustomerSpecifications {

  public static Specification<Customer> customerHasBirthday() {
    return new Specification<Customer> {
      public Predicate toPredicate(Root<T> root, CriteriaQuery query, CriteriaBuilder cb) {
        return cb.equal(root.get("birthday"), today);
      }
    };
  }

  public static Specification<Customer> isLongTermCustomer() {
    return new Specification<Customer> {
      public Predicate toPredicate(Root<T> root, CriteriaQuery query, CriteriaBuilder cb) {
        return cb.lessThan(root.get("createdAt"), new LocalDate.minusYears(2));
      }
    };
  }
}
```

## Utiliser des prédicats
Nous pouvons maintenant utiliser nos deux prédicats, car pour rappel `CustomerRepository` étend `JpaSpecificationExecutor`

```java
customerRepository.findAll(hasBirthday());
customerRepository.findAll(isLongTermCustomer());
```

```java
public class CustomerService {
    public List<Customer> giveReductionToLoyalCustomer() {
        return customerRepository.findAll(where(customerHasBirthday()).and(isLongTermCustomer()));
    }
}

```