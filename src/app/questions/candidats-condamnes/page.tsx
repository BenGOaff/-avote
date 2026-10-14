import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/components/Editorial'
import { QuestionShell } from '@/components/QuestionShell'
import { Shuffle } from '@/components/Shuffle'
import { CASIER_CHECKED_AT, CASIER_TYPES, casierDate } from '@/lib/casier'
import { UI_COPY } from '@/lib/copy'
import { casierRows, questionPage, type CasierRow } from '@/lib/questions-candidats'

const q = questionPage('condamnes')

export const metadata: Metadata = {
  title: q.metaTitle,
  description: q.description,
  alternates: { canonical: q.path },
}

/** En-têtes courts : le tableau tient sur un téléphone */
const SHORT = { condamnation: 'Condamn. définitives', 'en-cours': 'En cours', relaxe: 'Relaxes', sanction: 'Autres' } as const

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

export default function CondamnesPage() {
  const { rows, unchecked } = casierRows()
  const convicted = rows.filter((r) => r.counts.condamnation > 0)
  const pending = rows.filter((r) => r.counts['en-cours'] > 0)
  const list = (rs: CasierRow[], key: 'condamnation' | 'en-cours') => rs.map((r) => `${r.name} (${r.counts[key]})`).join(', ')
  const lead =
    convicted.length > 0
      ? `Sur les ${rows.length} candidats dont on a relu les décisions officielles, ${plural(convicted.length, 'a', 'ont')} au moins une condamnation définitive : ${list(convicted, 'condamnation')}.`
      : `Sur les ${rows.length} candidats dont on a relu les décisions officielles, aucun n’a de condamnation définitive relevée.`
  const lead2 =
    pending.length > 0
      ? `${plural(pending.length, 'candidat est visé', 'candidats sont visés')} par une procédure en cours, avec la présomption d’innocence : ${list(pending, 'en-cours')}.`
      : ''
  const lead3 = 'Un nombre ne mesure pas la gravité : une amende pour diffamation et une peine d’inéligibilité comptent chacune pour une.'
  const lead4 = unchecked.length > 0 ? `Pas encore relus : ${unchecked.map((u) => u.name).join(', ')}.` : ''
  const shortText = [lead, lead2, lead3, lead4].filter(Boolean).join(' ')
  const sources = rows.flatMap((r) =>
    r.entries
      .filter((e) => e.type === 'condamnation' || e.type === 'en-cours')
      .map((e) => ({
        title: `${r.name} : ${e.title}`,
        publisher: e.publisher,
        url: e.url,
      })),
  )
  return (
    <QuestionShell
      id="condamnes"
      shortText={shortText}
      updated={UI_COPY.questions.updated(formatDate(CASIER_CHECKED_AT))}
      short={
        <>
          <p>{lead}</p>
          {lead2 && <p>{lead2}</p>}
          <p>{lead3}</p>
          {lead4 && <p className="small">{lead4}</p>}
        </>
      }
      method={
        <>
          <p>
            Seules les décisions et étapes officielles qui visent la personne du candidat, chacune avec une source et une citation vérifiée. Une condamnation
            n’est dite « définitive » que si plus aucun recours n’est possible ou en cours ; sinon, c’est une procédure en cours, avec la présomption
            d’innocence. Quand l’issue d’un appel n’a pas pu être établie, le doute profite à la personne. Les relaxes et les non-lieux sont comptés au même
            rang.
          </p>
          <p>
            Ne sont pas retenus : plaintes sans suite judiciaire, enquêtes de presse, ouvertures d’enquête sans mise en examen, affaires d’un proche ou d’un
            parti.
          </p>
          <p className="small">
            <Link href="/methodologie#casier">La règle complète</Link>
          </p>
        </>
      }
      sources={sources}
    >
      <section className="section measure" aria-labelledby="decompte">
        <h2 id="decompte" style={{ fontSize: 'var(--h3)' }}>
          Le décompte, candidat par candidat
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Candidat</th>
                {CASIER_TYPES.map((t) => (
                  <th key={t.id} scope="col" className="num">
                    <abbr title={t.label}>{SHORT[t.id]}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug}>
                  <td>
                    <Link href={`/candidats/${r.slug}#casier`}>{r.name}</Link>
                  </td>
                  {CASIER_TYPES.map((t) => (
                    <td key={t.id} className="num">
                      {r.counts[t.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">Classé par condamnations définitives, puis par procédures en cours. À égalité, ordre alphabétique.</p>
      </section>

      {(['condamnation', 'en-cours'] as const).map((type) => {
        const withType = rows.filter((r) => r.counts[type] > 0)
        if (withType.length === 0) return null
        const label = CASIER_TYPES.find((t) => t.id === type)!.label
        return (
          <section key={type} className="section measure" aria-labelledby={`detail-${type}`}>
            <h2 id={`detail-${type}`} style={{ fontSize: 'var(--h3)' }}>
              {label} : le détail
            </h2>
            {type === 'en-cours' && <p className="small">Pas de décision définitive : présomption d’innocence.</p>}
            {withType.map((r) => (
              <div key={r.slug} style={{ marginBottom: 'var(--s4)' }}>
                <h3
                  style={{
                    fontSize: 'var(--text-body)',
                    margin: '0 0 var(--s1)',
                  }}
                >
                  <Link href={`/candidats/${r.slug}#casier`}>{r.name}</Link>
                </h3>
                <ul className="small" style={{ margin: 0 }}>
                  {r.entries
                    .filter((e) => e.type === type)
                    .map((e) => (
                      <li key={e.title + e.date}>
                        <strong>{e.title}</strong> ({casierDate(e.date)}, {e.body}) : {e.decision}{' '}
                        <a href={e.url} rel="noopener noreferrer nofollow" target="_blank">
                          Source : {e.publisher}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </section>
        )
      })}

      {unchecked.length > 0 && (
        <section className="section measure" aria-labelledby="non-relus">
          <h2 id="non-relus" style={{ fontSize: 'var(--h3)' }}>
            Pas encore relus <span className="hint">{unchecked.length}</span>
          </h2>
          <p className="small">
            <Shuffle as="span" className="echiquier__inline">
              {unchecked.map((u) => (
                <span key={u.slug}>
                  <Link href={`/candidats/${u.slug}`}>{u.name}</Link>
                </span>
              ))}
            </Shuffle>
          </p>
          <p className="small muted">Leur absence du décompte ne veut pas dire qu’ils n’ont aucune décision : on ne l’a pas encore vérifié.</p>
        </section>
      )}
    </QuestionShell>
  )
}
