'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { QUICK_ITEMS, liveCorpus, questionnaire as set } from '@/lib/data'
import { duelAgreement, rankActors, type DuelResult } from '@/lib/engine/scoring'
import { ORDINALS, type Answer, type Answers, type Ordinal } from '@/lib/engine/types'
import { effectiveAnswers, answerLabel } from '@/lib/answers'
import { loadState } from '@/lib/local-store'
import { setAudiencePaused } from '@/lib/consent'
import { duelQuip } from '@/lib/humor'
import { cssFamily, fitText, loadImage } from '@/lib/canvas'
import { ThemeIcon } from '@/components/ThemeIcon'
import { decodeDuel, encodeDuel, linkVersion } from '@/lib/duel-link'

/**
 * Le duel : deux personnes, un seul appareil, les questions de la version rapide.
 * Les réponses vivent dans l'état React de cette page : rien n'est écrit dans le navigateur, rien n'est envoyé.
 * Le joueur 1 peut reprendre ses réponses au test déjà gardées sur l'appareil (lecture seule).
 * À distance : les réponses du joueur 1 partent dans la partie « # » d'un lien (src/lib/duel-link.ts), que le
 * navigateur n'envoie jamais au serveur ; l'ami répond sur son appareil et voit le résultat chez lui.
 * Mesure d'audience coupée pendant toute la page.
 */

const T = UI_COPY.duel
const ITEMS = QUICK_ITEMS.map((id) => set.items.find((i) => i.id === id)!).filter(Boolean)
const THEME = new Map(set.themes.map((t) => [t.id, t]))
const DOT: Record<Ordinal, number> = { [-2]: 40, [-1]: 30, 0: 22, 1: 30, 2: 40 } as Record<Ordinal, number>

type Player = 0 | 1
type Step = { kind: 'setup' } | { kind: 'question'; player: Player; index: number } | { kind: 'handoff' } | { kind: 'link' } | { kind: 'result' }
/** local : deux sur un téléphone ; remote : je défie quelqu'un par lien ; challenged : j'ai ouvert un lien de défi */
type Mode = 'local' | 'remote' | 'challenged'
const LINK_VERSION = linkVersion(QUICK_ITEMS, set.version)
const duelUrl = (answers: Answers, name: string) => `${window.location.origin}/duel#${encodeDuel(QUICK_ITEMS, answers, name, LINK_VERSION)}`

