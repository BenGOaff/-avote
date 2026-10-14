/** Âge révolu à une date donnée (AAAA-MM-JJ), sinon null */
export function ageAt(born: string | null, on: Date = new Date()): number | null {
  if (!born || !/^\d{4}-\d{2}-\d{2}$/.test(born)) return null
  const [y, m, d] = born.split('-').map(Number) as [number, number, number]
  let age = on.getUTCFullYear() - y
  if (on.getUTCMonth() + 1 < m || (on.getUTCMonth() + 1 === m && on.getUTCDate() < d)) age--
  return age
}
