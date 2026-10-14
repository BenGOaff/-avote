import { describe, expect, it } from 'vitest'
import { daysBefore, nthFridayBefore, REGISTRATION_DEADLINE, REGISTRATION_DEADLINE_SPECIAL } from './vote-dates'

describe('délais du scrutin', () => {
  it('6e vendredi avant le dimanche 18 avril 2027 : le 12 mars 2027', () => {
    expect(REGISTRATION_DEADLINE).toBe('2027-03-12')
  })
  it('le jour même ne compte pas, même un vendredi', () => {
    expect(nthFridayBefore('2027-04-16', 1)).toBe('2027-04-09')
  })
  it('10e jour avant le premier tour : le 8 avril 2027', () => {
    expect(REGISTRATION_DEADLINE_SPECIAL).toBe('2027-04-08')
    expect(daysBefore('2027-03-01', 1)).toBe('2027-02-28')
  })
})
