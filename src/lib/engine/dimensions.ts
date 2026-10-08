/**
 * Résumés descriptifs des réponses (cahier §5.2, §6).
 * Un indice est une position sur une échelle définie, jamais « 82 % de gauche ».
 */
import { ENGINE_CONFIG } from './config'
import type { Answers, QuestionSet } from './types'

export interface DimensionResult {
  id: string
  label: string
  low: string
  high: string
  definition: string
  /** 0..100 ou null si pas assez de réponses */
  index: number | null
  answered: number
  total: number
}

export function computeDimensions(set: QuestionSet, answers: Answers): DimensionResult[] {
  return set.dimensions.map((d) => {
    const items = set.items.filter((i) => !i.inactive && i.dimensions && d.id in i.dimensions)
    let sum = 0
    let answered = 0
    for (const it of items) {
      const a = answers[it.id]
      if (!a || a.kind !== 'value') continue
      const o = it.dimensions?.[d.id] ?? 1
      sum += o * a.value
      answered++
    }
    const enough = answered >= ENGINE_CONFIG.dimensions.minAnswered && items.length > 0 && answered / items.length >= ENGINE_CONFIG.dimensions.minShare
    // Moyenne de −2..+2 → 0..100
    const index = enough ? 50 + 25 * (sum / answered) : null
    return { id: d.id, label: d.label, low: d.low, high: d.high, definition: d.definition, index, answered, total: items.length }
  })
}
