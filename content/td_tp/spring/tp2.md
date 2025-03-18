+++
title = "TP2"
weight = 20
+++


## Rappel TP5-JPA
Dans le [TP5]({{< relref "td_tp/jpa_ee_container/tp5_correction" >}}), nous avons

### Partie 1
- Structurer l'application en 3 classes `Controller`, `Service` et `DAO`
- Puis créer un `GenericDao` car les méthodes de CRUD sont souvent similaire, que vous récupérer un objet `X` ou `Y` c'est la même opération en base de données, juste le type générique qui change
- Néanmoins le `GenericDao` se limite au opérations simples (CRUD), si vous souhaitez effectuer une jointure par exemple nous devons écrire notre propre méthode. Dans le TP5, nous voulions par exemple récupérer les étudiants avec leurs soirées

```java
public class StudentDao {
    ...
    public Student findWithSoirees(Long id) {
        return em.createQuery(
                "SELECT s FROM Student s LEFT JOIN FETCH s.soirees WHERE s.id = :id", Student.class)
            .setParameter("id", id)
            .getSingleResult();
    }
}
```

### Partie 2 et 3
Puis nous avons complexifié notre application pour y intégrer
- de la Pagination avec la méthode générique `public List<T> findAllPaginated(int page, int size)`
- de la recherche via l'API Criteria avec la méthode `List<T> findByCriteria(Map<String, Object> criterias)`
  - qui prend un critère sous la forme `<nom_colonne, valeur>`

## Consignes
> [!affirmation] Objectif
> Reprendre le TP5 pour le traduire avec Spring Data JPA