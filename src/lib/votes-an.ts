/**
 * Votes des candidats députés (content/acteurs/votes-an.json), tirés de l'open data de l'Assemblée nationale :
 * scrutins solennels (les grands textes) et motions de censure de la XVIIe législature.
 */
import data from '@content/acteurs/votes-an.json'

export type VoteAN = 'pour' | 'contre' | 'abstention' | 'non-votant' | 'absent' | 'pas-pour'
export interface ScrutinAN {
  numero: number
  date: string
  type: 'solennel' | 'censure'
  titre: string
  sort: string
  dossier: string
  pour: number
  contre: number
  abstentions: number
}
const all = data as unknown as { source: string; fetchedAt: string; scrutins: ScrutinAN[]; votes: Record<string, Record<string, VoteAN>> }

export const VOTES_SOURCE = all.source
export const VOTES_FETCHED_AT = all.fetchedAt
export const scrutinUrl = (n: number) => `https://www.assemblee-nationale.fr/dyn/17/scrutins/${n}`
export const isDeputy = (slug: string) => !!all.votes[slug]

export function votesOf(slug: string): { scrutin: ScrutinAN; vote: VoteAN }[] {
  const v = all.votes[slug]
  if (!v) return []
  return all.scrutins.map((scrutin) => ({ scrutin, vote: v[String(scrutin.numero)] ?? 'absent' }))
}

export const VOTE_LABEL: Record<VoteAN, string> = {
  pour: 'Pour',
  contre: 'Contre',
  abstention: 'Abstention',
  'non-votant': 'Non-votant',
  absent: 'N’a pas voté',
  'pas-pour': 'Ne l’a pas votée',
}

/** « l'ensemble du projet de loi … (première lecture). » → « Projet de loi … (première lecture) » */
export function scrutinLabel(s: ScrutinAN): string {
  const t = s.titre.replace(/^l[’']ensemble (du |de la |des )?/i, '').replace(/^la /, '').replace(/\.$/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}
