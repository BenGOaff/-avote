import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { recapFor, FIRST_DAY } from '@/lib/semaine-data'
import { weeksSince } from '@/lib/semaine'
import { UI_COPY } from '@/lib/copy'
import { rangeLabel, summaryOf, WeekView } from '../WeekView'

const t = UI_COPY.semaine

export const revalidate = 3600

/** Les semaines terminées ; la semaine en cours vit sur /semaine */
export function generateStaticParams() {
  return weeksSince(FIRST_DAY, new Date())
    .slice(1)
    .map((week) => ({ week }))
}

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }): Promise<Metadata> {
  const { week } = await params
  if (!/^\d{4}-W\d{2}$/.test(week)) return {}
  const r = recapFor(week)
  return { title: t.metaTitle(rangeLabel(r)), description: t.metaDescription(summaryOf(r)), alternates: { canonical: `/semaine/${week}` } }
}

export default async function WeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params
  const weeks = weeksSince(FIRST_DAY, new Date())
  const i = weeks.indexOf(week)
  // Semaine en cours ou inconnue : pas de page d'archive (la semaine en cours est sur /semaine)
  if (i < 1) notFound()
  return <WeekView r={recapFor(week)} current={false} prev={weeks[i + 1]} next={i === 1 ? undefined : weeks[i - 1]} />
}
