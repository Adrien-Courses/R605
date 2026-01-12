+++
title = "TP Long solution"
weight = 10
draft = true
+++

## Qui gère les transactions ?
>  Où placer la gestion de transaction ?

Elle ne peut pas être dans les DAO, car si de la logique métier à besoin d'appeler plusieurs DAO et qu'il faut commit/rollback l'ensemble alors seul la couche Service est au courant de se besoin.
Donc la gestion des transactions est de la responsabilité du service

## Deux utilisateurs empruntent le même livre en même temps 
> Que se passe-t-il si deux utilisateurs empruntent le même livre en même temps ?

Il peut y avoir une *race condition*

| Temps | User A                       | User B                       |
| ----- | ---------------------------- | ---------------------------- |
| T1    | SELECT book (available=true) |                              |
| T2    |                              | SELECT book (available=true) |
| T3    | INSERT loan                  |                              |
| T4    |                              | INSERT loan                  |
| T5    | UPDATE book → false          |                              |
| T6    |                              | UPDATE book → false          |
| T7    | COMMIT                       | COMMIT                       |

Bug : Un livre ne peut être emprunté que par une seule personne à la fois.

### Isolation par défaut : REPEATABLE READ
Ne garantie pas l'exclusion mutuelle

Donc :
- deux transactions peuvent lire available = true
- et agir en parallèle

### Solution 1 — Verrou pessimiste (SELECT ... FOR UPDATE)
`String sql = "SELECT id, title, author, available FROM book WHERE id = ? FOR UPDATE";`

Effet :
- la ligne est verrouillée
- la 2ᵉ transaction attend ou échoue

### Solution 2 — Update conditionnel (= une approche optimiste)
```sql
UPDATE book                   -- UPDATE pose un verrou exclusif
SET available = false
WHERE id = ? AND available = true
```

Puis vérifier
```java
int updated = ps.executeUpdate();
if (updated == 0) {
    throw new IllegalStateException("Book already borrowed");
}
```

```java
public void borrowBook(int bookId, String borrower) {
    try {
        connection.setAutoCommit(false);

        // 1. Tentative atomique
        String updateSql = """
            UPDATE book
            SET available = false
            WHERE id = ? AND available = true
            """;

        try (PreparedStatement ps = connection.prepareStatement(updateSql)) {
            ps.setInt(1, bookId);
            if (ps.executeUpdate() == 0) {
                throw new IllegalStateException("Book already borrowed");
            }
        }

        // 2. Créer l'emprunt
        loanDao.create(new Loan(bookId, borrower, LocalDate.now()));

        connection.commit();
    } catch (Exception e) {
        connection.rollback();
        throw new RuntimeException(e);
    } finally {
        connection.setAutoCommit(true);
    }
}
```

### Solution 3 — Isolation SERIALIZABLE
`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`

Mais très lent

### Solution 4 — Optimistic locking (via version)
```sql
UPDATE book
SET available = false, version = version + 1
WHERE id = ? AND version = ?
```

Un peu overkill ici, autant prendre la solution 2