/**
 * Guides pratiques (/voter/<guide>) : une question, la réponse courte, puis les étapes. Tout vient de l'article
 * « Comment voter » (content/radar/2026-10-08-comment-voter.md) et des pages officielles qu'il cite, relues le
 * 14 octobre 2026. Une règle qui change se corrige ici et dans l'article, avec une entrée dans /corrections.
 */
import { FIRST_ROUND, REGISTRATION_DEADLINE, REGISTRATION_DEADLINE_SPECIAL, SECOND_ROUND } from './vote-dates'

const longDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export const dayLabel = (iso: string) => longDate.format(new Date(`${iso}T12:00:00Z`)).replace(/^1 /, '1er ').replace(/ 1 /, ' 1er ')

export interface GuideSource {
  title: string
  publisher: string
  url: string
}
export interface GuideSection {
  title: string
  paras?: string[]
  list?: string[]
  ordered?: boolean
  /** Pages du site qui servent à l'étape décrite */
  links?: { href: string; label: string }[]
}
export interface Guide {
  slug: string
  /** La question telle qu'on la tape (H1) */
  question: string
  metaTitle: string
  description: string
  /** La réponse courte, en tête de page */
  short: string[]
  sections: GuideSection[]
  sources: GuideSource[]
  /** Date de relecture des sources officielles */
  checkedAt: string
}

const SP = 'Service-Public.fr (DILA, Premier ministre)'
const MI = 'Ministère de l’Intérieur'
const CHECKED = '2026-10-14'

const deadline = dayLabel(REGISTRATION_DEADLINE)
const deadlineSpecial = dayLabel(REGISTRATION_DEADLINE_SPECIAL)

