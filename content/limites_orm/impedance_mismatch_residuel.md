+++
title = "Impedance mismatch résiduel"
weight = 10
+++

> [!ressource] Ressource
> - [The Vietnam of Computer Science - Ted Neward](https://web.archive.org/web/20220823105749/http://blogs.tedneward.com/post/the-vietnam-of-computer-science/)

Nous avons introduit l'[impedance mismatch]({{< relref "jpa/mapping/impedancemismatch" >}}) au début du cours : le monde objet et le monde relationnel ne raisonnent pas de la même façon. L'ORM réduit énormément cet écart… mais il ne le supprime pas. Il en **déplace** une partie dans votre code, et une autre dans votre tête.

## L'ORM ne supprime pas l'écart, il le déplace

Reprenons les exemples vus en cours.

**L'identité.** En Java, deux objets sont égaux si `equals()` le dit. En base, deux lignes sont identiques si leur clé primaire l'est. Ces deux notions ne coïncident pas : une entité qui n'a pas encore été persistée n'a pas encore d'identifiant. C'est toute la difficulté d'écrire un `equals()`/`hashCode()` correct sur une entité, et la raison pour laquelle une entité fraîchement créée peut « disparaître » d'un `HashSet` après un `persist()`.

**L'héritage.** Le modèle relationnel ne connaît pas l'héritage. JPA propose [trois stratégies]({{< relref "jpa/mapping_associations/heritage/index" >}}) (`SINGLE_TABLE`, `JOINED`, `TABLE_PER_CLASS`), mais aucune n'est satisfaisante sur tous les plans : la première gaspille de la place et interdit les colonnes `NOT NULL`, la deuxième multiplie les jointures, la troisième rend les requêtes polymorphes très coûteuses. **C'est un compromis, pas une traduction.**

**La navigation.** En objet, on écrit naturellement `commande.getClient().getAdresse().getVille()`. Cette ligne, anodine à la lecture, peut déclencher deux requêtes SQL — ou une `LazyInitializationException`. Le langage vous laisse écrire quelque chose que la base ne peut pas faire gratuitement.

> [!definition] La conséquence pratique
> L'ORM rend le **code** simple, mais il ne rend pas le **problème** simple. Le SQL généré reste quelque chose que vous devez savoir lire et anticiper. Un développeur qui ne connaît pas SQL n'écrira pas du bon JPA : il écrira du JPA qui fonctionne en TP et qui s'effondre en production.

## L'abstraction qui fuit

On parle d'**abstraction non étanche** (*leaky abstraction*) : une abstraction censée vous cacher un détail, mais dont le détail ressurgit au plus mauvais moment.

Vous en avez déjà rencontré plusieurs dans ce cours :
- la [`LazyInitializationException`]({{< relref "jpa_deeper/fetch/lazyexception" >}}) : le chargement paresseux, invisible dans le modèle objet, devient soudain visible parce que la session est fermée ;
- le [problème N+1]({{< relref "jpa_deeper/fetch/index" >}}) : une simple boucle Java se transforme en centaines de requêtes ;
- le [dirty checking]({{< relref "jpa/specification/cycle_de_vie/flushing" >}}) : un `setNom()` déclenche un `UPDATE`… ou pas, selon qu'on est ou non dans une transaction.

Dans les trois cas, le symptôme apparaît **loin** de sa cause, et il est invisible à la lecture du code Java seul. C'est le coût réel de l'abstraction.
