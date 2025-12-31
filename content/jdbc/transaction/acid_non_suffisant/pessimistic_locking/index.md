+++
title = "Pessimistic Locking"
weight = 5
+++

> [!ressource]
> - [How does database pessimistic locking interact with INSERT, UPDATE, and DELETE SQL statements](https://vladmihalcea.com/how-does-database-pessimistic-locking-interact-with-insert-update-and-delete-sql-statements/)

> [!definition] Définition
> Il part du principe que des conflits sont susceptibles de se produire, il verrouille donc les données de manière préventive avant toute mise à jour.

> [!note] Note
> L'exemple suivant est avec Hibernate est aborde la notion de `PESSIMISTIC_WRITE` (== à un [exclusive (write) lock]({{< relref "jdbc/transaction/controle_concurrence/two_phase_locking#type-de-lock-verrous" >}})).

Une race condition survient lorsque :
- plusieurs traitements concurrents
- accèdent aux mêmes données
- et que le résultat dépend de l’ordre d’exécution

## Exemple
Considérons un système d'entretien d'embauche de type Question/Réponse. Lors de l'entretien, il ne dois jamais y avoir plus d'une question sans réponse.

```
Question
Réponse
Question
Réponse
=> chemin correct

Question
Question
Réponse
=> Problème
```

En base de données nous avons
- une `InterviewSession` (l'entretien)
- plusieurs `InterviewTurn` qui correspond à un tour : question + réponse
- un `InterviewTurn` est associée à une question, et peut avoir un `Answer` ou non

### Implémentation naive (et incorrecte)
```java
public void createQuestion(...) {
    Session session = sessionFactory.openSession();
    Transaction tx = session.beginTransaction();

    // Rechercher s'il existe un tour (Turn) sans réponse
    // Si oui, alors on ne peut pas créer de nouvelle question
    boolean exists = session.createQuery(
        """
        select count(t)
        from InterviewTurn t
        where t.sessionId = :sessionId
        and t.answer is null
        """,
        Long.class
    )
    .setParameter("sessionId", sessionId)
    .getSingleResult() > 0;

    if (exists) {
        throw new ConflictException("Pending turn already exists");
    }

    InterviewTurn turn = new InterviewTurn(sessionId, nextIndex);

    Question question = new Question(turn.getId(), ...)

    session.persist(turn);
    session.persist(question)

    tx.commit();
    session.close();
}

```

#### Le problème
Imaginons deux requêtes simultanées

```sql
Requête A                Requête B
---------                ---------
check → aucun turn       check → aucun turn
insert turn              insert turn
```

- Les deux voient un état cohérent
- Donc les deux insère un nouveau turn, on a donc deux turns

#### Pourquoi les transactions ne suffisent pas ?

Ceci arrive, car le [niveau d'isolation]({{< relref "jdbc/transaction/isolation_level/#anomalies-autorisées" >}}) est `READ COMMITTED`, ce qui nous a conduit a un PHANTOM READ (lecture fantôme) qui a conduit à un LOST UPDATE.

### Une Solution : Verrou pessimiste (PESSIMISTIC_WRITE)

> [!definition] PESSIMISTIC_WRITE
> Un [lock exclusif]({{< relref "jdbc/transaction/controle_concurrence/two_phase_locking#type-de-lock-verrous" >}}) est acquis pour éviter qu'une autre transaction acquière elle aussi un verrou shared/exclusif

```java
// 1. verrouiller les données de la session
session.createQuery(
    """
    select t
    from InterviewTurn t
    where t.sessionId = :sessionId
    """
)
.setParameter("sessionId", sessionId)
.setLockMode(LockMode.PESSIMISTIC_WRITE) // Les autres transaction doivent attendre
.getResultList();

// 2. même code que précédemment 
boolean exists = session.createQuery(
    """
    select count(t)
    from InterviewTurn t
    where t.sessionId = :sessionId
      and t.answer is null
    """,
    Long.class
)
.getSingleResult() > 0;

if (exists) {
    throw new ConflictException();
}
```

En base de données ca se traduit par l'instruction `SELECT ... FOR UPDATE`

### Note
Ici nous aurions pu également mettre le niveau d'isolation [SERIALIZABLE]. Le niveau `REPEATABLE READ` n'aurait pas suffit car il permet les *phantom reads* (https://vladmihalcea.com/phantom-read/)

```sql
T1: SELECT ... WHERE answer_id IS NULL → 0 rows. -- donc on va pouvoir créer un nouveau tour
T2: SELECT ... WHERE answer_id IS NULL → 0 rows. -- donc on va pouvoir créer un nouveau tour

T1: INSERT interview_turn (answer_id = NULL)
T2: INSERT interview_turn (answer_id = NULL)
```

Invariant cassé car deux tours créés