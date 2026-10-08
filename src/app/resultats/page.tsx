import type { Metadata } from 'next'
import { ResultsView } from './ResultsView'
import { SupportLine } from '@/components/Support'

export const metadata: Metadata = {
  title: 'Mes résultats',
  robots: { index: false, follow: false },
}

export default function ResultsPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--s5)' }}>
      <ResultsView />
      <SupportLine placement="resultats" />
    </div>
  )
}
