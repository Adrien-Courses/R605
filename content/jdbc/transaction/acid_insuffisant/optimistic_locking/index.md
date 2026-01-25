+++
title = "Optimistic Locking"
weight = 40
+++

> [!ressource] Ressource
> - [Optimistic vs. Pessimistic Locking](https://vladmihalcea.com/optimistic-vs-pessimistic-locking/)
> - [Optimistic Offline Lock - Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
> - [Optimistic Locking in JPA (pas en JDBC)](https://www.baeldung.com/jpa-optimistic-locking)

> [!affirmation] Affirmation
> Pour coordonner les changements d'état via le contrôle de la concurrence au niveau de l'application, on utilise le verrouillage explicite (*explicit locking*), qui se décline en deux variantes : le verrouillage pessimiste et le verrouillage optimiste.

## Verrouillage optimiste
> [!definition] Définition
>  Il part du principe que les conflits sont rares. Au lieu de verrouiller les données à l'avance, il permet à plusieurs utilisateurs d'accéder et même de modifier les mêmes données simultanément, et ne vérifie les conflits qu'au moment de la validation.

L'algorithme de verrouillage optimiste fonctionne comme suit :
1. Lorsqu'un client lit une ligne particulière, sa version accompagne les autres champs

2. lors de la mise à jour d'une ligne, le client filtre l'enregistrement actuel en fonction de la version qu'il a précédemment chargée.

```sql
UPDATE produit
SET (quantité, version) = (4, 2)
WHERE id = 1 AND version = 1; -- ajout de "version =" dans la clause WHERE
```

3. Si le résultat de l'instruction est égal à zéro, cela signifie que la version a été incrémentée entre-temps. Donc la transaction actuelle opère désormais sur une version obsolète de l'enregistrement.

![alt text](update_zero.png)


Comme on le voit sur l'image, la `VERSION` vaut `2` à la suite de l'UPDATE de Bob, alors quand Alice souhaite mettre à jour avec `AND VERSION=1` aucune ligne match.

> **So, the Lost Update is prevented by rolling back the subsequent transactions that are operating on state data.**

## Conséquence application

D'un point de vue applicatif, nous pouvons le traduire comme suit. La méthode `executeUpdate` de lʼinstruction `UPDATE` PreapredStatement va renvoyer une valeur de 0 ligne, ce qui signifie quʼaucun enregistrement nʼa été modifié, et le framework dʼaccès aux données
sous-jacent va lever une exception `OptimisticLockException` qui provoquera le rollback de la transaction dʼAlice

![alt text](optimisticexception.png)

![alt text](update_zero2.png)

**=> On demande à l'utilisateur de rafraîchir la page**