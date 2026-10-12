'use client'
import { useId, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { UI_COPY } from '@/lib/copy'
import type { VerifierResult } from '@/lib/verifier-search'

const t = UI_COPY.verifier

export function VerifierForm({ examples }: { examples: string[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<VerifierResult | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const out = useRef<HTMLDivElement>(null)
  const id = useId()

  async function ask(q: string) {
    q = q.trim()
    if (q.length < 10) {
      setError(t.tooShort)
      setState('error')
      return
    }
    setState('sending')
    setResult(null)
    try {
      const res = await fetch('/api/verifier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q.slice(0, 300) }) })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string; result?: VerifierResult }
      if (data.ok && data.result) {
        setResult(data.result)
        setState('done')
        requestAnimationFrame(() => out.current?.focus())
        return
      }
      setError(data.reason === 'trop' ? t.tooMany : data.reason === 'invalide' ? t.tooShort : t.down)
    } catch {
      setError(t.down)
    }
    setState('error')
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void ask(input.current?.value ?? '')
  }

  return (
    <div className="stack">
      <form onSubmit={onSubmit} className="verifier-form" role="search">
        <label htmlFor={`${id}-q`} className="verifier-form__label">
          {t.label}
        </label>
        <div className="verifier-form__row">
          <input
            ref={input}
            id={`${id}-q`}
            className="input"
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            minLength={10}
            maxLength={300}
            required
            placeholder={t.placeholder}
            aria-describedby={`${id}-p`}
          />
          <button className="btn btn--highlight" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? t.sending : t.send}
          </button>
        </div>
        <p id={`${id}-p`} className="small muted" style={{ margin: 0 }}>
          {t.privacy}
        </p>
      </form>

      {examples.length > 0 && (
        <div>
          <p className="small" style={{ margin: 0 }}>
            {t.examples}
          </p>
          <div className="chips" style={{ marginTop: 'var(--s2)' }}>
            {examples.map((q) => (
              <button
                key={q}
                type="button"
                className="chip verifier-example"
                disabled={state === 'sending'}
                onClick={() => {
                  if (input.current) input.current.value = q
                  void ask(q)
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={out} tabIndex={-1} aria-live="polite" className="verifier-out">
        {state === 'error' && (
          <p role="alert" className="alert alert--correction">
            {error}
          </p>
        )}
        {state === 'done' && result && <Result r={result} />}
      </div>
    </div>
  )
}

function Result({ r }: { r: VerifierResult }) {
  const intro =
    r.mode === 'ia' ? null : r.mode === 'sources' ? t.sourcesOnly[r.why ?? 'off'] : r.sources.length ? `${t.nothing} ${t.near}` : t.nothing
  return (
    <article className={`card verifier-result${r.verdict ? ` verifier-result--${r.verdict}` : ''}`}>
      {r.mode === 'ia' && r.verdict && (
        <>
          <p className="verifier-result__verdict">
            <span className="stamp">{t.verdicts[r.verdict]}</span>
          </p>
          <p className="verifier-result__answer">{r.answer}</p>
          {r.verdict === 'opinion' && <p className="small muted">{t.opinionHint}</p>}
          {r.quote && (
            <>
              <p className="intox__label">{t.proof}</p>
              <blockquote className="verifier-result__quote">« {r.quote} »</blockquote>
            </>
          )}
        </>
      )}
      {intro && <p style={{ marginTop: 0 }}>{intro}</p>}
      {r.sources.length > 0 && (
        <>
          {r.mode === 'ia' && <p className="intox__label">{t.sources}</p>}
          <ul className="verifier-sources" role="list">
            {r.sources.map((s) => (
              <li key={s.url + s.title}>
                <span className="small muted">{t.kinds[s.kind]} · </span>
                <a href={s.url} rel="noopener noreferrer" target="_blank">
                  {s.title || s.publisher}
                </a>{' '}
                <span className="small muted">
                  ({s.publisher}
                  {s.date ? `, ${s.date.slice(0, 10).split('-').reverse().join('/')}` : ''})
                </span>
                {s.excerpt && <p className="small verifier-sources__excerpt">{s.excerpt}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
      {r.mode === 'ia' && (
        <p className="small muted" style={{ marginBottom: 0 }}>
          {t.ai} <Link href="/contact?sujet=correction&page=/verifier">{t.report}</Link>
        </p>
      )}
    </article>
  )
}
