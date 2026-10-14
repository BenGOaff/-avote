/**
 * « Les prochains rendez-vous » : échéances légales (calculées à partir des règles officielles, testées dans
 * vote-dates.test.ts) et rendez-vous de campagne repérés dans la presse (content/agenda/agenda.json, une source
 * et la phrase qui donne la date pour chacun). Pas de date déduite : un rendez-vous annoncé sans date n'est pas listé.
 */
import data from '@content/agenda/agenda.json'
import {
  FIRST_ROUND,
  OFFICIAL_CAMPAIGN,
  REGISTRATION_DEADLINE,
  REGISTRATION_DEADLINE_SPECIAL,
  SECOND_ROUND,
  SPONSORSHIP_CLOSE,
} from './vote-dates'

export type AgendaKind = 'scrutin' | 'echeance' | 'campagne' | 'parti' | 'debat' | 'meeting' | 'institution'

export const KIND_LABEL: Record<AgendaKind, string> = {
  scrutin: 'Vote',
  echeance: 'Date limite',
  campagne: 'Campagne officielle',
  parti: 'Vie des partis',
  debat: 'Débat',
  meeting: 'Meeting',
  institution: 'Institutions',
}

export interface AgendaSource {
  title: string
  publisher: string
  url: string
}

export interface AgendaEvent {
  id: string
  kind: AgendaKind
  title: string
  date: string
  end?: string
  /** Heure de Paris, HH:MM */
  time?: string
  summary: string
  who?: string[]
  place?: string
  source: AgendaSource
  /** Phrase de la source qui donne la date (rendez-vous de presse) */
  quote?: string
  /** Échéance calculée à partir de la règle : à confirmer par le décret de convocation */
  computed?: boolean
  /** Lien vers la page du site qui explique la démarche */
  href?: string
  /** Rappels proposés dans le fichier d'agenda, en jours avant */
  alarms?: number[]
}

const SP = 'Service-Public.fr (DILA, Premier ministre)'
const DATES = { title: 'Présidentielle 2027 : les dates du scrutin', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/actualites/A15053' }
const LOI_1962 = {
  title: 'Loi n° 62-1292 du 6 novembre 1962, article 3',
  publisher: 'Conseil constitutionnel',
  url: 'https://www.conseil-constitutionnel.fr/fondements-textuels/loi-n-62-1292-du-6-novembre-1962-relative-a-l-election-du-president-de-la-republique-au-suffrage',
}

/** Échéances fixées par les textes, identiques pour tout le monde */
const OFFICIAL: AgendaEvent[] = [
  {
    id: 'inscription-listes',
    kind: 'echeance',
    title: 'Date limite d’inscription sur les listes électorales',
    date: REGISTRATION_DEADLINE,
    summary: 'Sixième vendredi avant le premier tour, en ligne comme en mairie.',
    source: { title: 'Inscription sur les listes électorales : délais', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34240' },
    computed: true,
    href: '/voter/inscription-listes-electorales',
    alarms: [14, 3],
  },
  {
    id: 'cloture-parrainages',
    kind: 'institution',
    title: 'Clôture des parrainages',
    date: SPONSORSHIP_CLOSE,
    time: '18:00',
    summary: 'Les présentations d’élus doivent parvenir au Conseil constitutionnel au plus tard le sixième vendredi avant le premier tour, à 18 h. Après cette date, la liste des candidats est fixée.',
    source: LOI_1962,
    computed: true,
  },
  {
    id: 'campagne-officielle',
    kind: 'campagne',
    title: 'Ouverture de la campagne officielle',
    date: OFFICIAL_CAMPAIGN,
    summary: 'Le deuxième lundi avant le premier tour : égalité du temps de parole, affiches et professions de foi.',
    source: {
      title: 'Décret n° 2001-213 du 8 mars 2001, article 10',
      publisher: 'Conseil constitutionnel',
      url: 'https://www.conseil-constitutionnel.fr/fondements-textuels/decret-n-2001-213-du-8-mars-2001-portant-application-de-la-loi-n-62-1292-du-6-novembre-1962-relative',
    },
    computed: true,
  },
  {
    id: 'inscription-cas-particuliers',
    kind: 'echeance',
    title: 'Inscription dans les situations particulières : dernier délai',
    date: REGISTRATION_DEADLINE_SPECIAL,
    summary: '18 ans sans recensement, déménagement récent, nationalité française récente, droit de vote recouvré : jusqu’au 10e jour avant le premier tour.',
    source: { title: 'Inscription sur les listes électorales : délais', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34240' },
    computed: true,
    href: '/voter/inscription-listes-electorales',
    alarms: [3],
  },
  {
    id: 'premier-tour',
    kind: 'scrutin',
    title: 'Premier tour de l’élection présidentielle',
    date: FIRST_ROUND,
    summary: 'La veille, samedi 17 avril, en Guadeloupe, en Martinique, en Guyane, à Saint-Pierre-et-Miquelon, à Saint-Barthélemy, à Saint-Martin et en Polynésie française.',
    source: DATES,
    href: '/voter/jour-du-vote',
    alarms: [7, 1],
  },
  {
    id: 'second-tour',
    kind: 'scrutin',
    title: 'Second tour de l’élection présidentielle',
    date: SECOND_ROUND,
    summary: 'La veille, samedi 1er mai, dans les mêmes territoires d’outre-mer.',
    source: DATES,
    href: '/voter/jour-du-vote',
    alarms: [7, 1],
  },
]

const PRESS = (data as unknown as { events: AgendaEvent[] }).events
export const agendaUpdatedAt = (data as { updatedAt: string }).updatedAt

/** Tous les rendez-vous, dans l'ordre chronologique */
export function getAgenda(): AgendaEvent[] {
  return [...OFFICIAL, ...PRESS].sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
}

const todayParis = (now: Date) => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(now)

/** À venir : pas encore terminé à la date du jour (heure de Paris) */
export function upcoming(now = new Date()): AgendaEvent[] {
  const today = todayParis(now)
  return getAgenda().filter((e) => (e.end ?? e.date) >= today)
}
export function past(now = new Date()): AgendaEvent[] {
  const today = todayParis(now)
  return getAgenda()
    .filter((e) => (e.end ?? e.date) < today)
    .reverse()
}

export const getAgendaEvent = (id: string) => getAgenda().find((e) => e.id === id)
