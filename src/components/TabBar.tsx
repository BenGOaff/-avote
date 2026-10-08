'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UI_COPY } from '@/lib/copy'
import { IconHome, IconMore, IconRadar, IconStudio, IconTest } from './Icons'
import { isCurrent } from './TopBar'

const TABS = [
  { href: '/', label: UI_COPY.nav.home, Icon: IconHome },
  { href: '/test', label: UI_COPY.nav.test, Icon: IconTest },
  { href: '/radar', label: UI_COPY.nav.radar, Icon: IconRadar },
  { href: '/studio', label: UI_COPY.nav.studio, Icon: IconStudio },
  { href: '/plus', label: UI_COPY.nav.more, Icon: IconMore },
]

export function TabBar() {
  const pathname = usePathname()
  return (
    <nav className="tabbar" aria-label="Navigation de l’application">
      <ul>
        {TABS.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link href={href} aria-current={isCurrent(pathname, href) ? 'page' : undefined}>
              <span className="tabbar__icon">
                <Icon />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
