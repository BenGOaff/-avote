import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { NewsletterForm } from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: 'Qui possède ton info',
  description: 'Propriétaires, financements, gouvernance et lignes éditoriales des médias français, avec les preuves. Rubrique en préparation.',
  alternates: { canonical: '/medias' },
}

export default function MediasPage() {
  return (
    <div className="container">
      <PageHeader
        kicker="Observatoire des médias"
        title="Qui possède ton info"
        lede="Qui possède, qui finance, qui décide, et quels points de vue sont mis en avant. Les liens, les contenus et les preuves."
      />
      <div className="measure stack">
        <div className="alert alert--info">
          <p className="alert__title">Rubrique en préparation.</p>
          <p>Aucune fiche n’est publiée tant que la propriété et le financement ne sont pas établis par des documents (mentions légales, statuts, comptes publiés).</p>
        </div>
        <h2 style={{ fontSize: 'var(--h3)' }}>Ce que contiendra chaque fiche</h2>
        <ul>
          <li><strong>Qui possède</strong> : actionnaires, contrôle, droits de vote, autres médias détenus. Le capital et le contrôle ne sont pas la même chose.</li>
          <li><strong>Qui finance</strong> : abonnements, publicité, aides publiques, dons, prêts. Un prêt n’est pas un chiffre d’affaires.</li>
          <li><strong>Qui décide</strong> : nominations, gouvernance, garanties pour la rédaction.</li>
          <li><strong>Liens politiques établis</strong> : seulement ceux qui sont documentés. L’opinion d’un propriétaire n’est pas transférée au média.</li>
          <li><strong>Ligne observée</strong> : sur un corpus daté et publié, jamais sur une impression.</li>
        </ul>
        <p className="small muted">Pas de note de « manipulation », pas de classement moral des propriétaires. Une information inconnue reste marquée inconnue.</p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Être prévenu à la publication</h2>
        <NewsletterForm />
      </div>
    </div>
  )
}
