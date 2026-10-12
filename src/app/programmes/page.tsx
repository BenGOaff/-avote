import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { ThemeIcon } from '@/components/ThemeIcon'
import { formatDate } from '@/components/Editorial'
import { UI_COPY } from '@/lib/copy'
import { getSujets } from '@/lib/sujets'
import { getActiveActors } from '@/lib/actors'
import { absolute } from '@/lib/site'

const t = UI_COPY.programmes

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription(getActiveActors().length),
  alternates: { canonical: '/programmes' },
}

export default function ProgrammesPage() {
  const sujets = getSujets()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t.title,
    url: absolute('/programmes'),
    inLanguage: 'fr-FR',
    hasPart: sujets.map((s) => ({ '@type': 'WebPage', name: t.sujetMetaTitle(s.theme.label), url: absolute(`/programmes/${s.slug}`) })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker="La campagne" title={t.title} lede={t.lede} />
      <ul className="grid grid--3 sujets section" role="list">
        {sujets.map((s) => (
          <li key={s.slug} className="card sujets__card">
            <Link href={`/programmes/${s.slug}`} className="sujets__link">
              <ThemeIcon theme={s.theme.id} className="sujets__icon" />
              <span className="sujets__label">{s.theme.label}</span>
            </Link>
            <p className="small">{s.theme.description}</p>
            <p className="card__meta">
              {t.stats(s.positions, s.candidates)}
              {s.updatedAt && ` · ${t.updated(formatDate(s.updatedAt))}`}
            </p>
          </li>
        ))}
      </ul>
      <p className="small muted section">
        {t.empty} <Link href="/methodologie">Méthode</Link> · <Link href="/contact?sujet=correction">{t.error}</Link>
      </p>
    </div>
  )
}
