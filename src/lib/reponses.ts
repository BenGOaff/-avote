/**
 * Droits de réponse des candidats et de leurs équipes (content/reponses/reponses.json), publiés en entier.
 */
import data from '@content/reponses/reponses.json'

export interface Reponse {
  actor: string
  /** Qui répond : « Équipe de campagne de … », « Le candidat » */
  from: string
  received: string
  published: string
  /** Texte intégral, paragraphes séparés par une ligne vide */
  text: string
  /** Affirmations du test visées, s'il y en a */
  items?: string[]
  /** Ce que la rédaction a fait : position corrigée, maintenue (et pourquoi) */
  outcome: string
}

export const REPONSES = (data.entries as Reponse[]).slice().sort((a, b) => b.published.localeCompare(a.published))
export const reponsesOf = (slug: string) => REPONSES.filter((r) => r.actor === slug)
