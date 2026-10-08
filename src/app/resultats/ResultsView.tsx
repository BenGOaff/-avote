'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { demoCorpus, liveCorpus, questionnaire as set, assertCompatible } from '@/lib/data'
import { computeDimensions } from '@/lib/engine/dimensions'
import { rankActors, redLineStatus, type RankingEntry, type WeightMode } from '@/lib/engine/scoring'
import type { Corpus } from '@/lib/engine/types'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import { loadState, saveState, type LocalVoterState } from '@/lib/local-store'
import { answerLabel, effectiveAnswers, positionLabel } from '@/lib/answers'
import { ScoreBar, fmt, fmtPct } from '@/components/ScoreBar'

const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export function ResultsView() {
  const [state, setState] = useState<LocalVoterState | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [mode, setMode] = useState<WeightMode>('global')
  const [useDemo, setUseDemo] = useState(liveCorpus.actors.length === 0)
  const [previousCorpus, setPreviousCorpus] = useState<string | null>(null)

  useEffect(() => {
    loadState().then((s) => {
      // Référentiel changé depuis le dernier passage : on le signale, puis on mémorise la version utilisée
      const current = (liveCorpus.actors.length > 0 ? liveCorpus : demoCorpus).version
      if (s && s.corpusVersion !== current) {
        if (s.corpusVersion) setPreviousCorpus(s.corpusVersion)
        const next = { ...s, corpusVersion: current }
        void saveState(next)
        setState(next)
      } else setState(s)
      setLoaded(true)
      if (s?.priorities) setMode('priorities')
    })
  }, [])

  const corpus: Corpus = useDemo ? demoCorpus : liveCorpus
  const answers = useMemo(() => effectiveAnswers(state, set), [state])
  const dims = useMemo(() => computeDimensions(set, answers), [answers])
  const hidden = new Set(state?.hiddenActors ?? [])
  const actors = corpus.actors.filter((a) => !hidden.has(a.slug))
  const compatible = assertCompatible(set, corpus)
  const ranking = useMemo(
    () => (compatible && actors.length > 0 ? rankActors(set, answers, actors, corpus.positions, { mode, priorities: state?.priorities ?? undefined, essentials: state?.essentials }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, mode, corpus, state?.hiddenActors?.join(','), state?.priorities, state?.essentials, compatible],
  )

  if (!loaded) return <p aria-live="polite">Chargement…</p>
  const answered = Object.values(answers).filter((a) => a.kind === 'value').length
  if (!state || answered === 0)
    return (
      <div className="narrow">
        <h1>Pas encore de réponses ici.</h1>
        <p>Tes réponses restent sur l’appareil où tu as fait le test. Si tu as choisi de ne rien garder, elles ont disparu à la fermeture de l’onglet.</p>
        <Link className="btn btn--highlight" href="/test">
          Faire le test
        </Link>
      </div>
    )

  const setHidden = (slugs: string[]) => {
    const next = { ...state, hiddenActors: slugs }
    setState(next)
    void saveState(next)
  }

  return (
    <div className="stack" style={{ maxWidth: 900 }}>
      <header>
        <p className="kicker">Tes résultats</p>
        <h1 style={{ fontSize: 'var(--h2)' }}>{UI_COPY.results.title}</h1>
        <p className="muted">
          Tu as répondu à {answered} questions sur {set.items.length} ({fmtPct(answered / set.items.length)} de complétude). Calcul fait sur ton appareil, avec les
          questions v{set.version}.
        </p>
      </header>

      {previousCorpus && (
        <div className="alert alert--info" role="status">
          Les positions des candidats ont changé depuis ton dernier passage (version {previousCorpus} → {corpus.version}). Tes résultats ont été recalculés avec
          les mêmes réponses. <Link href="/corrections">Voir ce qui a changé</Link>
        </div>
      )}

      {/* 1. Profil descriptif */}
      <section className="section" aria-labelledby="profil">
        <h2 id="profil">Ce que disent tes réponses</h2>
        <p className="muted">
          Chaque ligne résume tes réponses à quelques questions. C’est une position sur une échelle définie, pas une étiquette politique ni un diagnostic.
        </p>
        <div className="stack">
          {dims.map((d) => (
            <div key={d.id} className="card card--flat">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{d.label}</strong>
                <span className="small muted">
                  {d.answered}/{d.total} réponses
                </span>
              </div>
              {d.index === null ? (
                <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
                  Pas assez de réponses pour résumer ce point.
                </p>
              ) : (
                <>
                  <div
                    role="img"
                    aria-label={`${d.label} : ${fmt(d.index)} sur 100, entre « ${d.low} » (0) et « ${d.high} » (100)`}
                    style={{ position: 'relative', height: 14, margin: 'var(--s3) 0 var(--s1)', borderTop: '2px solid var(--line)', top: 7 }}
                  >
                    <span
                      style={{ position: 'absolute', left: `calc(${d.index}% - 9px)`, top: -10, width: 18, height: 18, borderRadius: '50%', background: 'var(--highlight)', border: '2px solid var(--ink)' }}
                    />
                  </div>
                  <div className="row small muted" style={{ justifyContent: 'space-between', marginTop: 'var(--s3)' }}>
                    <span>{d.low}</span>
                    <span>{d.high}</span>
                  </div>
                </>
              )}
              <details style={{ marginTop: 'var(--s2)' }}>
                <summary className="small">Définition</summary>
                <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
                  {d.definition}
                </p>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Priorités */}
      <section className="section" aria-labelledby="priorites">
        <h2 id="priorites">Tes priorités</h2>
        {state.priorities ? (
          <ul>
            {set.themes
              .filter((t) => (state.priorities?.[t.id] ?? 0) > 0)
              .sort((a, b) => (state.priorities?.[b.id] ?? 0) - (state.priorities?.[a.id] ?? 0))
              .map((t) => (
                <li key={t.id}>
                  {t.label} : {state.priorities?.[t.id]} jeton{(state.priorities?.[t.id] ?? 0) > 1 ? 's' : ''}
                </li>
              ))}
          </ul>
        ) : (
          <p className="muted">Tu as gardé une répartition égale entre les sept thèmes.</p>
        )}
        <Link href="/test">Modifier mes réponses ou mes priorités</Link>
      </section>

      {/* 3. Proximités */}
      <section className="section" aria-labelledby="proximites">
        <h2 id="proximites">Proximité avec les candidats</h2>

        {liveCorpus.actors.length === 0 && (
          <div className="alert alert--info">
            <p className="alert__title">Aucun dossier de candidat n’est encore validé.</p>
            <p>
              Chaque position doit être tirée d’un programme ou d’une déclaration, puis relue par deux personnes avant d’entrer dans le calcul. En attendant, le
              calcul ci-dessous utilise des <strong>candidats fictifs</strong> pour te montrer comment il fonctionne. Quand les dossiers seront prêts, ton profil
              (s’il est gardé sur cet appareil) sera recalculé ici.
            </p>
          </div>
        )}
        {liveCorpus.actors.length > 0 && (
          <label className="checkbox">
            <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
            <span>Afficher l’exemple avec des candidats fictifs</span>
          </label>
        )}

        <div className="row" role="radiogroup" aria-label="Pondération" style={{ margin: 'var(--s4) 0' }}>
          <button className={`btn btn--small ${mode === 'global' ? '' : 'btn--secondary'}`} role="radio" aria-checked={mode === 'global'} onClick={() => setMode('global')}>
            Thèmes à égalité
          </button>
          <button
            className={`btn btn--small ${mode === 'priorities' ? '' : 'btn--secondary'}`}
            role="radio"
            aria-checked={mode === 'priorities'}
            onClick={() => setMode('priorities')}
            disabled={!state.priorities}
          >
            Selon mes priorités
          </button>
        </div>

        {!compatible && <div className="alert alert--correction">Le référentiel des candidats ne correspond pas à cette version des questions. Le calcul est suspendu.</div>}

        {ranking && (
          <>
            {!ranking.ranked ? (
              <div className="alert">
                <p className="alert__title">{UI_COPY.results.notComparable}</p>
                <ul className="small" style={{ margin: 'var(--s2) 0', paddingLeft: '1.2em' }}>
                  {ranking.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <p className="small" style={{ margin: 0 }}>
                  {UI_COPY.results.alphabetical}
                </p>
              </div>
            ) : (
              <p className="small muted">
                Classement sur les {ranking.commonItems.length} questions où tous les candidats affichés ont une position connue ({fmtPct(ranking.commonShare)} du poids de
                tes réponses, {ranking.commonThemes} thèmes sur 7).
              </p>
            )}
            {ranking.sensitive && <div className="alert alert--info small">{UI_COPY.results.sensitive}</div>}

            <ol style={{ listStyle: 'none', padding: 0, margin: 'var(--s4) 0 0', display: 'grid', gap: 'var(--s4)' }}>
              {ranking.entries.map((e) => (
                <ActorResult key={e.slug} e={e} ranked={ranking.ranked} demo={corpus.mode === 'demo'} essentials={state.essentials} answers={answers} onHide={() => setHidden([...(state.hiddenActors ?? []), e.slug])} />
              ))}
            </ol>
            {hidden.size > 0 && (
              <div className="alert" style={{ marginTop: 'var(--s4)' }}>
                <p>
                  Tu as masqué {hidden.size} candidat{hidden.size > 1 ? 's' : ''}. Cette sélection est personnelle ; le socle commun de comparaison a été recalculé.
                </p>
                <button className="btn btn--small btn--secondary" onClick={() => setHidden([])}>
                  Réafficher la liste complète
                </button>
              </div>
            )}
          </>
        )}
        <p className="small" style={{ marginTop: 'var(--s5)' }}>
          Ce chiffre mesure l’écart entre tes réponses et les positions documentées, question par question. Ce n’est ni une probabilité de vote, ni une note de
          compétence ou d’honnêteté. <Link href="/methodologie#calcul">Le calcul en détail</Link>
        </p>
      </section>

      {/* 4. Bilan */}
      <section className="section" aria-labelledby="bilan">
        <h2 id="bilan">Garder une trace</h2>
        <p>Un bilan texte avec tes priorités, tes exigences, les désaccords et ce qu’il reste à vérifier. Il est fabriqué sur ton appareil.</p>
        <div className="row">
          <button className="btn btn--secondary" onClick={() => downloadBilan(state, ranking?.entries ?? [], corpus)}>
            Télécharger mon bilan
          </button>
          <Link className="btn btn--secondary" href="/studio">
            {UI_COPY.share}
          </Link>
        </div>
      </section>
    </div>
  )
}

function ActorResult({
  e,
  ranked,
  demo,
  essentials,
  answers,
  onHide,
}: {
  e: RankingEntry
  ranked: boolean
  demo: boolean
  essentials: string[]
  answers: ReturnType<typeof effectiveAnswers>
  onHide: () => void
}) {
  const s = e.score
  const redLines = essentials
    .map((id) => {
      const a = answers[id]
      if (!a || a.kind !== 'value') return null
      const c = s.contributions.find((x) => x.itemId === id)
      return { id, status: redLineStatus(a.value, c?.position) }
    })
    .filter((x): x is { id: string; status: ReturnType<typeof redLineStatus> } => !!x && x.status !== 'accord')
  const textOf = (id: string) => set.items.find((i) => i.id === id)?.concept ?? id

  return (
    <li className="card">
      {ranked && e.closeToPrevious && <p className="small muted" style={{ marginTop: 0 }}>{UI_COPY.results.close}</p>}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0 }}>{e.name}</h3>
        {demo && <span className="badge badge--demo">Fictif</span>}
      </div>
      <p style={{ margin: 'var(--s3) 0 var(--s2)' }}>
        {UI_COPY.results.scoreLabel} :{' '}
        <strong style={{ fontSize: '1.4rem' }}>{s.observed === null ? 'non calculable' : `${fmt(s.observed)} sur 100`}</strong>
        {ranked && e.commonScore !== null && <span className="small muted"> · socle commun : {fmt(e.commonScore)}</span>}
      </p>
      <ScoreBar value={s.observed} low={s.low} high={s.high} label={e.name} />
      <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
        Positions connues sur {fmtPct(s.coverage)} de tes réponses.
        {s.unknownCount > 0 && ` ${s.unknownCount} position${s.unknownCount > 1 ? 's' : ''} inconnue${s.unknownCount > 1 ? 's' : ''}.`}
        {s.ambiguousCount > 0 && ` ${s.ambiguousCount} ambiguë${s.ambiguousCount > 1 ? 's' : ''}.`} Selon ce qui manque, le résultat se situerait entre {fmt(s.low)} et {fmt(s.high)}.
      </p>

      {redLines.length > 0 && (
        <div className="alert alert--correction" style={{ marginTop: 'var(--s3)' }}>
          <p className="alert__title">Sur tes exigences</p>
          <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
            {redLines.map((r) => (
              <li key={r.id}>
                {textOf(r.id)} :{' '}
                {r.status === 'desaccord' ? 'désaccord documenté' : r.status === 'inconnu' ? 'position inconnue' : 'position ambiguë, désaccord possible'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="disclosure" style={{ marginTop: 'var(--s4)' }}>
        <summary>{UI_COPY.results.why}</summary>
        <div>
          <div className="table-wrap">
            <table>
              <caption className="visually-hidden">Détail du calcul pour {e.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Question</th>
                  <th scope="col">Ta réponse</th>
                  <th scope="col">Position attribuée</th>
                  <th scope="col" className="num">Poids</th>
                  <th scope="col" className="num">Proximité</th>
                </tr>
              </thead>
              <tbody>
                {s.contributions.map((c) => (
                  <tr key={c.itemId}>
                    <td>{textOf(c.itemId)}</td>
                    <td>{answerLabel(answers[c.itemId])}</td>
                    <td>
                      {positionLabel(c.position)}
                      {c.position && 'note' in c.position && c.position.note && <span className="hint"><br />{c.position.note}</span>}
                    </td>
                    <td className="num">{nf1.format(c.weight * 100)}</td>
                    <td className="num">{c.s === null ? (c.kind === 'ambiguous' ? `${nf1.format(c.sMin)}–${nf1.format(c.sMax)}` : '—') : nf1.format(c.s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">
            Proximité d’une question = 1 − écart / 4 (l’échelle va de −2 à +2). Poids = part du thème divisée par le nombre de questions du thème, en points
            sur 100. Une position inconnue ou ambiguë n’entre pas dans le chiffre central ; elle élargit les bornes. Seuil de désaccord sur une exigence :{' '}
            {ENGINE_CONFIG.redLineDistance * 4} crans.
          </p>
        </div>
      </details>
      <button className="btn btn--ghost btn--small" style={{ marginTop: 'var(--s2)' }} onClick={onHide}>
        Masquer ce candidat
      </button>
    </li>
  )
}

function downloadBilan(state: LocalVoterState, entries: RankingEntry[], corpus: Corpus) {
  const answers = effectiveAnswers(state, set)
  const lines: string[] = []
  lines.push('ÇA VOTE ? — MON BILAN', `Fait le ${new Date().toLocaleDateString('fr-FR')} · questions v${set.version} · référentiel ${corpus.version}`, '')
  if (corpus.mode === 'demo') lines.push('ATTENTION : les candidats de ce bilan sont fictifs (démonstration).', '')
  lines.push('CE QUE JE VEUX')
  for (const d of computeDimensions(set, answers)) lines.push(`- ${d.label} : ${d.index === null ? 'pas assez de réponses' : `${Math.round(d.index)}/100 (0 = ${d.low}, 100 = ${d.high})`}`)
  lines.push('', 'MES PRIORITÉS')
  if (state.priorities) for (const t of set.themes) lines.push(`- ${t.label} : ${state.priorities[t.id] ?? 0} jeton(s)`)
  else lines.push('- Répartition égale')
  lines.push('', 'MES EXIGENCES')
  if (state.essentials.length === 0) lines.push('- Aucune marquée')
  for (const id of state.essentials) {
    const it = set.items.find((i) => i.id === id)
    if (it) lines.push(`- ${it.text} (ma réponse : ${answerLabel(answers[id])})`)
  }
  lines.push('', 'PROXIMITÉS (sujets documentés)')
  for (const e of entries) {
    lines.push(`- ${e.name} : ${e.score.observed === null ? 'non calculable' : Math.round(e.score.observed) + '/100'} · couverture ${Math.round(e.score.coverage * 100)} % · bornes ${Math.round(e.score.low)}–${Math.round(e.score.high)}`)
    const unknown = e.score.contributions.filter((c) => c.kind !== 'known').map((c) => set.items.find((i) => i.id === c.itemId)?.concept)
    if (unknown.length) lines.push(`  À vérifier : ${unknown.join(' ; ')}`)
  }
  lines.push('', 'Ce bilan ne contient aucune consigne de vote. Méthode : https://çavote.fr/methodologie')
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ca-vote-mon-bilan.txt'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
