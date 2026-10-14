/**
 * Fichiers d'impression de la boutique (Spreadshop) à partir de docs/boutique/designs.json.
 *   npx tsx scripts/boutique-impression.ts [id…]
 * Sortie : docs/boutique/impression/clair/<id>.png (encre #191919, produits clairs)
 *          docs/boutique/impression/sombre/<id>.png (encre #FFFDFA, produits foncés)
 * Règles Spreadshop : PNG, fond transparent, aucune semi-transparence, côté le plus long ≥ 4000 px, 10 Mo au plus.
 * D'où : deux couleurs franches (encre + jaune), pixels opaques ou vides, recadrage au plus juste.
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

/** byline : attribution en italique sous le texte (« Jean de La Fontaine, presque. ») */
type Design = { id: string; image?: string; lines: string[]; sig: 'site' | 'verifie'; byline?: string }

const ROOT = process.cwd()
const DIR = join(ROOT, 'docs/boutique')
const { designs } = JSON.parse(readFileSync(join(DIR, 'designs.json'), 'utf8')) as { designs: Design[] }
const only = process.argv.slice(2)
const todo = only.length ? designs.filter((d) => only.includes(d.id)) : designs

const font = (f: string) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'src/fonts', f)).toString('base64')}`
const MODES = { clair: '#191919', sombre: '#FFFDFA' } as const
const YELLOW = '#FFE34D'
const MIN_LONG_SIDE = 4000
const MAX_BYTES = 10 * 1024 * 1024

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined })
  const page = await browser.newPage()
  await page.setContent('<!doctype html><body></body>')
  // tsx garde les noms de fonctions via un assistant __name, absent de la page
  await page.evaluate('window.__name = (f) => f')
  await page.evaluate(
    async ([ab, ps, ssi]) => {
      for (const [name, url, weight] of [
        ['AB', ab, '400'],
        ['PS', ps, '700'],
        ['SSI', ssi, '400'],
      ]) {
        const f = new FontFace(name!, `url(${url})`, { weight })
        await f.load()
        document.fonts.add(f)
      }
    },
    [font('archivo-black-latin-400-normal.woff2'), font('public-sans-latin-700-normal.woff2'), font('source-serif-4-latin-400-italic.woff2')],
  )

  for (const mode of Object.keys(MODES) as (keyof typeof MODES)[]) mkdirSync(join(DIR, 'impression', mode), { recursive: true })

  for (const d of todo) {
    const img = d.image ? `data:image/png;base64,${readFileSync(join(DIR, 'visuels', `${d.image}.png`)).toString('base64')}` : null
    for (const [mode, ink] of Object.entries(MODES)) {
      let scale = 1
      let out: { url: string; w: number; h: number } | null = null
      for (let i = 0; i < 3; i++) {
        out = await page.evaluate(render, { lines: d.lines, byline: d.byline ?? null, img, sig: d.sig, ink, yellow: YELLOW, dark: mode === 'sombre', S: scale })
        const long = Math.max(out.w, out.h)
        if (long >= MIN_LONG_SIDE) break
        scale *= (MIN_LONG_SIDE / long) * 1.01
      }
      const file = join(DIR, 'impression', mode, `${d.id}.png`)
      const buf = Buffer.from(out!.url.split(',')[1]!, 'base64')
      await sharp(buf).png({ palette: true, colours: 4, dither: 0, compressionLevel: 9 }).toFile(file)
      const size = statSync(file).size
      if (size > MAX_BYTES) throw new Error(`${file} : ${size} octets, plus de 10 Mo`)
      console.log(`${mode}/${d.id}.png ${out!.w}×${out!.h} ${(size / 1024).toFixed(0)} Ko`)
    }
  }
  await browser.close()
}

/** S'exécute dans la page : compose sur un canvas, binarise, recadre, renvoie un PNG. */
async function render(o: { lines: string[]; byline: string | null; img: string | null; sig: 'site' | 'verifie'; ink: string; yellow: string; dark: boolean; S: number }) {
  const CW = Math.round(4400 * o.S)
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
  const INK = hex(o.ink)
  const YEL = hex(o.yellow)

  // Dessin : recadré sur son contenu, réduit à deux couleurs (encre, jaune), le blanc devient vide
  let art: HTMLCanvasElement | null = null
  if (o.img) {
    const im = new Image()
    im.src = o.img
    await im.decode()
    const c0 = document.createElement('canvas')
    c0.width = im.naturalWidth
    c0.height = im.naturalHeight
    const x0 = c0.getContext('2d')!
    x0.fillStyle = '#fff'
    x0.fillRect(0, 0, c0.width, c0.height)
    x0.drawImage(im, 0, 0)
    const p0 = x0.getImageData(0, 0, c0.width, c0.height).data
    let minX = c0.width, minY = c0.height, maxX = 0, maxY = 0
    for (let y = 0; y < c0.height; y++)
      for (let x = 0; x < c0.width; x++) {
        const k = (y * c0.width + x) * 4
        if (p0[k]! + p0[k + 1]! + p0[k + 2]! < 690) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    const sw = maxX - minX + 1
    const sh = maxY - minY + 1
    const box = CW * 0.62
    const k = Math.min(box / sw, box / sh)
    art = document.createElement('canvas')
    art.width = Math.round(sw * k)
    art.height = Math.round(sh * k)
    const xa = art.getContext('2d')!
    xa.fillStyle = '#fff'
    xa.fillRect(0, 0, art.width, art.height)
    xa.imageSmoothingQuality = 'high'
    xa.drawImage(c0, minX, minY, sw, sh, 0, 0, art.width, art.height)
    const id = xa.getImageData(0, 0, art.width, art.height)
    const p = id.data
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i]!, g = p[i + 1]!, b = p[i + 2]!
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      const col = r > 170 && g > 140 && b < 160 && r - b > 70 ? YEL : lum < 150 ? INK : null
      if (col) (p[i] = col[0]), (p[i + 1] = col[1]), (p[i + 2] = col[2]), (p[i + 3] = 255)
      else p[i + 3] = 0
    }
    xa.clearRect(0, 0, art.width, art.height)
    xa.putImageData(id, 0, 0)
  }

  // Texte : Archivo Black, taille ajustée à la ligne la plus longue
  const segs = o.lines.map((l) => l.split(/(\*[^*]+\*)/).filter(Boolean).map((t) => ({ t: t.replace(/\*/g, ''), hl: t.startsWith('*') })))
  const meas = document.createElement('canvas').getContext('2d')!
  const setFont = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.font = `400 ${size}px AB`
    ctx.letterSpacing = `${-0.015 * size}px`
  }
  setFont(meas, 100)
  const widest = Math.max(...segs.map((l) => l.reduce((w, s) => w + meas.measureText(s.t).width, 0)))
  const size = Math.min(1100 * o.S, (CW / widest) * 100)
  const lh = 0.98 * size
  const sigSize = CW * 0.022
  const sigText = o.sig === 'verifie' ? 'Vérifié par çavote.fr' : 'çavote.fr'

  const gap = CW * 0.08
  const bySize = size * 0.34
  const H = Math.ceil((art ? art.height + gap : 0) + segs.length * lh + (o.byline ? bySize * 1.8 : 0) + size * 0.3 + gap * 0.7 + sigSize * 1.6)
  const c = document.createElement('canvas')
  c.width = CW
  c.height = H
  const ctx = c.getContext('2d')!
  let y = 0
  if (art) {
    ctx.drawImage(art, 0, 0)
    y = art.height + gap
  }
  setFont(ctx, size)
  ctx.textBaseline = 'alphabetic'
  for (const line of segs) {
    const base = y + size * 0.8
    let x = 0
    for (const s of line) {
      const w = ctx.measureText(s.t).width
      if (s.hl && !o.dark) {
        ctx.fillStyle = o.yellow
        ctx.fillRect(x - size * 0.03, base - size * 0.36, w + size * 0.04, size * 0.46)
      }
      ctx.fillStyle = s.hl && o.dark ? o.yellow : o.ink
      ctx.fillText(s.t, x, base)
      x += w
    }
    y += lh
  }
  if (o.byline) {
    ctx.font = `400 ${bySize}px SSI`
    ctx.letterSpacing = '0px'
    ctx.fillStyle = o.ink
    ctx.fillText(`— ${o.byline}`, 0, y + bySize * 1.2)
    y += bySize * 1.8
  }
  y += size * 0.3 + gap * 0.7
  ctx.font = `700 ${sigSize}px PS`
  ctx.letterSpacing = `${0.04 * sigSize}px`
  ctx.fillStyle = o.ink
  ctx.fillText(sigText, 0, y + sigSize)

  // Binarisation : opaque ou vide, encre ou jaune
  const all = ctx.getImageData(0, 0, c.width, c.height)
  const p = all.data
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3]! < 128) {
      p[i + 3] = 0
      continue
    }
    const dI = Math.abs(p[i]! - INK[0]) + Math.abs(p[i + 1]! - INK[1]) + Math.abs(p[i + 2]! - INK[2])
    const dY = Math.abs(p[i]! - YEL[0]) + Math.abs(p[i + 1]! - YEL[1]) + Math.abs(p[i + 2]! - YEL[2])
    const col = dY < dI ? YEL : INK
    ;(p[i] = col[0]), (p[i + 1] = col[1]), (p[i + 2] = col[2]), (p[i + 3] = 255)
    const n = i / 4
    const px = n % c.width
    const py = (n - px) / c.width
    if (px < minX) minX = px
    if (px > maxX) maxX = px
    if (py < minY) minY = py
    if (py > maxY) maxY = py
  }
  ctx.putImageData(all, 0, 0)
  const out = document.createElement('canvas')
  out.width = maxX - minX + 1
  out.height = maxY - minY + 1
  out.getContext('2d')!.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height)
  return { url: out.toDataURL('image/png'), w: out.width, h: out.height }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
