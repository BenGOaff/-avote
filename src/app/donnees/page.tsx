import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail } from '@/lib/legal'

// Page liée uniquement depuis les formulaires qui collectent un email (newsletter, quiz). Non indexée.
export const metadata: Metadata = {
  title: 'Tes données personnelles',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
}

export default function DataPage() {
  return (
    <div className="container">
      <PageHeader kicker="Données personnelles" title="Qui garde ton email, et pourquoi" />
      <div className="measure stack">
        <dl className="dl">
          <dt>Responsable du traitement</dt>
          <dd>{LEGAL.controllerName}</dd>
          <dt>Contact</dt>
          <dd>
            <a href={`mailto:${LEGAL.contactEmail}?subject=Mes%20donn%C3%A9es`}>{displayEmail(LEGAL.contactEmail)}</a>
          </dd>
        </dl>
        <h2 style={{ fontSize: 'var(--h3)' }}>Ce qui est gardé</h2>
        <ul>
          <li>Ton email et, si tu le donnes, ton prénom.</li>
          <li>Pour le quiz : le fait que tu l’as passé. Pas tes réponses, pas ton résultat.</li>
        </ul>
        <h2 style={{ fontSize: 'var(--h3)' }}>Pour quoi faire</h2>
        <p>T’envoyer la lettre de Ça vote ? et, si tu as passé le quiz, des contenus en lien avec la campagne. Base légale : ton consentement.</p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Où et combien de temps</h2>
        <p>
          Chez nos prestataires d’envoi ({LEGAL.emailProvider.name} ; Systeme.io pour le quiz), jusqu’à ta désinscription. Un lien de désinscription figure dans
          chaque envoi.
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Tes droits</h2>
        <p>
          Accès, rectification, effacement, opposition : un mail à l’adresse ci-dessus suffit. Tu peux aussi saisir la CNIL. Le reste du fonctionnement du site
          est expliqué sur la page <Link href="/confidentialite">Confidentialité</Link>.
        </p>
      </div>
    </div>
  )
}
