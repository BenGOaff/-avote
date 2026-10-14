import type { Metadata } from 'next'
import { recapFor, FIRST_DAY } from '@/lib/semaine-data'
import { weeksSince } from '@/lib/semaine'
import { UI_COPY } from '@/lib/copy'
import { rangeLabel, summaryOf, WeekView } from './WeekView'

const t = UI_COPY.semaine

// Semaine en cours : elle se remplit au fil des jours
export const revalidate = 3600

export function generateMetadata(): Metadata {
  const r = recapFor(weeksSince(FIRST_DAY, new Date())[0]!)
  return { title: t.metaTitle(rangeLabel(r)), description: t.metaDescription(summaryOf(r)), alternates: { canonical: '/semaine' } }
}

export default function SemainePage() {
  const weeks = weeksSince(FIRST_DAY, new Date())
  return <WeekView r={recapFor(weeks[0]!)} current prev={weeks[1]} />
}
