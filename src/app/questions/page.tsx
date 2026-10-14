import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { QUESTION_PAGES } from '@/lib/questions-candidats'
import { absolute } from '@/lib/site'
import { getSujets, propositionPath } from '@/lib/sujets'

const t = UI_COPY.questions

export const metadata: Metadata = {
  title: t.hubMetaTitle,
  description: t.hubDescription,
  alternates: { canonical: '/questions' },
}

export default function QuestionsPage() {
  const sujets = getSujets()
  const props = sujets.reduce((n, s) => n + s.items.length, 0)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.hubTitle,
    url: absolute('/questions'),
    itemListElement: QUESTION_PAGES.map((q, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: q.question,
      url: absolute(q.path),
    })),
  }
  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <PageHeader kicker={t.kicker} title={t.hubTitle} lede={t.hubLede} />
      <ul className="cs-list measure" role="list">
        {QUESTION_PAGES.map((q) => (
          <li key={q.path} className="card card--flat">
            <h2 className="cs-list__concept">
              <Link href={q.path}>{q.question}</Link>
            </h2>
            {q.description && (
              <p className="small muted" style={{ margin: 0 }}>
                {q.description}
              </p>
            )}
          </li>
        ))}
      </ul>

      <section className="section measure" aria-labelledby="pas-de-classement">
        <h2 id="pas-de-classement" style={{ fontSize: 'var(--h3)' }}>
          {t.notRankedTitle}
        </h2>
        {t.notRanked.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <section className="section" aria-labelledby="propositions">
        <h2 id="propositions" style={{ fontSize: 'var(--h3)' }}>
          {t.propsTitle}
        </h2>
        <p className="measure">{t.propsLede(props)}</p>
        {sujets.map((s) => (
          <details key={s.slug} className="sources measure">
            <summary>
              {s.theme.label} <span className="muted">({s.items.length})</span>
            </summary>
            <ul className="small">
              {s.items.map((r) => (
                <li key={r.item.id}>
                  <Link href={propositionPath(s.slug, r.item)}>{r.item.concept}</Link> <span className="muted">: {r.item.text}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </section>

      <section className="card section sujet__cta">
        <h2>{t.testTitle}</h2>
        <p>{t.testBody}</p>
        <Link href="/test" className="btn btn--primary">
          {t.testCta}
        </Link>
      </section>
    </div>
  )
}
