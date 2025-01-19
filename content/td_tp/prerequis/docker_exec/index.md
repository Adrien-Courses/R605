+++
title = "BDD dans container docker"
weight = 20
+++

Pour accéder à la base de données de notre container

1. Récupérer le container-id via `docker ps`
```
CONTAINER ID   IMAGE          COMMAND                  CREATED        STATUS         PORTS                               NAMES
59ab04cbe6df   mysql:8.0      "docker-entrypoint.s…"   2 weeks ago    Up 6 minutes   33060/tcp, 0.0.0.0:3307->3306/tcp   jpa-jee-enterprise-architecture-db-1
```

2. Accéder au container `docker exec -it 59ab04cbe6df bash` <br><br>

3. Accéder à la base de données `mysql -u root -p`
   - `root` étant l'utilisateur
   - `-p` vous demandera de saisir le mot de passe

## Commandes sql
Afficher les BDD disponibles
```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| jdbc-training      |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

Sélectionner une base de données
```
mysql> use jdbc-training;
Database changed
```

Afficher les tables
```
mysql> show tables;
+-------------------------+
| Tables_in_jdbc-training |
+-------------------------+
| client                  |
+-------------------------+
```

Requête SQL classiques
```
mysql> SELECT * from client;
+----+-------+------+
| id | nom   | age  |
+----+-------+------+
|  1 | Alice |   25 |
|  2 | Alice |   25 |
|  3 | Alice |   25 |
+----+-------+------+
```