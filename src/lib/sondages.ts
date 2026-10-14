import 'server-only'
import data from '@content/sondages/sondages.json'
import { firstRoundSummary, latestPolls, secondRoundSummary, type Poll } from './sondages-stats'

export interface InstituteNote {
  text: string
  url: string
  publisher: string
}

const polls = (data.polls as Poll[]).slice().sort((a, b) => b.fieldEnd.localeCompare(a.fieldEnd) || b.published.localeCompare(a.published))

export const SONDAGES_CHECKED_AT = data.checkedAt

/** Sondages relevés, les plus récents d'abord ; les derniers de chaque institut ; ce qu'ils disent */
export function getSondages() {
  const latest = latestPolls(polls)
  return {
    all: polls,
    latest,
    older: polls.filter((p) => !latest.includes(p)),
    first: firstRoundSummary(latest),
    second: secondRoundSummary(latest),
  }
}

/** Ce qu'on sait, sourcé, de la méthode habituelle d'un institut */
export const instituteNote = (name: string): InstituteNote | undefined => (data.institutes as Record<string, InstituteNote>)[name]
