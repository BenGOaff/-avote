'use client'

import { Children, createElement, useEffect, useState, type ReactNode } from 'react'
import { shuffled } from '@/lib/shuffle'

/** Liste dans un ordre tiré au hasard à chaque affichage (dans le navigateur, après le chargement). */
export function useShuffled<T>(items: readonly T[]): readonly T[] {
  const [order, setOrder] = useState<readonly T[] | null>(null)
  const key = items.length
  useEffect(() => {
    setOrder(shuffled(items))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return order && order.length === items.length ? order : items
}

/** Enfants affichés dans un ordre tiré au hasard ; le serveur (et sans JavaScript) garde l'ordre reçu. */
export function Shuffle({ children, as = 'ul', className, role, ariaLabel }: { children: ReactNode; as?: 'ul' | 'ol' | 'div' | 'span'; className?: string; role?: string; ariaLabel?: string }) {
  const items = useShuffled(Children.toArray(children))
  return createElement(as, { className, role, 'aria-label': ariaLabel }, items)
}
