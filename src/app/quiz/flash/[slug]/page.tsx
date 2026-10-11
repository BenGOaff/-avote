import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UI_COPY } from '@/lib/copy'
import { getFlashQuiz, getFlashQuizzes } from '@/lib/flash-content'
import { absolute } from '@/lib/site'
import { FlashQuiz } from './FlashQuiz'

const t = UI_COPY.flash

export const dynamicParams = false

export function generateStaticParams() {
  return getFlashQuizzes().map((q) => ({ slug: q.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const q = getFlashQuiz((await params).slug)
  if (!q) return {}
  return { title: t.metaTitle(q.title), description: `${q.lede} ${t.metaTail}`, alternates: { canonical: `/quiz/flash/${q.slug}` } }
}

// Réponses et score restent dans le navigateur : aucune requête, aucun stockage, aucun événement de mesure.
export default async function FlashPage({ params }: { params: Promise<{ slug: string }> }) {
  const q = getFlashQuiz((await params).slug)
  if (!q) notFound()
  const others = getFlashQuizzes()
    .filter((o) => o.slug !== q.slug)
    .map((o) => ({ slug: o.slug, title: o.title }))
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">
        <Link href="/quiz">{t.kicker}</Link>
      </p>
      <div className={q.avatar ? 'flash-head' : undefined}>
        <div>
          <h1>{q.title}</h1>
          <p className="lede">{q.lede}</p>
        </div>
        {q.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="flash-head__avatar" src={q.avatar} width={800} height={800} alt={t.avatarAlt(q.tribe)} />
        )}
      </div>
      <FlashQuiz quiz={q} url={absolute(`/quiz/flash/${q.slug}`)} others={others} />
      <p className="small muted section">{t.privacy}</p>
    </div>
  )
}
