import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { exampleQuestions } from '@/lib/verifier'
import { VerifierForm } from './VerifierForm'

const t = UI_COPY.verifier

export const metadata: Metadata = {
  title: 'Vrai ou faux ? Le vérificateur de la présidentielle 2027',
  description:
    'Pose ta question sur la campagne : on cherche dans les intox démontées par les fact-checkeurs, les déclarations des candidats, les données officielles et les propriétaires des médias, et on répond en une phrase avec la source.',
  alternates: { canonical: '/verifier' },
}

export const revalidate = 3600

export default function VerifierPage() {
  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <section className="section measure">
        <VerifierForm examples={exampleQuestions()} />
      </section>

      <section className="section measure" aria-labelledby="comment">
        <h2 id="comment" style={{ fontSize: 'var(--h3)' }}>
          {t.how}
        </h2>
        <ol className="stack" style={{ paddingLeft: 'var(--s5)' }}>
          <li>
            On cherche d’abord dans nos sources : les <Link href="/fake-news">intox démontées</Link> par les cellules de fact-checking, les déclarations des
            candidats citées mot pour mot, le <Link href="/radar">fil de la campagne</Link>, les données officielles des quiz et du test, les{' '}
            <Link href="/medias">propriétaires des médias</Link>.
          </li>
          <li>Rien d’assez proche : on te le dit, sans inventer. Pas de recherche sur le web, pas de réponse de mémoire.</li>
          <li>
            Sinon, un petit modèle d’IA lit les passages trouvés et tranche en une phrase : oui, non, c’est plus compliqué, ou question d’opinion.
          </li>
          <li>
            Avant affichage, un programme vérifie que la citation figure mot pour mot dans la source et qu’aucun chiffre n’a été ajouté. Sinon, tu vois
            les passages, sans verdict.
          </li>
        </ol>
        <p className="small muted">
          <Link href="/methodologie#verifier">Méthode détaillée</Link> · <Link href="/confidentialite#verifier">Ce que devient ta question</Link> ·{' '}
          <Link href="/fake-news">Les fake news démontées</Link>
        </p>
      </section>
    </div>
  )
}
