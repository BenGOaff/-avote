import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/components/Editorial'
import { QuestionShell } from '@/components/QuestionShell'
import { questionPage, speechByParty } from '@/lib/questions-candidats'

const q = questionPage('tele')

export const metadata: Metadata = {
  title: q.metaTitle,
  description: q.description,
  alternates: { canonical: q.path },
}

const nb = (n: number) => n.toLocaleString('fr-FR')

export default function TelePage() {
  const s = speechByParty()
  const top = s.parties[0]
  const second = s.parties[1]
  const period = `du ${formatDate(s.from)} au ${formatDate(s.to)}`
  const shortText = top
    ? `${period[0]!.toUpperCase()}${period.slice(1)}, sur les ${s.services.length} chaînes de télévision et de radio suivies par l’Arcom, le parti le plus présent est ${top.party} : ${nb(top.pct)} % du temps de parole politique${second ? `, devant ${second.party} (${nb(second.pct)} %)` : ''}. Le président de la République et le gouvernement en totalisent ${nb(s.executive.pct)} %. Ces relevés comptent par parti, pas par candidat.`
    : 'Pas de relevé publié.'
  return (
    <QuestionShell
      id="tele"
      shortText={shortText}
      updated={`Relevés de l’Arcom ${period}`}
      short={
        top ? (
          <>
            <p>
              {period[0]!.toUpperCase()}
              {period.slice(1)}, sur les {s.services.length} chaînes de télévision et de radio suivies par l’Arcom, le parti le plus présent est{' '}
              <strong>{top.party}</strong> : {nb(top.pct)} % du temps de parole politique
              {second && (
                <>
                  , devant {second.party} ({nb(second.pct)} %)
                </>
              )}
              .
            </p>
            <p>Le président de la République et le gouvernement en totalisent {nb(s.executive.pct)} %. Ces relevés comptent par parti, pas par candidat.</p>
          </>
        ) : (
          <p>Pas de relevé publié.</p>
        )
      }
      method={
        <>
          <p>
            Les secondes publiées par l’Arcom pour chaque chaîne, additionnées sur les trois derniers mois publiés, sans retouche. La part de chaque parti est
            calculée sur le total président, gouvernement et partis, comme dans les relevés de l’Arcom. Une heure sur une petite radio pèse autant qu’une heure
            au journal de 20 heures : l’audience n’est pas prise en compte.
          </p>
          <p>
            Ces relevés, publiés hors période électorale, comptent par parti : chaque personne est rattachée à son parti. Ils ne donnent pas de chiffre par
            candidat. Dès que l’Arcom publiera des relevés par candidat, ils seront ajoutés ici.
          </p>
          <p className="small">
            Chaînes et radios suivies : {s.services.join(', ')}. Le détail chaîne par chaîne : <Link href="/medias#temps-parole">Qui possède ton info</Link>.
          </p>
        </>
      }
      sources={[s.source]}
    >
      <section className="section measure" aria-labelledby="partis">
        <h2 id="partis" style={{ fontSize: 'var(--h3)' }}>
          Le temps de parole de chaque parti, du plus présent au moins présent
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Parti</th>
                <th scope="col" className="num">
                  Part
                </th>
                <th scope="col" className="num">
                  Heures
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <em>Président de la République et gouvernement</em>
                </td>
                <td className="num">{nb(s.executive.pct)} %</td>
                <td className="num">{nb(s.executive.hours)}</td>
              </tr>
              {s.parties.map((p) => (
                <tr key={p.party}>
                  <td>{p.party}</td>
                  <td className="num">{nb(p.pct)} %</td>
                  <td className="num">{nb(p.hours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          Total : {nb(s.hours)} heures de parole politique sur {s.services.length} chaînes et radios, {period}.
        </p>
      </section>
    </QuestionShell>
  )
}
