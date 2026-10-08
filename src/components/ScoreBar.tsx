/**
 * Barre de proximité lisible en monochrome : valeur pleine, plage des bornes documentaires en clair,
 * hachures = zone hors bornes. La valeur chiffrée est toujours écrite à côté (jamais la barre seule).
 */
export function ScoreBar({ value, low, high, label }: { value: number | null; low: number; high: number; label: string }) {
  return (
    <div
      className="scorebar"
      role="img"
      aria-label={`${label} : ${value === null ? 'non calculable' : `${Math.round(value)} sur 100`}, bornes ${Math.round(low)} à ${Math.round(high)}`}
    >
      <div className="scorebar__range" style={{ left: `${low}%`, width: `${Math.max(0, high - low)}%` }} />
      {value !== null && <div className="scorebar__value" style={{ width: `${value}%` }} />}
    </div>
  )
}

export const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
export const fmtPct = (n: number) => `${fmt(n * 100)} %`
