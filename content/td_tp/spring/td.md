+++
title = "TD Join vs JoinFetch"
weight = 10
+++

> [!ressource] Ressource
> -
> - Lancez une première fois puis renommez le fichier `data.sql` en `.data.sql`

Dans de TD nous allons voir la différence entre un `JOIN` et un `JOINFETCH` au travers des Spécifications JPA

## 2. Consignes
Nous avons deux tables `Tarif` et `TarifPeriode`.
- Les tarifs sont associés à un article (ici un String)
- et les tarifs ne sont pas uniques, suivant la périodes ils varient

C'est pour cette raison que nous avons une relation "un tarif à plusieurs tarifPeriode"
- par exemple, le tarif `id=1` à trois période chacune d'une durée d'un an

```
mysql> show tables;
+-----------------------------+
| Tables_in_join-vs-joinfetch |
+-----------------------------+
| tarif                       |
| tarif_periode               |
+-----------------------------+
2 rows in set (0.01 sec)

mysql> select * from tarif_periode;
+----+----------+-------+------------+
| id | fk_tarif | prix  | date_debut |
+----+----------+-------+------------+
|  1 |        1 |  8.99 | 2023-01-01 |
|  2 |        1 | 10.99 | 2024-01-01 |    
|  3 |        1 |  12.5 | 2025-01-01 |
|  4 |        2 |  8.75 | 2024-01-01 |
+----+----------+-------+------------+
```

**Objectif** Nous souhaitons récupérer les `Tarifs` ayant une `TarifPeriode.dateDebut > :dateDebut` qu'on donne en paramètre.

### Structure du code
Pour ce faire, les morceaux de code suivants sont fournis
- Le Controller : `http://localhost:8080/tarifs?dateDebut=2023-01-01`
- Le Service
- Le Repository

Dans le service on va utiliser une spécification pour créer un filtre sur la date (API Criteria)

```java
public List<Tarif> getTarifsAvecDateDebut(LocalDate dateDebut) {
    Specification<Tarif> spec = TarifSpecifications.filter(dateDebut);
    return tarifRepository.findAll(spec);
}
```

```java
public class TarifSpecifications {

    public static Specification<Tarif> filter(LocalDate dateDebut) {
        Specification<Tarif> specification = Specification.where(null);

        if(dateDebut != null) {
            specification = specification.and(avecTarifPeriodeValide(dateDebut));
        }

        return specification;
    }

    private static Specification<Tarif> avecTarifPeriodeValide(LocalDate date) {
        return (root, query, cb) -> {
            // Créer le join avec TarifPeriode
            Join<Tarif, TarifPeriode> periodeJoin = root.join("periodes", JoinType.INNER);

            // Filtrer sur la date
            return cb.greaterThan(periodeJoin.get("dateDebut").as(LocalDate.class), date);
        };
    }
}
```

**Coder** : observer la méthode `avecTarifValide` et exécutez les requêtes suivantes
- `http://localhost:8080/tarifs?dateDebut=2023-01-01`
- `http://localhost:8080/tarifs?dateDebut=2024-01-01`

Le résultat vous semble-t-il fonctionnellement juste ? Que remarquez-vous ?
- Analysez les requêtes SQL, pour vous aidez mettez un point d'arrêt ligne 25 dans `TarifService`

<!--
Même les dates antérieurs en 2023 et 2024 sont éxecutés
En effet, le JOIN ne récupère pas les données -> quand on les affiche via le DTO on va faire un SELECT vers chaqu'un des TarifPeriode

DOnc ligne 24 on a bien seulement Tarif qui est chargé et dont la jointure à bien fonctionner car en 2024 nius n'avons pas l'article B
Néanmoins quand on affiche le JSON on va faire un tarif.getTarifPeriode() qui va déclancher 3 SELECT


=> Le join ne se tratuit pas comme un vrai join sql


-->

### Utilisation JOIN FETCH
Remplacez le code précédent par 

```java
private static Specification<Tarif> avecTarifPeriodeValide(LocalDate date) {
    return (root, query, cb) -> {
        // Créer le join avec TarifPeriode
        Fetch<Tarif, TarifPeriode> fetch = root.fetch("periodes", JoinType.INNER);
        Join<Tarif, TarifPeriode> periodeJoin = (Join<Tarif, TarifPeriode>) fetch;

        // Filtrer sur la date
        return cb.greaterThan(periodeJoin.get("dateDebut").as(LocalDate.class), date);
    };
}
```

Le résultat vous semble-t-il fonctionnellement juste ? Que remarquez-vous ?
- Analysez les requêtes SQL

> The FETCH keyword of the JOIN FETCH statement is JPA-specific. It tells the persistence provider to not only join the 2 database tables within the query but to also initialize the association on the returned entity. You can use it with a JOIN and a LEFT JOIN statement.

https://thorben-janssen.com/hibernate-tips-difference-join-left-join-fetch-join/