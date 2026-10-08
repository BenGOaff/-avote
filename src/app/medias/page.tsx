import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { NewsletterForm } from '@/components/NewsletterForm'
import { formatDate } from '@/components/Editorial'
import { UI_COPY } from '@/lib/copy'
import { MEDIAS_QUIP } from '@/lib/humor'
import {
  ALERT_KIND_LABEL,
  ALERT_TOPIC_LABEL,
  CONTROLLER_KIND_LABEL,
  MEDIA_TYPE_LABEL,
  byController,
  engagementsOf,
  familySplit,
  getMedias,
  mediasUpdatedAt,
  type MediaEntry,
  type MediaType,
} from '@/lib/medias'

export const metadata: Metadata = {
  title: 'Qui possède ton info : les propriétaires des médias français',
  description: 'Qui possède les principales chaînes, radios, journaux et sites d’information en France, qui a le dernier mot, et quelles chaînes ont été rappelées à l’ordre par l’Arcom.',
  alternates: { canonical: '/medias' },
}

const TYPES: MediaType[] = ['tv', 'radio', 'presse', 'web']
const t = UI_COPY.medias

export default function MediasPage() {
  const medias = getMedias()
  const done = medias.filter((m) => m.ownership)
  const groups = byController(medias)
  const split = familySplit(medias)
  const flagged = medias.filter((m) => m.alerts && m.alerts.length > 0).sort((a, b) => b.alerts!.length - a.alerts!.length)
  const decisions = flagged.reduce((n, m) => n + m.alerts!.length, 0)
  const top = groups.find((g) => g.kind !== 'etat')
  const lead = [...split].sort((a, b) => b.medias.length - a.medias.length)[0]

  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <p className="humor quip">{MEDIAS_QUIP}</p>

      {done.length === 0 ? (
        <p className="alert alert--info measure">{t.pending}</p>
      ) : (
        <>
          <div className="figures" role="list">
            <Figure {...t.figOwners(groups.length, done.length)} />
            {top && top.medias.length > 1 && <Figure {...t.figTop(top.controller, top.medias.length)} />}
            {decisions > 0 && <Figure {...t.figArcom(decisions, flagged.length)} alert />}
          </div>

          <section className="section" aria-labelledby="dernier-mot">
            <h2 id="dernier-mot" style={{ fontSize: 'var(--h3)' }}>
              {t.splitTitle}
            </h2>
            {lead && <p className="lede" style={{ margin: '0 0 var(--s2)' }}>{t.splitLead(lead.medias.length, done.length, lead.label)}</p>}
            <p className="small muted" style={{ marginTop: 0 }}>
              {t.splitHint}
            </p>
            <div className="ownbar" aria-hidden="true">
              {split.map((f) => (
                <span key={f.id} className={`ownbar__seg ownbar__seg--${f.id}`} style={{ flexGrow: f.medias.length }} />
              ))}
            </div>
            <ul className="ownbar__legend">
              {split.map((f) => (
                <li key={f.id}>
                  <span className={`ownbar__dot ownbar__seg--${f.id}`} aria-hidden="true" />
                  <strong>{f.medias.length}</strong> {f.label} <span className="hint">{f.medias.map((m) => m.name).join(', ')}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="section" aria-labelledby="qui-quoi">
            <h2 id="qui-quoi" style={{ fontSize: 'var(--h3)' }}>
              {t.ownersTitle}
            </h2>
            <ul className="owners">
              {groups.map((g) => {
                const eng = engagementsOf(g.controller)
                return (
                  <li key={g.controller} className="owner">
                    <p className="owner__name">{g.controller}</p>
                    <p className="owner__meta">
                      <span className="badge badge--muted">{CONTROLLER_KIND_LABEL[g.kind] ?? g.kind}</span> {g.medias.length} média{g.medias.length > 1 ? 's' : ''}
                    </p>
                    {eng.length > 0 && (
                      <ul className="owner__eng">
                        {eng.map((e) => (
                          <li key={e.url + e.text}>{e.text}</li>
                        ))}
                      </ul>
                    )}
                    <ul className="owner__medias">
                      {g.medias.map((m) => (
                        <li key={m.slug}>
                          <a href={`#${m.slug}`}>{m.name}</a> <span className="hint">{MEDIA_TYPE_LABEL[m.type]}</span>
                          {m.alerts && m.alerts.length > 0 && <span className="stamp stamp--alert">Arcom × {m.alerts.length}</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </section>

          {flagged.length > 0 && (
            <section className="section" aria-labelledby="arcom">
              <h2 id="arcom" style={{ fontSize: 'var(--h3)' }}>
                {t.arcomTitle}
              </h2>
              <p className="small muted" style={{ marginTop: 0 }}>
                {t.arcomHint}
              </p>
              <div className="grid grid--2">
                {flagged.map((m) => (
                  <div key={m.slug} id={`arcom-${m.slug}`} className="alerts">
                    <p className="alerts__title">
                      <a href={`#${m.slug}`}>{m.name}</a> · {m.alerts!.length} décision{m.alerts!.length > 1 ? 's' : ''}
                    </p>
                    <AlertList m={m} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="fiches" className="section">
            <h2 id="fiches" style={{ fontSize: 'var(--h3)' }}>
              {t.cardsTitle}
            </h2>
            {mediasUpdatedAt && <p className="small muted" style={{ marginTop: 0 }}>{t.updated(formatDate(mediasUpdatedAt))}</p>}
            {TYPES.map((type) => {
              const list = done.filter((m) => m.type === type)
              if (list.length === 0) return null
              return (
                <div key={type} style={{ marginTop: 'var(--s5)' }}>
                  <h3>{MEDIA_TYPE_LABEL[type]}</h3>
                  <div className="grid grid--2">
                    {list.map((m) => (
                      <MediaCard key={m.slug} m={m} />
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        </>
      )}

      <section className="section measure stack" aria-labelledby="suivre">
        <p>
          <Link href="/methodologie#medias">{t.howTo}</Link>
        </p>
        <h2 id="suivre" style={{ fontSize: 'var(--h3)' }}>
          {t.follow}
        </h2>
        <NewsletterForm />
      </section>
    </div>
  )
}

function Figure({ num, label, alert }: { num: string; label: string; alert?: boolean }) {
  return (
    <p className={`figure${alert ? ' figure--alert' : ''}`} role="listitem">
      <span className="figure__num">{num}</span>
      <span className="figure__label">{label}</span>
    </p>
  )
}

function MediaCard({ m }: { m: MediaEntry }) {
  const o = m.ownership!
  const others = o.otherMedia.filter((x) => x && x !== m.name)
  return (
    <article id={m.slug} className="card media-card">
      <h4 className="media-card__name">{m.name}</h4>
      <p className="media-card__ctl">
        <span className="media-card__k">{t.controller}</span> {o.controller}
      </p>
      {m.orientation && (
        <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
          <span className="badge">{m.orientation.label}</span> <span className="hint">selon eurotopics</span>
        </p>
      )}
      <dl className="dl" style={{ marginTop: 'var(--s3)' }}>
        {o.owners.length > 0 && (
          <>
            <dt>{t.owners}</dt>
            <dd>{o.owners.map((x) => `${x.name}${x.share ? ` (${x.share})` : ''}`).join(' ; ')}</dd>
          </>
        )}
        {o.group && (
          <>
            <dt>{t.group}</dt>
            <dd>{o.group}</dd>
          </>
        )}
      </dl>
      {o.note && <p className="small">{o.note}</p>}
      {others.length > 0 && (
        <p className="small">
          <span className="media-card__k">{t.alsoOwns}</span> {others.join(', ')}
        </p>
      )}
      {m.alerts && m.alerts.length > 0 && (
        <p className="small" style={{ margin: 'var(--s3) 0 0' }}>
          <a href={`#arcom-${m.slug}`} className="stamp stamp--alert" style={{ marginLeft: 0 }}>
            {t.arcomCount(m.alerts.length)}
          </a>
        </p>
      )}
      <details className="sources">
        <summary>{t.source}</summary>
        <blockquote className="small">« {o.quote} »</blockquote>
        <p className="hint" style={{ margin: 0 }}>
          <a href={o.url} rel="noopener noreferrer nofollow" target="_blank">
            {o.publisher}
          </a>
          {o.date && `, ${formatDate(o.date)}`}
          {m.orientation && (
            <>
              {' · '}
              <a href={m.orientation.url} rel="noopener noreferrer nofollow" target="_blank">
                eurotopics
              </a>
            </>
          )}
          {engagementsOf(o.controller).map((e) => (
            <span key={e.url + e.text}>
              {' · '}
              <a href={e.url} rel="noopener noreferrer nofollow" target="_blank">
                {e.publisher}
              </a>
            </span>
          ))}
        </p>
      </details>
    </article>
  )
}

function AlertList({ m }: { m: MediaEntry }) {
  return (
    <ul>
      {m.alerts!.map((a) => (
        <li key={a.url + a.date}>
          <span className="stamp stamp--alert">{ALERT_KIND_LABEL[a.kind] ?? a.kind}</span> <strong>{formatDate(a.date)}</strong> · {ALERT_TOPIC_LABEL[a.topic] ?? a.topic}
          <br />
          {a.summary}{' '}
          <a href={a.url} rel="noopener noreferrer nofollow" target="_blank" className="small">
            {a.publisher}
          </a>
        </li>
      ))}
    </ul>
  )
}
