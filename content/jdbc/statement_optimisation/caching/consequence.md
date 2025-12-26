+++
title = "Conséquence"
weight = 30
+++

Imaginons 10 000 insertions

## Sans cache

À chaque ligne :

- lient prépare statement
- Envoie au serveur
- Serveur parse & optimize
- Exécute

=> Beaucoup de parsing, latence et overhead

## Avec cache serveur + client

- Le client réutilise le même PreparedStatement
- Le serveur réutilise le même plan

=> Moins d’allers-retours + moins de CPU dépensé