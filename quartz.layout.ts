import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileNode } from "./quartz/components/ExplorerNode";


const filterFn = (node: FileNode): boolean => {
  // Exclude 'tags' folder
  if (node.name === "tags") {
    return false;
  }

  // Exclude 'index.md' files
  if (node.file && node.name === "index") {
    return false;
  }

  return true;
};

const sortByWeight = (a: FileNode, b: FileNode): number => {
  const getWeight = (node: FileNode): number => {
    if (node.file) {
      // Node is a file; retrieve weight from frontmatter
      return node.file.frontmatter?.weight ?? Infinity;
    } else {
      // Node is a folder; attempt to retrieve weight from index.md frontmatter
      const indexFile = node.children.find(
        (child) => {
          if (child.name == "index") {
            return child

          }
          
        }
      );
      //console.log(indexFile?.file?.frontmatter?.weight)
      return indexFile?.file?.frontmatter?.weight ?? Infinity;
    }
  };

  const weightA = getWeight(a);
  const weightB = getWeight(b);

  // If weights are equal, fall back to alphabetical sorting
  if (weightA === weightB) {
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }

  return weightA - weightB;
};


// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: 'giscus',
      options: {
        // from data-repo
        repo: 'Adrien-Courses/R5D11-website-quartz',
        // from data-repo-id
        repoId: 'R_kgDONi8oSQ',
        // from data-category
        category: 'Announcements',
        // from data-category-id
        categoryId: 'DIC_kwDONi8oSc4Cljrc',
      }
    }),
  ],
  footer: Component.Footer({
    links: {
      Site : "https://adriencaubel.fr",
      GitHub: "https://github.com/adrien1212/",
      LinkedIn: "https://www.linkedin.com/in/adriencaubel/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({
      spacerSymbol: "❯", // symbol between crumbs
      rootName: "Agile", // name of first/root element
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.Explorer({
      folderClickBehavior: "link", // what happens when you click a folder ("link" to navigate to folder page on click or "collapse" to collapse folder on click)
      folderDefaultState: "open", // default state of folders ("collapsed" or "open")
      useSavedState: false, // whether to use local storage to save "state" (which folders are opened) of explorer
      sortFn: sortByWeight,
      filterFn: filterFn,
      order: ["sort", "filter", "map"],
    }
    ))
  ],
  right: [
    Component.Graph({
      localGraph: {
        drag: true, // whether to allow panning the view around
        zoom: true, // whether to allow zooming in and out
        depth: 2, // how many hops of notes to display
        scale: 1.1, // default view scale
        repelForce: 0.5, // how much nodes should repel each other
        centerForce: 0.3, // how much force to use when trying to center the nodes
        linkDistance: 40, // how long should the links be by default?
        fontSize: 0.5, // what size should the node labels be?
        opacityScale: 1, // how quickly do we fade out the labels when zooming out?
        removeTags: [], // what tags to remove from the graph
        showTags: true, // whether to show tags in the graph
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [], // what tags to remove from the graph
        showTags: true, // whether to show tags in the graph
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs({
    spacerSymbol: "❯", // symbol between crumbs
    rootName: "Agile", // name of first/root element
  }
  ), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.Explorer({
      folderClickBehavior: "link", // what happens when you click a folder ("link" to navigate to folder page on click or "collapse" to collapse folder on click)
      folderDefaultState: "open", // default state of folders ("collapsed" or "open")
      useSavedState: false,
      sortFn: sortByWeight,
      filterFn: filterFn,
      order: ["sort", "filter", "map"],
    }
    )),
  ],
  right: [
    Component.Graph({
      localGraph: {
        drag: true, // whether to allow panning the view around
        zoom: true, // whether to allow zooming in and out
        depth: 2, // how many hops of notes to display
        scale: 1.1, // default view scale
        repelForce: 0.5, // how much nodes should repel each other
        centerForce: 0.3, // how much force to use when trying to center the nodes
        linkDistance: 40, // how long should the links be by default?
        fontSize: 0.5, // what size should the node labels be?
        opacityScale: 1, // how quickly do we fade out the labels when zooming out?
        removeTags: [], // what tags to remove from the graph
        showTags: true, // whether to show tags in the graph
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [], // what tags to remove from the graph
        showTags: true, // whether to show tags in the graph
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
