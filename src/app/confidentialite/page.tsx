import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail } from '@/lib/legal'
import { ConsentLink } from '@/components/ConsentBanner'

export const metadata: Metadata = {
  title: 'Confidentialité : ce qu’on collecte et ce qu’on ne collecte pas',
  description: 'Tes réponses au test ne quittent pas ton appareil. La newsletter ne conserve que ton email et ton prénom, sans lien avec le test.',
  alternates: { canonical: '/confidentialite' },
}

export default function PrivacyPage() {
  return (
    <div className="container">
      <PageHeader kicker="Confidentialité" title="Ce qu’on sait de toi" lede="Pour le test : rien. Pour la newsletter : ton email et ton prénom, si tu les donnes. Pour la fréquentation : des visites anonymes, si tu l’acceptes. Le meilleur moyen de ne pas perdre tes opinions politiques, c’est de ne jamais les avoir." />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>Le test</h2>
        <p>
          Tes réponses, tes jetons, tes lignes rouges et tes résultats sont calculés et gardés dans ton navigateur. Ils ne sont envoyés ni à notre serveur, ni à un
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
          Nous conservons ton email et, si tu le donnes, ton prénom (<Link href="/donnees">responsable et contact</Link>). Finalité : t’envoyer la lettre. Base légale : ton consentement, retirable à tout moment par le
          lien présent dans chaque envoi. Ton inscription n’est enregistrée qu’après le clic de confirmation. Le site lui-même ne stocke rien : la liste est tenue
          par notre prestataire d’envoi, {LEGAL.emailProvider.name}.
        </p>
        <p>La newsletter n’a aucun lien avec le test. Elle ne sait pas si tu l’as fait, ni ce que tu as répondu, et elle n’est jamais segmentée selon des opinions.</p>

        <h2 id="urne" style={{ fontSize: 'var(--h3)' }}>
          L’urne : un bulletin anonyme, si tu le choisis
        </h2>
        <p>
          L’urne est une consultation en ligne, ouverte à tous et non représentative. Voter est facultatif et n’a aucun lien avec le test. Ton bulletin
          ajoute 1 au compteur du choix que tu as fait : ce compteur ne contient que des nombres, sans date ni identifiant.
        </p>
        <p>
          Pour qu’une même connexion ne vote qu’une fois, on enregistre une empreinte de ton adresse IP, calculée avec une clé secrète : on ne peut
          pas en retrouver l’adresse, et elle est rangée à part, sans ton choix. Les deux enregistrements passent par deux opérations distinctes ;
          ni nous, ni l’hébergeur de la base ne pouvons savoir qui a voté quoi. Les empreintes sont effacées après le second tour. Base de données :
          Supabase, hébergée dans l’Union européenne (Paris). Base légale : ton consentement, exprimé par le clic sur « À l’urne ».
        </p>

        <h2 id="audience" style={{ fontSize: 'var(--h3)' }}>
          Mesure d’audience, seulement si tu l’acceptes
        </h2>
        <p>
          Si tu cliques sur « Accepter » dans le bandeau, Google Analytics mesure la fréquentation du site : pages vues, durée de visite, type d’appareil,
          pays. Avant ton choix, rien n’est chargé. Si tu refuses, rien n’est chargé non plus et le site marche pareil.
        </p>
        <ul>
          <li>Même accepté, il est coupé pendant les questions du test, sur tes résultats, ton profil et le studio. Il ne reçoit jamais tes réponses, ton score ni tes jetons.</li>
          <li>Pas de signaux publicitaires, pas de personnalisation des annonces. Google Analytics n’enregistre pas l’adresse IP.</li>
          <li>Cookies déposés : _ga et _ga_*, 13 mois au plus. Données détaillées conservées 2 mois chez Google Ireland Ltd et Google LLC (États-Unis, transfert encadré par le Data Privacy Framework).</li>
          <li>Base légale : ton consentement. Ton choix est gardé 6 mois sur cet appareil, puis redemandé.</li>
        </ul>
        <p>
          <ConsentLink /> Le retrait efface les cookies de mesure et coupe tout envoi.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Ce qu’il n’y a pas</h2>
        <ul>
          <li>Pas de cookie publicitaire, pas de pixel de réseau social, pas d’enregistrement de session.</li>
          <li>Pas de police ni d’image chargées depuis un autre site. Le seul script extérieur est celui de la mesure d’audience, et seulement si tu l’acceptes.</li>
          <li>Pas de mesure d’audience pendant le test, sur les résultats, le profil et le studio.</li>
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
