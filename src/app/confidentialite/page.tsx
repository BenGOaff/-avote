import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Confidentialité : ce qu’on collecte et ce qu’on ne collecte pas',
  description: 'Tes réponses au test ne quittent pas ton appareil. La newsletter ne conserve que ton email et ton prénom, sans lien avec le test.',
  alternates: { canonical: '/confidentialite' },
}

export default function PrivacyPage() {
  return (
    <div className="container">
      <PageHeader kicker="Confidentialité" title="Ce qu’on sait de toi" lede="Pour le test : rien. Pour la newsletter : ton email et ton prénom, si tu les donnes." />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>Le test</h2>
        <p>
          Tes réponses, tes priorités, tes exigences et tes résultats sont calculés et gardés dans ton navigateur. Ils ne sont envoyés ni à notre serveur, ni à un
          prestataire, ni à une intelligence artificielle. Il n’y a pas de compte. Les opinions politiques sont des données sensibles au sens du RGPD : la
          meilleure protection reste de ne pas les recevoir.
        </p>
        <ul>
          <li>Si tu choisis « ne rien garder », tout s’efface à la fermeture de l’onglet.</li>
          <li>Si tu choisis « garder sur cet appareil », ton profil est stocké dans le navigateur (IndexedDB). Toute personne qui utilise cet appareil peut le voir.</li>
          <li>
            Tu peux tout effacer en un clic depuis <Link href="/mon-profil">Mon profil</Link>.
          </li>
          <li>Les adresses de pages ne contiennent jamais tes réponses ni ton résultat.</li>
          <li>Le studio fabrique les images sur ton appareil ; ta photo et ton texte ne sont pas envoyés.</li>
        </ul>

        <h2 style={{ fontSize: 'var(--h3)' }}>La newsletter</h2>
        <p>
          Nous conservons ton email et, si tu le donnes, ton prénom. Finalité : t’envoyer la lettre. Base légale : ton consentement, retirable à tout moment par le
          lien présent dans chaque envoi. Ton inscription n’est enregistrée qu’après le clic de confirmation. Le site lui-même ne stocke rien : la liste est tenue
          par notre prestataire d’envoi, {LEGAL.emailProvider.name}.
        </p>
        <p>La newsletter n’a aucun lien avec le test. Elle ne sait pas si tu l’as fait, ni ce que tu as répondu, et elle n’est jamais segmentée selon des opinions.</p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Ce qu’il n’y a pas</h2>
        <ul>
          <li>Pas de cookie publicitaire, pas de pixel de réseau social, pas d’enregistrement de session.</li>
          <li>Pas de police, de script ou d’image chargés depuis un autre site.</li>
          <li>Pas de mesure d’audience sur le test, le profil et les résultats.</li>
        </ul>

        <h2 style={{ fontSize: 'var(--h3)' }}>Journaux techniques</h2>
        <p>
          Comme tout serveur web, celui de notre hébergeur ({LEGAL.host.name}) traite ton adresse IP pour acheminer les pages. Le site ne conserve pas ces adresses
          et ne les relie à aucune donnée.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Tes droits</h2>
        <p>
          Accès, rectification, effacement, opposition : écris à <a href={`mailto:${LEGAL.contactEmail}`}>{displayEmail(LEGAL.contactEmail)}</a>. Tu peux aussi
          saisir la CNIL.
        </p>
      </div>
    </div>
  )
}
