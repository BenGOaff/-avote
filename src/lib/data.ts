/**
 * Données publiques versionnées : questionnaire et corpus.
 * Le client ne mélange jamais une version de questions et une version de positions (cahier §12).
 */
import demoJson from '@content/corpus/demo.json'
import liveJson from '@content/corpus/live.json'
import candidatures from '@content/acteurs/candidatures.json'
import archives from '@content/corpus/archives.json'
import type { Corpus, QuestionSet } from './engine/types'

import { questionnaire, itemsByTheme, QUICK_ITEMS } from './questions'

export { questionnaire, itemsByTheme, QUICK_ITEMS }
export const demoCorpus = demoJson as unknown as Corpus

/** Un candidat qui retire sa candidature sort aussitôt des calculs ; sa fiche reste consultable. */
const retired = new Set((candidatures.actors as { slug: string; status: string }[]).filter((a) => a.status === 'retire').map((a) => a.slug))
const live = liveJson as unknown as Corpus
/** Copie archivée d'une source, retenue seulement si le passage cité y a été retrouvé (scripts/archives.ts) */
const archived = archives.pages as Record<string, { archive?: string }>
export const liveCorpus: Corpus = {
  ...live,
  actors: live.actors.filter((a) => !retired.has(a.slug)),
  sources: live.sources?.map((s) => (s.url && archived[s.url]?.archive ? { ...s, archive: archived[s.url]!.archive } : s)),
}

export function assertCompatible(set: QuestionSet, corpus: Corpus): boolean {
  return corpus.questionSet === set.version
}

