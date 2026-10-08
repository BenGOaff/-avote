import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getArticle, getArticles } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Article du Radar de Ça vote ?'

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }))
}

// Aperçu social : la satire reste reconnaissable hors contexte (cahier §26).
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticle(slug)
  const [display, ui] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/og-fonts/archivo-black-latin-400-normal.woff')),
    readFile(path.join(process.cwd(), 'src/og-fonts/public-sans-latin-700-normal.woff')),
  ])
  const title = a?.title ?? 'Ça vote ?'
  const label = a?.type === 'satire' ? 'SATIRE' : 'LE RADAR'
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#F5F0E6', color: '#191919', padding: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Public Sans', fontSize: 26, padding: '4px 12px', border: '3px solid #191919', background: a?.type === 'satire' ? '#FFE34D' : '#F5F0E6' }}>{label}</span>
        </div>
        <div style={{ fontFamily: 'Archivo Black', fontSize: title.length > 80 ? 56 : 68, lineHeight: 1.08 }}>{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Public Sans', fontSize: 28 }}>
          <span style={{ fontFamily: 'Archivo Black', fontSize: 40 }}>
            ÇA VOTE <span style={{ background: '#FFE34D', padding: '0 10px', marginLeft: 8 }}>?</span>
          </span>
          <span>çavote.fr</span>
        </div>
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
