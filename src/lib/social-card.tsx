import 'server-only'
import { ImageResponse } from 'next/og'
import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { SocialPost } from './social-schema'

/**
 * Visuels des publications, aux couleurs du site (papier crème, encre noire, jaune).
 *  - « carte » : 1080 × 1350, le format portrait qui prend le plus de place dans les fils (Instagram, Facebook, LinkedIn, X) ;
 *  - « apercu » : 1200 × 630, l'aperçu de lien (Open Graph).
 * Les visages font le travail : un candidat seul en grand, ou les deux camps face à face.
 */
const PAPER = '#F5F0E6'
const INK = '#191919'
const YELLOW = '#FFE34D'

const ROOT = process.cwd()
const names = new Map(
  (JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string; name: string }[] }).actors.map((a) => [a.slug, a.name]),
)
const nameOf = (slug: string) => names.get(slug) ?? slug
const lastName = (slug: string) => nameOf(slug).replace(/^(\S+\s)(de\s)?/, (_m, _f, de) => de ?? '')

/** Portrait du candidat en PNG (le moteur d'image ne lit pas le WebP). */
async function face(slug: string, px: number): Promise<string | null> {
  const file = path.join(ROOT, 'public/img/candidats', `${slug}.webp`)
  if (!existsSync(file)) return null
  const png = await sharp(file).resize(px * 2, px * 2).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

async function fonts() {
  const [display, ui] = await Promise.all([
    readFile(path.join(ROOT, 'src/og-fonts/archivo-black-latin-400-normal.woff')),
    readFile(path.join(ROOT, 'src/og-fonts/public-sans-latin-700-normal.woff')),
  ])
  return [
    { name: 'Archivo Black', data: display, weight: 400 as const, style: 'normal' as const },
    { name: 'Public Sans', data: ui, weight: 700 as const, style: 'normal' as const },
  ]
}

const fit = (text: string, sizes: [number, number][]) => sizes.find(([max]) => text.length <= max)?.[1] ?? sizes[sizes.length - 1]![1]
/** Taille de titre plafonnée par le mot le plus long, pour qu'aucun mot ne déborde (≈ 0,62 em par lettre en Archivo Black). */
const fitWords = (text: string, sizes: [number, number][], width: number) => {
  const longest = Math.max(...text.split(/\s+/).map((w) => w.length))
  return Math.min(fit(text, sizes), Math.floor(width / (longest * 0.66)))
}

function Avatar({ src, slug, px }: { src: string | null; slug: string; px: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={px} height={px} style={{ border: `4px solid ${INK}`, borderRadius: 999 }} alt="" />
  ) : (
    <div style={{ width: px, height: px, borderRadius: 999, border: `4px solid ${INK}`, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo Black', fontSize: px / 3 }}>
      {nameOf(slug)
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')}
    </div>
  )
}

/** Un camp : bandeau OUI ou NON, puis les visages. */
function Camp({ label, slugs, faces, dark }: { label: string; slugs: string[]; faces: (string | null)[]; dark: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, border: `4px solid ${INK}`, background: dark ? INK : PAPER }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: dark ? INK : YELLOW, color: dark ? YELLOW : INK, fontFamily: 'Archivo Black', fontSize: 52, borderBottom: `4px solid ${INK}` }}>
        <span>{label}</span>
        <span>{slugs.length}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 20, justifyContent: 'center' }}>
        {slugs.slice(0, 8).map((s, i) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 128 }}>
            <Avatar src={faces[i] ?? null} slug={s} px={116} />
            <span style={{ fontFamily: 'Public Sans', fontSize: 20, marginTop: 4, color: dark ? PAPER : INK, textAlign: 'center' }}>{lastName(s)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Hook({ text, size }: { text: string; size: number }) {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ fontFamily: 'Archivo Black', fontSize: size, lineHeight: 1.05, padding: '6px 18px', background: YELLOW, border: `4px solid ${INK}` }}>{text.toUpperCase()}</span>
    </div>
  )
}

function Cta({ label, size }: { label: string; size: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: INK, color: PAPER, padding: '22px 36px', fontFamily: 'Archivo Black', fontSize: size }}>
      <span style={{ color: YELLOW }}>{label.toUpperCase()}</span>
      <span>
        ÇA VOTE <span style={{ background: YELLOW, color: INK, padding: '0 10px', marginLeft: 8 }}>?</span>
      </span>
    </div>
  )
}

