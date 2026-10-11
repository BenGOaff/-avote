/** Calcul du score des quiz flash, côté navigateur (sans dépendance de validation). */
import type { FlashQuiz } from './flash'

export const flashScore = (q: FlashQuiz, picks: number[]) => {
  const max = q.questions.length * 2
  const got = picks.reduce((n, p, i) => n + (q.questions[i]?.answers[p]?.points ?? 0), 0)
  return Math.round((got / max) * 100)
}

export const flashTier = (q: FlashQuiz, score: number) => q.tiers.find((t) => score <= t.upTo) ?? q.tiers[q.tiers.length - 1]!
export const fillScore = (text: string, score: number) => text.replace(/\{s\}/g, String(score))
