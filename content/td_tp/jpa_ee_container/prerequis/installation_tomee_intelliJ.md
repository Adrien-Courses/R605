+++
title = "Intégration TomEE/IntelliJ"
weight = 7
+++

## Les différentes instances de TomEE
> Apache TomEE has four distributions, each supporting a slightly different set of technologies and aimed to give you a choice in what you want included out-of-the-box. When in doubt, choose Apache TomEE Plume.

![TomEE instances](tomee_instances.png)

Dans l'ensemble des exercices proposés dans ce site nous aurons besoin :
- de pouvoir effectuer des requêtes HTTP
- de pouvoir persister nos données
- d'avoir de l'injection de dépendances (CDI)

Et c'est la version *TomEE WebProfile* qui répond a minima à ce besoin

## Téléchargement
- Télécharger une version Eclipse Enterprise Edition
- Télécharger la version zip 10.1 de TomEE WebProfile [https://tomee.apache.org/download.html](https://tomee.apache.org/download.html)

## Installer TomEE
1. De-zipper Tomcat dans le répertoire de votre choix (e.g. C:/java/tomee)

## Créer un Dynamic Web Project
- Créer ou récupérer un dynamic web project

### Propriétés Maven pour postes IUT
Si c'est un projet Maven, sur les postes de l'IUT il faut modifier les paramètres maven suivants
- Settings --> Maven --> User Settings file et Local Repository pour mettre un emplacement vers votre disque `z:`

![alt text](maven_intellij.png)

```xml
<!-- Contenu du fichier settings.xml -->
<settings>
    <proxies>
        <proxy>
            <id>iut-proxy</id>
            <active>true</active>
            <protocol>http</protocol>
            <host>cache.iut-rodez.fr</host>
            <port>8080</port>
        </proxy>
    </proxies>
</settings>
```

## Déployer
1. Edit Configuration --> Add new --> TomEE
2. Compléter le Application serveur en renseignant le chemin vers le dossier TomEE (e.g. C:/java/tomee)
3. On Update Action : Hot swap
4. Dans l'onglet *deployement* --> Add --> Artifact --> ajouter le :war

Vous venez d'ajouter votre projet, vous pouvez maintenant lancer puis récupérer l'URL dans la console afin de la saisir dans le configuration

![alt text](tomee_intellij.png)