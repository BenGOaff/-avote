import { ImageResponse } from 'next/og'
import { getFlashQuiz, getFlashQuizzes } from '@/lib/flash-content'
import { Cta, fit, fonts, Hook, INK, PAPER } from '@/lib/social-card'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Quiz flash Ça vote ?'

export function generateStaticParams() {
  return getFlashQuizzes().map((q) => ({ slug: q.slug }))
}

// Aperçu du lien partagé : la question, jamais le score de la personne
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const q = getFlashQuiz((await params).slug)
  const title = (q?.title ?? 'Quiz flash').toUpperCase()
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '48px 56px', gap: 28, justifyContent: 'center' }}>
          <Hook text="Quiz flash · 30 secondes" size={32} />
          <div style={{ fontFamily: 'Archivo Black', fontSize: fit(title, [[18, 110], [26, 92], [40, 72]]), lineHeight: 1.02 }}>{title}</div>
          <div style={{ fontFamily: 'Public Sans', fontSize: 34 }}>7 questions, un score à partager, un vrai chiffre pour finir.</div>
        </div>
        <Cta label="Fais le test" size={34} />
      </div>
    ),
    { ...size, fonts: await fonts() },
  )
}
