import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { CHAPITRES, LECTURE, nbsp, SEANCE_SLUG } from '@/lib/comprendre'

const t = UI_COPY.comprendre

export const metadata: Metadata = {
  title: 'Comprendre la politique : gauche, droite, extrêmes, partis, notions',
  description: 'Gauche et droite, les extrêmes, l’histoire des partis, les grands moments de la Ve République, les mots du débat. Sourcé, simple, sans leçon.',
  alternates: { canonical: '/comprendre' },
}

export default function ComprendrePage() {
  const chapters = LECTURE
  const seance = CHAPITRES.find((c) => c.slug === SEANCE_SLUG)
  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <div className="measure stack">
        <ol className="stack" style={{ paddingLeft: 0, listStyle: 'none' }}>
          {chapters.map((c, i) => (
            <li key={c.slug} className="card card--flat">
              <p className="small muted" style={{ margin: 0 }}>
                {t.chapter(i + 1, chapters.length)}
              </p>
              <h2 style={{ fontSize: 'var(--h3)', margin: 'var(--s1) 0' }}>
                <Link href={`/comprendre/${c.slug}`}>{nbsp(c.title)}</Link>
              </h2>
              <p style={{ margin: 0 }}>{nbsp(c.question)}</p>
            </li>
          ))}
        </ol>

        {seance && (
          <section className="card card--featured" aria-labelledby="profs">
            <h2 id="profs" style={{ marginTop: 0 }}>
              {t.teachersTitle}
            </h2>
            <p>{t.teachersBody}</p>
            <Link className="btn btn--highlight" href={`/comprendre/${seance.slug}`}>
              {t.teachersBtn}
            </Link>
          </section>
        )}

        <p className="small muted">{t.method}</p>
      </div>
    </div>
  )
}
