'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { itemsByTheme, questionnaire as set } from '@/lib/data'
import { ORDINALS, type Answer, type Answers, type Ordinal, type Priorities } from '@/lib/engine/types'
import { emptyState, loadState, saveState, type LocalVoterState } from '@/lib/local-store'
import { answerLabel, effectiveAnswers } from '@/lib/answers'
import { mirrorRemark } from '@/lib/humor'
import { setAudiencePaused } from '@/lib/consent'
import { IconArrowLeft, IconCheck } from '@/components/Icons'
import { ThemeIcon } from '@/components/ThemeIcon'
import { Coin } from '@/components/Viz'
import { TokenBoard } from './TokenBoard'

type Step = { kind: 'intro' } | { kind: 'question'; index: number } | { kind: 'mirror'; themeIndex: number } | { kind: 'priorities' }

const groups = itemsByTheme(set)
const flat = groups.flatMap((g) => g.items)
const TOKENS = 10
// Taille du rond selon la force de la réponse : plus on est tranché, plus le rond est grand
const DOT = { [-2]: 40, [-1]: 30, 0: 22, 1: 30, 2: 40 } as Record<Ordinal, number>

export function TestFlow() {
  const router = useRouter()
  const [state, setState] = useState<LocalVoterState | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    loadState().then((s) => {
      setState(s)
      setLoaded(true)
    })
  }, [])

  // Pendant les questions (y compris sur l'accueil), la mesure d'audience est coupée
  const inTest = step.kind !== 'intro'
  useEffect(() => {
    setAudiencePaused(inTest)
    return () => setAudiencePaused(false)
  }, [inTest])

  // Le focus suit le changement d'écran (lecteurs d'écran, clavier)
  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const update = useCallback((fn: (s: LocalVoterState) => LocalVoterState) => {
    setState((prev) => {
      const next = fn(prev ?? emptyState(set.version))
      void saveState(next)
      return next
    })
  }, [])

  const toggleRedLine = useCallback(
    (id: string) =>
      update((s) => {
        const e = new Set(s.essentials)
        if (e.has(id)) e.delete(id)
        else e.add(id)
        return { ...s, essentials: [...e] }
      }),
    [update],
  )

  const answers = useMemo(() => effectiveAnswers(state, set), [state])
  const answeredCount = Object.keys(answers).length
  const redLines = new Set(state?.essentials ?? [])

  if (!loaded) return <p aria-live="polite">Chargement…</p>

  if (step.kind === 'intro')
    return (
      <Intro
        state={state}
        answeredCount={answeredCount}
        headingRef={headingRef}
        onStart={(persist, restart) => {
          const base = restart || !state ? emptyState(set.version, persist) : { ...state, persist }
          setState(base)
          void saveState(base)
          const firstUnanswered = restart ? 0 : flat.findIndex((i) => !(i.id in effectiveAnswers(base, set)))
          setStep(firstUnanswered === -1 ? { kind: 'priorities' } : { kind: 'question', index: firstUnanswered })
        }}
      />
    )

  if (step.kind === 'question') {
    const item = flat[step.index]
    if (!item) return null
    const themeIndex = groups.findIndex((g) => g.theme.id === item.theme)
    const group = groups[themeIndex]!
    const posInTheme = group.items.findIndex((i) => i.id === item.id)
    const current = answers[item.id]
    const isRed = redLines.has(item.id)

    const go = (a: Answer, advance: boolean) => {
      update((s) => ({
        ...s,
        answers: { ...s.answers, [item.id]: a },
        answeredVersions: { ...s.answeredVersions, [item.id]: item.version },
        cursor: step.index,
      }))
      if (advance) setTimeout(() => next(), 220)
    }
    const next = () => {
      const isLastOfTheme = posInTheme === group.items.length - 1
      if (isLastOfTheme) setStep({ kind: 'mirror', themeIndex })
      else setStep({ kind: 'question', index: step.index + 1 })
    }
    const prev = () => {
      if (step.index === 0) setStep({ kind: 'intro' })
      else if (posInTheme === 0) setStep({ kind: 'mirror', themeIndex: themeIndex - 1 })
      else setStep({ kind: 'question', index: step.index - 1 })
    }
    const selected = current?.kind === 'value' ? current.value : null

    return (
      <div className="narrow">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
          <button className="btn btn--ghost btn--small" onClick={prev}>
            <IconArrowLeft width={18} height={18} /> {UI_COPY.test.back}
          </button>
          <span className="small muted" aria-live="polite">
            Question {step.index + 1} sur {flat.length}
          </span>
        </div>
        <Chapters current={themeIndex} />

        <article className="qcard" key={item.id}>
          <p className="qcard__theme">
            <ThemeIcon theme={group.theme.id} width={22} height={22} />
            {group.theme.label}
            <span className="muted"> · {posInTheme + 1}/{group.items.length}</span>
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="qcard__text">
            {item.text}
          </h1>
          <p className="muted qcard__help">{item.explanation}</p>

          <div className="scale">
            <div role="radiogroup" aria-label="Ta réponse" className="scale__dots">
              {[...ORDINALS].map((v) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={selected === v}
                  aria-label={UI_COPY.test.scale[v + 2]}
                  className={`scale__dot scale__dot--${v < 0 ? 'against' : v > 0 ? 'for' : 'mid'}`}
                  onClick={() => go({ kind: 'value', value: v as Ordinal }, true)}
                >
                  <span style={{ width: DOT[v], height: DOT[v] }}>{selected === v && <IconCheck />}</span>
                </button>
              ))}
            </div>
            <div className="scale__ends" aria-hidden="true">
              <span>{UI_COPY.test.scaleAgainst}</span>
              <span>{UI_COPY.test.scaleFor}</span>
            </div>
            <p className="scale__picked" aria-live="polite">
              {selected !== null ? UI_COPY.test.scale[selected + 2] : ' '}
            </p>
          </div>

          <div className="chips">
            {(
              [
                ['dontknow', UI_COPY.test.dontKnow],
                ['depends', UI_COPY.test.depends],
                ['skip', UI_COPY.test.skip],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                className="chip"
                aria-pressed={current?.kind === kind}
                onClick={() => go(kind === 'depends' ? { kind, note: current?.kind === 'depends' ? current.note : undefined } : { kind }, kind !== 'depends')}
              >
                {label}
              </button>
            ))}
          </div>

          <button className={`redline${isRed ? ' redline--on' : ''}`} aria-pressed={isRed} onClick={() => toggleRedLine(item.id)} title={UI_COPY.test.redLineHint}>
            <span className="redline__box" aria-hidden="true">
              {isRed && <IconCheck />}
            </span>
            {isRed ? UI_COPY.test.redLineOn : UI_COPY.test.redLine}
            <span className="visually-hidden"> : {UI_COPY.test.redLineHint}</span>
          </button>
        </article>

        {current?.kind === 'depends' && (
          <div className="field" style={{ marginTop: 'var(--s4)' }}>
            <label htmlFor="depends-note">{UI_COPY.test.dependsHint}</label>
            <input
              id="depends-note"
              className="input"
              maxLength={120}
              defaultValue={current.note ?? ''}
              onBlur={(e) => go({ kind: 'depends', note: e.target.value.trim() || undefined }, false)}
            />
            <button className="btn" style={{ marginTop: 'var(--s3)' }} onClick={next}>
              {UI_COPY.test.next}
            </button>
          </div>
        )}
        {current && current.kind !== 'depends' && (
          <button className="btn btn--secondary" style={{ marginTop: 'var(--s4)' }} onClick={next}>
            {UI_COPY.test.next}
          </button>
        )}
      </div>
    )
  }

  if (step.kind === 'mirror') {
    const group = groups[step.themeIndex]!
    const remark = mirrorRemark(group.theme.id, group.items.map((i) => i.id), answers)
    const firstOfNext = flat.findIndex((i) => i.theme === groups[step.themeIndex + 1]?.theme.id)
    const isLast = step.themeIndex === groups.length - 1
    return (
      <div className="narrow">
        <Chapters current={step.themeIndex} done />
        <div className="mirror">
          <span className="mirror__icon" aria-hidden="true">
            <ThemeIcon theme={group.theme.id} width={40} height={40} />
          </span>
          <p className="kicker" style={{ margin: 0 }}>
            {UI_COPY.test.chapterDone} · {step.themeIndex + 1}/{groups.length}
          </p>
          <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: 'var(--h2)', margin: 'var(--s2) 0 var(--s4)' }}>
            {group.theme.label}
          </h1>
          <ul className="recap">
            {group.items.map((i) => {
              const a = answers[i.id]
              const isRed = redLines.has(i.id)
              return (
                <li key={i.id} className="recap__row">
                  <span className="recap__concept">{i.concept}</span>
                  <MiniScale answer={a} />
                  <button
                    className={`redline redline--small${isRed ? ' redline--on' : ''}`}
                    aria-pressed={isRed}
                    onClick={() => toggleRedLine(i.id)}
                    aria-label={`${UI_COPY.test.redLine} : ${i.concept}`}
                  >
                    <span className="redline__box" aria-hidden="true">
                      {isRed && <IconCheck />}
                    </span>
                    <span aria-hidden="true">{UI_COPY.test.redLine}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="hint" style={{ margin: 'var(--s3) 0 0' }}>
            {UI_COPY.test.redLineHint}
          </p>
          {remark.fact && <p style={{ margin: 'var(--s4) 0 0' }}>{remark.fact}</p>}
          {remark.humor && (
            <p className="annotation humor" style={{ margin: 'var(--s3) 0 0' }}>
              {remark.humor}
            </p>
          )}
        </div>
        <div className="row" style={{ marginTop: 'var(--s5)' }}>
          <button className="btn" onClick={() => setStep(isLast ? { kind: 'priorities' } : { kind: 'question', index: firstOfNext })}>
            {UI_COPY.test.continue}
          </button>
          <button className="btn btn--ghost" onClick={() => setStep({ kind: 'question', index: flat.findIndex((i) => i.id === group.items[0]!.id) })}>
            Revoir ce chapitre
          </button>
        </div>
      </div>
    )
  }

  // Priorités : 10 jetons
  const p: Priorities = state?.priorities ?? {}
  const left = TOKENS - Object.values(p).reduce((a, b) => a + b, 0)
  const change = (id: string, delta: number) =>
    update((s) => {
      const cur = { ...(s.priorities ?? {}) }
      const total = Object.values(cur).reduce((a, b) => a + b, 0)
      const v = (cur[id] ?? 0) + delta
      if (v < 0 || (delta > 0 && total >= TOKENS)) return s
      cur[id] = v
      return { ...s, priorities: cur }
    })
  return (
    <div className="wide-test">
      <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: 'var(--h2)' }}>
        {UI_COPY.test.prioritiesTitle}
      </h1>
      <p>{UI_COPY.test.prioritiesLede}</p>
      <TokenBoard themes={set.themes} priorities={p} total={TOKENS} onChange={change} />
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn--highlight" disabled={left !== 0} aria-disabled={left !== 0} onClick={() => router.push('/resultats')}>
          {UI_COPY.test.seeResults}
        </button>
        <button
          className="btn btn--secondary"
          onClick={() => {
            update((s) => ({ ...s, priorities: null }))
            router.push('/resultats')
          }}
        >
          {UI_COPY.test.tokensEqual}
        </button>
        {left < TOKENS && (
          <button className="btn btn--ghost" onClick={() => update((s) => ({ ...s, priorities: {} }))}>
            {UI_COPY.test.tokensReset}
          </button>
        )}
      </div>
    </div>
  )
}

