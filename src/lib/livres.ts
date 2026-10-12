import 'server-only'
import data from '@content/livres/livres.json'
import { getAnnouncedActors, type AnnouncedActor } from './actors'
import { BLOCS, nuanceOf, type BlocId } from './nuances'

/**
 * « Lire les candidats » : le livre de chaque candidat, sans avis, quel que soit le camp.
 * Liens Amazon avec l'identifiant de suivi du site (content/livres/livres.json) ; sans identifiant, lien simple.
 */
export interface Livre {
  actor: AnnouncedActor
  /** null : titre à confirmer */
  title: string | null
  url: string
}

const tag = (data as { amazonTag: string }).amazonTag
export const isAffiliate = tag.length > 0
const amazonUrl = (asin: string) => `https://www.amazon.fr/dp/${asin}${isAffiliate ? `?tag=${tag}` : ''}`

const items = (data.items as { actor: string; title: string | null; asin: string }[])
  .map((b) => {
    const actor = getAnnouncedActors().find((a) => a.slug === b.actor)
    return actor ? { actor, title: b.title, url: amazonUrl(b.asin) } : null
  })
  .filter((x): x is Livre => x !== null)

export const livreOf = (slug: string): Livre | undefined => items.find((b) => b.actor.slug === slug)

/** Livres rangés par famille politique (grille officielle des nuances), candidatures en cours d'abord. */
export function livresByBloc(): { id: BlocId; label: string; livres: Livre[] }[] {
  return BLOCS.map((b) => ({
    ...b,
    livres: items
      .filter((x) => (nuanceOf(x.actor.slug)?.bloc ?? 'DIV') === b.id)
      .sort((x, y) => Number(x.actor.status === 'retire') - Number(y.actor.status === 'retire') || x.actor.name.localeCompare(y.actor.name, 'fr')),
  })).filter((b) => b.livres.length > 0)
}

/** Essais de référence de chaque camp, par rayon. Montrés seulement quand au moins quatre rayons sont garnis. */
export interface Essai {
  title: string
  author: string
  url: string
}
const rayons = (data as { rayons: { id: string; label: string }[] }).rayons
const essais = (data as { essais: { rayon: string; title: string; author: string; asin: string }[] }).essais
export function essaisByRayon(): { id: string; label: string; essais: Essai[] }[] {
  const shelves = rayons
    .map((r) => ({ ...r, essais: essais.filter((e) => e.rayon === r.id).map((e) => ({ title: e.title, author: e.author, url: amazonUrl(e.asin) })) }))
    .filter((r) => r.essais.length > 0)
  return shelves.length >= 4 ? shelves : []
}
