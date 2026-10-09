/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { getAnnouncedActors } from '@/lib/actors'
import { BLOCS } from '@/lib/nuances'
import { BLOC_ORDER, blocOfParty, candidatesOf, getPartis, isClassified, type Party } from '@/lib/partis'
import { squareLogoOf } from '@/lib/images'

export const metadata: Metadata = {
  title: 'Les partis politiques : histoire, dirigeants, élus et idées',
  description: 'Les partis et mouvements de la présidentielle 2027 : date de création, dirigeants, nombre d’élus, valeurs, grandes dates et mesures phares, avec les sources.',
  alternates: { canonical: '/partis' },
}

export default function PartisPage() {
  const partis = getPartis()
  const actors = getAnnouncedActors()
  const groups = [
    ...BLOC_ORDER.map((bloc) => ({ id: bloc as string, bloc, label: BLOCS.find((b) => b.id === bloc)?.label ?? bloc, list: partis.filter((p) => isClassified(p) && blocOfParty(p) === bloc) })),
    { id: 'NC', bloc: 'DIV', label: 'Non classés', list: partis.filter((p: Party) => !isClassified(p)) },
  ].filter((g) => g.list.length > 0)
  return (
    <div className="container">
      <PageHeader
        kicker="La campagne"
        title="Les partis"
        lede={`${partis.length} partis et mouvements, de l’extrême gauche à l’extrême droite. Pour chacun : d’où il vient, qui le dirige, combien d’élus il compte et ce qu’il propose.`}
      />
      <nav className="spectrum" aria-label="Familles politiques">
        {groups.map((g) => (
          <a key={g.id} href={`#bloc-${g.id}`} className={`spectrum__chip bloc-${g.bloc}`}>
            <span className="nuance__dot" aria-hidden="true" />
            {g.label} <span className="muted">{g.list.length}</span>
          </a>
        ))}
      </nav>
      {groups.map(({ id, bloc, label, list }) => (
        <section key={id} className="section" aria-labelledby={`bloc-${id}`}>
          <h2 id={`bloc-${id}`} className={`partis__bloc bloc-${bloc}`} style={{ fontSize: 'var(--h3)' }}>
            <span className="nuance__dot" aria-hidden="true" /> {label}
          </h2>
          <ul className="partis__grid">
            {list.map((p) => {
              const cands = candidatesOf(p, actors)
              const year = p.founded?.date?.slice(0, 4)
              const meta = [year ? `Fondé en ${year}` : '', p.leaders[0]?.name ?? ''].filter(Boolean).join(' · ')
              return (
                <li key={p.slug}>
                  <Link href={`/partis/${p.slug}`} className={`parti-card bloc-${bloc}`}>
                    <span className="parti-card__head">
                      {squareLogoOf(p.slug) ? (
                        <img className="parti-card__logo" src={squareLogoOf(p.slug)!} alt="" width={48} height={48} loading="lazy" />
                      ) : (
                        <span className="nuance__dot" aria-hidden="true" />
                      )}
                      <span className="parti-card__name">{p.name}</span>
                      {p.sigle && <span className="parti-card__sigle">{p.sigle}</span>}
                    </span>
                    {meta && <span className="small muted">{meta}</span>}
                    {p.founded?.text && <span className="parti-card__text">{p.founded.text}</span>}
                    <span className="parti-card__foot">
                      {cands.length > 0 ? <span className="small">Candidat : {cands.map((c) => c.name).join(', ')}</span> : <span />}
                      <span className="parti-card__more" aria-hidden="true">
                        La fiche →
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <p className="small muted section">
        Familles et couleurs : grille officielle du ministère de l’Intérieur. Un parti qu’elle ne nomme pas reste non classé. <Link href="/methodologie#couleurs">D’où viennent les couleurs</Link>
      </p>
    </div>
  )
}
