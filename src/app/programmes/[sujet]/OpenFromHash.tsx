'use client'
import { useEffect } from 'react'

/** Lien direct vers une proposition (/programmes/<sujet>#<question>) : on l'ouvre et on la montre. */
export function OpenFromHash() {
  useEffect(() => {
    const open = () => {
      const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      if (el instanceof HTMLDetailsElement) {
        el.open = true
        el.scrollIntoView({ block: 'start' })
      }
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])
  return null
}
