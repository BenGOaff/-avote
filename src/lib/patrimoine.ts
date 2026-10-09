/**
 * Patrimoine déclaré (content/acteurs/patrimoine.json) : seulement d'après une publication officielle
 * ou un article qui en rapporte le contenu, chaque montant avec sa citation vérifiée. Jamais les
 * déclarations des parlementaires (consultables en préfecture, publication interdite).
 */
import data from '@content/acteurs/patrimoine.json'

export interface Patrimoine {
  date: string
  amount: number
  label: string
  kind: 'net' | 'estime'
  context: string
  quote: string
  url: string
  publisher: string
}

const all = data as unknown as { entries: Record<string, Patrimoine>; netDefinition: string; netDefinitionUrl: string }
export const patrimoineOf = (slug: string): Patrimoine | undefined => all.entries[slug]
export const NET_DEFINITION = all.netDefinition
