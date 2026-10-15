/**
 * Alertes « ton résultat peut bouger » : notification sur le téléphone et email, la même pour tout le monde.
 * Le serveur ne connaît aucune réponse. Il annonce ce qui a changé dans le corpus public (positions modifiées,
 * candidats entrés dans le test) ; c'est le téléphone qui compare avec les réponses gardées sur l'appareil
 * (public/sw.js), et la page de résultats qui recalcule.
 * Sans dépendance serveur : le robot (scripts/alertes.ts) et les tests utilisent exactement ces règles.
 */

export interface Change {
  date: string
  actor: string
  item: string
}

/** Curseur d'un canal : jusqu'où les changements ont été annoncés, et quels candidats étaient déjà dans le test. */
export interface Cursor {
  at: string
  actors: string[]
}
export interface AlertState {
  push: Cursor
  email: Cursor
}

export interface Digest {
  /** Changements de position annoncés, candidats encore dans le test seulement */
  changes: Change[]
  /** Candidats entrés dans le test depuis le curseur */
  fresh: string[]
  /** Nouveau curseur, à enregistrer une fois l'envoi fait */
  next: Cursor
}

/** Délai laissé au déploiement : un changement plus récent attend l'alerte suivante, le temps d'être en ligne. */
export const DEPLOY_DELAY_MS = 45 * 60 * 1000
/** Email : au moins ce nombre de changements, ou un candidat entré dans le test */
export const EMAIL_MIN_CHANGES = 10
/** Email : pas plus d'un tous les trois jours, et jamais le lundi (la lettre de la semaine en parle déjà) */
export const EMAIL_MIN_GAP_MS = 3 * 24 * 3600 * 1000

export function digest(cursor: Cursor, changes: Change[], actors: string[], now: Date): Digest {
  const since = Date.parse(cursor.at)
  const until = now.getTime() - DEPLOY_DELAY_MS
  const inTest = new Set(actors)
  const known = new Set(cursor.actors)
  return {
    changes: changes.filter((c) => {
      const t = Date.parse(c.date)
      return t > since && t <= until && inTest.has(c.actor)
    }),
    fresh: actors.filter((a) => !known.has(a)),
    next: { at: new Date(Math.max(since, until)).toISOString(), actors: [...actors] },
  }
}

export const worthPush = (d: Digest) => d.changes.length > 0 || d.fresh.length > 0

export function worthEmail(d: Digest, cursor: Cursor, now: Date): boolean {
  if (now.getUTCDay() === 1) return false
  if (now.getTime() - Date.parse(cursor.at) < EMAIL_MIN_GAP_MS) return false
  return d.fresh.length > 0 || d.changes.length >= EMAIL_MIN_CHANGES
}

/** Candidats touchés, du plus concerné au moins concerné */
export function touched(d: Digest): { actor: string; count: number }[] {
  const n = new Map<string, number>()
  for (const c of d.changes) n.set(c.actor, (n.get(c.actor) ?? 0) + 1)
  return [...n].map(([actor, count]) => ({ actor, count })).sort((a, b) => b.count - a.count || a.actor.localeCompare(b.actor))
}

/**
 * Contenu chiffré de la notification. Le téléphone y lit, pour chaque affirmation, les candidats dont la position
 * a changé, et compte ceux qui touchent ses propres réponses. Les textes viennent de copy.ts : {n} et {who} sont
 * remplacés sur l'appareil.
 */
export interface PushPayload {
  v: 1
  /** Nombre total de changements (la liste p peut être tronquée pour tenir dans une notification) */
  n: number
  names: Record<string, string>
  /** affirmation → candidats dont la position a changé */
  p: Record<string, string[]>
  fresh: string[]
  url: string
  text: { title: string; body: string; mineTitle: string; mineBody: string }
}

/** Taille utile d'une notification web : 4 ko chiffrés ; on garde de la marge. */
export const PAYLOAD_MAX_BYTES = 3000

export function pushPayload(d: Digest, name: (slug: string) => string, text: PushPayload['text'], url: string): PushPayload {
  const base: PushPayload = { v: 1, n: d.changes.length, names: {}, p: {}, fresh: d.fresh, url, text }
  for (const a of d.fresh) base.names[a] = name(a)
  const size = (x: unknown) => new TextEncoder().encode(JSON.stringify(x)).length
  for (const c of d.changes) {
    const p = { ...base.p, [c.item]: [...new Set([...(base.p[c.item] ?? []), c.actor])] }
    const names = { ...base.names, [c.actor]: name(c.actor) }
    if (size({ ...base, p, names }) > PAYLOAD_MAX_BYTES) break
    base.p = p
    base.names = names
  }
  return base
}

/** Liste lisible de noms : « A, B et 3 autres » */
export function who(names: string[], max = 3): string {
  if (names.length <= max) return names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names.at(-1)}` : (names[0] ?? '')
  const rest = names.length - max
  return `${names.slice(0, max).join(', ')} et ${rest} autre${rest > 1 ? 's' : ''}`
}
