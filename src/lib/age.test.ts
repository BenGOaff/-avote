import { describe, expect, it } from 'vitest'
import { ageAt } from './age'

describe('âge révolu', () => {
  it('compte l’anniversaire seulement une fois passé', () => {
    expect(ageAt('1970-11-28', new Date('2026-10-14T12:00:00Z'))).toBe(55)
    expect(ageAt('1970-10-14', new Date('2026-10-14T12:00:00Z'))).toBe(56)
  })
  it('rien sans date complète', () => {
    expect(ageAt(null)).toBeNull()
    expect(ageAt('1970')).toBeNull()
  })
})
