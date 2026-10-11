import 'server-only'
/**
 * Pages « Programmes par sujet » (/programmes/<sujet>) : pour chaque thème du test, qui est pour, contre ou entre les deux,
 * avec la citation et la source de chaque position. Tout vient du corpus en ligne (content/corpus/live.json) :
 * une nouvelle position codée par la veille apparaît au déploiement suivant, rien n'est écrit à la main.
 */
import { getAnnouncedActors } from './actors'
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
  const actors = getAnnouncedActors().filter((a) => a.status !== 'retire')
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
