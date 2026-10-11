/** URL canonique. new URL() convertit la cédille en punycode (xn--avote-xra.fr). */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://çavote.fr')

export const absolute = (p: string) => new URL(p, SITE_URL).toString()
/** Mesure d'audience Google Analytics : chargée uniquement après consentement (voir lib/consent.ts). Vide = désactivée. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-8BPS8RSJ3B'
