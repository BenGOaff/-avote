/**
 * « Qui possède ton info » : fiches établies par scripts/medias.ts ou scripts/medias-import.ts, chacune avec une citation vérifiée dans sa source.
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

export interface ArcomAlert {
  date: string
  kind: string
  topic: string
  summary: string
  quote: string
  url: string
  publisher: string
}

export interface Orientation {
  label: string
  quote: string
  url: string
  publisher: string
}

export interface Engagement {
  text: string
  quote: string
  url: string
  publisher: string
  date: string
}

export interface MediaEntry {
  slug: string
  name: string
  type: MediaType
  ownership: MediaOwnership | null
  /** Orientation politique du média selon eurotopics, toujours attribuée */
  orientation: Orientation | null
  /** null : pas encore vérifié ; liste vide : vérifié, aucune décision relevée */
  alerts: ArcomAlert[] | null
  alertsCheckedAt: string | null
}

export const ALERT_KIND_LABEL: Record<string, string> = {
  'mise-en-demeure': 'Mise en demeure',
  'mise-en-garde': 'Mise en garde',
  sanction: 'Sanction',
  avertissement: 'Avertissement',
  'non-renouvellement': 'Non-renouvellement',
  'decision-conseil-etat': 'Conseil d’État',
  autre: 'Décision',
}

export const ALERT_TOPIC_LABEL: Record<string, string> = {
  pluralisme: 'Pluralisme',
  'temps-de-parole': 'Temps de parole',
  'honnetete-information': 'Honnêteté de l’information',
  'independance-information': 'Indépendance de l’information',
  'campagne-electorale': 'Campagne électorale',
  'autre-politique': 'Information politique',
}

export const MEDIA_TYPE_LABEL: Record<MediaType, string> = { tv: 'Télévision', radio: 'Radio', presse: 'Presse', web: 'En ligne' }

export const CONTROLLER_KIND_LABEL: Record<string, string> = {
  personne: 'Personne',
  famille: 'Famille',
  etat: 'État',
  association: 'Association',
  fondation: 'Fondation',
  nonlucratif: 'À but non lucratif',
  journalistes: 'Journalistes',
  salaries: 'Salariés',
  lecteurs: 'Lecteurs',
  cotee: 'Société cotée',
  autre: 'Autre',
  inconnu: 'Inconnu',
}

/** Grandes familles de propriétaires, pour la répartition « qui a le dernier mot ». */
export const OWNER_FAMILIES: { id: string; label: string; kinds: string[] }[] = [
  { id: 'public', label: 'L’État ou le Parlement', kinds: ['etat'] },
  { id: 'prive', label: 'Une personne ou une famille', kinds: ['personne', 'famille'] },
  { id: 'cotee', label: 'Un groupe coté en Bourse', kinds: ['cotee'] },
  { id: 'nonlucratif', label: 'Une fondation, une association ou un fonds', kinds: ['fondation', 'association', 'nonlucratif'] },
  { id: 'interne', label: 'Ses salariés, ses lecteurs ou ses journalistes', kinds: ['salaries', 'lecteurs', 'journalistes'] },
  { id: 'autre', label: 'Autre', kinds: ['autre', 'inconnu'] },
]

/**
 * Médias libres : ni milliardaire, ni grand groupe, ni État n'a le dernier mot. Le média appartient à ses
 * journalistes, ses salariés, ses lecteurs, à une association ou à une structure à but non lucratif créée par eux.
 * Un fonds créé ou financé par un milliardaire ou un groupe est classé « fondation » et n'en fait pas partie.
 */
export const FREE_KINDS = ['journalistes', 'salaries', 'lecteurs', 'association', 'nonlucratif']
export const FREE_KIND_LABEL: Record<string, string> = {
  journalistes: 'À ses journalistes',
  salaries: 'À ses salariés',
  lecteurs: 'À ses lecteurs',
  association: 'À une association',
  nonlucratif: 'À une structure sans but lucratif',
}
export const freeMedias = (medias: MediaEntry[]) => medias.filter((m) => m.ownership && FREE_KINDS.includes(m.ownership.controllerKind))

export function familySplit(medias: MediaEntry[]): { id: string; label: string; medias: MediaEntry[] }[] {
  const done = medias.filter((m) => m.ownership)
  return OWNER_FAMILIES.map((f) => ({ id: f.id, label: f.label, medias: done.filter((m) => f.kinds.includes(m.ownership!.controllerKind)) })).filter((f) => f.medias.length > 0)
}

const owned = (store as { medias: Record<string, MediaOwnership> }).medias
const orientations = ((store as { orientations?: Record<string, Orientation> }).orientations ?? {}) as Record<string, Orientation>
const engagements = ((store as { engagements?: Record<string, { items: Engagement[] }> }).engagements ?? {}) as Record<string, { items: Engagement[] }>

/** Engagements politiques publics et documentés de qui contrôle (libellé exact du contrôle final). */
export const engagementsOf = (controller: string): Engagement[] => engagements[controller]?.items ?? []

const alertes = ((store as { alertes?: Record<string, { checkedAt: string; items: ArcomAlert[] }> }).alertes ?? {}) as Record<string, { checkedAt: string; items: ArcomAlert[] }>

export function getMedias(): MediaEntry[] {
  return (liste.medias as { slug: string; name: string; type: MediaType }[]).map((m) => ({
    ...m,
    ownership: owned[m.slug] ?? null,
    orientation: orientations[m.slug] ?? null,
    alerts: alertes[m.slug]?.items ?? null,
    alertsCheckedAt: alertes[m.slug]?.checkedAt ?? null,
  }))
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
