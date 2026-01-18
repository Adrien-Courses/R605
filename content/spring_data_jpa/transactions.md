+++
title = "Transactions"
weight = 25
+++
 
> [!ressource] Ressource
> - [Doc Spring - Transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
> - [Why can I save without @Transactional?](https://stackoverflow.com/questions/47813086/why-can-i-save-without-transactional)

> By default, methods inherited from CrudRepository inherit the transactional configuration from SimpleJpaRepository. For read operations, the transaction configuration readOnly flag is set to true. All others are configured with a plain @Transactional so that default transaction configuration applies.

```java
class SimpleJpaRepository<I, ID> implements CrudRepository<I, ID> {
    @Transactional
    public <S extends T> S save(S entity) {
        Assert.notNull(entity, "Entity must not be null");
        if (this.entityInformation.isNew(entity)) {
            this.entityManager.persist(entity);
            return entity;
        } else {
            return (S)this.entityManager.merge(entity);
        }
    }
}
```