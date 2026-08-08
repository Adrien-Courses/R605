import fs from "fs"
import path from "path"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { slugifyFilePath } from "./quartz/util/path"
import type { FilePath } from "./quartz/util/path"

// Explorer ordering is driven by the `weight` frontmatter property.
// The explorer builds its tree in the browser from static/contentIndex.json,
// which only carries a fixed set of fields (slug, title, links, tags, ...) —
// `weight` never reaches the client. So the weights are read from disk here at
// config load time and baked into the sort function below.
const contentDir = "content"
const weights: Record<string, number> = {}

function collectWeights(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectWeights(fp)
      continue
    }

    if (!entry.name.endsWith(".md")) continue
    // matches both toml (+++) and yaml (---) frontmatter, tolerating trailing
    // whitespace on the delimiter lines
    const frontmatter = fs
      .readFileSync(fp, "utf8")
      .match(/^\s*(\+\+\+|---)[^\S\r\n]*\r?\n([\s\S]*?)\r?\n[^\S\r\n]*\1/)
    const weight = frontmatter?.[2].match(/^[^\S\r\n]*weight\s*[:=]\s*(-?\d+)/m)?.[1]
    if (weight === undefined) continue

    const relative = path.relative(contentDir, fp).split(path.sep).join("/")
    weights[slugifyFilePath(relative as FilePath)] = Number(weight)
  }
}

if (fs.existsSync(contentDir)) {
  collectWeights(contentDir)
}

// `sortFn` is serialized with toString() and re-evaluated in the browser, so the
// weight table has to be inlined in the function body rather than captured.
const sortByWeight = new Function(
  "a",
  "b",
  `const weights = ${JSON.stringify(weights)}
const weightOf = (node) => {
  const slug = node.data && node.data.slug
  return slug in weights ? weights[slug] : Infinity
}

// lower weight first, ties fall back to alphabetical order
const weightA = weightOf(a)
const weightB = weightOf(b)
if (weightA !== weightB) return weightA - weightB
return a.displayName.localeCompare(b.displayName, undefined, {
  numeric: true,
  sensitivity: "base",
})`,
) as (a: unknown, b: unknown) => number

// Equivalent of `ExternalPlugin.Explorer({ sortFn })`, but keyed directly so it
// works whether the explorer is configured as "@quartz-community/explorer" or
// as "github:quartz-community/explorer" (the loader looks up overrides under
// the name it derives from the `source` field).
for (const key of ["explorer", "@quartz-community/explorer", "Explorer"]) {
  componentRegistry.setOptionOverrides(key, { sortFn: sortByWeight })
}

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
