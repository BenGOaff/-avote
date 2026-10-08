import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail, orTodo } from '@/lib/legal'

export const metadata: Metadata = { title: 'Mentions légales', alternates: { canonical: '/mentions-legales' } }

export default function LegalPage() {
  return (
    <div className="container">
      <PageHeader kicker="Mentions légales" title="Qui publie, qui héberge, qui répond" lede="La page la moins drôle du site. C’est son rôle : ici, tout est vrai et vérifiable." />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>Qui publie</h2>
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
        <h2 style={{ fontSize: 'var(--h3)' }}>Qui héberge</h2>
        <p>
          {LEGAL.host.name}, {LEGAL.host.address}.{' '}
          <a href={LEGAL.host.url} rel="noopener noreferrer">
            {LEGAL.host.url.replace('https://', '')}
          </a>
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Satire, IA et droit de réponse</h2>
        <p>
          Les contenus marqués « Satire » se moquent des propos, des actes et des promesses publics, pas des personnes. Les faits qui les accompagnent sont
          sourcés. Les caricatures sont signalées comme telles. Les textes et le codage des positions sont produits par une IA à partir de sources publiques.
          Toute personne mise en cause peut exercer son droit de réponse à l’adresse de contact : la réponse est publiée dans un espace identifié, et toute
          erreur établie est corrigée sur la page <a href="/corrections">Corrections</a>.
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Polices et logiciels</h2>
        <p>
          Polices Archivo Black, Public Sans, Source Serif 4 et Caveat, sous licence SIL Open Font License 1.1, hébergées par le site.
        </p>
      </div>
    </div>
  )
}
