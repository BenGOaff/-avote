'use client'

import { Children, createElement, useEffect, useState, type ReactNode } from 'react'
import { seeded, shuffled } from '@/lib/shuffle'

/** Une graine par groupe et par chargement de page : les listes d'un même groupe sont mélangées pareil */
const seeds = new Map<string, number>()
const seedOf = (group: string) => seeds.get(group) ?? (seeds.set(group, Math.floor(Math.random() * 2 ** 32)), seeds.get(group)!)

/** Liste dans un ordre tiré au hasard à chaque affichage (dans le navigateur, après le chargement). */
export function useShuffled<T>(items: readonly T[], group?: string): readonly T[] {
  const [order, setOrder] = useState<readonly T[] | null>(null)
  const key = items.length
  useEffect(() => {
    setOrder(shuffled(items, group ? seeded(seedOf(group)) : Math.random))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return order && order.length === items.length ? order : items
}

/** Enfants affichés dans un ordre tiré au hasard ; le serveur (et sans JavaScript) garde l'ordre reçu. */
export function Shuffle({ children, as = 'ul', className, role, ariaLabel, group }: { children: ReactNode; as?: 'ul' | 'ol' | 'div' | 'span'; className?: string; role?: string; ariaLabel?: string; group?: string }) {
  const items = useShuffled(Children.toArray(children), group)
  return createElement(as, { className, role, 'aria-label': ariaLabel }, items)
}
