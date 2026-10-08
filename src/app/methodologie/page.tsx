import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { itemsByTheme, questionnaire } from '@/lib/data'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import { AI_NOTICE } from '@/lib/copy'

export const metadata: Metadata = {
  title: 'Méthode : les questions, le codage et le calcul',
  description:
    'Comment Ça vote ? calcule la proximité entre tes réponses et les positions des candidats à la présidentielle 2027 : questions, échelle, pondération, couverture, bornes et seuils de classement.',
  alternates: { canonical: '/methodologie' },
}

const R = ENGINE_CONFIG.ranking

export default function MethodPage() {
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Le score de Ça vote ? est-il une consigne de vote ?',
        acceptedAnswer: { '@type': 'Answer', text: 'Non. C’est un indice de proximité entre tes réponses et les positions documentées des candidats, question par question. Ce n’est ni une probabilité de vote ni une note de compétence.' },
      },
      {
        '@type': 'Question',
        name: 'Mes réponses au test sont-elles envoyées quelque part ?',
        acceptedAnswer: { '@type': 'Answer', text: 'Non. Le calcul se fait dans le navigateur. Les réponses ne sont envoyées ni au serveur du site, ni à un prestataire, ni à une intelligence artificielle.' },
      },
      {
        '@type': 'Question',
        name: 'Que se passe-t-il quand un candidat n’a pas de position sur une question ?',
        acceptedAnswer: { '@type': 'Answer', text: 'La question est exclue du chiffre central pour ce candidat et la couverture baisse. Deux bornes indiquent le résultat si la position manquante était totalement opposée ou totalement identique à ta réponse.' },
      },
    ],
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <PageHeader kicker="Méthode" title="Comment le calcul fonctionne" lede="Tout ce qu’il faut pour refaire le calcul à la main. Paramètres provisoires, à éprouver." />
      <div className="measure stack" style={{ marginTop: 'var(--s5)' }}>
        <nav aria-label="Sommaire" className="card card--flat small">
          <ol style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li><a href="#principe">Le principe</a></li>
            <li><a href="#questions">Les questions</a></li>
            <li><a href="#calcul">Le calcul</a></li>
            <li><a href="#classement">Quand on classe, quand on ne classe pas</a></li>
            <li><a href="#profil">Le résumé de tes réponses</a></li>
            <li><a href="#acteurs">Qui figure dans la comparaison</a></li>
            <li><a href="#codage">Comment une position est codée</a></li>
            <li><a href="#ia">Ce que fait l’IA, ce qu’elle ne fait pas</a></li>
          </ol>
        </nav>

        <p className="alert alert--info">{AI_NOTICE}</p>

        <h2 id="principe">Le principe</h2>
        <p>
          Tu réponds à {questionnaire.items.length} affirmations. Pour chaque candidat, on regarde sa position documentée sur la même affirmation, avec la même
          échelle. L’écart, question par question, donne une proximité. Rien d’autre n’entre dans le calcul : ni la notoriété, ni les sondages, ni nos opinions.
        </p>

        <h2 id="questions">Les questions</h2>
        <p>
          Version {questionnaire.version}, statut : <strong>{questionnaire.status}</strong>. Sept thèmes de six questions. Chaque question porte sur une seule
          mesure, avec une explication. L’échelle va de « tout à fait opposé » (−2) à « tout à fait favorable » (+2). « Je ne sais pas », « je préfère passer » et
          « cela dépend » sont des réponses manquantes : elles ne comptent pas comme un avis intermédiaire.
        </p>
        {itemsByTheme(questionnaire).map(({ theme, items }) => (
          <details key={theme.id} className="disclosure">
            <summary>
              {theme.label} ({items.length})
            </summary>
            <div>
              <ol className="small" style={{ paddingLeft: '1.2em' }}>
                {items.map((i) => (
                  <li key={i.id} style={{ marginBottom: 'var(--s3)' }}>
                    <strong>{i.text}</strong>
                    <br />
                    {i.explanation}
                    <br />
                    <span className="muted">
                      {i.id} · v{i.version}
                      {i.dimensions && ` · alimente : ${Object.entries(i.dimensions).map(([d, o]) => `${questionnaire.dimensions.find((x) => x.id === d)?.label} (${o > 0 ? '+' : '−'})`).join(', ')}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        ))}

        <h2 id="calcul">Le calcul</h2>
        <p>
          <strong>Proximité d’une question.</strong> Si tu as répondu u et que la position du candidat est c, sur l’échelle de −2 à +2 :
        </p>
        <pre className="card card--flat" style={{ overflowX: 'auto' }}>s = 1 − |u − c| / 4</pre>
        <p>Même réponse : 1. Réponses opposées aux deux extrémités : 0. Un cran d’écart : 0,75.</p>
        <p>
          <strong>Poids.</strong> Les sept thèmes pèsent autant : 1/7 chacun. Le poids d’un thème est réparti entre ses questions. Ajouter des questions à un
          thème ne lui donne donc pas plus de poids. Si tu places tes 10 jetons, le poids d’un thème devient (1 + jetons) / 17 : un thème sans jeton garde un
          poids minimal.
        </p>
        <p>
          <strong>Proximité observée.</strong> Moyenne pondérée des proximités, sur les questions où tu as répondu et où le candidat a une position connue.
          Affichée sur 100.
        </p>
        <p>
          <strong>Couverture.</strong> Part du poids de tes réponses pour laquelle le candidat a une position connue. Un candidat qui ne s’est exprimé que sur trois
          sujets n’est pas comparé comme un candidat qui s’est exprimé sur quarante.
        </p>
        <p>
          <strong>Bornes.</strong> La borne basse suppose que toutes les positions manquantes seraient totalement opposées à toi ; la borne haute, totalement
          identiques. Ce n’est pas un intervalle de confiance : c’est l’étendue de ce que l’on ignore.
        </p>
        <p>
          <strong>Exemple.</strong> Quatre questions de même poids, toutes répondues. Le candidat a une position connue sur trois, avec des proximités de 1 ;
          0,5 et 0. Proximité observée : 50 sur 100. Couverture : 75 %. Bornes : 37,5 et 62,5.
        </p>

        <h2 id="classement">Quand on classe, quand on ne classe pas</h2>
        <p>Un classement n’est affiché que si toutes ces conditions sont réunies :</p>
        <ul>
          <li>tu as répondu à au moins {R.minAnswered} questions sur {questionnaire.items.length}, et à la moitié des questions dans au moins {R.minThemesHalfAnswered} thèmes ;</li>
          <li>les questions où tous les candidats affichés ont une position connue représentent au moins {R.minCommonWeightShare * 100} % du poids de tes réponses ;</li>
          <li>ces questions couvrent au moins {R.minCommonThemes} thèmes ;</li>
          <li>si tu as marqué des exigences, au moins {R.minEssentialCoverage * 100} % d’entre elles sont documentées chez tous.</li>
        </ul>
        <p>
          Sinon, les candidats sont listés par ordre alphabétique, avec la mention « Données insuffisamment comparables pour classer ». Un écart de moins de{' '}
          {R.closeGap} points est signalé comme non déterminant. On teste aussi l’effet d’une variation de ±50 % du poids de chaque thème : si l’ordre s’inverse,
          le résultat l’indique.
        </p>
        <p>
          <strong>Exigences.</strong> Les questions que tu marques comme essentielles apparaissent à part : « désaccord documenté » si l’écart atteint{' '}
          {ENGINE_CONFIG.redLineDistance * 4} crans, « position inconnue » sinon. Elles ne retirent aucun point et n’éliminent aucun candidat.
        </p>

        <h2 id="profil">Le résumé de tes réponses</h2>
        <p>
          Neuf échelles résument tes réponses (intervention économique, redistribution, etc.). Chacune est la moyenne de tes réponses aux questions qui
          l’alimentent, ramenée entre 0 et 100. Il faut au moins {ENGINE_CONFIG.dimensions.minAnswered} réponses et {ENGINE_CONFIG.dimensions.minShare * 100} % des
          questions de l’échelle pour l’afficher. Ces échelles décrivent tes réponses à ce questionnaire, pas ton identité politique.
        </p>

        <h2 id="acteurs">Qui figure dans la comparaison</h2>
        <p>
          Avant la liste officielle du Conseil constitutionnel, on distingue les personnes qui ont annoncé leur candidature, celles qui ont annoncé une démarche,
          et celles qui sont seulement évoquées. Ces dernières n’entrent pas dans la comparaison. Une personne peu documentée reste visible avec un dossier
          incomplet. <Link href="/candidats">La liste et ses sources</Link>
        </p>

        <h2 id="codage">Comment une position est codée</h2>
        <p>
          Une position vient d’un programme, d’une déclaration intégrale, d’un vote ou d’un document officiel, avec le passage exact. Le programme personnel du
          candidat prime ; une position de parti n’est pas attribuée au candidat sans preuve qu’il l’a reprise. Une abstention ou un silence ne valent pas avis
          intermédiaire. Quand une formulation est compatible avec plusieurs niveaux, on garde l’ensemble des niveaux possibles : la question sort alors du chiffre
          central et élargit les bornes.
        </p>
        <p>
          Les positions sont codées automatiquement par une IA, avec les mêmes consignes pour tous les candidats. Ordre de préférence des sources :
          programme 2027, déclarations publiques depuis 2024, programme présidentiel 2022, programme du parti. Chaque position est accompagnée d’une citation
          mot pour mot ; un programme retélécharge la page et vérifie que la citation y figure, sinon la position est marquée inconnue. La source et la
          citation sont affichées sur la fiche de chaque candidat. Le codage automatique peut se tromper sur l’intensité d’une position : si tu vois une
          erreur, signale-la, elle sera corrigée et la correction publiée. <Link href="/sources">Les sources</Link> ·{' '}
          <Link href="/corrections">Les corrections</Link>
        </p>

        <h2 id="ia">Ce que fait l’IA, ce qu’elle ne fait pas</h2>
        <p>
          Une IA repère les nouvelles déclarations et candidatures, rédige les brèves à partir des seules pièces collectées, et code les positions des
          candidats. Des contrôles automatiques rejettent toute citation absente de la source, tout chiffre qui n’y figure pas et les tournures interdites.
          L’IA ne reçoit jamais tes réponses au test : ton résultat est calculé sur ton appareil.
        </p>
      </div>
    </div>
  )
}
