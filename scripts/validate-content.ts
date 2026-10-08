/**
 * Contrôle des contenus avant publication (CI et veille).
 * Échoue si un fichier est invalide : la PR ne doit pas être fusionnée.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { ArticleSchema, BriefSchema } from '../src/lib/content-schema'

const ROOT = process.cwd()
const errors: string[] = []
const warnings: string[] = []

function front(file: string): unknown {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) throw new Error('frontmatter absent')
  if (/<\s*(script|iframe|object|embed|style)\b/i.test(m[2] ?? '')) throw new Error('HTML interdit dans le corps')
  return parse(m[1] ?? '')
}

for (const [dir, schema] of [
  ['radar', ArticleSchema],
  ['fil', BriefSchema],
] as const) {
  const full = path.join(ROOT, 'content', dir)
  if (!existsSync(full)) continue
  for (const f of readdirSync(full).filter((x) => x.endsWith('.md'))) {
    try {
      const r = schema.safeParse(front(path.join(full, f)))
      if (!r.success) errors.push(`content/${dir}/${f} : ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join(' ; ')}`)
    } catch (e) {
      errors.push(`content/${dir}/${f} : ${(e as Error).message}`)
    }
  }
}

// Questionnaire : identifiants uniques, 7 thèmes, items rattachés à un thème existant
const q = JSON.parse(readFileSync(path.join(ROOT, 'content/questionnaire/v0.1.0.json'), 'utf8')) as {
  version: string
  themes: { id: string }[]
  dimensions: { id: string }[]
  items: { id: string; theme: string; dimensions?: Record<string, number> }[]
}
const ids = new Set<string>()
for (const it of q.items) {
  if (ids.has(it.id)) errors.push(`question en double : ${it.id}`)
  ids.add(it.id)
  if (!q.themes.some((t) => t.id === it.theme)) errors.push(`${it.id} : thème inconnu ${it.theme}`)
  for (const d of Object.keys(it.dimensions ?? {})) if (!q.dimensions.some((x) => x.id === d)) errors.push(`${it.id} : dimension inconnue ${d}`)
}

// Corpus : compatibilité de version, positions sur des questions existantes, sources présentes
for (const name of ['demo', 'live']) {
  const c = JSON.parse(readFileSync(path.join(ROOT, `content/corpus/${name}.json`), 'utf8')) as {
    questionSet: string
    actors: { slug: string }[]
    positions: Record<string, Record<string, { sources?: string[]; missing?: boolean }>>
  }
  if (c.questionSet !== q.version) errors.push(`corpus ${name} : version de questions ${c.questionSet} ≠ ${q.version}`)
  for (const [actor, pos] of Object.entries(c.positions)) {
    if (!c.actors.some((a) => a.slug === actor)) errors.push(`corpus ${name} : acteur inconnu ${actor}`)
    for (const [item, p] of Object.entries(pos)) {
      if (!ids.has(item)) errors.push(`corpus ${name} : question inconnue ${item}`)
      if (!p.missing && (!p.sources || p.sources.length === 0)) errors.push(`corpus ${name} : ${actor}/${item} sans source`)
    }
  }
}

// Candidatures : source obligatoire
const cand = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string; source?: { url?: string }; verified: boolean }[] }
for (const a of cand.actors) if (!a.source?.url?.startsWith('https://')) errors.push(`candidature ${a.slug} sans source https`)
const pending = cand.actors.filter((a) => !a.verified).length
if (pending) warnings.push(`${pending} candidature(s) en attente de vérification (non publiées)`)

// Mentions légales
const legal = JSON.parse(readFileSync(path.join(ROOT, 'content/legal.json'), 'utf8')) as Record<string, unknown>
const missingLegal = ['publisherName', 'publisherAddress', 'publicationDirector'].filter((k) => !legal[k])
if (missingLegal.length) warnings.push(`mentions légales à compléter : ${missingLegal.join(', ')}`)

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`)
  process.exit(1)
}
console.log('✓ contenus valides')
