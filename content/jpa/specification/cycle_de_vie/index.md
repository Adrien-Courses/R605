+++
title = "Cycle de vie entité JPA"
weight = 40
+++

> [!ressource] Ressources
> - [José Paumard - Cycle de vie d'une entité JPA](https://youtu.be/gsBWy6YyhjI?list=PLzzeuFUy_CnhVfJIKyc3okTiiCc0anutx)
> - [Vlad Mihalcea - A beginner’s guide to entity state transitions with JPA and Hibernate](https://vladmihalcea.com/a-beginners-guide-to-jpa-hibernate-entity-state-transitions/) <br><br>
>
> - [TD1 JPA Cycle de vie]({{< relref "td_tp/jpa/td1" >}}) - Mise en oeuvre de l’illustration décrite ci-dessous

![ A beginner’s guide to entity state transitions with JPA and Hibernate ](https://youtu.be/EgVUsgtRqIs)

JPA fait passer la mentalité du développeur des instructions SQL aux transitions d'état des entités. Une entité peut se trouver
dans l'un des états suivants

| État | Description |
|------|-------------|
| NEW (Transitoire) | **Une entité nouvellement créée, qui n’est associée à aucune ligne de la base de données**, est considérée comme étant dans l’état *Nouveau* ou *Transitoire*. Lorsqu’elle devient gérée, le contexte de persistance émet une instruction `INSERT` lors de la phase de synchronisation (*flush*). |
| MANAGED (Persistant) | **Une entité persistante est associée à une ligne de la base de données et est gérée par le contexte de persistance actuellement actif**. Les changements d’état sont détectés par le mécanisme de *dirty checking* et sont propagés vers la base de données sous forme d’instructions `UPDATE` lors de la phase de synchronisation (*flush*). |
| DETACH | Lorsque le contexte de persistance actif est fermé, toutes les entités précédemment gérées deviennent détachées. Les modifications ultérieures ne sont plus suivies et aucune synchronisation automatique avec la base de données n’a lieu. |
| REMOVE | Une entité supprimée est uniquement planifiée pour suppression. L’instruction `DELETE` correspondante est exécutée dans la base de données lors de la phase de synchronisation (*flush*) du contexte de persistance. |

![alt text](cycle_de_vie2.png)

1. `UserJPA user = new UserJPA()`
Lorsqu'on crée une nouvelle en JPA, elle se retrouve dans l'état `NEW`

1. `entityManager.persist(user)`
Lorsqu'on fait un `persist()` sur l'entité, alors elle passe dans l'état `MANAGED`. Cela signifie que l'entité est connue par un `EntityManager`

1. `entityManager.detach(user)`
Lorsqu'on détache une entité, nous disons à JPA que l'entité n'est plus managée par JPA mais elle continue néanmoins à garder des informations comme quoi elle est la représentation de quelque chose qui existe en base. Pour re-attacher il faudra utiliser la méthode `merge()`

1. `entityManager.remove(user)`
Finalement, si nous n'avons plus besoin de cet utilisateur nous allons faire un `remove()`. Par conséquent, l'entité va être dans l'état `REMOVED`. Note, à ce moment l'entité n'est pas supprimé en base il faudra attendre les opérations de *commit*


Le *Persistence Context* capture les changements d'état des entités et, lors du flush, les traduit en
instructions SQL. Les interfaces JPA `EntityManager` et Hibernate `Session` sont des passerelles vers le
*Persistence Context* sous-jacent et définissent toutes les opérations de transition d'état des entités.