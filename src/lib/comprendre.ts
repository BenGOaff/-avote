/**
 * Rubrique « Comprendre la politique » (content/comprendre/chapitres.json) : éducation populaire pour les lycéens,
 * les primo-votants et leurs profs. Chaque fait daté ou chiffré a sa source, extrait vérifié mot pour mot.
 */
import data from '@content/comprendre/chapitres.json'

export interface ComprendreSource {
  title: string
  publisher: string
  url: string
  quote: string
}
export interface Chapitre {
  slug: string
  title: string
  /** La question telle qu'on la tape */
  question: string
  metaTitle: string
  description: string
  short: string[]
  sections: { title: string; paras: string[] }[]
  anecdotes: { text: string; source: ComprendreSource }[]
  sources: ComprendreSource[]
}

const D = data as { checkedAt: string; chapters: Chapitre[] }

export const CHAPITRES = D.chapters
export const COMPRENDRE_CHECKED = D.checkedAt
export const getChapitre = (slug: string) => CHAPITRES.find((c) => c.slug === slug)
/** Le chapitre pensé pour les enseignants */
export const SEANCE_SLUG = 'seance-50-minutes'

/** Espaces insécables de la typographie française : « : » ou « ? » ne commencent jamais une ligne */
export const nbsp = (s: string) => s.replace(/ ([:;?!»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
/** Chapitres de lecture (la séance pour les profs est à part) */
export const LECTURE = CHAPITRES.filter((c) => c.slug !== SEANCE_SLUG)
