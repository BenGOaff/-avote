/**
 * Série « Fronton » de la boutique : la devise gravée sur un fronton de mairie, dernier mot changé selon le camp.
 * Même gabarit, même taille de texte pour les six camps (le mot le plus long fixe la taille de tous).
 *   npx tsx scripts/boutique-fronton.ts
 * Sortie : docs/boutique/impression/{clair,sombre}/fronton-<id>.png (règles Spreadshop : PNG transparent,
 * pixels opaques ou vides, côté le plus long ≥ 4000 px, deux couleurs franches).
 */
import { mkdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const ROOT = process.cwd()
const DIR = join(ROOT, 'docs/boutique')
export const FRONTONS = [
  { id: 'solidarite', camp: 'Gauche radicale', word: 'SOLIDARITÉ' },
  { id: 'fraternite', camp: 'Gauche', word: 'FRATERNITÉ' },
  { id: 'biodiversite', camp: 'Écologistes', word: 'BIODIVERSITÉ' },
  { id: 'centralite', camp: 'Centre', word: 'CENTRALITÉ' },
  { id: 'propriete', camp: 'Droite', word: 'PROPRIÉTÉ' },
  { id: 'souverainete', camp: 'Patriotes', word: 'SOUVERAINETÉ' },
]
const MODES = { clair: '#191919', sombre: '#FFFDFA' } as const
const YELLOW = '#FFE34D'
const W = 4400
const MAX_BYTES = 10 * 1024 * 1024

const font = (f: string) => `data:font/woff2;base64,${readFileSync(f).toString('base64')}`

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined })
  const page = await browser.newPage()
  await page.setContent('<!doctype html><body></body>')
  await page.evaluate('window.__name = (f) => f')
  await page.evaluate(
    async ([serif, ps]) => {
      for (const [name, url, weight] of [
        ['SS', serif, '600'],
        ['PS', ps, '700'],
      ]) {
        const f = new FontFace(name!, `url(${url})`, { weight })
        await f.load()
        document.fonts.add(f)
      }
    },
    [font(join(DIR, 'fonts/source-serif-4-latin-600-normal.woff2')), font(join(ROOT, 'src/fonts/public-sans-latin-700-normal.woff2'))],
  )
  for (const mode of Object.keys(MODES) as (keyof typeof MODES)[]) mkdirSync(join(DIR, 'impression', mode), { recursive: true })
  const words = FRONTONS.map((f) => f.word)
  for (const f of FRONTONS)
    for (const [mode, ink] of Object.entries(MODES)) {
      const url = await page.evaluate(render, { word: f.word, all: words, ink, yellow: YELLOW, dark: mode === 'sombre', W })
      const file = join(DIR, 'impression', mode, `fronton-${f.id}.png`)
      await sharp(Buffer.from(url.split(',')[1]!, 'base64'))
        .png({ palette: true, colours: 4, dither: 0, compressionLevel: 9 })
        .toFile(file)
      const size = statSync(file).size
      if (size > MAX_BYTES) throw new Error(`${file} : plus de 10 Mo`)
      console.log(`${mode}/fronton-${f.id}.png ${(size / 1024).toFixed(0)} Ko`)
    }
  await browser.close()
}

