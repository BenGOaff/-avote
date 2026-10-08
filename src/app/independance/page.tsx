import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Indépendance et financement',
  description: 'Qui finance Ça vote ?, qui décide, et ce qui ne peut pas influencer les résultats du test.',
  alternates: { canonical: '/independance' },
}

export default function IndependencePage() {
  return (
    <div className="container">
      <PageHeader kicker="Indépendance" title="Qui paie, qui décide" />
      <div className="measure stack">
        <p>
          Ça vote ? n’est affilié à aucun parti, candidat ou organisation politique et ne reçoit aucun financement politique. Nous avons des opinions ; elles
          n’entrent pas dans les règles de calcul, qui sont publiques.
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>D’où vient l’argent</h2>
        <p>
          Le site sera financé par la vente d’objets et de visuels (<Link href="/boutique">boutique</Link>, pas encore ouverte). Pas de publicité ciblée, pas de
          vente de données, pas de commission liée à un candidat.
        </p>
        <h2 style={{ fontSize: 'var(--h3)' }}>Ce qui ne peut pas acheter une place</h2>
        <ul>
          <li>Aucun achat, partenariat ou don ne modifie un score, un ordre ou une position codée.</li>
          <li>Les mêmes règles de codage s’appliquent à tous les candidats.</li>
          <li>Un lien commercial avec un média serait déclaré sur sa fiche et n’aurait aucun effet sur son dossier.</li>
        </ul>
        <h2 style={{ fontSize: 'var(--h3)' }}>Vérifier</h2>
        <p>
          La méthode, les sources et les corrections sont consultables : <Link href="/methodologie">méthode</Link>, <Link href="/sources">sources</Link>,{' '}
          <Link href="/corrections">corrections</Link>.
        </p>
        <p className="annotation humor" style={{ marginTop: 'var(--s5)' }}>
          On ne sait pas encore pour qui on votera. Pour qui on ne votera pas, ça commence à se préciser.
        </p>
      </div>
    </div>
  )
}
