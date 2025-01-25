
+++
title = "TP2 JDBC Transaction"
weight = 20
+++

> [!Ressource] Ressource
> [https://github.com/Adrien-Courses/R605-JDBC-transaction](https://github.com/Adrien-Courses/R605-JDBC-transaction)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consigne
Dans une application bancaire, on doit transférer de l'argent entre deux comptes. Le transfert nécessite deux opérations critiques :

- Débiter le montant du compte source.
- Créditer le montant au compte cible.

Si l'une de ces deux étapes échoue (par exemple : faute de fonds suffisants, erreur réseau, etc), tout le transfert doit être annulé pour éviter un déséquilibre dans les comptes.

### Code source initial
Le code source initial crée une table `account` et initialise les deux comptes suivants
```
+----+-------+---------+
| id | name  | balance |
+----+-------+---------+
|  1 | Alice |    1000 |
|  2 | Bob   |     500 |
+----+-------+---------+
```