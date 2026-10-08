import Link from 'next/link'
import type { Article, Brief } from '@/lib/content'

export const TYPE_LABEL: Record<Article['type'], string> = {
  satire: 'Satire',
  decryptage: 'Décryptage',
  promesse: 'Promesse et conditions',
  'avant-apres': 'Avant / après',
  cout: 'Coût documenté',
  competence: 'Qui décide ?',
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
const dayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
export const formatTime = (iso: string) => timeFmt.format(new Date(iso))
export const formatDay = (iso: string) => dayFmt.format(new Date(iso))

export function ArticleCard({ a, featured = false }: { a: Article; featured?: boolean }) {
  return (
    <article className={`card ${featured ? 'card--featured' : 'card--flat'}`}>
      <div className="row" style={{ marginBottom: 'var(--s2)' }}>
        <span className={`badge ${a.type === 'satire' ? 'badge--satire' : ''}`}>{TYPE_LABEL[a.type]}</span>
        <time className="card__meta" dateTime={a.date}>
          {formatDate(a.date)}
        </time>
      </div>
      <h3>
        <Link className="card__link" href={`/radar/${a.slug}`}>
          {a.title}
        </Link>
      </h3>
      <p className="muted" style={{ margin: 0 }}>
        {a.dek}
      </p>
    </article>
  )
}

export function BriefItem({ b }: { b: Brief }) {
  return (
    <li className="feed__item" id={b.slug}>
      <time className="feed__time" dateTime={b.date}>
        {formatTime(b.date)}
      </time>
      <div>
        <h3 className="feed__title">{b.title}</h3>
        <div className="feed__body" dangerouslySetInnerHTML={{ __html: b.html }} />
        {b.remark && <p className="feed__remark humor">{b.remark}</p>}
        <p className="small muted" style={{ margin: 0 }}>
          Source :{' '}
          <a href={b.source.url} rel="noopener noreferrer nofollow" target="_blank">
            {b.source.publisher} — {b.source.title}
          </a>
          {b.more.length > 0 && (
            <>
              {' '}· Pour creuser :{' '}
              {b.more.map((m, i) => (
                <span key={m.url}>
                  {i > 0 && ', '}
                  <a href={m.url} rel="noopener noreferrer nofollow" target="_blank">
                    {m.publisher}
                  </a>
                </span>
              ))}
            </>
          )}
        </p>
      </div>
    </li>
  )
}
