import { describe, expect, it } from 'vitest'
import { isPushEndpoint } from './push-shared'

describe('isPushEndpoint', () => {
  it('accepte les services de notification des navigateurs', () => {
    expect(isPushEndpoint('https://fcm.googleapis.com/fcm/send/abc:def')).toBe(true)
    expect(isPushEndpoint('https://updates.push.services.mozilla.com/wpush/v2/gAAA')).toBe(true)
    expect(isPushEndpoint('https://web.push.apple.com/QOk3')).toBe(true)
    expect(isPushEndpoint('https://wns2-par02p.notify.windows.com/w/?token=x')).toBe(true)
  })
  it('refuse toute autre adresse', () => {
    expect(isPushEndpoint('http://fcm.googleapis.com/fcm/send/abc')).toBe(false)
    expect(isPushEndpoint('https://fcm.googleapis.com.evil.fr/x')).toBe(false)
    expect(isPushEndpoint('https://fcm.googleapis.com:8443/x')).toBe(false)
    expect(isPushEndpoint('https://exemple.fr/push')).toBe(false)
    expect(isPushEndpoint('pas une adresse')).toBe(false)
  })
})
