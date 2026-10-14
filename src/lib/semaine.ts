/**
 * « La semaine de la présidentielle » : ce qui a bougé du lundi au dimanche (heure de Paris).
 * Fonctions pures, partagées par la page (/semaine) et par l'envoi de la lettre (scripts/semaine-email.ts) :
 * tout le monde reçoit le même récapitulatif, rien n'y dépend des réponses de quiconque.
 */

export interface Change {
  date: string
  actor: string
  item: string
  from: string
  to: string
}
export interface WeekIntox {
  id: string
  claim: string
  verdict: string
  date: string
}
export interface WeekCandidacy {
  slug: string
  name: string
  kind: 'nouvelle' | 'retrait'
  date: string
}
export interface WeekEvent {
  id: string
  title: string
  date: string
  end?: string
}

export interface WeekRecap {
  week: string
  start: string
  end: string
  /** Positions trouvées pour la première fois, puis positions qui ont changé, par candidat */
  added: { actor: string; count: number; themes: string[] }[]
  changed: { actor: string; count: number; themes: string[] }[]
  addedTotal: number
  changedTotal: number
  intox: WeekIntox[]
  candidacies: WeekCandidacy[]
  next: WeekEvent[]
  empty: boolean
}

const parisDay = (iso: string) => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date(iso))
const utcNoon = (d: string) => new Date(`${d}T12:00:00Z`)
const shift = (d: string, days: number) => {
  const x = utcNoon(d)
  x.setUTCDate(x.getUTCDate() + days)
  return x.toISOString().slice(0, 10)
}

/** Semaine ISO d'une date (AAAA-MM-JJ) : « 2026-W42 » */
export function weekOf(day: string): string {
  // Le jeudi de la semaine décide de l'année ; la semaine 1 contient le premier jeudi de janvier
  const thursday = shift(day, 3 - ((utcNoon(day).getUTCDay() + 6) % 7))
  const year = Number(thursday.slice(0, 4))
  const week = 1 + Math.floor((utcNoon(thursday).getTime() - utcNoon(`${year}-01-01`).getTime()) / 86400000 / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Lundi et dimanche d'une semaine ISO */
export function weekRange(week: string): { start: string; end: string } {
  const [y, w] = week.split('-W').map(Number) as [number, number]
  const jan4 = utcNoon(`${y}-01-04`)
  const monday1 = shift(`${y}-01-04`, -((jan4.getUTCDay() + 6) % 7))
  const start = shift(monday1, (w - 1) * 7)
  return { start, end: shift(start, 6) }
}

/** Semaine précédant la date donnée (celle qu'on récapitule le lundi matin) */
export const previousWeek = (now: Date) => weekOf(shift(parisDay(now.toISOString()), -7))

/** Semaines de `from` à la semaine de `now` incluse, la plus récente d'abord */
export function weeksSince(from: string, now: Date): string[] {
  const out: string[] = []
  const last = weekOf(parisDay(now.toISOString()))
  let w = weekOf(from)
  for (let i = 0; i < 80 && w <= last; i++) {
    out.push(w)
    w = weekOf(shift(weekRange(w).start, 7))
  }
  return out.reverse()
}

export function buildRecap(
  week: string,
  input: {
    changes: Change[]
    themeOf: (item: string) => string | undefined
    intox: WeekIntox[]
    candidacies: WeekCandidacy[]
    agenda: WeekEvent[]
  },
): WeekRecap {
  const { start, end } = weekRange(week)
  const inWeek = (iso: string) => {
    const d = iso.length > 10 ? parisDay(iso) : iso
    return d >= start && d <= end
  }
  const group = (list: Change[]) => {
    const by = new Map<string, Change[]>()
    for (const c of list) by.set(c.actor, [...(by.get(c.actor) ?? []), c])
    return [...by]
      .map(([actor, cs]) => ({ actor, count: new Set(cs.map((c) => c.item)).size, themes: [...new Set(cs.map((c) => input.themeOf(c.item)).filter((x): x is string => !!x))] }))
      .sort((a, b) => b.count - a.count || a.actor.localeCompare(b.actor))
  }
  const week_ = input.changes.filter((c) => inWeek(c.date) && c.from !== c.to)
  const added = group(week_.filter((c) => c.from === 'inconnue'))
  const changed = group(week_.filter((c) => c.from !== 'inconnue' && c.to !== 'inconnue'))
  const intox = input.intox.filter((x) => inWeek(x.date))
  const candidacies = input.candidacies.filter((c) => inWeek(c.date))
  const horizon = shift(end, 21)
  const next = input.agenda.filter((e) => (e.end ?? e.date) > end && e.date <= horizon).slice(0, 5)
  const addedTotal = added.reduce((n, a) => n + a.count, 0)
  const changedTotal = changed.reduce((n, a) => n + a.count, 0)
  return { week, start, end, added, changed, addedTotal, changedTotal, intox, candidacies, next, empty: addedTotal + changedTotal + intox.length + candidacies.length === 0 }
}
