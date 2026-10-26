/**
 * Copies archivées des sources du référentiel (archive.org), pour qu'une citation reste vérifiable si la page change
 * ou disparaît. Pour chaque source avec un passage cité :
 *   1. on cherche une copie existante (API « available ») ; à défaut, on en demande une (« Save Page Now ») ;
 *   2. on retélécharge la copie et on vérifie que le passage y figure mot pour mot ;
 *   3. seule une copie vérifiée est retenue (content/corpus/archives.json). Une copie sans le passage est notée et retentée 30 jours plus tard ; une panne réseau n'est pas notée.
 * Les vidéos (passage tiré de la transcription) ne sont pas traitées : la page archivée ne contient pas la phrase.
 *
 * Usage : npx tsx scripts/archives.ts [--limit=60]
 * ARCHIVE_ORG_AUTH (facultatif) = « clé:secret » d'un compte archive.org, pour un débit plus élevé.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { canonicalUrl, quoteIsInSource } from './veille-lib'
import { fetchText } from './web-lib'

const LIVE = 'content/corpus/live.json'
const FILE = 'content/corpus/archives.json'
const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.slice(8) ?? 60)
const RETRY_DAYS = 30
const PAUSE_MS = 5_000
const UA = 'Mozilla/5.0 (compatible; CaVoteArchives/1.0; +https://xn--avote-xra.fr/methodologie)'
const AUTH = process.env.ARCHIVE_ORG_AUTH

type Entry = { archive: string; at: string } | { tried: string; reason: string }
interface Archives {
  _note: string
  pages: Record<string, Entry>
}

const today = () => new Date().toISOString().slice(0, 10)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const isVideo = (u: string) => /(^|\.)(youtube\.com|youtu\.be|dailymotion\.com|vimeo\.com|tiktok\.com)$/i.test(new URL(u).hostname)

class RateLimited extends Error {}

async function get(url: string, timeout = 60_000): Promise<Response> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, ...(AUTH ? { Authorization: `LOW ${AUTH}` } : {}) },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  })
  if (res.status === 429) throw new RateLimited(url)
  return res
}

/** Adresse brute d'une copie (sans le bandeau d'archive.org) : https://web.archive.org/web/<horodatage>id_/<url> */
const rawSnapshot = (snapshot: string) => snapshot.replace(/\/web\/(\d{14})\//, '/web/$1id_/')

async function existing(url: string): Promise<string | null> {
  const res = await get(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}&timestamp=${today().replace(/-/g, '')}`)
  if (!res.ok) return null
  const j = (await res.json()) as { archived_snapshots?: { closest?: { available?: boolean; url?: string; status?: string } } }
  const c = j.archived_snapshots?.closest
  return c?.available && c.status === '200' && c.url ? c.url.replace(/^http:/, 'https:') : null
}

async function save(url: string): Promise<string | null> {
  const res = await get(`https://web.archive.org/save/${url}`, 120_000)
  const loc = res.headers.get('content-location')
  if (loc?.startsWith('/web/')) return `https://web.archive.org${loc}`
  return /\/web\/\d{14}\//.test(res.url) ? res.url : null
}

async function holds(snapshot: string, passage: string): Promise<boolean> {
  const text = await fetchText(rawSnapshot(snapshot))
  return !!text && quoteIsInSource(passage, text)
}

async function main() {
  const live = JSON.parse(readFileSync(LIVE, 'utf8')) as { sources?: { url: string | null; passage?: string }[] }
  const data: Archives = JSON.parse(readFileSync(FILE, 'utf8'))
  const cutoff = new Date(Date.now() - RETRY_DAYS * 86_400_000).toISOString().slice(0, 10)

  // Clé = adresse telle qu'enregistrée dans le référentiel (le site la retrouve sans transformation)
  const todo = new Map<string, { url: string; passage: string }>()
  for (const s of live.sources ?? []) {
    const url = s.url && canonicalUrl(s.url)
    if (!s.url || !url || !s.passage || s.passage.trim().length < 12 || isVideo(url) || todo.has(s.url)) continue
    const e = data.pages[s.url]
    if (e && ('archive' in e || e.tried > cutoff)) continue
    todo.set(s.url, { url, passage: s.passage })
  }
  console.log(`${todo.size} source(s) sans copie vérifiée ; ${Math.min(LIMIT, todo.size)} traitée(s) ce passage.`)

  let ok = 0
  let ko = 0
  let errors = 0
  try {
    for (const [key, { url, passage }] of [...todo].slice(0, LIMIT)) {
      // Une copie trouvée mais sans le passage est un échec noté ; une panne réseau n'est pas notée (retentée au prochain passage)
      let sawCopy = false
      let snap: string | null = null
      try {
        const old = await existing(url)
        if (old) {
          sawCopy = true
          if (await holds(old, passage)) snap = old
        }
        if (!snap) {
          await sleep(PAUSE_MS)
          const fresh = await save(url)
          if (fresh) {
            sawCopy = true
            if (await holds(fresh, passage)) snap = fresh
          }
        }
      } catch (e) {
        if (e instanceof RateLimited) throw e
        console.warn(`… ${url} : ${(e as Error).message}`)
      }
      if (snap) {
        data.pages[key] = { archive: snap, at: today() }
        ok++
        errors = 0
        console.log(`✓ ${url}`)
      } else if (sawCopy) {
        data.pages[key] = { tried: today(), reason: 'passage introuvable dans la copie' }
        ko++
        errors = 0
        console.log(`✗ ${url}`)
      } else if (++errors >= 5) {
        console.warn('archive.org ne répond pas : arrêt du passage, la suite au prochain.')
        break
      }
      await sleep(PAUSE_MS)
    }
  } catch (e) {
    if (!(e instanceof RateLimited)) throw e
    console.warn('archive.org limite le débit : arrêt du passage, la suite au prochain.')
  }

  data.pages = Object.fromEntries(Object.entries(data.pages).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(FILE, JSON.stringify(data, null, 1) + '\n')
  console.log(`${ok} copie(s) vérifiée(s), ${ko} échec(s).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
