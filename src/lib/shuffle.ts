/**
 * Ordre d'affichage tiré au hasard (Fisher-Yates), pour ne favoriser aucun candidat ni aucun parti :
 * l'ordre alphabétique met toujours les mêmes en tête. Le tirage se fait dans le navigateur, à chaque affichage.
 */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}
