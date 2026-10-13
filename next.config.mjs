const isDev = process.env.NODE_ENV !== 'production'

// Aucune origine tierce : polices, scripts, images et données sont servis par le site.
// Exception : Google Analytics, chargé seulement après consentement (src/lib/consent.ts), si NEXT_PUBLIC_GA_ID n'est pas vide.
// 'unsafe-inline' sur les scripts : nécessaire au rendu statique de Next sans nonce
// (voir docs/SECURITE.md). Tout le reste est verrouillé.

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
  "frame-src 'none'",
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

// Surfaces où l'on répond ou compose (test, studio) : jamais de référent transmis, jamais en cache partagé.
// Elles restent indexables : la page elle-même est publique, les réponses ne quittent pas le navigateur.
const privateHeaders = [
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Cache-Control', value: 'private, no-store' },
]
// Surfaces personnelles (résultats, profil) : en plus, jamais indexées.
const personalHeaders = [...privateHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  // Ancien quiz Tiquiz, remplacé par la version courte du test
  async redirects() {
    return [
      // Une seule adresse : www renvoie vers le domaine sans www
      { source: '/:path*', has: [{ type: 'host', value: 'www.xn--avote-xra.fr' }], destination: 'https://xn--avote-xra.fr/:path*', permanent: true },
      // cavote.fr (sans cédille) : l'adresse qu'on tape au clavier, renvoyée vers le site
      { source: '/:path*', has: [{ type: 'host', value: '(www\\.)?cavote\\.fr' }], destination: 'https://xn--avote-xra.fr/:path*', permanent: true },
      { source: '/quiz/quel-indecis-es-tu', destination: '/test?rapide=1', permanent: true },
      { source: '/quiz/flash/tiendrais-tu-jusquau-second-tour', destination: '/quiz/flash/quel-parti-politique-es-tu', permanent: true },
    ]
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...['/test', '/studio', '/duel'].map((source) => ({ source, headers: privateHeaders })),
      ...['/resultats', '/mon-profil'].map((source) => ({ source, headers: personalHeaders })),
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }, { key: 'Service-Worker-Allowed', value: '/' }] },
    ]
  },
}

export default nextConfig
