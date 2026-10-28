/**
 * Fonctions pures de la veille (testées dans veille-lib.test.ts).
 * Aucune dépendance réseau ici.
 */
import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'

export interface FeedDef {
  id: string
  name: string
  url: string
  kind: string
  encoding?: string
}

export interface RawItem {
  id: string
  feedId: string
  feedName: string
  title: string
  summary: string
  link: string
  date: string | null
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', hellip: '…', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç' }

/** Lettres accentuées nommées (&ocirc;, &Eacute;…) : la lettre suivie de l'accent combinant, recomposées. */
const ACCENTS: Record<string, string> = { acute: '́', grave: '̀', circ: '̂', uml: '̈', cedil: '̧', tilde: '̃' }
const LIGATURES: Record<string, string> = { oelig: 'œ', OElig: 'Œ', aelig: 'æ', AElig: 'Æ' }

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n: string) => {
      const [, letter, mark] = /^([a-z])(acute|grave|circ|uml|cedil|tilde)$/i.exec(n) ?? []
      if (letter && mark) return (letter + ACCENTS[mark.toLowerCase()]).normalize('NFC')
      return LIGATURES[n] ?? ENTITIES[n.toLowerCase()] ?? m
    })
}

export function stripHtml(s: string): string {
  const once = (x: string) =>
    x
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  // Deux passes : certains flux encodent le HTML du résumé (&lt;p&gt;…)
  return once(decodeEntities(once(s)))
    .replace(/\s+/g, ' ')
    .trim()
}

const text = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && '#text' in (v as Record<string, unknown>)) return String((v as Record<string, unknown>)['#text'])
  return ''
}

export const hashId = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 16)

/** Normalise une URL : https, sans paramètres de suivi ni ancre. */
export function canonicalUrl(u: string): string | null {
  try {
    const url = new URL(u.trim())
    if (!/^https?:$/.test(url.protocol)) return null
    url.hash = ''
    for (const k of [...url.searchParams.keys()]) if (/^(utm_|xtor|at_|fbclid|gclid|xtref)/i.test(k)) url.searchParams.delete(k)
    return url.toString()
  } catch {
    return null
  }
}

export function parseFeed(xml: string, feed: FeedDef): RawItem[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', processEntities: false, htmlEntities: false })
  const doc = parser.parse(xml) as Record<string, any>
  const rssItems = doc?.rss?.channel?.item ?? doc?.['rdf:RDF']?.item
  const atomItems = doc?.feed?.entry
  const list: any[] = Array.isArray(rssItems) ? rssItems : rssItems ? [rssItems] : Array.isArray(atomItems) ? atomItems : atomItems ? [atomItems] : []
  const out: RawItem[] = []
  for (const it of list.slice(0, 60)) {
    let link = text(it.link)
    if (!link && it.link) {
      const links = Array.isArray(it.link) ? it.link : [it.link]
      link = links.find((l: any) => !l['@rel'] || l['@rel'] === 'alternate')?.['@href'] ?? ''
    }
    const canon = canonicalUrl(link || text(it.guid))
    if (!canon) continue
    const title = stripHtml(text(it.title)).slice(0, 300)
    if (!title) continue
    const summary = stripHtml(text(it.description) || text(it.summary) || text(it['content:encoded']) || text(it.content)).slice(0, 1200)
    const rawDate = text(it.pubDate) || text(it['dc:date']) || text(it.published) || text(it.updated)
    const d = rawDate ? new Date(rawDate) : null
    out.push({
      id: hashId(canon),
      feedId: feed.id,
      feedName: feed.name,
      title,
      summary,
      link: canon,
      date: d && !Number.isNaN(d.getTime()) ? d.toISOString() : null,
    })
  }
  return out
}

/** Rapproche les mêmes informations reprises par plusieurs flux (titres proches). */
export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[“”«»"’']/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Une citation doit figurer mot pour mot (à la normalisation près) dans le texte source. */
/**
 * Sources refusées pour une position : encyclopédies collaboratives et autres tests ou comparateurs électoraux.
 * Leur page peut reproduire une phrase du candidat, mais la preuve doit venir du candidat, de son parti ou d'un média.
 */
const REFUSED_HOSTS = /(^|\.)(wikipedia\.org|monvote2027\.fr|votons-2027\.fr|quizz-du-berger\.com|candidator\.fr|elyseescope\.fr|swipeyourpresident\.com|voxe\.org)$/i
export function isRefusedSource(u: string): boolean {
  try {
    return REFUSED_HOSTS.test(new URL(u).hostname)
  } catch {
    return true
  }
}

export function quoteIsInSource(quote: string, source: string): boolean {
  const q = normalizeForMatch(quote)
  return q.length >= 12 && normalizeForMatch(source).includes(q)
}

/** Tout nombre écrit dans le texte généré doit apparaître dans les sources (pas de chiffre inventé). */
export function numbersAreSourced(generated: string, source: string): string[] {
  const nums = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.').replace(/^0+(?=\d)/, ''))
  const allowed = new Set([...nums(source), '2027'])
  return nums(generated).filter((n) => !allowed.has(n))
}

/** Tics de rédaction interdits par le profil vocal. */
const FORBIDDEN = [
  /\bce n['’]est pas\b[^.]{0,60}\bc['’]est\b/i,
  /\bdécrypt/i,
  /\ben toute transparence\b/i,
  /\bla politique autrement\b/i,
  /\breprendre le pouvoir\b/i,
  /\bincontournable\b/i,
  /\bforce est de constater\b/i,
  /\bdans un contexte où\b/i,
  /\btous pourris\b/i,
  /\bles français pensent\b/i,
  /\bvotez\b/i,
  /[\u{1F300}-\u{1FAFF}]/u,
]
export function styleViolations(s: string): string[] {
  return FORBIDDEN.filter((r) => r.test(s)).map((r) => r.source)
}

export function slugify(s: string, max = 60): string {
  return (
    normalizeForMatch(s)
      .split(' ')
      .filter(Boolean)
      .join('-')
      .slice(0, max)
      .replace(/-+$/, '') || 'breve'
  )
}

/**
 * Candidat déjà suivi sous un autre libellé ? Un nom de famille seul (« Zemmour ») désigne le candidat suivi qui
 * porte ce nom ; prénom et nom doivent sinon concorder (« Marion Maréchal » n'est pas « Marine Le Pen »).
 */
export function sameCandidate<T extends { slug: string }>(actors: T[], name: string): T | undefined {
  const words = slugify(name, 80).split('-')
  const last = words.at(-1)
  return actors.find((a) => {
    const known = a.slug.split('-')
    if (a.slug === words.join('-')) return true
    if (known.at(-1) !== last) return false
    return words.length === 1 || known[0] === words[0]
  })
}

/** Prénom et nom : un nom de famille seul ne suffit pas à ajouter quelqu'un aux candidatures. */
export const isFullName = (name: string) => slugify(name, 80).split('-').length >= 2

/** Échappe une chaîne pour YAML (toujours entre guillemets doubles). */
export const yamlStr = (s: string) => JSON.stringify(s)
