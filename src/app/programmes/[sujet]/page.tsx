import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShareButtons } from '@/components/ShareButtons'
import { BASIS_LABEL } from '@/lib/answers'
import { UI_COPY } from '@/lib/copy'
import { absolute } from '@/lib/site'
import { getSujet, getSujets, SIDES, summaryOf, type SujetItem } from '@/lib/sujets'

const t = UI_COPY.programmes

export const dynamicParams = false

export function generateStaticParams() {
  return getSujets().map((s) => ({ sujet: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ sujet: string }> }): Promise<Metadata> {
  const { sujet } = await params
  const s = getSujet(sujet)
  if (!s) return {}
  const concepts = s.items.map((r) => r.item.concept).join(', ')
  return {
    title: t.sujetMetaTitle(s.theme.label),
    description: t.sujetMetaDescription(s.theme.label, concepts),
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

      <section className="card card--featured sujet__essentials section" aria-labelledby="essentiel">
        <h2 id="essentiel">{t.essentials}</h2>
        <ul className="sujet__summary" role="list">
          {s.items.map((r) => (
            <li key={r.item.id}>
              <a href={`#${r.item.id}`} className="sujet__summary-link">
                {r.item.text}
              </a>
              <SplitBar r={r} />
            </li>
          ))}
        </ul>
        <p className="small muted sujet__legend" aria-hidden="true">
          <span className="sujet__key sujet__key--pour" /> {t.sides.pour} <span className="sujet__key sujet__key--entre" /> {t.sides.entre}{' '}
          <span className="sujet__key sujet__key--contre" /> {t.sides.contre}
        </p>
      </section>

      <ol className="cmp__items section" role="list">
        {s.items.map((r) => (
          <li key={r.item.id} id={r.item.id} className="cmp__item sujet__item">
            <h2 className="cmp__q">{r.item.concept}</h2>
            <p className="sujet__proposal">
              <span className="muted small">{t.proposal} : </span>« {r.item.text} »
            </p>
            <p className="small muted measure">{r.item.explanation}</p>
            <Sides r={r} />
            <p className="small muted cmp__unknown">
              {t.unknown(r.unknown)} {t.strongNote}
            </p>
          </li>
        ))}
      </ol>

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
          <img src={card} width={1080} height={1350} loading="lazy" alt={`${t.sujetTitle(s.theme.label)} : qui est pour, qui est contre, question par question.`} />
        </figure>
        <ShareButtons title={t.sujetMetaTitle(s.theme.label)} url={url} text={`${s.theme.label} : qui est pour, qui est contre parmi les candidats 2027, avec les sources.`} imageSrc={card} />
      </section>

      <nav className="section" aria-labelledby="autres">
        <h2 id="autres">{t.others}</h2>
        <ul className="row sujet__others" role="list">
          {getSujets()
            .filter((o) => o.slug !== s.slug)
            .map((o) => (
              <li key={o.slug}>
                <Link href={`/programmes/${o.slug}`} className="cmp__theme sujet__other">
                  {o.theme.label}
                </Link>
              </li>
            ))}
        </ul>
      </nav>

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

function Sides({ r }: { r: SujetItem }) {
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
              <ul role="list">
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
                        {st.date && ` · ${st.date}`} · <Link href={`/candidats/${st.slug}`}>Fiche</Link>
                      </p>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
