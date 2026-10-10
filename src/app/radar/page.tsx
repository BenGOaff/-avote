import type { Metadata } from 'next'
import { getArticles, getBriefs } from '@/lib/content'
import { ArticleCard, BriefItem, formatDay } from '@/components/Editorial'

export const metadata: Metadata = {
  title: 'Le Radar — l’actu de la présidentielle 2027',
  description: 'Le fil d’actu politique de la présidentielle 2027 : déclarations, programmes, candidatures. Chaque brève renvoie à sa source.',
  alternates: { canonical: '/radar' },
}

export const revalidate = 1800

export default function RadarPage() {
  const briefs = getBriefs()
  const articles = getArticles()
  const byDay = new Map<string, typeof briefs>()
  for (const b of briefs) {
    const day = b.date.slice(0, 10)
    byDay.set(day, [...(byDay.get(day) ?? []), b])
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">Le Radar</p>
      <h1>L’actu de la campagne</h1>
      <p className="lede">Ce qui a été dit, promis, voté ou corrigé. Chaque brève renvoie à sa source ; les remarques en italique sont des commentaires.</p>

      <div className="grid grid--2" style={{ marginTop: 'var(--s6)', alignItems: 'start', gridTemplateColumns: undefined }}>
        <section aria-labelledby="fil">
          <h2 id="fil" style={{ fontSize: 'var(--h3)' }}>
            Le fil
          </h2>
          {[...byDay.entries()].map(([day, list]) => (
            <div key={day} style={{ marginTop: 'var(--s5)' }}>
              <h3 className="kicker" style={{ fontFamily: 'var(--font-ui)' }}>
                {formatDay(list[0]!.date)}
              </h3>
              <ul className="feed">
                {list.map((b) => (
                  <BriefItem key={b.slug} b={b} />
                ))}
              </ul>
            </div>
          ))}
        </section>
        <section aria-labelledby="articles" className="stack">
          <h2 id="articles" style={{ fontSize: 'var(--h3)' }}>
            Articles
          </h2>
          {articles.length === 0 && <p className="muted">Les premiers articles arrivent.</p>}
          {articles.map((a, i) => (
            <ArticleCard key={a.slug} a={a} featured={i === 0} />
          ))}
        </section>
      </div>
    </div>
  )
}
