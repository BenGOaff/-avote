import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Quel indécis es-tu ?',
  description: 'Un quiz rapide sur ta façon de suivre la campagne. Aucune question sur tes opinions politiques.',
  alternates: { canonical: '/quiz' },
}

const TIQUIZ_URL = process.env.NEXT_PUBLIC_TIQUIZ_URL

// Quiz Tiquiz : uniquement des questions sur les habitudes d'information (docs/TIQUIZ.md).
// Il ne doit contenir aucune question d'opinion politique : il collecte un email.
export default function QuizPage() {
  return (
    <div className="container">
      <PageHeader kicker="Quiz express" title="Quel indécis es-tu ?" lede="Huit questions sur ta façon de suivre la campagne. Aucune sur tes opinions." />
      {TIQUIZ_URL ? (
        <iframe
          src={TIQUIZ_URL}
          title="Quiz : quel indécis es-tu ?"
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ width: '100%', minHeight: '80vh', border: 'var(--border) solid var(--ink)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}
        />
      ) : (
        <p className="muted">Le quiz arrive bientôt.</p>
      )}
      <p className="small" style={{ marginTop: 'var(--s4)' }}>
        Pour comparer tes idées aux programmes, c’est l’autre test : <Link href="/test">le test complet</Link>, calculé sur ton appareil.
      </p>
    </div>
  )
}
