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
  nuance: string
  founded: ({ date: string; text: string } & Sourced) | null
  leaders: { name: string; role: string; since: string }[]
  leadersSource: Sourced | null
  elus: { deputes: number | null; senateurs: number | null; eurodeputes: number | null; asOf: string } & Partial<Sourced>
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
export const partyBySigle = (sigle: string) => (sigle ? list.find((p) => p.sigle === sigle) : undefined)

/** Candidats dont la période en cours (sans date de fin) correspond à ce parti. */
export function candidatesOf(p: Party, actors: { slug: string; name: string }[]): { slug: string; name: string }[] {
  return actors.filter((a) => getParcours(a.slug).some((x) => x.to === '' && (x.sigle ? x.sigle === p.sigle : x.party === p.name)))
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
