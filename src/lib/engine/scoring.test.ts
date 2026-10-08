import { describe, expect, it } from 'vitest'
import { itemWeights, rankActors, redLineStatus, scoreActor, themeWeights } from './scoring'
import { computeDimensions } from './dimensions'
import type { Actor, Answers, Ordinal, Position, QuestionSet } from './types'

function makeSet(themes: number, perTheme: number): QuestionSet {
  const th = Array.from({ length: themes }, (_, i) => ({ id: `t${i}`, label: `Thème ${i}`, description: '' }))
  const items = th.flatMap((t) =>
    Array.from({ length: perTheme }, (_, j) => ({
      id: `${t.id}-${j}`,
      version: '1',
      theme: t.id,
      concept: '',
      text: '',
      explanation: '',
      dimensions: { d: 1 as const },
    })),
  )
  return { version: 'test', status: 'brouillon', themes: th, dimensions: [{ id: 'd', label: 'D', low: '-', high: '+', definition: '' }], items }
}

const val = (v: Ordinal): Position => ({ value: v, status: 'explicite', sources: ['s'] })
const ans = (v: Ordinal) => ({ kind: 'value' as const, value: v })

function allAnswers(set: QuestionSet, v: Ordinal): Answers {
  return Object.fromEntries(set.items.map((i) => [i.id, ans(v)]))
}
function allPositions(set: QuestionSet, v: Ordinal): Record<string, Position> {
  return Object.fromEntries(set.items.map((i) => [i.id, val(v)]))
}

describe('formules de proximité (§10)', () => {
  it('SCR 04 — exemple de référence : 50 observé, 75 % couverture, bornes 37,5 et 62,5', () => {
    const set = makeSet(1, 4)
    const answers: Answers = { 't0-0': ans(2), 't0-1': ans(2), 't0-2': ans(2), 't0-3': ans(2) }
    const positions = { 't0-0': val(2), 't0-1': val(0), 't0-2': val(-2), 't0-3': { missing: true as const, status: 'inconnu' as const } }
    const w = itemWeights(set, themeWeights(set, 'global'))
    const s = scoreActor(set, answers, positions, w, 'x')
    expect(s.observed).toBeCloseTo(50, 10)
    expect(s.coverage).toBeCloseTo(0.75, 10)
    expect(s.low).toBeCloseTo(37.5, 10)
    expect(s.high).toBeCloseTo(62.5, 10)
  })

  it('SCR 01 — concordance totale : 100', () => {
    const set = makeSet(7, 6)
    const w = itemWeights(set, themeWeights(set, 'global'))
    const s = scoreActor(set, allAnswers(set, 1), allPositions(set, 1), w, 'x')
    expect(s.observed).toBeCloseTo(100, 10)
    expect(s.low).toBeCloseTo(100, 10)
    expect(s.high).toBeCloseTo(100, 10)
  })

  it('SCR 02 — opposition maximale : 0', () => {
    const set = makeSet(7, 6)
    const w = itemWeights(set, themeWeights(set, 'global'))
    const s = scoreActor(set, allAnswers(set, 2), allPositions(set, -2), w, 'x')
    expect(s.observed).toBeCloseTo(0, 10)
  })

  it('SCR 03 — aucune position connue : pas de score, pas de faux zéro', () => {
    const set = makeSet(7, 6)
    const w = itemWeights(set, themeWeights(set, 'global'))
    const s = scoreActor(set, allAnswers(set, 1), {}, w, 'x')
    expect(s.observed).toBeNull()
    expect(s.low).toBe(0)
    expect(s.high).toBeCloseTo(100, 10)
  })

  it('QST 01 — « je ne sais pas » est une valeur manquante, différente de la position intermédiaire', () => {
    const set = makeSet(1, 2)
    const w = itemWeights(set, themeWeights(set, 'global'))
    const p = { 't0-0': val(2), 't0-1': val(0) }
    const withDK = scoreActor(set, { 't0-0': ans(2), 't0-1': { kind: 'dontknow' } }, p, w, 'x')
    const withMid = scoreActor(set, { 't0-0': ans(2), 't0-1': ans(0) }, p, w, 'x')
    expect(withDK.contributions).toHaveLength(1)
    expect(withMid.contributions).toHaveLength(2)
    expect(withDK.W).toBeCloseTo(withMid.W / 2, 10)
  })

  it('SCR 05 — ajouter des items à un thème ne change pas son poids total', () => {
    const set = makeSet(7, 6)
    const bigger: QuestionSet = {
      ...set,
      items: [...set.items, ...Array.from({ length: 6 }, (_, j) => ({ id: `t0-x${j}`, version: '1', theme: 't0', concept: '', text: '', explanation: '' }))],
    }
    for (const s of [set, bigger]) {
      const w = itemWeights(s, themeWeights(s, 'global'))
      const t0 = s.items.filter((i) => i.theme === 't0').reduce((a, i) => a + (w.get(i.id) ?? 0), 0)
      expect(t0).toBeCloseTo(1 / 7, 12)
    }
  })

  it('poids selon priorités : bₜ = (1 + pₜ) / 17', () => {
    const set = makeSet(7, 6)
    const tw = themeWeights(set, 'priorities', { t0: 10 })
    expect(tw.get('t0')).toBeCloseTo(11 / 17, 12)
    expect(tw.get('t1')).toBeCloseTo(1 / 17, 12)
  })

  it('position ambiguë : hors score central, prise en compte dans les bornes', () => {
    const set = makeSet(1, 2)
    const w = itemWeights(set, themeWeights(set, 'global'))
    const s = scoreActor(set, { 't0-0': ans(2), 't0-1': ans(2) }, { 't0-0': val(2), 't0-1': { set: [0, 1], status: 'ambigu', sources: ['s'] } }, w, 'x')
    expect(s.observed).toBeCloseTo(100, 10)
    expect(s.coverage).toBeCloseTo(0.5, 10)
    // basse : (1·0,5 + 0,5·0,5) = 0,75 ; haute : 0,75 + 0,5·0,25 = 0,875
    expect(s.low).toBeCloseTo(75, 10)
    expect(s.high).toBeCloseTo(87.5, 10)
  })
})

