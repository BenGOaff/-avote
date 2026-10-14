import { getAgenda, KIND_LABEL, type AgendaEvent } from './agenda'
import { buildIcs, type IcsEvent } from './ics'
import { absolute } from './site'

const NAME = 'Présidentielle 2027 · Ça vote ?'

function toIcs(e: AgendaEvent): IcsEvent {
  const lines = [
    e.summary,
    e.computed ? 'Date calculée à partir de la règle officielle, à confirmer par le décret de convocation des électeurs.' : '',
    `Source : ${e.source.publisher}, ${e.source.url}`,
    `Les prochains rendez-vous : ${absolute('/agenda')}`,
  ]
  return {
    uid: `${e.id}@xn--avote-xra.fr`,
    title: `${KIND_LABEL[e.kind]} · ${e.title}`,
    date: e.date,
    end: e.end,
    time: e.time,
    description: lines.filter(Boolean).join('\n'),
    location: e.place,
    url: absolute(e.href ?? `/agenda#${e.id}`),
    alarms: e.alarms,
  }
}

/** Le calendrier complet, auquel on peut s'abonner */
export const agendaCalendar = (stamp: string) => buildIcs(getAgenda().map(toIcs), { name: NAME, stamp })
/** Un seul rendez-vous, à ajouter à son agenda */
export const eventCalendar = (e: AgendaEvent, stamp: string) => buildIcs([toIcs(e)], { name: NAME, stamp })
