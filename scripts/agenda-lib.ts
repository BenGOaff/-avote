/**
 * Agenda : ajout automatique des rendez-vous repérés par la veille (content/agenda/agenda.json).
 * Un rendez-vous n'entre que si la phrase citée est dans la source ET donne elle-même le jour et le mois :
 * aucune date déduite, aucune date « vers la fin du mois ».
 */
import { quoteIsInSource, slugify, type RawItem } from './veille-lib'

export const AGENDA_KINDS = ['parti', 'debat', 'meeting', 'institution', 'campagne'] as const
export type FoundKind = (typeof AGENDA_KINDS)[number]

export interface FoundEvent {
  title: string
  kind: FoundKind
  date: string
  end: string
  time: string
  summary: string
  who: string[]
  place: string
  itemId: string
  quote: string
}

export interface StoredEvent {
  id: string
  kind: string
  title: string
  date: string
  end?: string
  time?: string
  summary: string
  who?: string[]
  place?: string
  source: { title: string; publisher: string; url: string }
  quote: string
  addedBy: string
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const LAST_DAY = '2027-05-02'

const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T12:00:00Z`).getTime()) && new Date(`${s}T12:00:00Z`).toISOString().startsWith(s)

/** La phrase doit écrire le jour (« 13 », « 1er ») et le mois en toutes lettres, ou une date chiffrée 13/12 */
export function quoteStatesDate(quote: string, iso: string): boolean {
  const q = quote.toLowerCase().replace(/ /g, ' ')
  const day = Number(iso.slice(8, 10))
  const month = MONTHS[Number(iso.slice(5, 7)) - 1]!
  const dayRe = day === 1 ? '(?:1er|premier|1)' : String(day)
  if (new RegExp(`(?:^|[^\\d])${dayRe}(?:\\s+(?:au|et|-|–)\\s+\\d{1,2}(?:er)?)?\\s+${month}`).test(q)) return true
  if (new RegExp(`(?:^|[^\\d])0?${day}/0?${Number(iso.slice(5, 7))}(?:[^\\d]|$)`).test(q)) return true
  // « du 10 au 13 décembre » : le premier jour précède le second, le mois n'est écrit qu'une fois
  return new RegExp(`(?:^|[^\\d])${dayRe}\\s+(?:au|et|-|–)\\s+\\d{1,2}(?:er)?\\s+${month}`).test(q)
}

export function applyAgendaEvents(
  file: { updatedAt: string; events: StoredEvent[] },
  found: FoundEvent[],
  byId: Map<string, RawItem>,
  knownActors: Map<string, string>,
  now: Date,
  addedBy: string,
): { added: string[]; rejected: string[] } {
  const today = now.toISOString().slice(0, 10)
  const added: string[] = []
  const rejected: string[] = []
  for (const f of found) {
    const item = byId.get(f.itemId)
    const why = (r: string) => rejected.push(`${r} : ${f.title}`)
    if (!item) {
      why('source inconnue')
      continue
    }
    if (!AGENDA_KINDS.includes(f.kind)) {
      why('type refusé')
      continue
    }
    if (!validDate(f.date) || f.date < today || f.date > LAST_DAY) {
      why('date hors période')
      continue
    }
    const end = f.end && f.end !== f.date ? f.end : ''
    if (end && (!validDate(end) || end < f.date || end > LAST_DAY)) {
      why('date de fin invalide')
      continue
    }
    if (!quoteIsInSource(f.quote, `${item.title}. ${item.summary}`)) {
      why('citation introuvable')
      continue
    }
    if (!quoteStatesDate(f.quote, end || f.date) || (end && !new RegExp(`(?:^|[^\\d])${Number(f.date.slice(8, 10))}(?:er)?(?:[^\\d]|$)`).test(f.quote))) {
      why('la citation ne donne pas la date')
      continue
    }
    const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(f.time) ? f.time : ''
    const id = `${f.date}-${slugify(f.title, 48)}`
    if (file.events.some((e) => e.id === id || (e.date === f.date && e.kind === f.kind && e.source.url === item.link))) continue
    const who = [...new Set(f.who.map((n) => knownActors.get(slugify(n, 80))).filter((s): s is string => !!s))]
    file.events.push({
      id,
      kind: f.kind,
      title: f.title.trim().slice(0, 100),
      date: f.date,
      ...(end ? { end } : {}),
      ...(time ? { time } : {}),
      summary: f.summary.trim().slice(0, 280),
      ...(who.length ? { who } : {}),
      ...(f.place.trim() ? { place: f.place.trim().slice(0, 80) } : {}),
      source: { title: item.title, publisher: item.feedName, url: item.link },
      quote: f.quote.trim(),
      addedBy,
    })
    added.push(`${f.date} ${f.title}`)
  }
  if (added.length) {
    file.events.sort((a, b) => a.date.localeCompare(b.date))
    file.updatedAt = today
  }
  return { added, rejected }
}
