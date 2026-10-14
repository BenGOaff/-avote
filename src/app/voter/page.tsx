import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { ShortAnswer } from '@/components/ShortAnswer'
import { formatDate } from '@/components/Editorial'
import { UI_COPY } from '@/lib/copy'
import { dayLabel, GUIDES } from '@/lib/guides'
import { absolute } from '@/lib/site'
import { FIRST_ROUND, REGISTRATION_DEADLINE, SECOND_ROUND } from '@/lib/vote-dates'

const t = UI_COPY.guides

export const metadata: Metadata = {
  title: t.hubMetaTitle,
  description: t.hubDescription(dayLabel(FIRST_ROUND), dayLabel(SECOND_ROUND), dayLabel(REGISTRATION_DEADLINE)),
  alternates: { canonical: '/voter' },
}

export default function VoterPage() {
  const checked = GUIDES.map((g) => g.checkedAt).sort().at(-1)!
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.hubTitle,
    url: absolute('/voter'),
    itemListElement: GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.question, url: absolute(`/voter/${g.slug}`) })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.hubTitle} lede={t.hubLede} />
      <ShortAnswer updated={t.checked(formatDate(checked))}>
        <ul style={{ margin: 0 }}>
          <li>{t.hubRounds(dayLabel(FIRST_ROUND), dayLabel(SECOND_ROUND))}</li>
          <li>{t.hubDeadline(dayLabel(REGISTRATION_DEADLINE))}</li>
          <li>{t.hubId}</li>
          <li>{t.hubProxy}</li>
        </ul>
      </ShortAnswer>
      <ul className="cs-list measure" role="list">
        {GUIDES.map((g) => (
          <li key={g.slug} className="card card--flat">
            <h2 className="cs-list__concept">
              <Link href={`/voter/${g.slug}`}>{g.question}</Link>
            </h2>
            <p className="small muted" style={{ margin: 0 }}>
              {g.short[0]}
            </p>
          </li>
        ))}
      </ul>
      <p className="section measure">
        <Link href="/radar/2026-10-08-comment-voter">{t.article}</Link> · <Link href="/radar/2026-10-08-vote-blanc">{t.blank}</Link> ·{' '}
        <Link href="/quiz">{t.quiz}</Link>
      </p>
      <section className="card section sujet__cta">
        <h2>{t.whoTitle}</h2>
        <p>{t.whoBody}</p>
        <Link href="/test" className="btn btn--primary">
          {t.testCta}
        </Link>
      </section>
    </div>
  )
}
