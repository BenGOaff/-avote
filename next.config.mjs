// Configuration en JavaScript (pas TypeScript) : l'hébergeur ne peut pas compiler un next.config.ts
// avec le compilateur de secours (SWC WebAssembly) imposé par son système.
const isDev = process.env.NODE_ENV !== 'production'

// Aucune origine tierce : polices, scripts, images et données sont servis par le site.
// 'unsafe-inline' sur les scripts : nécessaire au rendu statique de Next sans nonce
// (voir docs/SECURITE.md). Tout le reste est verrouillé.
// Seule exception : l'iframe du quiz Tiquiz, si son URL est configurée (page /quiz).
const tiquizOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_TIQUIZ_URL || 'https://quiz.xn--avote-xra.fr/pourquivoter').origin
  } catch {
    return null
  }
})()

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  tiquizOrigin ? `frame-src ${tiquizOrigin}` : "frame-src 'none'",
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
