'use client'
import { useEffect, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { VAPID_PUBLIC_KEY } from '@/lib/push-shared'

const T = UI_COPY.alertes
type Status = 'loading' | 'unsupported' | 'ios' | 'denied' | 'off' | 'on' | 'busy' | 'error'

const key = (b64: string) => {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

/**
 * « Me prévenir sur ce téléphone » : abonnement aux notifications du site. Le navigateur fournit une adresse
 * de notification et deux clés ; c'est tout ce qui part au serveur (src/app/api/alertes/push).
 * Sans réponses gardées sur l'appareil, le téléphone ne peut pas comparer : on propose de les garder (onKeep).
 */
export function PushToggle({ local, onKeep }: { local: boolean; onKeep: () => void }) {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    void (async () => {
      const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window))
        return setStatus(ios && !standalone ? 'ios' : 'unsupported')
      if (Notification.permission === 'denied') return setStatus('denied')
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      setStatus(sub ? 'on' : 'off')
    })().catch(() => setStatus('unsupported'))
  }, [])

  const enable = async () => {
    setStatus('busy')
    try {
      if ((await Notification.requestPermission()) !== 'granted') return setStatus('denied')
      const reg = await navigator.serviceWorker.ready
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(VAPID_PUBLIC_KEY) }))
      const { endpoint, keys } = sub.toJSON()
      const res = await fetch('/api/alertes/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint, keys }) })
      if (!res.ok) {
        await sub.unsubscribe()
        return setStatus('error')
      }
      setStatus('on')
    } catch {
      setStatus('error')
    }
  }

  const disable = async () => {
    setStatus('busy')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/alertes/push', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {})
        await sub.unsubscribe()
      }
      setStatus('off')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'loading') return null
  return (
    <div className="stack" style={{ gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
      <h3>{T.pushTitle}</h3>
      <p>{T.pushText}</p>
      {status === 'unsupported' && <p className="hint">{T.pushUnsupported}</p>}
      {status === 'ios' && <p className="hint">{T.pushIos}</p>}
      {status === 'denied' && <p className="hint">{T.pushDenied}</p>}
      {status === 'error' && (
        <p role="alert" className="alert alert--correction">
          {T.pushError}
        </p>
      )}
      {status === 'on' && (
        <p role="status" className="hint">
          {T.pushActive}
        </p>
      )}
      {(status === 'off' || status === 'error' || status === 'busy') && (
        <button className="btn" onClick={enable} disabled={status === 'busy'} data-loading={status === 'busy'}>
          {status === 'busy' ? T.pushBusy : T.pushOn}
        </button>
      )}
      {status === 'on' && (
        <button className="btn btn--secondary" onClick={disable}>
          {T.pushOff}
        </button>
      )}
      {status === 'on' && !local && (
        <div className="alert alert--info">
          <p>{T.pushKeep}</p>
          <button className="btn btn--small btn--secondary" onClick={onKeep}>
            {T.pushKeepBtn}
          </button>
        </div>
      )}
    </div>
  )
}
