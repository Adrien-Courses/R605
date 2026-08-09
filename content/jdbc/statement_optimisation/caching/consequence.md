+++
title = "Conséquence"
description = "Comparaison chiffrée sur 10 000 insertions : le coût du parsing et de la latence avec et sans cache de statements côté client et serveur."
weight = 30
+++

Imaginons 10 000 insertions

## Sans cache

À chaque ligne :

- Client prépare le statement
- Envoie au serveur
- Serveur parse & optimize
- Exécute

=> Beaucoup de parsing, latence et overhead

## Avec cache serveur + client

- Le client réutilise le même PreparedStatement
- Le serveur réutilise le même plan

=> Moins d’allers-retours + moins de CPU dépensé