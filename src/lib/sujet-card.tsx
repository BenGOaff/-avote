import 'server-only'
import { ImageResponse } from 'next/og'
import { Cta, fit, fonts, Hook, INK, PAPER } from './social-card'
import type { Sujet, SujetItem } from './sujets'

/**
 * Visuel d'un sujet (/programmes/<sujet>) : pour chaque question, la barre pour / entre les deux / contre.
 *  - « carte » : 1080 × 1350, portrait des fils (Instagram, Facebook, LinkedIn, Pinterest) et de Google Images ;
 *  - « apercu » : 1200 × 630, l'aperçu de lien (Open Graph).
 * Couleurs reprises de src/styles/tokens.css (le moteur d'image ne lit pas les variables CSS).
 */
const LINE = '#d7d0c4'
const RED = '#c83232'

/** Les questions les mieux documentées, dans l'ordre du test. */
const top = (s: Sujet, n: number) => {
  const keep = new Set([...s.items].sort((a, b) => b.stances.length - a.stances.length).slice(0, n).map((r) => r.item.id))
  return s.items.filter((r) => keep.has(r.item.id))
}

function Bar({ r, h, size }: { r: SujetItem; h: number; size: number }) {
  const seg = [
    { n: r.count.pour, bg: INK, fg: PAPER },
    { n: r.count.entre, bg: LINE, fg: INK },
    { n: r.count.contre, bg: RED, fg: PAPER },
  ].filter((s) => s.n > 0)
  return (
    <div style={{ display: 'flex', height: h, border: `3px solid ${INK}`, background: PAPER }}>
      {seg.map((s, i) => (
        <div key={i} style={{ display: 'flex', flexGrow: s.n, alignItems: 'center', justifyContent: 'center', background: s.bg, color: s.fg, fontFamily: 'Archivo Black', fontSize: size }}>
          {String(s.n)}
        </div>
      ))}
    </div>
  )
}

function Legend({ size }: { size: number }) {
  const dot = (bg: string) => <div style={{ width: size, height: size, background: bg, border: `2px solid ${INK}`, marginRight: 8 }} />
  return (
    <div style={{ display: 'flex', gap: 28, fontFamily: 'Public Sans', fontSize: size, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {dot(INK)}
        Pour
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {dot(LINE)}
        Entre les deux
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {dot(RED)}
        Contre
      </div>
    </div>
  )
}

export async function sujetImage(s: Sujet, format: 'carte' | 'apercu'): Promise<ImageResponse> {
  const f = await fonts()
  const title = s.theme.label.toUpperCase()
  if (format === 'apercu') {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '36px 56px 24px', gap: 18 }}>
            <Hook text="Programmes 2027" size={28} />
            <div style={{ fontFamily: 'Archivo Black', fontSize: fit(title, [[22, 56], [30, 48], [40, 40]]), lineHeight: 1.05 }}>{title}</div>
            {top(s, 2).map((r) => (
              <div key={r.item.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'Public Sans', fontSize: 26, lineHeight: 1.2 }}>{r.item.text}</span>
                <Bar r={r} h={38} size={22} />
              </div>
            ))}
          </div>
          <Cta label="Qui est pour, qui est contre" size={28} />
        </div>
      ),
      { width: 1200, height: 630, fonts: f },
    )
  }
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 60px 36px', gap: 26 }}>
          <Hook text="Programmes 2027" size={44} />
          <div style={{ fontFamily: 'Archivo Black', fontSize: fit(title, [[16, 92], [24, 80], [40, 64]]), lineHeight: 1.03 }}>{title}</div>
          <div style={{ fontFamily: 'Public Sans', fontSize: 36 }}>Qui est pour, qui est contre ?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, flex: 1, justifyContent: 'center' }}>
            {top(s, 4).map((r) => (
              <div key={r.item.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontFamily: 'Public Sans', fontSize: 32, lineHeight: 1.18 }}>{r.item.text}</span>
                <Bar r={r} h={56} size={30} />
              </div>
            ))}
          </div>
          <Legend size={26} />
        </div>
        <Cta label="Les sources sur çavote.fr" size={36} />
      </div>
    ),
    { width: 1080, height: 1350, fonts: f },
  )
}
