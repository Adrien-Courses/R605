+++
title = "Server-Side Caching"
weight = 10
+++

## Objectif

> [!definition] Objectif
> Réduire le coût de parsing, validation et optimisation des requêtes SQL répétitives.

## Statement lifecycle

![statemebnt_lifecycle.png](statemebnt_lifecycle.png)

Quand une requête préparée arrive pour la première fois :
1. Parsing : La base de données parse le SQL et vérifie la syntaxe
2. Optimize : Génère un plan d’exécution
3. Executor : Execute le plan d'exécution pour traiter les données

L'étape 2. est très coûteuse : Analyse des statistiques (cardinalité, sélectivité), Évaluation de plusieurs plans possibles, Choix des algorithmes (index scan, full scan, join methods, etc.). Recalculer un plan à chaque exécution serait prohibitivement cher, c'est pour cette raison qu'il est stocké en cache.

=> Lors de la première exécution, la base de données calcule et choisit un plan d’exécution optimal.
**Tant que la requête et son contexte restent identiques, ce plan est conservé en cache et réutilisé lors des exécutions suivantes.**