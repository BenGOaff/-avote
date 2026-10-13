import { describe, expect, it } from 'vitest'
import { resultDrift } from './result-drift'
import { emptyState, type LocalVoterState } from './local-store'
import type { Answers, Corpus, Ordinal, Position, QuestionSet } from './engine/types'

const set: QuestionSet = {
  version: 'test',
  status: 'brouillon',
  // Assez de réponses et de thèmes pour un classement publiable (ENGINE_CONFIG.ranking)
  themes: Array.from({ length: 6 }, (_, t) => ({ id: `t${t}`, label: `Thème ${t}`, description: '' })),
  dimensions: [{ id: 'd', label: 'D', low: '-', high: '+', definition: '' }],
  items: Array.from({ length: 30 }, (_, j) => ({ id: `q${j}`, version: '1', theme: `t${j % 6}`, concept: '', text: '', explanation: '', dimensions: { d: 1 as const } })),
}
const pos = (v: Ordinal, codedAt: string): Position => ({ value: v, status: 'explicite', sources: ['s'], codedAt })
const allPos = (v: Ordinal, codedAt: string) => Object.fromEntries(set.items.map((i) => [i.id, pos(v, codedAt)]))
const answers: Answers = Object.fromEntries(set.items.map((i) => [i.id, { kind: 'value' as const, value: 2 as Ordinal }]))

function state(lastTop: string, at: string, version = 'v1'): LocalVoterState {
  return {
    ...emptyState('test'),
    answers,
    answeredVersions: Object.fromEntries(set.items.map((i) => [i.id, '1'])),
    lastResult: { at, corpusVersion: version, top: [lastTop] },
  }
}
const corpus = (positions: Corpus['positions'], version = 'v2'): Corpus => ({
  version,
  mode: 'live',
  questionSet: 'test',
  publishedAt: '2026-10-12T00:00:00Z',
  actors: [
    { slug: 'a', name: 'Alice', status: 'declare', summary: '' },
    { slug: 'b', name: 'Bruno', status: 'declare', summary: '' },
  ],
  positions,
})

describe('resultDrift', () => {
  it('rien si le corpus n’a pas changé de version', () => {
    const c = corpus({ a: allPos(2, '2026-10-01T00:00:00Z'), b: allPos(-2, '2026-10-01T00:00:00Z') }, 'v1')
    expect(resultDrift(state('a', '2026-10-05T00:00:00Z'), set, c, [])).toBeNull()
  })

  it('compte les positions codées après le dernier résultat, sur des réponses données', () => {
    const c = corpus({ a: allPos(2, '2026-10-01T00:00:00Z'), b: { ...allPos(-2, '2026-10-01T00:00:00Z'), q0: pos(-1, '2026-10-10T00:00:00Z') } })
    const d = resultDrift(state('a', '2026-10-05T00:00:00Z'), set, c, [])
    expect(d?.newPositions).toBe(1)
    expect(d?.actors).toEqual(['Bruno'])
    expect(d?.topChanged).toBe(false)
  })

  it('signale un changement de premier', () => {
    const c = corpus({ a: allPos(-2, '2026-10-10T00:00:00Z'), b: allPos(2, '2026-10-10T00:00:00Z') })
    const d = resultDrift(state('a', '2026-10-05T00:00:00Z'), set, c, [])
    expect(d?.topChanged).toBe(true)
    expect(d?.before).toBe('Alice')
    expect(d?.now).toBe('Bruno')
  })

  it('rien de nouveau ni de changement : null', () => {
    const c = corpus({ a: allPos(2, '2026-10-01T00:00:00Z'), b: allPos(-2, '2026-10-01T00:00:00Z') })
    expect(resultDrift(state('a', '2026-10-05T00:00:00Z'), set, c, [])).toBeNull()
  })
})
