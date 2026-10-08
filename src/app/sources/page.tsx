import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { getArticles, getBriefs } from '@/lib/content'
import { getAnnouncedActors } from '@/lib/actors'

export const metadata: Metadata = {
  title: 'Sources',
  description: 'Toutes les sources citées par Ça vote ? : programmes, documents officiels, déclarations et articles, avec le passage utilisé.',
  alternates: { canonical: '/sources' },
}

export default function SourcesPage() {
  const rows = new Map<string, { title: string; publisher: string; url: string; usedIn: { label: string; href: string }[] }>()
  const add = (s: { title: string; publisher: string; url: string }, label: string, href: string) => {
    const r = rows.get(s.url) ?? { ...s, usedIn: [] }
    r.usedIn.push({ label, href })
    rows.set(s.url, r)
  }
  for (const a of getArticles()) for (const s of a.sources) add(s, a.title, `/radar/${a.slug}`)
  for (const b of getBriefs()) {
    add(b.source, b.title, `/radar#${b.slug}`)
    for (const m of b.more) add(m, b.title, `/radar#${b.slug}`)
  }
  for (const a of getAnnouncedActors()) add(a.source, `Candidature : ${a.name}`, '/candidats')
  const list = [...rows.values()].sort((a, b) => a.publisher.localeCompare(b.publisher, 'fr'))

  return (
    <div className="container">
      <PageHeader kicker="Preuves" title="Sources" lede="Chaque fait publié renvoie à une source. Les voici toutes, avec l’endroit où elles sont utilisées." />
      <div className="measure stack">
        <p className="small muted">
          Un programme établit ce qu’un candidat propose ; il ne prouve pas que la mesure est financée ou réalisable. Une statistique officielle renseigne un fait
          dans un périmètre ; elle n’est pas une position. Plusieurs articles qui reprennent la même dépêche comptent pour une seule source.{' '}
          <Link href="/methodologie#codage">Règles de codage</Link>
        </p>
      </div>
      {list.length === 0 ? (
        <p>Aucune source publiée pour l’instant.</p>
      ) : (
        <div className="table-wrap" style={{ marginTop: 'var(--s5)' }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Éditeur</th>
                <th scope="col">Document</th>
                <th scope="col">Utilisé dans</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.url}>
                  <td>{r.publisher}</td>
                  <td>
                    <a href={r.url} rel="noopener noreferrer nofollow" target="_blank">
                      {r.title}
                    </a>
                  </td>
                  <td className="small">
                    {r.usedIn.map((u, i) => (
                      <span key={u.href + i}>
                        {i > 0 && ' · '}
                        <Link href={u.href}>{u.label}</Link>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
