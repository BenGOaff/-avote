/**
 * Familles politiques : grille officielle des nuances du ministère de l'Intérieur (instruction du 2 février 2026),
 * regroupées en blocs comme dans son annexe 3. Ça vote ? ne classe personne lui-même : quand un parti n'est pas
 * nommé dans la grille, la nuance appliquée est marquée « déduite » et expliquée.
 */
import data from '@content/acteurs/nuances.json'

export type BlocId = 'EXG' | 'GAU' | 'CENT' | 'DTE' | 'EXD' | 'DIV'

export interface ActorNuance {
  code: string
  label: string
  bloc: BlocId
  blocLabel: string
  basis: 'grille' | 'deduite'
  note?: string
}

export const BLOCS = data.blocs as { id: BlocId; label: string }[]
export const NUANCE_SOURCE = data.source
export const NUANCE_VALIDATION = data.validation

const nuances = data.nuances as Record<string, { label: string; bloc: BlocId }>
const actors = data.actors as Record<string, { nuance: string; basis: 'grille' | 'deduite'; note?: string }>

export function nuanceOf(slug: string): ActorNuance | null {
  const a = actors[slug]
  const n = a ? nuances[a.nuance] : undefined
  if (!a || !n) return null
  return { code: a.nuance, label: n.label, bloc: n.bloc, blocLabel: BLOCS.find((b) => b.id === n.bloc)?.label ?? n.bloc, basis: a.basis, ...(a.note ? { note: a.note } : {}) }
}
