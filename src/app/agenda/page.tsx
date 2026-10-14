import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { ShortAnswer } from '@/components/ShortAnswer'
import { formatDate } from '@/components/Editorial'
import { getActor } from '@/lib/actors'
import { agendaUpdatedAt, KIND_LABEL, past, upcoming, type AgendaEvent } from '@/lib/agenda'
import { UI_COPY } from '@/lib/copy'
import { dayLabel } from '@/lib/guides'
import { absolute } from '@/lib/site'

const t = UI_COPY.agenda

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  alternates: { canonical: '/agenda' },
}

// La liste « à venir » avance d'elle-même avec la date du jour
export const revalidate = 3600

const FEED = absolute('/agenda.ics')
const WEBCAL = FEED.replace(/^https?:/, 'webcal:')

const when = (e: AgendaEvent) =>
  e.end && e.end !== e.date ? `du ${dayLabel(e.date)} au ${dayLabel(e.end)}` : `${dayLabel(e.date)}${e.time ? `, ${e.time.replace(':', ' h ').replace(/ 00$/, '')}` : ''}`
const monthOf = (iso: string) => {
  const m = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
  return m.charAt(0).toUpperCase() + m.slice(1)
}

export default function AgendaPage() {
  const next = upcoming()
  const done = past()
  const months = [...new Set(next.map((e) => e.date.slice(0, 7)))]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.title,
    url: absolute('/agenda'),
    itemListElement: next.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Event',
        name: e.title,
        description: e.summary,
        startDate: e.time ? `${e.date}T${e.time}` : e.date,
        ...(e.end ? { endDate: e.end } : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'Place', name: e.place ?? 'France', address: { '@type': 'PostalAddress', addressCountry: 'FR' } },
        url: absolute(`/agenda#${e.id}`),
      },
    })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />

      {next[0] && (
        <ShortAnswer updated={t.updated(formatDate(agendaUpdatedAt))}>
          <p>{t.next(next[0].title, when(next[0]))}</p>
        </ShortAnswer>
      )}

      <section className="card section measure" aria-labelledby="abonnement">
        <h2 id="abonnement" style={{ fontSize: 'var(--h3)' }}>
          {t.subscribeTitle}
        </h2>
        <p>{t.subscribeText}</p>
        <div className="row">
          <a className="btn btn--highlight" href={WEBCAL}>
            {t.subscribeApple}
          </a>
          <a className="btn btn--secondary" href={`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(WEBCAL)}`} rel="noopener noreferrer" target="_blank">
            {t.subscribeGoogle}
          </a>
        </div>
        <p className="small" style={{ margin: 'var(--s3) 0 0' }}>
          <a href="/agenda.ics" download>
            {t.download}
          </a>
        </p>
      </section>

      {months.map((m) => (
        <section key={m} className="section" aria-labelledby={`m-${m}`}>
          <h2 id={`m-${m}`} style={{ fontSize: 'var(--h3)' }}>
            {monthOf(`${m}-15`)}
          </h2>
          <ol className="cs-list measure" role="list">
            {next
              .filter((e) => e.date.startsWith(m))
              .map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
          </ol>
        </section>
      ))}

      <section className="section measure">
        <h2 style={{ fontSize: 'var(--h3)' }}>{t.missingTitle}</h2>
        <p>{t.missingText}</p>
        <p>
          <Link href="/contact?page=%2Fagenda">{t.missingLink}</Link> · <Link href="/voter">{UI_COPY.guides.hubTitle}</Link> · <Link href="/radar">Le radar</Link>
        </p>
      </section>

      {done.length > 0 && (
        <details className="section measure">
          <summary>
            {t.pastTitle} ({done.length})
          </summary>
          <ol className="cs-list" role="list">
            {done.map((e) => (
              <EventCard key={e.id} e={e} isPast />
            ))}
          </ol>
        </details>
      )}
    </div>
  )
}

function EventCard({ e, isPast = false }: { e: AgendaEvent; isPast?: boolean }) {
  const people = (e.who ?? []).map((slug) => getActor(slug)).filter((a): a is NonNullable<typeof a> => !!a)
  return (
    <li id={e.id} className="card card--flat">
      <p className="small muted" style={{ margin: 0 }}>
        <span className="stamp">{KIND_LABEL[e.kind]}</span> <time dateTime={e.date}>{when(e)}</time>
      </p>
      <h3 className="cs-list__concept" style={{ marginTop: 'var(--s2)' }}>
        {e.title}
      </h3>
      <p style={{ margin: 0 }}>{e.summary}</p>
      {e.computed && <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>{t.computed}</p>}
      {people.length > 0 && (
        <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
          {people.map((a, i) => (
            <span key={a.slug}>
              {i > 0 && ' · '}
              <Link href={`/candidats/${a.slug}`}>{a.name}</Link>
            </span>
          ))}
        </p>
      )}
      {e.quote && <blockquote className="small">«&nbsp;{e.quote}&nbsp;»</blockquote>}
      <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
        {t.source} :{' '}
        <a href={e.source.url} rel="noopener noreferrer" target="_blank">
          {e.source.publisher}
        </a>
        {e.href && (
          <>
            {' '}
            · <Link href={e.href}>{t.how}</Link>
          </>
        )}
        {!isPast && (
          <>
            {' '}
            · <a href={`/agenda/${e.id}.ics`}>{t.add}</a>
          </>
        )}
      </p>
    </li>
  )
}
