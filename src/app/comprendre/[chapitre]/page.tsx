import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment, type ReactNode } from 'react'
import { formatDate } from '@/components/Editorial'
import { ShortAnswer } from '@/components/ShortAnswer'
import { ShareButtons } from '@/components/ShareButtons'
import { UI_COPY } from '@/lib/copy'
import { CHAPITRES, COMPRENDRE_CHECKED, getChapitre, LECTURE, nbsp, SEANCE_SLUG } from '@/lib/comprendre'
import { absolute } from '@/lib/site'

const t = UI_COPY.comprendre

export const dynamicParams = false

export function generateStaticParams() {
  return CHAPITRES.map((c) => ({ chapitre: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ chapitre: string }> }): Promise<Metadata> {
  const { chapitre } = await params
  const c = getChapitre(chapitre)
  if (!c) return {}
  return {
    title: c.metaTitle,
    description: c.description,
    alternates: { canonical: `/comprendre/${c.slug}` },
    openGraph: { type: 'article', modifiedTime: COMPRENDRE_CHECKED },
  }
}

/** Les chemins du site cités dans le texte (« /lexique », « /test?rapide=1 ») deviennent des liens */
function linkify(text: string): ReactNode {
  const parts = text.split(/(\/[a-z0-9][a-z0-9/-]*(?:\?[a-z0-9=&]+)?)(?=[\s.,;:)»]|$)/g)
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <Link key={i} href={p}>
        {p}
      </Link>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}

export default async function ChapitrePage({ params }: { params: Promise<{ chapitre: string }> }) {
  const { chapitre } = await params
  const c = getChapitre(chapitre)
  if (!c) notFound()
  const url = absolute(`/comprendre/${c.slug}`)
  const i = CHAPITRES.findIndex((x) => x.slug === c.slug)
  const next = CHAPITRES[i + 1]
  const prev = CHAPITRES[i - 1]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: c.title,
        description: c.description,
        url,
        inLanguage: 'fr-FR',
        dateModified: COMPRENDRE_CHECKED,
        educationalLevel: 'lycée',
        citation: c.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: s.publisher })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.title, item: absolute('/comprendre') },
          { '@type': 'ListItem', position: 2, name: c.title, item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/comprendre">{t.title}</Link> · {c.slug === SEANCE_SLUG ? t.teachersKicker : t.chapter(LECTURE.findIndex((x) => x.slug === c.slug) + 1, LECTURE.length)}
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {nbsp(c.title)}
      </h1>
      <p className="lede measure">{nbsp(c.question)}</p>
      <ShortAnswer updated={t.checked(formatDate(COMPRENDRE_CHECKED))}>
        {c.short.map((p) => (
          <p key={p}>{linkify(p)}</p>
        ))}
      </ShortAnswer>
      <div className="measure">
        {c.sections.map((s) => (
          <section key={s.title} className="section" style={{ paddingTop: 0 }}>
            <h2 style={{ fontSize: 'var(--h3)' }}>{s.title}</h2>
            {s.paras.map((p) => (
              <p key={p}>{linkify(p)}</p>
            ))}
          </section>
        ))}

        {c.anecdotes.length > 0 && (
          <section className="section" aria-labelledby="anecdotes" style={{ paddingTop: 0 }}>
            <h2 id="anecdotes" style={{ fontSize: 'var(--h3)' }}>
              {t.anecdotes}
            </h2>
            <div className="stack">
              {c.anecdotes.map((a) => (
                <aside key={a.text} className="card card--flat">
                  <p style={{ marginTop: 0 }}>{a.text}</p>
                  <p className="small muted" style={{ marginBottom: 0 }}>
                    <a href={a.source.url} rel="noopener noreferrer" target="_blank">
                      {a.source.title}
                    </a>{' '}
                    ({a.source.publisher})
                  </p>
                </aside>
              ))}
            </div>
          </section>
        )}

        <details className="disclosure">
          <summary>{t.sources(c.sources.length)}</summary>
          <ul className="small">
            {c.sources.map((s, k) => (
              <li key={k}>
                <a href={s.url} rel="noopener noreferrer" target="_blank">
                  {s.title}
                </a>{' '}
                <span className="muted">({s.publisher})</span> · « {s.quote} »
              </li>
            ))}
          </ul>
        </details>

        <nav className="section row" aria-label={t.navLabel} style={{ justifyContent: 'space-between' }}>
          {prev ? <Link href={`/comprendre/${prev.slug}`}>← {nbsp(prev.title)}</Link> : <span />}
          {next ? <Link href={`/comprendre/${next.slug}`}>{nbsp(next.title)} →</Link> : <Link href="/comprendre">{t.backToIndex}</Link>}
        </nav>
      </div>

      {c.slug !== SEANCE_SLUG && (
        <section className="card section sujet__cta">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <Link href="/test?rapide=1" className="btn btn--primary">
            {t.ctaBtn}
          </Link>
        </section>
      )}
      <ShareButtons url={url} title={c.metaTitle} text={c.short[0]} />
      <p className="small muted section">
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/comprendre/${c.slug}`)}`}>Signaler une erreur</Link>
      </p>
    </div>
  )
}
