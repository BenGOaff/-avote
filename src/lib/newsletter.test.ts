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
    const altered = t.slice(0, -2) + (t.endsWith('A') ? 'BB' : 'AA')
    expect(openToken(altered)).toBeNull()
    expect(openToken('nimporte-quoi')).toBeNull()
  })
})
