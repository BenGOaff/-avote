import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { getAnnouncedActors } from '@/lib/actors'
import { liveCorpus, questionnaire } from '@/lib/data'
import { nuanceOf } from '@/lib/nuances'
import type { Position } from '@/lib/engine/types'
import { Comparateur, type CompareData } from './Comparateur'

export const metadata: Metadata = {
  title: 'Comparateur des programmes 2027 : qui défend quoi, sujet par sujet',
  description: `Les positions des candidats à la présidentielle 2027 sur ${questionnaire.items.length} sujets, côte à côte, avec la citation exacte et sa source. Compare jusqu’à 4 candidats.`,
  alternates: { canonical: '/comparateur' },
}

export default function ComparateurPage() {
  const actors = getAnnouncedActors()
  const sources = new Map((liveCorpus.sources ?? []).map((s) => [s.id, s]))
  const positions = liveCorpus.positions as Record<string, Record<string, Position>>
  const data: CompareData = {
    themes: questionnaire.themes.map((t) => ({ id: t.id, label: t.label })),
    items: questionnaire.items.filter((i) => !i.inactive).map((i) => ({ id: i.id, theme: i.theme, text: i.text })),
    actors: actors.map((a) => ({ slug: a.slug, name: a.name, bloc: nuanceOf(a.slug)?.bloc ?? 'DIV' })),
    pos: Object.fromEntries(
      actors.map((a) => [
        a.slug,
        Object.fromEntries(
          Object.entries(positions[a.slug] ?? {})
            .filter(([, p]) => !('missing' in p))
            .map(([id, p]) => {
              const src = 'sources' in p ? sources.get(p.sources[0] ?? '') : undefined
              const v = 'set' in p ? [...p.set].sort((x, y) => x - y) : 'value' in p ? [p.value] : []
              return [id, { v, b: p.basis ?? '', q: src?.passage ?? '', u: src?.url ?? '', p: src?.publisher ?? '' }]
            }),
        ),
      ]),
    ),
  }
  return (
    <div className="container">
      <PageHeader
        kicker="La campagne"
        title="Qui défend quoi"
        lede="Les positions des candidats sur tous les sujets du test, avec la phrase exacte et sa source. Choisis jusqu’à 4 candidats pour les mettre côte à côte."
      />
      <Comparateur data={data} />
      <p className="small muted section">
        Une case vide veut dire qu’on n’a pas trouvé de position explicite, pas que le candidat n’en a pas. <Link href="/methodologie">Comment les positions sont codées</Link>{' '}
        · <Link href="/contact?sujet=correction">Signaler une erreur</Link>
      </p>
    </div>
  )
}
