/**
 * « Les faits » : chiffres et règles de droit officiels affichés sous certaines affirmations du test.
 * Contexte pour répondre en connaissance de cause ; ils n'entrent jamais dans le calcul.
 */
import faitsJson from '@content/questionnaire/faits.json'

export interface Fait {
  /** Phrase affichée, neutre, avec le chiffre et sa date */
  text: string
  /** Passage exact de la page source */
  quote: string
  url: string
  publisher: string
  title: string
  date: string
}

const FAITS = (faitsJson as unknown as { checkedAt: string; items: Record<string, Fait[]> }).items

export const FAITS_CHECKED_AT = (faitsJson as { checkedAt: string }).checkedAt

export function faitsOf(itemId: string): Fait[] {
  return FAITS[itemId] ?? []
}
