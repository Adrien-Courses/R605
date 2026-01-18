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
Étudier la notion de *Connection Pool*. Nous simulons le transfert d'argent d'un compte source à un compte destination.

### Sans Pool
- Exécuter la classe `WithoutPooling` pour déterminer le temps d'exécution de l'insertion de 100 lignes, puis de 1000 lignes.

### Avec Pool

> [!ressource] Ressource
> [BasicDataSource Configuration Parameters](https://commons.apache.org/proper/commons-dbcp/configuration.html)

En vous appuyant sur une bibliothèque qui permet d'effectuer du *pooling* (e.g. `commons-dbcp2`) effectuez le même traitement que précédemment. Changez la taille du pool.
 