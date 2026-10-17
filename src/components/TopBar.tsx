'use client'
import { NavLink } from './NavLink'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { sectionOf, SECTIONS, type NavSection } from '@/lib/nav'
import { getPref, setPref, type ThemePref } from '@/lib/local-store'
import { IconBag, IconSettings } from './Icons'
import { UI_COPY } from '@/lib/copy'
import { LEGAL } from '@/lib/legal'

export function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
}

export function TopBar({ logo }: { logo: ReactNode }) {
  const pathname = usePathname()
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <NavLink href="/" className="topbar__logo" aria-label="Ça vote ? — accueil">
          {logo}
        </NavLink>
        <nav className="topbar__nav" aria-label="Navigation principale">
          <NavLink href="/test" className="topbar__cta" aria-current={isCurrent(pathname, '/test') ? 'page' : undefined}>
            Le test
          </NavLink>
          {SECTIONS.map((sec) => (
            <Menu key={sec.id} section={sec} pathname={pathname} />
          ))}
        </nav>
        <div className="topbar__actions">
          {LEGAL.shop.open && (
            <NavLink href="/boutique" className="topbar__shop" aria-current={isCurrent(pathname, '/boutique') ? 'page' : undefined}>
              <IconBag />
              <span>{UI_COPY.boutiqueLink.nav}</span>
            </NavLink>
          )}
          <DisplaySettings />
        </div>
      </div>
    </header>
  )
}

/**
 * Menu déroulant d'une rubrique : s'ouvre au survol (souris), au clic ou au clavier ; Échap, clic ailleurs ou changement de page le ferme.
 */
function Menu({ section, pathname }: { section: NavSection; pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelId = useId()
  const current = sectionOf(pathname)?.current
  const active = section.items.some((it) => it.href === current)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btn.current?.focus()
    }
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const hover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  const later = (v: boolean, ms: number) => {
    if (!hover()) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(v), ms)
  }

  return (
    <div
      ref={ref}
      className="topbar__menu"
      onMouseEnter={() => later(true, 80)}
      onMouseLeave={() => later(false, 220)}
      onBlur={(e) => !ref.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        ref={btn}
        type="button"
        className={`topbar__trigger${active ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {section.short}
      </button>
      {open && (
        <div id={panelId} className="topbar__panel">
          <p className="topbar__panel-title">{section.title}</p>
          <ul>
            {section.items.map((it) => (
              <li key={it.href}>
                <NavLink href={it.href} aria-current={current === it.href ? 'page' : undefined}>
                  <span className="topbar__item">{it.label}</span>
                  {it.desc && <span className="topbar__desc">{it.desc}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function DisplaySettings() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemePref>('auto')
  const [sobre, setSobre] = useState(false)
  const panelId = useId()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTheme(getPref<ThemePref>('theme', 'auto'))
    setSobre(getPref<string>('sobre', 'false') === 'true')
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const applyTheme = (t: ThemePref) => {
    setTheme(t)
    setPref('theme', t)
    if (t === 'auto') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = t
  }
  const applySobre = (s: boolean) => {
    setSobre(s)
    setPref('sobre', String(s))
    if (s) document.documentElement.dataset.sobre = 'true'
    else delete document.documentElement.dataset.sobre
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="icon-btn" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <IconSettings />
        <span className="visually-hidden">Affichage</span>
      </button>
      {open && (
        <div
          id={panelId}
          className="card card--featured"
          style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 'min(300px, calc(100vw - 32px))', zIndex: 60, padding: 'var(--s4)' }}
        >
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 700, marginBottom: 'var(--s2)' }}>Thème</legend>
            <div className="row" role="radiogroup">
              {(['auto', 'light', 'dark'] as const).map((t) => (
                <button key={t} className={`btn btn--small ${theme === t ? '' : 'btn--secondary'}`} role="radio" aria-checked={theme === t} onClick={() => applyTheme(t)}>
                  {t === 'auto' ? 'Auto' : t === 'light' ? 'Clair' : 'Sombre'}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="checkbox" style={{ marginTop: 'var(--s4)' }}>
            <input type="checkbox" checked={sobre} onChange={(e) => applySobre(e.target.checked)} />
            <span>
              <strong>Mode sobre</strong>
              <br />
              <span className="hint">Mêmes informations, sans remarques ni annotations.</span>
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
