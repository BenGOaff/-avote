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

/** Générateur pseudo-aléatoire à graine (mulberry32) : deux listes de même taille tirées avec la même graine gardent le même ordre */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
