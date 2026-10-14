import { describe, expect, it } from 'vitest'
import { buildRecap, previousWeek, weekOf, weekRange, weeksSince } from './semaine'

describe('la semaine de la présidentielle', () => {
  it('semaines ISO', () => {
    expect(weekOf('2026-10-14')).toBe('2026-W42')
    expect(weekRange('2026-W42')).toEqual({ start: '2026-10-12', end: '2026-10-18' })
    expect(weekOf('2027-01-01')).toBe('2026-W53')
    expect(weekRange('2027-W01')).toEqual({ start: '2027-01-04', end: '2027-01-10' })
    expect(previousWeek(new Date('2026-10-19T06:00:00Z'))).toBe('2026-W42')
    expect(weeksSince('2026-09-28', new Date('2026-10-14T08:00:00Z'))).toEqual(['2026-W42', '2026-W41', '2026-W40'])
  })
  it('compte les positions nouvelles et changées, à l’heure de Paris', () => {
    const r = buildRecap('2026-W42', {
      changes: [
        { date: '2026-10-11T22:30:00Z', actor: 'a', item: 'x1', from: 'inconnue', to: '2' }, // lundi 0 h 30 à Paris
        { date: '2026-10-13T10:00:00Z', actor: 'a', item: 'x2', from: 'inconnue', to: '-1' },
        { date: '2026-10-14T10:00:00Z', actor: 'b', item: 'x1', from: '1', to: '-1' },
        { date: '2026-10-14T10:00:00Z', actor: 'b', item: 'x3', from: '1', to: '1' },
        { date: '2026-10-19T10:00:00Z', actor: 'c', item: 'x1', from: 'inconnue', to: '2' },
      ],
      themeOf: (i) => (i === 'x1' ? 'Impôts' : 'École'),
      intox: [{ id: 'i', claim: 'c', verdict: 'Faux', date: '2026-10-13' }],
      candidacies: [],
      agenda: [
        { id: 'e1', title: 'Vote', date: '2026-10-25' },
        { id: 'e2', title: 'Trop loin', date: '2026-12-25' },
      ],
    })
    expect(r.addedTotal).toBe(2)
    expect(r.added[0]).toEqual({ actor: 'a', count: 2, themes: ['Impôts', 'École'] })
    expect(r.changedTotal).toBe(1)
    expect(r.intox).toHaveLength(1)
    expect(r.next.map((e) => e.id)).toEqual(['e1'])
    expect(r.empty).toBe(false)
  })
})
