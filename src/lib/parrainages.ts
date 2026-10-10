import 'server-only'
import data from '@content/acteurs/parrainages.json'

/** Parrainages validés publiés par le Conseil constitutionnel (scripts/officiel.ts) ; vide avant leur publication. */
type Parrainages = { source: { title: string; publisher: string; url: string } | null; publishedAt: string; threshold: number; counts: Record<string, number> }
const p = data as Parrainages

export const parrainagesSource = p.source
export const parrainagesDate = p.publishedAt
export const PARRAINAGES_THRESHOLD = p.threshold
export const parrainagesOf = (slug: string): number | null => (p.source ? (p.counts[slug] ?? 0) : null)
