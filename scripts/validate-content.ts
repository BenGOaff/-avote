/**
 * Contrôle des contenus avant publication (CI et veille).
 * Échoue si un fichier est invalide : la PR ne doit pas être fusionnée.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
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
    sources?: { id: string; url: string | null }[]
  }
  const sourceIds = new Set((c.sources ?? []).map((s) => s.id))
  if (c.questionSet !== q.version) errors.push(`corpus ${name} : version de questions ${c.questionSet} ≠ ${q.version}`)
  for (const [actor, pos] of Object.entries(c.positions)) {
    if (!c.actors.some((a) => a.slug === actor)) errors.push(`corpus ${name} : acteur inconnu ${actor}`)
    for (const [item, p] of Object.entries(pos)) {
      if (!ids.has(item)) errors.push(`corpus ${name} : question inconnue ${item}`)
      if (!p.missing && (!p.sources || p.sources.length === 0)) errors.push(`corpus ${name} : ${actor}/${item} sans source`)
      for (const s of p.sources ?? []) if (!sourceIds.has(s)) errors.push(`corpus ${name} : ${actor}/${item} source inconnue ${s}`)
    }
  }
}

// Candidatures : source obligatoire
const cand = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string; source?: { url?: string }; verified: boolean }[] }
for (const a of cand.actors) if (!a.source?.url?.startsWith('https://')) errors.push(`candidature ${a.slug} sans source https`)
const pending = cand.actors.filter((a) => !a.verified).length
if (pending) warnings.push(`${pending} candidature(s) en attente de vérification (non publiées)`)

// Nuances politiques : codes connus, candidats annoncés sans nuance signalés
const nuances = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/nuances.json'), 'utf8')) as {
  source: { url: string }
  nuances: Record<string, { bloc: string }>
  blocs: { id: string }[]
  actors: Record<string, { nuance: string; basis: string }>
}
if (!nuances.source.url.startsWith('https://')) errors.push('nuances.json : source sans https')
for (const [code, n] of Object.entries(nuances.nuances)) if (!nuances.blocs.some((b) => b.id === n.bloc)) errors.push(`nuances.json : bloc inconnu pour ${code}`)
for (const [slug, a] of Object.entries(nuances.actors)) {
  if (!nuances.nuances[a.nuance]) errors.push(`nuances.json : nuance inconnue ${a.nuance} (${slug})`)
  if (a.basis !== 'grille' && a.basis !== 'deduite') errors.push(`nuances.json : base invalide pour ${slug}`)
  if (!cand.actors.some((x) => x.slug === slug)) errors.push(`nuances.json : candidat inconnu ${slug}`)
}
const sansNuance = cand.actors.filter((a) => a.verified && !nuances.actors[a.slug] && (a as { party?: string }).party).length
if (sansNuance) warnings.push(`${sansNuance} candidat(s) avec un parti mais sans nuance`)

// Quiz Tiquiz : adresses https sur le sous-domaine des quiz, identifiants uniques
const tiquiz = JSON.parse(readFileSync(path.join(ROOT, 'content/quiz/tiquiz.json'), 'utf8')) as { quizzes: { slug: string; title: string; url: string }[] }
const quizSlugs = new Set<string>()
for (const q of tiquiz.quizzes) {
  if (!/^[a-z0-9-]+$/.test(q.slug) || quizSlugs.has(q.slug)) errors.push(`quiz : identifiant invalide ou en double (${q.slug})`)
  quizSlugs.add(q.slug)
  if (!q.url.startsWith('https://') || !q.title) errors.push(`quiz ${q.slug} : adresse https et titre obligatoires`)
}

// Qui possède ton info
const mediaList = JSON.parse(readFileSync(path.join(ROOT, 'content/medias/liste.json'), 'utf8')) as { medias: { slug: string }[] }
const owned = JSON.parse(readFileSync(path.join(ROOT, 'content/medias/proprietaires.json'), 'utf8')) as {
  medias: Record<string, { url: string; quote: string; controller: string }>
  alertes?: Record<string, { items: { url: string; quote: string; date: string }[] }>
}
for (const [slug, a] of Object.entries(owned.alertes ?? {})) {
  if (!mediaList.medias.some((x) => x.slug === slug)) errors.push(`alertes : ${slug} absent de la liste`)
  for (const it of a.items) {
    if (!/^https:\/\/([a-z0-9-]+\.)*(arcom\.fr|conseil-etat\.fr|legifrance\.gouv\.fr)\//.test(it.url)) errors.push(`alertes : ${slug} source hors domaines officiels`)
    if (!it.quote || it.quote.length < 12 || !/^\d{4}-\d{2}-\d{2}$/.test(it.date)) errors.push(`alertes : ${slug} sans extrait ou date`)
  }
}
for (const [slug, o] of Object.entries((owned as { orientations?: Record<string, { url: string; quote: string; label: string }> }).orientations ?? {})) {
  if (!mediaList.medias.some((x) => x.slug === slug)) errors.push(`orientations : ${slug} absent de la liste`)
  if (!/^https:\/\/([a-z0-9-]+\.)*eurotopics\.net\//.test(o.url) || !o.quote || !o.label) errors.push(`orientations : ${slug} sans source eurotopics ou sans extrait`)
}
for (const [ctl, e] of Object.entries((owned as { engagements?: Record<string, { items: { url: string; quote: string; text: string }[] }> }).engagements ?? {})) {
  if (!Object.values(owned.medias).some((m) => m.controller === ctl)) errors.push(`engagements : « ${ctl} » ne contrôle aucun média de la liste`)
  for (const it of e.items) if (!it.url?.startsWith('https://') || !it.quote || !it.text) errors.push(`engagements : « ${ctl} » sans source https ou sans extrait`)
}
for (const [slug, m] of Object.entries(owned.medias)) {
  if (!mediaList.medias.some((x) => x.slug === slug)) errors.push(`médias : ${slug} absent de la liste`)
  if (!m.url?.startsWith('https://')) errors.push(`médias : ${slug} sans source https`)
  if (!m.quote || m.quote.length < 12 || !m.controller) errors.push(`médias : ${slug} sans citation ou sans contrôle`)
}

// Parcours partisan des candidats
const parcours = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/parcours.json'), 'utf8')) as { parcours: Record<string, { party: string; url: string; quote: string }[]> }
const candSlugs = new Set((JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string }[] }).actors.map((a) => a.slug))
for (const [slug, periods] of Object.entries(parcours.parcours)) {
  if (!candSlugs.has(slug)) errors.push(`parcours : ${slug} absent des candidatures`)
  for (const p of periods) if (!p.party || !p.url?.startsWith('https://') || !p.quote || /wikipedia\.org/.test(p.url)) errors.push(`parcours : ${slug} période sans source valable`)
}

// Mentions légales
const legal = JSON.parse(readFileSync(path.join(ROOT, 'content/legal.json'), 'utf8')) as Record<string, unknown>
for (const k of ['siteName', 'contactEmail', 'controllerName']) if (!legal[k]) errors.push(`content/legal.json : ${k} manquant`)

// Anonymat : la liste des mots interdits (identité de la personne qui édite) vit dans un secret GitHub,
// jamais dans le dépôt. Sans le secret (poste local), le contrôle est sauté.
const blocklist = (process.env.ANONYMITY_BLOCKLIST ?? '')
  .split(',')
  .map((w) => w.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''))
  .filter((w) => w.length >= 4)
if (blocklist.length) {
  const tracked = execSync('git ls-files -z', { encoding: 'utf8' }).split('\0').filter((f) => f && !/\.(png|jpe?g|ico|webp|woff2?|ttf|otf|pdf|docx)$/i.test(f))
  for (const f of tracked) {
    let text: string
    try {
      text = readFileSync(path.join(ROOT, f), 'utf8').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    } catch {
      continue
    }
    // Le fichier fautif est signalé, jamais le mot trouvé (les journaux de CI sont publics)
    if (blocklist.some((w) => text.includes(w))) errors.push(`anonymat : ${f} contient un élément d’identité interdit`)
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`)
  process.exit(1)
}
console.log('✓ contenus valides')
