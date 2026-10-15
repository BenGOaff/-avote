import { describe, expect, it } from 'vitest'
import { DEPLOY_DELAY_MS, PAYLOAD_MAX_BYTES, digest, pushPayload, touched, who, worthEmail, worthPush, type Change } from './alertes'

const now = new Date('2026-10-15T17:00:00Z') // jeudi
const at = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString()
const text = { title: 't', body: 'b {who}', mineTitle: 'm', mineBody: '{n} {who}' }

describe('digest', () => {
  const changes: Change[] = [
    { date: at(30), actor: 'a', item: 'eco-01' }, // avant le curseur
    { date: at(5), actor: 'a', item: 'eco-02' },
    { date: at(4), actor: 'b', item: 'eco-02' },
    { date: at(3), actor: 'retire', item: 'eco-03' }, // plus dans le test
    { date: new Date(now.getTime() - DEPLOY_DELAY_MS / 2).toISOString(), actor: 'b', item: 'eco-04' }, // pas encore en ligne
  ]
  const d = digest({ at: at(24), actors: ['a'] }, changes, ['a', 'b'], now)

  it('ne garde que les changements publiés depuis le curseur, en ligne, de candidats dans le test', () => {
    expect(d.changes.map((c) => c.item)).toEqual(['eco-02', 'eco-02'])
  })
  it('repère les candidats entrés dans le test', () => {
    expect(d.fresh).toEqual(['b'])
  })
  it('avance le curseur jusqu’à ce qui est en ligne, sans perdre le changement en cours de déploiement', () => {
    expect(Date.parse(d.next.at)).toBe(now.getTime() - DEPLOY_DELAY_MS)
    expect(digest(d.next, changes, ['a', 'b'], new Date(now.getTime() + DEPLOY_DELAY_MS)).changes.map((c) => c.item)).toEqual(['eco-04'])
  })
  it('classe les candidats touchés', () => {
    expect(touched(d)).toEqual([
      { actor: 'a', count: 1 },
      { actor: 'b', count: 1 },
    ])
  })
})

describe('quand prévenir', () => {
  const many: Change[] = Array.from({ length: 12 }, (_, i) => ({ date: at(2), actor: 'a', item: `eco-${i}` }))
  it('notification dès qu’il y a du nouveau, rien sinon', () => {
    expect(worthPush(digest({ at: at(24), actors: ['a'] }, many, ['a'], now))).toBe(true)
    expect(worthPush(digest({ at: at(1), actors: ['a'] }, many, ['a'], now))).toBe(false)
  })
  it('email : assez de changements, trois jours d’écart, jamais le lundi', () => {
    const old = { at: at(80), actors: ['a'] }
    expect(worthEmail(digest(old, many, ['a'], now), old, now)).toBe(true)
    expect(worthEmail(digest(old, many.slice(0, 3), ['a'], now), old, now)).toBe(false)
    const recent = { at: at(48), actors: ['a'] }
    expect(worthEmail(digest(recent, many, ['a'], now), recent, now)).toBe(false)
    const monday = new Date('2026-10-19T17:00:00Z')
    expect(worthEmail(digest(old, many, ['a'], monday), old, monday)).toBe(false)
  })
  it('email : un candidat qui entre dans le test suffit', () => {
    const old = { at: at(80), actors: ['a'] }
    expect(worthEmail(digest(old, [], ['a', 'b'], now), old, now)).toBe(true)
  })
})

describe('contenu de la notification', () => {
  it('liste par affirmation les candidats qui ont bougé', () => {
    const d = digest({ at: at(24), actors: ['a', 'b'] }, [
      { date: at(2), actor: 'a', item: 'eco-01' },
      { date: at(2), actor: 'b', item: 'eco-01' },
    ], ['a', 'b'], now)
    const p = pushPayload(d, (s) => s.toUpperCase(), text, '/resultats')
    expect(p.p).toEqual({ 'eco-01': ['a', 'b'] })
    expect(p.names).toEqual({ a: 'A', b: 'B' })
    expect(p.n).toBe(2)
  })
  it('reste sous la taille d’une notification, en gardant le total', () => {
    const changes = Array.from({ length: 2000 }, (_, i) => ({ date: at(2), actor: `candidat-${i % 30}`, item: `item-${i}` }))
    const p = pushPayload(digest({ at: at(24), actors: [] }, changes, Array.from({ length: 30 }, (_, i) => `candidat-${i}`), now), (s) => s, text, '/resultats')
    expect(new TextEncoder().encode(JSON.stringify(p)).length).toBeLessThanOrEqual(PAYLOAD_MAX_BYTES)
    expect(p.n).toBe(2000)
  })
})

describe('who', () => {
  it('écrit une liste lisible', () => {
    expect(who(['A'])).toBe('A')
    expect(who(['A', 'B'])).toBe('A et B')
    expect(who(['A', 'B', 'C', 'D', 'E'])).toBe('A, B, C et 2 autres')
  })
})
