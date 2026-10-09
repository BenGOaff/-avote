'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { BLANK, leadingZeroBits } from '@/lib/urne-shared'
import { BoothScene } from './BoothScene'
import { DonateCard } from '@/components/Donate'

const t = { ...UI_COPY.urne, afterVote: UI_COPY.donate.afterVote }
const VOTED_KEY = 'ca-vote:urne'

type Choice = { slug: string; name: string; party?: string; bloc?: string }
type Totals = { frozen: boolean; total: number; rows: { choice: string; votes: number }[] } | null
type Phase = 'choose' | 'confirm' | 'booth' | 'done' | 'error'

/** Preuve de travail : cherche un nombre dont l'empreinte SHA-256 commence par `bits` bits nuls, par paquets pour ne pas figer la page. */
async function solve(challenge: string, bits: number, signal: { stop: boolean }): Promise<string | null> {
  const enc = new TextEncoder()
  for (let n = 0; n < 50_000_000; n++) {
    if (signal.stop) return null
    const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(`${challenge}:${n}`)))
    if (leadingZeroBits(d) >= bits) return String(n)
    if (n % 2000 === 0) await new Promise((r) => setTimeout(r, 0))
  }
  return null
}

export function UrneBooth({ choices }: { choices: Choice[] }) {
  const [phase, setPhase] = useState<Phase>('choose')
  const [picked, setPicked] = useState<Choice | null>(null)
  const [message, setMessage] = useState('')
  const [totals, setTotals] = useState<Totals>(null)
  const [copied, setCopied] = useState(false)
  // Compteur de la scène : figé au moment du vote, jamais affiché pendant la période de réserve
  const [sceneCount, setSceneCount] = useState<number | null>(null)
  const work = useRef<Promise<{ challenge: string; nonce: string } | null> | null>(null)
  const stop = useRef({ stop: false })

  const all: Choice[] = [...choices, { slug: BLANK, name: t.blank }]
  const nameOf = (slug: string) => all.find((c) => c.slug === slug)?.name ?? slug

  const loadTotals = useCallback(async () => {
    try {
      const r = await fetch('/api/urne/totals', { cache: 'no-store' })
      const j = await r.json()
      if (j.ok) setTotals(j.frozen ? { frozen: true, total: 0, rows: [] } : { frozen: false, total: j.total, rows: j.rows })
    } catch {
      /* résultats indisponibles : la page reste utilisable */
    }
  }, [])

  // Le calcul anti-robots démarre dès l'arrivée : il est fini avant que la personne ait choisi
  const startWork = useCallback(() => {
    stop.current = { stop: false }
    const signal = stop.current
    work.current = (async () => {
      try {
        const r = await fetch('/api/urne/challenge', { cache: 'no-store' })
        if (!r.ok) return null
        const { challenge, bits } = (await r.json()) as { challenge: string; bits: number }
        const nonce = await solve(challenge, bits, signal)
        return nonce === null ? null : { challenge, nonce }
      } catch {
        return null
      }
    })()
  }, [])

  useEffect(() => {
    let voted = false
    try {
      voted = localStorage.getItem(VOTED_KEY) === 'oui'
    } catch {
      /* stockage indisponible */
    }
    if (voted) setPhase('done')
    else startWork()
    loadTotals()
    return () => {
      stop.current.stop = true
    }
  }, [startWork, loadTotals])

  async function vote() {
    if (!picked) return
    setSceneCount(totals && !totals.frozen ? totals.total : null)
    setPhase('booth')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const [proof] = await Promise.all([work.current ?? Promise.resolve(null), new Promise((r) => setTimeout(r, reduce ? 0 : 3300))])
    if (!proof) {
      setMessage(t.down)
      setPhase('error')
      return
    }
    try {
      const r = await fetch('/api/urne/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choice: picked.slug, ...proof }) })
      const j = await r.json().catch(() => ({}))
      if (j.ok || j.reason === 'deja') {
        try {
          localStorage.setItem(VOTED_KEY, 'oui')
        } catch {
          /* stockage indisponible */
        }
        if (!j.ok) setMessage(t.already)
        setPhase('done')
        loadTotals()
        return
      }
      setMessage(j.reason === 'robot' ? t.robot : j.reason === 'trop' ? t.tooMany : t.down)
    } catch {
      setMessage(t.down)
    }
    setPhase('error')
  }

  async function share() {
    const url = `${location.origin}/urne`
    try {
      if (navigator.share) await navigator.share({ title: 'L’urne de Ça vote ?', text: t.shareText, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
      }
    } catch {
      /* partage annulé */
    }
  }

  const max = Math.max(1, ...(totals?.rows.map((r) => r.votes) ?? [1]))

  return (
    <div className="urne">
      {phase === 'choose' && (
        <section aria-labelledby="bulletins">
          <h2 id="bulletins" style={{ fontSize: 'var(--h3)' }}>
            {t.pick}
          </h2>
          <ul className="ballots">
            {all.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  className={`ballot${c.slug === BLANK ? ' ballot--blank' : ''}`}
                  onClick={() => {
                    setPicked(c)
                    setPhase('confirm')
                  }}
                >
                  {c.bloc && <span className={`nuance__dot bloc-${c.bloc}`} aria-hidden="true" />}
                  <span className="ballot__name">{c.name}</span>
                  {c.party && <span className="ballot__party">{c.party}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {phase === 'confirm' && picked && (
        <div className="card card--featured urne__confirm" role="dialog" aria-modal="false" aria-labelledby="confirm-title">
          <p id="confirm-title" className="lede" style={{ margin: 0 }}>
            {t.confirm(picked.name)}
          </p>
          <div className="row" style={{ marginTop: 'var(--s4)' }}>
            <button type="button" className="btn btn--highlight" onClick={vote}>
              {t.confirmYes}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setPhase('choose')}>
              {t.confirmNo}
            </button>
          </div>
        </div>
      )}

      {(phase === 'booth' || phase === 'done') && (
        <div className="booth">
          <BoothScene
            name={picked ? (picked.slug === BLANK ? '' : picked.name) : ''}
            count={picked ? sceneCount : totals && !totals.frozen ? totals.total : null}
            still={phase === 'done' && !picked}
          />
          {phase === 'booth' && (
            <p className="visually-hidden" aria-live="polite">
              {t.dropping}
            </p>
          )}
          {phase === 'done' && (
            <p className="stamp urne__stamp" aria-live="polite">
              {t.voted}
            </p>
          )}
        </div>
      )}
      {phase === 'done' && message && <p className="small muted">{message}</p>}
      {phase === 'done' && <DonateCard lead={t.afterVote} />}

      {phase === 'error' && (
        <div className="alert alert--correction" role="alert">
          <p style={{ margin: 0 }}>{message}</p>
          <button
            type="button"
            className="btn btn--secondary"
            style={{ marginTop: 'var(--s3)' }}
            onClick={() => {
              setMessage('')
              setPhase('choose')
              startWork()
            }}
          >
            {t.confirmNo}
          </button>
        </div>
      )}

      <section className="section" aria-labelledby="depouillement">
        <h2 id="depouillement" style={{ fontSize: 'var(--h3)' }}>
          {t.resultsTitle}
        </h2>
        {totals?.frozen ? (
          <p className="alert alert--info">{t.frozen}</p>
        ) : !totals || totals.total === 0 ? (
          <p className="muted">{t.resultsEmpty}</p>
        ) : (
          <>
            <p className="figure__num urne__total">{t.resultsCount(totals.total)}</p>
            <ul className="tally">
              {totals.rows.map((r) => (
                <li key={r.choice} className="tally__row">
                  <span className="tally__name">{nameOf(r.choice)}</span>
                  <span className="tally__bar" style={{ width: `${(r.votes / max) * 100}%` }} aria-hidden="true" />
                  <span className="tally__value">
                    {Math.round((r.votes / totals.total) * 1000) / 10} % <span className="hint">({r.votes})</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="small muted">{t.notPoll}</p>
        <button type="button" className="btn" onClick={share}>
          {copied ? t.copied : t.share}
        </button>
      </section>
    </div>
  )
}
