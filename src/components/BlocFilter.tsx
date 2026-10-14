'use client'
import { useState, type ReactNode } from 'react'

/**
 * Filtre par famille politique (blocs de la grille officielle) : n'affiche que les cartes du bloc choisi.
 * Les cartes portent data-bloc ; le filtrage se fait en CSS, sans toucher à l'ordre tiré au hasard.
 */
export function BlocFilter({
  blocs,
  label,
  all,
  children,
}: {
  blocs: { id: string; label: string; count: number }[]
  label: string
  all: string
  children: ReactNode
}) {
  const [current, setCurrent] = useState<string | null>(null)
  const total = blocs.reduce((s, b) => s + b.count, 0)
  return (
    <div className="bloc-filter" data-filter={current ?? undefined}>
      <div className="bloc-filter__chips" role="group" aria-label={label}>
        <button type="button" className="chip" aria-pressed={current === null} onClick={() => setCurrent(null)}>
          {all} <span className="hint">{total}</span>
        </button>
        {blocs
          .filter((b) => b.count > 0)
          .map((b) => (
            <button
              key={b.id}
              type="button"
              className={`chip bloc-${b.id}`}
              aria-pressed={current === b.id}
              onClick={() => setCurrent(current === b.id ? null : b.id)}
            >
              <span className="nuance__dot" aria-hidden="true" /> {b.label} <span className="hint">{b.count}</span>
            </button>
          ))}
      </div>
      {children}
    </div>
  )
}
