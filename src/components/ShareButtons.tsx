'use client'
import { useState } from 'react'

/** Partage natif (feuille de partage du téléphone) ou copie du lien. Aucun bouton tiers chargé. */
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        /* partage annulé */
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="row">
      <button className="btn btn--secondary" onClick={share}>
        Partager
      </button>
      <span role="status" className="small muted">
        {copied ? 'Lien copié.' : ''}
      </span>
    </div>
  )
}
