/** URL canonique. new URL() convertit la cédille en punycode (xn--avote-xra.fr). */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://çavote.fr')
/** Quiz Tiquiz d'accueil (sous-domaine du site). Surcharge possible par NEXT_PUBLIC_TIQUIZ_URL. */
export const TIQUIZ_URL = process.env.NEXT_PUBLIC_TIQUIZ_URL || 'https://quiz.xn--avote-xra.fr/pourquivoter'

export const absolute = (p: string) => new URL(p, SITE_URL).toString()
