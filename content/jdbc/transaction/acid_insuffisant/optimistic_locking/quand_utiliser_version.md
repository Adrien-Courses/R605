+++
title = "Quand utiliser @Version"
weight = "30"
+++

> [!ressource] Ressource
> [Optimistic Offline Lock - Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
> [Optimistic Locking in JPA (pas en JDBC)](https://www.baeldung.com/jpa-optimistic-locking)

Pour terminer cette section sur le versionning des entités, quand doit-on utiliser `@Version` ?

> [!affirmation] Quand utiliser le versionning
> @Version is used to implement [Optimistic locking](https://stackoverflow.com/questions/129329/optimistic-vs-pessimistic-locking) with Hibernate, which means that no two transactions override the data at the same time with a conflict.

## Exemple concret 

### Deux applications
Comme vu dans [Stateless anti-pattern]({{< relref "jdbc/transaction/application_level/#stateless-conversation-anti-pattern" >}}) lorsque deux applications distinctes accèdent à la même base de données

### Deux personnes distinctes modifient
Supposons un service client qui accède à vos données pour les mettre à jour.
Si deux personnes de ce même service modifient en même temps vos données, la dernière personne à enregistrer écrasera les autres

### Deux onglets du navigateur
```
Onglet A charge la commande -> status = OPEN
Onglet B charge la commande -> status = OPEN

Onglet A valide -> status = VALIDATED
Onglet B annule -> status = CANCELED
```

- ❌ La modification de l’onglet A est perdue
- ❌ Bug métier invisible (la commande a été validée, peut-être même payé et demandée à être expédiée)

=> Le raisonnement "on a une seule application, donc pas besoin de versionning" est donc faux

## Conclusion

En cas d'accès concurrent, alors une exception est levée et doit être transmise à l'utilisateur en lui demandant de rafraîchir sa page par exemple

![alt text](staeful_version.png)