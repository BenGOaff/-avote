import Link from 'next/link'
import { AI_NOTICE } from '@/lib/copy'
import { tiquizHref } from './Support'
import { ConsentLink } from './ConsentBanner'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid--3">
        <div>
          <p>
            <strong>Ça vote ?</strong> — çavote.fr
          </p>
          <p className="muted">Ton test se calcule sur ton appareil. Aucune réponse n’est envoyée à nos serveurs.</p>
          <p className="muted">{AI_NOTICE}</p>
          <p className="muted">
            Soutenu par{' '}
            <a href={tiquizHref('pied-de-page')} rel="sponsored noopener" target="_blank">
              Tiquiz
            </a>
            .
          </p>
        </div>
        <ul>
          <li><Link href="/methodologie">Méthode et calculs</Link></li>
          <li><Link href="/sources">Sources</Link></li>
          <li><Link href="/corrections">Corrections</Link></li>
          <li><Link href="/independance">Indépendance et financement</Link></li>
          <li><Link href="/medias">Qui possède ton info</Link></li>
        </ul>
        <ul>
          <li><Link href="/newsletter">Newsletter</Link></li>
          <li><Link href="/boutique">Boutique</Link></li>
          <li><Link href="/confidentialite">Confidentialité</Link></li>
          <li><Link href="/mentions-legales">Mentions légales</Link></li>
          <li><a href="/feed.xml">Flux RSS</a></li>
          <li><ConsentLink /></li>
        </ul>
      </div>
    </footer>
  )
}
