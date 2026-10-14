import Link from 'next/link'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ShortAnswer } from '@/components/ShortAnswer'
import { UI_COPY } from '@/lib/copy'
import { dayLabel } from '@/lib/guides'
import { getIntoxById, intoxPath } from '@/lib/intox'
import { actorName } from '@/lib/semaine-data'
import type { WeekRecap } from '@/lib/semaine'

const t = UI_COPY.semaine

export const rangeLabel = (r: WeekRecap) => `Du ${dayLabel(r.start)} au ${dayLabel(r.end)}`.replace(/ \d{4} au/, (m) => (r.start.slice(0, 4) === r.end.slice(0, 4) ? ' au' : m))
export const summaryOf = (r: WeekRecap) => (r.empty ? t.empty : t.summary(r.addedTotal, r.changedTotal, r.intox.length, r.candidacies.length))

export function WeekView({ r, current, prev, next }: { r: WeekRecap; current: boolean; prev?: string; next?: string }) {
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">{t.kicker}</p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {t.title(rangeLabel(r))}
      </h1>
      {current && <p className="muted">{t.current}</p>}

      <ShortAnswer>
        <p>{summaryOf(r)}</p>
      </ShortAnswer>

      {(r.addedTotal > 0 || r.changedTotal > 0) && (
        <section className="card section measure" aria-labelledby="bouge">
          <h2 id="bouge" style={{ fontSize: 'var(--h3)' }}>
            {t.driftTitle}
          </h2>
          <p>{t.driftText}</p>
          <Link href="/resultats" className="btn btn--highlight">
            {t.driftCta}
          </Link>
        </section>
      )}

      <PositionList id="nouvelles" title={t.addedTitle} hint={t.addedHint} list={r.added} />
      <PositionList id="changees" title={t.changedTitle} hint={t.changedHint} list={r.changed} />

      {r.intox.length > 0 && (
        <section className="section measure" aria-labelledby="intox">
          <h2 id="intox" style={{ fontSize: 'var(--h3)' }}>
            {t.intoxTitle}
          </h2>
          <ul className="intox-checks" role="list">
            {r.intox.map((x) => {
              const full = getIntoxById(x.id)
              return (
                <li key={x.id}>
                  <span className="stamp">{x.verdict}</span> {full ? <Link href={intoxPath(full)}>« {x.claim} »</Link> : <>« {x.claim} »</>}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {r.candidacies.length > 0 && (
        <section className="section measure" aria-labelledby="candidatures">
          <h2 id="candidatures" style={{ fontSize: 'var(--h3)' }}>
            {t.candTitle}
          </h2>
          <ul>
            {r.candidacies.map((c) => (
              <li key={c.slug + c.kind}>
                <Link href={`/candidats/${c.slug}`}>{c.name}</Link> {c.kind === 'nouvelle' ? t.candNew : t.candOut} <span className="muted">({dayLabel(c.date)})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.next.length > 0 && (
        <section className="section measure" aria-labelledby="rdv">
          <h2 id="rdv" style={{ fontSize: 'var(--h3)' }}>
            {t.nextTitle}
          </h2>
          <ul>
            {r.next.map((e) => (
              <li key={e.id}>
                <Link href={`/agenda#${e.id}`}>{e.title}</Link> <span className="muted">({dayLabel(e.date)})</span>
              </li>
            ))}
          </ul>
          <p className="small">
            <Link href="/agenda">{t.nextAll}</Link>
          </p>
        </section>
      )}

      <section className="card section measure" aria-labelledby="lettre">
        <h2 id="lettre" style={{ fontSize: 'var(--h3)' }}>
          {t.mailTitle}
        </h2>
        <p>{t.mailText}</p>
        <NewsletterForm />
      </section>

      <nav className="row section" aria-label={t.archive}>
        {prev && (
          <Link href={`/semaine/${prev}`} className="btn btn--secondary">
            {t.prev}
          </Link>
        )}
        {next && (
          <Link href={`/semaine/${next}`} className="btn btn--secondary">
            {t.next}
          </Link>
        )}
      </nav>
    </div>
  )
}

function PositionList({ id, title, hint, list }: { id: string; title: string; hint: string; list: WeekRecap['added'] }) {
  if (list.length === 0) return null
  return (
    <section className="section measure" aria-labelledby={id}>
      <h2 id={id} style={{ fontSize: 'var(--h3)' }}>
        {title} <span className="hint">{list.reduce((n, a) => n + a.count, 0)}</span>
      </h2>
      <p className="small muted">{hint}</p>
      <ul>
        {list.map((a) => (
          <li key={a.actor}>
            <Link href={`/candidats/${a.actor}`}>{actorName(a.actor)}</Link> : {t.positions(a.count)}
            {a.themes.length > 0 && <span className="muted"> ({a.themes.join(', ')})</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
