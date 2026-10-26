import { describe, expect, it } from 'vitest'
import { cleanName, decodeDuel, encodeDuel } from './duel-link'

const ITEMS = ['a-1', 'a-2', 'a-3', 'a-4']

describe('lien de duel à distance', () => {
  it('aller-retour : réponses et prénom', () => {
    const link = encodeDuel(ITEMS, { 'a-1': { kind: 'value', value: -2 }, 'a-2': { kind: 'value', value: 2 }, 'a-3': { kind: 'dontknow' } }, 'Léa', '0.3.0')
    expect(link).toMatch(/^d=030\.aeks\./)
    const back = decodeDuel(`#${link}`, ITEMS, '0.3.0')
    expect(back?.name).toBe('Léa')
    expect(back?.answers['a-1']).toEqual({ kind: 'value', value: -2 })
    expect(back?.answers['a-2']).toEqual({ kind: 'value', value: 2 })
    expect(back?.answers['a-3']).toEqual({ kind: 'dontknow' })
    expect(back?.answers['a-4']).toBeUndefined()
  })
  it('refuse un lien abîmé, d’une autre version, ou sans aucune réponse', () => {
    const link = encodeDuel(ITEMS, { 'a-1': { kind: 'value', value: 0 } }, '', '0.3.0')
    expect(decodeDuel(`#${link}`, ITEMS, '0.4.0')).toBeNull()
    expect(decodeDuel('#d=030.abz.', ITEMS, '0.3.0')).toBeNull()
    expect(decodeDuel('#d=030.ssss.', ITEMS, '0.3.0')).toBeNull()
    expect(decodeDuel('#nimporte', ITEMS, '0.3.0')).toBeNull()
  })
  it('ne garde du prénom que des lettres', () => {
    expect(cleanName('  <script>Jo</script>  ')).toBe('scriptJoscript')
    expect(cleanName('Marie-Ève O’Neil')).toBe('Marie-Ève ONeil')
    expect(cleanName("Anne d'Arc")).toBe("Anne d'Arc")
  })
})
