+++
title = "TP3 Query By Example"
weight = 30
+++

> [!ressource] Ressources
> - [https://github.com/Adrien-Courses/R601-TP-SPRINGJPA-query-by-example](https://github.com/Adrien-Courses/R601-TP-SPRINGJPA-query-by-example)

## 1. Télécharger et lancer le projet
- Lancer Docker Desktop
- Télécharger et [importer le projet Maven dans Eclipse]({{< relref "td_tp/prerequis/impoter_project_maven/index" >}})

Lancer l'image docker présente dans le `Dockerfile` : `docker compose up`

> [!definition] Lancer une fois 
> 1. Lancer la méthode JpaSpringEnterpriseArchitectureApplication.main() une première fois
> 2. Ceci va insérer des données dans la table `Article` et `Client`
> 3. Dans `application.properties` modifier `spring.sql.init.mode=always` en `spring.sql.init.mode=never`

## 2. Consignes
En vous appuyant sur les *Queries By Example* créer un endpoint `/search` permettant de rechercher un étudiant en prenant en compte :
- LastName : exact matching
- FirstName : startWith
- universityName : startWith


<!--

public List<Student> searchStudents(
        String firstName,
        String lastName,
        String lastNameStartsWith,
        Integer year,
        Double gpaMin,
        String city,
        String universityName
    ) {
        Student probe = new Student();
        probe.setFirstName(firstName);
        probe.setLastName(lastName);
        probe.setYear(year);
        probe.setCity(city);
        
        University university = new University();
        university.setName(universityName);
        probe.setUniversity(university);

        ExampleMatcher matcher = ExampleMatcher.matching()
            .withIgnoreNullValues()
            .withIgnorePaths("studentId")
            .withMatcher("lastName", m -> m.startsWith())
            .withMatcher("university.name", m->m.startsWith());

        Example<Student> example = Example.of(probe, matcher);
        List<Student> results = studentRepository.findAll(example);


        return results;
    }

http://localhost:4546/students/search?firstName=Alice&universityName=MIT
-->