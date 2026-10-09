'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { demoCorpus, liveCorpus, questionnaire as set, assertCompatible } from '@/lib/data'
import { computeDimensions, type DimensionResult } from '@/lib/engine/dimensions'
import { rankActors, redLineStatus, type RankingEntry, type RankingResult, type WeightMode } from '@/lib/engine/scoring'
import type { Answers, Corpus, Priorities } from '@/lib/engine/types'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import { loadState, saveState, type LocalVoterState } from '@/lib/local-store'
import { BASIS_LABEL, answerLabel, effectiveAnswers, positionLabel } from '@/lib/answers'
import { resultQuip } from '@/lib/humor'
import { fmt, fmtPct } from '@/components/ScoreBar'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ThemeIcon } from '@/components/ThemeIcon'
import { NuanceTag } from '@/components/Nuance'
import { nuanceOf } from '@/lib/nuances'
import { AgreementLegend, AgreementStrip, Coin, DimensionMeter, DuoScale, Gauge, agreementOf, leanOf } from '@/components/Viz'

const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const R = UI_COPY.results

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
  const demo = corpus.mode === 'demo'

  return (
    <div className="stack">
      <header>
        <p className="kicker">Tes résultats</p>
        <h1 style={{ fontSize: 'var(--h2)' }}>{R.title}</h1>
        <p className="muted">
          {answered} réponses sur {set.items.length} ({fmtPct(answered / set.items.length)}). Calcul fait sur ton appareil, questions v{set.version}.
        </p>
      </header>

      {previousCorpus && (
        <div className="alert alert--info" role="status">
          Les positions des candidats ont changé depuis ton dernier passage (version {previousCorpus} → {corpus.version}). Tes résultats ont été recalculés avec
          les mêmes réponses. <Link href="/corrections">Voir ce qui a changé</Link>
        </div>
      )}

      <VoterCard dims={dims} priorities={state.priorities} redLineCount={state.essentials.filter((id) => answers[id]?.kind === 'value').length} ranking={ranking} demo={demo} />

      {/* Candidats */}
      <section className="section" aria-labelledby="proximites">
        <h2 id="proximites">Et les candidats ?</h2>

        {liveCorpus.actors.length === 0 && (
          <div className="alert alert--info">
            <p className="alert__title">Les positions des candidats sont en cours de collecte.</p>
            <p>
              Chaque position est tirée d’un programme ou d’une déclaration, avec une citation vérifiée dans la source. En attendant, le calcul ci-dessous
              utilise des <strong>candidats fictifs</strong> pour te montrer comment il fonctionne. Dès que les dossiers seront prêts, ton profil (s’il est
              gardé sur cet appareil) sera recalculé ici.
            </p>
          </div>
        )}
        {liveCorpus.actors.length > 0 && (
          <label className="checkbox">
            <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
            <span>Afficher l’exemple avec des candidats fictifs</span>
          </label>
        )}

        <div className="segmented" role="radiogroup" aria-label="Pondération">
          <button role="radio" aria-checked={mode === 'global'} onClick={() => setMode('global')}>
            Thèmes à égalité
          </button>
          <button role="radio" aria-checked={mode === 'priorities'} onClick={() => setMode('priorities')} disabled={!state.priorities}>
            Selon mes jetons
          </button>
        </div>

        {!compatible && <div className="alert alert--correction">Le référentiel des candidats ne correspond pas à cette version des questions. Le calcul est suspendu.</div>}

        {ranking && (
          <>
            {!ranking.ranked ? (
              <div className="alert">
                <p className="alert__title">{R.notComparable}</p>
                <p className="small" style={{ margin: 'var(--s2) 0' }}>
                  {R.notComparableWhy}
                </p>
                <details className="sources">
                  <summary>{R.notComparableDetail}</summary>
                  <ul className="small" style={{ margin: 'var(--s2) 0', paddingLeft: '1.2em' }}>
                    {ranking.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </details>
                <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
                  {R.alphabetical}
                </p>
              </div>
            ) : (
              <Podium entries={ranking.entries.filter((e) => e.classable)} demo={demo} />
            )}
            {ranking.sensitive && <div className="alert alert--info small">{R.sensitive}</div>}

            <div className="legend-box">
              <AgreementLegend />
              <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
                {R.gaugeLegend}
              </p>
            </div>

            <ol className="cands">
              {ranking.entries.map((e, i) => (
                <Fragment key={e.slug}>
                  {ranking.ranked && i === ranking.rankedCount && (
                    <li className="cands__sep">
                      <p className="cands__sep-title">{R.notDocumentedTitle}</p>
                      <p className="small muted">{R.notDocumentedWhy}</p>
                    </li>
                  )}
                <ActorResult
                  e={e}
                  rank={ranking.ranked && e.classable ? i + 1 : null}
                  corpus={corpus}
                  demo={demo}
                  essentials={state.essentials}
                  answers={answers}
                  onHide={() => setHidden([...(state.hiddenActors ?? []), e.slug])}
                />
                </Fragment>
              ))}
            </ol>
            {hidden.size > 0 && (
              <div className="alert" style={{ marginTop: 'var(--s4)' }}>
                <p>
                  Tu as masqué {hidden.size} candidat{hidden.size > 1 ? 's' : ''}. Cette sélection est personnelle ; le classement a été recalculé.
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

      {/* Profil détaillé */}
      <section className="section" aria-labelledby="profil">
        <h2 id="profil">Ton profil, curseur par curseur</h2>
        <p className="muted">Chaque curseur résume tes réponses à quelques questions. C’est une position sur une échelle définie, pas une étiquette politique ni un diagnostic.</p>
        <div className="dims">
          {dims.map((d) => (
            <DimensionCard key={d.id} d={d} />
          ))}
        </div>
        <p className="hint">{R.leanNote}</p>
        <Link href="/test">Modifier mes réponses, mes lignes rouges ou mes jetons</Link>
      </section>

      <section className="section" aria-labelledby="prevenu">
        <h2 id="prevenu">Être prévenu quand ça bouge</h2>
        <p>
          Nouveaux candidats, programmes publiés, positions qui changent : reçois la lettre et reviens recalculer. Ton email n’est jamais relié à tes
          réponses, qui restent sur ce téléphone.
        </p>
        <NewsletterForm />
      </section>

      <section className="section" aria-labelledby="bilan">
        <h2 id="bilan">Garder une trace</h2>
        <p>Un bilan texte avec tes priorités, tes lignes rouges, les désaccords et ce qu’il reste à vérifier. Il est fabriqué sur ton appareil.</p>
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

// ---------------------------------------------------------------------------
// Carte d'électeur : l'essentiel d'un coup d'œil
// ---------------------------------------------------------------------------

function VoterCard({ dims, priorities, redLineCount, ranking, demo }: { dims: DimensionResult[]; priorities: Priorities | null; redLineCount: number; ranking: RankingResult | null; demo: boolean }) {
  const traits = dims
    .filter((d): d is DimensionResult & { index: number } => d.index !== null && Math.abs(d.index - 50) > 10)
    .sort((a, b) => Math.abs(b.index - 50) - Math.abs(a.index - 50))
    .slice(0, 3)
  const top = ranking?.ranked ? ranking.entries[0] : undefined
  // Ex æquo avec le premier : écarts consécutifs sous le seuil et moins de 2 points avec lui
  const tied: RankingEntry[] = []
  if (top)
    for (const e of ranking!.entries.slice(1)) {
      if (e.classable && e.closeToPrevious && (top.rankScore ?? 0) - (e.rankScore ?? 0) < ENGINE_CONFIG.ranking.closeGap) tied.push(e)
      else break
    }
  const quip = resultQuip({ dims, ranking })
  const themes = set.themes.filter((t) => (priorities?.[t.id] ?? 0) > 0).sort((a, b) => (priorities?.[b.id] ?? 0) - (priorities?.[a.id] ?? 0))

  return (
    <section className="vcard" aria-labelledby="vcard-title">
      <div className="vcard__head">
        <h2 id="vcard-title" className="vcard__title">
          {R.cardTitle}
        </h2>
        <span className="stamp">Présidentielle 2027</span>
      </div>

      <div className="vcard__block">
        <p className="vcard__label">{R.cardTraits}</p>
        {traits.length > 0 ? (
          <ul className="traits">
            {traits.map((d) => {
              const l = leanOf(d.index, d.low, d.high)
              return (
                <li key={d.id} className="trait">
                  {l.strength && <span className="trait__strength">{l.strength}</span>}
                  <span className="trait__side">{l.side}</span>
                  <span className="trait__dim">{d.label}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p style={{ margin: 0 }}>Aucun curseur ne s’écarte nettement du milieu : tes réponses sont nuancées partout.</p>
        )}
      </div>

      <div className="vcard__grid">
        <div className="vcard__block">
          <p className="vcard__label">Tes jetons</p>
          {themes.length > 0 ? (
            <ul className="token-bars">
              {themes.map((t) => (
                <li key={t.id}>
                  <ThemeIcon theme={t.id} width={20} height={20} />
                  <span className="token-bars__label">{t.label}</span>
                  <span className="token-bars__coins" role="img" aria-label={`${priorities![t.id]} jeton${priorities![t.id]! > 1 ? 's' : ''}`}>
                    {Array.from({ length: priorities![t.id]! }, (_, i) => (
                      <Coin key={i} size={18} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0 }}>Les sept thèmes à égalité.</p>
          )}
        </div>
        <div className="vcard__block">
          <p className="vcard__label">{R.redLines}</p>
          <p className="vcard__big">{redLineCount}</p>
          <p className="small muted" style={{ margin: 0 }}>
            {redLineCount === 0 ? 'Aucune posée. Tu peux en ajouter depuis le test.' : 'Signalées candidat par candidat ci-dessous.'}
          </p>
        </div>
        <div className="vcard__block">
          <p className="vcard__label">{R.cardMatch}</p>
          {top ? (
            <>
              <p className="vcard__match">
                {[top, ...tied].map((e) => e.name).join(' · ')}
                {demo && <span className="badge badge--demo" style={{ marginLeft: 'var(--s2)' }}>Fictif</span>}
              </p>
              <p className="small muted" style={{ margin: 0 }}>
                {tied.length > 0 ? `${R.tie} : moins de 2 points d’écart.` : `${fmt(top.rankScore ?? 0)} sur 100 sur tes réponses.`}
              </p>
            </>
          ) : (
            <p className="small" style={{ margin: 0 }}>
              {R.cardNoMatch}
            </p>
          )}
        </div>
      </div>
      {quip && <p className="annotation humor vcard__quip">{quip}</p>}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Podium (seulement quand un classement est publiable)
// ---------------------------------------------------------------------------

function Podium({ entries, demo }: { entries: RankingEntry[]; demo: boolean }) {
  const top = entries.slice(0, 3)
  if (top.length < 2) return null
  const order = top.length === 3 ? [top[1]!, top[0]!, top[2]!] : [top[1]!, top[0]!]
  return (
    <figure className="podium-wrap">
      <div className="podium" role="list">
        {order.map((e) => {
          const rank = entries.indexOf(e) + 1
          const score = e.rankScore ?? 0
          return (
            <div key={e.slug} role="listitem" className={`podium__col podium__col--${rank}`} aria-label={`${rank}e : ${e.name}, ${fmt(score)} sur 100`}>
              <span className="podium__name">
                {nuanceOf(e.slug) && <span className={`nuance__dot bloc-${nuanceOf(e.slug)!.bloc}`} aria-hidden="true" />} {e.name}
              </span>
              <span className="podium__score">{fmt(score)}</span>
              <span className="podium__bar" style={{ height: `${30 + score * 1.3}px` }}>
                <span className="podium__rank">{rank}</span>
              </span>
              {e.closeToPrevious && <span className="stamp podium__tie">{R.tie}</span>}
            </div>
          )
        })}
      </div>
      <figcaption className="small muted">
        {R.podiumCaption}
        {demo && ' Candidats fictifs.'}
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Curseur de profil
// ---------------------------------------------------------------------------

function DimensionCard({ d }: { d: DimensionResult }) {
  const l = d.index === null ? null : leanOf(d.index, d.low, d.high)
  return (
    <div className="dim">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong>{d.label}</strong>
        <span className="small muted">
          {d.answered}/{d.total} réponses
        </span>
      </div>
      {d.index === null || !l ? (
        <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
          Pas assez de réponses pour résumer ce point.
        </p>
      ) : (
        <>
          <p className="dim__verdict">
            {l.strength && <span className="dim__strength">{l.strength} </span>}
            {l.side}
          </p>
          <DimensionMeter index={d.index} low={d.low} high={d.high} label={d.label} />
        </>
      )}
      <details style={{ marginTop: 'var(--s2)' }}>
        <summary className="small">Définition</summary>
        <p className="small" style={{ margin: 'var(--s2) 0 0' }}>
          {d.definition}
        </p>
      </details>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Carte candidat
// ---------------------------------------------------------------------------

function ActorResult({
  e,
  rank,
  corpus,
  demo,
  essentials,
  answers,
  onHide,
}: {
  e: RankingEntry
  rank: number | null
  corpus: Corpus
  demo: boolean
  essentials: string[]
  answers: Answers
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
    .filter((x): x is { id: string; status: ReturnType<typeof redLineStatus> } => !!x)
  const textOf = (id: string) => set.items.find((i) => i.id === id)?.concept ?? id
  const sourceOf = new Map((corpus.sources ?? []).map((x) => [x.id, x]))
  const known = s.contributions.filter((c) => c.s !== null)
  const close = known
    .filter((c) => agreementOf(c) === 'proche')
    .sort((a, b) => b.s! - a.s! || b.weight - a.weight)
    .slice(0, 3)
  const far = known
    .filter((c) => agreementOf(c) === 'oppose')
    .sort((a, b) => a.s! - b.s! || b.weight - a.weight)
    .slice(0, 3)

  return (
    <li className="cand">
      <div className="cand__head">
        {rank !== null && <span className="cand__rank">{rank}</span>}
        <h3 className="cand__name">{demo ? e.name : <Link href={`/candidats/${e.slug}`}>{e.name}</Link>}</h3>
        {demo ? <span className="badge badge--demo">Fictif</span> : <NuanceTag slug={e.slug} />}
        {rank !== null && e.closeToPrevious && <span className="stamp">{R.tie}</span>}
      </div>

      <div className="cand__body">
        <Gauge value={s.rankScore} low={s.low} high={s.high} label={e.name} size={104} />
        <p className="small cand__cover">
          Position connue sur <strong>{fmtPct(s.documented)}</strong> de tes réponses. Selon ce qui manque, entre {fmt(s.low)} et {fmt(s.high)}.
        </p>
        <div className="cand__facts">
          <AgreementStrip contributions={s.contributions} themes={set.themes} name={e.name} />
          {close.length > 0 && (
            <p className="cand__line">
              <span className="cand__tag cand__tag--close">{R.closeOn}</span> {close.map((c) => textOf(c.itemId)).join(' · ')}
            </p>
          )}
          {far.length > 0 && (
            <p className="cand__line">
              <span className="cand__tag cand__tag--far">{R.farOn}</span> {far.map((c) => textOf(c.itemId)).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {redLines.length > 0 && (
        <ul className="redlines">
          {redLines.map((r) => (
            <li key={r.id} className={`redlines__item redlines__item--${r.status}`}>
              <span className="stamp">{R.redLineStatus[r.status]}</span> {textOf(r.id)}
            </li>
          ))}
        </ul>
      )}

      <details className="disclosure" style={{ marginTop: 'var(--s4)' }}>
        <summary>{R.why}</summary>
        <div>
          <div className="table-wrap">
            <table>
              <caption className="visually-hidden">Détail du calcul pour {e.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Question</th>
                  <th scope="col">
                    Toi <span className="duo__dot duo__dot--you duo__dot--legend" aria-hidden="true" /> / {demo ? 'candidat' : e.name.split(' ').slice(-1)[0]}{' '}
                    <span className="duo__dot duo__dot--them duo__dot--legend" aria-hidden="true" />
                  </th>
                  <th scope="col">Position attribuée</th>
                  <th scope="col" className="num">
                    Poids
                  </th>
                  <th scope="col" className="num">
                    Proximité
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.contributions.map((c) => (
                  <tr key={c.itemId}>
                    <td>{textOf(c.itemId)}</td>
                    <td>
                      <DuoScale user={c.user} position={c.position} name={e.name} />
                      <span className="hint">
                        <br />
                        {answerLabel(answers[c.itemId])}
                      </span>
                    </td>
                    <td>
                      {positionLabel(c.position)}
                      {c.position && 'basis' in c.position && c.position.basis && (
                        <span className="hint">
                          <br />
                          {BASIS_LABEL[c.position.basis]}
                        </span>
                      )}
                      {c.position && 'sources' in c.position && sourceOf.get(c.position.sources[0] ?? '')?.url && (
                        <>
                          {' · '}
                          <a className="small" href={sourceOf.get(c.position.sources[0] ?? '')!.url!} rel="noopener noreferrer nofollow" target="_blank">
                            source
                          </a>
                        </>
                      )}
                      {c.position && 'note' in c.position && c.position.note && (
                        <span className="hint">
                          <br />
                          {c.position.note}
                        </span>
                      )}
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
            sur 100. Une position inconnue ou ambiguë n’entre pas dans le chiffre central ; elle élargit les bornes. Seuil de désaccord sur une ligne rouge :{' '}
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
  lines.push('', 'MES JETONS')
  if (state.priorities) for (const t of set.themes) lines.push(`- ${t.label} : ${state.priorities[t.id] ?? 0} jeton(s)`)
  else lines.push('- Répartition égale')
  lines.push('', 'MES LIGNES ROUGES')
  if (state.essentials.length === 0) lines.push('- Aucune posée')
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
