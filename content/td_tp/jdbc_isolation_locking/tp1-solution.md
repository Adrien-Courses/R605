+++
title = "TP1 Solution"
weight = 11
+++

## 4. Proposer des solutions
### Pessimistic Locking
On met un verrou exclusif lors de la lecture de l’évènement
=> les autres transactions doivent attendre qu'elles soient en lecture ou écriture

```java
Event event = em.find(Event.class, eventId, LockModeType.PESSIMISTIC_WRITE);
```

### Optimistic Locking
> [!ressource] Complément
> - [How Spring Boot + JPA Pessimistic Locking Solves Overselling Once and For All](https://medium.com/@gaddamnaveen192/how-spring-boot-jpa-pessimistic-locking-solves-overselling-once-and-for-all-a250086ba529?sk=e8bfcafa831a277d78da06e752eacfa1)

- Nécessite `@Version` et de mettre à jour l'entité `Event`
- => pour ce faire on va rajouter une colonne pour incrémenter le nombre de places réservées. En effet pour que la version soit incrémentée il faut avoir une modification de l'entité

Si on ajoute uniquement, alors on peut toujours avoir un accès concurrent (le test échoue)
```java
public void reserveOne() {
    if (reserved >= capacity) {
        throw new IllegalStateException("Event is full");
    }
    reserved++;
}
```

Il faut donc impérativement rajouter une version dans notre entité
```java
/**
 * Verrou optimiste
 */
@Version
private long version;

```