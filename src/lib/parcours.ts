/**
 * Partis traversés par chaque candidat (content/acteurs/parcours.json), chaque période avec sa source vérifiée.
 */
import data from '@content/acteurs/parcours.json'
import type { BlocId } from './nuances'

export interface PartyPeriod {
  party: string
  sigle: string
  from: string
  to: string
  role: string
  quote: string
  url: string
  publisher: string
}

const all = (data as { parcours: Record<string, PartyPeriod[]> }).parcours

export const getParcours = (slug: string): PartyPeriod[] => all[slug] ?? []

/**
 * Couleur de famille : seulement pour les partis nommés dans la grille officielle des nuances, et pour le même
 * parti sous un ancien nom (FN devenu RN, UMP devenue LR, En marche devenu Renaissance, EELV devenu Les Écologistes).
 * Les autres partis gardent la couleur neutre : on ne les classe pas nous-mêmes.
 */
const SIGLE_BLOC: Record<string, BlocId> = {
  LFI: 'EXG',
  PCF: 'GAU',
  PS: 'GAU',
  PP: 'GAU',
  EELV: 'GAU',
  RE: 'CENT',
  EM: 'CENT',
  LREM: 'CENT',
  HOR: 'CENT',
  LR: 'DTE',
  UMP: 'DTE',
  RN: 'EXD',
  FN: 'EXD',
  REC: 'EXD',
}
export const blocOfSigle = (sigle: string): BlocId => SIGLE_BLOC[sigle] ?? 'DIV'

export const periodLabel = (p: PartyPeriod) => `${p.from || '?'} → ${p.to === '' ? 'aujourd’hui' : p.to}`
