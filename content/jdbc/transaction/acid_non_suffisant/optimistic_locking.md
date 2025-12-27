+++
title = "Optimistic Locking"
weight = 10
+++

> [!ressource] Ressource
> - [Optimistic Offline Lock - Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
> - [Optimistic Locking in JPA (pas en JDBC)](https://www.baeldung.com/jpa-optimistic-locking)
> - [Optimistic vs. Pessimistic locking - StackOverflow](https://stackoverflow.com/questions/129329/optimistic-vs-pessimistic-locking)
> - [Pessimistic vs Optimistic Locking](https://newsletter.systemdesigncodex.com/p/pessimistic-vs-optimistic-locking)

> [!affirmation] Affirmation
> Pour coordonner les changements d'état, le contrôle de la concurrence au niveau de l'application on utilise le verrouillage explicite (*explicit locking*), qui se décline en deux variantes : le verrouillage pessimiste et le verrouillage optimiste.

## Verrouillage optimiste
> [!definition] Définition
>  Le verrouillage optimiste repose sur la détection des modifications apportées aux entités en vérifiant leur **attribut de version**.

L'algorithme de verrouillage optimiste fonctionne comme suit :
1. Lorsqu'un client lit une ligne particulière, sa version accompagne les autres champs

2. lors de la mise à jour d'une ligne, le client filtre l'enregistrement actuel en fonction de la version qu'il a précédemment chargée.

```sql
UPDATE produit
SET (quantité, version) = (4, 2)
WHERE id = 1 AND version = 1; -- ajout de "version =" dans la clause WHERE
```

3. Si le résultat de l'instruction est égal à zéro, cela signifie que la version a été incrémentée entre-temps. Donc la transaction actuelle opère désormais sur une version obsolète de l'enregistrement.

![stateful_version](staeful_version.png)

=> Ceci permet d'éviter le phénomène de *Lost update*