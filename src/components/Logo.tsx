import 'server-only'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// SVG maîtres générés par scripts/brand/build_logo.py.
// Les lettres suivent la couleur du texte (encre en clair, crème en sombre) ;
// le signe reste noir sur papier jaune dans tous les thèmes (charte §5).
function inline(file: string) {
  const raw = readFileSync(path.join(process.cwd(), 'public/brand', file), 'utf8')
  return raw.replace('fill="#191919"', 'fill="currentColor"').replace(/<title id="t">/, '<title>').replace(' aria-labelledby="t"', '')
}

const horizontal = inline('logo-horizontal.svg')
const compact = inline('logo-compact.svg')

export function Logo({ variant = 'horizontal', className }: { variant?: 'horizontal' | 'compact'; className?: string }) {
  return <span className={className} style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: variant === 'compact' ? compact : horizontal }} />
}