/** Les sept chapitres, avec celui en cours. */
function Chapters({ current, done = false }: { current: number; done?: boolean }) {
  return (
    <ol className="chapters" aria-label={`Chapitre ${current + 1} sur ${groups.length}`}>
      {groups.map((g, i) => (
        <li key={g.theme.id} className={`chapters__item${i < current || (done && i === current) ? ' chapters__item--done' : ''}${i === current ? ' chapters__item--current' : ''}`} title={g.theme.label}>
          <ThemeIcon theme={g.theme.id} width={18} height={18} />
        </li>
      ))}
    </ol>
  )
}

/** Ta réponse sur l'échelle, en petit. */
function MiniScale({ answer }: { answer: Answers[string] | undefined }) {
  if (!answer || answer.kind !== 'value') return <span className="recap__none">{answerLabel(answer)}</span>
  return (
    <span className="duo" role="img" aria-label={answerLabel(answer)}>
      {ORDINALS.map((v) => (
        <span key={v} className={`duo__dot${v === answer.value ? ' duo__dot--you' : ''}`} />
      ))}
    </span>
  )
}

function Intro({
  state,
  answeredCount,
  headingRef,
  onStart,
}: {
  state: LocalVoterState | null
  answeredCount: number
  headingRef: React.RefObject<HTMLHeadingElement | null>
  onStart: (persist: 'session' | 'local', restart: boolean) => void
}) {
  const [persist, setPersist] = useState<'session' | 'local'>(state?.persist ?? 'session')
  const startButtons =
    answeredCount > 0 ? (
      <>
        <button className="btn btn--highlight" onClick={() => onStart(persist, false)}>
          Reprendre ({answeredCount}/{set.items.length})
        </button>
        <button className="btn btn--secondary" onClick={() => onStart(persist, true)}>
          Recommencer
        </button>
        <Link className="btn btn--ghost" href="/resultats">
          Mes résultats
        </Link>
      </>
    ) : (
      <button className="btn btn--highlight" onClick={() => onStart(persist, true)}>
        {UI_COPY.test.start}
      </button>
    )
  return (
    <div className="narrow">
      <p className="kicker">Présidentielle 2027</p>
      <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>
        Qu’est-ce qui compte pour toi ?
      </h1>
      <p className="lede">
        {set.items.length} affirmations, une dizaine de minutes. Ensuite, on regarde qui propose quoi, sources à l’appui. Tes réponses restent sur ton
        téléphone.
      </p>
      <div className="row" style={{ marginTop: 'var(--s4)' }}>
        {startButtons}
      </div>

      <ol className="steps" aria-label="Les trois étapes">
        <li>
          <span className="steps__visual" aria-hidden="true">
            {[40, 30, 22, 30, 40].map((d, i) => (
              <span key={i} className="steps__dot" style={{ width: d * 0.6, height: d * 0.6 }} />
            ))}
          </span>
          <strong>{set.items.length} affirmations</strong>
          <span className="small muted">Pour, contre, entre les deux, ou « je ne sais pas ».</span>
        </li>
        <li>
          <span className="steps__visual" aria-hidden="true">
            <Coin size={26} />
            <Coin size={26} />
            <Coin size={26} />
          </span>
          <strong>10 jetons</strong>
          <span className="small muted">Sur les thèmes qui comptent le plus pour toi.</span>
        </li>
        <li>
          <span className="steps__visual" aria-hidden="true">
            <span className="steps__card">
              <span />
              <span />
              <span />
            </span>
          </span>
          <strong>Ta carte d’électeur</strong>
          <span className="small muted">Ton profil et les candidats proches, sources à l’appui.</span>
        </li>
      </ol>

      <ul className="theme-row" aria-label="Les sept thèmes">
        {set.themes.map((t) => (
          <li key={t.id}>
            <ThemeIcon theme={t.id} width={22} height={22} />
            <span>{t.label}</span>
          </li>
        ))}
      </ul>

      <fieldset className="card card--flat" style={{ marginTop: 'var(--s6)' }}>
        <legend className="visually-hidden">{UI_COPY.storage.title}</legend>
        <p style={{ fontWeight: 700, marginBottom: 'var(--s2)' }}>{UI_COPY.storage.title}</p>
        <p className="small">{UI_COPY.storage.body}</p>
        <div role="radiogroup" className="answers">
          {(['session', 'local'] as const).map((k) => (
            <button key={k} role="radio" aria-checked={persist === k} className="answer answer--secondary" onClick={() => setPersist(k)} style={{ alignItems: 'flex-start' }}>
              <span className="answer__check" style={{ marginTop: 2 }}>
                <IconCheck />
              </span>
              <span>
                {k === 'session' ? UI_COPY.storage.session : UI_COPY.storage.local}
                <br />
                <span style={{ fontWeight: 400, fontSize: 'var(--text-small)' }}>{k === 'session' ? UI_COPY.storage.sessionHint : UI_COPY.storage.localHint}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <details className="disclosure" style={{ marginTop: 'var(--s4)' }}>
        <summary>Comment ça marche</summary>
        <div>
          <ul className="small" style={{ paddingLeft: '1.2em', margin: 0 }}>
            <li>Pour chaque affirmation : pour, contre, entre les deux, ou « je ne sais pas ». Tu peux passer et revenir en arrière.</li>
            <li>Si un point est non négociable pour toi, pose une « ligne rouge » : un désaccord sur ce point sera signalé à part, sans changer les scores.</li>
            <li>Ensuite, tu poses 10 jetons sur les thèmes qui comptent le plus pour toi. C’est facultatif.</li>
            <li>Le résultat compare tes réponses aux positions documentées des candidats. Il dit toujours ce qui manque. Ce n’est pas une consigne de vote.</li>
          </ul>
          <p className="hint" style={{ margin: 'var(--s3) 0 0' }}>
            Questions v{set.version}. <Link href="/methodologie#questions">Toutes les questions et le calcul</Link>
          </p>
        </div>
      </details>
    </div>
  )
}
