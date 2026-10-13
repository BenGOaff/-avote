/**
 * Données publiques versionnées : questionnaire et corpus.
 * Le client ne mélange jamais une version de questions et une version de positions (cahier §12).
 */
import demoJson from '@content/corpus/demo.json'
import liveJson from '@content/corpus/live.json'
import candidatures from '@content/acteurs/candidatures.json'
import type { Corpus, QuestionSet } from './engine/types'

import { questionnaire, itemsByTheme, QUICK_ITEMS } from './questions'

export { questionnaire, itemsByTheme, QUICK_ITEMS }
export const demoCorpus = demoJson as unknown as Corpus

/** Un candidat qui retire sa candidature sort aussitôt des calculs ; sa fiche reste consultable. */
const retired = new Set((candidatures.actors as { slug: string; status: string }[]).filter((a) => a.status === 'retire').map((a) => a.slug))
const live = liveJson as unknown as Corpus
export const liveCorpus: Corpus = { ...live, actors: live.actors.filter((a) => !retired.has(a.slug)) }

export function assertCompatible(set: QuestionSet, corpus: Corpus): boolean {
  return corpus.questionSet === set.version
}

