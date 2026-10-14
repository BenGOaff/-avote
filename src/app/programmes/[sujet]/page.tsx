import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShareButtons } from '@/components/ShareButtons'
import { BASIS_LABEL } from '@/lib/answers'
import { UI_COPY } from '@/lib/copy'
import { absolute } from '@/lib/site'
import { getCandidatSujet, getSujet, getSujets, SIDES, summaryOf, type SujetItem } from '@/lib/sujets'
import { getActiveActors } from '@/lib/actors'
import { OpenFromHash } from './OpenFromHash'
import { Glossed } from '@/components/Gloss'
import { Shuffle } from '@/components/Shuffle'

const t = UI_COPY.programmes

export const dynamicParams = false

export function generateStaticParams() {
  return getSujets().map((s) => ({ sujet: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ sujet: string }> }): Promise<Metadata> {
  const { sujet } = await params
  const s = getSujet(sujet)
  if (!s) return {}
  return {
    title: t.sujetMetaTitle(s.theme.label),
    description: t.sujetMetaDescription(s.theme.label),
    alternates: { canonical: `/programmes/${s.slug}` },
    openGraph: { type: 'article', modifiedTime: s.updatedAt ?? undefined },
  }
}

export default async function SujetPage({ params }: { params: Promise<{ sujet: string }> }) {
  const { sujet } = await params
  const s = getSujet(sujet)
  if (!s) notFound()
  const url = absolute(`/programmes/${s.slug}`)
  const card = `/programmes/${s.slug}/carte.png`
  // Candidats qui ont leur page sur ce sujet (au moins deux positions sourcées)
  const subPages = new Set(getActiveActors().filter((a) => getCandidatSujet(a.slug, s.slug)).map((a) => a.slug))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: t.sujetMetaTitle(s.theme.label),
        description: s.theme.description,
        url,
        inLanguage: 'fr-FR',
        ...(s.updatedAt ? { dateModified: s.updatedAt } : {}),
        image: absolute(card),
        about: { '@type': 'Event', name: 'Élection présidentielle française de 2027', startDate: '2027-04-18' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: s.items.map((r) => ({
          '@type': 'Question',
          name: `${r.item.concept} : que proposent les candidats à la présidentielle 2027 ?`,
          acceptedAnswer: { '@type': 'Answer', text: `Proposition : « ${r.item.text} » ${summaryOf(r)}` },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.kicker, item: absolute('/programmes') },
          { '@type': 'ListItem', position: 2, name: s.theme.label, item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/programmes">{t.kicker}</Link>
      </p>
      <h1>{t.sujetTitle(s.theme.label)}</h1>
      <p className="lede measure">{s.theme.description}</p>
      <p className="card__meta">
        {s.updatedAt && `${t.updated(formatDate(s.updatedAt))} · `}
        {t.stats(s.positions, s.candidates)}
      </p>

      <nav className="sujet__tabs" aria-label={t.others}>
        {getSujets().map((o) => (
          <Link key={o.slug} href={`/programmes/${o.slug}`} className={`cmp__theme sujet__tab${o.slug === s.slug ? ' is-on' : ''}`} aria-current={o.slug === s.slug ? 'page' : undefined}>
            {o.theme.label}
          </Link>
        ))}
      </nav>

      <p className="small muted sujet__hint">
        <span aria-hidden="true">
          <span className="sujet__key sujet__key--pour" /> {t.sides.pour} <span className="sujet__key sujet__key--entre" /> {t.sides.entre}{' '}
          <span className="sujet__key sujet__key--contre" /> {t.sides.contre} ·{' '}
        </span>
        {t.hint}
      </p>

      <ol className="sujet__list" role="list">
        {s.items.map((r) => (
          <li key={r.item.id}>
            <details id={r.item.id} className="sujet__row">
              <summary className="sujet__head">
                <h2 className="sujet__concept">{r.item.concept}</h2>
                <span className="sujet__text">{r.item.text}</span>
                <SplitBar r={r} />
              </summary>
              <div className="sujet__body">
                <p className="small muted measure">
                  <Glossed text={r.item.explanation} />
                </p>
                <Sides r={r} sujet={s.slug} subPages={subPages} />
                <p className="small muted cmp__unknown">
                  {t.unknown(r.unknown)} {t.strongNote}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ol>
      <OpenFromHash />

      <section className="card section sujet__cta">
        <h2>{t.testTitle}</h2>
        <p>{t.testBody}</p>
        <div className="row">
          <Link href="/test" className="btn btn--primary">
            {t.testCta}
          </Link>
          <Link href={`/comparateur?theme=${s.theme.id}`} className="btn btn--secondary">
            {t.compareCta}
          </Link>
        </div>
      </section>

      <section className="section sujet__share">
        <figure className="sujet__card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card} width={1080} height={1350} loading="lazy" alt={`${s.theme.label} : qui est pour, qui est contre parmi les candidats à la présidentielle 2027.`} />
        </figure>
        <ShareButtons title={t.sujetMetaTitle(s.theme.label)} url={url} text={`${s.theme.label} : qui est pour, qui est contre parmi les candidats 2027, avec les sources.`} imageSrc={card} />
      </section>


      <p className="small muted section">
        {t.empty} <Link href="/methodologie">Méthode</Link> · <Link href="/contact?sujet=correction">{t.error}</Link>
      </p>
    </div>
  )
}

function SplitBar({ r }: { r: SujetItem }) {
  const total = r.count.pour + r.count.entre + r.count.contre
  if (total === 0) return <span className="small muted">{t.unknown(r.unknown)}</span>
  return (
    <span className="sujet__bar" role="img" aria-label={`${t.sides.pour} ${r.count.pour}, ${t.sides.entre} ${r.count.entre}, ${t.sides.contre} ${r.count.contre}`}>
      {SIDES.filter((side) => r.count[side] > 0).map((side) => (
        <span key={side} className={`sujet__seg sujet__seg--${side}`} style={{ flexGrow: r.count[side] }}>
          {r.count[side]}
        </span>
      ))}
    </span>
  )
}

function Sides({ r, sujet, subPages }: { r: SujetItem; sujet: string; subPages: Set<string> }) {
  return (
    <div className="cmp__sides">
      {SIDES.map((side) => {
        const list = r.stances.filter((st) => st.side === side)
        return (
          <div key={side} className={`cmp__side cmp__side--${side}`}>
            <h3 className="cmp__side-title">
              {t.sides[side]} <span className="muted">{list.length}</span>
            </h3>
            {list.length === 0 ? (
              <p className="muted small">{t.nobody}</p>
            ) : (
              <Shuffle role="list">
                {list.map((st) => (
                  <li key={st.slug} className={`bloc-${st.bloc} sujet__who`}>
                    <details>
                      <summary>
                        <span className="nuance__dot" aria-hidden="true" />
                        <span className={st.strong ? 'cmp__strong' : undefined}>{st.name}</span>
                      </summary>
                      <p className="cmp__label">{st.label}</p>
                      {st.quote && <blockquote className="sujet__quote">« {st.quote} »</blockquote>}
                      <p className="small muted">
                        {st.basis && `${BASIS_LABEL[st.basis] ?? st.basis} · `}
                        {st.url ? (
                          <a href={st.url} rel="noopener noreferrer nofollow" target="_blank">
                            {st.publisher || t.source}
                          </a>
                        ) : (
                          st.publisher
                        )}
                        {st.date && ` · ${st.date}`} ·{' '}
                        {subPages.has(st.slug) ? (
                          <Link href={`/candidats/${st.slug}/${sujet}`}>{UI_COPY.candidatSujet.detail}</Link>
                        ) : (
                          <Link href={`/candidats/${st.slug}`}>Fiche</Link>
                        )}
                      </p>
                    </details>
                  </li>
                ))}
              </Shuffle>
            )}
          </div>
        )
      })}
    </div>
  )
}
