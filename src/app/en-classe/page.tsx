import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { ShortAnswer } from '@/components/ShortAnswer'
import { UI_COPY } from '@/lib/copy'
import { QUICK_ITEMS } from '@/lib/data'
import { LEGAL } from '@/lib/legal'
import { absolute } from '@/lib/site'

/**
 * La présidentielle en classe : la séance de 50 minutes de « Comprendre la politique » et trois séances courtes qui
 * s'appuient sur les pages existantes (médias, intox, tests comparés). C'est la page envoyée aux enseignants.
 */
const t = UI_COPY.enClasse

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.description(QUICK_ITEMS.length),
  alternates: { canonical: '/en-classe' },
}

export default function EnClassePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t.title,
      url: absolute('/en-classe'),
      itemListElement: t.seances.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: absolute(`/en-classe#${s.id}`) })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: t.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <ShortAnswer>
        <ul style={{ margin: 0 }}>
          {t.short(QUICK_ITEMS.length).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </ShortAnswer>

      <div className="measure stack section">
        <section className="card card--featured" aria-labelledby="regles">
          <h2 id="regles" style={{ marginTop: 0, fontSize: 'var(--h3)' }}>
            {t.rulesTitle}
          </h2>
          <ol style={{ marginBottom: 0 }}>
            {t.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </section>

        {t.seances.map((s) => (
          <section key={s.id} id={s.id} className="card card--flat" aria-labelledby={`${s.id}-titre`}>
            <p className="kicker" style={{ margin: 0 }}>
              {t.duration(s.min)}
            </p>
            <h2 id={`${s.id}-titre`} style={{ marginTop: 'var(--s1)', fontSize: 'var(--h3)' }}>
              {s.title}
            </h2>
            <p>{s.goal}</p>
            <h3 style={{ fontSize: 'var(--text-body)' }}>{t.steps}</h3>
            <ul>
              {s.steps.map((st) => (
                <li key={st}>{st}</li>
              ))}
            </ul>
            <p>
              <strong>{t.debate} : </strong>
              {s.debate}
            </p>
            <ul className="row" role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {s.links.map((l, i) => (
                <li key={l.href}>
                  <Link className={i === 0 ? 'btn btn--highlight btn--small' : 'btn btn--small'} href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="outils">
          <h2 id="outils" style={{ fontSize: 'var(--h3)' }}>
            {t.toolsTitle}
          </h2>
          <ul>
            {t.tools.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link> : {l.desc}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="donnees">
          <h2 id="donnees" style={{ fontSize: 'var(--h3)' }}>
            {t.privacyTitle}
          </h2>
          <ul>
            {t.privacy.slice(0, -1).map((p) => (
              <li key={p}>{p}</li>
            ))}
            <li>
              <Link href="/confidentialite">{t.privacy.at(-1)}</Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq" style={{ fontSize: 'var(--h3)' }}>
            {t.faqTitle}
          </h2>
          {t.faq.map((f) => (
            <div key={f.q}>
              <h3 style={{ fontSize: 'var(--text-body)' }}>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <p className="small muted">
          <a href={`mailto:${LEGAL.contactEmail}?subject=En%20classe`}>{t.contact}</a>
        </p>
      </div>
    </div>
  )
}
