import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticle, getArticles } from '@/lib/content'
import { questionnaire } from '@/lib/data'
import { TYPE_LABEL, formatDate } from '@/components/Editorial'
import { ShareButtons } from '@/components/ShareButtons'
import { absolute } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) return {}
  const title = a.type === 'satire' ? `${a.title} (satire)` : a.title
  return {
    title,
    description: a.dek,
    alternates: { canonical: `/radar/${a.slug}` },
    openGraph: { type: 'article', title, description: a.dek, publishedTime: a.date, modifiedTime: a.updated ?? a.date, url: `/radar/${a.slug}` },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a) notFound()
  const themes = questionnaire.themes.filter((t) => a.topics.includes(t.id))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': a.type === 'satire' ? 'SatiricalArticle' : 'NewsArticle',
    headline: a.title,
    description: a.dek,
    datePublished: a.date,
    dateModified: a.updated ?? a.date,
    inLanguage: 'fr-FR',
    mainEntityOfPage: absolute(`/radar/${a.slug}`),
    author: { '@type': 'Organization', name: 'Ça vote ?', url: absolute('/') },
    publisher: { '@type': 'NewsMediaOrganization', name: 'Ça vote ?', logo: { '@type': 'ImageObject', url: absolute('/brand/symbole-512.png') } },
    citation: a.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: s.publisher })),
    isAccessibleForFree: true,
  }
  return (
    <article className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="measure">
        <p className="kicker">
          <Link href="/radar">Le Radar</Link> · {TYPE_LABEL[a.type]}
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}>{a.title}</h1>
        <p className="lede">{a.dek}</p>
        <p className="small muted">
          Publié le <time dateTime={a.date}>{formatDate(a.date)}</time>
          {a.updated && (
            <>
              {' '}· mis à jour le <time dateTime={a.updated}>{formatDate(a.updated)}</time>
            </>
          )}{' '}
          · {a.readingMinutes} min de lecture
        </p>
        {a.type === 'satire' && (
          <p className="alert small" style={{ margin: 'var(--s4) 0' }}>
            <span className="badge badge--satire">Satire</span> Le commentaire est satirique. Les faits ci-dessous, eux, sont sourcés.
          </p>
        )}

        {a.facts.length > 0 && (
          <aside className="card" aria-labelledby="faits" style={{ margin: 'var(--s5) 0' }}>
            <h2 id="faits" style={{ fontSize: 'var(--h3)' }}>
              Les faits
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
              {a.facts.map((f) => (
                <li key={f} style={{ marginBottom: 'var(--s2)' }}>
                  {f}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />

      <div className="measure stack" style={{ marginTop: 'var(--s6)' }}>
        {a.cannotConclude.length > 0 && (
          <section className="card card--flat" aria-labelledby="limites">
            <h2 id="limites" style={{ fontSize: 'var(--h3)' }}>
              Ce que ces éléments ne permettent pas de conclure
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
              {a.cannotConclude.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}
        <p className="small">
          {a.affectsScore
            ? 'Cet article accompagne une modification du référentiel des positions. Voir le journal des changements.'
            : 'Cet article ne modifie aucune position codée : ton résultat au test ne change pas.'}
        </p>
        <section aria-labelledby="sources">
          <h2 id="sources" style={{ fontSize: 'var(--h3)' }}>
            Sources
          </h2>
          <ol className="small">
            {a.sources.map((s) => (
              <li key={s.url} style={{ marginBottom: 'var(--s2)' }}>
                <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
                  {s.title}
                </a>{' '}
                — {s.publisher}
                {s.date && <>, {formatDate(s.date)}</>}
                {s.passage && (
                  <>
                    <br />
                    <span className="muted">« {s.passage} »</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </section>
        {themes.length > 0 && (
          <p className="small">
            Thèmes : {themes.map((t) => t.label).join(', ')}. <Link href="/test">Voir où tu te situes</Link>
          </p>
        )}
        <section aria-labelledby="corrections">
          <h2 id="corrections" style={{ fontSize: 'var(--h3)' }}>
            Corrections
          </h2>
          {a.corrections.length === 0 ? (
            <p className="small muted">Aucune correction à ce jour. Une erreur ? <Link href="/corrections#signaler">Signale-la</Link>.</p>
          ) : (
            <ul className="small">
              {a.corrections.map((c) => (
                <li key={c.date + c.text}>
                  <strong>{formatDate(c.date)}</strong> — {c.text}
                </li>
              ))}
            </ul>
          )}
        </section>
        <ShareButtons title={a.title} url={absolute(`/radar/${a.slug}`)} />
      </div>
    </article>
  )
}
