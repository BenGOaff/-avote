import Link from 'next/link'
import { nuanceOf, type BlocId } from '@/lib/nuances'

/** Pastille de famille politique : couleur conventionnelle + nom du bloc, toujours écrit. */
export function NuanceTag({ slug, detail = false }: { slug: string; detail?: boolean }) {
  const n = nuanceOf(slug)
  if (!n) return null
  const title = `Nuance ${n.code} (${n.label}), bloc ${n.blocLabel}, selon la grille du ministère de l’Intérieur${n.basis === 'deduite' ? ' ; nuance déduite, le parti n’y est pas nommé' : ''}`
  return (
    <span className={`nuance bloc-${n.bloc}`} title={title}>
      <span className="nuance__dot" aria-hidden="true" />
      {n.blocLabel}
      {detail && (
        <span className="nuance__code">
          {n.code}
          {n.basis === 'deduite' && ' · déduite'}
        </span>
      )}
      <span className="visually-hidden"> ({title})</span>
    </span>
  )
}

export function BlocDot({ bloc }: { bloc: BlocId }) {
  return <span className={`nuance__dot bloc-${bloc}`} aria-hidden="true" />
}

export function NuanceSourceLink() {
  return <Link href="/methodologie#couleurs">D’où viennent les couleurs</Link>
}
