+++
title = "@ManyToMany"
weight = 40
+++

> [!ressource] Ressources
> - [KooR - Mapping d'une relation @ManyToMany](https://koor.fr/Java/TutorialJEE/jee_jpa_many_to_many.wp)
> - [Best way to map the JPA and Hibernate ManyToMany relationship](https://vladmihalcea.com/the-best-way-to-use-the-manytomany-annotation-with-jpa-and-hibernate/)

Contrairement à ce que nous avions vu dans les chapitres précédents, il n'y a qu'une seule manière de réaliser une relation de type « Many-To-Many » en base de données : il faut impérativement passer par une table d'association. 

![](https://youtu.be/bVLsHPfYerk)

## Cas unidirectionnelle 
```java
@Entity
public  class Musicien  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToMany
    private Collection<Instrument> instruments ;

    // reste de la classe
}

@Entity
public  class Instrument  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // reste de la classe
}
```

De manière optionnelle, nous pouvons préciser la table de jointure ainsi que le nom des colonne

```java
@JoinTable(
    name = "musicien_instrument",
    joinColumns = @JoinColumn(name = "musicien_id"),
    inverseJoinColumns = @JoinColumn(name = "instrument_id")
)
private Set<Instrument> instruments = new HashSet<>();
```

Avec une seul direction, seule l'entité `Musicien` peut accéder à la liste des instruments. Ainsi si on souhaite savoir quels musiciens jouent un instrument particulier, nous devons soit :
- Effectuer une requête spécifique sur la table d'association.
- Modifier la structure pour inclure la bidirectionnalité.

## Cas bidirectionnelle
```java
@Entity
public  class Musicien  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToMany
    private Collection<Instrument> instruments ;

    // reste de la classe
}

@Entity
public  class Instrument  implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToMany(mappedBy="instruments")
    private Collection<Musicien> musiciens ;

    // reste de la classe
}
```

Dans ce deuxième cas, la structure de tables générée est la même. Notons encore une fois que c'est la présence de l'attribut `mappedBy` qui crée le caractère bidirectionnel de la relation. Si l'on ne le met pas, alors JPA créera une seconde table de jointure. 

### Cas x2 @OneToMany

> [!ressource] Ressource
> [The best way to map a JPA and Hibernate many-to-many association with extra columns](https://vladmihalcea.com/the-best-way-to-map-a-many-to-many-association-with-extra-columns-when-using-jpa-and-hibernate/)

Nous pouvons également utiliser deux `@OneToMany` pour représenter une relation *many-to-many*.

![manytomany_alternative](manytomany_alternative.png)

L'entité `PostTag` possède un identifiant composé des colonnes `post_id` et `tag_id`.

```java
@Embeddable
public static class PostTagId implements Serializable {
    private Long postId;
    private Long tagId;
    public PostTagId() {}
    public PostTagId(Long postId, Long tagId) {
        this.postId = postId;
        this.tagId = tagId;
    }
    public Long getPostId() {
        return postId;
    }
    public Long getTagId() {
        return tagId;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostTagId that = (PostTagId) o;
        return Objects.equals(postId, that.postId) &&
                Objects.equals(tagId, that.tagId);
    }
    @Override
    public int hashCode() {
        return Objects.hash(postId, tagId);
    }
}
```

```java
@Entity(name = "PostTag")
@Table(name = "post_tag")
public class PostTag {
 
    @EmbeddedId
    private PostTagId id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId")
    private Post post;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    private Tag tag;
}
```

Puis dans les classes `Post` et `Tag` nous pouvons écrire respectivement

```java
@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PostTag> tags = new ArrayList<>();
```

```java
@OneToMany(mappedBy = "tag", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PostTag> posts = new ArrayList<>();
```

De cette manière, la relation bidirectionnelle `@ManyToMany` est transformée en deux associations bidirectionnelles `@OneToMany`.

Cependant, à noter que les méthodes utilitaires, notamment `removeTag()` sont plus compliqué à écrire car elles doivent se trouver dans `PostTag`

```java
public void addTag(Tag tag) {
    PostTag postTag = new PostTag(this, tag);
    tags.add(postTag);
}
 
public void removeTag(Tag tag) {
    for (Iterator<PostTag> iterator = tags.iterator();
         iterator.hasNext(); ) {
        PostTag postTag = iterator.next();
         
        if (postTag.getPost().equals(this) && postTag.getTag().equals(tag)) {
            iterator.remove();
            postTag.setPost(null);
            postTag.setTag(null);
        }
    }
}
```