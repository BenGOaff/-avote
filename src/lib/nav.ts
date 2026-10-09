/**
 * Plan du site : une seule source pour le menu du haut, la barre mobile, la page « Plus » et le pied de page.
 * Toute nouvelle page s'ajoute ici, dans sa rubrique ; rien n'est ajouté ailleurs à la main.
 */
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
      { href: '/test', label: 'Le test', desc: '42 questions, tes priorités, tes lignes rouges.' },
      { href: '/resultats', label: 'Mes résultats', desc: 'Ta proximité avec chaque candidat, question par question.' },
      { href: '/urne', label: 'L’urne', desc: 'Tu sais pour qui tu votes ? Glisse ton bulletin, anonyme.' },
      { href: '/mon-profil', label: 'Mon profil', desc: 'Ce qui est gardé sur ton appareil, export, effacement.' },
    ],
  },
  {
    id: 'campagne',
    title: 'La campagne',
    items: [
      { href: '/candidats', label: 'Candidats', desc: 'Qui se présente, d’où il vient, ce qu’il propose.' },
      { href: '/comparateur', label: 'Comparateur', desc: 'Qui défend quoi, sujet par sujet, citations à l’appui.' },
      { href: '/partis', label: 'Partis', desc: 'Histoire, dirigeants, élus et idées de chaque parti.' },
      { href: '/radar', label: 'Radar', desc: 'Le fil de la campagne, sourcé.' },
      { href: '/radar/2026-10-08-comment-voter', label: 'Comment voter', desc: 'Inscription, pièce d’identité, procuration : le mode d’emploi.' },
    ],
  },
  {
    id: 'medias',
    title: 'Les médias',
    items: [
      { href: '/medias', label: 'Qui possède ton info', desc: 'Propriétaires, engagements, rappels à l’ordre de l’Arcom.' },
      { href: '/medias/libres', label: 'Les médias libres', desc: 'Ni milliardaire, ni grand groupe, ni État.' },
    ],
  },
  {
    id: 'jouer',
    title: 'Jouer et partager',
    items: [
      { href: '/quiz', label: 'Quiz', desc: 'Les règles de l’élection, ton profil de spectateur, qui a dit quoi.' },
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
  { href: '/methodologie', label: 'Méthode' },
]
