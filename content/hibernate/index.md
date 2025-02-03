+++
title = "Hibernate"
weight = 70
+++

Hibernate est l'ORM le plus populaire dans l'écosystème Java qui implémente la spécification JPA

![JPA_impl](JPA_impl.png)


Hibernate est un ORM qui se présente sous forme de librairies Java que nous pouvons ajouter à notre projet

![hibernate project](images/hibernate_projects.png)

Et pour le moment, nous nous sommes qu’appuyer sur les configurations, les interfaces et les classes proposées par JPA mais Hibernate apporte également quelques compléments.

## Configuration Hibernate
Avec JPA nous avions le fichier `persistance.xml`.
- lorsqu'on utilise Hibernate, nous pouvons garder ce fichier ou bien créer un fichier `resources/hibernate.cfg.xml`.
- mais nous pouvons également utiliser le fichier `resources/hibernate.cfg.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <property name="hibernate.connection.driver_class">com.mysql.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/Book</property>
        <property name="hibernate.connection.username">root</property>
        <property name="hibernate.connection.password"></property>
        <property name="hibernate.connection.pool_size">1</property>
        <property name="hibernate.current_session_context_class">thread</property>
        <property name="hibernate.show_sql">true</property>
        <property name="hibernate.dialect">org.hibernate.dialect.MySQLDialect</property>

        <mapping resource="book.hbm.xml" />
    </session-factory>
</hibernate-configuration>
```

## Session et SessionFactory
> [!ressource] Ressource
> [Hibernate SessionFactory vs. JPA EntityManagerFactory](https://stackoverflow.com/a/60354685/9399016)

- Avec le standard JPA nous utilisions `EntityManager` et `EntityManagerFactory`
- Hibernate propose `Session` et `SessionFactory`

> So, the `SessionFactory` is also a JPA `EntityManagerFactory`, `SessionFactory` extends the JPA `EntityManagerFactory`

![sessionFactory](sf.png)

- `EntityManager` fournit `persist()`, `merge()`, `remove()` et `find(Class<T>, id)`
- `Session` fournit `save()`, `update()`, `delete()` et `get(Class<T>, id)`

```java
SessionFactory factory = new Configuration().configure("hibernate.cfg.xml")
        .addAnnotatedClass(MyEntity.class)
        .buildSessionFactory();

Session session = factory.openSession();
try {
    session.beginTransaction();
    MyEntity entity = new MyEntity();
    entity.setName("Hibernate Example");
    session.save(entity);
    session.getTransaction().commit();
} finally {
    session.close();
    factory.close();
}
```

