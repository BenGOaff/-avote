/**
 * Fichiers d'agenda (.ics, RFC 5545) générés par le site : aucun compte, aucune donnée personnelle.
 * Le même fichier sert à l'ajout d'un rendez-vous et à l'abonnement au calendrier complet.
 */

export interface IcsEvent {
  uid: string
  title: string
  /** AAAA-MM-JJ : événement sur la journée entière ; avec `time`, heure de Paris */
  date: string
  /** Dernier jour inclus, pour un rendez-vous sur plusieurs jours */
  end?: string
  time?: string
  /** Durée en minutes quand l'heure est connue (2 h par défaut) */
  minutes?: number
  description?: string
  location?: string
  url?: string
  /** Rappels, en jours avant l'événement */
  alarms?: number[]
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Échappement des valeurs texte (RFC 5545 §3.3.11) */
export const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Lignes repliées à 75 octets au plus, sans couper un caractère UTF-8 (RFC 5545 §3.1) */
export function icsFold(line: string): string {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const out: string[] = []
  let cur = ''
  let size = 0
  for (const ch of line) {
    const n = enc.encode(ch).length
    if (size + n > (out.length ? 74 : 75)) {
      out.push(cur)
      cur = ''
      size = 0
    }
    cur += ch
    size += n
  }
  out.push(cur)
  return out.join('\r\n ')
}

const PARIS_TZ = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Paris',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
]

const day = (iso: string) => iso.replace(/-/g, '')
function nextDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
function addMinutes(date: string, time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const d = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), h, m + minutes))
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`
}

/** Calendrier complet ; `stamp` fixe DTSTAMP pour un fichier identique à chaque génération */
export function buildIcs(events: IcsEvent[], opts: { name: string; stamp: string }): string {
  const stamp = opts.stamp.replace(/[-:]/g, '').replace(/\.\d+/, '').slice(0, 15) + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ca vote//Agenda presidentielle 2027//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(opts.name)}`,
    'X-WR-TIMEZONE:Europe/Paris',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
  ]
  // Fuseau de Paris décrit dans le fichier : certains agendas (Outlook) l'exigent pour les heures
  if (events.some((e) => e.time)) lines.push(...PARIS_TZ)
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.uid}`, `DTSTAMP:${stamp}`)
    if (e.time) {
      lines.push(`DTSTART;TZID=Europe/Paris:${day(e.date)}T${e.time.replace(':', '')}00`, `DTEND;TZID=Europe/Paris:${addMinutes(e.date, e.time, e.minutes ?? 120)}`)
    } else {
      lines.push(`DTSTART;VALUE=DATE:${day(e.date)}`, `DTEND;VALUE=DATE:${day(nextDay(e.end ?? e.date))}`, 'TRANSP:TRANSPARENT')
    }
    lines.push(`SUMMARY:${icsEscape(e.title)}`)
    if (e.description) lines.push(`DESCRIPTION:${icsEscape(e.description)}`)
    if (e.location) lines.push(`LOCATION:${icsEscape(e.location)}`)
    if (e.url) lines.push(`URL:${e.url}`)
    for (const d of e.alarms ?? []) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(e.title)}`, `TRIGGER:-P${d}D`, 'END:VALARM')
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(icsFold).join('\r\n') + '\r\n'
}
