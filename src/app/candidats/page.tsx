import type { Metadata } from 'next'
import Link from 'next/link'
import { getAnnouncedActors, STATUS_LABEL, candidaturesCollectedAt } from '@/lib/actors'
import { liveCorpus } from '@/lib/data'
import { formatDate } from '@/components/Editorial'
import { NuanceTag } from '@/components/Nuance'
import { BLOCS, nuanceOf } from '@/lib/nuances'

export const metadata: Metadata = {
  title: 'Candidats à la présidentielle 2027 : qui a annoncé quoi',
  description: 'La liste des candidatures annoncées pour la présidentielle 2027, chacune avec la source de l’annonce. Avant la liste officielle du Conseil constitutionnel.',
  alternates: { canonical: '/candidats' },
}

export default function CandidatsPage() {
  const actors = getAnnouncedActors()
  const documented = new Set(liveCorpus.actors.map((a) => a.slug))
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">Présidentielle 2027</p>
      <h1>Qui a annoncé sa candidature</h1>
      <div className="measure">
        <p className="lede">
          Une annonce n’est pas une candidature officielle. La liste officielle n’existe qu’après la validation des 500 parrainages par le Conseil
          constitutionnel.
        </p>
        <p className="muted">
          Chaque ligne renvoie à la source de l’annonce. Les positions de chaque personne sont codées automatiquement à partir de leurs programmes et
          déclarations ; chaque citation est vérifiée dans sa source.
        </p>
      </div>

      {actors.length > 0 && <Echiquier actors={actors} />}

      {actors.length === 0 ? (
        <div className="alert alert--info" style={{ marginTop: 'var(--s5)' }}>
          <p className="alert__title">Aucune candidature relevée pour l’instant.</p>
          <p>Dernière mise à jour : {formatDate(candidaturesCollectedAt)}.</p>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 'var(--s5)' }}>
          <table>
            <caption className="visually-hidden">Candidatures annoncées, par ordre alphabétique</caption>
            <thead>
              <tr>
                <th scope="col">Personne</th>
                <th scope="col">Formation indiquée</th>
                <th scope="col">Famille</th>
                <th scope="col">Statut</th>
                <th scope="col">Depuis</th>
                <th scope="col">Source</th>
                <th scope="col">Positions dans le test</th>
              </tr>
            </thead>
            <tbody>
              {actors.map((a) => (
                <tr key={a.slug}>
                  <th scope="row"><Link href={`/candidats/${a.slug}`}>{a.name}</Link></th>
                  <td>{a.party ?? <span className="muted">Non précisée</span>}</td>
                  <td>{nuanceOf(a.slug) ? <NuanceTag slug={a.slug} /> : <span className="muted">Non classé</span>}</td>
                  <td>{STATUS_LABEL[a.status]}</td>
                  <td className="num">{formatDate(a.since)}</td>
                  <td>
                    <a href={a.source.url} rel="noopener noreferrer nofollow" target="_blank">
                      {a.source.publisher}
                    </a>
                  </td>
                  <td>{documented.has(a.slug) ? <Link href={`/candidats/${a.slug}`}>Voir les positions</Link> : <span className="muted">En cours de collecte</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
