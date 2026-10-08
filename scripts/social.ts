/**
 * Repost automatique des nouveaux contenus sur X, Facebook (Page) et LinkedIn.
 *
 * Usage : npx tsx scripts/social.ts content/radar/xxx.md content/fil/yyy.md …
 * Chaque réseau est ignoré si ses identifiants ne sont pas configurés.
 * Attend que la page soit en ligne avant de publier (le lien doit fonctionner).
 *
 * Variables (secrets GitHub) :
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET          (OAuth 1.0a, droits lecture-écriture)
 *   FB_PAGE_ID, FB_PAGE_TOKEN                                          (jeton de Page longue durée)
 *   LINKEDIN_TOKEN, LINKEDIN_AUTHOR_URN                                (urn:li:person:… ou urn:li:organization:…)
 *   SOCIAL_MAX (défaut 3), SITE_URL (défaut https://xn--avote-xra.fr)
 */
import { createHmac, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const SITE = (process.env.SITE_URL || 'https://xn--avote-xra.fr').replace(/\/$/, '')
const MAX = Number(process.env.SOCIAL_MAX || 3)

interface Post {
  kind: 'article' | 'breve'
  title: string
  summary: string
  url: string
  check: { page: string; contains: string }
}

function load(file: string): Post | null {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const fm = parse(m[1] ?? '') as Record<string, unknown>
  if (fm.status !== 'published') return null
  const slug = path.basename(file, '.md')
  const isArticle = file.includes('content/radar/')
  const title = String(fm.title ?? '')
  if (isArticle) {
    const satire = fm.type === 'satire'
    return {
      kind: 'article',
      title: satire ? `[Satire] ${title}` : title,
      summary: String(fm.dek ?? ''),
      url: `${SITE}/radar/${slug}`,
      check: { page: `${SITE}/radar/${slug}`, contains: slug.slice(0, 20) },
    }
  }
  return {
    kind: 'breve',
    title,
    summary: String(fm.remark ?? ''),
    url: `${SITE}/radar#${slug}`,
    check: { page: `${SITE}/radar`, contains: slug },
  }
}

async function waitOnline(p: Post): Promise<boolean> {
  const deadline = Date.now() + 15 * 60_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(p.check.page, { signal: AbortSignal.timeout(20_000) })
      if (res.ok && (await res.text()).includes(p.check.contains)) return true
    } catch {
      /* déploiement en cours */
    }
    await new Promise((r) => setTimeout(r, 30_000))
  }
  return false
}

// ---------------------------------------------------------------------------
// X (OAuth 1.0a, POST /2/tweets)
// ---------------------------------------------------------------------------

const pct = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)

function oauthHeader(method: string, url: string): string {
  const oauth: Record<string, string> = {
    oauth_consumer_key: process.env.X_API_KEY!,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: process.env.X_ACCESS_TOKEN!,
    oauth_version: '1.0',
  }
  // Corps JSON : il n'entre pas dans la signature
  const params = Object.keys(oauth)
    .sort()
    .map((k) => `${pct(k)}=${pct(oauth[k]!)}`)
    .join('&')
  const base = [method.toUpperCase(), pct(url), pct(params)].join('&')
  const key = `${pct(process.env.X_API_SECRET!)}&${pct(process.env.X_ACCESS_SECRET!)}`
  oauth.oauth_signature = createHmac('sha1', key).update(base).digest('base64')
  return 'OAuth ' + Object.keys(oauth).sort().map((k) => `${pct(k)}="${pct(oauth[k]!)}"`).join(', ')
}

function xText(p: Post): string {
  // Un lien compte pour 23 caractères sur X
  const room = 280 - 24
  let t = p.title
  if (p.summary && t.length + 2 + p.summary.length <= room) t = `${t}\n\n${p.summary}`
  if (t.length > room) t = t.slice(0, room - 1) + '…'
  return `${t}\n${p.url}`
}

async function postX(p: Post) {
  const url = 'https://api.x.com/2/tweets'
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: oauthHeader('POST', url), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: xText(p) }),
  })
  if (!res.ok) throw new Error(`X ${res.status} ${(await res.text()).slice(0, 200)}`)
}

// ---------------------------------------------------------------------------
// Facebook (Page)
// ---------------------------------------------------------------------------

async function postFacebook(p: Post) {
  const version = process.env.FB_GRAPH_VERSION || 'v23.0'
  const body = new URLSearchParams({
    message: p.summary ? `${p.title}\n\n${p.summary}` : p.title,
    link: p.url,
    access_token: process.env.FB_PAGE_TOKEN!,
  })
  const res = await fetch(`https://graph.facebook.com/${version}/${process.env.FB_PAGE_ID}/feed`, { method: 'POST', body })
  if (!res.ok) throw new Error(`Facebook ${res.status} ${(await res.text()).slice(0, 200)}`)
}

// ---------------------------------------------------------------------------
// LinkedIn (API Posts)
// ---------------------------------------------------------------------------

function linkedinVersion(): string {
  if (process.env.LINKEDIN_VERSION) return process.env.LINKEDIN_VERSION
  // Version mensuelle (AAAAMM) : on vise deux mois en arrière, toujours prise en charge
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - 2)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

async function postLinkedIn(p: Post) {
  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LINKEDIN_TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': linkedinVersion(),
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: process.env.LINKEDIN_AUTHOR_URN,
      commentary: p.summary ? `${p.title}\n\n${p.summary}` : p.title,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { article: { source: p.url, title: p.title.slice(0, 200), description: p.summary.slice(0, 250) } },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn ${res.status} ${(await res.text()).slice(0, 200)}`)
}

// ---------------------------------------------------------------------------

async function main() {
  const files = process.argv.slice(2).filter((f) => f.endsWith('.md'))
  const posts = files
    .map(load)
    .filter((p): p is Post => !!p)
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'article' ? -1 : 1))
    .slice(0, MAX)
  if (posts.length === 0) return console.log('Rien à publier.')

  const networks = [
    { name: 'X', enabled: !!(process.env.X_API_KEY && process.env.X_API_SECRET && process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_SECRET), post: postX },
    { name: 'Facebook', enabled: !!(process.env.FB_PAGE_ID && process.env.FB_PAGE_TOKEN), post: postFacebook },
    { name: 'LinkedIn', enabled: !!(process.env.LINKEDIN_TOKEN && process.env.LINKEDIN_AUTHOR_URN), post: postLinkedIn },
  ].filter((n) => n.enabled)
  if (networks.length === 0) return console.log('Aucun réseau configuré.')

  for (const p of posts) {
    if (!(await waitOnline(p))) {
      console.warn(`Page pas en ligne après 15 min, publication annulée : ${p.url}`)
      continue
    }
    for (const n of networks) {
      try {
        await n.post(p)
        console.log(`${n.name} ✓ ${p.title}`)
      } catch (e) {
        console.warn(`${n.name} ✗ ${e instanceof Error ? e.message : e}`)
      }
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
