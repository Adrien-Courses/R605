+++
title = "Intégration TomEE/IntelliJ"
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

## Créer un Dynamic Web Project
- Créer ou récupérer un dynamic web project

## Configurer IntelliJ
1. Edit Configuration --> Add new --> TomEE
2. Compléter le Application serveur en renseignant le chemin vers le dossier TomEE (e.g. C:/java/tomee)
3. On Update Action : Hot swap
4. Dans l'onglet *deployement* --> Add --> Artifact --> ajouter le :war

Vous venez d'ajouter votre projet, vous pouvez maintenant lancé puis récupérer l'URL dans la console afin de la saisir dans le configuration

![alt text](tomee_intellij.png)