import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShortAnswer } from '@/components/ShortAnswer'
import { Glossed } from '@/components/Gloss'
import { ShareButtons } from '@/components/ShareButtons'
import { UI_COPY } from '@/lib/copy'
import { questionnaire } from '@/lib/data'
import { duelsOf, getCandidateDuel, getCandidateDuels } from '@/lib/duels'
import type { DuelItem, DuelVerdict } from '@/lib/engine/scoring'
import { absolute } from '@/lib/site'
import { propositionPath, stanceOf, sujetSlug } from '@/lib/sujets'

const t = UI_COPY.candidateDuel
const VERDICTS: DuelVerdict[] = ['desaccord', 'nuance', 'accord']

export const dynamicParams = false

export function generateStaticParams() {
  return getCandidateDuels().map((d) => ({ duel: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ duel: string }> }): Promise<Metadata> {
  const { duel } = await params
  const d = getCandidateDuel(duel)
  if (!d) return {}
  return {
    title: t.metaTitle(d.a.name, d.b.name),
    description: t.metaDescription(d.a.name, d.b.name, d.result.both),
    alternates: { canonical: `/comparateur/${d.slug}` },
    openGraph: { type: 'article', ...(d.updatedAt ? { modifiedTime: d.updatedAt } : {}) },
  }
}

const itemById = new Map(questionnaire.items.map((it) => [it.id, it]))
const themeLabel = new Map(questionnaire.themes.map((th) => [th.id, th.label]))

export default async function CandidateDuelPage({ params }: { params: Promise<{ duel: string }> }) {
  const { duel } = await params
  const d = getCandidateDuel(duel)
  if (!d) notFound()
  const { a, b, result } = d
  const url = absolute(`/comparateur/${d.slug}`)
  const by = (v: DuelVerdict) => result.items.filter((x) => x.verdict === v)
  const top = by('desaccord').slice(0, 3)
  const notCompared = questionnaire.items.filter((it) => !it.inactive).length - result.both
  const others = [...duelsOf(a.slug), ...duelsOf(b.slug)].filter((o) => o.slug !== d.slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: t.metaTitle(a.name, b.name),
        url,
        inLanguage: 'fr-FR',
        ...(d.updatedAt ? { dateModified: d.updatedAt } : {}),
        about: [a, b].map((x) => ({ '@type': 'Person', name: x.name, ...(x.party ? { affiliation: { '@type': 'Organization', name: x.party } } : {}) })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Comparateur', item: absolute('/comparateur') },
          { '@type': 'ListItem', position: 2, name: t.title(a.name, b.name), item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/comparateur">Comparateur</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {t.title(a.name, b.name)}
      </h1>
      <p className="lede measure">{t.lede}</p>

      <ShortAnswer updated={d.updatedAt ? UI_COPY.candidate.updated(formatDate(d.updatedAt)) : undefined}>
        <p>{t.counts(result.both, by('desaccord').length, by('nuance').length, by('accord').length)}</p>
        {result.score !== null && (
          <p>
            <strong>{t.score(result.score)}</strong> <span className="small muted">{t.scoreHow}</span>
          </p>
        )}
        {top.length > 0 && (
          <>
            <p style={{ margin: 'var(--s3) 0 var(--s1)' }}>
              <strong>{t.topDisagree}</strong>
            </p>
            <ul style={{ margin: 0 }}>
              {top.map((x) => (
                <li key={x.itemId}>
                  {itemById.get(x.itemId)?.text} <span className="muted">({a.name} : {stanceOf(a.slug, x.itemId)?.label.toLowerCase()} ; {b.name} : {stanceOf(b.slug, x.itemId)?.label.toLowerCase()})</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </ShortAnswer>

      {VERDICTS.map((v) => {
        const list = by(v)
        if (list.length === 0) return null
        return (
          <section key={v} className="section" aria-labelledby={`v-${v}`}>
            <h2 id={`v-${v}`} style={{ fontSize: 'var(--h3)' }}>
              {t.sections[v]} <span className="hint">{list.length}</span>
            </h2>
            <ol className="cs-list measure" role="list">
              {list.map((x) => (
                <DuelRow key={x.itemId} x={x} a={{ slug: a.slug, name: a.name }} b={{ slug: b.slug, name: b.name }} />
              ))}
            </ol>
          </section>
        )
      })}

      {notCompared > 0 && <p className="small muted measure">{t.notCompared(notCompared)}</p>}

      <section className="card section sujet__cta">
        <div className="row">
          <Link href="/test" className="btn btn--primary">
            {t.testCta}
          </Link>
          <Link href="/duel" className="btn btn--secondary">
            {t.duelGame}
          </Link>
        </div>
        <p style={{ margin: 'var(--s3) 0 0' }}>
          <Link href={`/candidats/${a.slug}`}>{t.fiche(a.name)}</Link> · <Link href={`/candidats/${b.slug}`}>{t.fiche(b.name)}</Link>
        </p>
      </section>

      {others.length > 0 && (
        <nav className="section" aria-labelledby="autres-duels">
          <h2 id="autres-duels" style={{ fontSize: 'var(--h3)' }}>
            {t.listTitle}
          </h2>
          <p className="sujet__tabs">
            {others.map((o) => (
              <Link key={o.slug} href={`/comparateur/${o.slug}`} className="cmp__theme sujet__tab">
                {o.a.name} ou {o.b.name}
              </Link>
            ))}
          </p>
        </nav>
      )}

      <ShareButtons url={url} title={t.metaTitle(a.name, b.name)} text={t.counts(result.both, by('desaccord').length, by('nuance').length, by('accord').length)} />
      <p className="small muted section">
        <Link href="/methodologie#codage">Comment c’est codé</Link> ·{' '}
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/comparateur/${d.slug}`)}`}>Signaler une erreur</Link>
      </p>
    </div>
  )
}

function DuelRow({ x, a, b }: { x: DuelItem; a: { slug: string; name: string }; b: { slug: string; name: string } }) {
  const item = itemById.get(x.itemId)
  if (!item) return null
  const theme = themeLabel.get(item.theme)
  return (
    <li className="card card--flat">
      <h3 className="cs-list__concept">{item.concept}</h3>
      <p className="small muted" style={{ margin: 0 }}>
        {UI_COPY.candidatSujet.proposition} : <Glossed text={item.text} />
      </p>
      {[a, b].map((who) => {
        const st = stanceOf(who.slug, x.itemId)
        return (
          <div key={who.slug} style={{ marginTop: 'var(--s3)' }}>
            <p style={{ margin: 0 }}>
              <strong>{who.name}</strong> : {st?.label.toLowerCase()}
            </p>
            {st?.quote && <blockquote className="sujet__quote small">«&nbsp;{st.quote}&nbsp;»</blockquote>}
            {st?.url && (
              <p className="small muted" style={{ margin: 0 }}>
                <a href={st.url} rel="noopener noreferrer nofollow" target="_blank">
                  {st.publisher || UI_COPY.programmes.source}
                </a>
                {st.date && ` · ${st.date}`}
              </p>
            )}
          </div>
        )
      })}
      {theme && (
        <p className="small" style={{ margin: 'var(--s3) 0 0' }}>
          <Link href={propositionPath(sujetSlug(theme), item)}>{t.allCandidates}</Link>
        </p>
      )}
    </li>
  )
}
