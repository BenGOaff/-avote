import { UI_COPY } from './copy'
import type { Answer, Answers, Ordinal, Position, QuestionSet } from './engine/types'
import type { LocalVoterState } from './local-store'

export const ordinalLabel = (v: Ordinal): string => UI_COPY.test.scale[v + 2] ?? ''

export function answerLabel(a: Answer | undefined): string {
  if (!a) return 'Pas répondu'
  switch (a.kind) {
    case 'value':
      return ordinalLabel(a.value)
    case 'dontknow':
      return UI_COPY.test.dontKnow
    case 'skip':
      return 'Passée'
    case 'depends':
      return a.note ? `Cela dépend (${a.note})` : 'Cela dépend'
  }
}

export function positionLabel(p: Position | undefined): string {
  if (!p || 'missing' in p) return 'Position inconnue'
  if ('set' in p) return p.set.length === 1 ? ordinalLabel(p.set[0] as Ordinal) : `Entre « ${ordinalLabel(Math.min(...p.set) as Ordinal)} » et « ${ordinalLabel(Math.max(...p.set) as Ordinal)} »`
  return ordinalLabel(p.value)
}

/** Réponses encore valides pour la version actuelle des questions (une question qui change de sens est redemandée). */
export function effectiveAnswers(state: LocalVoterState | null, set: QuestionSet): Answers {
  if (!state) return {}
  const out: Answers = {}
  for (const it of set.items) {
    const a = state.answers[it.id]
    if (!a) continue
    const v = state.answeredVersions[it.id]
    if (v && v.split('.')[0] !== it.version.split('.')[0]) continue // changement majeur = nouveau sens
    out[it.id] = a
  }
  return out
}
