'use client'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { UI_COPY } from '@/lib/copy'

const t = UI_COPY.contact
type Kind = keyof typeof t.kinds

export function ContactForm({ initialKind = 'general', initialPage = '' }: { initialKind?: Kind; initialPage?: string }) {
  const [kind, setKind] = useState<Kind>(initialKind)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const opened = useRef(0)
  const id = useId()

  useEffect(() => {
    opened.current = Date.now()
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const message = String(f.get('message') ?? '').trim()
    if (message.length < 20) {
      setError(t.invalid)
      setState('error')
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          page: String(f.get('page') ?? ''),
          message,
          email: String(f.get('email') ?? ''),
          website: String(f.get('website') ?? ''),
          elapsed: Math.min(86_400_000, Date.now() - opened.current),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string }
      if (data.ok) {
        setState('done')
        return
      }
      setError(data.reason === 'trop' ? t.tooMany : data.reason === 'invalide' ? t.invalid : t.down)
    } catch {
      setError(t.down)
    }
    setState('error')
  }

  if (state === 'done')
    return (
      <p className="alert alert--info" role="status">
        {t.sent}
      </p>
    )

  return (
    <form onSubmit={onSubmit} className="stack contact-form">
      <fieldset className="contact-form__kinds">
        <legend>{t.kindLabel}</legend>
        {(Object.keys(t.kinds) as Kind[]).map((k) => (
          <label key={k} className={`choice${kind === k ? ' is-on' : ''}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
            <span>{t.kinds[k]}</span>
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor={`${id}-page`}>{t.pageLabel}</label>
        <input id={`${id}-page`} className="input" name="page" type="text" inputMode="url" maxLength={300} defaultValue={initialPage} aria-describedby={`${id}-page-h`} />
        <span id={`${id}-page-h`} className="small muted">
          {t.pageHint}
        </span>
      </div>
      <div className="field">
        <label htmlFor={`${id}-msg`}>{t.messageLabel}</label>
        <textarea id={`${id}-msg`} className="input" name="message" rows={7} minLength={20} maxLength={4000} required aria-describedby={`${id}-msg-h`} />
        <span id={`${id}-msg-h`} className="small muted">
          {kind === 'correction' ? `${t.correctionHint} ` : ''}
          {t.noAnswers}
        </span>
      </div>
      <div className="field">
        <label htmlFor={`${id}-em`}>{t.emailLabel}</label>
        <input id={`${id}-em`} className="input" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} aria-describedby={`${id}-em-h`} />
        <span id={`${id}-em-h`} className="small muted">
          {t.emailHint}
        </span>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
        <label>
          Ne pas remplir
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state === 'error' && (
        <p role="alert" className="alert alert--correction">
          {error}
        </p>
      )}
      <button className="btn btn--highlight" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? t.sending : t.send}
      </button>
    </form>
  )
}
