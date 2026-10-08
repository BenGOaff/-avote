/** URL canonique. new URL() convertit la cédille en punycode (xn--avote-xra.fr). */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://çavote.fr')
export const absolute = (p: string) => new URL(p, SITE_URL).toString()
