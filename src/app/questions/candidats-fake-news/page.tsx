import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/components/Editorial'
import { QuestionShell } from '@/components/QuestionShell'
import { intoxPath, intoxUpdatedAt, VERDICT_LABEL } from '@/lib/intox'
import { intoxByCandidate, questionPage } from '@/lib/questions-candidats'

const q = questionPage('intox')

export const metadata: Metadata = {
  title: q.metaTitle,
  description: q.description,
  alternates: { canonical: q.path },
}

export default function IntoxPage() {
  const { rows, total } = intoxByCandidate()
  const shortText =
    rows.length > 0
      ? `Parmi les ${total} intox démontées que nous suivons, ${rows.map((r) => `${r.items.length} ${r.items.length > 1 ? 'ont été relayées' : 'a été relayée'} par ${r.name}`).join(', ')}, selon les rédactions de fact-checking qui les ont vérifiées. Ce décompte ne dit pas qui ment le plus : il dépend de ce que les rédactions choisissent de vérifier.`
      : `Parmi les ${total} intox démontées que nous suivons, aucune n’est attribuée à un candidat par les rédactions de fact-checking qui les ont vérifiées.`
  const sources = rows.flatMap((r) => r.items.flatMap((x) => x.debunks.slice(0, 1).map((d) => ({ title: d.title, publisher: d.publisher, url: d.url }))))
  return (
    <QuestionShell
      id="intox"
      shortText={shortText}
      updated={intoxUpdatedAt ? `Intox relevées au ${formatDate(intoxUpdatedAt)}` : undefined}
      short={<p>{shortText}</p>}
      method={
        <>
          <p>
            Une intox n’est comptée ici que si une rédaction de fact-checking reconnue l’a démontée et nomme le candidat parmi les personnes qui l’ont
            relayée.{' '}
          </p>
          <p>
            Ce décompte ne mesure ni l’honnêteté ni le nombre total d’erreurs d’un candidat : les rédactions ne vérifient pas tout, et ne vérifient pas tout le
            monde autant. Il montre seulement ce qui a été vérifié et publié.
          </p>
          <p className="small">
            <Link href="/fake-news">Toutes les intox de la campagne</Link> · <Link href="/verifier">Vrai ou faux ? Pose ta question</Link>
          </p>
        </>
      }
      sources={sources}
    >
      {rows.map((r) => (
        <section key={r.slug} className="section measure" aria-labelledby={`c-${r.slug}`}>
          <h2 id={`c-${r.slug}`} style={{ fontSize: 'var(--h3)' }}>
            <Link href={`/candidats/${r.slug}`}>{r.name}</Link> <span className="hint">{r.items.length}</span>
          </h2>
          <ul>
            {r.items.map((x) => (
              <li key={x.id}>
                <Link href={intoxPath(x)}>{x.claim}</Link> <span className="small muted">({VERDICT_LABEL[x.verdict]})</span>
                <br />
                <span className="small">{x.truth}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </QuestionShell>
  )
}
