'use client'
import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'

export function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const id = useId()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(f.get('email') ?? ''),
          firstName: String(f.get('firstName') ?? ''),
          consent: f.get('consent') === 'on',
          website: String(f.get('website') ?? ''),
        }),
      })
      const data = (await res.json()) as { ok: boolean; message?: string }
      setMessage(data.message ?? '')
      setState(data.ok ? 'done' : 'error')
    } catch {
      setMessage('La connexion a échoué. Réessaie.')
      setState('error')
    }
  }

  if (state === 'done')
    return (
      <div className="alert alert--info" role="status">
        <p className="alert__title">Presque fini.</p>
        <p>{message}</p>
      </div>
    )

  return (
    <form onSubmit={onSubmit} className="stack" noValidate={false}>
      <div className="grid grid--2" style={{ gap: 'var(--s3)' }}>
        <div className="field">
          <label htmlFor={`${id}-fn`}>Prénom (facultatif)</label>
          <input id={`${id}-fn`} className="input" name="firstName" autoComplete="given-name" maxLength={60} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-em`}>Email</label>
          <input id={`${id}-em`} className="input" name="email" type="email" required autoComplete="email" inputMode="email" maxLength={254} />
        </div>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
        <label>
          Ne pas remplir
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="checkbox">
        <input type="checkbox" name="consent" required />
        <span className="small">
          J’accepte de recevoir la lettre de Ça vote ?. Désinscription en un clic dans chaque envoi. Seuls l’email et le prénom sont conservés, chez notre
          prestataire d’envoi. <Link href="/donnees">Qui les garde</Link>
        </span>
      </label>
      {state === 'error' && (
        <p role="alert" className="alert alert--correction">
          {message || 'Quelque chose a échoué.'}
        </p>
      )}
      <button className="btn" type="submit" disabled={state === 'loading'} data-loading={state === 'loading'}>
        {state === 'loading' ? 'Envoi…' : 'Recevoir la lettre'}
      </button>
    </form>
  )
}
