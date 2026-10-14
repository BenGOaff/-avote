import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/components/Editorial'
import { QuestionShell } from '@/components/QuestionShell'
import { dayLabel } from '@/lib/guides'
import { PARRAINAGES_THRESHOLD, parrainagesDate, parrainagesSource } from '@/lib/parrainages'
import { parrainagesRows, questionPage } from '@/lib/questions-candidats'
import { SPONSORSHIP_CLOSE } from '@/lib/vote-dates'

const q = questionPage('parrainages')

export const metadata: Metadata = {
  title: q.metaTitle,
  description: q.description,
  alternates: { canonical: q.path },
}

const CC = 'Conseil constitutionnel'
const RULES = [
  {
    title: 'Qui peut être candidat à l’élection présidentielle ?',
    publisher: CC,
    url: 'https://presidentielle2022.conseil-constitutionnel.fr/les-candidats/etre-candidat/etre-candidat-e-a-lelection-presidentielle.html',
  },
  {
    title: 'Publication des noms des parrains',
    publisher: CC,
    url: 'https://presidentielle2022.conseil-constitutionnel.fr/les-parrainages/parrainages-les-regles/publication-des-noms-des-parrains.html',
  },
  {
    title: 'Comment est fixée la période de réception des parrainages ?',
    publisher: CC,
    url: 'https://presidentielle2022.conseil-constitutionnel.fr/les-parrainages/parrainages-les-regles/comment-est-fixee-la-periode-de-reception-des-parrainages.html',
  },
]

export default function ParrainagesPage() {
  const data = parrainagesRows()
  const close = dayLabel(SPONSORSHIP_CLOSE)
  const reached = data?.rows.filter((r) => r.reached) ?? []
  const shortText = data
    ? `${reached.length > 0 ? `${reached.length} candidat${reached.length > 1 ? 's ont' : ' a'} atteint les ${PARRAINAGES_THRESHOLD} parrainages validés : ${reached.map((r) => r.name).join(', ')}.` : `Aucun candidat n’a encore atteint les ${PARRAINAGES_THRESHOLD} parrainages validés.`} Décompte du Conseil constitutionnel${parrainagesDate ? ` au ${formatDate(parrainagesDate)}` : ''}. Date limite de réception : ${close} à 18 heures.`
    : `Aucun pour l’instant : le Conseil constitutionnel n’a encore publié aucun parrainage pour 2027. Les élus pourront envoyer leur parrainage après la publication du décret qui convoque les électeurs, jusqu’au ${close} à 18 heures (date calculée à partir de la règle, à confirmer par le décret). Il en faut ${PARRAINAGES_THRESHOLD}, venant d’au moins 30 départements ou collectivités d’outre-mer.`
  return (
    <QuestionShell
      id="parrainages"
      shortText={shortText}
      updated={parrainagesDate ? `Décompte du Conseil constitutionnel au ${formatDate(parrainagesDate)}` : undefined}
      short={<p>{shortText}</p>}
      method={
        <>
          <p>
            Le décompte vient des listes publiées par le Conseil constitutionnel, au moins deux fois par semaine pendant la période de réception. Il est repris
            tel quel, chaque jour, par un programme. Seuls les parrainages validés comptent. Un même département ne peut pas fournir plus de 50 parrainages pour
            un même candidat.
          </p>
          <p>
            500 parrainages ne font pas un candidat : le Conseil vérifie aussi la candidature elle-même, puis publie la liste officielle. Un parrainage ne dit
            pas, à lui seul, si l’élu soutient le programme.
          </p>
          <p className="small">
            Toutes les règles :{' '}
            <Link href="/radar/2026-10-08-parrainages-500-signatures">500 signatures d’élus, 30 départements, et des noms rendus publics</Link>
          </p>
        </>
      }
      sources={parrainagesSource ? [parrainagesSource, ...RULES] : RULES}
    >
      {data && (
        <section className="section measure" aria-labelledby="decompte">
          <h2 id="decompte" style={{ fontSize: 'var(--h3)' }}>
            Parrainages validés, candidat par candidat
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Candidat</th>
                  <th scope="col" className="num">
                    Parrainages validés
                  </th>
                  <th scope="col">Seuil de {PARRAINAGES_THRESHOLD}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.slug}>
                    <td>
                      <Link href={`/candidats/${r.slug}`}>{r.name}</Link>
                    </td>
                    <td className="num">{r.n.toLocaleString('fr-FR')}</td>
                    <td>{r.reached ? 'Atteint' : 'Pas encore'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">Classé du plus grand nombre au plus petit. À égalité, ordre alphabétique.</p>
        </section>
      )}
      <section className="section measure" aria-labelledby="calendrier">
        <h2 id="calendrier" style={{ fontSize: 'var(--h3)' }}>
          Le calendrier
        </h2>
        <ul>
          <li>Ouverture : à la publication au Journal officiel du décret qui convoque les électeurs.</li>
          <li>Date limite de réception : {close} à 18 heures, le sixième vendredi avant le premier tour (date calculée à partir de la règle).</li>
          <li>Ensuite, le Conseil constitutionnel arrête et publie la liste officielle des candidats.</li>
        </ul>
        <p className="small">
          <Link href="/agenda">Les prochains rendez-vous, à ajouter à ton agenda</Link>
        </p>
      </section>
    </QuestionShell>
  )
}
