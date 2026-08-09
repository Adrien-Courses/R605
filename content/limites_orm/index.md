+++
title = "Les limites d'un ORM"
weight = 50
+++

> [!ressource] Ressources
> - [Vlad Mihalcea - High-Performance Java Persistence](https://vladmihalcea.com/books/high-performance-java-persistence/)
> - [Thorben Janssen - Common Hibernate performance problems](https://thorben-janssen.com/hibernate-performance-tuning/)

Depuis le début du cours, nous avons empilé les couches d'abstraction : JDBC, puis JPA, puis Spring Data JPA. À chaque étage, nous écrivons moins de code et gagnons en confort. Mais **chaque abstraction a un prix**, et ce prix ne devient visible que sur des volumes de données réalistes ou sur des requêtes un peu inhabituelles.

> [!affirmation] L'idée à retenir
> Un ORM n'est pas une solution universelle à l'accès aux données : c'est un outil très efficace pour **manipuler un graphe d'objets métier** (charger une commande, la modifier, la sauvegarder). Il devient contre-productif dès qu'on sort de ce cas d'usage.

Ce chapitre a pour but de vous donner les **signaux d'alerte** : savoir reconnaître le moment où l'ORM n'est plus le bon outil, et savoir quoi faire à ce moment-là.

Nous allons voir successivement :
- ce que l'ORM ne parvient pas totalement à masquer ([impedance mismatch résiduel]({{< relref "limites_orm/impedance_mismatch_residuel" >}})) ;
- les cas où il est structurellement le mauvais outil ([reporting et requêtes analytiques]({{< relref "limites_orm/reporting" >}}), [écritures en masse]({{< relref "limites_orm/bulk" >}})) ;
- deux pièges techniques classiques ([`MultipleBagFetchException`]({{< relref "limites_orm/multiple_bag_fetch" >}}), [pagination + `JOIN FETCH`]({{< relref "limites_orm/pagination_join_fetch" >}})) ;
- et enfin, [les alternatives]({{< relref "limites_orm/alternatives" >}}) à utiliser **en complément** de JPA.
