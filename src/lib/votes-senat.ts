/** Votes au Sénat des candidats sénateurs (content/acteurs/votes-senat.json), recopiés des pages officielles des scrutins. */
import data from '@content/acteurs/votes-senat.json'

export interface ScrutinSenat {
  numero: number
  date: string
  titre: string
  sort: string
  pour: number | null
  contre: number | null
  vote: 'pour' | 'contre' | 'abstention' | 'non-votant' | 'absent'
  url: string
}
const all = data as unknown as { source: string; fetchedAt: string; senateurs: Record<string, { since: string; page: string; scrutins: ScrutinSenat[] }> }
export const SENAT_FETCHED_AT = all.fetchedAt
export const senatOf = (slug: string) => all.senateurs[slug]

/** « sur l'ensemble du projet de loi … » → « Projet de loi … » */
export const senatLabel = (t: string) => {
  const x = t.replace(/^sur l[’']ensemble (du texte élaboré par la commission mixte paritaire sur |du |de la |des )?/i, '')
  return x.charAt(0).toUpperCase() + x.slice(1)
}
