/**
 * Plan du site : une seule source pour le menu du haut, la barre mobile, la page « Plus » et le pied de page.
 * Toute nouvelle page s'ajoute ici, dans sa rubrique ; rien n'est ajouté ailleurs à la main.
 */
import { QUESTION_COUNT } from './question-count'
import { LEGAL } from './legal'

export interface NavItem {
  href: string
  label: string
  desc: string
}
export interface NavSection {
  id: string
  title: string
  items: NavItem[]
}

export const SECTIONS: NavSection[] = [
  {
    id: 'vote',
    title: 'Ton vote',
    items: [
      { href: '/test', label: 'Le test', desc: `${QUESTION_COUNT} questions, tes priorités, tes lignes rouges.` },
      { href: '/resultats', label: 'Mes résultats', desc: 'Ta proximité avec chaque candidat, question par question.' },
      { href: '/voter', label: 'Voter en 2027', desc: 'Dates, inscription, procuration, pièce d’identité : le mode d’emploi.' },
      { href: '/urne', label: 'L’urne', desc: 'Tu sais pour qui tu votes ? Glisse ton bulletin, anonyme.' },
      { href: '/mon-profil', label: 'Mon profil', desc: 'Ce qui est gardé sur ton appareil, export, effacement.' },
    ],
  },
  {
    id: 'campagne',
    title: 'La campagne',
    items: [
      { href: '/candidats', label: 'Candidats', desc: 'Qui se présente, d’où il vient, ce qu’il propose.' },
      { href: '/programmes', label: 'Programmes par sujet', desc: 'Impôts, retraites, santé, climat… qui est pour, qui est contre.' },
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
    title: 'Les médias',
    items: [
      { href: '/medias', label: 'Qui possède ton info', desc: 'Propriétaires, engagements, rappels à l’ordre de l’Arcom.' },
      { href: '/medias/libres', label: 'Les médias libres', desc: 'Ni milliardaire, ni grand groupe, ni État.' },
      { href: '/fake-news', label: 'Fake news', desc: 'Les intox de la campagne, démontées preuve à l’appui.' },
      { href: '/verifier', label: 'Vrai ou faux ?', desc: 'Pose ta question, réponse en une phrase avec la source.' },
    ],
  },
  {
    id: 'jouer',
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

/** Menu du haut (ordinateur) : l'essentiel, une entrée par rubrique ou presque. */
export const TOP_NAV: { href: string; label: string }[] = [
  { href: '/test', label: 'Le test' },
  { href: '/candidats', label: 'Candidats' },
  { href: '/comparateur', label: 'Comparer' },
  { href: '/urne', label: 'L’urne' },
  { href: '/radar', label: 'Radar' },
  { href: '/medias', label: 'Médias' },
  { href: '/quiz', label: 'Quiz' },
  // La boutique prend la place de la méthode (toujours dans le pied de page) dès que la vitrine est ouverte
  LEGAL.shop.open ? { href: '/boutique', label: 'Boutique' } : { href: '/methodologie', label: 'Méthode' },
]
