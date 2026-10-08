import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { SECTIONS } from '@/lib/nav'

export const metadata: Metadata = { title: 'Plus', robots: { index: false, follow: true } }

export default function PlusPage() {
  return (
    <div className="container">
      <PageHeader title="Tout Ça vote ?" />
      {SECTIONS.map((s) => (
        <section key={s.id} className="plus-section" aria-labelledby={`plus-${s.id}`}>
          <h2 id={`plus-${s.id}`} className="kicker">
            {s.title}
          </h2>
          <ul className="plus-list">
            {s.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="card card--flat plus-link">
                  <strong>{i.label}</strong>
                  {i.desc && <span className="small muted">{i.desc}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
