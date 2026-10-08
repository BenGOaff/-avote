import { readFileSync } from 'node:fs'
// Configuration en JavaScript (pas TypeScript) : l'hébergeur ne peut pas compiler un next.config.ts
// avec le compilateur de secours (SWC WebAssembly) imposé par son système.
const isDev = process.env.NODE_ENV !== 'production'

// Aucune origine tierce : polices, scripts, images et données sont servis par le site.
// Exception : Google Analytics, chargé seulement après consentement (src/lib/consent.ts), si NEXT_PUBLIC_GA_ID n'est pas vide.
// 'unsafe-inline' sur les scripts : nécessaire au rendu statique de Next sans nonce
// (voir docs/SECURITE.md). Tout le reste est verrouillé.
// Seule exception : l'iframe du quiz Tiquiz, si son URL est configurée (page /quiz).
// Origines des quiz Tiquiz listés dans content/quiz/tiquiz.json (plus l'adresse par défaut)
const tiquizOrigins = (() => {
  const urls = [process.env.NEXT_PUBLIC_TIQUIZ_URL || 'https://quiz.xn--avote-xra.fr/pourquivoter']
  try {
    urls.push(...JSON.parse(readFileSync(new URL('./content/quiz/tiquiz.json', import.meta.url), 'utf8')).quizzes.map((q) => q.url))
  } catch {
    /* liste absente : adresse par défaut seulement */
  }
  return [...new Set(urls.map((u) => { try { return new URL(u).origin } catch { return null } }).filter(Boolean))]
})()

const gaId = process.env.NEXT_PUBLIC_GA_ID ?? 'G-8BPS8RSJ3B'
const ga = gaId
  ? { script: ' https://www.googletagmanager.com', connect: ' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com', img: ' https://*.google-analytics.com https://*.googletagmanager.com https://www.google.com' }
  : { script: '', connect: '', img: '' }

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${ga.script}${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data:${ga.img}`,
  "font-src 'self'",
  `connect-src 'self'${ga.connect}`,
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  tiquizOrigins.length ? `frame-src ${tiquizOrigins.join(' ')}` : "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

// Surfaces personnelles : jamais de référent transmis, jamais indexées, jamais en cache partagé.
const personalHeaders = [
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  { key: 'Cache-Control', value: 'private, no-store' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...['/test', '/resultats', '/mon-profil', '/studio'].map((source) => ({ source, headers: personalHeaders })),
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }, { key: 'Service-Worker-Allowed', value: '/' }] },
    ]
  },
}

export default nextConfig
