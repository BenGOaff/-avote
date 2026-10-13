import { beforeAll, describe, expect, it } from 'vitest'
import { randomBytes } from 'node:crypto'
import { openToken, sealToken } from './newsletter'

beforeAll(() => {
  process.env.NEWSLETTER_SECRET = randomBytes(32).toString('base64')
})

describe('jeton de confirmation newsletter', () => {
  it('chiffre puis déchiffre email et prénom', () => {
    const t = sealToken({ email: 'a@b.fr', firstName: 'Béné' })
    expect(t).not.toContain('a@b.fr')
    expect(openToken(t)).toMatchObject({ email: 'a@b.fr', firstName: 'Béné' })
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
