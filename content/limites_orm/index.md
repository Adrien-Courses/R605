+++
title = "Les limites d'un ORM"
description = "Les limites d'un ORM : reconnaître les situations où JPA n'est plus le bon outil, et savoir quoi utiliser à la place."
weight = 50
+++

> [!ressource] Ressources
> - [Vlad Mihalcea - High-Performance Java Persistence](https://vladmihalcea.com/books/high-performance-java-persistence/)
> - [Thorben Janssen - Common Hibernate performance problems](https://thorben-janssen.com/hibernate-performance-tuning/)

Depuis le début du cours, nous avons empilé les couches d'abstraction : JDBC, puis JPA, puis Spring Data JPA. À chaque étage, nous écrivons moins de code et gagnons en confort. Mais **chaque abstraction a un prix**, et ce prix ne devient visible que sur des volumes de données réalistes ou sur des requêtes un peu inhabituelles.

> [!affirmation] L'idée à retenir
> Un ORM n'est pas une solution universelle à l'accès aux données : c'est un outil très efficace pour **manipuler un graphe d'objets métier** (charger une commande, la modifier, la sauvegarder). Il devient contre-productif dès qu'on sort de ce cas d'usage.

Ce chapitre a pour but de vous donner les **signaux d'alerte** : savoir reconnaître le moment où l'ORM n'est plus le bon outil, et savoir quoi faire à ce moment-là.

> [!definition] À ne pas confondre avec le chapitre Performance
> Le chapitre [JPA Performance]({{< relref "jpa_performance/" >}}) traite des cas où l'ORM **est** le bon outil, mais mal utilisé : un N+1, une pagination qui charge tout en mémoire, un contexte de persistance trop gros. **Ces problèmes se corrigent** sans quitter JPA.
>
> Le présent chapitre traite des cas où l'ORM **n'est pas** le bon outil, et où la seule bonne réponse est d'en sortir.

Nous allons voir successivement :
- ce que l'ORM ne parvient pas totalement à masquer, même bien utilisé ([impedance mismatch résiduel]({{< relref "limites_orm/impedance_mismatch_residuel" >}})) ;
- le cas où il est structurellement le mauvais outil ([reporting et requêtes analytiques]({{< relref "limites_orm/reporting" >}})) ;
- et enfin, [les alternatives]({{< relref "limites_orm/alternatives" >}}) à utiliser **en complément** de JPA.
