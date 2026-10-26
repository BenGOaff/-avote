/** URL canonique. new URL() convertit la cédille en punycode (xn--avote-xra.fr). */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://çavote.fr')

export const absolute = (p: string) => new URL(p, SITE_URL).toString()

/** Jeu de données publié sur data.gouv.fr : il pointe vers /donnees.json et /positions.csv, relus à chaque mise à jour */
export const OPEN_DATA = {
  url: 'https://www.data.gouv.fr/datasets/positions-des-candidats-a-la-presidentielle-2027-avec-citations-et-sources',
  licence: 'ODbL',
  licenceUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
}
/** Mesure d'audience Google Analytics : chargée uniquement après consentement (voir lib/consent.ts). Vide = désactivée. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-8BPS8RSJ3B'
