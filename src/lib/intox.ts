import 'server-only'
import data from '@content/intox/intox.json'

/**
 * Intox démontées par des cellules de fact-checking reconnues (scripts/intox.ts).
 * Chaque affirmation est FAUSSE ou trompeuse : elle n'est citée que pour être réfutée.
 */
export type Verdict = 'faux' | 'trompeur' | 'hors-contexte' | 'manipule' | 'ia'
export interface Debunk {
  publisher: string
  url: string
  title: string
  date: string
  quote: string
}
export interface Intox {
  id: string
  claim: string
  verdict: Verdict
  truth: string
  spreaders: string[]
  topic: string
  firstSeen: string
  debunks: Debunk[]
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  faux: 'Faux',
  trompeur: 'Trompeur',
  'hors-contexte': 'Sorti de son contexte',
  manipule: 'Trafiqué',
  ia: 'Généré par IA',
}

const items = (data.items as Intox[]).map((x) => ({ ...x, debunks: [...x.debunks].sort((a, b) => b.date.localeCompare(a.date)) }))

/** Toutes les intox, la plus récemment démontée d'abord */
export const getIntox = (): Intox[] => [...items].sort((a, b) => (b.debunks[0]?.date ?? b.firstSeen).localeCompare(a.debunks[0]?.date ?? a.firstSeen))
export const intoxUpdatedAt = data.updatedAt as string | null

/** Nombre de rédactions différentes qui ont démonté l'intox (sur un mois donné, AAAA-MM, ou en tout) */
export const outletCount = (x: Intox, month?: string) => new Set(x.debunks.filter((d) => !month || d.date.startsWith(month)).map((d) => d.publisher)).size

/**
 * Podium du mois : les intox démontées par le plus de rédactions différentes ce mois-ci (critère objectif :
 * on ne mesure pas les partages). Mois en cours, ou dernier mois qui a des intox.
 */
export function podium(now = new Date()): { month: string; top: Intox[] } {
  const all = getIntox()
  const months = [...new Set(all.flatMap((x) => x.debunks.map((d) => d.date.slice(0, 7))))].sort().reverse()
  const current = now.toISOString().slice(0, 7)
  const month = months.includes(current) ? current : (months[0] ?? current)
  const top = all
    .filter((x) => outletCount(x, month) > 0)
    .sort((a, b) => outletCount(b, month) - outletCount(a, month) || (b.debunks[0]?.date ?? '').localeCompare(a.debunks[0]?.date ?? ''))
    .slice(0, 3)
  return { month, top }
}

export const getIntoxById = (id: string): Intox | undefined => items.find((x) => x.id === id)
export const intoxPath = (x: Intox) => `/fake-news/${x.id}`
/** Date de la vérification la plus récente : c'est la date de mise à jour de la fiche */
export const intoxUpdated = (x: Intox) => x.debunks[0]?.date ?? x.firstSeen

/** Données structurées ClaimReview d'une intox (même objet sur la liste et sur sa fiche) */
export function claimReviewOf(x: Intox, url: string) {
  return {
    '@type': 'ClaimReview',
    url,
    claimReviewed: x.claim,
    datePublished: x.firstSeen,
    dateModified: intoxUpdated(x),
    inLanguage: 'fr-FR',
    reviewRating: { '@type': 'Rating', ratingValue: 1, bestRating: 5, worstRating: 1, alternateName: VERDICT_LABEL[x.verdict] },
    reviewBody: x.truth,
    author: { '@type': 'Organization', name: x.debunks[0]!.publisher, url: x.debunks[0]!.url },
    itemReviewed: { '@type': 'Claim', ...(x.spreaders.length ? { author: x.spreaders.map((s) => ({ '@type': 'Thing', name: s })) } : {}) },
    citation: x.debunks.map((d) => ({ '@type': 'CreativeWork', name: d.title, url: d.url, publisher: d.publisher })),
  }
}

/** Autres intox du même thème d'abord, puis les plus récentes */
export function relatedIntox(x: Intox, n = 3): Intox[] {
  const others = getIntox().filter((o) => o.id !== x.id)
  const same = x.topic === 'autre' ? [] : others.filter((o) => o.topic === x.topic)
  return [...same, ...others.filter((o) => !same.includes(o))].slice(0, n)
}
