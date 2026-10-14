import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { ShortAnswer } from '@/components/ShortAnswer'
import { Glossed } from '@/components/Gloss'
import { ShareButtons } from '@/components/ShareButtons'
import { getActiveActors, getActor } from '@/lib/actors'
import { BASIS_LABEL } from '@/lib/answers'
import { UI_COPY } from '@/lib/copy'
import { absolute } from '@/lib/site'
import { actorUpdatedAt, candidatSujetSummary, getCandidatSujet, getCandidatSujets } from '@/lib/sujets'

const t = UI_COPY.candidatSujet

export const dynamicParams = false

/** Seulement les candidats actifs, et seulement les sujets où ils ont au moins deux positions sourcées */
export function generateStaticParams() {
  return getActiveActors().flatMap((a) => getCandidatSujets(a.slug).map((cs) => ({ slug: a.slug, sujet: cs.sujet.slug })))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; sujet: string }> }): Promise<Metadata> {
  const { slug, sujet } = await params
  const a = getActor(slug)
  const cs = getCandidatSujet(slug, sujet)
  if (!a || !cs) return {}
  const updated = actorUpdatedAt(slug)
  return {
    title: t.metaTitle(cs.sujet.theme.label, a.name),
    description: t.metaDescription(cs.sujet.theme.label, a.name, cs.known),
    alternates: { canonical: `/candidats/${slug}/${sujet}` },
    openGraph: { type: 'article', ...(updated ? { modifiedTime: updated } : {}) },
  }
}

export default async function CandidatSujetPage({ params }: { params: Promise<{ slug: string; sujet: string }> }) {
  const { slug, sujet } = await params
  const a = getActor(slug)
  const cs = getCandidatSujet(slug, sujet)
  if (!a || !cs) notFound()
  const label = cs.sujet.theme.label
  const url = absolute(`/candidats/${slug}/${sujet}`)
  const updated = actorUpdatedAt(slug)
  const summary = candidatSujetSummary(a.name, cs)
  const known = cs.rows.filter((r) => r.stance)
  const unknown = cs.rows.filter((r) => !r.stance)
  const others = getCandidatSujets(slug).filter((o) => o.sujet.slug !== sujet)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: t.metaTitle(label, a.name),
        url,
        inLanguage: 'fr-FR',
        ...(updated ? { dateModified: updated } : {}),
        about: { '@type': 'Person', name: a.name, ...(a.party ? { affiliation: { '@type': 'Organization', name: a.party } } : {}) },
      },
      {
        '@type': 'FAQPage',
        mainEntity: known.map((r) => ({
          '@type': 'Question',
          name: `${a.name} : pour ou contre « ${r.item.text.replace(/\.$/, '')} » ?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${t.sides[r.stance!.side]} (${r.stance!.label}).${r.stance!.quote ? ` Citation : « ${r.stance!.quote} »` : ''}${r.stance!.publisher ? ` Source : ${r.stance!.publisher}.` : ''}`,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Candidats', item: absolute('/candidats') },
          { '@type': 'ListItem', position: 2, name: a.name, item: absolute(`/candidats/${slug}`) },
          { '@type': 'ListItem', position: 3, name: label, item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/candidats">Candidats</Link> · <Link href={`/candidats/${slug}`}>{a.name}</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {t.title(label, a.name)}
      </h1>
      <p className="lede measure">{t.lede}</p>

      <ShortAnswer updated={updated ? UI_COPY.candidate.updated(formatDate(updated)) : undefined}>
        <p>{summary.lead}</p>
        {summary.sides.map((s) => (
          <div key={s.side}>
            <p style={{ margin: 'var(--s3) 0 var(--s1)' }}>
              <strong>{t.sides[s.side]}</strong>
            </p>
            <ul style={{ margin: 0 }}>
              {s.texts.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </ShortAnswer>

      <ol className="cs-list measure" role="list">
        {known.map(({ item, stance: st }) => (
          <li key={item.id} className="card card--flat">
            <h2 className="cs-list__concept">{item.concept}</h2>
            <p className="small muted" style={{ margin: 0 }}>
              {t.proposition} : <Glossed text={item.text} />
            </p>
            <p style={{ margin: 'var(--s2) 0' }}>
              <span className="stamp">{t.sides[st!.side]}</span> <strong>{st!.label}</strong>
            </p>
            {st!.quote && <blockquote className="sujet__quote">«&nbsp;{st!.quote}&nbsp;»</blockquote>}
            <p className="small muted" style={{ margin: 0 }}>
              {st!.basis && `${BASIS_LABEL[st!.basis as keyof typeof BASIS_LABEL] ?? st!.basis} · `}
              {st!.url ? (
                <a href={st!.url} rel="noopener noreferrer nofollow" target="_blank">
                  {st!.publisher || UI_COPY.programmes.source}
                </a>
              ) : (
                st!.publisher
              )}
              {st!.date && ` · ${st!.date}`} ·{' '}
              <Link href={`/programmes/${sujet}#${item.id}`}>
                {t.compareTitle(item.concept)}
              </Link>
            </p>
          </li>
        ))}
      </ol>

      {unknown.length > 0 && (
        <section className="section measure" aria-labelledby="inconnu">
          <h2 id="inconnu" style={{ fontSize: 'var(--h3)' }}>
            {t.unknownTitle}
          </h2>
          <ul className="small">
            {unknown.map((r) => (
              <li key={r.item.id}>{r.item.text}</li>
            ))}
          </ul>
          <p className="small muted">{t.unknownNote}</p>
        </section>
      )}

      <section className="card section sujet__cta">
        <div className="row">
          <Link href="/test" className="btn btn--primary">
            {t.testCta}
          </Link>
          <Link href={`/programmes/${sujet}`} className="btn btn--secondary">
            {t.compareTitle(label)}
          </Link>
        </div>
        <p style={{ margin: 'var(--s3) 0 0' }}>
          <Link href={`/candidats/${slug}`}>{t.fiche(a.name)}</Link>
        </p>
      </section>

      {others.length > 0 && (
        <nav className="section" aria-labelledby="autres-sujets">
          <h2 id="autres-sujets" style={{ fontSize: 'var(--h3)' }}>
            {t.others}
          </h2>
          <p className="sujet__tabs">
            {others.map((o) => (
              <Link key={o.sujet.slug} href={`/candidats/${slug}/${o.sujet.slug}`} className="cmp__theme sujet__tab">
                {o.sujet.theme.label}
              </Link>
            ))}
          </p>
        </nav>
      )}

      <ShareButtons url={url} title={t.metaTitle(label, a.name)} text={t.metaDescription(label, a.name, cs.known)} />
      <p className="small muted section">
        <Link href="/methodologie#codage">Comment c’est codé</Link> ·{' '}
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/candidats/${slug}/${sujet}`)}`}>Signaler une erreur</Link>
      </p>
    </div>
  )
}