export const GUIDES: Guide[] = [
  {
    // La recherche des indécis (« je ne sais pas pour qui voter », « savoir pour qui voter ») : une méthode, pas une consigne
    slug: 'je-ne-sais-pas-pour-qui-voter',
    question: 'Je ne sais pas pour qui voter en 2027 : comment choisir ?',
    metaTitle: 'Je ne sais pas pour qui voter en 2027 : comment choisir, en 5 étapes',
    description: 'Indécis pour la présidentielle 2027 ? Cinq étapes pour choisir sans qu’on choisisse à ta place : tes priorités, le test, les positions sourcées des candidats, la comparaison, la vérification des intox.',
    short: [
      'Pars de ce qui compte pour toi, puis regarde ce que les candidats disent sur ces sujets précis, avec leurs propres mots. Le test Ça vote ? fait cette comparaison en quelques minutes ; la décision reste la tienne.',
      `Le premier tour a lieu le ${dayLabel(FIRST_ROUND)}, le second le ${dayLabel(SECOND_ROUND)}.`,
    ],
    sections: [
      {
        title: 'Cinq étapes pour choisir',
        ordered: true,
        list: [
          'Note les trois sujets qui comptent le plus pour toi : ton salaire, la santé, l’école, le climat, la sécurité, l’immigration…',
          'Fais le test, en version courte ou complète : il te montre de quels candidats tu es proche, sujet par sujet.',
          'Lis les positions des deux ou trois candidats qui ressortent, sur tes trois sujets : chaque position est une phrase du candidat, avec sa source.',
          'Compare-les côte à côte, et regarde lesquels ont changé d’avis.',
          'Vérifie ce que tu as vu passer sur les réseaux avant de t’en servir pour choisir.',
        ],
        links: [
          { href: '/', label: 'Faire le test' },
          { href: '/comparateur', label: 'Comparer les candidats' },
          { href: '/revirements', label: 'Ils ont changé d’avis' },
          { href: '/fake-news', label: 'Les intox vérifiées' },
        ],
      },
      {
        title: 'Ce que le test ne fait pas',
        paras: [
          'Il ne te dit pas pour qui voter : il mesure une proximité à partir des positions publiées par les candidats. Une position absente reste absente, et le résultat te dit ce qui reste à vérifier.',
        ],
        links: [{ href: '/methodologie', label: 'Comment le résultat est calculé' }],
      },
      {
        title: 'Si aucun candidat ne te convient',
        paras: [
          'Une enveloppe vide ou un bulletin sans nom de candidat : c’est un vote blanc. Il est compté parmi les votants, pas parmi les suffrages exprimés.',
        ],
      },
    ],
    sources: [
      { title: 'Présidentielle 2027 : les dates du scrutin', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/actualites/A15053' },
      { title: 'Élections : déroulement du scrutin', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F16828' },
    ],
    checkedAt: CHECKED,
  },
  {
    slug: 'dates-presidentielle-2027',
    question: 'Quand a lieu la présidentielle 2027 ?',
    metaTitle: 'Dates de la présidentielle 2027 : premier et second tour',
    description: `Premier tour le ${dayLabel(FIRST_ROUND)}, second tour le ${dayLabel(SECOND_ROUND)}. La veille dans plusieurs territoires d’outre-mer. Source : Service-Public.fr.`,
    short: [
      `Premier tour le ${dayLabel(FIRST_ROUND)}, second tour le ${dayLabel(SECOND_ROUND)}.`,
      'En Guadeloupe, en Martinique, en Guyane, à Saint-Pierre-et-Miquelon, à Saint-Barthélemy, à Saint-Martin et en Polynésie française, on vote la veille : les samedis 17 avril et 1er mai 2027.',
    ],
    sections: [
      {
        title: 'D’où viennent ces dates',
        paras: [
          'Elles ont été annoncées en Conseil des ministres le 1er juillet 2026. Le décret qui convoque officiellement les électeurs n’est pas encore publié : il doit les confirmer.',
          'Entre les deux tours, quatorze jours, comme le prévoit la Constitution.',
        ],
      },
      {
        title: 'Les dates qui comptent avant le vote',
        list: [
          `S’inscrire sur les listes électorales : au plus tard le ${deadline} (6e vendredi avant le premier tour, date calculée à partir de la règle officielle).`,
          'Faire une procuration : le plus tôt possible, aucune date limite n’est fixée.',
        ],
      },
    ],
    sources: [{ title: 'Présidentielle 2027 : les dates du scrutin', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/actualites/A15053' }],
    checkedAt: CHECKED,
  },
  {
    slug: 'inscription-listes-electorales',
    question: 'Jusqu’à quand s’inscrire sur les listes électorales pour 2027 ?',
    metaTitle: 'Inscription sur les listes électorales 2027 : date limite et démarches',
    description: `Pour la présidentielle 2027, inscription jusqu’au 6e vendredi avant le premier tour, soit le ${deadline}, en ligne comme en mairie. Pièces à fournir et cas particuliers.`,
    short: [
      `Jusqu’au 6e vendredi avant le premier tour, en ligne comme en mairie : pour le premier tour du 18 avril 2027, cela donne le ${deadline}.`,
      'Cette date est calculée à partir de la règle officielle ; le décret de convocation des électeurs doit encore la confirmer. Avant tout, vérifie ton inscription : elle est peut-être déjà faite.',
    ],
    sections: [
      {
        title: '1. Vérifier ton inscription',
        paras: [
          'Le téléservice « Ma situation électorale » dit si ton inscription est faite, où se trouve ton bureau de vote et quel est ton numéro national d’électeur. Remplis les champs exactement comme à l’état civil : commune, nom, tous les prénoms dans l’ordre, sexe, date de naissance.',
          'Recensement citoyen fait à 16 ans ? L’inscription est automatique à 18 ans, dans la commune du recensement. En cas de déménagement depuis, il faut refaire l’inscription.',
        ],
      },
      {
        title: '2. S’inscrire',
        list: [
          'En ligne, sur service-public.gouv.fr : un justificatif d’identité et un justificatif de domicile de moins de 3 mois, numérisés.',
          'En mairie : les mêmes justificatifs et le formulaire cerfa n° 12669. Une autre personne peut s’en charger pour toi.',
          `Par courrier : la mairie doit le recevoir au plus tard le ${deadline}.`,
        ],
      },
      {
        title: 'Les cas où tu as plus de temps',
        paras: [
          `Le délai passe au 10e jour avant le premier tour, soit le ${deadlineSpecial}, si tu as 18 ans sans avoir fait le recensement citoyen, si tu viens de déménager, d’acquérir la nationalité française ou de retrouver ton droit de vote.`,
        ],
      },
    ],
    sources: [
      { title: 'Inscription sur les listes électorales : une date limite unique', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18967' },
      { title: 'Inscription sur les listes électorales : délais', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34240' },
      { title: 'Je vérifie ma situation électorale', publisher: MI, url: 'https://www.elections.interieur.gouv.fr/mes-demarches/je-verifie-ma-situation-electorale' },
      { title: 'Inscription d’office à 18 ans', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1961' },
    ],
    checkedAt: CHECKED,
  },
  {
    slug: 'procuration',
    question: 'Comment faire une procuration pour la présidentielle 2027 ?',
    metaTitle: 'Procuration présidentielle 2027 : comment faire, étape par étape',
    description: 'En ligne sur maprocuration.gouv.fr, puis validation en commissariat ou en gendarmerie, ou tout en ligne avec France Identité. Sans justifier ton absence. Le plus tôt possible.',
    short: [
      'Tu remplis la demande sur maprocuration.gouv.fr avec FranceConnect, puis tu la fais valider en personne dans n’importe quel commissariat ou gendarmerie. Avec une identité numérique France Identité certifiée, tout se fait en ligne.',
      'Pas besoin de justifier ton absence. Aucune date limite officielle : fais-la le plus tôt possible, pour que la mairie la reçoive à temps.',
    ],
    sections: [
      {
        title: 'Qui peut voter à ta place',
        paras: [
          'Une autre personne inscrite sur une liste électorale, pas forcément dans ta commune. Elle vote dans ton bureau de vote à toi. Le jour du vote, elle ne peut détenir qu’une seule procuration établie en France.',
        ],
      },
      {
        title: 'Les étapes',
        ordered: true,
        list: [
          'Note ton numéro national d’électeur et celui de la personne choisie, avec sa date de naissance (téléservice « Ma situation électorale » ou carte électorale).',
          'Remplis la demande sur maprocuration.gouv.fr, avec FranceConnect. Tu reçois une référence par mail.',
          'Va dans un commissariat ou une gendarmerie, n’importe lequel, avec une pièce d’identité et cette référence. Avec France Identité, cette étape se fait en ligne.',
          'Vérifie ensuite dans « Ma situation électorale » que la procuration apparaît.',
        ],
      },
      {
        title: 'Si tu changes d’avis',
        paras: ['Tu peux encore voter toi-même, tant que la personne désignée ne l’a pas fait.'],
      },
    ],
    sources: [
      { title: 'Vote par procuration', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1604' },
      { title: 'Le vote par procuration', publisher: MI, url: 'https://www.elections.interieur.gouv.fr/comprendre-elections/comment-je-vote/vote-par-procuration' },
    ],
    checkedAt: CHECKED,
  },
  {
    slug: 'jour-du-vote',
    question: 'Quels papiers pour voter, et comment ça se passe dans le bureau de vote ?',
    metaTitle: 'Voter en 2027 : pièce d’identité, horaires, déroulé dans le bureau',
    description: 'Pièce d’identité obligatoire dans les communes de 1 000 habitants ou plus, carte électorale facultative, bureaux ouverts de 8 h à 19 h. Le déroulé, étape par étape.',
    short: [
      'Dans une commune de 1 000 habitants ou plus, une pièce d’identité originale est obligatoire. La carte électorale n’est ni une pièce d’identité ni obligatoire.',
      'Les bureaux ouvrent de 8 h à 19 h ; le préfet peut prolonger jusqu’à 20 h au plus tard. Tu votes dans le bureau indiqué sur ta carte électorale.',
    ],
    sections: [
      {
        title: 'Les pièces acceptées',
        paras: [
          'Notamment la carte d’identité et le passeport, valides ou périmés depuis moins de cinq ans, le permis de conduire en cours de validité et la carte Vitale avec photo. Il faut l’original : une photo sur le téléphone ou une photocopie ne sont pas acceptées.',
        ],
      },
      {
        title: 'Dans le bureau de vote',
        ordered: true,
        list: [
          'Prends une enveloppe et plusieurs bulletins, pour que personne ne devine ton choix.',
          'Passe par l’isoloir : c’est obligatoire.',
          'Devant l’urne, présente ta pièce d’identité ; tu glisses toi-même l’enveloppe.',
          'Signe la liste d’émargement.',
        ],
      },
      {
        title: 'Blanc ou nul',
        paras: [
          'Une enveloppe vide ou un bulletin sans nom de candidat : vote blanc. Un bulletin déchiré ou annoté : vote nul. Les deux sont comptés parmi les votants, pas parmi les suffrages exprimés.',
        ],
      },
    ],
    sources: [
      { title: 'Élections : déroulement du scrutin', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F16828' },
      { title: 'Pièces d’identité acceptées pour voter', publisher: SP, url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1361' },
      { title: 'L’électeur le jour du vote', publisher: MI, url: 'https://www.elections.interieur.gouv.fr/comprendre-elections/comment-je-vote/lelecteur-jour-du-vote' },
    ],
    checkedAt: CHECKED,
  },
]

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug)
