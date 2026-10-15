/* Service worker de Ça vote ? — cache des ressources publiques uniquement.
 * Aucune donnée personnelle n'est mise en cache : les réponses vivent dans IndexedDB / sessionStorage.
 * Les routes /api/ ne sont jamais mises en cache. */
const VERSION = 'v1'
const STATIC = `cv-static-${VERSION}`
const PAGES = `cv-pages-${VERSION}`
const OFFLINE_URLS = ['/', '/test', '/resultats', '/mon-profil', '/radar', '/methodologie']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll(OFFLINE_URLS))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  // Ressources versionnées : cache d'abord
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/brand/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) cache.put(req, res.clone())
        return res
      }),
    )
    return
  }

  // Pages : réseau d'abord (contenu frais), cache en secours hors ligne
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(PAGES).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/')) || Response.error()),
    )
  }
})

/* Notifications « ton résultat peut bouger » (src/lib/alertes.ts).
 * Le message annonce, pour chaque affirmation, les candidats dont la position a changé. Le téléphone compte ceux qui
 * touchent ses propres réponses, lues dans IndexedDB sur l'appareil : rien ne repart vers le serveur. */
function readVoter() {
  return new Promise((resolve) => {
    let req
    try {
      req = indexedDB.open('ca-vote', 1)
    } catch {
      return resolve(null)
    }
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('state')) req.result.createObjectStore('state')
    }
    req.onerror = () => resolve(null)
    req.onsuccess = () => {
      const db = req.result
      try {
        const get = db.transaction('state', 'readonly').objectStore('state').get('voter')
        get.onsuccess = () => {
          db.close()
          resolve(get.result || null)
        }
        get.onerror = () => {
          db.close()
          resolve(null)
        }
      } catch {
        db.close()
        resolve(null)
      }
    }
  })
}

function who(names) {
  if (names.length <= 3) return names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : names[0] || ''
  const rest = names.length - 3
  return `${names.slice(0, 3).join(', ')} et ${rest} autre${rest > 1 ? 's' : ''}`
}

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let msg
      try {
        msg = event.data.json()
      } catch {
        return
      }
      if (!msg || msg.v !== 1 || !msg.text) return
      const voter = await readVoter()
      const answers = (voter && voter.answers) || {}
      const hidden = new Set((voter && voter.hiddenActors) || [])
      let mine = 0
      const people = new Set()
      for (const [item, actors] of Object.entries(msg.p || {})) {
        if (!answers[item] || answers[item].kind !== 'value') continue
        for (const a of actors)
          if (!hidden.has(a)) {
            mine++
            people.add(a)
          }
      }
      for (const a of msg.fresh || []) people.add(a)
      const all = new Set([...(msg.fresh || []), ...Object.values(msg.p || {}).flat()])
      const name = (s) => (msg.names && msg.names[s]) || s
      const fill = (t, n, list) => t.replace('{n}', String(n)).replace('{who}', who([...list].map(name)))
      const personal = mine > 0 || (voter && (msg.fresh || []).length > 0)
      await self.registration.showNotification(personal ? msg.text.mineTitle : msg.text.title, {
        body: personal ? fill(msg.text.mineBody, mine, people) : fill(msg.text.body, msg.n, all),
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'resultat',
        data: { url: msg.url || '/resultats' },
      })
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL((event.notification.data && event.notification.data.url) || '/resultats', self.location.origin)
  if (url.origin !== self.location.origin) return
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list)
        if (new URL(c.url).origin === url.origin && 'focus' in c) {
          c.navigate(url.href)
          return c.focus()
        }
      return self.clients.openWindow(url.href)
    }),
  )
})
