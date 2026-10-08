import { demoCorpus, questionnaire } from '@/lib/data'
import { rankActors } from '@/lib/engine/scoring'
import type { Answers, Ordinal } from '@/lib/engine/types'
import { ScoreBar, fmt, fmtPct } from './ScoreBar'

// Réponses synthétiques fixes, uniquement pour montrer à quoi ressemble un résultat.
const SAMPLE: Answers = Object.fromEntries(
  questionnaire.items.map((it, i) => [it.id, i % 9 === 4 ? { kind: 'dontknow' as const } : { kind: 'value' as const, value: ((i * 7) % 5) - 2 as Ordinal }]),
)

export function ExampleResult() {
  const r = rankActors(questionnaire, SAMPLE, demoCorpus.actors.slice(0, 3), demoCorpus.positions, { mode: 'global' })
  return (
    <figure className="card card--featured" style={{ margin: 0 }}>
      <figcaption className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
        <strong>Exemple de résultat</strong>
        <span className="badge badge--demo">Candidats fictifs</span>
      </figcaption>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--s4)' }}>
        {r.entries.map((e) => (
          <li key={e.slug}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span>{e.name}</span>
              <strong>{e.score.observed === null ? '—' : `${fmt(e.score.observed)} sur 100`}</strong>
            </div>
            <ScoreBar value={e.score.observed} low={e.score.low} high={e.score.high} label={e.name} />
            <p className="small muted" style={{ margin: 'var(--s1) 0 0' }}>
              Positions connues sur {fmtPct(e.score.coverage)} de tes réponses
              {e.score.unknownCount > 0 && ` · ${e.score.unknownCount} inconnue${e.score.unknownCount > 1 ? 's' : ''}`}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  )
}