/** S'exécute dans la page : fronton triangulaire à double trait, entablement, devise sur une ligne, signature. */
function render(o: { word: string; all: string[]; ink: string; yellow: string; dark: boolean; W: number }) {
  const { W } = o
  const c = document.createElement('canvas')
  const H = Math.round(W * 0.42)
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.strokeStyle = o.ink
  ctx.fillStyle = o.ink
  ctx.lineJoin = 'miter'
  const m = W * 0.02
  const apex = W * 0.03
  const base = W * 0.2
  // Fronton : triangle extérieur épais, triangle intérieur fin
  ctx.lineWidth = W * 0.014
  ctx.beginPath()
  ctx.moveTo(m, base)
  ctx.lineTo(W / 2, apex)
  ctx.lineTo(W - m, base)
  ctx.closePath()
  ctx.stroke()
  const k = W * 0.045
  ctx.lineWidth = W * 0.005
  ctx.beginPath()
  ctx.moveTo(m + k * 2.2, base - k * 0.45)
  ctx.lineTo(W / 2, apex + k)
  ctx.lineTo(W - m - k * 2.2, base - k * 0.45)
  ctx.closePath()
  ctx.stroke()
  // Entablement : deux filets, la devise entre les deux
  const top = base + W * 0.02
  const band = W * 0.11
  ctx.fillRect(m, top, W - 2 * m, W * 0.008)
  ctx.fillRect(m, top + band, W - 2 * m, W * 0.008)
  const setFont = (size: number) => {
    ctx.font = `600 ${size}px SS`
    ctx.letterSpacing = `${0.08 * size}px`
  }
  // Même taille pour tous : la ligne la plus longue de la série tient dans la largeur utile
  setFont(100)
  const gap = 0.6
  const lineW = (w: string) => ctx.measureText('LIBERTÉ').width + ctx.measureText('ÉGALITÉ').width + ctx.measureText(w).width + 2 * gap * 100
  const widest = Math.max(...o.all.map(lineW))
  const size = (100 * (W - 2 * m - W * 0.06)) / widest
  setFont(size)
  const parts = ['LIBERTÉ', 'ÉGALITÉ', o.word]
  const total = parts.reduce((s, p) => s + ctx.measureText(p).width, 0) + 2 * gap * size
  let x = (W - total) / 2
  const baseY = top + band / 2 + size * 0.36
  parts.forEach((p, i) => {
    const w = ctx.measureText(p).width
    if (i === 2) {
      if (o.dark) ctx.fillStyle = o.yellow
      else {
        ctx.fillStyle = o.yellow
        ctx.fillRect(x - size * 0.12, baseY - size * 0.78, w + size * 0.16, size * 0.98)
        ctx.fillStyle = o.ink
      }
    }
    ctx.fillText(p, x, baseY)
    ctx.fillStyle = o.ink
    x += w + gap * size
  })
  // Signature
  const sig = W * 0.022
  ctx.font = `700 ${sig}px PS`
  ctx.letterSpacing = `${0.04 * sig}px`
  ctx.fillText('çavote.fr', m, top + band + W * 0.06)
  // Binarisation : opaque ou vide, encre ou jaune, puis recadrage
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const INK = hex(o.ink)
  const YEL = hex(o.yellow)
  const img = ctx.getImageData(0, 0, W, H)
  const p = img.data
  let minX = W,
    minY = H,
    maxX = 0,
    maxY = 0
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3]! < 128) {
      p[i + 3] = 0
      continue
    }
    const dI = Math.abs(p[i]! - INK[0]!) + Math.abs(p[i + 1]! - INK[1]!) + Math.abs(p[i + 2]! - INK[2]!)
    const dY = Math.abs(p[i]! - YEL[0]!) + Math.abs(p[i + 1]! - YEL[1]!) + Math.abs(p[i + 2]! - YEL[2]!)
    const col = dY < dI ? YEL : INK
    p[i] = col[0]!
    p[i + 1] = col[1]!
    p[i + 2] = col[2]!
    p[i + 3] = 255
    const n = i / 4
    const px = n % W
    const py = (n - px) / W
    if (px < minX) minX = px
    if (px > maxX) maxX = px
    if (py < minY) minY = py
    if (py > maxY) maxY = py
  }
  ctx.putImageData(img, 0, 0)
  const out = document.createElement('canvas')
  out.width = maxX - minX + 1
  out.height = maxY - minY + 1
  out.getContext('2d')!.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height)
  return out.toDataURL('image/png')
}

if (process.argv[1]?.endsWith('boutique-fronton.ts'))
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
