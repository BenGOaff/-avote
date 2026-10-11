/** Résultat des quiz flash, calculé dans le navigateur (sans dépendance de validation). */
import type { FlashQuiz } from './flash'

export interface FlashResult {
  /** Identifiant court, pour le nom du fichier image */
  id: string
  /** Petite ligne au-dessus du résultat (« Tu es ») */
  kicker?: string
  /** Le résultat en très grand : « 72 % », « 8/10 », « Bercy » */
  big: string
  /** Surligné sous le résultat : la tribu, l'unité */
  label?: string
  headline: string
  line: string
}

const fill = (text: string, v: Record<string, string | number>) => text.replace(/\{(\w)\}/g, (m, k: string) => String(v[k] ?? m))

export function flashResult(q: FlashQuiz, picks: number[]): FlashResult {
  const n = q.questions.length
  if (q.mode === 'profil') {
    const counts = new Map<string, number>()
    picks.forEach((p, i) => {
      const o = q.questions[i]?.answers[p]?.outcome
      if (o) counts.set(o, (counts.get(o) ?? 0) + 1)
    })
    // En cas d'égalité, le premier résultat déclaré l'emporte : même réponses, même résultat
    const outcomes = q.outcomes ?? []
    const best = outcomes.reduce((a, b) => ((counts.get(b.key) ?? 0) > (counts.get(a.key) ?? 0) ? b : a), outcomes[0]!)
    return { id: best.key, kicker: 'Tu es', big: best.name, headline: best.headline, line: best.line }
  }
  const c = q.mode === 'connaissances' ? picks.filter((p, i) => q.questions[i]?.answers[p]?.correct).length : 0
  const s =
    q.mode === 'connaissances'
      ? Math.round((c / n) * 100)
      : Math.round((picks.reduce((t, p, i) => t + (q.questions[i]?.answers[p]?.points ?? 0), 0) / (n * 2)) * 100)
  const tiers = q.tiers ?? []
  const tier = tiers.find((t) => s <= t.upTo) ?? tiers[tiers.length - 1]!
  const v = { s, c, n }
  return {
    id: q.mode === 'connaissances' ? `${c}-sur-${n}` : String(s),
    big: q.mode === 'connaissances' ? `${c}/${n}` : `${s}\u00a0%`,
    label: q.tribe,
    headline: fill(tier.headline, v),
    line: fill(tier.line, v),
  }
}
