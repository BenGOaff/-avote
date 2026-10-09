import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { DonateCard } from '@/components/Donate'

export const metadata: Metadata = {
  title: 'Le projet : pourquoi Ça vote ? existe',
  description: 'Un projet citoyen pour choisir à partir de ce que les candidats proposent vraiment. Une IA code les positions selon des règles publiques, chaque citation est vérifiée dans sa source.',
  alternates: { canonical: '/le-projet' },
}

export default function ProjectPage() {
  return (
    <div className="container">
      <PageHeader
        kicker="Le projet"
        title="Pourquoi Ça vote ? existe"
        lede="Un projet citoyen pour choisir à partir de ce que les candidats proposent, avec des informations dont chaque ligne se vérifie."
      />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>Le constat</h2>
        <p>
          On vote souvent sur une impression : une tête, une petite phrase, le sondage de la veille. Les programmes sont longs, éparpillés, et changent en cours
          de route. Ça vote ? les met côte à côte, sujet par sujet, avec la phrase exacte du candidat et le lien vers l’endroit où il l’a dite.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Ce que fait l’IA</h2>
        <p>
          Une IA lit les programmes, les déclarations et les documents publics, puis code chaque position selon des règles écrites à l’avance, les mêmes pour
          tous les candidats. Une citation n’est publiée que si un programme la retrouve mot pour mot dans la page d’origine. Moins de mains humaines dans le
          codage, c’est moins de place pour les préférences de qui que ce soit, les nôtres comprises.
        </p>
        <p>
          Ce qui reste humain : écrire les règles et les corriger quand elles se trompent. Les règles sont dans la <Link href="/methodologie">méthode</Link>, les
          erreurs dans les <Link href="/corrections">corrections</Link>.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Qui est derrière</h2>
        <p>
          Un projet citoyen, anonyme. L’anonymat a une raison : éviter que le site soit jugé d’après l’âge, le métier ou les opinions de qui l’édite. Ce qui
          compte se vérifie sans nous connaître : les sources, les règles, les calculs.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Ce qu’on ne fait pas</h2>
        <ul>
          <li>Tes réponses au test ne quittent pas ton appareil. Pas de compte, rien à pirater.</li>
          <li>Pas de publicité, pas de revente de données, pas de pistage publicitaire.</li>
          <li>Aucun parti, aucun candidat ne finance le site.</li>
          <li>Pas de consigne de vote. Le test montre des proximités, la décision reste la tienne.</li>
        </ul>

        <h2 style={{ fontSize: 'var(--h3)' }}>Qui paie</h2>
        <p>
          Les dons des lecteurs, le soutien de Tiquiz, un logiciel de quiz, et bientôt une boutique. Aucun de ces soutiens ne touche aux règles ni aux
          résultats : le détail est sur la page <Link href="/independance">Indépendance</Link>.
        </p>
      </div>
      <DonateCard />
      <p className="measure">
        Une erreur, une question, une idée ? <Link href="/contact">Écris-nous</Link>.
      </p>
    </div>
  )
}
