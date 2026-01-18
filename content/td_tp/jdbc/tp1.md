+++
title = "TP1 JDBC"
weight = 10
+++

> [!Ressource] Ressource
> [https://github.com/Adrien-Courses/R401-JDBC-training](https://github.com/Adrien-Courses/R401-JDBC-training)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## Consignes
1. Initier la connexion à la base de données
2. Créer une table client contenant l'id (PK), le nom (VARCHAR 50) et l'age du client
3. Insérer un nouveau client
4. Récupérer le contenu de la table 

À tout moment vous pouvez [accéder à la base de données du container]({{< relref "td_tp/prerequis/docker_exec/index" >}})