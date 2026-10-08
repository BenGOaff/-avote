'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { CONSENT_OPEN_EVENT, loadAnalytics, readConsent, writeConsent } from '@/lib/consent'
import { GA_ID } from '@/lib/site'

const C = UI_COPY.consent

/** Bandeau de consentement : Refuser et Accepter au même niveau, rien n'est chargé avant le choix. */
export function ConsentBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!GA_ID) return
    const choice = readConsent()
    if (choice === 'granted') loadAnalytics()
    else if (choice === null) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
  }, [])

  if (!open) return null
  const choose = (c: 'granted' | 'denied') => {
    writeConsent(c)
    setOpen(false)
  }
  return (
    <section className="consent" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-body">
      <p id="consent-title" className="consent__title">
        {C.title}
      </p>
      <p id="consent-body" className="consent__body">
        {C.body}
      </p>
      <p className="annotation humor consent__humor">{C.humor}</p>
      <p className="consent__details">
        {C.details}{' '}
        <Link href="/confidentialite#audience" onClick={() => setOpen(false)}>
          {C.more}
        </Link>
      </p>
      <div className="consent__actions">
        <button className="btn" onClick={() => choose('denied')}>
          {C.refuse}
        </button>
        <button className="btn" onClick={() => choose('granted')}>
          {C.accept}
        </button>
      </div>
    </section>
  )
}

/** Lien de pied de page pour changer d'avis à tout moment. */
export function ConsentLink() {
  if (!GA_ID) return null
  return (
    <button className="linklike" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>
      {C.manage}
    </button>
  )
}
