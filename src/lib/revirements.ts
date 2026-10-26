/**
 * Changements d'avis des candidats (content/revirements/revirements.json) : deux phrases publiques datées, l'une avant,
 * l'autre après. Sans entrée vérifiée, la page n'existe pas et n'apparaît ni dans le menu ni dans le plan du site.
 */
import data from '@content/revirements/revirements.json'

export interface Said {
  quote: string
  url: string
  date: string
  publisher: string
  title: string
}
export interface Revirement {
  actor: string
  /** Affirmation du test concernée, si le sujet en est une */
  itemId?: string
  topic: string
  before: Said
  after: Said
  note?: string
}

export const REVIREMENTS = (data.entries as Revirement[]).slice().sort((a, b) => b.after.date.localeCompare(a.after.date))
export const revirementsOf = (slug: string) => REVIREMENTS.filter((r) => r.actor === slug)
