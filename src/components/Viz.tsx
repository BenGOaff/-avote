/**
 * Visuels du test et des résultats. Chaque visuel est doublé d'un texte (aria-label ou légende) :
 * aucune information ne passe par la couleur seule, et tout reste lisible en monochrome.
 */
import type { ItemContribution } from '@/lib/engine/scoring'
import type { Ordinal, Position } from '@/lib/engine/types'
import { UI_COPY } from '@/lib/copy'

// ---------------------------------------------------------------------------
// Jetons
// ---------------------------------------------------------------------------

/** Jeton vu de dessus (réserve, boutons). */
export function Coin({ size = 44, className = '', ...p }: { size?: number } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`coin ${className}`} style={{ width: size, height: size, fontSize: size * 0.3 }} aria-hidden="true" {...p}>
      ÇV
    </span>
  )
}

/** Pile de jetons vus de profil (comme des jetons de poker posés sur la table). */
export function CoinStack({ count, max = 10 }: { count: number; max?: number }) {
  return (
    <span className="coin-stack" style={{ height: 12 + max * 5 }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="coin-side" style={{ bottom: i * 5 }} />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Jauge de proximité
// ---------------------------------------------------------------------------

/** Anneau : arc noir = proximité observée ; arc jaune extérieur = fourchette selon les positions inconnues. */
export function Gauge({ value, low, high, size = 120, label }: { value: number | null; low: number; high: number; size?: number; label: string }) {
  const r = 40
  const R = 52
  const c = 2 * Math.PI * r
  const C = 2 * Math.PI * R
  const arc = (from: number, to: number, circ: number) => ({
    strokeDasharray: `${(Math.max(0, to - from) / 100) * circ} ${circ}`,
    strokeDashoffset: -(from / 100) * circ,
  })
  return (
    <svg
      className="gauge"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${label} : ${value === null ? 'non calculable' : `${Math.round(value)} sur 100`}, fourchette ${Math.round(low)} à ${Math.round(high)}`}
    >
      <g transform="rotate(-90 60 60)">
        <circle cx="60" cy="60" r={r} className="gauge__track" />
        {value !== null && <circle cx="60" cy="60" r={r} className="gauge__value" style={arc(0, value, c)} />}
        <circle cx="60" cy="60" r={R} className="gauge__band-edge" style={arc(low, high, C)} />
        <circle cx="60" cy="60" r={R} className="gauge__band" style={arc(low, high, C)} />
      </g>
      <text x="60" y="64" textAnchor="middle" className="gauge__num">
        {value === null ? '?' : Math.round(value)}
      </text>
      <text x="60" y="82" textAnchor="middle" className="gauge__unit">
        sur 100
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Curseur de profil
// ---------------------------------------------------------------------------

/** Lecture en mots d'un indice 0–100 (même découpage partout, documenté dans la méthode). */
export function leanOf(index: number, low: string, high: string): { strength: string; side: string } {
  const L = UI_COPY.results.lean
  if (index < 20) return { strength: L.strong, side: low }
  if (index < 40) return { strength: L.mild, side: low }
  if (index <= 60) return { strength: '', side: L.middle }
  if (index <= 80) return { strength: L.mild, side: high }
  return { strength: L.strong, side: high }
}

export function DimensionMeter({ index, low, high, label }: { index: number; low: string; high: string; label: string }) {
  return (
    <div className="meter" role="img" aria-label={`${label} : ${Math.round(index)} sur 100, entre « ${low} » (0) et « ${high} » (100)`}>
      <div className="meter__track">
        {[20, 40, 60, 80].map((t) => (
          <span key={t} className="meter__tick" style={{ left: `${t}%` }} />
        ))}
        <span className="meter__marker" style={{ left: `${index}%` }}>
          <Coin size={28} />
        </span>
      </div>
      <div className="meter__ends small muted">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toi et le candidat sur l'échelle d'une question
// ---------------------------------------------------------------------------

export function DuoScale({ user, position, name }: { user: Ordinal; position: Position | undefined; name: string }) {
  const cand: Ordinal[] = !position || 'missing' in position ? [] : 'set' in position ? (position.set as Ordinal[]) : [position.value]
  return (
    <span className="duo" aria-hidden="true">
      {([-2, -1, 0, 1, 2] as Ordinal[]).map((v) => (
        <span key={v} className={`duo__dot${v === user ? ' duo__dot--you' : ''}${cand.includes(v) ? ' duo__dot--them' : ''}`} title={v === user ? 'Toi' : cand.includes(v) ? name : undefined} />
      ))}
    </span>
  )
}

/** Position seule sur l'échelle en 5 crans (fiche candidat). */
export function PositionScale({ position }: { position: Position }) {
  const cand: Ordinal[] = 'missing' in position ? [] : 'set' in position ? (position.set as Ordinal[]) : [position.value]
  return (
    <span className="duo pos-scale" aria-hidden="true">
      <span className="pos-scale__end">contre</span>
      {([-2, -1, 0, 1, 2] as Ordinal[]).map((v) => (
        <span key={v} className={`duo__dot${cand.includes(v) ? ' duo__dot--them' : ''}`} />
      ))}
      <span className="pos-scale__end">pour</span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Bande d'accord : une case par question répondue
// ---------------------------------------------------------------------------

export type Agreement = 'proche' | 'moyen' | 'oppose' | 'ambigu' | 'inconnu'

/** Écart en crans entre ta réponse et la position (0–1 proche, 2 moyen, 3–4 opposé). */
export function agreementOf(c: ItemContribution): Agreement {
  if (c.kind === 'unknown') return 'inconnu'
  if (c.kind === 'ambiguous' || c.s === null) return 'ambigu'
  const gap = Math.round((1 - c.s) * 4)
  return gap <= 1 ? 'proche' : gap === 2 ? 'moyen' : 'oppose'
}

export function AgreementStrip({ contributions, themes, name }: { contributions: ItemContribution[]; themes: { id: string; label: string }[]; name: string }) {
  const counts = contributions.reduce<Record<Agreement, number>>((acc, c) => ((acc[agreementOf(c)] += 1), acc), { proche: 0, moyen: 0, oppose: 0, ambigu: 0, inconnu: 0 })
  const L = UI_COPY.results.agreement
  return (
    <div
      className="strip"
      role="img"
      aria-label={`${name} : ${counts.proche} ${L.proche}, ${counts.moyen} ${L.moyen}, ${counts.oppose} ${L.oppose}, ${counts.ambigu} ${L.ambigu}, ${counts.inconnu} ${L.inconnu}`}
    >
      {themes.map((t) => {
        const cells = contributions.filter((c) => c.theme === t.id)
        if (cells.length === 0) return null
        return (
          <span key={t.id} className="strip__group" title={t.label}>
            {cells.map((c) => (
              <span key={c.itemId} className={`strip__cell strip__cell--${agreementOf(c)}`} />
            ))}
          </span>
        )
      })}
    </div>
  )
}

export function AgreementLegend() {
  const L = UI_COPY.results.agreement
  return (
    <ul className="legend small">
      {(['proche', 'moyen', 'oppose', 'ambigu', 'inconnu'] as const).map((k) => (
        <li key={k}>
          <span className={`strip__cell strip__cell--${k}`} aria-hidden="true" /> {L[k]}
        </li>
      ))}
    </ul>
  )
}
