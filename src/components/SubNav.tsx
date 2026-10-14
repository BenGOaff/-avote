'use client'
import { NavLink } from './NavLink'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { sectionOf } from '@/lib/nav'

/** « Dans cette rubrique » : les pages voisines de la page en cours, sous la barre du haut, sur tous les écrans. */
export function SubNav() {
  const pathname = usePathname()
  const found = sectionOf(pathname)
  const bar = useRef<HTMLDivElement>(null)
  // Sur téléphone, la page en cours est ramenée dans la partie visible de la barre (sans faire défiler la page)
  useEffect(() => {
    const el = bar.current
    const cur = el?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!el || !cur) return
    const a = el.getBoundingClientRect()
    const c = cur.getBoundingClientRect()
    el.scrollLeft += c.left - a.left - (a.width - c.width) / 2
  }, [pathname])
  if (!found || found.section.items.length < 2) return null
  const { section, current } = found
  return (
    <nav className="subnav" aria-label={`Rubrique : ${section.title}`}>
      <div ref={bar} className="container subnav__inner">
        <span className="subnav__title">{section.title}</span>
        {section.items.map((it) => (
          <NavLink key={it.href} href={it.href} className="subnav__link" aria-current={it.href === current ? 'page' : undefined}>
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
