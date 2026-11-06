// Relais devant les deux copies du site (deploy/docker-compose.yml) : le tunnel Cloudflare parle au relais, le relais
// à la première copie qui répond. Pendant qu'une copie redémarre sur une nouvelle image, l'autre sert : plus de coupure
// à chaque mise à jour. Aucune dépendance, aucun journal des requêtes (docs/SECURITE.md).
import http from 'node:http'

const UPSTREAMS = (process.env.UPSTREAMS || 'http://app_a:3000,http://app_b:3000').split(',').map((u) => new URL(u.trim()))
const PORT = Number(process.env.PORT || 8080)
const MAX_BODY = 2 * 1024 * 1024 // un formulaire, jamais un fichier : le corps est gardé pour pouvoir réessayer
const RETRY_FOR_MS = 15_000

const healthy = new Map(UPSTREAMS.map((u) => [u.href, true]))

// Santé de chaque copie, toutes les 2 secondes, sur une page légère
async function check(u) {
  try {
    const res = await fetch(new URL('/robots.txt', u), { signal: AbortSignal.timeout(2000) })
    healthy.set(u.href, res.ok)
  } catch {
    healthy.set(u.href, false)
  }
}
setInterval(() => UPSTREAMS.forEach(check), 2000).unref()
UPSTREAMS.forEach(check)

// Toujours la première copie en bonne santé : une seule sert à la fois (compteurs en mémoire, cache des pages)
const order = () => [...UPSTREAMS.filter((u) => healthy.get(u.href)), ...UPSTREAMS.filter((u) => !healthy.get(u.href))]

// Pendant une mise à jour, les deux copies n'ont pas les mêmes fichiers de construction (/_next/…) : un 404 sur l'un
// d'eux est redemandé à l'autre copie avant d'être rendu
const isBuildFile = (url) => url.startsWith('/_next/')

function forward(req, res, body, upstream, last) {
  return new Promise((resolve) => {
    const out = http.request(
      { hostname: upstream.hostname, port: upstream.port, method: req.method, path: req.url, headers: req.headers },
      (r) => {
        if (r.statusCode === 404 && !last && isBuildFile(req.url ?? '')) {
          r.resume()
          return resolve('autre')
        }
        res.writeHead(r.statusCode ?? 502, r.headers)
        r.pipe(res)
        r.on('end', () => resolve(true))
        r.on('error', () => resolve(true))
      },
    )
    // Erreur avant toute réponse (copie arrêtée, nom introuvable pendant le remplacement) : on essaiera la suivante
    out.on('error', () => resolve(res.headersSent))
    out.end(body)
  })
}

const server = http.createServer(async (req, res) => {
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > MAX_BODY) {
      res.writeHead(413).end()
      return
    }
    chunks.push(c)
  }
  const body = Buffer.concat(chunks)
  const until = Date.now() + RETRY_FOR_MS
  while (Date.now() < until) {
    const list = order()
    for (const [i, u] of list.entries()) {
      const done = await forward(req, res, body, u, i === list.length - 1)
      if (done === 'autre') continue
      if (done) return
      healthy.set(u.href, false)
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  if (!res.headersSent) res.writeHead(503, { 'Retry-After': '5', 'Content-Type': 'text/plain; charset=utf-8' }).end('Le site redémarre, réessaie dans quelques secondes.')
})
server.keepAliveTimeout = 65_000
server.listen(PORT, () => console.log(`relais : ${UPSTREAMS.map((u) => u.host).join(', ')} → :${PORT}`))
