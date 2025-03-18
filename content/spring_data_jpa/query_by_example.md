+++
title = "Query By Example"
weight = 55
+++

> [!ressource] Ressource
> - [Documentation](https://docs.spring.io/spring-data/jpa/reference/repositories/query-by-example.html)
> - [Query By Example in Spring Data JPA: A Clean Approach to Dynamic Queries - Dan Vegas](https://www.danvega.dev/blog/spring-data-jpa-query-by-example)
> - [Spring Data Query By Example - Vlad Mihalcea](https://vladmihalcea.com/spring-data-query-by-example/)

Cette approche simplifie la création de requêtes complexes sans avoir à écrire de nombreuses méthodes de repository ou des requêtes JPQL complexes

```java
public interface EtudiantRepository extends 
    JpaRepository<Etudiant, Long>,
    QueryByExampleExecutor<Etudiant> {
}
```

Supposons que nous ayons une entité Etudiant avec les attributs `nom`, `prenom` et `departement`. Pour trouver des étudiants d'un certain département, vous pouvez créer une instance de `Etudiant` avec le département souhaité et utiliser cette instance comme exemple (== un *probe*) pour la requête

```java
@Service
public class EtudiantService {

    @Autowired
    private final EtudiantRepository repository;

    public List<Etudiant> trouverEtudiantsParDepartement(String departement) {
        Etudiant probe = new Etudiant();
        probe.setDepartement(departement); // On écrit un probe en settant le département

        return repository.findAll(Example.of(probe));
    }
}
```

=> Dans cet exemple, tous les étudiants appartenant au département spécifié seront retournés.​ Ceci nous évite d'écrire une [Specification]({{< relref "specification" >}})

## Utilisation d'ExampleMatcher pour des correspondances avancées
Par défaut, QBE utilise une correspondance exacte pour les attributs non nuls. Cependant, avec ExampleMatcher, vous pouvez personnaliser la stratégie de correspondance, par exemple pour effectuer des recherches insensibles à la casse ou des correspondances partielles

```java
@Service
public class EtudiantService {

    @Autowired
    private final EtudiantRepository repository;

    public List<Etudiant> rechercherEtudiants(String nom, String departement) {
        Etudiant probe = new Etudiant();
        probe.setNom(nom);
        probe.setDepartement(departement);

        ExampleMatcher matcher = ExampleMatcher.matching()
            .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING)
            .withIgnoreCase()
            .withIgnoreNullValues();

        return repository.findAll(Example.of(probe, matcher));
    }
}
```