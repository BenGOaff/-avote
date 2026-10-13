import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { NewsletterForm } from '@/components/NewsletterForm'
import { LEGAL } from '@/lib/legal'

const shop = LEGAL.shop

export const metadata: Metadata = {
  title: 'Boutique',
  description: 'Tee-shirts, mugs, badges et thèmes de téléphone Ça vote ?. Ouverture prochaine.',
  alternates: { canonical: '/boutique' },
}

// Module « non activé » (cahier §17, §28) : aucun prix, aucun paiement, aucun produit fictif.
export default function BoutiquePage() {
  return (
    <div className="container">
      <PageHeader kicker="Boutique" title="Pas encore ouverte." lede="Des tee-shirts, des mugs, des badges et des thèmes pour téléphone sont en préparation. Rien n’est en vente pour l’instant." />
      <div className="measure stack">
        <div className="card card--flat">
          <h2 style={{ fontSize: 'var(--h3)' }}>Ce qui ne changera pas</h2>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>Le test, les sources et la méthode restent gratuits.</li>
            <li>Un achat n’a aucun effet sur les résultats ni sur l’ordre des candidats.</li>
            <li>La boutique ne reçoit jamais tes réponses au test.</li>
            <li>Si tu personnalises un objet, tu verras exactement ce qui part chez le fabricant avant de valider.</li>
            <li>
              Vendu, fabriqué et livré par {shop.maker}, sur sa plateforme {shop.name} ; le site touche une commission par objet.{' '}
              <Link href="/mentions-legales#boutique">Qui vend quoi</Link> · <Link href="/confidentialite#boutique">Tes données</Link>
            </li>
          </ul>
        </div>
        {shop.open && (
          <p>
            <a className="btn btn--highlight" href={shop.url} rel="noopener">
              Ouvrir la boutique
            </a>
          </p>
        )}
        <h2 style={{ fontSize: 'var(--h3)' }}>Être prévenu à l’ouverture</h2>
        <NewsletterForm />
      </div>
    </div>
  )
}
