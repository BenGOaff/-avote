import 'server-only'
import data from '@content/acteurs/presentations.json'
import { ageAt } from './age'

export interface Presentation {
  intro: string
  /** Âge révolu, seulement si la date de naissance complète est sourcée */
  age: number | null
  sources: { title: string; publisher: string; url: string; quote: string }[]
}

type Raw = { born: string | null; intro: string; sources: Presentation['sources'] }
const all = data.presentations as Record<string, Raw>

export function presentationOf(slug: string): Presentation | null {
  const p = all[slug]
  return p ? { intro: p.intro, age: ageAt(p.born), sources: p.sources } : null
}
