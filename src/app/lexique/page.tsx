import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { TERMS } from '@/lib/lexique'
import { absolute } from '@/lib/site'

const t = UI_COPY.lexique

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  alternates: { canonical: '/lexique' },
}

const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term, 'fr'))

export default function LexiquePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: t.title,
    url: absolute('/lexique'),
    inLanguage: 'fr-FR',
    hasDefinedTerm: sorted.map((x) => ({
      '@type': 'DefinedTerm',
      name: x.term,
      description: `${x.short} ${x.long}`,
      url: absolute(`/lexique#${x.id}`),
      inDefinedTermSet: absolute('/lexique'),
    })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <nav className="sujet__tabs section" aria-label={t.title}>
        {sorted.map((x) => (
          <a key={x.id} href={`#${x.id}`} className="cmp__theme sujet__tab">
            {x.term}
          </a>
        ))}
      </nav>
      <ol className="lexique-list measure" role="list">
        {sorted.map((x) => (
          <li key={x.id} id={x.id} className="card card--flat">
            <h2 className="cs-list__concept">{x.term}</h2>
            <p style={{ margin: 0 }}>
              <strong>{x.short}</strong>
            </p>
            <p style={{ margin: 'var(--s2) 0 0' }}>{x.long}</p>
            <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
              {x.source ? (
                <>
                  {t.source} :{' '}
                  <a href={x.source.url} rel="noopener noreferrer" target="_blank">
                    {x.source.publisher}, {x.source.title}
                  </a>
                </>
              ) : (
                t.editorial
              )}
              {x.href && (
                <>
                  {' '}
                  · <Link href={x.href}>{t.seeAlso}</Link>
                </>
              )}
            </p>
          </li>
        ))}
      </ol>
      <section className="card section sujet__cta">
        <div className="row">
          <Link href="/test" className="btn btn--primary">
            {t.testCta}
          </Link>
        </div>
        <p style={{ margin: 'var(--s3) 0 0' }}>
          {t.missing} <Link href="/contact?page=%2Flexique">{t.missingLink}</Link>
        </p>
      </section>
    </div>
  )
}
