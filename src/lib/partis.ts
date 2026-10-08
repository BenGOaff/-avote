/**
 * Fiches partis (content/partis/partis.json) : même grille pour tous, chaque champ sourcé et vérifié mot pour mot.
 */
import data from '@content/partis/partis.json'
import nuances from '@content/acteurs/nuances.json'
import { getParcours } from './parcours'
import type { BlocId } from './nuances'

export interface Sourced {
  quote: string
  url: string
  publisher: string
}
export interface Party {
  slug: string
  name: string
  sigle: string
  /** Autres sigles en usage pour le même parti (EELV pour Les Écologistes, par exemple). */
  aliases?: string[]
  nuance: string
  founded: ({ date: string; text: string } & Sourced) | null
  leaders: { name: string; role: string; since: string }[]
  leadersSource: Sourced | null
  elus: { deputes: number | null; senateurs: number | null; eurodeputes: number | null; asOf: string; note?: string; sources?: (Sourced & { field: string; asOf: string })[] } & Partial<Sourced>
  values: ({ text: string } & Sourced) | null
  dates: ({ date: string; text: string } & Sourced)[]
  measures: ({ theme: string; text: string } & Sourced)[]
}

const list = (data as { partis: Party[] }).partis
const NUANCES = (nuances as { nuances: Record<string, { label: string; bloc: BlocId }> }).nuances
export const BLOC_ORDER: BlocId[] = ['EXG', 'GAU', 'DIV', 'CENT', 'DTE', 'EXD']

export const getPartis = (): Party[] => list
export const getParti = (slug: string) => list.find((p) => p.slug === slug)
export const blocOfParty = (p: Party): BlocId => NUANCES[p.nuance]?.bloc ?? 'DIV'
/** Nuance vide : parti absent de la grille officielle et non déductible, laissé non classé comme ses candidats. */
export const isClassified = (p: Party) => !!NUANCES[p.nuance]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim()

/** Une période de parcours relève-t-elle de ce parti ? Même sigle, même nom, ou nom actuel entre parenthèses (« Europe Écologie Les Verts (Les Écologistes) »). */
export function isPartyOf(p: Party, period: { sigle: string; party: string }): boolean {
  if (p.sigle && period.sigle && (p.sigle === period.sigle || p.aliases?.includes(period.sigle))) return true
  const b = norm(p.name)
  const inParens = /\(([^)]+)\)\s*$/.exec(period.party)?.[1]
  return norm(period.party) === b || (!!inParens && norm(inParens) === b)
}

/** Fiche du parti d'une période, s'il y en a une. */
export const partyOfPeriod = (period: { sigle: string; party: string }) => list.find((p) => isPartyOf(p, period))

/** Candidats dont la période en cours (sans date de fin) correspond à ce parti. */
export function candidatesOf(p: Party, actors: { slug: string; name: string }[]): { slug: string; name: string }[] {
  return actors.filter((a) => getParcours(a.slug).some((x) => x.to === '' && isPartyOf(p, x)))
}

export const THEME_LABEL: Record<string, string> = {
  économie: 'Économie',
  travail: 'Travail',
  sécurité: 'Sécurité',
  libertés: 'Libertés',
  climat: 'Climat',
  europe: 'Europe',
  démocratie: 'Démocratie',
}
