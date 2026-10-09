'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { QUICK_ITEMS, demoCorpus, liveCorpus, questionnaire as set, assertCompatible } from '@/lib/data'
import { computeDimensions, type DimensionResult } from '@/lib/engine/dimensions'
import { rankActors, rareAgreements, redLineStatus, type RankingEntry, type RankingResult, type WeightMode } from '@/lib/engine/scoring'
import type { Answers, Corpus, Priorities } from '@/lib/engine/types'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import { loadState, saveState, type LocalVoterState } from '@/lib/local-store'
import { BASIS_LABEL, answerLabel, effectiveAnswers, positionLabel } from '@/lib/answers'
import { VERDICT_QUIP, resultQuip } from '@/lib/humor'
import { Portrait } from '@/components/Portrait'
import { fmt, fmtPct } from '@/components/ScoreBar'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ThemeIcon } from '@/components/ThemeIcon'
import { NuanceTag } from '@/components/Nuance'
import { nuanceOf } from '@/lib/nuances'
import { AgreementLegend, AgreementStrip, Coin, DimensionMeter, DuoScale, Gauge, agreementOf, leanOf } from '@/components/Viz'

const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const R = UI_COPY.results

/** Portrait et formation d'un candidat, préparés côté serveur (les fichiers d'images y sont repérés). */
export interface ActorMedia {
  portrait: string | null
  party: string
}

