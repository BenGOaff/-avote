import 'server-only'
/**
 * Pages « Programmes par sujet » (/programmes/<sujet>) : pour chaque thème du test, qui est pour, contre ou entre les deux,
 * avec la citation et la source de chaque position. Tout vient du corpus en ligne (content/corpus/live.json) :
 * une nouvelle position codée par la veille apparaît au déploiement suivant, rien n'est écrit à la main.
 */
import { getActiveActors } from './actors'
import { positionLabel } from './answers'
import { itemsByTheme, liveCorpus, questionnaire } from './data'
import type { Item, Position, Theme } from './engine/types'
import { nuanceOf, type BlocId } from './nuances'

export type Side = 'pour' | 'entre' | 'contre'
export const SIDES: Side[] = ['pour', 'entre', 'contre']

export interface Stance {
  slug: string
  name: string
  bloc: BlocId
  side: Side
  /** Position catégorique (« Tout à fait d'accord » ou « Pas du tout d'accord ») */
  strong: boolean
  label: string
  basis?: string
  quote?: string
  url?: string
  publisher?: string
  date?: string
}

export interface SujetItem {
  item: Item
  stances: Stance[]
  unknown: number
  count: Record<Side, number>
}

export interface Sujet {
  slug: string
  theme: Theme
  items: SujetItem[]
  positions: number
  candidates: number
  updatedAt: string | null
}

/** « Pouvoir d’achat et impôts » → « pouvoir-d-achat-et-impots » */
export const sujetSlug = (label: string) =>
  label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Dates de source hétérogènes (« 2026-09-29 », « 2026-09 », « 2022 (consulté le …) ») : on n'affiche que ce qui est sûr. */
const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
function dateLabel(d?: string): string | undefined {
  if (!d) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return dayFmt.format(new Date(`${d}T12:00:00Z`))
  if (/^\d{4}-\d{2}$/.test(d)) return monthFmt.format(new Date(`${d}-15T12:00:00Z`))
  return /^\d{4}\b/.exec(d)?.[0]
}

/** Pour si toutes les valeurs possibles sont favorables, contre si toutes sont opposées, sinon entre les deux (même règle que le comparateur). */
const valuesOf = (p: Position): number[] => ('set' in p ? [...p.set] : 'value' in p ? [p.value] : [])
const sideOf = (v: number[]): Side => (v.every((x) => x > 0) ? 'pour' : v.every((x) => x < 0) ? 'contre' : 'entre')

export function getSujets(): Sujet[] {
  const actors = getActiveActors()
  const sources = new Map((liveCorpus.sources ?? []).map((s) => [s.id, s]))
  const refreshed = (liveCorpus as { refreshedAt?: Record<string, string> }).refreshedAt ?? {}
  return itemsByTheme(questionnaire).map(({ theme, items }) => {
    let updatedAt: string | null = null
    const rows = items.map((item): SujetItem => {
      const stances = actors.flatMap((a): Stance[] => {
        const p = liveCorpus.positions[a.slug]?.[item.id]
        if (!p || 'missing' in p) return []
        const v = valuesOf(p)
        if (v.length === 0) return []
        const src = sources.get(p.sources[0] ?? '')
        const seen = refreshed[a.slug] ?? p.codedAt
        if (seen && (!updatedAt || seen > updatedAt)) updatedAt = seen
        return [
          {
            slug: a.slug,
            name: a.name,
            bloc: nuanceOf(a.slug)?.bloc ?? 'DIV',
            side: sideOf(v),
            strong: v.every((x) => Math.abs(x) === 2),
            label: positionLabel(p),
            basis: p.basis,
            quote: src?.passage,
            url: src?.url ?? undefined,
            publisher: src?.publisher,
            date: dateLabel(src?.date),
          },
        ]
      })
      const count = { pour: 0, entre: 0, contre: 0 }
      for (const s of stances) count[s.side]++
      return { item, stances, unknown: actors.length - stances.length, count }
    })
    return {
      slug: sujetSlug(theme.label),
      theme,
      items: rows,
      positions: rows.reduce((n, r) => n + r.stances.length, 0),
      candidates: actors.length,
      updatedAt,
    }
  })
}

export const getSujet = (slug: string) => getSujets().find((s) => s.slug === slug)

/** Phrase de synthèse d'une question, reprise telle quelle dans la page et dans les données structurées. */
export function summaryOf(r: SujetItem): string {
  const names = (side: Side) =>
    r.stances
      .filter((s) => s.side === side)
      .map((s) => s.name)
      .join(', ')
  const parts = [
    r.count.pour ? `Pour : ${names('pour')}.` : 'Personne pour.',
    r.count.entre ? `Entre les deux : ${names('entre')}.` : '',
    r.count.contre ? `Contre : ${names('contre')}.` : 'Personne contre.',
    r.unknown ? `${r.unknown} candidat${r.unknown > 1 ? 's' : ''} sans position explicite trouvée.` : '',
  ]
  return parts.filter(Boolean).join(' ')
}

