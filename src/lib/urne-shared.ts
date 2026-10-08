/**
 * L'urne de Ça vote ? : consultation en ligne, non représentative (ce n'est pas un sondage au sens de la loi
 * du 19 juillet 1977). Paramètres partagés entre le navigateur et le serveur.
 */

/** Scrutin concerné : sert de sel à l'empreinte anti-doublon (un bulletin par connexion et par scrutin). */
export const URNE_ELECTION = 'presidentielle-2027'

/** Choix toujours proposé en plus des candidats. */
export const BLANK = 'blanc'

/**
 * Périodes où les résultats ne sont pas affichés : veille et jour de chaque tour (loi du 19 juillet 1977, art. 11),
 * élargies d'un jour pour les territoires d'outre-mer qui votent le samedi. Dates annoncées en Conseil des ministres
 * le 1er juillet 2026 (18 avril et 2 mai 2027) ; à confirmer à la publication du décret de convocation.
 */
export const URNE_FREEZE: { from: string; to: string }[] = [
  { from: '2027-04-16T00:00:00+02:00', to: '2027-04-18T20:00:00+02:00' },
  { from: '2027-04-30T00:00:00+02:00', to: '2027-05-02T20:00:00+02:00' },
]

export const isFrozen = (now = new Date()) => URNE_FREEZE.some((p) => now >= new Date(p.from) && now <= new Date(p.to))

/** Difficulté de la preuve de travail : nombre de bits nuls en tête de l'empreinte (environ une seconde sur un téléphone). */
export const POW_BITS = 16

/** Nombre de bits nuls en tête d'une empreinte SHA-256. */
export function leadingZeroBits(bytes: Uint8Array): number {
  let n = 0
  for (const b of bytes) {
    if (b === 0) {
      n += 8
      continue
    }
    return n + Math.clz32(b) - 24
  }
  return n
}
