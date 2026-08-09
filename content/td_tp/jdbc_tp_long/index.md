+++
title = "JDBC TP Long"
description = "TP long JDBC : implémenter le pattern DAO sur une application de gestion d'emprunts, puis traiter les accès concurrents."
weight = 16
+++

> [!Ressource] Ressource
> - [https://github.com/Adrien-Courses/R605-TP-JDBC-TP-Long-Bibliotheque](https://github.com/Adrien-Courses/R605-TP-JDBC-TP-Long-Bibliotheque)
> - [Le pattern DAO](https://zestedesavoir.com/tutoriels/646/apprenez-a-programmer-en-java/559_interactions-avec-les-bases-de-donnees/2725_lier-ses-tables-avec-des-objets-java-le-pattern-dao/#2-8711_le-pattern-dao)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consigne

> [!note] Note
> Ce travail est plus long que les précédents et nécessite un travail de recherche.

### 2.1 Étudier le pattern DAO
Premièrement renseignez-vous sur le pattern DAO
- [Le pattern DAO](https://zestedesavoir.com/tutoriels/646/apprenez-a-programmer-en-java/559_interactions-avec-les-bases-de-donnees/2725_lier-ses-tables-avec-des-objets-java-le-pattern-dao/#2-8711_le-pattern-dao)
- [What is Data access object (DAO) in Java](https://stackoverflow.com/questions/19154202/what-is-data-access-object-dao-in-java)

![pattron dao oracle](https://www.oracle.com/ocom/groups/public/@otn/documents/digitalasset/145996.jpg)

Et répondre aux questions suivantes :
- A quoi sert un DAO ?
- Où placer la gestion de transaction ?

<!--
Trx dans couche service, car seul la couche service cb de dao vont etre appelé
Sinon ca veut dire une transaction par méthode ce qui peut etre faux !!!
-->

### 2.2 Développer 
Une bibliothèque souhaite gérer :
- ses livres
- les emprunts réalisés par des utilisateurs

Chaque livre peut être emprunté ou disponible.

**Table book**
| Champ     | Type SQL     | Description          |
| --------- | ------------ | -------------------- |
| id        | INT (PK)     | Identifiant du livre |
| title     | VARCHAR(255) | Titre                |
| author    | VARCHAR(255) | Auteur               |
| available | BOOLEAN      | Disponible ou non    |

**Table load**
| Champ     | Type SQL     | Description         |
| --------- | ------------ | ------------------- |
| id        | INT (PK)     | Identifiant emprunt |
| book_id   | INT (FK)     | Livre emprunté      |
| borrower  | VARCHAR(255) | Nom de l’emprunteur |
| loan_date | DATE         | Date d’emprunt      |

#### Modèle métier
Créer les classes pour représenter le domaine métier

#### Créer la couche DAO
Vous créerez les interfaces *puis* les implémentations pour les livres et les réservations

Les actions suivantes sont demandées pour les livres
- créer un livre
- récupérer un livre par son id
- lister tous les livres
- mettre à jour un livre existant

Les actions suivantes sont demandées pour une réservation
- créer une réservation
- trouver toutes les réservations d'un client

<!--- 
```java
public interface BookDAO {
    void create(Book book);
    Book findById(int id);
    List<Book> findAll();
    void update(Book book);
}

public interface LoanDAO {
    void create(Loan loan);
    List<Loan> findByBorrower(String borrower);
}
```
puis créer les implémentations

ATTENTION : aucune logique métier dans le DAO
-->

#### Logique métier
Créer une classe `LibraryService` qui permet :

- emprunter un livre :
    - vérifier que le livre est disponible
    - créer un emprunt
    - passer le livre en indisponible

Questions 
- Que se passe-t-il si deux utilisateurs empruntent le même livre en même temps ?
    - vous pouvez développer une version simple qui ne gère pas les *race conditions*
    - puis une seconde méthode les prend en compte

<!---
Résultat final ❌

2 emprunts pour le même livre
livre indisponible (OK)
incohérence métier

👉 C’est un race condition classique (lost update / write skew).

Isolation par défaut : REPEATABLE READ
Cela garantit :
lecture cohérente dans une transaction
❌ pas d’exclusion mutuelle

Donc :
deux transactions peuvent lire available = true
et agir en parallèle

Solution 1 — Verrou pessimiste
=> String sql = "SELECT id, title, author, available FROM book WHERE id = ? FOR UPDATE";

Solution 2 — Update conditionnel (optimisation élégante)
UPDATE book
SET available = false
WHERE id = ? AND available = true

int updated = ps.executeUpdate();
if (updated == 0) {
    throw new IllegalStateException("Book already borrowed");

Solution 3 — Optimistic locking (version column)
UPDATE book
SET available = false, version = version + 1
WHERE id = ? AND version = ?

-->

## 3. Aller plus loin
- Gérer la pagination sur la méthode `findAll()`

<!--
@Override
public List<Book> findAll(int page, int pageSize) {
    final String sql = """
        SELECT id, title, author, available
        FROM book
        ORDER BY id
        LIMIT ? OFFSET ?
        """;

    int offset = (page - 1) * pageSize;

    try (PreparedStatement ps = connection.prepareStatement(sql)) {
        ps.setInt(1, pageSize);
        ps.setInt(2, offset);

        try (ResultSet rs = ps.executeQuery()) {
            List<Book> books = new ArrayList<>();
            while (rs.next()) {
                books.add(map(rs));
            }
            return books;
        }
    } catch (SQLException e) {
        throw new RuntimeException("Failed to paginate books", e);
    }
}
--->