/**
 * Portraits déposés par la rédaction dans `candidats/` (PNG, JPG ou WebP, nommés « Prénom Nom ») :
 * recadrés en carré 320 px, convertis en WebP dans public/img/candidats/<slug>.webp, puis l'original est supprimé.
 * Lancé par .github/workflows/portraits.yml à chaque dépôt.
 *
 * Usage : npx tsx scripts/portraits.ts
 */
import { existsSync, readdirSync, readFileSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { slugify } from './veille-lib'

const ROOT = process.cwd()
const IN = path.join(ROOT, 'candidats')
const OUT = path.join(ROOT, 'public/img/candidats')
const known = new Set((JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string }[] }).actors.map((a) => a.slug))

async function main() {
  if (!existsSync(IN)) return console.log('Aucun dossier candidats/.')
  const files = readdirSync(IN).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  for (const f of files) {
    const slug = slugify(f.replace(/\.[^.]+$/, ''), 80)
    await sharp(path.join(IN, f)).resize(320, 320, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}.webp`))
    unlinkSync(path.join(IN, f))
    console.log(`${f} → public/img/candidats/${slug}.webp${known.has(slug) ? '' : ' (aucun candidat de ce nom : vérifier l’orthographe du fichier)'}`)
  }
  if (files.length === 0) console.log('Aucun portrait à convertir.')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
