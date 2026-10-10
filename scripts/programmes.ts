/**
 * Guetteur de programmes : relit chaque jour les sites officiels des candidats (liens « campagne » et « programme »
 * de content/acteurs/candidatures.json) et repère un programme publié ou enrichi : un nouveau PDF lié, ou un bloc
 * de phrases nouvelles. Aucun appel à une IA ici : on compare des empreintes de phrases.
 *
 * Sortie : content/acteurs/programmes-veille.json (état, versionné) et .programmes-changes (une ligne « slug url »
 * par candidat dont le site a changé), que le workflow transforme en recherche de positions ciblée.
 *
 * Usage : npx tsx scripts/programmes.ts [--dry]
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { canonicalUrl, normalizeForMatch } from './veille-lib'
import { fetchText } from './web-lib'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const STATE = path.join(ROOT, 'content/acteurs/programmes-veille.json')
const OUT = path.join(ROOT, '.programmes-changes')
// Seuils : un nouveau PDF suffit ; sur une page « programme », au moins 12 phrases longues nouvelles et 10 % de la page.
// Une page d'accueil de campagne change tous les jours avec l'actualité : seul un nouveau PDF y compte.
const MIN_NEW_SENTENCES = 12
const MIN_NEW_SHARE = 0.1
// Une recherche de positions coûte : au plus 3 candidats relancés par passage
const MAX_TRIGGERS = 3
// Un candidat relancé ne l'est pas de nouveau avant 14 jours
const COOLDOWN = 14 * 86_400_000

type Site = { slug: string; sentences: string[]; pdfs: string[]; checkedAt: string; changedAt?: string }
type State = { checkedAt: string | null; sites: Record<string, Site> }

const candidatures = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as {
  actors: { slug: string; status: string; verified?: boolean; links?: { kind: string; url: string }[] }[]
}
const state: State = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { checkedAt: null, sites: {} }

const hash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 10)

/** Empreintes des phrases longues de la page (les menus, dates et compteurs, courts, sont ignorés). */
function sentencesOf(text: string): string[] {
  return [
    ...new Set(
      text
        .split(/(?<=[.!?…])\s+|\n+/)
        .map((s) => normalizeForMatch(s))
        .filter((s) => s.length >= 80)
        .map(hash),
    ),
  ]
}

/** Liens PDF de la page (programme, livret, profession de foi). */
async function pdfLinks(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CaVoteRecherche/1.0)' }, signal: AbortSignal.timeout(25_000) })
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return []
    const html = await res.text()
    const out = new Set<string>()
    for (const m of html.matchAll(/href="([^"]+\.pdf)(?:[?#][^"]*)?"/gi)) {
      const abs = canonicalUrl(new URL(m[1]!, url).toString())
      if (abs) out.add(abs)
    }
    return [...out].sort()
  } catch {
    return []
  }
}

async function main() {
  const now = new Date().toISOString()
  const changes: { slug: string; url: string; why: string }[] = []
  const watched = candidatures.actors
    .filter((a) => a.verified !== false && (a.status === 'declare' || a.status === 'demarche'))
    .flatMap((a) => (a.links ?? []).filter((l) => l.kind === 'campagne' || l.kind === 'programme').map((l) => ({ slug: a.slug, url: l.url, kind: l.kind })))
  const lastChange = (slug: string) => Math.max(0, ...Object.values(state.sites).filter((x) => x.slug === slug && x.changedAt).map((x) => Date.parse(x.changedAt!)))
  for (const { slug, url, kind } of watched) {
    const text = await fetchText(url)
    if (!text) {
      console.warn(`illisible : ${slug} ${url}`)
      continue
    }
    const sentences = sentencesOf(text)
    const pdfs = await pdfLinks(url)
    const prev = state.sites[url]
    const site: Site = { slug, sentences, pdfs, checkedAt: now, ...(prev?.changedAt ? { changedAt: prev.changedAt } : {}) }
    if (prev && Date.now() - lastChange(slug) > COOLDOWN) {
      const known = new Set(prev.sentences)
      const fresh = sentences.filter((s) => !known.has(s)).length
      const newPdfs = pdfs.filter((p) => !prev.pdfs.includes(p))
      if (newPdfs.length > 0) {
        changes.push({ slug, url: newPdfs[0]!, why: `nouveau PDF (${newPdfs.length})` })
        site.changedAt = now
      } else if (kind === 'programme' && fresh >= MIN_NEW_SENTENCES && fresh >= MIN_NEW_SHARE * sentences.length) {
        changes.push({ slug, url, why: `${fresh} phrases nouvelles` })
        site.changedAt = now
      }
    }
    state.sites[url] = site
    console.log(`${slug.padEnd(24)} ${String(sentences.length).padStart(5)} phrases, ${pdfs.length} PDF${prev ? '' : ' (première lecture)'}`)
  }
  // Un même candidat n'est relancé qu'une fois par passage, et pas plus de MAX_TRIGGERS candidats
  const bySlug = new Map<string, { slug: string; url: string; why: string }>()
  for (const c of changes) if (!bySlug.has(c.slug)) bySlug.set(c.slug, c)
  const triggers = [...bySlug.values()].slice(0, MAX_TRIGGERS)
  for (const t of triggers) console.log(`→ ${t.slug} : ${t.why} (${t.url})`)
  if (DRY) return console.log('Mode test : rien n’est écrit.')
  state.checkedAt = now
  writeFileSync(STATE, JSON.stringify(state) + '\n')
  writeFileSync(OUT, triggers.map((t) => `${t.slug} ${t.url}`).join('\n'))
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
