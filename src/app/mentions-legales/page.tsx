import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail, orTodo } from '@/lib/legal'

export const metadata: Metadata = { title: 'Mentions légales', alternates: { canonical: '/mentions-legales' } }

export default function LegalPage() {
  return (
    <div className="container">
      <PageHeader title="Mentions légales" />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>Éditeur</h2>
        <dl className="dl">
          <dt>Nom</dt>
          <dd>{orTodo(LEGAL.publisherName)}</dd>
          <dt>Forme</dt>
          <dd>{orTodo(LEGAL.publisherLegalForm)}</dd>
          <dt>Adresse</dt>
          <dd>{orTodo(LEGAL.publisherAddress)}</dd>
          <dt>SIRET</dt>
          <dd>{orTodo(LEGAL.publisherSiret)}</dd>
          <dt>Direction de la publication</dt>
          <dd>{orTodo(LEGAL.publicationDirector)}</dd>
          <dt>Contact</dt>
          <dd>
            <a href={`mailto:${LEGAL.contactEmail}`}>{displayEmail(LEGAL.contactEmail)}</a>
          </dd>
        </dl>
        <h2 style={{ fontSize: 'var(--h3)' }}>Hébergement</h2>
        <p>
          {LEGAL.host.name}, {LEGAL.host.address}.{' '}
          <a href={LEGAL.host.url} rel="noopener noreferrer">
            {LEGAL.host.url.replace('https://', '')}
          </a>
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Satire et droit de réponse</h2>
        <p>
          Les contenus marqués « Satire » sont des commentaires humoristiques sur des propos, des actes ou des promesses publics. Les faits qui les accompagnent
          sont sourcés. Toute personne mise en cause peut exercer son droit de réponse à l’adresse de contact ; la réponse est publiée dans un espace identifié.
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Polices et logiciels</h2>
        <p>
          Polices Archivo Black, Public Sans, Source Serif 4 et Caveat, sous licence SIL Open Font License 1.1, hébergées par le site.
        </p>
      </div>
    </div>
  )
}
