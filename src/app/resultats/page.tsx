import type { Metadata } from 'next'
import { ResultsView, type ActorMedia } from './ResultsView'
import { SupportLine } from '@/components/Support'
import { DonateCard } from '@/components/Donate'
import { liveCorpus } from '@/lib/data'
import { portraitOf } from '@/lib/images'

export const metadata: Metadata = {
  title: 'Mes résultats',
  robots: { index: false, follow: false },
}

export default function ResultsPage() {
  // Portraits et formations préparés ici : le calcul, lui, reste entièrement dans le navigateur
  const media: Record<string, ActorMedia> = Object.fromEntries(liveCorpus.actors.map((a) => [a.slug, { portrait: portraitOf(a.slug), party: a.party ?? '' }]))
  return (
    <div className="container" style={{ paddingTop: 'var(--s5)' }}>
      <ResultsView media={media} />
      <DonateCard />
      <SupportLine placement="resultats" />
    </div>
  )
}
