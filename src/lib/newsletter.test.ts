import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { randomBytes } from 'node:crypto'
import { addContact, openToken, sealToken } from './newsletter'

beforeAll(() => {
  process.env.NEWSLETTER_SECRET = randomBytes(32).toString('base64')
})

describe('jeton de confirmation newsletter', () => {
  it('chiffre puis déchiffre email et prénom', () => {
    const t = sealToken({ email: 'a@b.fr', firstName: 'Béné' })
    expect(t).not.toContain('a@b.fr')
    expect(openToken(t)).toMatchObject({ email: 'a@b.fr', firstName: 'Béné' })
  })
  it('garde la demande d’alerte', () => {
    expect(openToken(sealToken({ email: 'a@b.fr', firstName: '', alerts: true }))?.alerts).toBe(true)
    expect(openToken(sealToken({ email: 'a@b.fr', firstName: '' }))?.alerts).toBe(false)
  })
  it('refuse un jeton modifié', () => {
    const t = sealToken({ email: 'a@b.fr', firstName: '' })
    // On modifie un octet du message chiffré (et non les derniers caractères base64url, qui peuvent ne porter
    // que des bits de remplissage : le jeton serait alors inchangé une fois décodé)
    const raw = Buffer.from(t, 'base64url')
    raw[raw.length - 1] = raw[raw.length - 1]! ^ 0x01
    const altered = raw.toString('base64url')
    expect(openToken(altered)).toBeNull()
    expect(openToken('nimporte-quoi')).toBeNull()
  })
})

describe('inscription chez Resend', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('rattache un contact déjà connu au segment des alertes', async () => {
    process.env.RESEND_API_KEY = 'cle'
    process.env.RESEND_SEGMENT_ID = 'general'
    process.env.RESEND_ALERT_SEGMENT_ID = 'alertes'
    const calls: string[] = []
    vi.stubGlobal('fetch', async (url: string) => {
      calls.push(url)
      return new Response('{}', { status: 200 })
    })
    expect(await addContact({ email: 'a@b.fr', firstName: '', alerts: true, issuedAt: Date.now() })).toBe(true)
    expect(calls).toContain('https://api.resend.com/contacts/a%40b.fr/segments/alertes')
    expect(calls).toContain('https://api.resend.com/contacts/a%40b.fr/segments/general')
  })
})
