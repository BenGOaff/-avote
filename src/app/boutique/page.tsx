import type { Metadata } from 'next'
import Link from 'next/link'
import boutique from '@content/boutique.json'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { LEGAL } from '@/lib/legal'

const shop = LEGAL.shop
const t = UI_COPY.boutique
const { apercus, collections } = boutique as { apercus: { id: string; alt: string }[]; collections: { label: string; url: string }[] }

export const metadata: Metadata = {
  title: 'Boutique',
  description: 'Tee-shirts, sweats, mugs et sacs de la présidentielle 2027 : des phrases pour chaque camp, et pour ceux qui hésitent. Vendus et livrés par Spreadshirt.',
  alternates: { canonical: '/boutique' },
}

export default function BoutiquePage() {
  if (!shop.open)
    return (
      <div className="container">
        <PageHeader kicker={t.kicker} title="Pas encore ouverte." lede="Rien n’est en vente pour l’instant." />
      </div>
    )
  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <div className="measure stack">
        <p>
          <a className="btn btn--highlight" href={shop.url} rel="noopener">
            {t.cta}
          </a>
        </p>
        <p>{t.daily}</p>
      </div>

      <nav className="section" aria-labelledby="rayons">
        <h2 id="rayons" style={{ fontSize: 'var(--h3)' }}>
          {t.collectionsTitle}
        </h2>
        <ul className="flash-cats">
          {collections.map((c) => (
            <li key={c.url}>
              <a className="flash-cats__chip" href={c.url} rel="noopener">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="section" aria-labelledby="apercus">
        <h2 id="apercus" style={{ fontSize: 'var(--h3)' }}>
          {t.previewTitle}
        </h2>
        <p className="small muted">{t.previewNote}</p>
        <ul className="shop-grid">
          {apercus.map((a) => (
            <li key={a.id}>
              <a href={shop.url} rel="noopener">
                <img src={`/img/boutique/${a.id}.webp`} alt={a.alt} width={640} height={640} loading="lazy" />
              </a>
            </li>
          ))}
        </ul>
        <p className="small">{t.variants}</p>
      </section>

      <div className="measure stack">
        <div className="card card--flat">
          <h2 style={{ fontSize: 'var(--h3)' }}>{t.rulesTitle}</h2>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {t.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="small" style={{ marginTop: 'var(--s3)' }}>
            <Link href="/mentions-legales#boutique">{t.who}</Link> · <Link href="/confidentialite#boutique">{t.data}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
