import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { getCorrections } from '@/lib/content'
import { formatDate } from '@/components/Editorial'
import { LEGAL, displayEmail } from '@/lib/legal'
import changes from '@content/corpus/changes.json'
import { getAnnouncedActors } from '@/lib/actors'
import { questionnaire } from '@/lib/data'
import { REPONSES } from '@/lib/reponses'

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
        <section id="droit-de-reponse" aria-labelledby="reponse-titre">
          <h2 id="reponse-titre" style={{ fontSize: 'var(--h3)' }}>
            Droit de réponse des candidats
          </h2>
          <p>
            Un candidat, son équipe de campagne ou son parti conteste une position, une citation ou une fiche ? Écris à{' '}
            <a href={`mailto:${LEGAL.contactEmail}?subject=Droit%20de%20r%C3%A9ponse`}>{displayEmail(LEGAL.contactEmail)}</a>, objet « Droit de réponse »,
            depuis une adresse officielle de la campagne ou du parti.
          </p>
          <ul>
            <li>La réponse est publiée en entier, sans coupe ni commentaire glissé dedans, ici et sur la fiche du candidat, dans les trois jours suivant sa réception, comme le prévoit la loi pour la confiance dans l’économie numérique.</li>
            <li>Si elle donne une phrase publique du candidat, avec le lien où la lire, la position est vérifiée de la même façon que les autres et corrigée si la phrase le justifie. La correction apparaît dans le journal ci-dessus.</li>
            <li>Sous la réponse, une ligne dit ce qui a été fait : position corrigée, ou maintenue et pourquoi.</li>
          </ul>
          {REPONSES.length === 0 ? (
            <p className="muted">Aucune réponse reçue à ce jour.</p>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0 }} className="stack">
              {REPONSES.map((r) => (
                <li key={r.actor + r.published} className="card card--flat">
                  <p className="small muted" style={{ margin: 0 }}>
                    {formatDate(r.published)} ·{' '}
                    <Link href={`/candidats/${r.actor}`}>{getAnnouncedActors().find((a) => a.slug === r.actor)?.name ?? r.actor}</Link> · {r.from}, reçue le{' '}
                    {formatDate(r.received)}
                  </p>
                  {r.text.split(/\n\s*\n/).map((para, i) => (
                    <p key={i} style={{ margin: 'var(--s2) 0' }}>
                      {para}
                    </p>
                  ))}
                  <p className="small" style={{ margin: 0 }}>
                    Ce qu’on a fait : {r.outcome}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section id="signaler" className="card">
          <h2 style={{ fontSize: 'var(--h3)' }}>Signaler une erreur</h2>
          <p>
            <Link href="/contact?sujet=correction">Envoie une demande de correction</Link> avec le lien de la page, ce qui te semble faux, et si possible la
            source qui le montre. Ou écris à <a href={`mailto:${LEGAL.contactEmail}?subject=Signalement`}>{displayEmail(LEGAL.contactEmail)}</a>.
          </p>
          <p className="small muted" style={{ margin: 0 }}>
            Ne colle pas tes réponses au test ni ton résultat dans le message : on n’en a pas besoin.
          </p>
        </section>
      </div>
    </div>
  )
}
