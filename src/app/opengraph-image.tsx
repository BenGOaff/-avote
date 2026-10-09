import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const alt = 'Ça vote ? — Présidentielle 2027 : qui propose quoi'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const [display, ui, symbol] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/og-fonts/archivo-black-latin-400-normal.woff')),
    readFile(path.join(process.cwd(), 'src/og-fonts/public-sans-latin-700-normal.woff')),
    readFile(path.join(process.cwd(), 'public/brand/symbole.svg'), 'utf8'),
  ])
  const symbolSrc = `data:image/svg+xml;base64,${Buffer.from(symbol).toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#F5F0E6', color: '#191919', padding: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Archivo Black', fontSize: 64 }}>ÇA VOTE</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={symbolSrc} width={92} height={92} alt="" />
        </div>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 76, lineHeight: 1.05, maxWidth: 1050 }}>Trouve le candidat le plus proche de tes idées</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Public Sans', fontSize: 30 }}>
          <span>Chaque calcul est public, chaque position a sa source</span>
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
