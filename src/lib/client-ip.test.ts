import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { clientIp, sameOrigin } from './client-ip'

const req = (headers: Record<string, string>) => new NextRequest('https://xn--avote-xra.fr/api/x', { method: 'POST', headers })
const HOST = 'xn--avote-xra.fr'

describe('sameOrigin', () => {
  it('accepte une requête du site', () => {
    expect(sameOrigin(req({ origin: 'https://xn--avote-xra.fr' }), HOST)).toBe(true)
  })
  it('refuse une requête d’un autre site', () => {
    expect(sameOrigin(req({ origin: 'https://exemple.fr' }), HOST)).toBe(false)
    expect(sameOrigin(req({ origin: 'null', 'sec-fetch-site': 'cross-site' }), HOST)).toBe(false)
  })
  it('accepte « Origin: null » d’une page sans référent du site, grâce à Sec-Fetch-Site', () => {
    expect(sameOrigin(req({ origin: 'null', 'sec-fetch-site': 'same-origin' }), HOST)).toBe(true)
    expect(sameOrigin(req({ origin: 'null', 'sec-fetch-site': 'same-origin' }), HOST, false)).toBe(true)
  })
  it('refuse « Origin: null » sans autre indice', () => {
    expect(sameOrigin(req({ origin: 'null' }), HOST, false)).toBe(false)
  })
  it('sans origine : refusé si exigée, toléré sinon', () => {
    expect(sameOrigin(req({}), HOST)).toBe(false)
    expect(sameOrigin(req({}), HOST, false)).toBe(true)
  })
})

describe('clientIp', () => {
  it('lit X-Real-IP par défaut, jamais X-Forwarded-For', () => {
    expect(clientIp(req({ 'x-real-ip': ' 203.0.113.7 ', 'x-forwarded-for': '198.51.100.1' }))).toBe('203.0.113.7')
    expect(clientIp(req({ 'x-forwarded-for': '198.51.100.1' }))).toBe('')
  })
})
