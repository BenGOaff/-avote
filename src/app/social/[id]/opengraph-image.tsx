import { ImageResponse } from 'next/og'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { getSocialPost, getSocialPosts } from '@/lib/social'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Ça vote ?'

export function generateStaticParams() {
  return getSocialPosts().map((p) => ({ id: p.id }))
}

/** Portrait du candidat converti en PNG (le moteur d'image ne lit pas le WebP). */
async function portrait(slug: string | undefined): Promise<string | null> {
  if (!slug) return null
  const file = path.join(process.cwd(), 'public/img/candidats', `${slug}.webp`)
  if (!existsSync(file)) return null
  const png = await sharp(file).resize(360, 360).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

// Visuel aux couleurs du site : papier crème, encre noire, surlignage jaune.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = getSocialPost(id)
  const [display, ui, face] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/og-fonts/archivo-black-latin-400-normal.woff')),
    readFile(path.join(process.cwd(), 'src/og-fonts/public-sans-latin-700-normal.woff')),
    portrait(p?.card.actor),
  ])
  const title = p?.card.title ?? 'Ça vote ?'
  const line = p?.card.line ?? ''
  const kicker = (p?.card.kicker ?? 'ÇA VOTE ?').toUpperCase()
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F5F0E6', color: '#191919', padding: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex' }}>
            <span style={{ fontFamily: 'Public Sans', fontSize: 26, padding: '4px 14px', border: '3px solid #191919', background: '#FFE34D' }}>{kicker}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingRight: face ? 24 : 0 }}>
            <div style={{ fontFamily: 'Archivo Black', fontSize: title.length > 70 ? 52 : 64, lineHeight: 1.06 }}>{title}</div>
            {line && <div style={{ fontFamily: 'Public Sans', fontSize: 28, lineHeight: 1.3 }}>{line}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Public Sans', fontSize: 28 }}>
            <span style={{ fontFamily: 'Archivo Black', fontSize: 40 }}>
              ÇA VOTE <span style={{ background: '#FFE34D', padding: '0 10px', marginLeft: 8 }}>?</span>
            </span>
            <span>Fais le test sur çavote.fr</span>
          </div>
        </div>
        {face && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={face} width={330} height={330} style={{ border: '4px solid #191919', borderRadius: 999 }} alt="" />
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Archivo Black', data: display, weight: 400, style: 'normal' },
        { name: 'Public Sans', data: ui, weight: 700, style: 'normal' },
      ],
    },
  )
}
