/**
 * Contrôle des contenus avant publication (CI et veille).
 * Échoue si un fichier est invalide : la PR ne doit pas être fusionnée.
 */
import { AGENDA_KINDS, quoteStatesDate } from './agenda-lib'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { parse } from 'yaml'
import { ArticleSchema, BriefSchema } from '../src/lib/content-schema'
import { SocialPostSchema } from '../src/lib/social-schema'
import { FlashQuizSchema } from '../src/lib/flash'
import type { Poll } from '../src/lib/sondages-stats'

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

// Questionnaire : identifiants uniques, items rattachés à un thème existant
const q = JSON.parse(readFileSync(path.join(ROOT, 'content/questionnaire/v0.3.0.json'), 'utf8')) as {
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

// Faits sous les affirmations : sources officielles en https, passage copié, affirmation existante
const faits = JSON.parse(readFileSync(path.join(ROOT, 'content/questionnaire/faits.json'), 'utf8')) as {
  items: Record<string, { text: string; quote: string; url: string; publisher: string; date: string }[]>
}
for (const [id, list] of Object.entries(faits.items)) {
  if (!ids.has(id)) errors.push(`faits : affirmation inconnue ${id}`)
  for (const f of list) {
    if (!f.url?.startsWith('https://') || /wikipedia\.org/i.test(f.url)) errors.push(`faits ${id} : source absente ou refusée`)
    if (!f.text || !f.publisher || (f.quote ?? '').trim().length < 30) errors.push(`faits ${id} : texte, éditeur ou passage manquant`)
  }
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
const cand = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as {
  actors: { slug: string; source?: { url?: string }; verified: boolean; links?: { kind: string; url: string }[] }[]
}
for (const a of cand.actors) {
  if (!a.source?.url?.startsWith('https://')) errors.push(`candidature ${a.slug} sans source https`)
  for (const l of a.links ?? [])
    if (!['campagne', 'parti', 'programme'].includes(l.kind) || !l.url.startsWith('https://')) errors.push(`candidature ${a.slug} : lien officiel invalide (${l.url})`)
}
// Agenda : chaque rendez-vous a sa source https, une citation qui donne la date, des candidats connus
{
  const ag = JSON.parse(readFileSync(path.join(ROOT, 'content/agenda/agenda.json'), 'utf8')) as {
    events: { id: string; kind: string; date: string; end?: string; quote?: string; who?: string[]; source?: { url?: string } }[]
  }
  const seenIds = new Set<string>()
  for (const e of ag.events) {
    if (seenIds.has(e.id)) errors.push(`agenda : identifiant en double ${e.id}`)
    seenIds.add(e.id)
    if (!AGENDA_KINDS.includes(e.kind as never)) errors.push(`agenda ${e.id} : type inconnu ${e.kind}`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || (e.end && e.end < e.date)) errors.push(`agenda ${e.id} : date invalide`)
    if (!e.source?.url?.startsWith('https://')) errors.push(`agenda ${e.id} : source sans https`)
    if (!e.quote || !quoteStatesDate(e.quote, e.end ?? e.date)) errors.push(`agenda ${e.id} : la citation ne donne pas la date`)
    for (const w of e.who ?? []) if (!cand.actors.some((a) => a.slug === w)) errors.push(`agenda ${e.id} : candidat inconnu ${w}`)
  }
}
// Publications pour les réseaux : schéma et page cible existante
{
  const dir = path.join(ROOT, 'content/social')
  if (existsSync(dir))
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
      const r = SocialPostSchema.safeParse(JSON.parse(readFileSync(path.join(dir, f), 'utf8')))
      if (!r.success) errors.push(`content/social/${f} : ${r.error.issues[0]?.message}`)
      else if (r.data.id !== f.replace(/\.json$/, '')) errors.push(`content/social/${f} : identifiant différent du nom de fichier`)
    }
}
const medList = JSON.parse(readFileSync(path.join(ROOT, 'content/medias/liste.json'), 'utf8')) as { medias: { slug: string; site?: string }[] }
for (const m of medList.medias) if (m.site && !m.site.startsWith('https://')) errors.push(`média ${m.slug} : site sans https`)
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

// Quiz flash : schéma, identifiant = nom du fichier, paliers croissants jusqu'à 100
const flashDir = path.join(ROOT, 'content/quiz/flash')
if (existsSync(flashDir))
  for (const f of readdirSync(flashDir).filter((f) => f.endsWith('.json'))) {
    const r = FlashQuizSchema.safeParse(JSON.parse(readFileSync(path.join(flashDir, f), 'utf8')))
    if (!r.success) {
      errors.push(`quiz flash ${f} : ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join(' ; ')}`)
      continue
    }
    if (`${r.data.slug}.json` !== f) errors.push(`quiz flash ${f} : le slug doit reprendre le nom du fichier`)
    // Lien « pour aller plus loin » : la page et l'ancre doivent exister
    for (const o of r.data.outcomes ?? []) {
      const href = o.link?.href
      if (!href) continue
      const [page, anchor] = href.split('#')
      if (page === '/livres' && anchor && !existsSync(path.join(ROOT, 'public/img/livres', `${anchor}.webp`))) errors.push(`quiz flash ${f} : livre introuvable pour ${o.key} (${href})`)
      if (o.avatar && !existsSync(path.join(ROOT, 'public', o.avatar))) errors.push(`quiz flash ${f} : image absente pour ${o.key}`)
    }
    // Cadre des titres d'accroche (content/voix/titres.md) : court, à la deuxième personne, une question ou une révélation, aucun mode d'emploi
    const title = r.data.title.replace(/\u00a0/g, ' ')
    if (title.length > 60) errors.push(`quiz flash ${f} : titre de ${title.length} caractères (60 au plus)`)
    if (!/\b(tu|toi|ton|ta|tes|te|t’)\b|Suis-je/i.test(title)) errors.push(`quiz flash ${f} : le titre doit parler à la personne (tu, ton, ta…)`)
    if (!/[?!]$/.test(title) && !/\b(dit|disent|dirai)\b/.test(title)) errors.push(`quiz flash ${f} : le titre doit finir par « ? » ou « ! », ou annoncer ce qu’il révèle`)
    if (/\b(quiz|test|teste|découvre|connaissances|compétences)\b|\d+\s*(questions|min)/i.test(title)) errors.push(`quiz flash ${f} : pas de mode d’emploi dans le titre (quiz, test, découvre, nombre de questions…)`)
    if (/\d+\s*(questions|secondes|minutes|min)\b/i.test(r.data.lede)) errors.push(`quiz flash ${f} : pas de nombre de questions ni de durée dans le chapô`)
    // Mode « partis » : questions du test existantes, candidats présents dans le corpus
    const liveCorpus = JSON.parse(readFileSync(path.join(ROOT, 'content/corpus/live.json'), 'utf8')) as { positions: Record<string, unknown> }
    const qs = JSON.parse(readFileSync(path.join(ROOT, 'content/questionnaire/v0.3.0.json'), 'utf8')) as { items: { id: string }[] }
    for (const id of r.data.items ?? []) if (!qs.items.some((i) => i.id === id)) errors.push(`quiz flash ${f} : question inconnue ${id}`)
    for (const p of r.data.parties ?? []) for (const a of p.actors) if (!liveCorpus.positions[a]) errors.push(`quiz flash ${f} : candidat sans positions ${a} (${p.key})`)
    // Les candidats retirés sortent seuls du quiz : il doit rester au moins deux partis en lice
    const running = new Set((JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string; status: string }[] }).actors.filter((a) => a.status !== 'retire').map((a) => a.slug))
    if (r.data.mode === 'partis' && (r.data.parties ?? []).filter((p) => p.actors.some((a) => running.has(a))).length < 2) errors.push(`quiz flash ${f} : moins de deux partis avec un candidat en lice`)
    const ups = (r.data.tiers ?? []).map((t) => t.upTo)
    if (ups.length && (ups.some((u, i) => i > 0 && u <= ups[i - 1]!) || ups[ups.length - 1] !== 100)) errors.push(`quiz flash ${f} : paliers croissants, le dernier à 100`)
  }

