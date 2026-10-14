import { describe, expect, it } from 'vitest'
import { seeded, shuffled } from './shuffle'

describe('ordre tiré au hasard', () => {
  it('garde tous les éléments, sans toucher à la liste d’origine', () => {
    const list = ['a', 'b', 'c', 'd', 'e']
    const out = shuffled(list)
    expect([...out].sort()).toEqual(list)
    expect(list).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
  it('chaque élément peut arriver en tête, à fréquence comparable', () => {
    const first: Record<string, number> = {}
    for (let k = 0; k < 6000; k++) {
      const f = shuffled(['a', 'b', 'c'])[0]!
      first[f] = (first[f] ?? 0) + 1
    }
    for (const x of ['a', 'b', 'c']) expect(first[x]).toBeGreaterThan(1700)
  })
  it('même graine, même ordre (le menu et les sections d’une page restent alignés)', () => {
    expect(shuffled(['a', 'b', 'c', 'd'], seeded(42))).toEqual(shuffled(['a', 'b', 'c', 'd'], seeded(42)))
  })
})
