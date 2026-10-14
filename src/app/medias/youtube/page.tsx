import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/components/Editorial'
import { PageHeader } from '@/components/PageHeader'
import { ShortAnswer } from '@/components/ShortAnswer'
import { Shuffle } from '@/components/Shuffle'
import { getActiveActors } from '@/lib/actors'
import { UI_COPY } from '@/lib/copy'
import { absolute } from '@/lib/site'
import { getYoutube, MIN_SUBSCRIBERS, YOUTUBE_GROUPS, youtubeActorsWithChannel, type YoutubeRow } from '@/lib/youtube'

const t = UI_COPY.youtube

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.description,
  alternates: { canonical: '/medias/youtube' },
}

const nb = (n: number) => n.toLocaleString('fr-FR')
const shortDate = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`))
const short = (n: number) =>
  n >= 1e6 ? `${(Math.round(n / 1e5) / 10).toLocaleString('fr-FR')} M` : n >= 1e3 ? `${Math.round(n / 1e3).toLocaleString('fr-FR')} k` : nb(n)

export default function YoutubePage() {
  const { date, since, rows } = getYoutube()
  const shown = rows.filter((r) => r.group === 'candidat' || (r.subscribers ?? 0) >= MIN_SUBSCRIBERS)
  const bySubs = (a: YoutubeRow, b: YoutubeRow) => (b.subscribers ?? -1) - (a.subscribers ?? -1)
  const top = shown
    .filter((r) => r.group !== 'candidat' && r.active)
    .sort(bySubs)
    .slice(0, 3)
  const noChannel = getActiveActors().filter((a) => !youtubeActorsWithChannel.has(a.slug))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: t.metaTitle,
    description: t.description,
    url: absolute('/medias/youtube'),
    inLanguage: 'fr-FR',
    ...(date ? { dateModified: date } : {}),
    creator: { '@type': 'Organization', name: 'Ça vote ?' },
    isBasedOn: 'https://developers.google.com/youtube/v3',
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />

      {!date ? (
        <p className="card measure">{t.pending}</p>
      ) : (
        <>
          <ShortAnswer>
            <p>{t.short(shown.filter((r) => r.group !== 'candidat').length, formatDate(date), top.map((r) => `${r.name} (${short(r.subscribers!)} abonnés)`).join(', '))}</p>
          </ShortAnswer>
          {!rows.some((r) => r.viewsMonth !== null) && since && <p className="small muted measure">{t.monthPending(formatDate(since))}</p>}

          {YOUTUBE_GROUPS.map((g) => {
            const list = shown.filter((r) => r.group === g).sort(bySubs)
            const active = list.filter((r) => r.active || g === 'candidat')
            const inactive = list.filter((r) => !r.active && g !== 'candidat')
            if (list.length === 0) return null
            return (
              <section key={g} className="section" aria-labelledby={`yt-${g}`}>
                <h2 id={`yt-${g}`} style={{ fontSize: 'var(--h3)' }}>
                  {t.groups[g]} <span className="hint">{active.length}</span>
                </h2>
                <Table rows={active} />
                {inactive.length > 0 && (
                  <details className="sources">
                    <summary>{t.inactiveTitle(inactive.length)}</summary>
                    <Table rows={inactive} />
                  </details>
                )}
                {g === 'candidat' && noChannel.length > 0 && (
                  <p className="small">
                    <span className="media-card__k">{t.noChannel} :</span>{' '}
                    <Shuffle as="span" className="echiquier__inline">
                      {noChannel.map((a) => (
                        <span key={a.slug}>
                          <Link href={`/candidats/${a.slug}`}>{a.name}</Link>
                        </span>
                      ))}
                    </Shuffle>
                  </p>
                )}
              </section>
            )
          })}
        </>
      )}

      <section className="section measure" aria-labelledby="yt-methode">
        <h2 id="yt-methode" style={{ fontSize: 'var(--h3)' }}>
          {UI_COPY.questions.method}
        </h2>
        {t.method.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="small">
          <Link href="/medias">Qui possède ton info</Link> · <Link href="/fake-news">Les fake news démontées</Link> ·{' '}
          <Link href="/radar/2026-10-14-ia-et-elections">IA et élections</Link> ·{' '}
          <Link href={`/contact?sujet=correction&page=${encodeURIComponent('/medias/youtube')}`}>{t.missing}</Link>
        </p>
      </section>
    </div>
  )
}

function Table({ rows }: { rows: YoutubeRow[] }) {
  return (
    <div className="table-wrap">
      <table className="table--compact">
        <thead>
          <tr>
            <th scope="col">{t.cols.name}</th>
            <th scope="col" className="num">
              {t.cols.subs}
            </th>
            <th scope="col" className="num">
              {t.cols.month}
            </th>
            <th scope="col">{t.cols.trend}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <a href={r.url} rel="noopener noreferrer nofollow" target="_blank">
                  {r.name}
                </a>
                <br />
                <span className="small muted">
                  {t.cols.last} : {r.last ? shortDate(r.last) : '—'}
                </span>
                <br />
                <span className="small">
                  {r.actor ? (
                    <Link href={`/candidats/${r.actor}`}>{UI_COPY.candidatSujet.fiche(r.name)}</Link>
                  ) : r.media ? (
                    <Link href={`/medias/${r.media}`}>{t.cols.owner}</Link>
                  ) : r.owner ? (
                    <>
                      {r.owner.text}{' '}
                      <a href={r.owner.url} rel="noopener noreferrer nofollow" target="_blank" title={r.owner.quote}>
                        {r.owner.publisher}
                      </a>
                    </>
                  ) : (
                    <span className="muted">
                      {t.cols.owner} : {t.ownerUnknown.toLowerCase()}
                    </span>
                  )}
                </span>
              </td>
              <td className="num">{r.subscribers === null ? '—' : short(r.subscribers)}</td>
              <td className="num">{r.viewsMonth === null ? '—' : short(r.viewsMonth)}</td>
              <td>
                <Sparkline values={r.history} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Courbe des abonnés, relevé après relevé (rien tant qu'il n'y a qu'un relevé) */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="muted">—</span>
  const w = 56
  const h = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`De ${nb(values[0]!)} à ${nb(values.at(-1)!)} abonnés`}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
