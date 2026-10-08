import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActor, getAnnouncedActors, STATUS_LABEL } from '@/lib/actors'
import { itemsByTheme, liveCorpus, questionnaire } from '@/lib/data'
import { BASIS_LABEL, positionLabel } from '@/lib/answers'
import { formatDate } from '@/components/Editorial'
import { absolute } from '@/lib/site'
import fiches from '@content/acteurs/fiches.json'

export const dynamicParams = false

export function generateStaticParams() {
  return getAnnouncedActors().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getActor(slug)
  if (!a) return {}
  return {
    title: `${a.name} : ses positions pour la présidentielle 2027`,
    description: `Les positions de ${a.name} sur ${questionnaire.items.length} sujets (impôts, retraites, sécurité, climat, Europe, institutions…), avec la citation et la source de chacune.`,
    alternates: { canonical: `/candidats/${a.slug}` },
    // Fiche indexée seulement quand elle contient des positions (pas de page vide dans les moteurs)
    robots: { index: Object.keys(liveCorpus.positions[slug] ?? {}).length > 0, follow: true },
  }
}

export default async function ActorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getActor(slug)
  if (!a) notFound()
  const positions = liveCorpus.positions[slug] ?? {}
  const sources = new Map((liveCorpus.sources ?? []).map((s) => [s.id, s]))
  const known = Object.values(positions).filter((p) => !('missing' in p)).length
  const fiche = (fiches as Record<string, { analysis: string; remark: string }>)[slug]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: { '@type': 'Person', name: a.name, ...(a.party ? { affiliation: { '@type': 'Organization', name: a.party } } : {}) },
    url: absolute(`/candidats/${a.slug}`),
    inLanguage: 'fr-FR',
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/candidats">Candidats</Link> · {STATUS_LABEL[a.status]}
      </p>
      <h1>{a.name}</h1>
      <div className="measure">
        <p className="lede">
          {a.party ? `${a.party}. ` : ''}
          {a.status === 'retire' ? `Candidature retirée le ${formatDate(a.retiredAt ?? a.since)}.` : `Annonce le ${formatDate(a.since)}.`}{' '}
          <a href={a.source.url} rel="noopener noreferrer nofollow" target="_blank">
            Source : {a.source.publisher}
          </a>
        </p>
        <p className="muted">
          {known > 0
            ? `${known} positions documentées sur ${questionnaire.items.length}. Chaque position est codée automatiquement à partir d’une source publique ; la citation a été vérifiée dans la page d’origine.`
            : 'Positions en cours de collecte.'}{' '}
          <Link href="/methodologie#codage">Comment c’est codé</Link> · <Link href="/corrections#signaler">Signaler une erreur</Link>
        </p>
      </div>

      {fiche && (
        <section className="card card--featured measure" aria-labelledby="en-bref" style={{ margin: 'var(--s5) 0' }}>
          <h2 id="en-bref" style={{ fontSize: 'var(--h3)' }}>
            En bref
          </h2>
          <p style={{ margin: 0 }}>{fiche.analysis}</p>
          {fiche.remark && (
            <p className="feed__remark humor" style={{ margin: 'var(--s3) 0 0' }}>
              {fiche.remark}
            </p>
          )}
          <p className="small muted" style={{ margin: 'var(--s3) 0 0' }}>
            Synthèse écrite par IA à partir des seules positions citées ci-dessous. La remarque en italique est un commentaire.
          </p>
        </section>
      )}

      {Object.keys(positions).length > 0 && itemsByTheme(questionnaire).map(({ theme, items }) => (
        <section key={theme.id} className="section" aria-labelledby={`t-${theme.id}`}>
          <h2 id={`t-${theme.id}`} style={{ fontSize: 'var(--h3)' }}>
            {theme.label}
          </h2>
          <div className="stack">
            {items.map((it) => {
              const p = positions[it.id]
              const src = p && 'sources' in p ? sources.get(p.sources[0] ?? '') : undefined
              return (
                <div key={it.id} className="card card--flat">
                  <p style={{ margin: 0 }}>
                    <strong>{it.text}</strong>
                  </p>
                  <p style={{ margin: 'var(--s2) 0 0' }}>
                    Position : <strong>{p ? positionLabel(p) : 'Pas encore recherchée'}</strong>
                    {p && 'basis' in p && p.basis && <span className="badge" style={{ marginLeft: 8 }}>{BASIS_LABEL[p.basis]}</span>}
                  </p>
                  {src?.passage && (
                    <blockquote className="small" style={{ margin: 'var(--s2) 0', paddingLeft: 'var(--s3)', borderLeft: '3px solid var(--ink)' }}>
                      « {src.passage} »
                    </blockquote>
                  )}
                  {src?.url && (
                    <p className="small muted" style={{ margin: 0 }}>
                      <a href={src.url} rel="noopener noreferrer nofollow" target="_blank">
                        {src.publisher} — {src.title}
                      </a>
                      {src.date && `, ${src.date}`}
                    </p>
                  )}
                  {p && 'note' in p && p.note && <p className="small muted" style={{ margin: 'var(--s1) 0 0' }}>{p.note}</p>}
                </div>
              )
            })}
          </div>
        </section>
      ))}
      <p>
        <Link className="btn btn--highlight" href="/test">
          Comparer avec mes réponses
        </Link>
      </p>
    </div>
  )
}
