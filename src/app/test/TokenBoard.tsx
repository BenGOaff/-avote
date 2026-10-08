'use client'
/**
 * Répartition des 10 jetons entre les thèmes : on touche un thème pour y poser un jeton,
 * ou on fait glisser un jeton de la réserve sur un thème. Le clavier passe par les boutons.
 */
import { useEffect, useRef, useState } from 'react'
import type { Priorities, Theme } from '@/lib/engine/types'
import { UI_COPY } from '@/lib/copy'
import { Coin, CoinStack } from '@/components/Viz'
import { ThemeIcon } from '@/components/ThemeIcon'

export function TokenBoard({ themes, priorities, total, onChange }: { themes: Theme[]; priorities: Priorities; total: number; onChange: (id: string, delta: number) => void }) {
  const used = Object.values(priorities).reduce((a, b) => a + b, 0)
  const left = total - used
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [last, setLast] = useState<string | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const themeAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest('[data-theme]') as HTMLElement | null)?.dataset.theme ?? null

  useEffect(() => {
    if (!drag) return
    const move = (e: PointerEvent) => {
      setDrag({ x: e.clientX, y: e.clientY })
      setOver(themeAt(e.clientX, e.clientY))
    }
    const up = (e: PointerEvent) => {
      const id = themeAt(e.clientX, e.clientY)
      if (id) {
        onChangeRef.current(id, 1)
        setLast(id)
      }
      setDrag(null)
      setOver(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, { once: true })
    window.addEventListener('pointercancel', up, { once: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [drag !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="board">
      <div className="reserve" aria-live="polite">
        <p className="reserve__label">{UI_COPY.test.tokensLeft(left)}</p>
        <div className="reserve__coins">
          {Array.from({ length: total }, (_, i) =>
            i < left ? (
              <Coin
                key={i}
                className="coin--grab"
                onPointerDown={(e) => {
                  e.preventDefault()
                  setDrag({ x: e.clientX, y: e.clientY })
                }}
              />
            ) : (
              <span key={i} className="coin coin--empty" style={{ width: 44, height: 44 }} aria-hidden="true" />
            ),
          )}
        </div>
      </div>
      <p className="hint">{UI_COPY.test.tokensHelp}</p>

      <ul className="slots">
        {themes.map((t) => {
          const n = priorities[t.id] ?? 0
          return (
            <li key={t.id} className={`slot${over === t.id ? ' slot--over' : ''}${n > 0 ? ' slot--filled' : ''}`} data-theme={t.id}>
              <button
                className="slot__add"
                onClick={() => {
                  onChange(t.id, 1)
                  setLast(t.id)
                }}
                disabled={left <= 0}
                aria-label={`Poser un jeton sur ${t.label} (${n} posé${n > 1 ? 's' : ''})`}
              >
                <ThemeIcon theme={t.id} width={28} height={28} />
                <span className="slot__label">{t.label}</span>
                <span className="slot__desc">{t.description}</span>
              </button>
              <div className="slot__pile">
                <CoinStack count={n} max={total} key={last === t.id ? `${t.id}-${n}` : t.id} />
                <strong className="slot__count">{n}</strong>
                <button className="icon-btn slot__remove" onClick={() => onChange(t.id, -1)} disabled={n === 0} aria-label={`Reprendre un jeton sur ${t.label}`}>
                  −
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {drag && (
        <span className="coin-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <Coin size={52} />
        </span>
      )}
    </div>
  )
}
