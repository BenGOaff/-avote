import { UI_COPY } from '@/lib/copy'

const t = UI_COPY.urne

/** Enveloppes déjà au fond de l'urne : décor, jamais plus que le nombre réel de bulletins. */
const PILE = [
  { x: 372, y: 214, r: 8 },
  { x: 424, y: 218, r: -5 },
  { x: 398, y: 224, r: 3 },
  { x: 436, y: 206, r: 12 },
]

/** Nom sur une ou deux lignes, taille ajustée à la largeur du bulletin. */
function ballotLines(name: string): { lines: string[]; size: number } {
  const i = name.indexOf(' ')
  const lines = name.length > 13 && i > 0 ? [name.slice(0, i), name.slice(i + 1)] : [name]
  const longest = Math.max(...lines.map((l) => l.length))
  return { lines, size: Math.min(17, 112 / (0.62 * longest)) }
}

const pad = (n: number) => String(n).padStart(4, '0')

/**
 * Le geste du vote, dessiné : bulletin plié, glissé sous enveloppe, enveloppe dans l'urne, compteur +1.
 * `count` : bulletins déjà comptés (null si inconnu ou masqué). `still` : scène finale sans animation.
 */
export function BoothScene({ name, count, still }: { name: string; count: number | null; still: boolean }) {
  const { lines, size } = ballotLines(name)
  const pile = PILE.slice(0, Math.min(PILE.length, count ?? 0))
  return (
    <div className={`booth__scene${still ? ' booth__scene--still' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 520 272" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <clipPath id="bs-counter-window">
            <rect x="454" y="84" width="42" height="20" />
          </clipPath>
        </defs>

        <line className="bs-floor" x1="12" y1="260" x2="508" y2="260" />

        {/* Fond de l'urne et enveloppes déjà déposées */}
        <rect className="bs-urn-back" x="356" y="120" width="144" height="130" />
        {pile.map((p, i) => (
          <g key={i} transform={`rotate(${p.r} ${p.x + 31} ${p.y + 17})`}>
            <rect className="bs-env-small" x={p.x} y={p.y} width="62" height="34" rx="1.5" />
            <path className="bs-thin" d={`M${p.x} ${p.y} L${p.x + 31} ${p.y + 18} L${p.x + 62} ${p.y}`} />
          </g>
        ))}

        {/* Le bulletin : moitié haute avec le nom, pliée sur la moitié basse */}
        {!still && (
          <g className="bs-ballot">
            <rect className="bs-paper" x="28" y="162" width="128" height="44" />
            <line className="bs-rule" x1="48" y1="186" x2="136" y2="186" />
            <g className="bs-fold">
              <rect className="bs-paper" x="28" y="118" width="128" height="44" />
              <text className="bs-name" x="92" y={lines.length > 1 ? 136 : 145} fontSize={size} textAnchor="middle">
                {lines.map((l, i) => (
                  <tspan key={l} x="92" dy={i === 0 ? 0 : size * 1.05}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
            <rect className="bs-paper bs-paper--back bs-back" x="28" y="162" width="128" height="44" />
          </g>
        )}
        {!still && (
          <text className="bs-note deco" x="92" y="244" textAnchor="middle">
            {t.noteBallot}
          </text>
        )}

        {/* L'enveloppe : rabat ouvert derrière le bulletin, corps devant, rabat fermé par-dessus */}
        <g className="bs-envelope">
          <polygon className="bs-env bs-flap-open" points="196,150 336,150 266,106" />
          <rect className="bs-env" x="196" y="150" width="140" height="80" rx="2" />
          <path className="bs-thin" d="M196 230 L256 186 M336 230 L276 186" />
          <polygon className="bs-env bs-flap-shut" points="196,150 336,150 266,194" />
        </g>

        {/* L'urne transparente : vitre, couvercle à fente, compteur */}
        <rect className="bs-glass" x="356" y="120" width="144" height="130" />
        <path className="bs-sheen" d="M370 136 L370 176 M380 132 L380 150" />
        <rect className="bs-plinth" x="348" y="250" width="160" height="10" rx="2" />
        <rect className="bs-lid" x="350" y="106" width="156" height="16" rx="2" />
        <rect className="bs-slot" x="372" y="112" width="72" height="4" rx="1" />
        <rect className="bs-counter" x="452" y="82" width="46" height="24" rx="3" />
        <g clipPath="url(#bs-counter-window)">
          {count === null ? (
            !still && (
              <text className="bs-digits bs-count-new" x="475" y="99" textAnchor="middle">
                +1
              </text>
            )
          ) : still ? (
            <text className="bs-digits" x="475" y="99" textAnchor="middle">
              {pad(count)}
            </text>
          ) : (
            <>
              <text className="bs-digits bs-count-old" x="475" y="99" textAnchor="middle">
                {pad(count)}
              </text>
              <text className="bs-digits bs-count-new" x="475" y="99" textAnchor="middle">
                {pad(count + 1)}
              </text>
            </>
          )}
        </g>
        {!still && (
          <text className="bs-plus deco" x="486" y="70" textAnchor="middle">
            +1
          </text>
        )}
      </svg>
    </div>
  )
}
