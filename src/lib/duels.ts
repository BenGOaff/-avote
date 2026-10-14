import 'server-only'
/**
 * Pages « X ou Y : ce qui les oppose » (/comparateur/<a>-vs-<b>). Même calcul que le duel entre amis (duelAgreement),
 * appliqué aux positions codées de deux candidats. Seules les positions nettes (une valeur sur l'échelle) comptent :
 * une position ambiguë ou absente n'est jamais comparée. Pas de page quand les données ne suffisent pas.
 */
import { getActiveActors, type AnnouncedActor } from './actors'
import { liveCorpus, questionnaire } from './data'
import { duelAgreement, type DuelResult } from './engine/scoring'
import type { Answers } from './engine/types'
import { actorUpdatedAt } from './sujets'

/** Positions connues minimum de chaque candidat, et positions nettes en commun minimum */
export const DUEL_MIN_KNOWN = 40
export const DUEL_MIN_COMMON = 20

export interface CandidateDuel {
  slug: string
  a: AnnouncedActor
  b: AnnouncedActor
  result: DuelResult
  updatedAt: string | null
}

/** Positions nettes d'un candidat, au format des réponses du test */
function answersOf(slug: string): Answers {
  const out: Answers = {}
  for (const [id, p] of Object.entries(liveCorpus.positions[slug] ?? {})) if ('value' in p) out[id] = { kind: 'value', value: p.value }
  return out
}
const knownOf = (slug: string) => Object.values(liveCorpus.positions[slug] ?? {}).filter((p) => !('missing' in p)).length

let cache: CandidateDuel[] | null = null

/** Tous les duels publiables ; le slug suit l'ordre alphabétique des deux candidats (une seule adresse par paire) */
export function getCandidateDuels(): CandidateDuel[] {
  if (cache) return cache
  const ids = questionnaire.items.filter((it) => !it.inactive).map((it) => it.id)
  const actors = getActiveActors()
    .filter((a) => knownOf(a.slug) >= DUEL_MIN_KNOWN)
    .sort((x, y) => x.slug.localeCompare(y.slug))
  const answers = new Map(actors.map((a) => [a.slug, answersOf(a.slug)]))
  const out: CandidateDuel[] = []
  actors.forEach((a, i) => {
    for (const b of actors.slice(i + 1)) {
      const result = duelAgreement(ids, answers.get(a.slug)!, answers.get(b.slug)!)
      if (result.both < DUEL_MIN_COMMON) continue
      const ua = actorUpdatedAt(a.slug)
      const ub = actorUpdatedAt(b.slug)
      out.push({ slug: `${a.slug}-vs-${b.slug}`, a, b, result, updatedAt: ua && ub ? (ua > ub ? ua : ub) : (ua ?? ub) })
    }
  })
  return (cache = out)
}

export const getCandidateDuel = (slug: string) => getCandidateDuels().find((d) => d.slug === slug)
export const duelsOf = (actorSlug: string) => getCandidateDuels().filter((d) => d.a.slug === actorSlug || d.b.slug === actorSlug)
