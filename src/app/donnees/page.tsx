import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail } from '@/lib/legal'

// Page liée depuis les formulaires qui collectent un email (newsletter, alertes, quiz). Non indexée.
export const metadata: Metadata = {
  title: 'Tes données personnelles',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
}

export default function DataPage() {
  const mail = (
    <a href={`mailto:${LEGAL.contactEmail}?subject=Mes%20donn%C3%A9es`}>{displayEmail(LEGAL.contactEmail)}</a>
  )
  return (
    <div className="container">
      <PageHeader kicker="Données personnelles" title="Qui garde ton email, et pourquoi" />
      <div className="measure stack">
        <dl className="dl">
          <dt>Responsable du traitement</dt>
          <dd>{LEGAL.controllerName}</dd>
          <dt>Contact</dt>
          <dd>{mail}</dd>
        </dl>

        <h2 style={{ fontSize: 'var(--h3)' }}>Ce qui est gardé</h2>
        <ul>
          <li>Ton email et, si tu le donnes, ton prénom.</li>
          <li>Les listes auxquelles tu es inscrit : la lettre du lundi, et les alertes « ton résultat peut bouger » si tu as coché la case.</li>
          <li>Pour le quiz : le fait que tu l’as passé. Pas tes réponses, pas ton résultat.</li>
        </ul>
        <p>Jamais tes réponses au test ni ton résultat : ils restent sur ton appareil et ne sont reliés à ton email d’aucune façon.</p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Pour quoi faire, et rien d’autre</h2>
        <p>
          T’envoyer la lettre de Ça vote ?, les alertes si tu les as demandées et, si tu as passé le quiz, des contenus en lien avec la campagne. Ton email
          n’est ni vendu, ni loué, ni cédé, ni échangé. Il ne sert à aucune publicité, pour nous ou pour d’autres, et n’est jamais trié selon des opinions.
        </p>
        <p>
          Base légale : ton consentement. Rien n’est enregistré avant ton clic sur le lien de confirmation ; d’ici là, ton adresse voyage seulement dans ce
          lien, chiffrée.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Où, et comment c’est protégé</h2>
        <p>
          Le site lui-même ne stocke aucun email. La liste est tenue par notre prestataire d’envoi, <a href={LEGAL.emailProvider.url}>{LEGAL.emailProvider.name}</a>,
          qui la conserve aux États-Unis. D’après ses engagements publics :
        </p>
        <ul>
          <li>
            les données sont chiffrées au repos (AES-256) et pendant leur transport (TLS) (<a href="https://resend.com/security">page sécurité de Resend</a>) ;
          </li>
          <li>le prestataire a passé un audit de sécurité SOC 2 Type II ;</li>
          <li>
            le transfert hors de l’Union européenne est encadré par le Data Privacy Framework UE–États-Unis et par les clauses contractuelles types de la
            Commission européenne (<a href="https://resend.com/legal/dpa">accord de traitement des données</a>).
          </li>
        </ul>
        <p>Pour le quiz, l’email est tenu par Systeme.io.</p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Combien de temps</h2>
        <p>
          Jusqu’à ta désinscription, en un clic dans chaque envoi. Ensuite, ton adresse n’est plus utilisée : elle reste seulement marquée « désinscrite » chez
          le prestataire, pour qu’aucun envoi ne reparte. Pour qu’elle soit effacée complètement, écris-nous.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Tes droits</h2>
        <p>
          Accès, rectification, effacement, limitation, opposition, portabilité, et retrait de ton consentement à tout moment : un mail à {mail} suffit. Réponse
          sous un mois au plus. Si la réponse ne te convient pas, tu peux saisir la <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.
        </p>
        <p>
          Le reste du fonctionnement du site (test, notifications, urne, mesure d’audience) est expliqué sur la page <Link href="/confidentialite">Confidentialité</Link>.
        </p>
      </div>
    </div>
  )
}
