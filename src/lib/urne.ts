/**
 * L'urne, côté serveur. Deux registres jamais reliés, dans une base Supabase (UE) inaccessible directement :
 * - les empreintes : HMAC(secret, adresse IP + scrutin), pour refuser un second bulletin ; l'adresse n'est jamais écrite ;
 * - les compteurs : un total par choix, sans date ni empreinte.
 * Les deux écritures passent par deux appels distincts : aucun message ne porte à la fois une empreinte et un choix.
 */
import 'server-only'
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { getAnnouncedActors } from './actors'
import { BLANK, POW_BITS, URNE_ELECTION, leadingZeroBits } from './urne-shared'

const env = () => {
  const url = process.env.URNE_SUPABASE_URL
  const key = process.env.URNE_SUPABASE_KEY
  const token = process.env.URNE_TOKEN
  const secret = process.env.URNE_SECRET
  if (!url || !key || !token || !secret || secret.length < 32) return null
  return { url, key, token, secret }
}
export const urneReady = () => env() !== null

/** Choix valides : candidatures annoncées et vérifiées, plus le vote blanc. */
export function urneChoices(): { slug: string; name: string; party?: string }[] {
  return getAnnouncedActors()
    .filter((a) => a.status === 'declare' || a.status === 'demarche')
    .map((a) => ({ slug: a.slug, name: a.name, ...(a.party ? { party: a.party } : {}) }))
}
export const isChoice = (c: string) => c === BLANK || urneChoices().some((a) => a.slug === c)

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const e = env()
  if (!e) throw new Error('urne non configurée')
  const res = await fetch(`${e.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: e.key, Authorization: `Bearer ${e.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: e.token, ...args }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`urne ${fn} : ${res.status}`)
  return (await res.json()) as T
}

/** Empreinte non réversible de la connexion pour ce scrutin. */
export function fingerprint(ip: string): string {
  return createHmac('sha256', env()!.secret).update(`${URNE_ELECTION}|${ip}`).digest('hex')
}

/** Réserve le bulletin de cette connexion : false si elle a déjà voté. */
export const claim = (fp: string) => rpc<boolean>('urne_claim', { p_fingerprint: fp })
/** Ajoute une voix au choix. */
export const cast = (choice: string) => rpc<null>('urne_cast', { p_choice: choice })

let cache: { at: number; totals: { choice: string; votes: number }[] } | null = null
/** Totaux, gardés une minute en mémoire. */
export async function totals(): Promise<{ choice: string; votes: number }[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.totals
  const rows = await rpc<{ choice: string; votes: number | string }[]>('urne_totals', {})
  cache = { at: Date.now(), totals: rows.map((r) => ({ choice: r.choice, votes: Number(r.votes) })) }
  return cache.totals
}
export const invalidateTotals = () => {
  cache = null
}

// ---------------------------------------------------------------------------
// Preuve de travail (anti-robots, sans service tiers)
// ---------------------------------------------------------------------------

const CHALLENGE_TTL = 10 * 60 * 1000
const used = new Map<string, number>()

const sign = (payload: string) => createHmac('sha256', env()!.secret).update(`pow|${payload}`).digest('base64url')

/** Défi signé : le navigateur doit trouver un nombre qui donne une empreinte commençant par POW_BITS bits nuls. */
export function newChallenge(): { challenge: string; bits: number } {
  const payload = `${Date.now() + CHALLENGE_TTL}.${randomBytes(12).toString('base64url')}`
  return { challenge: `${payload}.${sign(payload)}`, bits: POW_BITS }
}

/** Vérifie la signature, la fraîcheur, l'usage unique et le travail fourni. */
export function checkWork(challenge: string, nonce: string): boolean {
  const parts = challenge.split('.')
  if (parts.length !== 3 || !/^\d{1,20}$/.test(nonce)) return false
  const [exp, rand, mac] = parts as [string, string, string]
  const expected = Buffer.from(sign(`${exp}.${rand}`))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false
  const now = Date.now()
  if (!(Number(exp) > now)) return false
  for (const [k, t] of used) if (t < now) used.delete(k)
  if (used.has(challenge)) return false
  const digest = createHash('sha256').update(`${challenge}:${nonce}`).digest()
  if (leadingZeroBits(new Uint8Array(digest)) < POW_BITS) return false
  used.set(challenge, Number(exp))
  return true
}
