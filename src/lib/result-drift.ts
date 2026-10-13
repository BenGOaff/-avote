/**
 * « Ton résultat a bougé » : au retour, ce qui a changé depuis le dernier résultat affiché sur cet appareil.
 * Calcul local, sur les réponses gardées sur l'appareil et le corpus public ; rien n'est envoyé.
 * Le classement est refait avec les règles du test (scoring.ts), mêmes options que la page de résultats.
 */
import { rankActors } from './engine/scoring'
import type { Corpus, QuestionSet } from './engine/types'
import { effectiveAnswers } from './answers'
import type { LocalVoterState } from './local-store'

export interface ResultDrift {
  /** Positions codées depuis le dernier résultat, sur des affirmations où tu as donné un avis */
  newPositions: number
  /** Candidats concernés par ces positions nouvelles (noms) */
  actors: string[]
  /** Premier du classement avant / maintenant (noms), quand les deux classements sont publiables */
  before: string | null
  now: string | null
  topChanged: boolean
}

export function resultDrift(state: LocalVoterState, set: QuestionSet, corpus: Corpus, quickItems: string[]): ResultDrift | null {
  const last = state.lastResult
  if (!last || last.corpusVersion === corpus.version) return null
  const since = Date.parse(last.at)
  if (Number.isNaN(since)) return null
  const answers = effectiveAnswers(state, set)
  const hidden = new Set(state.hiddenActors)
  const actors = corpus.actors.filter((a) => !hidden.has(a.slug))
  const name = new Map(actors.map((a) => [a.slug, a.name]))

  let newPositions = 0
  const touched = new Set<string>()
  for (const a of actors)
    for (const [item, p] of Object.entries(corpus.positions[a.slug] ?? {})) {
      if ('missing' in p || !p.codedAt || Date.parse(p.codedAt) <= since) continue
      if (answers[item]?.kind !== 'value') continue
      newPositions++
      touched.add(a.slug)
    }

  const ranking = rankActors(set, answers, actors, corpus.positions, {
    mode: state.priorities ? 'priorities' : 'global',
    priorities: state.priorities ?? undefined,
    essentials: state.essentials,
    quick: state.quick ? quickItems : undefined,
  })
  const nowTop = ranking.ranked ? ranking.entries[0]?.slug ?? null : null
  const beforeTop = last.top[0] ?? null
  const topChanged = !!nowTop && !!beforeTop && nowTop !== beforeTop
  if (newPositions === 0 && !topChanged) return null
  return {
    newPositions,
    actors: [...touched].map((s) => name.get(s) ?? s),
    before: beforeTop ? name.get(beforeTop) ?? corpus.actors.find((a) => a.slug === beforeTop)?.name ?? null : null,
    now: nowTop ? name.get(nowTop) ?? null : null,
    topChanged,
  }
}
