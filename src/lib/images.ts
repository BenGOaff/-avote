import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Portraits des candidats (illustrations générées par IA, fournies par la rédaction) et logos des partis.
 * Fichiers servis par le site (public/img) ; si un fichier manque, l'interface affiche un monogramme.
 */
const PUBLIC = path.join(process.cwd(), 'public')
const find = (dir: string, slug: string, exts: string[]) => {
  for (const ext of exts) {
    const rel = `/img/${dir}/${slug}.${ext}`
    if (existsSync(path.join(PUBLIC, rel))) return rel
  }
  return null
}

export const portraitOf = (slug: string) => find('candidats', slug, ['webp', 'png', 'jpg'])
export const logoOf = (partySlug: string) => find('partis', partySlug, ['webp', 'svg', 'png'])
/** Version carrée du logo (pastille), pour les listes. */
export const squareLogoOf = (partySlug: string) => find('partis', `${partySlug}-carre`, ['webp', 'svg', 'png'])
