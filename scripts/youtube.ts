/**
 * Relevé hebdomadaire des chaînes YouTube suivies (content/youtube/chaines.json) : abonnés, vues totales, nombre de vidéos,
 * date de la dernière vidéo. Source : API YouTube Data v3 (clé YOUTUBE_API_KEY). Écrit un relevé daté dans content/youtube/stats.json.
 * Coût : environ 2 + 1 unité par chaîne sur un quota gratuit de 10 000 par jour. Aucun appel à un modèle d'IA.
 *
 *   YOUTUBE_API_KEY=… npx tsx scripts/youtube.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LIST = path.join(ROOT, 'content/youtube/chaines.json')
const STATS = path.join(ROOT, 'content/youtube/stats.json')
const KEY = process.env.YOUTUBE_API_KEY
/** Environ deux ans de relevés hebdomadaires */
const MAX_SNAPSHOTS = 110

interface Snapshot {
  date: string
  channels: Record<string, { s: number | null; v: number; n: number; last: string | null }>
}

async function api(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('key', KEY!)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${endpoint} : HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  return res.json() as Promise<{ items?: unknown[] }>
}

async function main() {
  if (!KEY) throw new Error('YOUTUBE_API_KEY manquante')
  const list = JSON.parse(readFileSync(LIST, 'utf8')) as { channels: { id: string; name: string }[] }
  const store = JSON.parse(readFileSync(STATS, 'utf8')) as { _note: string; snapshots: Snapshot[] }
  const date = new Date().toISOString().slice(0, 10)
  const snap: Snapshot = { date, channels: {} }
  const uploads = new Map<string, string>()

  const ids = list.channels.map((c) => c.id)
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const res = await api('channels', { part: 'statistics,contentDetails', id: batch.join(','), maxResults: '50' })
    for (const it of (res.items ?? []) as {
      id: string
      statistics: { subscriberCount?: string; hiddenSubscriberCount?: boolean; viewCount: string; videoCount: string }
      contentDetails: { relatedPlaylists: { uploads?: string } }
    }[]) {
      const st = it.statistics
      snap.channels[it.id] = {
        s: st.hiddenSubscriberCount || st.subscriberCount === undefined ? null : Number(st.subscriberCount),
        v: Number(st.viewCount),
        n: Number(st.videoCount),
        last: null,
      }
      if (it.contentDetails.relatedPlaylists.uploads) uploads.set(it.id, it.contentDetails.relatedPlaylists.uploads)
    }
  }

  // Date de la dernière vidéo publiée : premier élément de la liste des mises en ligne
  for (const [id, playlist] of uploads) {
    try {
      const res = await api('playlistItems', { part: 'contentDetails', playlistId: playlist, maxResults: '1' })
      const item = (res.items ?? [])[0] as { contentDetails?: { videoPublishedAt?: string } } | undefined
      snap.channels[id]!.last = item?.contentDetails?.videoPublishedAt?.slice(0, 10) ?? null
    } catch (e) {
      console.warn(`dernière vidéo introuvable pour ${id} : ${(e as Error).message}`)
    }
  }

  const missing = list.channels.filter((c) => !snap.channels[c.id])
  for (const c of missing) console.warn(`chaîne introuvable : ${c.name} (${c.id})`)

  store.snapshots = [...store.snapshots.filter((s) => s.date !== date), snap].sort((a, b) => a.date.localeCompare(b.date)).slice(-MAX_SNAPSHOTS)
  writeFileSync(STATS, JSON.stringify(store, null, 1) + '\n')
  console.log(`${Object.keys(snap.channels).length} chaînes relevées le ${date}, ${missing.length} introuvables`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
