import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { getCorrections } from '@/lib/content'
import { formatDate } from '@/components/Editorial'
import { LEGAL, displayEmail } from '@/lib/legal'
import changes from '@content/corpus/changes.json'
import { getAnnouncedActors } from '@/lib/actors'
import { questionnaire } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'Les erreurs corrigées par Ça vote ?, ce qui était faux, la preuve utilisée et l’effet sur les résultats.',
  alternates: { canonical: '/corrections', types: { 'application/rss+xml': '/feed.xml' } },
}

export default function CorrectionsPage() {
  const list = getCorrections()
  return (
    <div className="container">
      <PageHeader kicker="Corrections" title="Ce qui était faux" lede="Chaque correction dit ce qui était faux, la preuve utilisée et ce qui change dans les résultats. Rien n’est effacé en silence." />
      <div className="measure stack">
        {list.length === 0 ? (
          <p className="muted">Aucune correction publiée pour l’instant.</p>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0 }} className="stack">
            {list.map((c) => (
              <li key={c.date + c.object} className="card card--flat">
                <p className="small muted" style={{ margin: 0 }}>
                  {formatDate(c.date)} · {c.object}
                </p>
                <p style={{ margin: 'var(--s2) 0' }}>{c.wasWrong}</p>
                <p className="small" style={{ margin: 0 }}>
                  Preuve : {c.evidence}
                  <br />
                  Effet : {c.effect}
                </p>
              </li>
            ))}
          </ol>
        )}
        <section aria-labelledby="journal">
          <h2 id="journal" style={{ fontSize: 'var(--h3)' }}>
            Journal des positions
          </h2>
          <p className="small muted">Chaque changement de position codée, du plus récent au plus ancien. Valeurs de −2 (tout à fait opposé) à +2 (tout à fait favorable).</p>
          {(changes as { date: string; actor: string; item: string; from: string; to: string }[]).length === 0 ? (
            <p className="muted">Aucun changement enregistré pour l’instant.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Candidat</th>
                    <th scope="col">Question</th>
                    <th scope="col">Avant</th>
                    <th scope="col">Après</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(changes as { date: string; actor: string; item: string; from: string; to: string }[])]
                    .reverse()
                    .slice(0, 60)
                    .map((c) => (
                      <tr key={c.date + c.actor + c.item}>
                        <td className="num">{formatDate(c.date)}</td>
                        <td>{getAnnouncedActors().find((a) => a.slug === c.actor)?.name ?? c.actor}</td>
                        <td>{questionnaire.items.find((i) => i.id === c.item)?.concept ?? c.item}</td>
                        <td>{c.from}</td>
                        <td>{c.to}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section id="signaler" className="card">
          <h2 style={{ fontSize: 'var(--h3)' }}>Signaler une erreur</h2>
          <p>
            Écris à <a href={`mailto:${LEGAL.contactEmail}?subject=Signalement`}>{displayEmail(LEGAL.contactEmail)}</a> avec le lien de la page, ce qui te semble
            faux, et si possible la source qui le montre.
          </p>
          <p className="small muted" style={{ margin: 0 }}>
            Ne colle pas tes réponses au test ni ton résultat dans le message : on n’en a pas besoin.
          </p>
        </section>
      </div>
    </div>
  )
}
