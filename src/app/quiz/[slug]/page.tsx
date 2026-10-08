import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { SupportLine } from '@/components/Support'
import { UI_COPY } from '@/lib/copy'
import { getTiquiz, TIQUIZ_QUIZZES } from '@/lib/tiquiz'

export function generateStaticParams() {
  return TIQUIZ_QUIZZES.map((q) => ({ slug: q.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const q = getTiquiz((await params).slug)
  return q ? { title: q.title, description: q.lede, alternates: { canonical: `/quiz/${q.slug}` } } : {}
}

// Quiz Tiquiz. Condition fixée par la rédaction : Tiquiz ne conserve ni les réponses ni le résultat
// liés à l'email ; seul un tag « quiz passé » est envoyé à Systeme.io.
export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const q = getTiquiz((await params).slug)
  if (!q) notFound()
  return (
    <div className="container">
      <PageHeader kicker="Quiz" title={q.title} lede={`${q.lede} ${UI_COPY.quiz.data}`} />
      <iframe
        src={q.url}
        title={`Quiz : ${q.title}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{ width: '100%', minHeight: '80vh', border: 'var(--border) solid var(--ink)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}
      />
      <SupportLine placement={`quiz-${q.slug}`} made />
      <p className="small" style={{ marginTop: 'var(--s4)' }}>
        Données collectées par le quiz : <Link href="/donnees">qui les garde et pourquoi</Link>. Pour comparer tes idées aux programmes, c’est l’autre test :{' '}
        <Link href="/test">le test complet</Link>, calculé sur ton appareil. <Link href="/quiz">Tous les quiz</Link>
      </p>
    </div>
  )
}