// Fake news : chaque intox renvoie à une vérification d'un fact-checkeur, avec le passage qui la démontre
const intox = JSON.parse(readFileSync(path.join(ROOT, 'content/intox/intox.json'), 'utf8')) as {
  items: { id: string; claim: string; verdict: string; truth: string; debunks: { url: string; quote: string; publisher: string; date: string }[] }[]
}
const intoxIds = new Set<string>()
for (const x of intox.items) {
  if (intoxIds.has(x.id)) errors.push(`intox : identifiant en double ${x.id}`)
  intoxIds.add(x.id)
  if (!['faux', 'trompeur', 'hors-contexte', 'manipule', 'ia'].includes(x.verdict)) errors.push(`intox ${x.id} : verdict inconnu`)
  if (!x.claim || !x.truth || x.debunks.length === 0) errors.push(`intox ${x.id} : affirmation, réalité ou vérification manquante`)
  for (const d of x.debunks) if (!d.url?.startsWith('https://') || !d.quote || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.push(`intox ${x.id} : vérification sans lien https, extrait ou date`)
}

// Livres des candidats : candidat connu, identifiant Amazon valide, identifiant de suivi neutre (anonymat)
const livres = JSON.parse(readFileSync(path.join(ROOT, 'content/livres/livres.json'), 'utf8')) as { amazonTag: string; items: { actor: string; title: string | null; asin: string }[] }
const livreActors = new Set((JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string }[] }).actors.map((a) => a.slug))
if (livres.amazonTag && !/^[a-z0-9-]{3,40}-21$/.test(livres.amazonTag)) errors.push('livres : identifiant de suivi Amazon invalide')
const rayonIds = new Set(((livres as unknown as { rayons: { id: string }[] }).rayons ?? []).map((r) => r.id))
for (const e of (livres as unknown as { essais: { rayon: string; title: string; author: string; asin: string }[] }).essais ?? []) {
  if (!rayonIds.has(e.rayon)) errors.push(`livres : rayon inconnu pour « ${e.title} »`)
  if (!/^[A-Z0-9]{10}$/.test(e.asin) || !e.title || !e.author) errors.push(`livres : essai incomplet « ${e.title} »`)
  if ((e as { cover?: string }).cover && !existsSync(path.join(ROOT, 'public', (e as { cover?: string }).cover!))) errors.push(`livres : couverture absente pour « ${e.title} »`)
}
for (const b of livres.items) {
  if (!livreActors.has(b.actor)) errors.push(`livres : candidat inconnu ${b.actor}`)
  if (!/^[A-Z0-9]{10}$/.test(b.asin)) errors.push(`livres : ASIN invalide pour ${b.actor}`)
  if (b.title !== null && (b.title.length < 2 || b.title.length > 120)) errors.push(`livres : titre invalide pour ${b.actor}`)
  if ((b as { cover?: string }).cover && !existsSync(path.join(ROOT, 'public', (b as { cover?: string }).cover!))) errors.push(`livres : couverture absente pour ${b.actor}`)
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
const yt = JSON.parse(readFileSync(path.join(ROOT, 'content/youtube/chaines.json'), 'utf8')) as { channels: { id: string; name: string; group: string; media?: string; actor?: string; owner?: { url: string; quote: string } }[] }
const ytIds = new Set<string>()
for (const c of yt.channels) {
  if (!/^UC[\w-]{22}$/.test(c.id) || ytIds.has(c.id)) errors.push(`youtube : identifiant invalide ou en double (${c.name})`)
  ytIds.add(c.id)
  if (!['media', 'createur', 'verification', 'candidat'].includes(c.group)) errors.push(`youtube : groupe inconnu (${c.name})`)
  if (c.media && !mediaList.medias.some((m) => m.slug === c.media)) errors.push(`youtube : média ${c.media} absent de la liste`)
  if (c.actor && !livreActors.has(c.actor)) errors.push(`youtube : candidat ${c.actor} absent des candidatures`)
  if (c.owner && (!c.owner.url.startsWith('https://') || !c.owner.quote)) errors.push(`youtube : propriétaire de ${c.name} sans source https ou sans extrait`)
}
const ytFiches = JSON.parse(readFileSync(path.join(ROOT, 'content/youtube/fiches.json'), 'utf8')) as { fiches: Record<string, { owner: { url: string; quote: string } | null; polemiques: { url: string; quote: string; title: string; text: string }[] }> }
for (const [id, f] of Object.entries(ytFiches.fiches)) {
  if (!ytIds.has(id)) errors.push(`youtube : fiche ${id} sans chaîne dans la liste`)
  for (const e of [...(f.owner ? [f.owner] : []), ...f.polemiques])
    if (!e.url?.startsWith('https://') || !e.quote || e.quote.length < 12) errors.push(`youtube : fiche ${id} sans source https ou sans extrait`)
  for (const p of f.polemiques) if (!p.title || !p.text) errors.push(`youtube : polémique sans titre ou sans texte (${id})`)
}
// Sondages : chiffres plausibles, dates, sources https, candidats connus
const sondages = JSON.parse(readFileSync(path.join(ROOT, 'content/sondages/sondages.json'), 'utf8')) as {
  institutes: Record<string, { text: string; url: string; publisher: string }>
  polls: Poll[]
}
const pollIds = new Set<string>()
const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)
for (const p of sondages.polls) {
  const at = `sondage ${p.id}`
  if (pollIds.has(p.id)) errors.push(`${at} : identifiant en double`)
  pollIds.add(p.id)
  if (!p.institute || !p.buyer || !p.base || !p.method) errors.push(`${at} : institut, acheteur, base ou méthode manquant`)
  if (![p.fieldStart, p.fieldEnd, p.published].every(isDay) || p.fieldStart > p.fieldEnd || p.fieldEnd > p.published) errors.push(`${at} : dates invalides`)
  if (!(p.sample >= 300)) errors.push(`${at} : échantillon invalide`)
  if (!p.url.startsWith('https://') || (p.notice && !p.notice.startsWith('https://'))) errors.push(`${at} : source non https`)
  if (p.firstRound.length === 0 && p.secondRound.length === 0) errors.push(`${at} : aucun résultat`)
  const lists = [...p.firstRound.map((h) => h.results), ...p.secondRound.map((d) => d.results)]
  for (const r of lists.flat()) {
    if (!(r.pct >= 0 && r.pct <= 100)) errors.push(`${at} : pourcentage invalide (${r.name})`)
    if (r.slug !== null && !livreActors.has(r.slug)) errors.push(`${at} : candidat ${r.slug} absent des candidatures`)
  }
  for (const h of p.firstRound) if (h.results.reduce((s, r) => s + r.pct, 0) > 103) errors.push(`${at} : premier tour au-delà de 100 % (${h.hypothesis})`)
  for (const d of p.secondRound) if (d.results.length !== 2 || Math.abs(d.results[0]!.pct + d.results[1]!.pct - 100) > 1.5) errors.push(`${at} : duel de second tour invalide`)
}
for (const [name, n] of Object.entries(sondages.institutes)) if (!n.text || !n.url.startsWith('https://')) errors.push(`sondages : méthode de ${name} sans texte ou sans source https`)
const orientationNuances = JSON.parse(readFileSync(path.join(ROOT, 'content/medias/orientation-nuances.json'), 'utf8')) as { nuances: Record<string, { text: string; sources: { url: string }[] }> }
for (const [slug, n] of Object.entries(orientationNuances.nuances)) {
  if (!(owned as { orientations?: Record<string, unknown> }).orientations?.[slug]) errors.push(`nuance d'orientation : ${slug} sans orientation eurotopics`)
  if (!n.text || n.sources.length === 0 || n.sources.some((x) => !x.url.startsWith('https://'))) errors.push(`nuance d'orientation : ${slug} sans texte ou sans source https`)
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

// Fiches partis : chaque champ rempli porte une source https (jamais Wikipédia) et un extrait
type Src = { quote?: string; url?: string } | null
const partis = JSON.parse(readFileSync(path.join(ROOT, 'content/partis/partis.json'), 'utf8')) as {
  partis: { slug: string; name: string; nuance: string; founded: Src; leadersSource: Src; values: Src; dates: Src[]; measures: Src[]; elus: Src }[]
}
const nuanceCodes = new Set(Object.keys((JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/nuances.json'), 'utf8')) as { nuances: Record<string, unknown> }).nuances))
const badSrc = (x: Src) => !!x && (!x.url?.startsWith('https://') || !x.quote || /wikipedia\.org/.test(x.url))
const partiSlugs = new Set<string>()
for (const p of partis.partis) {
  if (partiSlugs.has(p.slug)) errors.push(`partis : ${p.slug} en double`)
  partiSlugs.add(p.slug)
  if (!p.name || (p.nuance !== '' && !nuanceCodes.has(p.nuance))) errors.push(`partis : ${p.slug} sans nom ou nuance inconnue (${p.nuance})`)
  const all = [p.founded, p.leadersSource, p.values, ...p.dates, ...p.measures, p.elus?.url ? p.elus : null]
  if (all.some(badSrc)) errors.push(`partis : ${p.slug} contient un champ sans source valable`)
}

// Patrimoine déclaré : source https, extrait, candidat connu
const patrimoine = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/patrimoine.json'), 'utf8')) as { entries: Record<string, { amount: number; quote: string; url: string; label: string }> }
for (const [slug, e] of Object.entries(patrimoine.entries)) {
  if (!candSlugs.has(slug)) errors.push(`patrimoine : ${slug} absent des candidatures`)
  if (!e.url?.startsWith('https://') || !e.quote || /wikipedia\.org/.test(e.url) || !(e.amount > 0) || !e.label) errors.push(`patrimoine : ${slug} sans source valable ou sans montant`)
}

// Casier : types connus, source https, extrait, présomption pour les procédures en cours
const casier = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/casier.json'), 'utf8')) as { entries: Record<string, { type: string; presumption: boolean; quote: string; url: string; date: string; decision: string }[]> }
for (const [slug, list] of Object.entries(casier.entries)) {
  if (!candSlugs.has(slug)) errors.push(`casier : ${slug} absent des candidatures`)
  for (const e of list) {
    if (!['condamnation', 'en-cours', 'relaxe', 'sanction'].includes(e.type)) errors.push(`casier : ${slug} type inconnu ${e.type}`)
    if (!e.url?.startsWith('https://') || !e.quote || /wikipedia\.org/.test(e.url) || !e.decision || !/^\d{4}(-\d{2}){0,2}$/.test(e.date)) errors.push(`casier : ${slug} entrée sans source, décision ou date valable`)
    if (e.type === 'en-cours' && !e.presumption) errors.push(`casier : ${slug} procédure en cours sans présomption d'innocence`)
  }
}

// Votes à l'Assemblée : candidats connus, un vote par scrutin
const votesAn = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/votes-an.json'), 'utf8')) as { scrutins: { numero: number }[]; votes: Record<string, Record<string, string>> }
for (const [slug, v] of Object.entries(votesAn.votes)) {
  if (!candSlugs.has(slug)) errors.push(`votes AN : ${slug} absent des candidatures`)
  if (votesAn.scrutins.some((s) => !v[String(s.numero)])) errors.push(`votes AN : ${slug} sans vote sur certains scrutins`)
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
