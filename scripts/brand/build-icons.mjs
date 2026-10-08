// Génère les icônes PNG/ICO à partir des SVG maîtres (public/brand).
// Usage : node scripts/brand/build-icons.mjs
import sharp from 'sharp'
import { writeFile, readFile } from 'node:fs/promises'

const fav = await readFile('public/brand/favicon.svg')
const mask = await readFile('public/brand/icon-maskable.svg')
const sym = await readFile('public/brand/symbole.svg')
const app = await readFile('public/brand/icon-app.svg')

const png = (svg, size) => sharp(svg, { density: 1200 }).resize(size, size).png().toBuffer()

await writeFile('public/icons/icon-192.png', await png(app, 192))
await writeFile('public/icons/icon-512.png', await png(app, 512))
await writeFile('public/icons/icon-maskable-512.png', await png(mask, 512))
await writeFile('src/app/apple-icon.png', await png(app, 180))
await writeFile('public/brand/symbole-512.png', await sharp(sym, { density: 1200 }).resize(512, 512).png().toBuffer())

// ICO multi-tailles (entrées PNG, format accepté par tous les navigateurs actuels)
const sizes = [16, 32, 48]
const images = await Promise.all(sizes.map((s) => png(fav, s)))
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = 6 + 16 * sizes.length
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(s, 0)
  e.writeUInt8(s, 1)
  e.writeUInt8(0, 2)
  e.writeUInt8(0, 3)
  e.writeUInt16LE(1, 4)
  e.writeUInt16LE(32, 6)
  e.writeUInt32LE(images[i].length, 8)
  e.writeUInt32LE(offset, 12)
  offset += images[i].length
  return e
})
await writeFile('src/app/favicon.ico', Buffer.concat([header, ...entries, ...images]))
console.log('icônes générées')
