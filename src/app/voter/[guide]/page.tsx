import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShortAnswer } from '@/components/ShortAnswer'
import { ShareButtons } from '@/components/ShareButtons'
import { UI_COPY } from '@/lib/copy'
import { getGuide, GUIDES } from '@/lib/guides'
import { absolute } from '@/lib/site'

const t = UI_COPY.guides

export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((g) => ({ guide: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ guide: string }> }): Promise<Metadata> {
  const { guide } = await params
  const g = getGuide(guide)
  if (!g) return {}
  return {
    title: g.metaTitle,
    description: g.description,
    alternates: { canonical: `/voter/${g.slug}` },
    openGraph: { type: 'article', modifiedTime: g.checkedAt },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ guide: string }> }) {
  const { guide } = await params
  const g = getGuide(guide)
  if (!g) notFound()
  const url = absolute(`/voter/${g.slug}`)
  const others = GUIDES.filter((o) => o.slug !== g.slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url,
        inLanguage: 'fr-FR',
        dateModified: g.checkedAt,
        mainEntity: [{ '@type': 'Question', name: g.question, acceptedAnswer: { '@type': 'Answer', text: g.short.join(' ') } }],
        citation: g.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: s.publisher })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.hubTitle, item: absolute('/voter') },
          { '@type': 'ListItem', position: 2, name: g.question, item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/voter">{t.kicker}</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {g.question}
      </h1>
      <ShortAnswer updated={t.checked(formatDate(g.checkedAt))}>
        {g.short.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </ShortAnswer>
      <div className="measure">
        {g.sections.map((s) => (
          <section key={s.title} className="section" style={{ paddingTop: 0 }}>
            <h2 style={{ fontSize: 'var(--h3)' }}>{s.title}</h2>
            {s.paras?.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.list &&
              (s.ordered ? (
                <ol>
                  {s.list.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              ) : (
                <ul>
                  {s.list.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ))}
          </section>
        ))}
        <section aria-labelledby="sources">
          <h2 id="sources" style={{ fontSize: 'var(--h3)' }}>
            {t.sources}
          </h2>
          <ul className="small">
            {g.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} rel="noopener noreferrer" target="_blank">
                  {s.title}
                </a>{' '}
                <span className="muted">({s.publisher})</span>
              </li>
            ))}
          </ul>
        </section>
        <nav className="section" aria-labelledby="autres-guides">
          <h2 id="autres-guides" style={{ fontSize: 'var(--h3)' }}>
            {t.others}
          </h2>
          <ul>
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/voter/${o.slug}`}>{o.question}</Link>
              </li>
            ))}
            <li>
              <Link href="/radar/2026-10-08-comment-voter">{t.article}</Link>
            </li>
          </ul>
        </nav>
      </div>
      <section className="card section sujet__cta">
        <h2>{t.whoTitle}</h2>
        <p>{t.whoBody}</p>
        <Link href="/test" className="btn btn--primary">
          {t.testCta}
        </Link>
      </section>
      <ShareButtons url={url} title={g.metaTitle} text={g.short[0]} />
      <p className="small muted section">
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/voter/${g.slug}`)}`}>Signaler une erreur</Link>
      </p>
    </div>
  )
}