export async function socialImage(p: SocialPost | undefined, format: 'carte' | 'apercu'): Promise<ImageResponse> {
  const portrait = format === 'carte'
  const size = portrait ? { width: 1080, height: 1350 } : { width: 1200, height: 630 }
  const c = p?.card
  const hook = c?.kicker ?? 'Ça vote ?'
  const title = c?.title ?? 'Ça vote ?'
  const cta = p ? (c?.cta ?? `${p.targetLabel} sur çavote.fr`) : 'çavote.fr'
  const yes = c?.yes ?? []
  const no = c?.no ?? []
  const camps = yes.length > 0 && no.length > 0
  const [f, yesFaces, noFaces, solo] = await Promise.all([
    fonts(),
    Promise.all(yes.slice(0, 8).map((s) => face(s, 116))),
    Promise.all(no.slice(0, 8).map((s) => face(s, 116))),
    c?.actor ? face(c.actor, portrait ? 300 : 260) : Promise.resolve(null),
  ])

  if (!portrait) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK }}>
          <div style={{ display: 'flex', flex: 1, padding: '44px 56px 28px', gap: 36 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, flex: 1 }}>
              <Hook text={hook} size={34} />
              <div style={{ fontFamily: 'Archivo Black', fontSize: fit(title, [[50, 64], [80, 54], [200, 46]]), lineHeight: 1.05 }}>{c?.quote ? `« ${c.quote} »` : title}</div>
              {camps && (
                <div style={{ display: 'flex', gap: 12, fontFamily: 'Archivo Black', fontSize: 34 }}>
                  <span style={{ background: YELLOW, padding: '2px 14px', border: `3px solid ${INK}` }}>OUI {yes.length}</span>
                  <span style={{ background: INK, color: YELLOW, padding: '2px 14px', border: `3px solid ${INK}` }}>NON {no.length}</span>
                </div>
              )}
              {c?.actor && <div style={{ fontFamily: 'Public Sans', fontSize: 30 }}>{nameOf(c.actor)}</div>}
            </div>
            {c?.actor && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={solo} slug={c.actor} px={260} />
              </div>
            )}
          </div>
          <Cta label={cta} size={30} />
        </div>
      ),
      { ...size, fonts: f },
    )
  }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '60px 60px 44px', gap: 30, justifyContent: 'space-between' }}>
          <Hook text={hook} size={fit(hook, [[16, 64], [26, 52], [40, 42]])} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontFamily: 'Archivo Black', fontSize: c?.actor ? fitWords(title, [[50, 78], [80, 68], [200, 58]], 960) : fitWords(title, [[40, 104], [70, 92], [100, 80], [200, 64]], 960), lineHeight: 1.03 }}>{title}</div>
            {!c?.actor && c?.line && <div style={{ fontFamily: 'Public Sans', fontSize: 38, lineHeight: 1.25 }}>{c.line}</div>}
          </div>
          {c?.actor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <Avatar src={solo} slug={c.actor} px={c.quote ? 260 : 320} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <span style={{ fontFamily: 'Archivo Black', fontSize: 50, lineHeight: 1.05 }}>{nameOf(c.actor)}</span>
                {c.line && <span style={{ fontFamily: 'Public Sans', fontSize: 30, lineHeight: 1.25 }}>{c.line}</span>}
              </div>
            </div>
          )}
          {c?.quote && (
            <div style={{ display: 'flex', borderLeft: `14px solid ${YELLOW}`, paddingLeft: 26, fontFamily: 'Public Sans', fontSize: fit(c.quote, [[80, 46], [140, 40], [260, 34]]), lineHeight: 1.25 }}>{`« ${c.quote} »`}</div>
          )}
          {!camps && !c?.actor && <div style={{ display: 'flex' }} />}
          {camps && (
            <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
              <Camp label="OUI" slugs={yes} faces={yesFaces} dark={false} />
              <Camp label="NON" slugs={no} faces={noFaces} dark />
            </div>
          )}
        </div>
        <Cta label={cta} size={38} />
      </div>
    ),
    { ...size, fonts: f },
  )
}
