import { ImageResponse } from 'next/og'
import path from 'node:path'
import sharp from 'sharp'
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
  // Le moteur d'image ne lit pas le WebP : l'avatar passe en PNG
  const avatar = q?.avatar ? `data:image/png;base64,${(await sharp(path.join(process.cwd(), 'public', q.avatar)).resize(440, 440).png().toBuffer()).toString('base64')}` : null
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '24px 40px 24px 56px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 26, justifyContent: 'center' }}>
          <Hook text="Quiz flash · 30 secondes" size={32} />
          <div style={{ fontFamily: 'Archivo Black', fontSize: fit(title, avatar ? [[18, 84], [26, 70], [40, 56]] : [[18, 110], [26, 92], [40, 72]]), lineHeight: 1.02 }}>{title}</div>
          <div style={{ fontFamily: 'Public Sans', fontSize: 32 }}>7 questions, un score à partager, un vrai chiffre pour finir.</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {avatar && <img src={avatar} width={440} height={440} alt="" />}
        </div>
        <Cta label="Fais le test" size={34} />
      </div>
    ),
    { ...size, fonts: await fonts() },
  )
}
