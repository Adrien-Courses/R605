+++
title = "Transactions"
weight = 30
+++

{{% notice style="tip" title="Ressources" icon="book" %}}
- [Spring Transaction Best Practices (Attention pour Spring)](https://vladmihalcea.com/spring-transaction-best-practices/)
- [63.6. La gestion des transactions hors Java EE](https://www.jmdoudoux.fr/java/dej/chap-jpa.htm#jpa-6)
{{% /notice %}}

- `void begin()` 	Débuter la transaction
- `void commit()` 	Valider la transaction
- `void roolback()` 	Annuler la transaction
- `boolean isActive()` 	Déterminer si la transaction est active

```java
EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("my-persistence-unit");
EntityManager entityManager = entityManagerFactory.createEntityManager();

EntityTransaction transaction = entityManager.getTransaction();

try {
    transaction.begin();  // Begin transaction

    MyEntity entity = new MyEntity(1L, "Entity Name");
    entityManager.persist(entity);  // Persist entity to the database

    transaction.commit(); // commit
    System.out.println("Transaction committed successfully.");
} catch (Exception e) {
    if (transaction.isActive()) {
        transaction.rollback();
        System.out.println("Transaction rolled back due to error.");
    }
    e.printStackTrace();
} finally {
    entityManager.close()
}

entityManagerFactory.close();
```

## Transactions optionnelles
> (Optional) A single-threaded, short-lived object used by the application to specify atomic units of work. It abstracts the application from the underlying JDBC, JTA or CORBA transaction. A org.hibernate.Session might span several org.hibernate.Transactions in some cases. However, transaction demarcation, either using the underlying API or org.hibernate.Transaction, is never optional. Basic API's / architecture doc

> [Every database operation](https://vladmihalcea.com/a-beginners-guide-to-acid-and-database-transactions/) runs inside a transaction, even if you don't explicitly call begin/commit/rollback.

Le conteneur Java EE propose un support des transactions grâce à l'API JTA : c'est la façon standard de gérer les transactions par le conteneur. Hors d'un tel conteneur, par exemple dans une application Java SE, les transactions ne sont pas supportées.
- Wildfly, Glassfish, ou un framework comme Spring Boot, les transactions sont gérées automatiquement.
- Dans une application Java SE classique (non conteneurisée), vous devez manuellement gérer les transactions. Dans un tel contexte, l'API Java Persistence propose une gestion des transactions grâce à l'interface EntityTransaction.

### Cas sans container 
- En incluant seulement la dépendance hibernate
- Nous n’exécutons pas notre code dans un conteneur

Ainsi, si nous ne précisons pas explicitement le début et la fin de la transaction aucune données ne sera persisté dans l'exemple ci-dessous
```java
@Test
public void testAddLigneDetail() {
    EntityManager entityManager = entityManagerFactory.createEntityManager();
    // entityManager.getTransaction().begin();   NOT WORKING
    
    Commande commande = new Commande();
    commande.addLigneDetails(new LigneDetail());
    

    entityManager.persist(commande);

    // entityManager.getTransaction().commit();  NOT WORKING
    entityManager.close();
}
```
https://github.com/Adrien-Courses/R605-JPA-Transaction-training


### Cas avec container
```java
public class UserService {
    @PersistenceContext
    private EntityManager entityManager;

    public void createUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        entityManager.persist(user); // Transaction automatiquement gérée
    }
}
```