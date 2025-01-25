+++
title = "TD1 JDBC Pooling"
weight = 30
+++

> [!Ressource] Ressource
> - [https://github.com/Adrien-Courses/R605-JDBC-pooling](https://github.com/Adrien-Courses/R605-JDBC-pooling)
> - [The best way to determine the optimal connection pool size](https://vladmihalcea.com/optimal-connection-pool-size/)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consigne
Étudier la notion de *Connection Pool*

La classe `InitDatabase` permet de créer et insérer 1000 lignes dans la table suivante :
```
+------+------------------+
| id   | data             |
+------+------------------+
| 1    | Sample Data 0    |
| 2    | Sample Data 1    |
| n    |      ...         |
| 1000 | Sample Data 1000 |
```

### Sans Pool
- Compléter la classe `WithoutPooling` pour déterminer le temps d'exécution de la lecture des 1000 lignes

### Avec Pool

> [!ressource] Ressource
> [BasicDataSource Configuration Parameters](https://commons.apache.org/proper/commons-dbcp/configuration.html)

En vous appuyant sur une bibliothèque qui permet d'effectuer du *pooling* (e.g. `commons-dbcp2`) effectuer le même traitement que précédemment.
 