export function ResultsView({ media = {} }: { media?: Record<string, ActorMedia> }) {
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
    () => (compatible && actors.length > 0 ? rankActors(set, answers, actors, corpus.positions, { mode, priorities: state?.priorities ?? undefined, essentials: state?.essentials, quick: state?.quick ? QUICK_ITEMS : undefined }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, mode, corpus, state?.hiddenActors?.join(','), state?.priorities, state?.essentials, state?.quick, compatible],
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

      {/* Candidats : verdict, podium, classement compact dépliable */}
      <section aria-labelledby="proximites">
        <h2 id="proximites" className="visually-hidden">
          Les candidats les plus proches de tes réponses
        </h2>
        {!compatible && <div className="alert alert--correction">Le référentiel des candidats ne correspond pas à cette version des questions. Le calcul est suspendu.</div>}
        {liveCorpus.actors.length === 0 && (
          <div className="alert alert--info">
            <p className="alert__title">Les positions des candidats sont en cours de collecte.</p>
            <p>En attendant, le calcul ci-dessous utilise des <strong>candidats fictifs</strong> pour te montrer comment il fonctionne.</p>
          </div>
        )}

        {state.quick && (
          <div className="alert alert--info">
            <p style={{ margin: 0 }}>{R.quickBanner(QUICK_ITEMS.length, set.items.length - QUICK_ITEMS.length)}</p>
            <Link className="btn btn--small btn--secondary" style={{ marginTop: 'var(--s2)' }} href="/test">
              {R.quickContinue(set.items.length - QUICK_ITEMS.length)}
            </Link>
          </div>
        )}
        {ranking &&
          (ranking.ranked ? (
            <Verdict ranking={ranking} media={media} essentials={state.essentials} answers={answers} demo={demo} />
          ) : (
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
          ))}

        {ranking && (
          <>
            <div className="rank__head">
              <h3 className="rank__title">{ranking.ranked ? R.listTitle : R.listTitleUnranked}</h3>
              <div className="segmented segmented--small" role="radiogroup" aria-label="Pondération">
                <button role="radio" aria-checked={mode === 'global'} onClick={() => setMode('global')}>
                  Tous les thèmes pareil
                </button>
                <button role="radio" aria-checked={mode === 'priorities'} onClick={() => setMode('priorities')} disabled={!state.priorities}>
                  Selon mes jetons
                </button>
              </div>
            </div>
            <p className="small muted" style={{ margin: '0 0 var(--s3)' }}>
              {R.listHint}
            </p>
            <ol className="rank">
              {(ranking.ranked ? ranking.entries.slice(0, ranking.rankedCount) : ranking.entries).map((e, i) => (
                <ActorResult
                  key={e.slug}
                  e={e}
                  rank={ranking.ranked ? i + 1 : null}
                  media={media[e.slug]}
                  corpus={corpus}
                  demo={demo}
                  essentials={state.essentials}
                  answers={answers}
                  onHide={() => setHidden([...(state.hiddenActors ?? []), e.slug])}
                />
              ))}
            </ol>
            {ranking.ranked && ranking.entries.length > ranking.rankedCount && (
              <details className="rank__more">
                <summary>
                  {R.notDocumentedTitle} ({ranking.entries.length - ranking.rankedCount})
                </summary>
                <p className="small muted">{R.notDocumentedWhy}</p>
                <ol className="rank">
                  {ranking.entries.slice(ranking.rankedCount).map((e) => (
                    <ActorResult
                      key={e.slug}
                      e={e}
                      rank={null}
                      media={media[e.slug]}
                      corpus={corpus}
                      demo={demo}
                      essentials={state.essentials}
                      answers={answers}
                      onHide={() => setHidden([...(state.hiddenActors ?? []), e.slug])}
                    />
                  ))}
                </ol>
              </details>
            )}
            <details className="disclosure" style={{ marginTop: 'var(--s4)' }}>
              <summary>Lire les couleurs et les jauges</summary>
              <div>
                <AgreementLegend />
                <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
                  {R.gaugeLegend}
                </p>
              </div>
            </details>
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
        {liveCorpus.actors.length > 0 && (
          <label className="checkbox" style={{ marginTop: 'var(--s4)' }}>
            <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
            <span>Afficher l’exemple avec des candidats fictifs</span>
          </label>
        )}
        <p className="small" style={{ marginTop: 'var(--s4)' }}>
          Ce chiffre mesure l’écart entre tes réponses et les positions documentées, question par question. Ce n’est ni une probabilité de vote, ni une note de
          compétence ou d’honnêteté. <Link href="/methodologie#calcul">Le calcul en détail</Link> · <Link href="/comparateur">Comparer les candidats sujet par sujet</Link>
        </p>
      </section>

      {compatible && <RareBlock answers={answers} actors={actors} corpus={corpus} essentials={state.essentials} media={media} />}

      <VoterCard dims={dims} priorities={state.priorities} redLineCount={state.essentials.filter((id) => answers[id]?.kind === 'value').length} ranking={ranking} demo={demo} />

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

/** Accords rares et sujets sans réponse : ce qui distingue un candidat sur ce qui compte pour toi. Aucun effet sur les scores. */
function RareBlock({ answers, actors, corpus, essentials, media }: { answers: Answers; actors: Corpus['actors']; corpus: Corpus; essentials: string[]; media: Record<string, ActorMedia> }) {
  const { rare, silent } = useMemo(() => rareAgreements(set, answers, actors, corpus.positions, essentials), [answers, actors, corpus, essentials])
  if (rare.length === 0 && silent.length === 0) return null
  const item = (id: string) => set.items.find((i) => i.id === id)
  const nameOf = (slug: string) => actors.find((a) => a.slug === slug)?.name ?? slug
  return (
    <section aria-labelledby="rares" className="rare">
      <h2 id="rares">{R.rareTitle}</h2>
      {rare.length > 0 && (
        <>
          <p className="muted">{R.rareLede}</p>
          <ul className="rare__list">
            {rare.map((r) => {
              const it = item(r.itemId)
              if (!it) return null
              return (
                <li key={r.itemId} className="rare__row">
                  <p className="rare__q">
                    <ThemeIcon theme={it.theme} width={18} height={18} />
                    {it.text}
                  </p>
                  <p className="rare__you small">
                    {R.rareYou} : <strong>{answerLabel(answers[r.itemId])}</strong>
                    {essentials.includes(r.itemId) && <span className="stamp"> {R.redFlag}</span>}
                  </p>
                  <ul className="rare__who">
                    {r.agree.map((slug) => (
                      <li key={slug}>
                        <Portrait src={media[slug]?.portrait ?? null} name={nameOf(slug)} bloc={nuanceOf(slug)?.bloc ?? 'DIV'} size={40} />
                        <span>
                          <Link href={`/candidats/${slug}`}>{nameOf(slug)}</Link>
                          <span className="small muted"> · {positionLabel(corpus.positions[slug]?.[r.itemId])}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="small muted" style={{ margin: 0 }}>
                    {R.rareAmong(r.documented)} · <Link href={`/comparateur?theme=${it.theme}&c=${r.agree.join(',')}`}>{R.rareCompare}</Link>
                  </p>
                </li>
              )
            })}
          </ul>
        </>
      )}
      {silent.length > 0 && (
        <details className="disclosure">
          <summary>{R.silentTitle(silent.length)}</summary>
          <div>
            <p className="small muted" style={{ marginTop: 0 }}>
              {R.silentLede}
            </p>
            <ul className="small" style={{ paddingLeft: '1.2em', margin: 0 }}>
              {silent.map((id) => (
                <li key={id}>{item(id)?.text}</li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </section>
  )
}

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
            <p style={{ margin: 0 }}>Tous les thèmes à égalité.</p>
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

function Podium({ entries, demo, media }: { entries: RankingEntry[]; demo: boolean; media: Record<string, ActorMedia> }) {
  const top = entries.slice(0, 3)
  if (top.length < 2) return null
  const order = top.length === 3 ? [top[1]!, top[0]!, top[2]!] : [top[1]!, top[0]!]
  return (
    <figure className="podium-wrap">
      <div className="podium" role="list">
        {order.map((e) => {
          const rank = entries.indexOf(e) + 1
          const score = e.rankScore ?? 0
          const bloc = nuanceOf(e.slug)?.bloc ?? 'DIV'
          return (
            <div key={e.slug} role="listitem" className={`podium__col podium__col--${rank}`} aria-label={`${rank}e : ${e.name}, ${fmt(score)} sur 100`}>
              <Portrait src={media[e.slug]?.portrait ?? null} name={e.name} bloc={bloc} size={rank === 1 ? 96 : 72} />
              <span className="podium__name">{e.name}</span>
              <span className="podium__score">{fmt(score)}</span>
              <span className="podium__bar" style={{ height: `${30 + score * 1.1}px` }}>
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
        {entries.some((e) => media[e.slug]?.portrait) && ' Portraits : illustrations générées par IA.'}
      </figcaption>
    </figure>
  )
}

/** Ce qui départage les deux premiers : les sujets où l'un est nettement plus proche de toi que l'autre. */
function Decisive({ top, second, answers }: { top: RankingEntry; second: RankingEntry; answers: Answers }) {
  const prox = (e: RankingEntry, id: string) => {
    const c = e.score.contributions.find((x) => x.itemId === id)
    if (!c || c.kind === 'unknown') return null
    return c.s ?? (c.sMin + c.sMax) / 2
  }
  const rows = set.items
    .map((it) => ({ it, a: prox(top, it.id), b: prox(second, it.id) }))
    .filter((r): r is { it: (typeof set.items)[number]; a: number; b: number } => r.a !== null && r.b !== null && Math.abs(r.a - r.b) >= 0.5)
    .sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b))
    .slice(0, 3)
  if (rows.length === 0) return null
  const posOf = (e: RankingEntry, id: string) => positionLabel(e.score.contributions.find((x) => x.itemId === id)?.position)
  return (
    <div className="decisive">
      <p className="decisive__title">
        Ce qui départage {top.name} et {second.name}
      </p>
      <ul className="decisive__list">
        {rows.map(({ it, a, b }) => (
          <li key={it.id}>
            <span className="decisive__q">{it.text}</span>
            <span className="small">
              Toi : <strong>{answerLabel(answers[it.id])}</strong> · {top.name} : {posOf(top, it.id)} · {second.name} : {posOf(second, it.id)}{' '}
              <span className="muted">({a > b ? top.name : second.name} plus proche de toi)</span>
            </span>
          </li>
        ))}
      </ul>
      <Link className="small" href="/comparateur">
        Comparer sujet par sujet, avec les citations
      </Link>
    </div>
  )
}

/** Le verdict : en trois lignes, ce qu'il faut retenir avant de déplier quoi que ce soit. */
function Verdict({ ranking, media, essentials, answers, demo }: { ranking: RankingResult; media: Record<string, ActorMedia>; essentials: string[]; answers: Answers; demo: boolean }) {
  const ranked = ranking.entries.slice(0, ranking.rankedCount)
  const top = ranked[0]
  const second = ranked[1]
  if (!top || !second) return null
  const tied = [top, ...ranked.slice(1).filter((e, i) => ranked[i + 1]?.closeToPrevious && (top.rankScore ?? 0) - (e.rankScore ?? 0) < ENGINE_CONFIG.ranking.closeGap)]
  const gap = (top.rankScore ?? 0) - (second.rankScore ?? 0)
  const crossed = essentials.filter((id) => {
    const a = answers[id]
    if (!a || a.kind !== 'value') return false
    return redLineStatus(a.value, top.score.contributions.find((c) => c.itemId === id)?.position) === 'desaccord'
  })
  const conceptOf = (id: string) => set.items.find((i) => i.id === id)?.concept ?? id
  const posed = essentials.filter((id) => answers[id]?.kind === 'value').length
  return (
    <div className="verdict">
      <p className="kicker" style={{ margin: 0 }}>
        Le verdict
      </p>
      <p className="verdict__head">{tied.length > 1 ? R.verdictTie(tied.map((e) => e.name).join(', ')) : R.verdictTop(top.name)}</p>
      <ul className="verdict__facts">
        <li>
          {R.verdictGap(fmt(top.rankScore ?? 0), gap < 1 ? 'moins d’un point' : `${fmt(gap)} point${gap >= 2 ? 's' : ''}`, second.name)}{' '}
          <span className="muted">({R.coverShort(fmtPct(top.score.documented))})</span>
        </li>
        <li>{ranking.sensitive ? R.verdictFragile : R.verdictSolid}</li>
        {posed > 0 && (
          <li className={crossed.length > 0 ? 'verdict__warn' : undefined}>
            {crossed.length > 0 ? R.verdictRedLine(top.name, crossed.map(conceptOf).join(', ')) : R.verdictNoRedLine}
          </li>
        )}
      </ul>
      <Decisive top={top} second={second} answers={answers} />
      <Podium entries={ranked} demo={demo} media={media} />
      <p className="annotation humor verdict__quip">{VERDICT_QUIP}</p>
    </div>
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
  media,
}: {
  e: RankingEntry
  rank: number | null
  media?: ActorMedia
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

  const crossed = redLines.filter((r) => r.status === 'desaccord').length
  const score = s.rankScore
  const bloc = nuanceOf(e.slug)?.bloc ?? 'DIV'
  return (
    <li className={`rank__row bloc-${bloc}`}>
      <details>
        <summary className="rank__sum">
          <span className="rank__n">{rank ?? '·'}</span>
          <Portrait src={media?.portrait ?? null} name={e.name} bloc={bloc} size={44} />
          <span className="rank__who">
            <strong>{e.name}</strong>
            <span className="rank__party">{demo ? 'Fictif' : (media?.party ?? '')}</span>
          </span>
          <span className="rank__meter" aria-hidden="true">
            <span style={{ width: `${score ?? 0}%` }} />
          </span>
          <span className="rank__score">{score === null ? '—' : fmt(score)}</span>
          <span className="rank__cover">
            {R.coverShort(fmtPct(s.documented))}
            {rank !== null && e.closeToPrevious && <span className="rank__tie"> · {R.tie.toLowerCase()}</span>}
          </span>
          <span className="rank__flags">
            {crossed > 0 && <span className="stamp stamp--alert">{R.redFlag}</span>}
          </span>
        </summary>
        <div className="rank__body">
      <div className="cand__head">
        {demo ? <span className="badge badge--demo">Fictif</span> : <NuanceTag slug={e.slug} />}
        {!demo && <Link href={`/candidats/${e.slug}`}>{R.seeFiche}</Link>}
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
        </div>
      </details>
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
