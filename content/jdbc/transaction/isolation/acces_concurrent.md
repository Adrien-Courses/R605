+++
title = "Accès concurrent"
weight= 10
+++

> [!ressource] Ressource
> [Accès concurrent et transactions](https://www.universalis.fr/encyclopedie/systemes-informatiques-systemes-de-gestion-de-bases-de-donnees/5-acces-concurrent-et-transactions/)

## Définition

> [!definition] Définition
> La notion d'accès concurrent décrit la situation où plusieurs applications veulent accéder à la même donnée en même temps

## Le problème

Dans un système où plusieurs transactions s’exécutent simultanément, l’accès concurrent aux mêmes données peut entraîner des incohérences si ces accès ne sont pas correctement coordonnés. Deux transactions peuvent par exemple lire une valeur obsolète, écraser mutuellement leurs mises à jour (lost update), ou observer des états intermédiaires invalides.

### Exemple 1
![le problème](le_probleme.png)

1. Alice et Bob lisent (read) un compte
2. Bob le met à jour et le commit
3. Alice fait le même, mais ne réalise pas que Bob avait déjà changé la ligne. => Conflit


**=> Nous devons donc gérer les conflits**