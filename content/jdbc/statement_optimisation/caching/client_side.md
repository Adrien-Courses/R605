+++
title = "Client-side Caching"
description = "Le cache client du driver JDBC : réutiliser les PreparedStatement déjà préparés pour éviter de les recréer à chaque exécution."
weight = 20
+++

## Objectif 

> [!definition] Objectif
> Réduire les round-trips + overhead de création de PreparedStatement du côté du client

```java
Connection conn = dataSource.getConnection();
PreparedStatement ps = conn.prepareStatement(sql);
```

Quand on crée le statement précédent, le driver JDBC peut :
- Garder en mémoire les PreparedStatement déjà préparés
- Réutiliser ceux qui ont la même requête SQL => évite de le recréer 