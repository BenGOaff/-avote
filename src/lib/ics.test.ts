import { describe, expect, it } from 'vitest'
import { buildIcs, icsEscape, icsFold } from './ics'

describe('fichiers .ics', () => {
  it('échappe virgules, points-virgules et retours à la ligne', () => {
    expect(icsEscape('Débat, 1er tour; ligne\nsuite')).toBe('Débat\\, 1er tour\\; ligne\\nsuite')
  })
  it('replie les lignes longues sans dépasser 75 octets ni couper un accent', () => {
    const folded = icsFold(`SUMMARY:${'é'.repeat(60)}`)
    for (const l of folded.split('\r\n')) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75)
    expect(folded.replace(/\r\n /g, '')).toBe(`SUMMARY:${'é'.repeat(60)}`)
  })
  it('journée entière : fin le lendemain exclu ; heure : fuseau de Paris', () => {
    const ics = buildIcs(
      [
        { uid: 'a@x', title: 'Premier tour', date: '2027-04-18', alarms: [1] },
        { uid: 'b@x', title: 'Débat', date: '2027-04-28', time: '21:00' },
        { uid: 'c@x', title: 'Fin de mois', date: '2027-02-28', time: '23:30', minutes: 60 },
        { uid: 'd@x', title: 'Vote interne', date: '2026-12-10', end: '2026-12-13' },
      ],
      { name: 'Test', stamp: '2026-10-14T08:00:00.000Z' },
    )
    expect(ics).toContain('DTSTART;VALUE=DATE:20270418\r\nDTEND;VALUE=DATE:20270419')
    expect(ics).toContain('TRIGGER:-P1D')
    expect(ics).toContain('DTSTART;TZID=Europe/Paris:20270428T210000\r\nDTEND;TZID=Europe/Paris:20270428T230000')
    expect(ics).toContain('DTEND;TZID=Europe/Paris:20270301T003000')
    expect(ics).toContain('DTSTAMP:20261014T080000Z')
    expect(ics).toContain('DTSTART;VALUE=DATE:20261210\r\nDTEND;VALUE=DATE:20261214')
    expect(ics).toContain('BEGIN:VTIMEZONE\r\nTZID:Europe/Paris')
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })
})
