import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Quel indécis es-tu ?',
  description: 'Le quiz rapide de Ça vote ? pour la présidentielle 2027.',
  alternates: { canonical: '/quiz' },
}

import { TIQUIZ_URL } from '@/lib/site'

// Quiz Tiquiz. Condition fixée par la rédaction : Tiquiz ne conserve ni les réponses ni le résultat
// liés à l'email ; seul un tag « quiz passé » est envoyé à Systeme.io.
export default function QuizPage() {
  return (
    <div className="container">
      <PageHeader kicker="Quiz express" title="Quel indécis es-tu ?" lede="La version courte, en quelques questions. Tes réponses ne sont pas gardées : seul ton email l’est, si tu choisis de le donner." />
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
        Données collectées par le quiz : <Link href="/donnees">qui les garde et pourquoi</Link>. Pour comparer tes idées aux programmes, c’est l’autre test : <Link href="/test">le test complet</Link>, calculé sur ton appareil.
      </p>
    </div>
  )
}
