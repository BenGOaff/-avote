// Pictogrammes des sept thèmes, au trait, 24 × 24, décoratifs (le nom du thème est toujours écrit à côté).
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
