import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = { title: 'Plus', robots: { index: false, follow: true } }

const LINKS = [
  ['/mon-profil', 'Mon profil', 'Ce qui est gardé sur ton appareil, export, effacement.'],
  ['/resultats', 'Mes résultats', 'Le détail du calcul, candidat par candidat.'],
  ['/candidats', 'Candidats', 'Qui a annoncé sa candidature, avec la source.'],
  ['/urne', 'L’urne', 'Tu sais pour qui tu votes ? Glisse ton bulletin, anonyme.'],
  ['/radar/2026-10-08-comment-voter', 'Comment voter', 'Inscription, pièce d’identité, procuration : le mode d’emploi.'],
  ['/quiz', 'Quiz', 'Les règles de l’élection, ton profil de spectateur, qui a dit quoi.'],
  ['/medias', 'Qui possède ton info', 'Propriétaires, financements et contrôle des médias.'],
  ['/medias/libres', 'Les médias libres', 'Ni milliardaire, ni grand groupe, ni État.'],
  ['/methodologie', 'Méthode', 'Questions, codage, formules et limites.'],
  ['/sources', 'Sources', 'D’où viennent les positions et les faits.'],
  ['/corrections', 'Corrections', 'Ce qui était faux et ce qui a changé.'],
  ['/newsletter', 'Newsletter', 'La campagne dans ta boîte mail.'],
  ['/boutique', 'Boutique', 'Objets et visuels, sans lien avec ton résultat.'],
  ['/independance', 'Indépendance', 'Qui finance, qui décide.'],
  ['/confidentialite', 'Confidentialité', 'Ce qu’on collecte, et surtout ce qu’on ne collecte pas.'],
  ['/mentions-legales', 'Mentions légales', ''],
] as const

export default function PlusPage() {
  return (
    <div className="container">
      <PageHeader title="Tout Ça vote ?" />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--s2)' }}>
        {LINKS.map(([href, label, desc]) => (
          <li key={href}>
            <Link href={href} className="card card--flat" style={{ display: 'block', textDecoration: 'none', color: 'var(--ink)', padding: 'var(--s4)' }}>
              <strong>{label}</strong>
              {desc && <span className="small muted" style={{ display: 'block' }}>{desc}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
