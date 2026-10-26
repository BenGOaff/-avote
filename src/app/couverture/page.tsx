import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { liveCorpus, questionnaire } from '@/lib/data'
import { debatedItems } from '@/lib/engine/scoring'
import type { Position } from '@/lib/engine/types'

/**
 * Couverture du référentiel : pour chaque candidat, combien de positions sont documentées, thème par thème.
 * Tout est recalculé à la construction du site depuis content/corpus/live.json : rien n'est saisi à la main.
 */

export const metadata: Metadata = {
  title: 'Ce qu’on sait de chaque candidat, et ce qui manque',
  description: 'Pour chaque candidat, le nombre de positions documentées par thème, la date de mise à jour et les trous. Une case vide reste vide : on ne devine pas.',
  alternates: { canonical: '/couverture' },
}

const known = (p: Position | undefined) => !!p && !('missing' in p) && !('set' in p && p.set.length === 0)
const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' })
const fmt = new Intl.NumberFormat('fr-FR')

export default function CouverturePage() {
  const items = questionnaire.items.filter((i) => !i.inactive)
  const themes = questionnaire.themes
  const debated = debatedItems(questionnaire, liveCorpus.positions)
  const refreshed = (liveCorpus as { refreshedAt?: Record<string, string> }).refreshedAt ?? {}
  const rows = liveCorpus.actors
    .map((a) => {
      const ps = liveCorpus.positions[a.slug] ?? {}
      const byTheme = themes.map((t) => {
        const its = items.filter((i) => i.theme === t.id)
        return { id: t.id, n: its.filter((i) => known(ps[i.id])).length, of: its.length }
      })
      const total = items.filter((i) => known(ps[i.id])).length
      const onDebated = items.filter((i) => debated.has(i.id) && known(ps[i.id])).length
      return { slug: a.slug, name: a.name, total, onDebated, byTheme, at: refreshed[a.slug] }
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'fr'))
  const totalKnown = rows.reduce((n, r) => n + r.total, 0)
  const sources = (liveCorpus as { sources?: unknown[] }).sources?.length ?? 0

  return (
    <div className="container">
      <PageHeader
        kicker="Méthode"
        title="Ce qu’on sait de chaque candidat"
        lede="Combien de positions sont documentées, thème par thème, et ce qui manque encore. Une case vide veut dire qu’on n’a pas trouvé de phrase vérifiable, pas que le candidat n’a pas d’avis."
      />
      <div className="measure stack">
        <dl className="dl">
          <dt>Positions documentées</dt>
          <dd>{fmt.format(totalKnown)}, chacune avec sa citation exacte et son lien</dd>
          <dt>Sources citées</dt>
          <dd>{fmt.format(sources)}</dd>
          <dt>Candidats suivis</dt>
          <dd>{rows.length}</dd>
          <dt>Sujets débattus</dt>
          <dd>
            {debated.size} affirmations sur {items.length}, celles où au moins un tiers des candidats s’est prononcé
          </dd>
        </dl>
        <p>
          Un candidat n’apparaît dans ton classement que si sa position est connue sur au moins la moitié de tes réponses aux sujets débattus. Les autres sont
          affichés à part, sans rang. Les détails sont dans <Link href="/methodologie">la méthode</Link> ; les données brutes, dans{' '}
          <a href="/donnees.json">donnees.json</a>.
        </p>
      </div>

      <section className="section" aria-labelledby="tableau-couverture">
        <h2 id="tableau-couverture">Candidat par candidat</h2>
        <div className="table-wrap">
          <table>
            <caption className="visually-hidden">Positions documentées par candidat et par thème</caption>
            <thead>
              <tr>
                <th scope="col">Candidat</th>
                <th scope="col">Total</th>
                <th scope="col">Sujets débattus</th>
                {themes.map((t) => (
                  <th key={t.id} scope="col">
                    {t.label}
                  </th>
                ))}
                <th scope="col">Mis à jour</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug}>
                  <th scope="row">
                    <Link href={`/candidats/${r.slug}`}>{r.name}</Link>
                  </th>
                  <td>
                    <strong>{r.total}</strong>/{items.length}
                  </td>
                  <td>
                    {r.onDebated}/{debated.size}
                  </td>
                  {r.byTheme.map((t) => (
                    <td key={t.id} className={t.n === 0 ? 'muted' : undefined}>
                      {t.n === 0 ? '·' : `${t.n}/${t.of}`}
                    </td>
                  ))}
                  <td className="small">{r.at ? day.format(new Date(r.at)) : 'non daté'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          « · » : aucune position trouvée sur ce thème. Un candidat qui n’a pas publié de programme laisse beaucoup de cases vides : elles se remplissent au fil de
          la campagne, à mesure qu’il précise ce qu’il propose.
        </p>
      </section>
    </div>
  )
}
