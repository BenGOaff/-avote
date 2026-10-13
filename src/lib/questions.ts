/**
 * Questionnaire seul, sans le corpus des candidats : à importer côté navigateur quand les positions ne servent pas
 * (test, studio, menu). Le corpus (lib/data.ts) pèse plus d'un mégaoctet : il ne doit partir qu'avec les pages qui calculent.
 */
import questionnaireJson from '@content/questionnaire/v0.3.0.json'
import rapideJson from '@content/questionnaire/rapide.json'
import type { QuestionSet } from './engine/types'

export const questionnaire = questionnaireJson as unknown as QuestionSet

export const itemsByTheme = (set: QuestionSet) =>
  set.themes.map((t) => ({ theme: t, items: set.items.filter((i) => i.theme === t.id && !i.inactive) }))

/** Affirmations de la version rapide (content/questionnaire/rapide.json). */
export const QUICK_ITEMS: string[] = (rapideJson as { items: string[] }).items
