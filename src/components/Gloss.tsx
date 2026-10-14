'use client'

import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react'
import { annotate, termById } from '@/lib/lexique'
import { UI_COPY } from '@/lib/copy'

const t = UI_COPY.lexique

/**
 * Texte dont les termes techniques ouvrent une définition courte (lexique).
 * Toucher ou clic : ouvre et ferme ; survol à la souris : ouvre ; Échap ou clic ailleurs : ferme.
 * `newTab` : la définition complète s'ouvre à côté (pendant le test, pour ne pas quitter la question).
 */
export function Glossed({ text, skip, newTab = false }: { text: string; skip?: ReadonlySet<string>; newTab?: boolean }) {
  const { segments } = annotate(text, skip)
  return (
    <>
      {segments.map((s, i) => (typeof s === 'string' ? <Fragment key={i}>{s}</Fragment> : <GlossTerm key={i} id={s.id} label={s.text} newTab={newTab} />))}
    </>
  )
}

/** Les termes repérés dans un texte, pour ne pas les réexpliquer dans le texte suivant */
export const glossedIds = (text: string) => new Set(annotate(text).used)

function GlossTerm({ id, label, newTab }: { id: string; label: string; newTab: boolean }) {
  const term = termById(id)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLSpanElement>(null)
  const popId = useId()
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect()
    if (!r) return
    const width = Math.min(340, window.innerWidth - 32)
    setPos({ top: r.bottom + 8, left: Math.max(16, Math.min(r.left, window.innerWidth - width - 16)) })
  }, [])

  useEffect(() => {
    if (!open) return
    place()
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && (btn.current?.contains(e.target as Node) || pop.current?.contains(e.target as Node))) return
      setOpen(false)
      if (e instanceof KeyboardEvent) btn.current?.focus()
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, place])

  if (!term) return <>{label}</>
  const hoverable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  const enter = () => {
    if (!hoverable()) return
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setOpen(true)
  }
  const leave = () => {
    if (!hoverable()) return
    hoverTimer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <span className="gloss" onMouseEnter={enter} onMouseLeave={leave}>
      <button ref={btn} type="button" className="gloss__btn" aria-expanded={open} aria-controls={popId} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open && pos && (
        <span ref={pop} id={popId} role="note" className="gloss__pop" style={{ top: pos.top, left: pos.left }}>
          <span className="gloss__term">{term.term}</span>
          <span className="gloss__text">{term.short}</span>
          <a className="gloss__more" href={`/lexique#${term.id}`} {...(newTab ? { target: '_blank', rel: 'noopener' } : {})}>
            {t.more}
          </a>
        </span>
      )}
    </span>
  )
}
