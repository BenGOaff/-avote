import { describe, expect, it } from 'vitest'
import { firstRoundSummary, latestPolls, secondRoundSummary, type Poll } from './sondages-stats'

const poll = (id: string, institute: string, fieldEnd: string, first: [string, number][][], second: [string, number][][] = []): Poll => ({
  id,
  institute,
  buyer: 'Acheteur fictif',
  fieldStart: fieldEnd,
  fieldEnd,
  published: fieldEnd,
  sample: 1000,
  base: 'inscrits',
  method: 'en ligne',
  url: 'https://example.org',
  firstRound: first.map((h, i) => ({ hypothesis: `H${i}`, results: h.map(([slug, pct]) => ({ slug, name: slug.toUpperCase(), pct })) })),
  secondRound: second.map((d) => ({ results: d.map(([slug, pct]) => ({ slug, name: slug.toUpperCase(), pct })) })),
})

describe('derniers sondages', () => {
  it('garde le plus récent de chaque institut, dans les 30 jours du plus récent', () => {
    const polls = [poll('a1', 'A', '2026-10-01', []), poll('a2', 'A', '2026-10-10', []), poll('b1', 'B', '2026-09-20', []), poll('c1', 'C', '2026-08-01', [])]
    expect(latestPolls(polls).map((p) => p.id)).toEqual(['a2', 'b1'])
  })
  it('rien sans sondage', () => {
    expect(latestPolls([])).toEqual([])
  })
})

describe('premier tour', () => {
  it('fourchettes, rangs et ex aequo', () => {
    const s = firstRoundSummary([
      poll('a', 'A', '2026-10-10', [
        [
          ['x', 30],
          ['y', 20],
          ['z', 18],
        ],
        [
          ['x', 32],
          ['y', 15],
          ['z', 15],
        ],
      ]),
    ])
    expect(s.hypotheses).toBe(2)
    const x = s.candidates.find((c) => c.key === 'x')!
    expect([x.min, x.max, x.first, x.tested]).toEqual([30, 32, 2, 2])
    const z = s.candidates.find((c) => c.key === 'z')!
    expect(z.second).toBe(1)
    expect(s.closeSecond).toBe(2)
    expect(s.candidates[0]!.key).toBe('x')
  })
})

describe('second tour', () => {
  it('regroupe un même duel quel que soit l’ordre et compte qui est devant', () => {
    const d = secondRoundSummary([
      poll(
        'a',
        'A',
        '2026-10-10',
        [],
        [
          [
            ['x', 55],
            ['y', 45],
          ],
        ],
      ),
      poll(
        'b',
        'B',
        '2026-10-09',
        [],
        [
          [
            ['y', 48],
            ['x', 52],
          ],
          [
            ['x', 60],
            ['z', 40],
          ],
        ],
      ),
    ])
    expect(d[0]!.polls).toBe(2)
    expect(d[0]!.sides[0]).toMatchObject({ key: 'x', min: 52, max: 55, ahead: 2 })
    expect(d[0]!.sides[1]).toMatchObject({ key: 'y', min: 45, max: 48, ahead: 0 })
    expect(d).toHaveLength(2)
  })
})
