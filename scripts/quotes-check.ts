/**
 * Vérifie toutes les citations d'un fichier de recherche, quelle que soit sa forme : chaque objet qui porte
 * `quote` et `url` doit avoir sa citation retrouvée mot pour mot dans la page (retéléchargée). Sert aux
 * fiches partis, aux parcours des candidats et aux articles de service.
 *
 * Usage : npx tsx scripts/quotes-check.ts fichier.json   (code de sortie 1 si une citation manque)
 */
import { readFileSync } from 'node:fs'
import { canonicalUrl, quoteIsInSource } from './veille-lib'
import { fetchText } from './web-lib'

const FILE = process.argv[2]
if (!FILE) {
  console.error('Fichier manquant.')
  process.exit(1)
}

type Found = { path: string; quote: string; url: string }
function collect(node: unknown, path: string, out: Found[]) {
  if (Array.isArray(node)) node.forEach((x, i) => collect(x, `${path}[${i}]`, out))
  else if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>
    if (typeof o.quote === 'string' && typeof o.url === 'string') out.push({ path, quote: o.quote, url: o.url })
    for (const [k, v] of Object.entries(o)) collect(v, path ? `${path}.${k}` : k, out)
  }
}

async function main() {
  const found: Found[] = []
  collect(JSON.parse(readFileSync(FILE!, 'utf8')), '', found)
  const pages = new Map<string, string | null>()
  let ko = 0
  for (const f of found) {
    const url = canonicalUrl(f.url)
    if (!url || /wikipedia\.org/i.test(url)) {
      ko++
      console.warn(`✗ ${f.path} : adresse refusée (${f.url})`)
      continue
    }
    if (!pages.has(url)) pages.set(url, await fetchText(url))
    const text = pages.get(url)
    if (!text || f.quote.trim().length < 20 || !quoteIsInSource(f.quote, text)) {
      ko++
      console.warn(`✗ ${f.path} : citation introuvable dans ${url}`)
    } else console.log(`✓ ${f.path}`)
  }
  console.log(`${found.length - ko} citation(s) vérifiée(s), ${ko} en échec.`)
  if (ko) process.exit(1)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
