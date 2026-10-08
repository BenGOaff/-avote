import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { getCorrections } from '@/lib/content'
import { formatDate } from '@/components/Editorial'
import { LEGAL, displayEmail } from '@/lib/legal'

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
