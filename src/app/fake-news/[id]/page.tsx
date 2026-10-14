import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShortAnswer } from '@/components/ShortAnswer'
import { ShareButtons } from '@/components/ShareButtons'
import { UI_COPY } from '@/lib/copy'
import { claimReviewOf, getIntox, getIntoxById, intoxPath, intoxUpdated, relatedIntox, VERDICT_LABEL } from '@/lib/intox'
import { questionnaire } from '@/lib/questions'
import { absolute } from '@/lib/site'
import { sujetSlug } from '@/lib/sujets'

const t = UI_COPY.intox

export const dynamicParams = false

export function generateStaticParams() {
  return getIntox().map((x) => ({ id: x.id }))
}

/** Description courte : Google coupe vers 155 caractères */
const clip = (s: string, n = 155) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const x = getIntoxById(id)
  if (!x) return {}
  const verdict = VERDICT_LABEL[x.verdict]
  return {
    title: t.pageTitle(verdict, x.claim),
    description: clip(t.pageDescription(verdict, x.truth)),
    alternates: { canonical: intoxPath(x) },
    openGraph: { type: 'article', publishedTime: x.firstSeen, modifiedTime: intoxUpdated(x) },
  }
}

export default async function IntoxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const x = getIntoxById(id)
  if (!x) notFound()
  const verdict = VERDICT_LABEL[x.verdict]
  const url = absolute(intoxPath(x))
  const theme = questionnaire.themes.find((th) => th.id === x.topic)
  const related = relatedIntox(x)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      claimReviewOf(x, url),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.title, item: absolute('/fake-news') },
          { '@type': 'ListItem', position: 2, name: t.pageTitle(verdict, x.claim), item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/fake-news">{t.pageKicker}</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        <span className="stamp intox-page__verdict">{verdict}</span> « {x.claim} »
      </h1>
      <aside className="intox-warning measure" role="note" aria-label={t.warningTitle}>
        <p style={{ margin: 0 }}>{t.pageWarning}</p>
      </aside>

      <ShortAnswer updated={intoxUpdated(x) === x.firstSeen ? t.updatedOn(formatDate(x.firstSeen)) : `${t.updatedOn(formatDate(intoxUpdated(x)))} · ${t.firstSeen(formatDate(x.firstSeen))}`}>
        <p>
          <strong>{t.verdictLine(verdict)}</strong> {x.truth}
        </p>
      </ShortAnswer>

      <div className="measure">
        {x.spreaders.length > 0 && (
          <p className="small">
            {t.spread} : {x.spreaders.join(', ')}
          </p>
        )}

        <h2 style={{ fontSize: 'var(--h3)', marginTop: 'var(--s5)' }}>{t.checksTitle}</h2>
        <ul className="intox-checks" role="list">
          {x.debunks.map((d) => (
            <li key={d.url} className="card card--flat">
              <p className="small muted" style={{ margin: 0 }}>
                {d.publisher} · <time dateTime={d.date}>{t.checkedOn(formatDate(d.date))}</time>
              </p>
              <p style={{ margin: 'var(--s2) 0' }}>
                <strong>{d.title}</strong>
              </p>
              {d.quote && <blockquote className="small">« {d.quote} »</blockquote>}
              <p className="small" style={{ margin: 0 }}>
                <a href={d.url} rel="noopener noreferrer" target="_blank">
                  {t.readCheck(d.publisher)}
                </a>
              </p>
            </li>
          ))}
        </ul>

        <p className="section">
          <strong>{t.factcheck}</strong> <Link href="/verifier">{t.factcheckLink}</Link>
        </p>
        {theme && (
          <p>
            <Link href={`/programmes/${sujetSlug(theme.label)}`}>{t.topicLink(theme.label)}</Link>
          </p>
        )}
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="autres">
          <h2 id="autres" style={{ fontSize: 'var(--h3)' }}>
            {t.related}
          </h2>
          <ul className="intox-checks measure" role="list">
            {related.map((o) => (
              <li key={o.id}>
                <span className="stamp">{VERDICT_LABEL[o.verdict]}</span> <Link href={intoxPath(o)}>« {o.claim} »</Link>
              </li>
            ))}
          </ul>
          <p>
            <Link href="/fake-news">{t.all}</Link> · <Link href="/methodologie#intox">{t.method}</Link>
          </p>
        </section>
      )}

      <ShareButtons url={url} title={t.pageTitle(verdict, x.claim)} text={`${t.verdictLine(verdict)} ${x.truth}`} />
      <p className="small muted section">{t.sourcesNote}</p>
    </div>
  )
}
