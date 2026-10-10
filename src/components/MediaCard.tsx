import { formatDate } from '@/components/Editorial'
import { UI_COPY } from '@/lib/copy'
import { ALERT_KIND_LABEL, ALERT_TOPIC_LABEL, engagementsOf, type MediaEntry } from '@/lib/medias'

const t = UI_COPY.medias

/** Fiche d'un média : qui a le dernier mot, actionnaires, note, orientation (attribuée), preuves repliées. */
export function MediaCard({ m }: { m: MediaEntry }) {
  const o = m.ownership!
  const others = o.otherMedia.filter((x) => x && x !== m.name)
  return (
    <article id={m.slug} className="card media-card">
      <h4 className="media-card__name">{m.name}</h4>
      {m.site && (
        <p className="small" style={{ margin: '0 0 var(--s2)' }}>
          <a href={m.site} rel="noopener noreferrer" target="_blank">
            {t.visit}
            <span className="visually-hidden"> {m.name}</span>
          </a>
        </p>
      )}
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

export function AlertList({ m }: { m: MediaEntry }) {
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
