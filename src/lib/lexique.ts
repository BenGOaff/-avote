/**
 * Lexique : les termes techniques du test, expliqués en une phrase dans une infobulle et en détail sur /lexique.
 * Sans dépendance serveur : le test (composant client) repère les termes dans le texte des questions.
 */
import data from '@content/lexique/lexique.json'

export interface LexiqueTerm {
  id: string
  term: string
  patterns: string[]
  ci?: boolean
  short: string
  long: string
  source?: { title: string; publisher: string; url: string }
  /** Page du site qui approfondit le sujet */
  href?: string
}

export const TERMS = (data as { terms: LexiqueTerm[] }).terms
export const termById = (id: string) => TERMS.find((t) => t.id === id)

// Un terme n'est repéré que comme mot entier : « RIC » ne doit pas surligner « électricité »
const compiled = TERMS.map((t) => ({ id: t.id, re: new RegExp(`(?<![\\p{L}\\p{N}])(?:${t.patterns.join('|')})(?![\\p{L}\\p{N}])`, t.ci ? 'iu' : 'u') }))

export type Segment = string | { text: string; id: string }

/**
 * Découpe un texte en segments, chaque terme du lexique n'étant marqué qu'à sa première apparition.
 * `skip` : termes déjà expliqués plus haut (la question avant son explication), pour ne pas répéter l'infobulle.
 */
export function annotate(text: string, skip: ReadonlySet<string> = new Set()): { segments: Segment[]; used: string[] } {
  const hits = compiled
    .filter((c) => !skip.has(c.id))
    .flatMap((c) => {
      const m = c.re.exec(text)
      return m ? [{ id: c.id, start: m.index, end: m.index + m[0].length }] : []
    })
    .sort((a, b) => a.start - b.start || b.end - a.end)
  const kept: typeof hits = []
  for (const h of hits) if (!kept.some((k) => h.start < k.end && h.end > k.start)) kept.push(h)
  const segments: Segment[] = []
  let at = 0
  for (const h of kept) {
    if (h.start > at) segments.push(text.slice(at, h.start))
    segments.push({ text: text.slice(h.start, h.end), id: h.id })
    at = h.end
  }
  if (at < text.length) segments.push(text.slice(at))
  return { segments, used: kept.map((k) => k.id) }
}
