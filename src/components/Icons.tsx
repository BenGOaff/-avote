// Pictogrammes au trait, 24 × 24, décoratifs par défaut (aria-hidden).
import type { SVGProps } from 'react'

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export const IconHome = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
)
export const IconTest = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M9 7h11M9 12h11M9 17h11" /><path d="M4 7l1 1 2-2M4 12l1 1 2-2M4 17h3" /></svg>
)
export const IconRadar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h8M8 17h4" /></svg>
)
export const IconStudio = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 16l5-5 4 4 3-3 4 4" /><circle cx="15.5" cy="8.5" r="1.5" /></svg>
)
export const IconMore = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
)
export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={3} {...p}><path d="M5 12l4 4 10-10" /></svg>
)
export const IconSettings = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
)
export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
)
export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconExternal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={16} height={16} {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></svg>
)
export const IconDownload = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 4v11M7 10l5 5 5-5M4 20h16" /></svg>
)
export const IconPeople = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c2.8.4 5 2.8 5 5.8" /></svg>
)
export const IconBallot = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 11h16v9H4z" /><path d="M9 11V4h6v7" /><path d="M8 15h8" /></svg>
)
