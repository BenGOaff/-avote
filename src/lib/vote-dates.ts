/**
 * Dates du scrutin et délais qui en découlent. Les dates des tours viennent de Service-Public.fr (annonce du
 * 1er juillet 2026) ; les délais sont calculés à partir des règles officielles, sans rien ajouter.
 */
export const FIRST_ROUND = '2027-04-18'
export const SECOND_ROUND = '2027-05-02'

const atNoon = (iso: string) => new Date(`${iso}T12:00:00Z`)
const toIso = (d: Date) => d.toISOString().slice(0, 10)

/** Le n-ième vendredi qui précède une date (le jour même exclu). 6e vendredi avant le 18 avril 2027 : le 12 mars 2027. */
export function nthFridayBefore(iso: string, n: number): string {
  const d = atNoon(iso)
  let count = 0
  while (count < n) {
    d.setUTCDate(d.getUTCDate() - 1)
    if (d.getUTCDay() === 5) count++
  }
  return toIso(d)
}

/** Le n-ième jour avant une date */
export function daysBefore(iso: string, n: number): string {
  const d = atNoon(iso)
  d.setUTCDate(d.getUTCDate() - n)
  return toIso(d)
}

/** Date limite d'inscription (cas général) : le 6e vendredi avant le premier tour, en ligne comme en mairie */
export const REGISTRATION_DEADLINE = nthFridayBefore(FIRST_ROUND, 6)
/** Situations particulières (18 ans sans recensement, déménagement, naturalisation, droit de vote recouvré) : 10e jour avant */
export const REGISTRATION_DEADLINE_SPECIAL = daysBefore(FIRST_ROUND, 10)
