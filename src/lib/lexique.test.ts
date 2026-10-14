import { describe, expect, it } from 'vitest'
import { annotate, TERMS } from './lexique'

describe('lexique', () => {
  it('repère les termes entiers, une seule fois', () => {
    const { segments, used } = annotate('Le SMIC et le SMIC encore, puis le 49.3 et une motion de censure.')
    expect(used).toEqual(['smic', '49-3', 'motion-de-censure'])
    expect(segments.filter((s) => typeof s !== 'string')).toHaveLength(3)
    expect(segments.map((s) => (typeof s === 'string' ? s : s.text)).join('')).toBe('Le SMIC et le SMIC encore, puis le 49.3 et une motion de censure.')
  })
  it('ignore les sigles dans un mot et respecte la casse des sigles', () => {
    expect(annotate('Les taxes sur l’électricité et l’espace public, les médicaments.').used).toEqual([])
    expect(annotate('Une âme bien née').used).toEqual([])
    expect(annotate('L’aide médicale d’État (AME) devrait être limitée.').used).toEqual(['ame'])
  })
  it('accords et pluriels, et termes déjà expliqués', () => {
    expect(annotate('Elles devraient être régularisées ; l’État devrait nationaliser.').used).toEqual(['regularisation', 'nationalisation'])
    expect(annotate('Le RSA reste.', new Set(['rsa'])).used).toEqual([])
  })
  it('chaque terme a une définition courte et longue', () => {
    for (const t of TERMS) {
      expect(t.short.length).toBeGreaterThan(20)
      expect(t.short.length).toBeLessThanOrEqual(160)
      expect(t.long.length).toBeGreaterThan(20)
      if (t.source) expect(t.source.url.startsWith('https://')).toBe(true)
    }
  })
})