export function DuelFlow() {
  const [names, setNames] = useState<[string, string]>(['', ''])
  const [answers, setAnswers] = useState<[Answers, Answers]>([{}, {}])
  const [saved, setSaved] = useState<Answers | null>(null)
  const [useSaved, setUseSaved] = useState(true)
  const [step, setStep] = useState<Step>({ kind: 'setup' })
  // Revanche : le joueur 1 garde ses réponses, seul le joueur 2 change
  const [rematch, setRematch] = useState(false)
  const [mode, setMode] = useState<Mode>('local')
  const [badLink, setBadLink] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)

  // Réponses déjà données au test sur cet appareil : proposées au joueur 1, jamais modifiées
  useEffect(() => {
    loadState().then((s) => {
      if (!s) return
      const eff = effectiveAnswers(s, set)
      const mine: Answers = {}
      for (const it of ITEMS) if (eff[it.id]) mine[it.id] = eff[it.id]!
      if (Object.keys(mine).length > 0) setSaved(mine)
    })
  }, [])

  // Lien de défi : lu une fois, puis retiré de la barre d'adresse (il ne reste ni dans l'historique ni dans un partage)
  useEffect(() => {
    const hash = window.location.hash
    // Venu des résultats avec « Défie un proche » : mode lien présélectionné
    if (new URLSearchParams(window.location.search).get('mode') === 'lien') setMode('remote')
    if (!hash.startsWith('#d=')) return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    const ch = decodeDuel(hash, QUICK_ITEMS, LINK_VERSION)
    if (!ch) {
      setBadLink(true)
      return
    }
    setNames([ch.name || T.challengerDefault, ''])
    setAnswers([ch.answers, {}])
    setMode('challenged')
  }, [])

  useEffect(() => {
    setAudiencePaused(true)
    return () => setAudiencePaused(false)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [step])

  const name = (p: Player) => names[p].trim() || (p === 0 ? T.p1Default : T.p2Default)

  // Questions à poser à un joueur : toutes, sauf pour le joueur 1 celles déjà répondues au test s'il les reprend
  const todo = useCallback(
    (p: Player) => (p === 0 && useSaved && saved ? ITEMS.filter((i) => !(i.id in saved)) : ITEMS),
    [saved, useSaved],
  )

  const afterFirst = (): Step => (mode === 'remote' ? { kind: 'link' } : { kind: 'handoff' })

  const startPlayer = (p: Player) => {
    const list = todo(p)
    if (list.length === 0) setStep(p === 0 ? afterFirst() : { kind: 'result' })
    else setStep({ kind: 'question', player: p, index: 0 })
  }

  const start = () => {
    if (mode === 'challenged') {
      setAnswers((prev) => [prev[0], {}])
      startPlayer(1)
      return
    }
    if (rematch) {
      setAnswers((prev) => [prev[0], {}])
      setStep({ kind: 'handoff' })
      return
    }
    setAnswers([useSaved && saved ? { ...saved } : {}, {}])
    startPlayer(0)
  }

  if (step.kind === 'setup')
    return (
      <div className="stack">
        {badLink && <p className="alert">{T.badLink}</p>}
        {mode === 'challenged' ? (
          <div className="card card--flat">
            <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', marginTop: 0 }}>
              {T.challengedTitle(name(0))}
            </h2>
            <p style={{ margin: 0 }}>{T.challengedText(name(0), ITEMS.length)}</p>
          </div>
        ) : (
          !rematch && (
            <div className="chips" role="radiogroup" aria-label={T.modeLabel}>
              <button className="chip" role="radio" aria-checked={mode === 'local'} onClick={() => setMode('local')}>
                {T.modeLocal}
              </button>
              <button className="chip" role="radio" aria-checked={mode === 'remote'} onClick={() => setMode('remote')}>
                {T.modeRemote}
              </button>
            </div>
          )
        )}
        <p className="small muted">{mode === 'local' ? T.privacy : mode === 'remote' ? T.privacyRemote : T.privacyChallenged}</p>
        {!rematch && mode !== 'challenged' && (
          <div className="field">
            <label htmlFor="duel-p1">{T.p1Label}</label>
            <input id="duel-p1" className="input" maxLength={24} value={names[0]} onChange={(e) => setNames([e.target.value, names[1]])} autoComplete="off" />
          </div>
        )}
        {mode !== 'remote' && (
          <div className="field">
            <label htmlFor="duel-p2">{mode === 'challenged' ? T.meLabel : T.p2Label}</label>
            <input id="duel-p2" className="input" maxLength={24} value={names[1]} onChange={(e) => setNames([names[0], e.target.value])} autoComplete="off" />
          </div>
        )}
        {saved && !rematch && mode !== 'challenged' && (
          <label className="row" style={{ gap: 'var(--s2)', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} style={{ marginTop: 4 }} />
            <span>{T.useSaved(Object.keys(saved).length, ITEMS.length)}</span>
          </label>
        )}
        <p>
          <button className="btn btn--highlight" onClick={start}>
            {mode === 'challenged' ? T.startChallenged : mode === 'remote' ? T.startRemote : T.start}
          </button>
        </p>
      </div>
    )

  if (step.kind === 'link')
    return (
      <div className="stack">
        <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', margin: 0 }}>
          {T.linkTitle}
        </h2>
        <p>{T.linkText}</p>
        <DuelLinkShare url={duelUrl(answers[0], names[0])} message={T.linkMessage(name(0))} />
        <p className="small muted">{T.linkPrivacy}</p>
        <p>
          <button
            className="btn btn--ghost btn--small"
            onClick={() => {
              setMode('local')
              setStep({ kind: 'handoff' })
            }}
          >
            {T.linkLocalInstead}
          </button>
        </p>
      </div>
    )

  if (step.kind === 'handoff')
    return (
      <div className="duel-handoff">
        <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>
          {T.handoffTitle(name(1))}
        </h2>
        <p>{T.handoffText(name(0))}</p>
        <button className="btn btn--highlight" onClick={() => startPlayer(1)}>
          {T.handoffGo(name(1))}
        </button>
      </div>
    )

  if (step.kind === 'question') {
    const list = todo(step.player)
    const item = list[step.index]
    if (!item) return null
    const current = answers[step.player][item.id]
    const selected = current?.kind === 'value' ? current.value : null
    const theme = THEME.get(item.theme)
    const go = (a: Answer) => {
      setAnswers((prev) => {
        const next: [Answers, Answers] = [{ ...prev[0] }, { ...prev[1] }]
        next[step.player][item.id] = a
        return next
      })
      setTimeout(() => {
        if (step.index < list.length - 1) setStep({ kind: 'question', player: step.player, index: step.index + 1 })
        else setStep(step.player === 0 ? afterFirst() : { kind: 'result' })
      }, 220)
    }
    const prev = () => {
      if (step.index > 0) setStep({ kind: 'question', player: step.player, index: step.index - 1 })
    }
    return (
      <div>
        <p className="duel-turn">
          <span className="mark">{T.turn(name(step.player))}</span>
        </p>
        <div className="row" style={{ justifyContent: 'space-between', margin: 'var(--s3) 0' }}>
          <button className="btn btn--ghost btn--small" onClick={prev} disabled={step.index === 0}>
            {T.back}
          </button>
          <span className="small muted" aria-live="polite">
            {T.question(step.index + 1, list.length)}
          </span>
        </div>
        <article className="qcard" key={`${step.player}-${item.id}`}>
          {theme && (
            <p className="qcard__theme">
              <ThemeIcon theme={theme.id} width={22} height={22} />
              {theme.label}
            </p>
          )}
          <div className="qcard__grid">
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="qcard__text" style={{ outline: 'none' }}>
                {item.text}
              </h2>
              <p className="muted qcard__help">{item.explanation}</p>
            </div>
            <div>
              <div className="scale">
                <div role="radiogroup" aria-label="Ta réponse" className="scale__dots">
                  {[...ORDINALS].map((v) => (
                    <button
                      key={v}
                      role="radio"
                      aria-checked={selected === v}
                      aria-label={UI_COPY.test.scale[v + 2]}
                      className={`scale__dot scale__dot--${v < 0 ? 'against' : v > 0 ? 'for' : 'mid'}`}
                      onClick={() => go({ kind: 'value', value: v as Ordinal })}
                    >
                      <span style={{ width: DOT[v], height: DOT[v] }} />
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
                <button className="chip" aria-pressed={current?.kind === 'dontknow'} onClick={() => go({ kind: 'dontknow' })}>
                  {UI_COPY.test.dontKnow}
                </button>
                <button className="chip" aria-pressed={current?.kind === 'skip'} onClick={() => go({ kind: 'skip' })}>
                  {UI_COPY.test.skip}
                </button>
              </div>
            </div>
          </div>
        </article>
        <p style={{ marginTop: 'var(--s4)' }}>
          <button className="btn btn--ghost btn--small" onClick={() => setStep({ kind: 'setup' })}>
            {T.quit}
          </button>
        </p>
      </div>
    )
  }

  return (
    <DuelResultView
      names={[name(0), name(1)]}
      answers={answers}
      replyUrl={mode === 'challenged' ? duelUrl(answers[1], names[1]) : null}
      headingRef={headingRef}
      onAgain={() => {
        // Le joueur 1 garde ses réponses, un nouveau joueur 2 donne son prénom puis répond
        setRematch(true)
        setAnswers((prev) => [prev[0], {}])
        setNames((n) => [n[0], ''])
        setStep({ kind: 'setup' })
      }}
      onRestart={() => {
        setMode('local')
        setRematch(false)
        setAnswers([{}, {}])
        setNames(['', ''])
        setStep({ kind: 'setup' })
      }}
    />
  )
}

function DuelResultView({
  names,
  answers,
  replyUrl,
  headingRef,
  onAgain,
  onRestart,
}: {
  names: [string, string]
  answers: [Answers, Answers]
  /** Ouvert depuis un lien de défi : le lien à renvoyer, avec mes réponses */
  replyUrl: string | null
  headingRef: React.RefObject<HTMLHeadingElement | null>
  onAgain: () => void
  onRestart: () => void
}) {
  const r = useMemo(() => duelAgreement(QUICK_ITEMS, answers[0], answers[1]), [answers])
  const [showCandidates, setShowCandidates] = useState(false)
  const count = (v: string) => r.items.filter((i) => i.verdict === v).length
  const text = (id: string) => set.items.find((i) => i.id === id)?.text ?? id
  const disagree = r.items.filter((i) => i.verdict === 'desaccord').slice(0, 5)
  const agree = [...r.items].reverse().filter((i) => i.verdict === 'accord').slice(0, 3)

  return (
    <div className="stack">
      <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', margin: 0 }}>
        {T.vs(names[0], names[1])}
      </h2>
      {r.score !== null ? (
        <p className="duel-score">
          <span className="mark">{T.agreement(r.score)}</span>
        </p>
      ) : (
        <p className="alert">{T.noScore}</p>
      )}
      {r.score !== null && <p className="humor">{duelQuip(r.score)}</p>}
      <p className="muted">{T.counts(count('accord'), count('nuance'), count('desaccord'), r.both)}</p>
      {replyUrl && (
        <section className="card card--flat" aria-labelledby="duel-reply">
          <h3 id="duel-reply" style={{ marginTop: 0 }}>
            {T.replyTitle(names[0])}
          </h3>
          <p className="muted">{T.replyText(names[0])}</p>
          <DuelLinkShare url={replyUrl} message={T.replyMessage(names[1])} />
        </section>
      )}

      <section aria-labelledby="duel-desaccords">
        <h3 id="duel-desaccords">{T.disagreeTitle}</h3>
        {disagree.length === 0 ? (
          <p className="muted">{T.none}</p>
        ) : (
          <ul className="duel-list">
            {disagree.map((i) => (
              <li key={i.itemId}>
                <strong>{text(i.itemId)}</strong>
                <span className="small">
                  {names[0]} : {answerLabel(answers[0][i.itemId])} · {names[1]} : {answerLabel(answers[1][i.itemId])}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="duel-accords">
        <h3 id="duel-accords">{T.agreeTitle}</h3>
        {agree.length === 0 ? (
          <p className="muted">{T.none}</p>
        ) : (
          <ul className="duel-list">
            {agree.map((i) => (
              <li key={i.itemId}>
                <strong>{text(i.itemId)}</strong>
                <span className="small">
                  {names[0]} : {answerLabel(answers[0][i.itemId])} · {names[1]} : {answerLabel(answers[1][i.itemId])}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {liveCorpus.actors.length > 0 && (
        <section className="card card--flat" aria-labelledby="duel-candidats">
          <h3 id="duel-candidats" style={{ marginTop: 0 }}>
            {T.candidatesTitle}
          </h3>
          {!showCandidates ? (
            <>
              <p className="muted">{T.candidatesText}</p>
              <button className="btn btn--secondary" onClick={() => setShowCandidates(true)}>
                {T.candidatesBtn}
              </button>
            </>
          ) : (
            <>
              <ul className="duel-list">
                {([0, 1] as const).map((p) => (
                  <li key={p}>
                    <strong>{names[p]}</strong>
                    <span>{topCandidate(answers[p]) ?? T.candidatesNone}</span>
                  </li>
                ))}
              </ul>
              <p className="small muted" style={{ marginBottom: 0 }}>
                {T.candidatesNote} <Link href="/test">{T.fullTest}</Link>
              </p>
            </>
          )}
        </section>
      )}

      {r.score !== null && <DuelShare names={names} result={r} />}

      <div className="row">
        <button className="btn btn--secondary" onClick={onAgain}>
          {T.again}
        </button>
        <button className="btn btn--ghost" onClick={onRestart}>
          {T.restart}
        </button>
      </div>
    </div>
  )
}

/** Candidat le plus proche sur les questions du duel, avec les règles du test (pas de nom si le classement n'est pas publiable). */
function topCandidate(a: Answers): string | null {
  const ranking = rankActors(set, a, liveCorpus.actors, liveCorpus.positions, { mode: 'global', quick: QUICK_ITEMS })
  if (!ranking.ranked) return null
  const top = ranking.entries[0]
  return top ? `${top.name}, ${Math.round(top.rankScore ?? 0)} sur 100` : null
}

// ---------------------------------------------------------------------------
// Image du duel : prénoms, taux d'accord, remarque (hors mode sobre). Jamais les réponses ni les candidats.
// ---------------------------------------------------------------------------

const W = 1080
const H = 1350
const BG = '#F5F0E6'
const FG = '#191919'
const YELLOW = '#FFE34D'
const SITE = 'https://xn--avote-xra.fr/duel'

function DuelShare({ names, result }: { names: [string, string]; result: DuelResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const score = result.score ?? 0

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    let cancelled = false
    ;(async () => {
      c.width = W
      c.height = H
      const ctx = c.getContext('2d')
      if (!ctx) return
      const display = cssFamily('--ff-display', 'Arial Black')
      const ui = cssFamily('--ff-ui', 'Arial')
      await Promise.all([document.fonts.load(`80px ${display}`), document.fonts.load(`700 40px ${ui}`)]).catch(() => {})
      const logo = await loadImage('/brand/logo-horizontal.svg')
      if (cancelled) return
      const sober = document.documentElement.getAttribute('data-sobre') === 'true'
      const m = 86
      const width = W - 2 * m
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = FG
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.font = `700 30px ${ui}`
      ctx.fillText(T.imgKicker.toUpperCase(), m, m)
      const vs = fitText(ctx, T.vs(names[0], names[1]), display, width, 260, 96)
      ctx.font = `${vs.size}px ${display}`
      vs.lines.forEach((l, i) => ctx.fillText(l, m, m + 70 + i * vs.size * 1.08))
      let y = m + 70 + vs.lines.length * vs.size * 1.08 + 70
      // Le pourcentage, surligné
      const big = `${score} %`
      ctx.font = `230px ${display}`
      const bw = ctx.measureText(big).width
      ctx.fillStyle = YELLOW
      ctx.fillRect(m - 12, y + 120, bw + 24, 110)
      ctx.fillStyle = FG
      ctx.fillText(big, m, y)
      y += 250
      ctx.font = `700 48px ${ui}`
      ctx.fillText('d’accord', m, y)
      y += 110
      if (!sober) {
        const q = fitText(ctx, duelQuip(score), display, width, 200, 56)
        ctx.font = `${q.size}px ${display}`
        q.lines.forEach((l, i) => ctx.fillText(l, m, y + i * q.size * 1.15))
      }
      const foot = H - m
      ctx.font = `600 28px ${ui}`
      ctx.fillText(T.imgNote(result.both), m, foot - 130)
      const logoH = 64
      ctx.drawImage(logo, m, foot - logoH, (logo.width / logo.height) * logoH, logoH)
      ctx.font = `700 32px ${ui}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      const cw = ctx.measureText(T.imgCta).width
      ctx.fillStyle = YELLOW
      ctx.fillRect(W - m - cw - 12, foot - 44, cw + 24, 30)
      ctx.fillStyle = FG
      ctx.fillText(T.imgCta, W - m, foot - 18)
    })()
      .catch(() => {})
      .finally(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [names, score, result.both])

  const share = async () => {
    const c = canvasRef.current
    if (!c) return
    setBusy(true)
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
    setBusy(false)
    if (!blob) return
    const file = new File([blob], 'duel-ca-vote.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${T.shareMessage} ${SITE}` })
        return
      } catch {
        /* annulé : téléchargement */
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section aria-labelledby="duel-partage">
      <h3 id="duel-partage">{T.shareTitle}</h3>
      <p className="small muted">{T.shareText}</p>
      <canvas ref={canvasRef} className="share-result__preview" role="img" aria-label={T.shareAlt} width={W} height={H} />
      <button className="btn btn--highlight" onClick={share} disabled={!ready || busy}>
        {busy ? T.shareBusy : T.shareBtn}
      </button>
    </section>
  )
}

/** Partage du lien de défi : feuille de partage du téléphone, sinon copie. Le lien n'est envoyé nulle part par le site. */
function DuelLinkShare({ url, message }: { url: string; message: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: T.linkShareTitle, text: message, url })
        return
      } catch {
        // Partage annulé : on propose la copie
      }
    }
    try {
      await navigator.clipboard.writeText(`${message} ${url}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="stack" style={{ gap: 'var(--s2)' }}>
      <p>
        <button className="btn btn--highlight" onClick={share}>
          {T.linkShareBtn}
        </button>
      </p>
      <label className="field">
        <span className="small muted">{T.linkFieldLabel}</span>
        <input className="input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
      </label>
      <p className="small" aria-live="polite">
        {copied ? T.linkCopied : ' '}
      </p>
    </div>
  )
}
