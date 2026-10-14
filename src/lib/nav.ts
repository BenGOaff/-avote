/**
 * Plan du site : une seule source pour le menu du haut, la barre mobile, la page « Plus » et le pied de page.
 * Toute nouvelle page s'ajoute ici, dans sa rubrique ; rien n'est ajouté ailleurs à la main.
 */
import { QUESTION_COUNT } from './question-count'

export interface NavItem {
  href: string
  label: string
  desc: string
}
export interface NavSection {
  id: string
  title: string
  /** Libellé court du menu déroulant (ordinateur) */
  short: string
  items: NavItem[]
}

export const SECTIONS: NavSection[] = [
  {
    id: 'vote',
    short: 'Ton vote',
    title: 'Ton vote',
    items: [
      { href: '/test', label: 'Le test', desc: `${QUESTION_COUNT} questions, tes priorités, tes lignes rouges.` },
      { href: '/resultats', label: 'Mes résultats', desc: 'Ta proximité avec chaque candidat, question par question.' },
      { href: '/lexique', label: 'Le lexique', desc: '49.3, RIC, AME, CSG… les mots du test expliqués simplement.' },
      { href: '/voter', label: 'Voter en 2027', desc: 'Dates, inscription, procuration, pièce d’identité : le mode d’emploi.' },
      { href: '/urne', label: 'L’urne', desc: 'Tu sais pour qui tu votes ? Glisse ton bulletin, anonyme.' },
      { href: '/mon-profil', label: 'Mon profil', desc: 'Ce qui est gardé sur ton appareil, export, effacement.' },
    ],
  },
  {
    id: 'campagne',
    short: 'Campagne',
    title: 'La campagne',
    items: [
      { href: '/candidats', label: 'Candidats', desc: 'Qui se présente, d’où il vient, ce qu’il propose.' },
      { href: '/programmes', label: 'Programmes par sujet', desc: 'Impôts, retraites, santé, climat… qui est pour, qui est contre.' },
      { href: '/questions', label: 'Les questions sur les candidats', desc: 'Le plus riche, les condamnations, la télé, les 500 parrainages, pour ou contre.' },
      { href: '/comparateur', label: 'Comparateur', desc: 'Qui défend quoi, sujet par sujet, citations à l’appui.' },
      { href: '/livres', label: 'Lire les candidats', desc: 'Le livre de chaque candidat, rangé par famille politique.' },
      { href: '/partis', label: 'Partis', desc: 'Histoire, dirigeants, élus et idées de chaque parti.' },
      { href: '/radar', label: 'Radar', desc: 'Le fil de la campagne, sourcé.' },
      { href: '/semaine', label: 'La semaine', desc: 'Ce qui a bougé en sept jours : positions, intox, candidatures.' },
      { href: '/agenda', label: 'Les prochains rendez-vous', desc: 'Votes internes, débats, dates limites : à ajouter à ton agenda.' },
      { href: '/radar/2026-10-10-lire-un-sondage', label: 'Lire un sondage', desc: 'Marge d’erreur, quotas, indécis : ce qu’un sondage dit, et ce qu’il ne dit pas.' },
    ],
  },
  {
    id: 'medias',
    short: 'Médias',
    title: 'Les médias',
    items: [
      { href: '/medias', label: 'Qui possède ton info', desc: 'Propriétaires, engagements, rappels à l’ordre de l’Arcom.' },
      { href: '/medias/libres', label: 'Les médias libres', desc: 'Ni milliardaire, ni grand groupe, ni État.' },
      { href: '/medias/youtube', label: 'YouTube', desc: 'Les chaînes qui parlent politique : abonnés, vues, évolution.' },
      { href: '/fake-news', label: 'Fake news', desc: 'Les intox de la campagne, démontées preuve à l’appui.' },
      { href: '/verifier', label: 'Vrai ou faux ?', desc: 'Pose ta question, réponse en une phrase avec la source.' },
    ],
  },
  {
    id: 'jouer',
    short: 'Jouer',
    title: 'Jouer et partager',
    items: [
      { href: '/quiz', label: 'Quiz', desc: 'Ris de ton camp, chambre celui d’en face, teste ta culture citoyenne.' },
      { href: '/duel', label: 'Le duel', desc: 'À deux sur un téléphone : d’accord sur quoi, fâchés sur quoi.' },
      { href: '/studio', label: 'Studio', desc: 'Visuels à partager, fabriqués sur ton téléphone.' },
      { href: '/boutique', label: 'Boutique', desc: 'Objets et visuels, sans lien avec ton résultat.' },
    ],
  },
  {
    id: 'site',
    short: 'Le site',
    title: 'Le site',
    items: [
      { href: '/le-projet', label: 'Le projet', desc: 'Pourquoi ce site existe, qui paie, ce qu’on ne fait pas.' },
      { href: '/methodologie', label: 'Méthode', desc: 'Questions, codage, formules et limites.' },
      { href: '/sources', label: 'Sources', desc: 'D’où viennent les positions et les faits.' },
      { href: '/corrections', label: 'Corrections', desc: 'Ce qui était faux et ce qui a changé.' },
      { href: '/independance', label: 'Indépendance', desc: 'Qui finance, qui décide.' },
      { href: '/newsletter', label: 'Newsletter', desc: 'La campagne dans ta boîte mail.' },
      { href: '/contact', label: 'Contact', desc: 'Une erreur, une question, une idée : écris-nous.' },
      { href: '/confidentialite', label: 'Confidentialité', desc: 'Ce qu’on collecte, et surtout ce qu’on ne collecte pas.' },
      { href: '/mentions-legales', label: 'Mentions légales', desc: '' },
    ],
  },
]


/**
 * Rubrique d'une page, pour la barre « dans cette rubrique » : l'entrée du plan dont l'adresse est le plus long préfixe
 * (une fiche /medias/le-monde appartient aux médias, /candidats/x/y à la campagne). Rien pour l'accueil.
 */
export function sectionOf(pathname: string): { section: NavSection; current: string } | undefined {
  if (pathname === '/') return undefined
  let best: { section: NavSection; current: string } | undefined
  for (const section of SECTIONS)
    for (const it of section.items)
      if ((pathname === it.href || pathname.startsWith(it.href + '/')) && (!best || it.href.length > best.current.length)) best = { section, current: it.href }
  return best
}