/**
 * Date de mise à jour d'une fiche candidat : la plus récente entre le dernier codage d'une de ses positions
 * et la dernière relecture complète de ses sources. null si rien n'est daté (on n'invente pas de date).
 */
export function actorUpdatedAt(slug: string): string | null {
  const refreshed = (liveCorpus as { refreshedAt?: Record<string, string> }).refreshedAt?.[slug]
  let last: string | null = refreshed ?? null
  for (const p of Object.values(liveCorpus.positions[slug] ?? {})) if (p.codedAt && (!last || p.codedAt > last)) last = p.codedAt
  return last
}

/** Une page « candidat × sujet » n'existe que si le candidat a au moins ce nombre de positions sourcées sur le sujet */
export const MIN_CANDIDAT_SUJET = 2

export interface CandidatSujetRow {
  item: Item
  stance?: Stance
}
export interface CandidatSujet {
  sujet: Sujet
  rows: CandidatSujetRow[]
  known: number
}

let cache: Sujet[] | null = null
const sujetsCached = () => (cache ??= getSujets())

/** Le sujet vu par un seul candidat : ses positions sourcées, et les propositions sur lesquelles on ne sait rien */
export function getCandidatSujet(slug: string, sujet: string): CandidatSujet | undefined {
  const s = sujetsCached().find((x) => x.slug === sujet)
  if (!s) return undefined
  const rows = s.items.map((r) => ({ item: r.item, stance: r.stances.find((st) => st.slug === slug) }))
  const known = rows.filter((r) => r.stance).length
  return known >= MIN_CANDIDAT_SUJET ? { sujet: s, rows, known } : undefined
}

/** Les sujets qui ont une page pour ce candidat (candidats actifs seulement) */
export function getCandidatSujets(slug: string): CandidatSujet[] {
  return sujetsCached().flatMap((s) => getCandidatSujet(slug, s.slug) ?? [])
}

/** Synthèse tirée des positions codées (aucun texte rédigé à la main ni par IA) : le décompte, puis les propositions par camp */
export function candidatSujetSummary(name: string, cs: CandidatSujet): { lead: string; sides: { side: Side; texts: string[] }[] } {
  return {
    lead: `${name} a une position connue sur ${cs.known} des ${cs.rows.length} propositions de ce sujet.`,
    sides: SIDES.map((side) => ({ side, texts: cs.rows.filter((r) => r.stance?.side === side).map((r) => r.item.text) })).filter((x) => x.texts.length > 0),
  }
}

let stanceIndex: Map<string, Stance> | null = null
/** Position sourcée d'un candidat sur une proposition (citation, source, libellé), telle qu'affichée sur les pages sujets */
export function stanceOf(slug: string, itemId: string): Stance | undefined {
  stanceIndex ??= new Map(sujetsCached().flatMap((s) => s.items.flatMap((r) => r.stances.map((st) => [`${st.slug}|${r.item.id}`, st] as const))))
  return stanceIndex.get(`${slug}|${itemId}`)
}

/** Page d'une proposition (/programmes/<sujet>/<proposition>) : le slug vient du nom court de la proposition, unique dans le questionnaire */
export const propositionSlug = (item: Item) => sujetSlug(item.concept)
export const propositionPath = (sujet: string, item: Item) => `/programmes/${sujet}/${propositionSlug(item)}`

export interface Proposition {
  sujet: Sujet
  row: SujetItem
  /** Candidats actifs sans position explicite trouvée */
  unknown: { slug: string; name: string }[]
  prev?: SujetItem
  next?: SujetItem
}

export function getPropositions(): { sujet: Sujet; row: SujetItem }[] {
  return sujetsCached().flatMap((s) => s.items.map((row) => ({ sujet: s, row })))
}

export function getProposition(sujet: string, slug: string): Proposition | undefined {
  const s = sujetsCached().find((x) => x.slug === sujet)
  const i = s?.items.findIndex((r) => propositionSlug(r.item) === slug) ?? -1
  if (!s || i < 0) return undefined
  const row = s.items[i]!
  const known = new Set(row.stances.map((st) => st.slug))
  return {
    sujet: s,
    row,
    unknown: getActiveActors()
      .filter((a) => !known.has(a.slug))
      .map((a) => ({ slug: a.slug, name: a.name })),
    prev: s.items[i - 1],
    next: s.items[i + 1],
  }
}

/** Page d'une proposition à partir de son identifiant de question (eur-09…) */
export function propositionPathById(itemId: string): string | undefined {
  const p = getPropositions().find((x) => x.row.item.id === itemId)
  return p && propositionPath(p.sujet.slug, p.row.item)
}
