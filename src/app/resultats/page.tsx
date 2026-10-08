import type { Metadata } from 'next'
import { ResultsView } from './ResultsView'

export const metadata: Metadata = {
  title: 'Mes résultats',
  robots: { index: false, follow: false },
}

export default function ResultsPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--s5)' }}>
      <ResultsView />
    </div>
  )
}
