/**
 * Données publiques versionnées : questionnaire et corpus.
 * Le client ne mélange jamais une version de questions et une version de positions (cahier §12).
 */
import questionnaireJson from '@content/questionnaire/v0.3.0.json'
import demoJson from '@content/corpus/demo.json'
import liveJson from '@content/corpus/live.json'
import candidatures from '@content/acteurs/candidatures.json'
import type { Corpus, QuestionSet } from './engine/types'

export const questionnaire = questionnaireJson as unknown as QuestionSet
export const demoCorpus = demoJson as unknown as Corpus

/** Un candidat qui retire sa candidature sort aussitôt des calculs ; sa fiche reste consultable. */
const retired = new Set((candidatures.actors as { slug: string; status: string }[]).filter((a) => a.status === 'retire').map((a) => a.slug))
const live = liveJson as unknown as Corpus
export const liveCorpus: Corpus = { ...live, actors: live.actors.filter((a) => !retired.has(a.slug)) }

export function assertCompatible(set: QuestionSet, corpus: Corpus): boolean {
  return corpus.questionSet === set.version
}

export const itemsByTheme = (set: QuestionSet) =>
  set.themes.map((t) => ({ theme: t, items: set.items.filter((i) => i.theme === t.id && !i.inactive) }))

/** Affirmations de la version rapide (content/questionnaire/rapide.json). */
import rapideJson from '@content/questionnaire/rapide.json'
export const QUICK_ITEMS: string[] = (rapideJson as { items: string[] }).items
