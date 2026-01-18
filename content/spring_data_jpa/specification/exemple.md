+++
title = "Exemple"
weight = 10
+++

## 2 implémentations possibles
Juste pour compléter sur les Spécifications, vous avez l'obligation de vérifier que la valeur n'est pas NULL. En effet, si vous ne faites pas la vérification on se retrouve avec `HERE numberOfDoors = null`
Sauf qu'en base de données, nous n'avons aucune voiture avec des portes null ...


Il existe deux approches
- La première dans la méthode toPredicate, vous vérifiez si la valeur est null. Si elle est null alors vous renvoyez une `conjunction()` qui d'après la Javadoc
    *Create a conjunction (with zero conjuncts). **A conjunction with zero conjuncts is true.*** => donc votre spécification sera toujours vraie. Si les portes ne sont pas renseignées dans le champ de recherche alors on veut prendre tous les nombres en compte

- La seconde, vérifiez si la valeur est différente de `null` avant d'ajouter une clause `and()`

```java
public class CarSpec {

    public static Specification<Car> filterBy(CarsFilter carsFilter) {
        return Specification
                .where(hasMake(carsFilter.make()))
                .and(hasNumberOfDoors(carsFilter.numberOfDoors()));
    }

    public static Specification<Car> filterBy2(CarsFilter carsFilter) {
        Specification<Car> specification = Specification.where(null);

        if(carsFilter.make() != null) {
            // Attention à bien réaffecter specification = specification.and(...)
            specification = specification.and(hasMake2(carsFilter.make()));
        }

        if(carsFilter.numberOfDoors() != null) {
            // Attention à bien réaffecter specification = specification.and(...)
            specification = specification.and(hasNumberOfDoors2(carsFilter.numberOfDoors()));
        }

        return specification;
    }

    private static Specification<Car> hasMake(String make) {
        // Utilisation de cb.conjunction() si null
        return ((root, query, cb) -> make == null || make.isEmpty() ? cb.conjunction() : cb.equal(root.get(MAKE), make));
    }

    private static Specification<Car> hasNumberOfDoors(Integer numberOfDoors) {
        return (root, query, cb) -> numberOfDoors == null ? cb.conjunction() : cb.equal(root.get(NUMBER_OF_DOORS), numberOfDoors);
    }

    private static Specification<Car> hasMake2(String make) {
        // Pas besoin de checker le null, car on utilise if(carsFilter.make() != null) dans l'appelant
        return ((root, query, cb) -> cb.equal(root.get(MAKE), make));
    }

    private static Specification<Car> hasNumberOfDoors2(Integer numberOfDoors) {
        return (root, query, cb) -> cb.equal(root.get(NUMBER_OF_DOORS), numberOfDoors);
    }
}
```