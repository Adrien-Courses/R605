+++
title = "HATEOAS"
weight = 99
+++

> [!ressource] Ressources
> - [ Hypermedia IRL (Roman GARCIA, Hugo THOMAS) ](https://youtu.be/yMk7Y57HhlA)

 ## Avantages
Créer un graphe de ressources qui permet :
 - d'exposer les relations entre les objets métier et de naviguer d'une ressource à une autre
 - d'avoir une API "introspectable" : du moment où on a un point d'entrée dans l'api, on va pouvoir introspecter toute l'API graphe au lien des graphes
 - de concentrer la logique métier et la complexité dans le serveur
 - de découpler le client du serveur
