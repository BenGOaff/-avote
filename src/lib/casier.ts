/**
 * Casier et affaires (content/acteurs/casier.json) : seulement des décisions ou étapes officielles visant la personne,
 * chacune avec une citation vérifiée. Même grille pour tous ; les relaxes et non-lieux sont affichés comme le reste.
 */
import data from '@content/acteurs/casier.json'

export type CasierType = 'condamnation' | 'en-cours' | 'relaxe' | 'sanction'
export interface CasierEntry {
  type: CasierType
  date: string
  title: string
  body: string
  facts: string
  decision: string
  presumption: boolean
  quote: string
  url: string
  publisher: string
  note: string
}

const all = (data as unknown as { checkedAt: string; entries: Record<string, CasierEntry[]> })
export const CASIER_CHECKED_AT = all.checkedAt
export const casierOf = (slug: string): CasierEntry[] | undefined => all.entries[slug]
export const CASIER_TYPES: { id: CasierType; label: string; one: string; empty: string }[] = [
  { id: 'condamnation', label: 'Condamnations définitives', one: 'Condamnation définitive', empty: 'Aucune' },
  { id: 'en-cours', label: 'Procédures en cours', one: 'Procédure en cours', empty: 'Aucune' },
  { id: 'relaxe', label: 'Relaxes et non-lieux', one: 'Relaxe ou non-lieu', empty: 'Aucun' },
  { id: 'sanction', label: 'Autres sanctions officielles', one: 'Sanction officielle', empty: 'Aucune' },
]
export function casierCounts(slug: string): Record<CasierType, number> | null {
  const list = casierOf(slug)
  if (!list) return null
  return { condamnation: 0, 'en-cours': 0, relaxe: 0, sanction: 0, ...Object.fromEntries(CASIER_TYPES.map((t) => [t.id, list.filter((e) => e.type === t.id).length])) }
}
