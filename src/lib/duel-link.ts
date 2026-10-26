/**
 * Duel à distance : les réponses d'un joueur voyagent dans la partie « # » du lien (après le dièse).
 * Le navigateur n'envoie jamais cette partie au serveur : rien n'est reçu, rien n'est stocké.
 * La personne qui ouvre le lien répond aux mêmes questions ; la comparaison se fait sur son appareil.
 *
 * Format : d=<version>.<une lettre par question>.<prénom en base64url>
 * a…e : de « pas du tout d'accord » (−2) à « tout à fait d'accord » (+2) ; k : je ne sais pas ; s : pas de réponse.
 */
import type { Answer, Answers, Ordinal } from './engine/types'

const LETTERS = 'abcde'
const NAME_MAX = 24
/** « 0.3.0 » devient « 030 » : le point sert de séparateur dans le lien */
const tag = (version: string) => version.replace(/[^\w-]/g, '')

/** Version des questions + empreinte de leur liste : un lien fait sur d'autres questions est refusé, pas mal lu. */
export function linkVersion(items: readonly string[], version: string): string {
  let h = 5381
  for (const c of items.join(',')) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0
  return `${tag(version)}-${h.toString(36).slice(0, 4)}`
}

/** Garde lettres, espaces, apostrophes, tirets et points : un prénom ou un surnom, rien d'autre. */
export function cleanName(name: string): string {
  return name
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}' .-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
}

const toB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromB64 = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

function letter(a: Answer | undefined): string {
  if (a?.kind === 'value') return LETTERS[a.value + 2]!
  if (a?.kind === 'dontknow') return 'k'
  return 's'
}

export function encodeDuel(items: readonly string[], answers: Answers, name: string, version: string): string {
  return `d=${tag(version)}.${items.map((id) => letter(answers[id])).join('')}.${toB64(cleanName(name))}`
}

export interface DuelChallenge {
  name: string
  answers: Answers
}

/** Lit un lien de duel. Null si le lien est abîmé ou vient d'une autre version des questions. */
export function decodeDuel(hash: string, items: readonly string[], version: string): DuelChallenge | null {
  const m = /^#?d=([\w-]+)\.([a-eks]+)\.([\w-]*)$/.exec(hash.trim())
  if (!m || m[1] !== tag(version) || m[2]!.length !== items.length) return null
  const answers: Answers = {}
  items.forEach((id, i) => {
    const c = m[2]![i]!
    const v = LETTERS.indexOf(c)
    if (v >= 0) answers[id] = { kind: 'value', value: (v - 2) as Ordinal }
    else if (c === 'k') answers[id] = { kind: 'dontknow' }
  })
  if (!Object.values(answers).some((a) => a?.kind === 'value')) return null
  let name = ''
  try {
    name = cleanName(fromB64(m[3]!))
  } catch {
    name = ''
  }
  return { name, answers }
}
