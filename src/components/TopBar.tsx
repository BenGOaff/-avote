'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { UI_COPY } from '@/lib/copy'
import { getPref, setPref, type ThemePref } from '@/lib/local-store'
import { IconSettings } from './Icons'

const NAV = [
  { href: '/test', label: UI_COPY.nav.test },
  { href: '/radar', label: UI_COPY.nav.radar },
  { href: '/candidats', label: UI_COPY.nav.actors },
  { href: '/studio', label: UI_COPY.nav.studio },
  { href: '/methodologie', label: UI_COPY.nav.method },
  { href: '/mon-profil', label: UI_COPY.nav.profile },
]

export function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
}

export function TopBar({ logo }: { logo: ReactNode }) {
  const pathname = usePathname()
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <Link href="/" className="topbar__logo" aria-label="Ça vote ? — accueil">
          {logo}
        </Link>
        <nav className="topbar__nav" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="topbar__actions">
          <DisplaySettings />
        </div>
      </div>
    </header>
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
