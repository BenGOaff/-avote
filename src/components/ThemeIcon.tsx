// Pictogrammes des thèmes, au trait, 24 × 24, décoratifs (le nom du thème est toujours écrit à côté).
import type { SVGProps } from 'react'

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

const PATHS: Record<string, React.ReactNode> = {
  // Pièces empilées
  eco: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path d="M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
      <path d="M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
    </>
  ),
  // Mallette
  travail: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 13h18M11 13v2h2v-2" />
    </>
  ),
  // Croix de soin dans un cercle
  sante: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  // Livre ouvert
  ecole: (
    <>
      <path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z" />
      <path d="M21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z" />
    </>
  ),
  // Maison
  logement: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  // Passeport
  immigration: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 16h6" />
    </>
  ),
  // Empreinte de patte
  animaux: (
    <>
      <path d="M12 13c-3 0-5 3-5 5 0 1.5 1.5 2 2.5 2 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1 0 2.5-.5 2.5-2 0-2-2-5-5-5z" />
      <circle cx="6" cy="10" r="1.6" />
      <circle cx="9.5" cy="6" r="1.6" />
      <circle cx="14.5" cy="6" r="1.6" />
      <circle cx="18" cy="10" r="1.6" />
    </>
  ),
  // Bouclier
  securite: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  // Bulle de parole
  libertes: (
    <>
      <path d="M4 5h16v11H10l-5 4v-4H4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  // Feuille
  climat: (
    <>
      <path d="M5 19C5 10 11 5 20 5c0 9-5 14-14 14z" />
      <path d="M5 19l8-8" />
    </>
  ),
  // Globe
  europe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  // Urne
  democratie: (
    <>
      <path d="M8 10V4h8v6" />
      <path d="M10 7h4" />
      <rect x="3" y="10" width="18" height="10" rx="1" />
      <path d="M8 13h8" />
    </>
  ),
}

export function ThemeIcon({ theme, ...p }: { theme: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      {PATHS[theme] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}
