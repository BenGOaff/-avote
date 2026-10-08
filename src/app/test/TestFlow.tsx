'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { itemsByTheme, questionnaire as set } from '@/lib/data'
import { ORDINALS, type Answer, type Ordinal, type Priorities } from '@/lib/engine/types'
import { emptyState, loadState, saveState, type LocalVoterState } from '@/lib/local-store'
import { answerLabel, effectiveAnswers } from '@/lib/answers'
import { mirrorRemark } from '@/lib/humor'
import { IconArrowLeft, IconCheck } from '@/components/Icons'

type Step = { kind: 'intro' } | { kind: 'question'; index: number } | { kind: 'mirror'; themeIndex: number } | { kind: 'priorities' } | { kind: 'essentials' }

const groups = itemsByTheme(set)
const flat = groups.flatMap((g) => g.items)
const TOKENS = 10

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

  const answers = useMemo(() => effectiveAnswers(state, set), [state])
  const answeredCount = Object.keys(answers).length

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

    const go = (a: Answer, advance: boolean) => {
      update((s) => ({
        ...s,
        answers: { ...s.answers, [item.id]: a },
        answeredVersions: { ...s.answeredVersions, [item.id]: item.version },
        cursor: step.index,
      }))
      if (advance) setTimeout(() => next(), 180)
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

    return (
      <div className="narrow">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
          <button className="btn btn--ghost btn--small" onClick={prev}>
            <IconArrowLeft width={18} height={18} /> {UI_COPY.test.back}
          </button>
          <span className="small muted" aria-live="polite">
            Question {step.index + 1} sur {flat.length}
          </span>
        </div>
        <div className="progress" aria-hidden="true">
          <div className="progress__bar" style={{ width: `${((step.index + 1) / flat.length) * 100}%` }} />
        </div>
        <p className="kicker" style={{ marginTop: 'var(--s5)' }}>
          {group.theme.label} · {posInTheme + 1}/{group.items.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.25rem)', fontFamily: 'var(--font-ui)', fontWeight: 700, letterSpacing: 0, outline: 'none' }}>
          {item.text}
        </h1>
        <p className="muted">{item.explanation}</p>

        <div role="radiogroup" aria-label="Ta réponse" className="answers" style={{ marginTop: 'var(--s5)' }}>
          {[...ORDINALS].reverse().map((v) => {
            const selected = current?.kind === 'value' && current.value === v
            return (
              <button key={v} role="radio" aria-checked={selected} className="answer" onClick={() => go({ kind: 'value', value: v as Ordinal }, true)}>
                <span className="answer__check">
                  <IconCheck />
                </span>
                {UI_COPY.test.scale[v + 2]}
              </button>
            )
          })}
        </div>
        <div className="answers" style={{ marginTop: 'var(--s4)', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {(
            [
              ['dontknow', UI_COPY.test.dontKnow],
              ['depends', UI_COPY.test.depends],
              ['skip', UI_COPY.test.skip],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              className="answer answer--secondary"
              aria-pressed={current?.kind === kind}
              onClick={() => go(kind === 'depends' ? { kind, note: current?.kind === 'depends' ? current.note : undefined } : { kind }, kind !== 'depends')}
            >
              {label}
            </button>
          ))}
        </div>
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
          <button className="btn btn--secondary" style={{ marginTop: 'var(--s5)' }} onClick={next}>
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
        <p className="kicker">
          {UI_COPY.test.chapterDone} · {step.themeIndex + 1}/{groups.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: 'var(--h2)' }}>
          {group.theme.label}
        </h1>
        <div className="card">
          <p style={{ fontWeight: 700 }}>Ce que tu as répondu</p>
          <ul style={{ paddingLeft: '1.2em', margin: 0 }}>
            {group.items.map((i) => (
              <li key={i.id} style={{ marginBottom: 'var(--s2)' }}>
                {i.concept} : <strong>{answerLabel(answers[i.id])}</strong>
              </li>
            ))}
          </ul>
          {remark.fact && <p style={{ marginTop: 'var(--s4)', marginBottom: 0 }}>{remark.fact}</p>}
          {remark.humor && (
            <p className="annotation humor" style={{ marginTop: 'var(--s3)', marginBottom: 0 }}>
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

  if (step.kind === 'priorities') {
    const p: Priorities = state?.priorities ?? {}
    const used = Object.values(p).reduce((a, b) => a + b, 0)
    const left = TOKENS - used
    const set1 = (id: string, delta: number) =>
      update((s) => {
        const cur = { ...(s.priorities ?? {}) }
        const total = Object.values(cur).reduce((a, b) => a + b, 0)
        const v = (cur[id] ?? 0) + delta
        if (v < 0 || (delta > 0 && total >= TOKENS)) return s
        cur[id] = v
        return { ...s, priorities: cur }
      })
    return (
      <div className="narrow">
        <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: 'var(--h2)' }}>
          {UI_COPY.test.prioritiesTitle}
        </h1>
        <p>{UI_COPY.test.prioritiesLede}</p>
        <p aria-live="polite">
          <strong>
            {left} jeton{left > 1 ? 's' : ''} à placer
          </strong>
        </p>
        <div className="tokens">
          {set.themes.map((t) => (
            <div key={t.id} className="token-row">
              <span>
                <strong>{t.label}</strong>
                <br />
                <span className="hint">{t.description}</span>
              </span>
              <div className="stepper">
                <button className="icon-btn" style={{ border: 'var(--border) solid var(--ink)' }} aria-label={`Retirer un jeton à ${t.label}`} onClick={() => set1(t.id, -1)} disabled={!p[t.id]}>
                  −
                </button>
                <output aria-label={`${p[t.id] ?? 0} jetons pour ${t.label}`}>{p[t.id] ?? 0}</output>
                <button className="icon-btn" style={{ border: 'var(--border) solid var(--ink)' }} aria-label={`Ajouter un jeton à ${t.label}`} onClick={() => set1(t.id, 1)} disabled={left <= 0}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 'var(--s5)' }}>
          <button className="btn" disabled={left !== 0} aria-disabled={left !== 0} onClick={() => setStep({ kind: 'essentials' })}>
            {UI_COPY.test.continue}
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => {
              update((s) => ({ ...s, priorities: null }))
              setStep({ kind: 'essentials' })
            }}
          >
            Garder une répartition égale
          </button>
        </div>
      </div>
    )
  }

  // Exigences essentielles
  const essentials = new Set(state?.essentials ?? [])
  const toggle = (id: string) =>
    update((s) => {
      const e = new Set(s.essentials)
      if (e.has(id)) e.delete(id)
      else e.add(id)
      return { ...s, essentials: [...e] }
    })
  return (
    <div className="narrow">
      <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: 'var(--h2)' }}>
        {UI_COPY.test.essentialsTitle}
      </h1>
      <p>{UI_COPY.test.essentialsLede}</p>
      <div className="stack">
        {groups.map((g) => {
          const answered = g.items.filter((i) => answers[i.id]?.kind === 'value')
          if (answered.length === 0) return null
          return (
            <details key={g.theme.id} className="disclosure">
              <summary>
                {g.theme.label} ({answered.filter((i) => essentials.has(i.id)).length})
              </summary>
              <div>
                {answered.map((i) => (
                  <label key={i.id} className="checkbox">
                    <input type="checkbox" checked={essentials.has(i.id)} onChange={() => toggle(i.id)} />
                    <span>
                      {i.text}
                      <br />
                      <span className="hint">Ta réponse : {answerLabel(answers[i.id])}</span>
                    </span>
                  </label>
                ))}
              </div>
            </details>
          )
        })}
      </div>
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn--highlight" onClick={() => router.push('/resultats')}>
          {UI_COPY.test.seeResults}
        </button>
        <button className="btn btn--ghost" onClick={() => setStep({ kind: 'priorities' })}>
          Revenir aux priorités
        </button>
      </div>
    </div>
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
            <li>Pour chaque affirmation : d’accord, pas d’accord, entre les deux, ou « je ne sais pas ». Tu peux passer et revenir en arrière.</li>
            <li>Ensuite, tu places 10 jetons sur les thèmes qui comptent le plus pour toi. C’est facultatif.</li>
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
