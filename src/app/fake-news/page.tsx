import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { formatDate } from '@/components/Editorial'
import { UI_COPY } from '@/lib/copy'
import { getIntox, intoxUpdatedAt, outletCount, podium, VERDICT_LABEL, type Intox } from '@/lib/intox'
import { absolute } from '@/lib/site'

const t = UI_COPY.intox

export const metadata: Metadata = {
  title: 'Fake news de la présidentielle 2027 : les intox démontées',
  description:
    'Les fausses informations sur la politique française, démontées par les cellules de fact-checking (Les Décodeurs, CheckNews, franceinfo, 20 Minutes, Les Surligneurs). Toutes les affirmations citées sont FAUSSES.',
  alternates: { canonical: '/fake-news' },
}

export const revalidate = 3600

const monthLabel = (m: string) => new Date(`${m}-15`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

export default function FakeNewsPage() {
  const items = getIntox()
  const { month, top } = podium()
  // Données structurées : chaque intox est une affirmation notée FAUSSE, avec la vérification qui la démonte
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.title,
    description: t.warning,
    url: absolute('/fake-news'),
    itemListElement: items.slice(0, 60).map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ClaimReview',
        url: absolute(`/fake-news#${x.id}`),
        claimReviewed: x.claim,
        datePublished: x.firstSeen,
        reviewRating: { '@type': 'Rating', ratingValue: 1, bestRating: 5, worstRating: 1, alternateName: VERDICT_LABEL[x.verdict] },
        reviewBody: x.truth,
        author: { '@type': 'Organization', name: x.debunks[0]!.publisher, url: x.debunks[0]!.url },
        itemReviewed: { '@type': 'Claim', ...(x.spreaders.length ? { author: x.spreaders.map((s) => ({ '@type': 'Thing', name: s })) } : {}) },
        citation: x.debunks.map((d) => ({ '@type': 'CreativeWork', name: d.title, url: d.url, publisher: d.publisher })),
      },
    })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <aside className="intox-warning" role="note" aria-label={t.warningTitle}>
        <p className="intox-warning__title">{t.warningTitle}</p>
        <p style={{ margin: 0 }}>{t.warning}</p>
      </aside>

      {items.length === 0 ? (
        <p className="alert alert--info measure section">{t.empty}</p>
      ) : (
        <>
          {top.length > 0 && (
            <section className="section" aria-labelledby="podium">
              <h2 id="podium" style={{ fontSize: 'var(--h3)' }}>
                {t.podiumTitle(monthLabel(month))}
              </h2>
              <p className="small muted" style={{ marginTop: 0 }}>
                {t.podiumHint}
              </p>
              <ol className="intox-podium" role="list">
                {top.map((x, i) => (
                  <li key={x.id} className={`intox-podium__step intox-podium__step--${i + 1}`}>
                    <span className="intox-podium__rank" aria-hidden="true">
                      {i + 1}
                    </span>
                    <IntoxCard x={x} badge={t.outlets(outletCount(x, month))} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="section" aria-labelledby="fil">
            <h2 id="fil" style={{ fontSize: 'var(--h3)' }}>
              {t.feedTitle}
            </h2>
            {intoxUpdatedAt && <p className="small muted">{t.updated(formatDate(intoxUpdatedAt))}</p>}
            <ul className="intox-list" role="list">
              {items.map((x) => (
                <li key={x.id} id={x.id}>
                  <IntoxCard x={x} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section className="section measure">
        <p>
          <strong>{t.factcheck}</strong> <Link href="/verifier">{t.factcheckLink}</Link>
        </p>
        <p className="small muted">{t.sourcesNote}</p>
        <p>
          <Link href="/methodologie#intox">{t.method}</Link> · <Link href="/medias">Qui possède ton info</Link> · <Link href="/radar">Le radar</Link>
        </p>
      </section>
    </div>
  )
}

function IntoxCard({ x, badge }: { x: Intox; badge?: string }) {
  return (
    <article className="card intox">
      <p className="intox__head">
        <span className="stamp intox__stamp">{VERDICT_LABEL[x.verdict]}</span>
        {badge && <span className="small muted">{badge}</span>}
      </p>
      <p className="intox__label">{UI_COPY.intox.claimLabel}</p>
      <p className="intox__claim">
        <del>{x.claim}</del>
      </p>
      <p className="intox__label">{UI_COPY.intox.truthLabel}</p>
      <p className="intox__truth">{x.truth}</p>
      {x.spreaders.length > 0 && (
        <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
          {UI_COPY.intox.spread} : {x.spreaders.join(', ')}
        </p>
      )}
      <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
        {UI_COPY.intox.by} :{' '}
        {x.debunks.map((d, i) => (
          <span key={d.url}>
            {i > 0 && ' · '}
            <a href={d.url} rel="noopener noreferrer" target="_blank">
              {d.publisher}
            </a>{' '}
            <span className="muted">({formatDate(d.date)})</span>
          </span>
        ))}
      </p>
    </article>
  )
}
