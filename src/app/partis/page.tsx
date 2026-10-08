import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { getAnnouncedActors } from '@/lib/actors'
import { BLOCS } from '@/lib/nuances'
import { BLOC_ORDER, blocOfParty, candidatesOf, getPartis } from '@/lib/partis'

export const metadata: Metadata = {
  title: 'Les partis politiques : histoire, dirigeants, élus et idées',
  description: 'Les partis et mouvements de la présidentielle 2027 : date de création, dirigeants, nombre d’élus, valeurs, grandes dates et mesures phares, avec les sources.',
  alternates: { canonical: '/partis' },
}

export default function PartisPage() {
  const partis = getPartis()
  const actors = getAnnouncedActors()
  return (
    <div className="container">
      <PageHeader kicker="La campagne" title="Les partis" lede="D’où ils viennent, qui les dirige, combien d’élus ils comptent et ce qu’ils proposent. Classés par famille politique, de gauche à droite." />
      {BLOC_ORDER.map((bloc) => {
        const list = partis.filter((p) => blocOfParty(p) === bloc)
        if (list.length === 0) return null
        return (
          <section key={bloc} className="section" aria-labelledby={`bloc-${bloc}`}>
            <h2 id={`bloc-${bloc}`} className={`partis__bloc bloc-${bloc}`} style={{ fontSize: 'var(--h3)' }}>
              <span className="nuance__dot" aria-hidden="true" /> {BLOCS.find((b) => b.id === bloc)?.label ?? 'Autres'}
            </h2>
            <ul className="partis__grid">
              {list.map((p) => {
                const cands = candidatesOf(p, actors)
                return (
                  <li key={p.slug}>
                    <Link href={`/partis/${p.slug}`} className={`card parti-card bloc-${bloc}`}>
                      <span className="parti-card__sigle">{p.sigle || p.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 4)}</span>
                      <span className="parti-card__name">{p.name}</span>
                      <span className="small muted">
                        {p.founded?.date ? `Depuis ${p.founded.date.slice(0, 4)}` : ''}
                        {p.leaders[0] ? `${p.founded?.date ? ' · ' : ''}${p.leaders[0].name}` : ''}
                      </span>
                      {cands.length > 0 && <span className="small">Candidat : {cands.map((c) => c.name).join(', ')}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      <p className="small muted section">Les couleurs sont celles des familles de la grille officielle du ministère de l’Intérieur. <Link href="/methodologie#couleurs">D’où viennent les couleurs</Link></p>
    </div>
  )
}
