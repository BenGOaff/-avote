import { describe, expect, it } from 'vitest'
import { applyAgendaEvents, quoteStatesDate, type FoundEvent } from './agenda-lib'
import type { RawItem } from './veille-lib'

const item: RawItem = {
  id: 'i1',
  feedId: 'lcp',
  feedName: 'LCP',
  title: 'Les Écologistes trancheront en décembre',
  summary: 'La direction maintient la candidature jusqu’au référendum interne qui aura lieu du 10 au 13 décembre. Un débat est prévu le 3 novembre à Lyon.',
  link: 'https://example.org/a',
  date: '2026-10-01',
}
const base: FoundEvent = {
  title: 'Vote interne des Écologistes',
  kind: 'parti',
  date: '2026-12-10',
  end: '2026-12-13',
  time: '',
  summary: 'Les adhérents tranchent.',
  who: ['Marine Tondelier', 'Inconnu Total'],
  place: '',
  itemId: 'i1',
  quote: 'jusqu’au référendum interne qui aura lieu du 10 au 13 décembre',
}
const run = (found: FoundEvent[], events = [] as never[]) => {
  const file = { updatedAt: '2026-10-01', events }
  const res = applyAgendaEvents(file, found, new Map([['i1', item]]), new Map([['marine-tondelier', 'marine-tondelier']]), new Date('2026-10-14T08:00:00Z'), 'test')
  return { file, ...res }
}

describe('agenda : ajout par la veille', () => {
  it('la phrase doit donner le jour et le mois', () => {
    expect(quoteStatesDate('du 10 au 13 décembre', '2026-12-13')).toBe(true)
    expect(quoteStatesDate('le 1er mai', '2027-05-01')).toBe(true)
    expect(quoteStatesDate('le 3 novembre à Lyon', '2026-11-03')).toBe(true)
    expect(quoteStatesDate('mi-décembre', '2026-12-15')).toBe(false)
    expect(quoteStatesDate('le 13 novembre', '2026-12-13')).toBe(false)
  })
  it('ajoute un rendez-vous sourcé, garde les seuls candidats connus', () => {
    const { file, added } = run([base])
    expect(added).toHaveLength(1)
    expect(file.events[0]).toMatchObject({ date: '2026-12-10', end: '2026-12-13', who: ['marine-tondelier'], source: { url: 'https://example.org/a' } })
  })
  it('refuse une date déduite, une citation absente, une date passée, et les doublons', () => {
    expect(run([{ ...base, date: '2026-12-15', end: '', quote: 'jusqu’au référendum interne qui aura lieu du 10 au 13 décembre' }]).added).toHaveLength(0)
    expect(run([{ ...base, quote: 'le vote aura lieu du 10 au 13 décembre prochain sans faute' }]).rejected[0]).toMatch(/citation introuvable/)
    expect(run([{ ...base, date: '2026-10-01', end: '' }]).rejected[0]).toMatch(/hors période/)
    const once = run([base])
    expect(run([base], once.file.events as never[]).added).toHaveLength(0)
  })
})
