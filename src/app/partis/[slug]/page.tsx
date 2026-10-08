import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAnnouncedActors } from '@/lib/actors'
import { BLOCS } from '@/lib/nuances'
import { THEME_LABEL, blocOfParty, candidatesOf, getParti, getPartis, isClassified } from '@/lib/partis'

export const dynamicParams = false
export function generateStaticParams() {
  return getPartis().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getParti(slug)
  if (!p) return {}
  return {
    title: `${p.name}${p.sigle ? ` (${p.sigle})` : ''} : histoire, dirigeants, élus et idées`,
    description: `${p.name} : création, dirigeants, nombre d’élus, valeurs, grandes dates et mesures phares, avec les sources.`,
    alternates: { canonical: `/partis/${p.slug}` },
  }
}


const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const monthYear = (d: string) => (d.length >= 7 ? `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : d)
/** 1972, mai 2007 ou 5 octobre 1972, selon la précision de la source. */
const dateFr = (d: string) => (d.length >= 10 ? `${Number(d.slice(8, 10)) === 1 ? '1er' : Number(d.slice(8, 10))} ${monthYear(d)}` : monthYear(d))

export default async function PartiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getParti(slug)
  if (!p) notFound()
  const bloc = blocOfParty(p)
  const cands = candidatesOf(p, getAnnouncedActors())
  // Seuls les chiffres sourcés s'affichent : une donnée absente reste absente
  const plural = (x: number, w: string) => `${w}${x > 1 ? 's' : ''}`
  const figures = [
    p.founded?.date ? { num: p.founded.date.slice(0, 4), label: 'année de création' } : null,
    p.elus.deputes !== null ? { num: String(p.elus.deputes), label: plural(p.elus.deputes, 'député') } : null,
    p.elus.senateurs !== null ? { num: String(p.elus.senateurs), label: plural(p.elus.senateurs, 'sénateur') } : null,
    p.elus.eurodeputes !== null ? { num: String(p.elus.eurodeputes), label: plural(p.elus.eurodeputes, 'eurodéputé') } : null,
  ].filter((x): x is { num: string; label: string } => x !== null)
  const sources = [p.founded, p.leadersSource, p.elus.url ? (p.elus as Required<typeof p.elus>) : null, ...(p.elus.sources ?? []), p.values, ...p.dates, ...p.measures].filter(Boolean) as { quote: string; url: string; publisher: string }[]
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">
        <Link href="/partis">Partis</Link> · {isClassified(p) ? BLOCS.find((b) => b.id === bloc)?.label : 'Non classé'}
      </p>
      <h1 className={`parti__title bloc-${bloc}`}>
        {p.sigle && <span className="parti-card__sigle">{p.sigle}</span>} {p.name}
      </h1>
      {p.values && <p className="lede measure">{p.values.text}</p>}

      <div className="figures figures--compact" role="list">
        {figures.map((f) => (
          <p key={f.label} className="figure" role="listitem">
            <span className="figure__num">{f.num}</span>
            <span className="figure__label">{f.label}</span>
          </p>
        ))}
      </div>
      {figures.length > 1 && p.elus.asOf && <p className="small muted" style={{ marginTop: 'calc(-1 * var(--s3))' }}>Nombre d’élus en {monthYear(p.elus.asOf)}{p.elus.note ? ', détail dans les sources' : ''}.</p>}

      <div className="grid grid--2">
        <section aria-labelledby="qui">
          <h2 id="qui" style={{ fontSize: 'var(--h3)' }}>
            Qui le dirige
          </h2>
          <ul>
            {p.leaders.map((l) => (
              <li key={l.name + l.role}>
                <strong>{l.name}</strong>, {l.role}
                {l.since ? ` depuis ${l.since}` : ''}
              </li>
            ))}
          </ul>
          {cands.length > 0 && (
            <p>
              Candidat{cands.length > 1 ? 's' : ''} à la présidentielle :{' '}
              {cands.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ', '}
                  <Link href={`/candidats/${c.slug}`}>{c.name}</Link>
                </span>
              ))}
            </p>
          )}
          {p.founded && <p className="small">{p.founded.text}</p>}
        </section>

        {p.measures.length > 0 && (
          <section aria-labelledby="mesures">
            <h2 id="mesures" style={{ fontSize: 'var(--h3)' }}>
              Ce qu’il propose
            </h2>
            <ul className="stack" style={{ listStyle: 'none', padding: 0 }}>
              {p.measures.map((m) => (
                <li key={m.text}>
                  <span className="badge badge--muted">{THEME_LABEL[m.theme] ?? m.theme}</span> {m.text}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {p.dates.length > 0 && (
        <section className="section" aria-labelledby="dates">
          <h2 id="dates" style={{ fontSize: 'var(--h3)' }}>
            Les grandes dates
          </h2>
          <ol className={`timeline bloc-${bloc}`}>
            {p.dates.map((d) => (
              <li key={d.date + d.text}>
                <time className="timeline__date" dateTime={d.date}>{dateFr(d.date)}</time>
                <span>{d.text}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <details className="sources section">
        <summary>Sources</summary>
        {p.elus.note && <p className="small">{p.elus.note}</p>}
        <ul className="small" style={{ paddingLeft: '1.2em' }}>
          {sources.map((s, i) => (
            <li key={i}>
              « {s.quote} »{' '}
              <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
                {s.publisher}
              </a>
            </li>
          ))}
        </ul>
      </details>
      <p className="section">
        <Link href="/partis">Tous les partis</Link> · <Link href="/test">Faire le test</Link>
      </p>
    </div>
  )
}
