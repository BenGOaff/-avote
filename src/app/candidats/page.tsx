import type { Metadata } from 'next'
import Link from 'next/link'
import { getAnnouncedActors, STATUS_LABEL, candidaturesCollectedAt } from '@/lib/actors'
import { liveCorpus } from '@/lib/data'
import { formatDate } from '@/components/Editorial'

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
