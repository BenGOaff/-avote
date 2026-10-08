import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { MediaCard } from '@/components/MediaCard'
import { UI_COPY } from '@/lib/copy'
import { FREE_KINDS, FREE_KIND_LABEL, MEDIA_TYPE_LABEL, freeMedias, getMedias } from '@/lib/medias'

export const metadata: Metadata = {
  title: 'Les médias libres : ni milliardaire, ni grand groupe, ni État',
  description: 'Les médias français qui appartiennent à leurs journalistes, leurs salariés, leurs lecteurs ou à une structure sans but lucratif, avec la source de chaque fiche.',
  alternates: { canonical: '/medias/libres' },
}

const t = UI_COPY.medias.free

export default function FreeMediasPage() {
  const medias = getMedias()
  const free = freeMedias(medias)
  const total = medias.filter((m) => m.ownership).length
  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />

      {free.length === 0 ? (
        <p className="alert alert--info measure">{t.empty}</p>
      ) : (
        <>
          <div className="figures" role="list">
            <p className="figure" role="listitem">
              <span className="figure__num">{t.count(free.length, total).num}</span>
              <span className="figure__label">{t.count(free.length, total).label}</span>
            </p>
          </div>
          <p className="small muted measure">{t.rule}</p>

          <nav aria-label="À qui ils appartiennent" className="chips" style={{ margin: 'var(--s4) 0' }}>
            {FREE_KINDS.filter((k) => free.some((m) => m.ownership!.controllerKind === k)).map((k) => (
              <a key={k} href={`#k-${k}`} className="chip">
                {FREE_KIND_LABEL[k]} · {free.filter((m) => m.ownership!.controllerKind === k).length}
              </a>
            ))}
          </nav>

          {FREE_KINDS.map((k) => {
            const list = free.filter((m) => m.ownership!.controllerKind === k)
            if (list.length === 0) return null
            return (
              <section key={k} id={`k-${k}`} className="section" aria-labelledby={`h-${k}`}>
                <h2 id={`h-${k}`} style={{ fontSize: 'var(--h3)' }}>
                  {FREE_KIND_LABEL[k]}
                </h2>
                <p className="small muted" style={{ marginTop: 0 }}>
                  {list.map((m) => `${m.name} (${MEDIA_TYPE_LABEL[m.type].toLowerCase()})`).join(' · ')}
                </p>
                <div className="grid grid--2">
                  {list.map((m) => (
                    <MediaCard key={m.slug} m={m} />
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}

      <p className="section">
        <Link href="/medias">{t.all}</Link> · <Link href="/methodologie#medias">{UI_COPY.medias.howTo}</Link>
      </p>
    </div>
  )
}
