/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAnnouncedActors, STATUS_LABEL, candidaturesCollectedAt } from '@/lib/actors'
import { liveCorpus } from '@/lib/data'
import { formatDate } from '@/components/Editorial'
import { BLOCS, nuanceOf } from '@/lib/nuances'
import { questionnaire } from '@/lib/data'
import { getParcours } from '@/lib/parcours'
import { getPartis, partyOfPeriod } from '@/lib/partis'
import { logoOf, portraitOf } from '@/lib/images'
import { Portrait } from '@/components/Portrait'
import { CASIER_TYPES, casierCounts } from '@/lib/casier'

export const metadata: Metadata = {
  title: 'Candidats à la présidentielle 2027 : qui a annoncé quoi',
  description: 'La liste des candidatures annoncées pour la présidentielle 2027, chacune avec la source de l’annonce. Avant la liste officielle du Conseil constitutionnel.',
  alternates: { canonical: '/candidats' },
}

export default function CandidatsPage() {
  const actors = getAnnouncedActors()
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">Présidentielle 2027</p>
      <h1>Qui a annoncé sa candidature</h1>
      <div className="measure">
        <p className="lede">
          Une annonce n’est pas une candidature officielle. La liste officielle n’existe qu’après la validation des 500 parrainages par le Conseil
          constitutionnel.
        </p>
        <p>
          <Link href="/comparateur">Comparer leurs positions, sujet par sujet</Link> · <Link href="/partis">Les partis derrière eux</Link>
        </p>
        <p className="small muted">Portraits : illustrations générées par IA, dans le même style pour tous.</p>
      </div>

      {actors.length > 0 && <Echiquier actors={actors} />}

      {actors.length === 0 ? (
        <div className="alert alert--info" style={{ marginTop: 'var(--s5)' }}>
          <p className="alert__title">Aucune candidature relevée pour l’instant.</p>
          <p>Dernière mise à jour : {formatDate(candidaturesCollectedAt)}.</p>
        </div>
      ) : (
        <ul className="cand-grid">
          {actors.map((a) => {
            const bloc = nuanceOf(a.slug)?.bloc ?? 'DIV'
            const current = getParcours(a.slug).find((x) => x.to === '')
            const party = current ? partyOfPeriod(current) : getPartis().find((x) => x.name === a.party)
            const logo = party ? logoOf(party.slug) : null
            const role = current?.role && current.role !== 'membre' ? current.role : ''
            const known = Object.values((liveCorpus.positions as Record<string, Record<string, { missing?: boolean }>>)[a.slug] ?? {}).filter((x) => !x.missing).length
            return (
              <li key={a.slug}>
                <article className={`cand-card bloc-${bloc}`}>
                  <Portrait src={portraitOf(a.slug)} name={a.name} bloc={bloc} />
                  <div>
                    <h2 className="cand-card__name">
                      <Link href={`/candidats/${a.slug}`}>{a.name}</Link>
                    </h2>
                    <p className="cand-card__party">
                      {logo && <img src={logo} alt="" />}
                      {a.party ?? <span className="muted">Formation non précisée</span>}
                    </p>
                    {role && <p className="cand-card__meta">{role.charAt(0).toUpperCase() + role.slice(1)}</p>}
                    <p className="cand-card__meta">
                      {STATUS_LABEL[a.status]} le {formatDate(a.since)}
                    </p>
                  </div>
                  <div className="cand-card__docs" aria-label={`${known} positions connues sur ${questionnaire.items.length}`}>
                    <span>
                      <strong>{known}</strong>/{questionnaire.items.length} positions connues
                    </span>
                    <span className="cand-card__bar" aria-hidden="true">
                      <span style={{ width: `${(known / questionnaire.items.length) * 100}%` }} />
                    </span>
                  </div>
                  <CasierLine slug={a.slug} />
                  <a className="cand-card__source muted" href={a.source.url} rel="noopener noreferrer nofollow" target="_blank">
                    Source de l’annonce : {a.source.publisher}
                  </a>
                </article>
              </li>
            )
          })}
        </ul>
      )}
      {actors.some((a) => portraitOf(a.slug)) && <p className="small muted">Portraits : illustrations générées par IA.</p>}
      <p className="small" style={{ marginTop: 'var(--s4)' }}>
        Liste triée par ordre alphabétique. Critères d’inclusion et statuts : <Link href="/methodologie#acteurs">méthode</Link>. Un oubli, une erreur ?{' '}
        <Link href="/corrections#signaler">Signale-le</Link>.
      </p>
    </div>
  )
}

/** L'échiquier : chaque candidat dans le bloc de sa nuance officielle, de l'extrême gauche à l'extrême droite. */
function Echiquier({ actors }: { actors: { slug: string; name: string }[] }) {
  const axis = BLOCS.filter((b) => b.id !== 'DIV')
  const inBloc = (id: string) => actors.filter((a) => nuanceOf(a.slug)?.bloc === id)
  const divers = inBloc('DIV')
  const unclassified = actors.filter((a) => !nuanceOf(a.slug))
  return (
    <section aria-labelledby="echiquier" style={{ marginTop: 'var(--s6)' }}>
      <h2 id="echiquier" style={{ fontSize: 'var(--h3)', margin: 0 }}>
        L’échiquier, selon la grille officielle
      </h2>
      <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
        Nuances du ministère de l’Intérieur, regroupées en blocs. <Link href="/methodologie#couleurs">D’où viennent les couleurs</Link>
      </p>
      <div className="echiquier">
        {axis.map((b) => (
          <div key={b.id} className={`echiquier__col bloc-${b.id}`}>
            <p className="echiquier__head" style={{ margin: 0 }}>
              {b.label} <span className="small muted">{inBloc(b.id).length}</span>
            </p>
            <ul className="echiquier__list">
              {inBloc(b.id).map((a) => (
                <li key={a.slug}>
                  <Link href={`/candidats/${a.slug}`}>{a.name}</Link>
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
      {(divers.length > 0 || unclassified.length > 0) && (
        <div className="echiquier__extra">
          {divers.length > 0 && (
            <span className="bloc-DIV">
              <span className="nuance__dot" aria-hidden="true" /> <strong>Divers</strong> :{' '}
              {divers.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 && ', '}
                  <Link href={`/candidats/${a.slug}`}>{a.name}</Link>
                </span>
              ))}
            </span>
          )}
          {unclassified.length > 0 && (
            <span>
              <span className="nuance__dot" aria-hidden="true" /> <strong>Non classés</strong> (pas de parti indiqué) :{' '}
              {unclassified.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 && ', '}
                  <Link href={`/candidats/${a.slug}`}>{a.name}</Link>
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </section>
  )
}

/** Résumé du casier sur la carte : mêmes catégories pour tous, rien d'affiché tant que la vérification n'est pas faite. */
function CasierLine({ slug }: { slug: string }) {
  const c = casierCounts(slug)
  if (!c) return null
  const parts = CASIER_TYPES.filter((t) => c[t.id] > 0).map((t) => `${c[t.id]} ${(c[t.id] > 1 ? t.label : t.one).toLowerCase()}`)
  return (
    <p className={`cand-card__casier${c.condamnation > 0 ? ' is-condamne' : ''}`}>
      <strong>Casier :</strong> {parts.length > 0 ? parts.join(' · ') : 'aucune décision officielle trouvée'}
    </p>
  )
}
