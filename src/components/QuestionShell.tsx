import type { ReactNode } from 'react'
import Link from 'next/link'
import { ShortAnswer } from '@/components/ShortAnswer'
import { ShareButtons } from '@/components/ShareButtons'
import { UI_COPY } from '@/lib/copy'
import { QUESTION_PAGES, type QuestionId } from '@/lib/questions-candidats'
import { absolute } from '@/lib/site'

const t = UI_COPY.questions

export interface QuestionSource {
  title: string
  publisher: string
  url: string
}

/**
 * Gabarit des pages « questions sur les candidats » (/questions/<page>) : la question telle qu'on la tape, la réponse courte,
 * le détail chiffré, la règle, les sources, puis les autres questions. Les données structurées reprennent la réponse courte mot pour mot.
 */
export function QuestionShell({
  id,
  short,
  shortText,
  updated,
  method,
  sources,
  children,
}: {
  id: QuestionId
  short: ReactNode
  /** La réponse courte en texte brut, pour les données structurées et le partage */
  shortText: string
  updated?: string
  method?: ReactNode
  sources: QuestionSource[]
  children: ReactNode
}) {
  const q = QUESTION_PAGES.find((x) => x.id === id)!
  const url = absolute(q.path)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url,
        inLanguage: 'fr-FR',
        mainEntity: [
          {
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: shortText },
          },
        ],
        citation: sources.map((s) => ({
          '@type': 'CreativeWork',
          name: s.title,
          url: s.url,
          publisher: s.publisher,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t.kicker,
            item: absolute('/questions'),
          },
          { '@type': 'ListItem', position: 2, name: q.question, item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <p className="kicker">
        <Link href="/questions">{t.kicker}</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {q.question}
      </h1>
      <ShortAnswer updated={updated}>{short}</ShortAnswer>
      {children}
      {method && (
        <section className="section measure" aria-labelledby="regle">
          <h2 id="regle" style={{ fontSize: 'var(--h3)' }}>
            {t.method}
          </h2>
          {method}
        </section>
      )}
      {sources.length > 0 && (
        <section className="measure" aria-labelledby="sources">
          <h2 id="sources" style={{ fontSize: 'var(--h3)' }}>
            {t.sources}
          </h2>
          <ul className="small">
            {sources.map((s) => (
              <li key={s.url + s.title}>
                <a href={s.url} rel="noopener noreferrer" target="_blank">
                  {s.title}
                </a>{' '}
                <span className="muted">({s.publisher})</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <nav className="section measure" aria-labelledby="autres-questions">
        <h2 id="autres-questions" style={{ fontSize: 'var(--h3)' }}>
          {t.others}
        </h2>
        <ul>
          {QUESTION_PAGES.filter((o) => o.id !== id).map((o) => (
            <li key={o.path}>
              <Link href={o.path}>{o.question}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="card section sujet__cta">
        <h2>{t.testTitle}</h2>
        <p>{t.testBody}</p>
        <Link href="/test" className="btn btn--primary">
          {t.testCta}
        </Link>
      </section>
      <ShareButtons url={url} title={q.metaTitle} text={shortText} />
      <p className="small muted section">
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(q.path)}`}>{t.error}</Link>
      </p>
    </div>
  )
}
