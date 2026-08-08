+++
title = "CDI"
weight = 5
+++

> CDI (Contexts and Dependency Injection) is a powerful dependency injection framework that is part of the Jakarta EE (formerly Java EE) platform. It allows for the injection of dependencies into managed beans and provides a way to manage the lifecycle of those beans. It also supports contextual lifecycle management and events, making it a key part of Java enterprise applications.

Avec CDI, nous n'avons plus besoin d'une méthode `main()` comme point d'entrée de l'application. Le conteneur CDI (comme celui fourni par un serveur d'applications Java EE) gère le cycle de vie de l'application. De plus, CDI gère la création et l'injection des objets, ce qui signifie que nous n'avons plus besoin d'utiliser `new()` pour instancier la plupart de nos objets.

## Sans CDI
```java
public static void main(String args[]) {
    ArticleRepository articleRepository = new ArticleRepository();
    ArticleService articleService = new ArticleService(articleRepository);
    RestControllerArticle rca = new RestControllerArticle(articleService);
}
```

## Avec CDI
```java
public class RestControllerArticle {
    @Inject 
    private ArticleService articleService
}

public class ArticleService {
    @Inject 
    private ArticleRepository articleRepository
}
```
Le container CDI gérera automatiquement le cycle de vie et l'injection des beans.

Note : avec Spring vous utilisez l’annotation `@Autowired`