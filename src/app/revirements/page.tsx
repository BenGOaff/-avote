import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { formatDate } from '@/components/Editorial'
import { getAnnouncedActors } from '@/lib/actors'
import { questionnaire } from '@/lib/data'
import { REVIREMENTS, type Said } from '@/lib/revirements'

/**
 * Ils ont changé d'avis : deux phrases du même candidat, datées et sourcées, sur le même sujet.
 * Aucune entrée vérifiée = pas de page (content/revirements/revirements.json).
 */

export const metadata: Metadata = {
  title: 'Ils ont changé d’avis : les revirements des candidats à la présidentielle 2027',
  description: 'Deux phrases du même candidat, avant et après, sur le même sujet. Chacune datée, sourcée et retrouvée mot pour mot dans sa page.',
  alternates: { canonical: '/revirements' },
}

function Quote({ label, s }: { label: string; s: Said }) {
  return (
    <div>
      <p className="small muted" style={{ margin: 0 }}>
        {label}, {formatDate(s.date)}
      </p>
      <blockquote style={{ margin: 'var(--s1) 0' }}>« {s.quote} »</blockquote>
      <p className="hint" style={{ margin: 0 }}>
        <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
          {s.publisher} — {s.title}
        </a>
      </p>
    </div>
  )
}

export default function RevirementsPage() {
  if (REVIREMENTS.length === 0) notFound()
  const actors = getAnnouncedActors()
  return (
    <div className="container">
      <PageHeader
        kicker="La campagne"
        title="Ils ont changé d’avis"
        lede="Deux phrases du même candidat sur le même sujet, avant et après. Changer d’avis n’est pas une faute : ce qui compte, c’est de savoir lequel des deux se présente."
      />
      <div className="measure stack">
        {REVIREMENTS.map((r) => {
          const name = actors.find((a) => a.slug === r.actor)?.name ?? r.actor
          const item = r.itemId ? questionnaire.items.find((i) => i.id === r.itemId) : undefined
          return (
            <article key={`${r.actor}-${r.topic}`} className="card card--flat stack" style={{ overflowWrap: 'anywhere' }}>
              <h2 style={{ fontSize: 'var(--h3)', margin: 0 }}>
                <Link href={`/candidats/${r.actor}`}>{name}</Link> : {r.topic}
              </h2>
              <Quote label="Avant" s={r.before} />
              <Quote label="Après" s={r.after} />
              {r.note && <p className="small" style={{ margin: 0 }}>{r.note}</p>}
              {item && (
                <p className="small muted" style={{ margin: 0 }}>
                  Affirmation du test concernée : « {item.text} »
                </p>
              )}
            </article>
          )
        })}
        <p className="small muted">
          Chaque phrase est retrouvée mot pour mot dans la page citée. Une erreur, ou une précision de l’équipe d’un candidat :{' '}
          <Link href="/corrections#droit-de-reponse">droit de réponse</Link>.
        </p>
      </div>
    </div>
  )
}
