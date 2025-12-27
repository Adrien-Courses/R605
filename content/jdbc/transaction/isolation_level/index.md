+++
title = "Isolation levels"
weight = 20
+++

> [!ressource] Ressource
> - [Database Isolation Levels](https://bytebytego.com/guides/what-are-database-isolation-levels/)

> Imaginez deux utilisateurs essayant d'accéder ou de modifier simultanément les mêmes données. Comment vous assurez-vous que les données ne sont pas corrompues ? C'est là que les niveaux d'isolation entrent en jeu.

## Définition
> [!definition] Définition
> L'isolation de la base de données permet à une transaction de s'exécuter comme s'il n'y avait aucune autre transaction en cours d'exécution simultanément.

L'isolation est garantie par [MVCC]({{< relref "mvcc" >}}) ou les [Locks]({{< relref "two_phase_locking" >}})

## 4 niveaux

- **Sérialisable** : il s'agit du niveau d'isolation le plus élevé. Les transactions simultanées sont garanties d'être exécutées dans l'ordre (= [2PL strict]({{< relref "two_phase_locking" >}})).


- **Lecture répétable (Repeatable Read)**  : les données lues pendant la transaction restent identiques à celles au début de la transaction.


- **Lecture validée (Read Committed)** : les modifications apportées aux données ne peuvent être lues qu'après la validation de la transaction.


- **Lecture non validée (Read Uncommitted)** : les modifications apportées aux données peuvent être lues par d'autres transactions avant la validation d'une transaction.

### Anomalies autorisées
Les niveaux d’isolation définissent quelles anomalies de concurrence peuvent se produire lors de l’exécution simultanée de transactions.  
Plus le niveau d’isolation est élevé, plus le système empêche ces phénomènes (lectures sales, lectures non répétables, fantômes, mises à jour perdues), au prix d’une concurrence réduite et de coûts supplémentaires en verrouillage ou en détection de conflits.  
Le niveau **SERIALIZABLE** offre la garantie la plus forte : l’exécution concurrente est équivalente à une exécution strictement séquentielle des transactions.

| Isolation level     | Dirty read | Non-repeatable read | Phantom | Lost update |
|---------------------|------------|---------------------|---------|-------------|
| READ UNCOMMITTED    | ❌ allowed | ❌ allowed          | ❌ allowed | ❌ allowed |
| READ COMMITTED      | ✅ prevented | ❌ allowed        | ❌ allowed | ❌ allowed |
| REPEATABLE READ     | ✅ prevented | ✅ prevented      | ❌ allowed | ✅ prevented |
| SERIALIZABLE        | ✅ prevented | ✅ prevented      | ✅ prevented | ✅ prevented |

## Conséquence
On peut donc peut implémenter tous les niveaux d’isolation avec par exemple Two-Phase Locking, mais seul le niveau SERIALIZABLE correspond à un 2PL strict garantissant la sérialisabilité.