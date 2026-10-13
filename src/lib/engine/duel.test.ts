import { describe, expect, it } from 'vitest'
import { DUEL_MIN_BOTH, duelAgreement } from './scoring'
import type { Answers, Ordinal } from './types'

const ids = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']
const all = (v: Ordinal): Answers => Object.fromEntries(ids.map((id) => [id, { kind: 'value', value: v }]))

describe('duelAgreement', () => {
  it('mêmes réponses : 100, tout en accord', () => {
    const r = duelAgreement(ids, all(1), all(1))
    expect(r.score).toBe(100)
    expect(r.items.every((i) => i.verdict === 'accord')).toBe(true)
  })

  it('opposés aux extrêmes : 0, tout en désaccord', () => {
    const r = duelAgreement(ids, all(2), all(-2))
    expect(r.score).toBe(0)
    expect(r.items.every((i) => i.verdict === 'desaccord')).toBe(true)
  })

  it('classe accord, nuance et désaccord', () => {
    const a: Answers = { q1: { kind: 'value', value: 2 }, q2: { kind: 'value', value: 2 }, q3: { kind: 'value', value: 1 }, q4: { kind: 'value', value: 0 }, q5: { kind: 'value', value: 0 } }
    const b: Answers = { q1: { kind: 'value', value: 1 }, q2: { kind: 'value', value: 0 }, q3: { kind: 'value', value: -1 }, q4: { kind: 'value', value: 0 }, q5: { kind: 'value', value: -2 } }
    const r = duelAgreement(ids, a, b)
    const v = Object.fromEntries(r.items.map((i) => [i.itemId, i.verdict]))
    expect(v).toEqual({ q1: 'accord', q2: 'nuance', q3: 'desaccord', q4: 'accord', q5: 'nuance' })
    // (0,75 + 0,5 + 0,5 + 1 + 0,5) / 5
    expect(r.score).toBe(65)
    expect(r.items[0]!.gap).toBe(2)
  })

  it('écarte les réponses hors échelle des deux côtés', () => {
    const a = all(1)
    const b: Answers = { ...all(1), q1: { kind: 'dontknow' }, q2: { kind: 'skip' } }
    const r = duelAgreement(ids, a, b)
    expect(r.both).toBe(4)
    expect(r.items.map((i) => i.itemId)).not.toContain('q1')
  })

  it('pas de score sous le minimum de réponses communes', () => {
    const r = duelAgreement(ids.slice(0, DUEL_MIN_BOTH - 1), all(1), all(1))
    expect(r.score).toBeNull()
  })
})
