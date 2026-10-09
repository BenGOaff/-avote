import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { itemsByTheme, questionnaire } from '@/lib/data'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import { AI_NOTICE } from '@/lib/copy'
import { BLOCS, NUANCE_SOURCE, NUANCE_VALIDATION } from '@/lib/nuances'
import { BlocDot } from '@/components/Nuance'

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
        <p className="small muted">
          Règle de calcul version {ENGINE_CONFIG.version}. Changement du 9 octobre 2026 : la version précédente ne classait que sur les questions où tous les
          candidats avaient une position connue, ce qui empêchait tout classement avec 24 candidatures.
        </p>
        <p>Il faut d’abord assez de réponses : au moins {R.minAnswered} questions sur {questionnaire.items.length}, et la moitié des questions dans au moins {R.minThemesHalfAnswered} thèmes.</p>
        <p>Ensuite, chaque candidat est classé seulement s’il est assez documenté sur tes réponses :</p>
        <ul>
          <li>on connaît sa position sur au moins {R.minActorCoverage * 100} % du poids de tes réponses ;</li>
          <li>ces positions couvrent au moins {R.minActorThemes} thèmes.</li>
        </ul>
        <p>
          Les candidats classés sont rangés selon leur proximité, calculée sur les questions où leur position est connue. Une position codée entre deux niveaux
          (« plutôt » ou « tout à fait » favorable, par exemple) compte pour le milieu de son intervalle. Les candidats moins documentés sont listés à part,
          avec leur proximité mais sans rang. S’il y a moins de deux candidats classables, aucun classement n’est affiché.
        </p>
        <p>
          Limite assumée : deux candidats classés ne sont pas toujours comparés sur exactement les mêmes questions. C’est pourquoi la part de tes réponses
          couverte est affichée à côté de chaque score, avec les bornes. Un écart de moins de {R.closeGap} points est signalé comme non déterminant. On teste
          aussi l’effet d’une variation de ±50 % du poids de chaque thème : si l’ordre s’inverse, le résultat l’indique.
        </p>
        <p>
          <strong>Lignes rouges.</strong> Les questions sur lesquelles tu poses une ligne rouge apparaissent à part pour chaque candidat : « désaccord documenté » si
          l’écart atteint {ENGINE_CONFIG.redLineDistance * 4} crans, « position inconnue » ou « position ambiguë » sinon. Elles ne retirent aucun point et
          n’éliminent aucun candidat.
        </p>
        <p>
          <strong>Lecture visuelle.</strong> Pour chaque candidat, une case par question répondue : proche (0 ou 1 cran d’écart), écart moyen (2 crans), opposé
          (3 ou 4 crans), position ambiguë ou inconnue. Les curseurs du profil sont lus en mots : 0 à 20 « nettement », 20 à 40 « plutôt », 40 à 60 « entre les
          deux », puis l’inverse jusqu’à 100. Ces lectures ne changent aucun calcul.
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

        <h2 id="couleurs">Les couleurs des familles politiques</h2>
        <p>
          Ça vote ? ne place personne lui-même sur l’échiquier. Chaque candidat reçoit la nuance de son parti dans la grille officielle du ministère de
          l’Intérieur, et la couleur de son bloc dans la même grille :{' '}
          <a href={NUANCE_SOURCE.url} rel="noopener noreferrer nofollow" target="_blank">
            instruction du 2 février 2026
          </a>
          , annexes 1 et 3. Le Conseil d’État a rejeté les recours contre ce classement le 27 février 2026 (
          <a href={NUANCE_VALIDATION.url} rel="noopener noreferrer nofollow" target="_blank">
            communiqué
          </a>
          ).
        </p>
        <ul className="legend" style={{ margin: 'var(--s3) 0' }}>
          {BLOCS.map((b) => (
            <li key={b.id} className={`bloc-${b.id}`}>
              <BlocDot bloc={b.id} /> {b.label}
            </li>
          ))}
        </ul>
        <p>
          Les couleurs sont celles qu’on voit d’habitude sur les cartes électorales. Elles sont toujours accompagnées du nom du bloc. Le rouge vif reste
          réservé aux désaccords et aux corrections : la gauche est donc en rose, l’extrême gauche en bordeaux. Quand un parti n’est pas nommé dans la grille,
          on applique sa règle (la nuance « de sensibilité ») et la fiche l’indique : « nuance déduite ». Une personne sans parti indiqué reste non classée.
          La nuance dit d’où vient un candidat ; elle ne dit rien de ses positions, que seul le test compare.
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

        <h2 id="casier">Casier et affaires : ce qui est retenu</h2>
        <p>
          Seules les décisions et étapes officielles qui visent la personne du candidat : condamnations, mises en examen, renvois devant un tribunal,
          jugements frappés d’appel ou de pourvoi, relaxes et non-lieux, sanctions de la Haute Autorité pour la transparence de la vie publique ou du
          Parlement, décisions civiles liées à l’activité publique. Chaque entrée renvoie à une décision officielle ou à un article de presse nationale qui la
          rapporte, avec une citation vérifiée mot pour mot.
        </p>
        <ul>
          <li>Une condamnation n’est dite « définitive » que si plus aucun recours n’est possible ou en cours. Sinon, c’est une procédure en cours, affichée avec la présomption d’innocence.</li>
          <li>Quand l’issue d’un appel n’a pas pu être établie, l’affaire reste « en cours ». Le doute profite à la personne.</li>
          <li>Les relaxes et les non-lieux sont affichés au même rang que les condamnations.</li>
          <li>Ne sont pas retenus : plaintes sans suite judiciaire, enquêtes de presse, ouvertures d’enquête sans mise en examen, affaires visant seulement un proche ou un parti, vie privée.</li>
        </ul>

        <h2 id="votes">Les votes à l’Assemblée</h2>
        <p>
          Pour les candidats députés, les votes nominatifs viennent de l’open data officiel de l’Assemblée nationale : tous les scrutins solennels (les grands
          textes) et toutes les motions de censure de la législature, recopiés tels quels par un programme (scripts/votes-an.ts). « N’a pas voté » veut dire
          que le nom ne figure dans aucune liste du scrutin. Un vote ne devient une position du test que s’il porte exactement sur l’affirmation, avec la
          mention « Vote ».
        </p>

        <h2 id="ia">Ce que fait l’IA, ce qu’elle ne fait pas</h2>
        <p>
          Une IA repère les nouvelles déclarations et candidatures, rédige les brèves à partir des seules pièces collectées, et code les positions des
          candidats. Des contrôles automatiques rejettent toute citation absente de la source, tout chiffre qui n’y figure pas et les tournures interdites.
          L’IA ne reçoit jamais tes réponses au test : ton résultat est calculé sur ton appareil.
        </p>

        <h2 id="medias">Qui possède ton info : comment une fiche est établie</h2>
        <p>
          Chaque fiche dit qui possède le média aujourd’hui et qui décide en dernier ressort : le capital et le contrôle ne sont pas la même chose. La source
          préférée est officielle (site du groupe, rapport annuel, communiqué), sinon un article daté d’un média reconnu, jamais une encyclopédie collaborative.
          Le passage cité doit nommer le propriétaire ; un programme retélécharge la page et vérifie qu’il y figure mot pour mot. Sinon, pas de fiche.
        </p>
        <p>
          L’orientation politique d’un média n’est jamais la nôtre : c’est l’étiquette d’<a href="https://www.eurotopics.net/fr/" rel="noopener noreferrer nofollow" target="_blank">eurotopics</a>,
          l’observatoire de la presse européenne de l’Agence fédérale allemande pour l’éducation civique, citée comme telle. Un média qu’eurotopics ne classe
          pas reste sans étiquette. Les engagements d’un propriétaire se limitent aux faits publics et documentés : mandat, fonction dans un parti, projet ou
          soutien politique qu’il a lui-même annoncé, décision officielle. Pas de qualificatif, pas de supposition sur son influence.
        </p>
        <p>
          « Rappelés à l’ordre » ne retient que les décisions de l’Arcom (et du CSA avant 2022) et du Conseil d’État qui touchent à l’information politique :
          pluralisme, temps de parole, honnêteté et indépendance de l’information, campagnes électorales. Seules les décisions lues sur arcom.fr,
          conseil-etat.fr ou legifrance.gouv.fr comptent. La presse écrite et les sites ne dépendent pas de l’Arcom. Une chaîne sans décision affichée n’est
          pas pour autant « blanchie » : on n’affiche que ce qu’on a trouvé et vérifié. Les fiches sont revues au moins chaque trimestre ; une erreur se
          signale sur <Link href="/corrections">la page des corrections</Link>.
        </p>
      </div>
    </div>
  )
}
