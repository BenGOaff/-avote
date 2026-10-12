import type { Metadata } from 'next'
import Link from 'next/link'
import { mediaLogoOf } from '@/lib/images'
import { absolute } from '@/lib/site'
import { getSpeechTime, SPEECH_SEGMENTS } from '@/lib/temps-parole'
import { PageHeader } from '@/components/PageHeader'
import { NewsletterForm } from '@/components/NewsletterForm'
import { formatDate } from '@/components/Editorial'
import { UI_COPY } from '@/lib/copy'
import { MEDIAS_QUIP } from '@/lib/humor'
import { AlertList, MediaCard } from '@/components/MediaCard'
import {
  CONTROLLER_KIND_LABEL,
  MEDIA_TYPE_LABEL,
  byController,
  engagementsOf,
  familySplit,
  getMedias,
  freeMedias,
  orientationAxis,
  mediasUpdatedAt,
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
  const free = freeMedias(medias)
  const axis = orientationAxis(medias)
  const speech = getSpeechTime()
  const nameOf = new Map(medias.map((m) => [m.slug, m.name]))
  const lead = [...split].sort((a, b) => b.medias.length - a.medias.length)[0]
  // Données structurées : chaque média, son logo et qui le contrôle, pour les moteurs et les assistants IA
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.title,
    url: absolute('/medias'),
    numberOfItems: done.length,
    itemListElement: done.map((m, i) => {
      const logo = mediaLogoOf(m.slug)
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'NewsMediaOrganization',
          name: m.name,
          ...(m.site ? { url: m.site } : {}),
          ...(logo ? { logo: absolute(logo) } : {}),
          parentOrganization: { '@type': 'Organization', name: m.ownership!.group || m.ownership!.controller },
          description: `${t.controller}\u00a0: ${m.ownership!.controller}. ${m.ownership!.note}`,
          subjectOf: { '@type': 'CreativeWork', name: m.ownership!.sourceTitle, url: m.ownership!.url, publisher: m.ownership!.publisher },
        },
      }
    }),
  }

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
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

          {free.length > 0 && (
            <p className="card card--featured free-teaser">
              <strong>{t.free.teaser(free.length)}</strong> <Link href="/medias/libres">{t.free.cta}</Link>
            </p>
          )}
          <p className="small">
            {t.quizLead} <Link href="/quiz/flash/teste-tes-connaissances-sur-les-medias">{t.quizKnow}</Link> · <Link href="/quiz/flash/quel-media-es-tu">{t.quizProfile}</Link> · <Link href="/fake-news">{t.fakeNews}</Link>
          </p>

          {axis.total > 0 && (
            <section className="section" aria-labelledby="orientation">
              <h2 id="orientation" style={{ fontSize: 'var(--h3)' }}>
                {t.axisTitle}
              </h2>
              <p className="small muted" style={{ marginTop: 0 }}>
                {t.axisHint(axis.total, medias.length)}
              </p>
              <div className="echiquier echiquier--6">
                {axis.columns.map((c) => (
                  <div key={c.label} className={`echiquier__col bloc-${c.bloc}`}>
                    <p className="echiquier__head" style={{ margin: 0 }}>
                      {c.label.charAt(0).toUpperCase() + c.label.slice(1)} <span className="small muted">{c.medias.length}</span>
                    </p>
                    <ul className="echiquier__list">
                      {c.medias.map((m) => (
                        <li key={m.slug}>
                          <a href={m.orientation!.url} rel="noopener noreferrer" target="_blank" title={t.axisSource(m.name)}>
                            {m.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="echiquier__axis" aria-hidden="true">
                <span>← gauche</span>
                <span>droite →</span>
              </p>
              {axis.others.length > 0 && (
                <p className="echiquier__extra">
                  {axis.others.map((m) => (
                    <span key={m.slug}>
                      <a href={m.orientation!.url} rel="noopener noreferrer" target="_blank">
                        {m.name}
                      </a>{' '}
                      : {m.orientation!.label}
                    </span>
                  ))}
                </p>
              )}
            </section>
          )}

          {speech.channels.length > 0 && (
            <section className="section" aria-labelledby="temps-parole">
              <h2 id="temps-parole" style={{ fontSize: 'var(--h3)' }}>
                {t.speechTitle}
              </h2>
              <p className="measure" style={{ marginTop: 0 }}>
                {t.speechLead(formatDate(speech.from), formatDate(speech.to))}
              </p>
              <ul className="speech__legend" aria-hidden="true">
                {SPEECH_SEGMENTS.map((s) => (
                  <li key={s.id}>
                    <span className={`speech__dot speech__seg--${s.id}`} />
                    {s.label}
                  </li>
                ))}
              </ul>
              <ul className="speech" role="list">
                {speech.channels.map((c) => {
                  const logo = mediaLogoOf(c.slug)
                  return (
                    <li key={c.slug} className="speech__row">
                      <p className="speech__name">
                        {logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt="" className="speech__logo" loading="lazy" decoding="async" />
                        )}
                        <a href={`#${c.slug}`}>{nameOf.get(c.slug) ?? c.service}</a> <span className="hint">{t.speechHours(c.hours)}</span>
                      </p>
                      <div className="speech__bar" aria-hidden="true">
                        {c.shares.map((s) => (
                          <span key={s.id} className={`speech__seg speech__seg--${s.id}`} style={{ flexGrow: s.pct }} title={`${s.label} : ${String(s.pct).replace('.', ',')} %`} />
                        ))}
                      </div>
                      <p className="visually-hidden">{c.shares.map((s) => `${s.label} : ${String(s.pct).replace('.', ',')} %`).join(' ; ')}</p>
                      <p className="small muted" style={{ margin: 'var(--s1) 0 0' }}>
                        {t.speechTop} : {c.top.map((x) => `${x.party} ${String(x.pct).replace('.', ',')} %`).join(' · ')}
                      </p>
                    </li>
                  )
                })}
              </ul>
              <p className="small" style={{ marginTop: 'var(--s3)' }}>
                {t.speechNote} <a href="#arcom">{t.speechArcom}</a>
              </p>
              <p className="small muted">
                <a href={speech.source.url} rel="noopener noreferrer" target="_blank">
                  {t.speechSource}
                </a>{' '}
                · <Link href="/methodologie#couleurs">{t.speechGrid}</Link>
              </p>
            </section>
          )}

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
                      <MediaCard key={m.slug} m={m} logo={mediaLogoOf(m.slug)} />
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
