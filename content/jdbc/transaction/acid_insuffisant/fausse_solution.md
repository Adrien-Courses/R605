+++
title = "La fausse solution"
weight = 20
+++

Avant d'étudier les deux types de locking, je vous propose de regarder une solution intuitive mais fausse.

## Retour sur l'exemple

![](acid_insuffisant.png)

> **Fausse solution** : Ici, lorsqu'on appelle `decreaseStock()`, on aurait qu'à vérifier que la quantité est supérieure à 1 !

### Codons

```java
decreaseStock() {
    int qty = createQuery("Select qty FROM article where id=1")

    if(qty <= 0) { 
        throw new Exception("stock insuffisant") 
    }

    createQuery("UPDATE article SET stock = stock - 1") 
}
```

Que se passe-t-il si deux requêtes arrivent en même temps ?

![alt text](fausse_solution.png)

1. Que ce soit pour Alice ou Bob, le `Select qty FROM article where id=1` retourne 1
2. Donc les deux échouent le test `if(qty <= 0)`
3. Donc ils `UPDATE article SET stock = stock - 1` tous les deux

=> Résultat, nous avons `-1` en stock

### Conclusion

Une vérification uniquement logicielle n'est pas suffisante en cas d'accès concurrent.

Une première solution consisterait à positionner un verrou sur les `SELECT` => faire du `SELECT ... FOR UPDATE` - [Pessimistic Locking]({{< relref "jdbc/transaction/acid_insuffisant/pessimistic_locking/index" >}})