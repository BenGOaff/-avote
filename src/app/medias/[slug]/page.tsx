import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/components/Editorial'
import { AlertList, MediaCard } from '@/components/MediaCard'
import { ShortAnswer } from '@/components/ShortAnswer'
import { UI_COPY } from '@/lib/copy'
import { mediaLogoOf } from '@/lib/images'
import { CONTROLLER_KIND_LABEL, getMedias, type MediaEntry } from '@/lib/medias'
import { absolute } from '@/lib/site'

const t = UI_COPY.mediaPage

export const dynamicParams = false

/** Une page par média dont la propriété est établie et sourcée */
export function generateStaticParams() {
  return getMedias()
    .filter((m) => m.ownership)
    .map((m) => ({ slug: m.slug }))
}

const find = (slug: string) => getMedias().find((m) => m.slug === slug && m.ownership)

function answerOf(m: MediaEntry): string {
  const o = m.ownership!
  const owner = o.owners[0]?.name ?? o.group
  return t.answer(m.name, owner, o.controller)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = find(slug)
  if (!m) return {}
  const o = m.ownership!
  return {
    title: t.metaTitle(m.name),
    description: `${answerOf(m)} ${o.note}`.slice(0, 158),
    alternates: { canonical: `/medias/${m.slug}` },
  }
}

export default async function MediaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const m = find(slug)
  if (!m) notFound()
  const o = m.ownership!
  const url = absolute(`/medias/${m.slug}`)
  const siblings = getMedias().filter((x) => x.slug !== m.slug && x.ownership && x.ownership.controller === o.controller)
  const others = o.otherMedia.filter((x) => x && x !== m.name && !siblings.some((s) => s.name === x))
  const kind = CONTROLLER_KIND_LABEL[o.controllerKind]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url,
        inLanguage: 'fr-FR',
        dateModified: o.checkedAt.slice(0, 10),
        mainEntity: [{ '@type': 'Question', name: t.title(m.name), acceptedAnswer: { '@type': 'Answer', text: `${answerOf(m)} ${o.note} Source : ${o.publisher}.` } }],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: UI_COPY.medias.title, item: absolute('/medias') },
          { '@type': 'ListItem', position: 2, name: t.title(m.name), item: url },
        ],
      },
    ],
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/medias">{UI_COPY.medias.title}</Link>
      </p>
      <h1 className="measure" style={{ fontSize: 'var(--h2)' }}>
        {t.title(m.name)}
      </h1>

      <ShortAnswer updated={t.checked(formatDate(o.checkedAt))}>
        <p>
          <strong>{answerOf(m)}</strong> {o.note}
        </p>
        {kind && o.controllerKind !== 'inconnu' && <p>{t.lastWord(kind)}</p>}
        {[...siblings.map((s) => s.name), ...others].length > 0 && <p>{t.same([...siblings.map((s) => s.name), ...others].join(', '))}</p>}
      </ShortAnswer>

      <div className="measure">
        <MediaCard m={m} logo={mediaLogoOf(m.slug)} />
      </div>

      {m.alerts && m.alerts.length > 0 && (
        <section className="section measure" id={`arcom-${m.slug}`} aria-labelledby="arcom">
          <h2 id="arcom" style={{ fontSize: 'var(--h3)' }}>
            {t.arcomTitle}
          </h2>
          <AlertList m={m} />
        </section>
      )}

      {siblings.length > 0 && (
        <nav className="section" aria-labelledby="groupe">
          <h2 id="groupe" style={{ fontSize: 'var(--h3)' }}>
            {t.group}
          </h2>
          <p className="sujet__tabs">
            {siblings.map((s) => (
              <Link key={s.slug} href={`/medias/${s.slug}`} className="cmp__theme sujet__tab">
                {s.name}
              </Link>
            ))}
          </p>
        </nav>
      )}

      <p className="section">
        <Link href={`/medias#${m.slug}`}>{t.all}</Link> · <Link href="/medias/libres">{t.free}</Link> ·{' '}
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/medias/${m.slug}`)}`}>{t.error}</Link>
      </p>
    </div>
  )
}
