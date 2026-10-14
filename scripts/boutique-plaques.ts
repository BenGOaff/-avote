/**
 * Série « Plaques de rue » de la boutique : la plaque émaillée parisienne (fond bleu, cadre vert, lettres blanches),
 * une voie par camp, même gabarit pour tous. Arrondissement fictif : « 2027e Arrt ».
 *   npx tsx scripts/boutique-plaques.ts
 * Sortie : docs/boutique/impression/couleur/plaque-<id>.png (PNG transparent, ≥ 4000 px, couleurs pleines).
 */
import { mkdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = process.cwd()
const DIR = join(ROOT, 'docs/boutique')
export const PLAQUES = [
  { id: 'gratuite', camp: 'Gauche radicale', type: 'RUE', name: 'DE LA GRATUITÉ' },
  { id: 'ecole-publique', camp: 'Gauche', type: 'PLACE', name: 'DE L’ÉCOLE PUBLIQUE' },
  { id: 'biodiversite', camp: 'Écologistes', type: 'VOIE VERTE', name: 'DE LA BIODIVERSITÉ' },
  { id: 'compromis', camp: 'Centre', type: 'ROND-POINT', name: 'DU COMPROMIS' },
  { id: 'merite', camp: 'Droite', type: 'AVENUE', name: 'DU MÉRITE' },
  { id: 'nation', camp: 'Patriotes', type: 'PLACE', name: 'DE LA NATION' },
]
/** Couleurs des plaques émaillées de Paris (propres à cette série, hors charte du site) */
const BLUE = '#1F3B82'
const GREEN = '#2E6E4C'
const WHITE = '#FFFFFF'
const W = 4400
const MAX_BYTES = 10 * 1024 * 1024

const font = (f: string) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'src/fonts', f)).toString('base64')}`

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined })
  const page = await browser.newPage()
  await page.setContent('<!doctype html><body></body>')
  await page.evaluate('window.__name = (f) => f')
  await page.evaluate(async (ps) => {
    const f = new FontFace('PS', `url(${ps})`, { weight: '700' })
    await f.load()
    document.fonts.add(f)
  }, font('public-sans-latin-700-normal.woff2'))
  mkdirSync(join(DIR, 'impression', 'couleur'), { recursive: true })
  const names = PLAQUES.map((p) => p.name)
  for (const p of PLAQUES) {
    const url = await page.evaluate(render, { type: p.type, name: p.name, all: names, W, BLUE, GREEN, WHITE })
    const file = join(DIR, 'impression', 'couleur', `plaque-${p.id}.png`)
    const { writeFileSync } = await import('node:fs')
    writeFileSync(file, Buffer.from(url.split(',')[1]!, 'base64'))
    const size = statSync(file).size
    if (size > MAX_BYTES) throw new Error(`${file} : plus de 10 Mo`)
    console.log(`couleur/plaque-${p.id}.png ${(size / 1024).toFixed(0)} Ko`)
  }
  await browser.close()
}

/** S'exécute dans la page : plaque arrondie, cadre vert à filet blanc, cartouche d'arrondissement, type de voie, nom. */
function render(o: { type: string; name: string; all: string[]; W: number; BLUE: string; GREEN: string; WHITE: string }) {
  const { W } = o
  const H = Math.round(W * 0.42)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const round = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    ctx.fillStyle = fill
    ctx.fill()
  }
  // Cadre vert, filet blanc, fond bleu
  round(0, 0, W, H, W * 0.035, o.GREEN)
  round(W * 0.018, W * 0.018, W - W * 0.036, H - W * 0.036, W * 0.025, o.WHITE)
  round(W * 0.024, W * 0.024, W - W * 0.048, H - W * 0.048, W * 0.021, o.BLUE)
  ctx.fillStyle = o.WHITE
  ctx.textAlign = 'center'
  const setFont = (size: number, spacing = 0.02) => {
    ctx.font = `700 ${size}px PS`
    ctx.letterSpacing = `${spacing * size}px`
  }
  // Cartouche d'arrondissement : « 2027e Arrt »
  const cs = W * 0.034
  setFont(cs)
  const label = '2027e ARRt'
  const cw = ctx.measureText(label).width + cs * 1.6
  const cx = W / 2 - cw / 2
  const cy = H * 0.12
  ctx.strokeStyle = o.WHITE
  ctx.lineWidth = W * 0.004
  ctx.beginPath()
  ctx.roundRect(cx, cy, cw, cs * 1.7, cs * 0.85)
  ctx.stroke()
  ctx.fillText(label, W / 2, cy + cs * 1.2)
  // Type de voie (petit) puis nom (grand), même taille de nom pour toute la série
  setFont(W * 0.05, 0.08)
  ctx.fillText(o.type, W / 2, H * 0.5)
  setFont(100, 0.01)
  const widest = Math.max(...o.all.map((n) => ctx.measureText(n).width))
  const size = Math.min(W * 0.11, (100 * W * 0.86) / widest)
  setFont(size, 0.01)
  ctx.fillText(o.name, W / 2, H * 0.5 + size * 1.3)
  return c.toDataURL('image/png')
}

if (process.argv[1]?.endsWith('boutique-plaques.ts'))
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
