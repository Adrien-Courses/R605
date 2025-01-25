+++
title = "TP1 JPA Découverte"
weight = 10
+++

> [!Ressource] Ressource
> [https://github.com/Adrien-Courses/R605-TP-JPA-decouverte](https://github.com/Adrien-Courses/R605-TP-JPA-decouverte)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

## 2. Consigne

> [!affirmation] Objectif
> L'objectif de ce TP est de se familiariser avec JPA et les opérations réalisable au travers de l'EntityManager

1. Configurer l'accès à la base de données dans le fichier `src/main/resources/META-INF/persistance.xml` <br><br>

2. Créer une entité (via une classe) `Person` avec les attributs `id`, `nom` et `age` <br><br>

3. Utiliser l'EntityManager pour
   - Créer deux personnes et les persister
   - Récupérer toutes les entités de la base de données (et les afficher dans la console)
   - Modifier une entité existante
   - Supprimer une entité existante