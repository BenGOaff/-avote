'use client'

import { useRef, useState, type ReactNode } from 'react'
import type { Ordinal } from '@/lib/engine/types'
import { UI_COPY } from '@/lib/copy'

/**
 * Carte à faire glisser (test rapide) : à droite d'accord, à gauche pas d'accord, plus loin = plus fort.
 * Les cinq niveaux restent accessibles : au-delà d'un tiers de la largeur, « plutôt » ; au-delà de 60 %, « tout à fait ».
 * Les boutons de l'échelle, dans la carte, marchent toujours (un geste qui part d'un bouton n'est pas un glissement).
 * Animations coupées si l'appareil demande moins de mouvement.
 */

const SOFT = 0.3
const HARD = 0.6

const levelOf = (ratio: number): Ordinal | null => {
  const a = Math.abs(ratio)
  if (a < SOFT) return null
  const v = a >= HARD ? 2 : 1
  return (ratio > 0 ? v : -v) as Ordinal
}

export function SwipeCard({ children, onAnswer }: { children: ReactNode; onAnswer: (v: Ordinal) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number; id: number; w: number; locked: boolean | null } | null>(null)
  const [dx, setDx] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)

  const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving !== null || e.button !== 0) return
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select, [role="radio"]')) return
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, w: ref.current?.offsetWidth ?? 320, locked: null }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current
    if (!s || s.id !== e.pointerId) return
    const mx = e.clientX - s.x
    const my = e.clientY - s.y
    // Le premier mouvement net décide : horizontal = glissement, vertical = défilement de la page
    if (s.locked === null && Math.hypot(mx, my) > 8) {
      s.locked = Math.abs(mx) > Math.abs(my)
      if (s.locked) ref.current?.setPointerCapture(e.pointerId)
    }
    if (s.locked) setDx(mx)
  }
  const end = (e: React.PointerEvent) => {
    const s = start.current
    if (!s || s.id !== e.pointerId) return
    start.current = null
    if (!s.locked) return
    const v = levelOf(dx / s.w)
    if (v === null) {
      setDx(0)
      return
    }
    if (reduced()) {
      setDx(0)
      onAnswer(v)
      return
    }
    setLeaving(v > 0 ? 1 : -1)
    window.setTimeout(() => {
      setLeaving(null)
      setDx(0)
      onAnswer(v)
    }, 200)
  }

  const w = ref.current?.offsetWidth ?? 320
  const level = leaving !== null ? null : levelOf(dx / w)
  const style =
    leaving !== null
      ? { transform: `translateX(${leaving * 130}%) rotate(${leaving * 12}deg)`, opacity: 0 }
      : dx !== 0
        ? { transform: `translateX(${dx}px) rotate(${dx / 24}deg)`, transition: 'none' }
        : undefined

  return (
    <div
      ref={ref}
      className="swipe"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {children}
      {level !== null && (
        <span className={`swipe__tag swipe__tag--${level > 0 ? 'for' : 'against'}`} aria-hidden="true">
          {UI_COPY.test.scale[level + 2]}
        </span>
      )}
    </div>
  )
}

