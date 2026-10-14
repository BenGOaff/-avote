import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShortAnswer } from '@/components/ShortAnswer'
import { Glossed } from '@/components/Gloss'
import { annotate } from '@/lib/lexique'
import { ShareButtons } from '@/components/ShareButtons'
import { Shuffle } from '@/components/Shuffle'
import { BASIS_LABEL } from '@/lib/answers'
import { UI_COPY } from '@/lib/copy'
import { absolute } from '@/lib/site'
import { getActiveActors } from '@/lib/actors'
import { getCandidatSujet, getProposition, getPropositions, propositionPath, propositionSlug, SIDES, summaryOf } from '@/lib/sujets'

const t = UI_COPY.proposition
const p = UI_COPY.programmes

export const dynamicParams = false

export function generateStaticParams() {
  return getPropositions().map(({ sujet, row }) => ({
    sujet: sujet.slug,
    proposition: propositionSlug(row.item),
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ sujet: string; proposition: string }> }): Promise<Metadata> {
  const { sujet, proposition } = await params
  const x = getProposition(sujet, proposition)
  if (!x) return {}
  return {
    title: t.metaTitle(x.row.item.concept),
    description: t.metaDescription(x.row.item.concept, x.row.stances.length),
    alternates: { canonical: propositionPath(sujet, x.row.item) },
    openGraph: {
      type: 'article',
      ...(x.sujet.updatedAt ? { modifiedTime: x.sujet.updatedAt } : {}),
    },
  }
}

export default async function PropositionPage({ params }: { params: Promise<{ sujet: string; proposition: string }> }) {
  const { sujet, proposition } = await params
  const x = getProposition(sujet, proposition)
  if (!x) notFound()
  const { row, unknown } = x
  const { item } = row
  const label = x.sujet.theme.label
  const path = propositionPath(sujet, item)
  const url = absolute(path)
  const summary = summaryOf(row)
  // Candidats qui ont leur page sur ce sujet (au moins deux positions sourcées)
  const subPages = new Set(
    getActiveActors()
      .filter((a) => getCandidatSujet(a.slug, sujet))
      .map((a) => a.slug),
  )
  const skip = new Set(annotate(item.text).used)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url,
        inLanguage: 'fr-FR',
        ...(x.sujet.updatedAt ? { dateModified: x.sujet.updatedAt } : {}),
        mainEntity: [
          {
            '@type': 'Question',
            name: t.metaTitle(item.concept),
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Proposition : « ${item.text} » ${summary}`,
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: p.kicker,
            item: absolute('/programmes'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: label,
            item: absolute(`/programmes/${sujet}`),
          },
          { '@type': 'ListItem', position: 3, name: item.concept, item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <p className="kicker">
        <Link href="/programmes">{p.kicker}</Link> · <Link href={`/programmes/${sujet}`}>{label}</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {t.title(item.concept)}
      </h1>
      <p className="lede measure">{t.lede}</p>

      <ShortAnswer updated={x.sujet.updatedAt ? p.updated(formatDate(x.sujet.updatedAt)) : undefined}>
        <p>
          <strong>{t.proposition}</strong> : <Glossed text={item.text} />
        </p>
        <p>{summary}</p>
      </ShortAnswer>

      <p className="small muted measure">
        <Glossed text={item.explanation} skip={skip} />
      </p>

      <div className="cmp__sides cmp__sides--stack section">
        {SIDES.map((side) => {
          const list = row.stances.filter((st) => st.side === side)
          return (
            <section key={side} className={`cmp__side cmp__side--${side}`} aria-labelledby={`side-${side}`}>
              <h2 id={`side-${side}`} className="cmp__side-title">
                {p.sides[side]} <span className="muted">{list.length}</span>
              </h2>
              {list.length === 0 ? (
                <p className="muted small">{p.nobody}</p>
              ) : (
                <Shuffle role="list">
                  {list.map((st) => (
                    <li key={st.slug} className={`bloc-${st.bloc}`}>
                      <div className="prop__who">
                        <p style={{ margin: 0 }}>
                          <span className="nuance__dot" aria-hidden="true" /> <strong className={st.strong ? 'cmp__strong' : undefined}>{st.name}</strong>
                        </p>
                        <p className="cmp__label">{st.label}</p>
                        {st.quote && <blockquote className="sujet__quote">«&nbsp;{st.quote}&nbsp;»</blockquote>}
                        <p className="small muted">
                          {st.basis && `${BASIS_LABEL[st.basis] ?? st.basis} · `}
                          {st.url ? (
                            <a href={st.url} rel="noopener noreferrer nofollow" target="_blank">
                              {st.publisher || p.source}
                            </a>
                          ) : (
                            st.publisher
                          )}
                          {st.date && ` · ${st.date}`} ·{' '}
                          {subPages.has(st.slug) ? (
                            <Link href={`/candidats/${st.slug}/${sujet}`}>{t.detail}</Link>
                          ) : (
                            <Link href={`/candidats/${st.slug}`}>{t.fiche}</Link>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </Shuffle>
              )}
            </section>
          )
        })}
      </div>
      <p className="small muted">{p.strongNote}</p>

      {unknown.length > 0 && (
        <section className="section measure" aria-labelledby="inconnu">
          <h2 id="inconnu" style={{ fontSize: 'var(--h3)' }}>
            {t.unknownTitle} <span className="hint">{unknown.length}</span>
          </h2>
          <p className="small">
            <Shuffle as="span" className="echiquier__inline">
              {unknown.map((u) => (
                <span key={u.slug}>
                  <Link href={`/candidats/${u.slug}`}>{u.name}</Link>
                </span>
              ))}
            </Shuffle>
          </p>
          <p className="small muted">{t.unknownNote}</p>
        </section>
      )}

      <nav className="section measure" aria-label={label}>
        <ul>
          {x.prev && (
            <li>
              {t.prev} : <Link href={propositionPath(sujet, x.prev.item)}>{x.prev.item.concept}</Link>
            </li>
          )}
          {x.next && (
            <li>
              {t.next} : <Link href={propositionPath(sujet, x.next.item)}>{x.next.item.concept}</Link>
            </li>
          )}
          <li>
            <Link href={`/programmes/${sujet}#${item.id}`}>{t.sujet(label)}</Link>
          </li>
          <li>
            <Link href="/questions">{UI_COPY.questions.hubTitle}</Link>
          </li>
        </ul>
      </nav>

      <section className="card section sujet__cta">
        <h2>{p.testTitle}</h2>
        <p>{p.testBody}</p>
        <div className="row">
          <Link href="/test" className="btn btn--primary">
            {p.testCta}
          </Link>
          <Link href={`/comparateur?theme=${x.sujet.theme.id}`} className="btn btn--secondary">
            {p.compareCta}
          </Link>
        </div>
      </section>

      <ShareButtons url={url} title={t.metaTitle(item.concept)} text={summary} />
      <p className="small muted section">
        {p.empty} <Link href="/methodologie#codage">Comment c’est codé</Link> ·{' '}
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(path)}`}>{p.error}</Link>
      </p>
    </div>
  )
}
