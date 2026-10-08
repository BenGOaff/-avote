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