describe('classement (§10.6)', () => {
  const set = makeSet(7, 6)
  const actors: Actor[] = [
    { slug: 'b', name: 'Bravo', status: 'fictif', summary: '' },
    { slug: 'a', name: 'Alpha', status: 'fictif', summary: '' },
  ]

  it('POS 01 / SCR 07 — permuter les noms ne change pas les scores', () => {
    const answers = allAnswers(set, 1)
    const positions = { a: allPositions(set, 2), b: allPositions(set, -1) }
    const r1 = rankActors(set, answers, actors, positions, { mode: 'global' })
    const swapped = actors.map((a) => ({ ...a, name: a.name === 'Alpha' ? 'Bravo' : 'Alpha' }))
    const r2 = rankActors(set, answers, swapped, positions, { mode: 'global' })
    const score = (r: typeof r1, slug: string) => r.entries.find((e) => e.slug === slug)?.commonScore
    expect(score(r1, 'a')).toBe(score(r2, 'a'))
    expect(score(r1, 'b')).toBe(score(r2, 'b'))
    expect(r1.ranked).toBe(true)
    expect(r1.entries[0]?.slug).toBe('a')
  })

  it('SCR 06 — un acteur peu documenté ne monte pas sur un podium par données manquantes', () => {
    const answers = allAnswers(set, 1)
    const sparse = Object.fromEntries(set.items.slice(0, 3).map((i) => [i.id, val(1)]))
    const r = rankActors(set, answers, actors, { a: allPositions(set, 0), b: sparse }, { mode: 'global' })
    expect(r.ranked).toBe(false)
    expect(r.reasons.length).toBeGreaterThan(0)
    // liste alphabétique annoncée
    expect(r.entries.map((e) => e.name)).toEqual(['Alpha', 'Bravo'])
  })

  it('pas de classement sous le seuil de réponses', () => {
    const few: Answers = Object.fromEntries(set.items.slice(0, 10).map((i) => [i.id, ans(1)]))
    const r = rankActors(set, few, actors, { a: allPositions(set, 1), b: allPositions(set, 0) }, { mode: 'global' })
    expect(r.ranked).toBe(false)
  })

  it('SCR 08 — écart faible signalé comme proche', () => {
    const answers = allAnswers(set, 2)
    const pa = allPositions(set, 2)
    const pb = { ...allPositions(set, 2), 't0-0': val(1) } // écart minime
    const r = rankActors(set, answers, actors, { a: pa, b: pb }, { mode: 'global' })
    expect(r.ranked).toBe(true)
    expect(r.entries[1]?.closeToPrevious).toBe(true)
  })
})

describe('lignes rouges et dimensions', () => {
  it('désaccord à deux crans ou plus, inconnu explicite', () => {
    expect(redLineStatus(2, val(0))).toBe('desaccord')
    expect(redLineStatus(2, val(1))).toBe('accord')
    expect(redLineStatus(2, undefined)).toBe('inconnu')
    expect(redLineStatus(2, { set: [1, 0], status: 'ambigu', sources: [] })).toBe('ambigu')
  })

  it('dimension : pas assez de réponses → null, sinon indice 0..100', () => {
    const set = makeSet(1, 5)
    const two: Answers = { 't0-0': ans(2), 't0-1': ans(2) }
    expect(computeDimensions(set, two)[0]?.index).toBeNull()
    const all = allAnswers(set, 2)
    expect(computeDimensions(set, all)[0]?.index).toBe(100)
    expect(computeDimensions(set, allAnswers(set, -2))[0]?.index).toBe(0)
  })
})
