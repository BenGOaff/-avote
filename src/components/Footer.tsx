import Link from 'next/link'
import { AI_NOTICE, UI_COPY } from '@/lib/copy'
import { SECTIONS } from '@/lib/nav'
import { tiquizHref } from './Support'
import { DonateLink } from './Donate'
import { ConsentLink } from './ConsentBanner'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p>
            <strong>Ça vote ?</strong> — çavote.fr
          </p>
          <p className="muted">Ton test se calcule sur ton appareil. Aucune réponse n’est envoyée à nos serveurs.</p>
          <p className="muted">{AI_NOTICE}</p>
          <p>
            <strong>{UI_COPY.donate.title}.</strong> <DonateLink />
          </p>
          <p className="muted">
            Soutenu par{' '}
            <a href={tiquizHref('pied-de-page')} rel="sponsored noopener" target="_blank">
              Tiquiz
            </a>
            .
          </p>
        </div>
        {SECTIONS.map((s) => (
          <div key={s.id}>
            <p className="footer__title">{s.title}</p>
            <ul>
              {s.items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href}>{i.label}</Link>
                </li>
              ))}
              {s.id === 'site' && (
                <>
                  <li>
                    <a href="/feed.xml">Flux RSS</a>
                  </li>
                  <li>
                    <ConsentLink />
                  </li>
                </>
              )}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
