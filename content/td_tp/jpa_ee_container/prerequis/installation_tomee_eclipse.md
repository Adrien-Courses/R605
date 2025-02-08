+++
title = "Intégration TomEE/Eclipse"
weight = 7
+++

## Les différentes instance de TomEE
> Apache TomEE has four distributions, each supporting a slightly different set of technologies and aimed to give you a choice in what you want included out-of-the-box. When in doubt, choose Apache TomEE Plume.

![TomEE instances](tomee_instances.png)

Dans l'ensemble des exercices proposées dans ce site nous aurons besoins :
- de pouvoir effectuer des requêtes HTTP
- de pouvoir persister nos données
- d'avoir de l'injection de dépendances (CDI)

Et c'est la version *TomEE WebProfile* qui répond à minima à ce besoin

## Téléchargement
- Télécharger une version Eclipse Enterprise Edition
- Télécharger la version zip 10.1 de TomEE WebProfice [https://tomee.apache.org/download.html](https://tomee.apache.org/download.html)

## Installer TomEE
1. De-zipper Tomcat dans le répertoire de votre choix (e.g. C:/java/tomee)

## Configurer Eclipse
1. Aller dans l'onglet "Window" > "Show View" > "Servers"
2. Dans la vue "Servers" qui apparaît, cliquer droit et choisir "New" > "Server"
3. Dans la liste des serveurs, développer "Apache" et sélectionner "Tomcat v10.0 Server" (il n'y a pas de tomee disponible)
4. Puis sélectionner l'emplacement de votre serveur Tomcat (e.g. C:/java/tomee)
5. Finish

![alt text](tomee_installation.png)

<!-- 
## Tester la configuration
### Créer un projet web de test

1. File > New > Dynamic Web Project
2. Donner un nom au projet
3. Sélectionner TomEE comme runtime
4. Cliquer sur "Finish"


### Ajouter une page de test

1. Créer un fichier index.html dans WebContent ou src/main/webapp
2. Ajouter du contenu HTML basique (e.g. index.html)
   ![Dynamic web app structure](dynamic_web_app_structure.png)
3. Déployer le projet sur Tomcat (glisser-déposer vers le serveur)
    - Dans l'onglet "Server" > Clic Droit > "Add and Remove" 
    - Ajouter (add) le projet créé
    ![Add and remove tomee](tomcat_add_and_remove.png)
4. Accéder à http://localhost:8080/nom-du-projet (e.g. http://localhost:8080/test)

-->

## Déployer 
- Déployer le projet sur Tomcat (glisser-déposer vers le serveur)
    - Dans l'onglet "Server" > Clic Droit > "Add and Remove" 
    - Ajouter (add) le projet créé
    ![Add and remove tomee](tomcat_add_and_remove.png)
- Accéder à http://localhost:8080/nom-du-projet (e.g. http://localhost:8080/test)
