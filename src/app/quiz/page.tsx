import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { SupportLine } from '@/components/Support'
import { UI_COPY } from '@/lib/copy'
import { TIQUIZ_QUIZZES } from '@/lib/tiquiz'

export const metadata: Metadata = {
  title: 'Quiz présidentielle 2027',
  description: 'Des quiz courts sur la présidentielle 2027, à faire et à partager.',
  alternates: { canonical: '/quiz' },
}

export default function QuizHub() {
  return (
    <div className="container">
      <PageHeader kicker="Quiz" title="Joue, partage, compare" lede="Des quiz courts sur la présidentielle. Pour comparer tes idées aux programmes, le test complet reste sur ton appareil." />
      <ul className="grid grid--3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {TIQUIZ_QUIZZES.map((q, i) => (
          <li key={q.slug} className={`card${i === 0 ? ' card--featured' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            <p className="kicker" style={{ margin: 0 }}>
              Quiz{q.duration ? ` · ${q.duration}` : ''}
            </p>
            <h2 style={{ margin: 0, fontSize: 'var(--h3)' }}>
              <Link href={`/quiz/${q.slug}`}>{q.title}</Link>
            </h2>
            <p className="small" style={{ margin: 0 }}>
              {q.lede}
            </p>
            <Link className="btn btn--highlight btn--small" href={`/quiz/${q.slug}`} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
              {UI_COPY.quiz.play}
            </Link>
          </li>
        ))}
        <li className="card card--flat" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          <p className="kicker" style={{ margin: 0 }}>
            Le test complet
          </p>
          <h2 style={{ margin: 0, fontSize: 'var(--h3)' }}>
            <Link href="/test">Qu’est-ce qui compte pour toi ?</Link>
          </h2>
          <p className="small" style={{ margin: 0 }}>
            42 affirmations, puis les candidats proches de tes réponses, sources à l’appui.
          </p>
        </li>
      </ul>
      <SupportLine placement="quiz" made />
    </div>
  )
}
