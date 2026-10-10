import type { Metadata } from 'next'
import Link from 'next/link'
import { SharePanel } from '@/components/SharePanel'
import { notFound } from 'next/navigation'
import { getSocialPost, getSocialPosts } from '@/lib/social'
import { UI_COPY } from '@/lib/copy'
import { absolute } from '@/lib/site'

const t = UI_COPY.social

export function generateStaticParams() {
  return getSocialPosts().map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = getSocialPost(id)
  if (!p) return {}
  return {
    title: p.card.title,
    description: p.card.line || p.text.facebook.slice(0, 160),
    alternates: { canonical: `/social/${p.id}` },
    // Page d'arrivée des réseaux : utile au lecteur, pas aux moteurs de recherche
    robots: { index: false, follow: true },
  }
}

export default async function SocialPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = getSocialPost(id)
  if (!p) notFound()
  return (
    <div className="container measure" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">{p.card.kicker}</p>
      <h1>{p.card.title}</h1>
      {p.card.line && <p className="lede">{p.card.line}</p>}
      {p.source?.quote && (
        <blockquote className="card card--flat">
          <p style={{ margin: 0 }}>« {p.source.quote} »</p>
          <p className="small muted" style={{ margin: 'var(--s2) 0 0' }}>
            {p.source.who && `${p.source.who}, `}
            <a href={p.source.url} rel="noopener noreferrer nofollow" target="_blank">
              {p.source.publisher}
            </a>
          </p>
        </blockquote>
      )}
      {!p.source?.quote && p.source && (
        <p className="small muted">
          {t.source}{' '}
          <a href={p.source.url} rel="noopener noreferrer nofollow" target="_blank">
            {p.source.publisher}
          </a>
        </p>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/social/${p.id}/carte.png`} width={1080} height={1350} alt={`${p.card.kicker} ${p.card.title}`} style={{ width: '100%', maxWidth: 420, height: 'auto', border: 'var(--border) solid var(--ink)', borderRadius: 'var(--radius)', display: 'block', margin: 'var(--s5) 0' }} />
      <SharePanel url={absolute(`/social/${p.id}`)} title={p.card.title} text={p.text.x} imageSrc={`/social/${p.id}/carte.png`} />
      <p className="row" style={{ gap: 'var(--s3)', margin: 'var(--s5) 0' }}>
        <Link className="btn btn--highlight" href={p.target}>
          {p.targetLabel}
        </Link>
        {p.target !== '/test' && (
          <Link className="btn btn--secondary" href="/test">
            {t.test}
          </Link>
        )}
        {p.target !== '/urne' && (
          <Link className="btn btn--ghost" href="/urne">
            {t.urne}
          </Link>
        )}
      </p>
      <p className="small muted">
        <Link href="/methodologie#codage">{t.how}</Link>
      </p>
    </div>
  )
}
