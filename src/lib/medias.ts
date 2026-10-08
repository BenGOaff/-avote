/**
 * « Qui possède ton info » : fiches établies par scripts/medias.ts, chacune avec une citation vérifiée dans sa source.
 */
import liste from '@content/medias/liste.json'
import store from '@content/medias/proprietaires.json'

export type MediaType = 'tv' | 'radio' | 'presse' | 'web'

export interface MediaOwnership {
  slug: string
  owners: { name: string; kind: string; share: string }[]
  group: string
  controller: string
  controllerKind: string
  otherMedia: string[]
  note: string
  quote: string
  url: string
  sourceTitle: string
  publisher: string
  date: string
  checkedAt: string
}

export interface MediaEntry {
  slug: string
  name: string
  type: MediaType
  ownership: MediaOwnership | null
}

export const MEDIA_TYPE_LABEL: Record<MediaType, string> = { tv: 'Télévision', radio: 'Radio', presse: 'Presse', web: 'En ligne' }

export const CONTROLLER_KIND_LABEL: Record<string, string> = {
  personne: 'Personne',
  famille: 'Famille',
  etat: 'État',
  association: 'Association',
  fondation: 'Fondation',
  salaries: 'Salariés',
  lecteurs: 'Lecteurs',
  cotee: 'Société cotée',
  autre: 'Autre',
  inconnu: 'Inconnu',
}

const owned = (store as { medias: Record<string, MediaOwnership> }).medias

export function getMedias(): MediaEntry[] {
  return (liste.medias as { slug: string; name: string; type: MediaType }[]).map((m) => ({ ...m, ownership: owned[m.slug] ?? null }))
}

export const mediasUpdatedAt = (store as { updatedAt: string | null }).updatedAt

/** Regroupe les médias par contrôle final : « qui possède quoi ». */
export function byController(medias: MediaEntry[]): { controller: string; kind: string; medias: MediaEntry[] }[] {
  const groups = new Map<string, { controller: string; kind: string; medias: MediaEntry[] }>()
  for (const m of medias) {
    if (!m.ownership) continue
    const key = m.ownership.controller.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim()
    const g = groups.get(key) ?? { controller: m.ownership.controller, kind: m.ownership.controllerKind, medias: [] }
    g.medias.push(m)
    groups.set(key, g)
  }
  return [...groups.values()].sort((a, b) => b.medias.length - a.medias.length || a.controller.localeCompare(b.controller, 'fr'))
}
