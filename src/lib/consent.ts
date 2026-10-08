'use client'
/**
 * Consentement à la mesure d'audience (Google Analytics).
 * - Rien n'est chargé ni envoyé avant un « Accepter » explicite.
 * - Refuser est aussi simple qu'accepter ; le choix est gardé 6 mois sur l'appareil, puis redemandé.
 * - Même accepté, Google Analytics est coupé pendant le test, sur les résultats, le profil et le studio :
 *   il ne reçoit jamais de réponse, de score ni de priorité.
 */
import { GA_ID } from './site'

const KEY = 'ca-vote:consent'
const VALIDITY_MS = 182 * 24 * 3600 * 1000
/** Pages où la mesure est toujours coupée */
export const PRIVATE_PATHS = ['/test', '/resultats', '/mon-profil', '/studio', '/urne']
export const CONSENT_OPEN_EVENT = 'cavote:consent-open'

export type ConsentChoice = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __cavoteGa?: boolean
    __cavotePaused?: boolean
    [k: `ga-disable-${string}`]: boolean | undefined
  }
}

export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as { choice: ConsentChoice; at: number }
    if (Date.now() - v.at > VALIDITY_MS) return null
    return v.choice
  } catch {
    return null
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }))
  } catch {
    /* stockage indisponible : le bandeau reviendra */
  }
  if (choice === 'granted') loadAnalytics()
  else revokeAnalytics()
}

const isPrivate = (pathname: string) => PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

/** Coupe ou rétablit l'envoi selon la page et l'état du test. Appelé avant chaque changement d'adresse. */
function guard(pathname = location.pathname) {
  if (!GA_ID) return
  window[`ga-disable-${GA_ID}`] = readConsent() !== 'granted' || isPrivate(pathname) || !!window.__cavotePaused
}

/** Le test qui se déroule sur l'accueil coupe aussi la mesure, le temps des questions. */
export function setAudiencePaused(paused: boolean) {
  if (typeof window === 'undefined') return
  window.__cavotePaused = paused
  guard()
}

export function loadAnalytics() {
  if (!GA_ID || typeof window === 'undefined' || window.__cavoteGa) return
  window.__cavoteGa = true
  guard()
  // Le drapeau est posé avant que l'adresse change : aucun envoi ne part vers une page privée
  for (const m of ['pushState', 'replaceState'] as const) {
    const original = history[m].bind(history)
    history[m] = (data: unknown, unused: string, url?: string | URL | null) => {
      if (url) guard(new URL(String(url), location.href).pathname)
      return original(data, unused, url)
    }
  }
  window.addEventListener('popstate', () => guard())
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag attend l'objet arguments tel quel
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' })
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 395 * 24 * 3600 })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(s)
}

/** Retrait du consentement : plus aucun envoi, cookies Google Analytics effacés. */
export function revokeAnalytics() {
  if (!GA_ID || typeof window === 'undefined') return
  window[`ga-disable-${GA_ID}`] = true
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  const host = location.hostname
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0]?.trim()
    if (!name || !(name === '_ga' || name.startsWith('_ga_'))) continue
    for (const domain of ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`]) document.cookie = `${name}=; Max-Age=0; path=/${domain}`
  }
}

export function openConsent() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
}
