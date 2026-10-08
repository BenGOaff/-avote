/**
 * Types du moteur de proximité — cahier des charges §5.3, §8, §10.
 * Ce module ne fait aucun appel réseau et ne dépend d'aucun état global :
 * mêmes entrées → mêmes sorties.
 */

export type Ordinal = -2 | -1 | 0 | 1 | 2
export const ORDINALS: readonly Ordinal[] = [-2, -1, 0, 1, 2]

/** Réponse du votant. « Je ne sais pas », « passer » et « cela dépend » sont des valeurs manquantes, jamais un zéro. */
export type Answer =
  | { kind: 'value'; value: Ordinal }
  | { kind: 'dontknow' }
  | { kind: 'skip' }
  | { kind: 'depends'; note?: string }

export type ThemeId = string
export type ItemId = string
export type ActorSlug = string

export interface Theme {
  id: ThemeId
  label: string
  description: string
}

export interface DimensionDef {
  id: string
  label: string
  /** Libellés des deux extrémités, sans étiquette partisane */
  low: string
  high: string
  definition: string
}

export interface Item {
  id: ItemId
  version: string
  theme: ThemeId
  concept: string
  text: string
  explanation: string
  /** Orientation de l'item pour chaque dimension alimentée (+1 ou -1) */
  dimensions?: Record<string, 1 | -1>
  /** Item retiré du socle comparable (n'entre plus dans les poids) */
  inactive?: boolean
}

export interface QuestionSet {
  version: string
  status: 'brouillon' | 'validé'
  themes: Theme[]
  dimensions: DimensionDef[]
  items: Item[]
}

/** Statuts documentaires (cahier §7.4) */
export type DocStatus =
  | 'explicite'
  | 'explicite-conditionnel'
  | 'parti-uniquement'
  | 'declaration-provisoire'
  | 'ambigu'
  | 'contradictoire'
  | 'inconnu'
  | 'retire'
  | 'remplace'

/** Origine d'une position codée */
export type PositionBasis = 'programme-2027' | 'declaration' | 'programme-2022' | 'parti' | 'vote'

/** Métadonnées de codage (affichées, jamais utilisées dans le calcul) */
export interface PositionMeta {
  note?: string
  basis?: PositionBasis
  /** « ia » : codé automatiquement, citation vérifiée dans la source ; « humain » : relu */
  codedBy?: 'ia' | 'humain'
  codedAt?: string
}

/** Position codée d'un acteur sur un item. */
export type Position =
  | ({ value: Ordinal; status: DocStatus; sources: string[] } & PositionMeta)
  | ({ set: Ordinal[]; status: DocStatus; sources: string[] } & PositionMeta)
  | ({ missing: true; status: DocStatus } & PositionMeta)

export interface CorpusSource {
  id: string
  title: string
  publisher: string
  url: string | null
  date?: string
  passage?: string
}

export interface Actor {
  slug: ActorSlug
  name: string
  /** déclaré | démarche annoncée | évoqué | fictif */
  status: 'declare' | 'demarche' | 'evoque' | 'fictif'
  party?: string
  summary: string
}

export interface Corpus {
  version: string
  mode: 'demo' | 'live'
  questionSet: string
  publishedAt: string
  actors: Actor[]
  positions: Record<ActorSlug, Record<ItemId, Position>>
  sources?: CorpusSource[]
}

export type Answers = Record<ItemId, Answer>
/** Jetons de priorité par thème (somme = 10) */
export type Priorities = Record<ThemeId, number>
