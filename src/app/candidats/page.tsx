import type { Metadata } from 'next'
import Link from 'next/link'
import { getAnnouncedActors, STATUS_LABEL, candidaturesCollectedAt, pendingVerificationCount } from '@/lib/actors'
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
          Chaque ligne renvoie à la source de l’annonce. Les positions de chaque personne n’entrent dans le test qu’une fois tirées d’un programme ou d’une
          déclaration, puis relues par deux personnes.
        </p>
      </div>

      {actors.length === 0 ? (
        <div className="alert alert--info" style={{ marginTop: 'var(--s5)' }}>
          <p className="alert__title">Liste en cours de vérification.</p>
          <p>
            {pendingVerificationCount} annonces relevées le {formatDate(candidaturesCollectedAt)} sont en relecture. Elles seront publiées une par une, avec leur
            source.
          </p>
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
                  <th scope="row">{a.name}</th>
                  <td>{a.party ?? <span className="muted">Non précisée</span>}</td>
                  <td>{STATUS_LABEL[a.status]}</td>
                  <td className="num">{formatDate(a.since)}</td>
                  <td>
                    <a href={a.source.url} rel="noopener noreferrer nofollow" target="_blank">
                      {a.source.publisher}
                    </a>
                  </td>
                  <td>{documented.has(a.slug) ? 'Dossier publié' : <span className="muted">Dossier en préparation</span>}</td>
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
