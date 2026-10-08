import Link from 'next/link'
import { blocOfSigle, getParcours, periodLabel } from '@/lib/parcours'
import { partyOfPeriod } from '@/lib/partis'

/**
 * Frise des partis traversés : une pastille par période, le détail au survol ou au toucher (focus clavier compris).
 */
export function PartyTrail({ slug }: { slug: string }) {
  const periods = getParcours(slug)
  if (periods.length === 0) return null
  const now = periods.find((p) => p.to === '')
  const fiche = now ? partyOfPeriod(now) : undefined
  return (
    <div className="trail">
      <ol className="trail__list" aria-label="Partis traversés">
        {periods.map((p, i) => (
          <li key={`${p.sigle}-${p.from}-${i}`} className={`trail__item bloc-${blocOfSigle(p.sigle)}`}>
            <button type="button" className="trail__chip" aria-describedby={`trail-${slug}-${i}`}>
              {p.sigle || p.party.split(/\s+/).map((w) => w[0]).join('').slice(0, 4).toUpperCase()}
            </button>
            <span role="tooltip" id={`trail-${slug}-${i}`} className="trail__tip">
              <strong>{p.party}</strong>
              <br />
              {periodLabel(p)}
              {p.role && p.role !== 'membre' ? ` · ${p.role}` : ''}
            </span>
          </li>
        ))}
      </ol>
      {fiche && (
        <p className="small trail__current">
          <Link href={`/partis/${fiche.slug}`}>La fiche {fiche.sigle || fiche.name}</Link> : histoire, dirigeants, élus et idées.
        </p>
      )}
      <details className="sources">
        <summary>Sources du parcours</summary>
        <ul className="small" style={{ paddingLeft: '1.2em', margin: 0 }}>
          {periods.map((p, i) => (
            <li key={i}>
              {p.sigle || p.party} ({periodLabel(p)}) :{' '}
              <a href={p.url} rel="noopener noreferrer nofollow" target="_blank">
                {p.publisher}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
