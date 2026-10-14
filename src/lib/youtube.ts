import 'server-only'
/**
 * Chaînes YouTube qui parlent politique (content/youtube/chaines.json) et leurs relevés hebdomadaires (stats.json, scripts/youtube.ts).
 * Uniquement des chiffres publics de YouTube : abonnés (arrondis par YouTube), vues, date de la dernière vidéo.
 * Aucun qualificatif éditorial ; le propriétaire n'est indiqué que s'il est établi par une source.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import list from '@content/youtube/chaines.json'
import stats from '@content/youtube/stats.json'
import fichesStore from '@content/youtube/fiches.json'
import { getMedias, orientationNuanceOf, type Orientation } from './medias'

export type YoutubeGroup = 'media' | 'createur' | 'verification' | 'candidat'
export const YOUTUBE_GROUPS: YoutubeGroup[] = ['media', 'createur', 'verification', 'candidat']

/** Une chaîne sans vidéo depuis ce nombre de jours est dite inactive */
export const INACTIVE_DAYS = 90
/** Seuil d'entrée hors candidats */
export const MIN_SUBSCRIBERS = 10000

interface Owner {
  text: string
  quote: string
  url: string
  publisher: string
  date?: string
}
export interface Polemique {
  date: string
  title: string
  text: string
  quote: string
  url: string
  publisher: string
}
interface Channel {
  id: string
  name: string
  group: YoutubeGroup
  handle?: string
  media?: string
  actor?: string
  owner?: Owner
}
interface Point {
  s: number | null
  v: number
  n: number
  last: string | null
}
type Snapshot = { date: string; channels: Record<string, Point> }

export interface YoutubeRow extends Channel {
  url: string
  subscribers: number | null
  views: number
  videos: number
  last: string | null
  active: boolean
  /** Vues sur les 30 derniers jours, ramenées à 30 jours ; null tant qu'un mois de relevés n'existe pas */
  viewsMonth: number | null
  /** Abonnés relevé après relevé, pour la courbe */
  history: number[]
  /** Date de création de la chaîne (YouTube) */
  created: string | null
  /** Image de la chaîne, servie par le site */
  avatar: string | null
  /** Orientation du média lié selon eurotopics, avec sa précision factuelle éventuelle */
  orientation: (Orientation & { nuance?: string }) | null
  /** Rappels à l'ordre de l'Arcom visant le média lié */
  arcom: number
  polemiques: Polemique[]
}

const channels = (list as { channels: Channel[] }).channels
const snapshots = (stats as unknown as { snapshots: Snapshot[] }).snapshots
const meta = ((stats as unknown as { meta?: Record<string, { created: string }> }).meta ?? {}) as Record<string, { created: string }>
const fiches = (fichesStore as unknown as { fiches: Record<string, { owner: Owner | null; polemiques: Polemique[] }> }).fiches
export const fichesCheckedAt = (fichesStore as { checkedAt: string }).checkedAt || null
const avatarOf = (id: string) => (existsSync(path.join(process.cwd(), 'public/img/youtube', `${id}.jpg`)) ? `/img/youtube/${id}.jpg` : null)

const DAY = 86400000
const days = (a: string, b: string) => (new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / DAY

export function getYoutube(): { date: string | null; since: string | null; rows: YoutubeRow[] } {
  const latest = snapshots.at(-1)
  if (!latest) return { date: null, since: null, rows: [] }
  // Le relevé le plus récent qui a au moins 28 jours de moins
  const base = [...snapshots].reverse().find((s) => days(s.date, latest.date) >= 28)
  const medias = new Map(getMedias().map((m) => [m.slug, m]))
  const rows = channels.flatMap((c): YoutubeRow[] => {
    const p = latest.channels[c.id]
    if (!p) return []
    const old = base?.channels[c.id]
    const media = c.media ? medias.get(c.media) : undefined
    const fiche = fiches[c.id]
    const span = base ? days(base.date, latest.date) : 0
    return [
      {
        ...c,
        url: c.handle ? `https://www.youtube.com/${c.handle}` : `https://www.youtube.com/channel/${c.id}`,
        subscribers: p.s,
        views: p.v,
        videos: p.n,
        last: p.last,
        active: !!p.last && days(p.last, latest.date) <= INACTIVE_DAYS,
        viewsMonth: old && span > 0 ? Math.max(0, Math.round(((p.v - old.v) * 30) / span)) : null,
        history: snapshots.map((s) => s.channels[c.id]?.s).filter((x): x is number => typeof x === 'number'),
        created: meta[c.id]?.created ?? null,
        avatar: avatarOf(c.id),
        orientation: media?.orientation ? { ...media.orientation, nuance: orientationNuanceOf(media.slug)?.text } : null,
        arcom: media?.alerts?.length ?? 0,
        owner: c.owner ?? fiche?.owner ?? undefined,
        polemiques: fiche?.polemiques ?? [],
      },
    ]
  })
  return { date: latest.date, since: snapshots[0]!.date, rows }
}

export const youtubeChannelCount = channels.filter((c) => c.group !== 'candidat').length
export const youtubeActorsWithChannel = new Set(channels.filter((c) => c.actor).map((c) => c.actor!))
