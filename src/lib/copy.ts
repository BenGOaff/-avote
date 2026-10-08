/**
 * UI_COPY — textes d'interface fonctionnels (charte §19).
 * Simples, sans slogan, sans règle interne transformée en accroche.
 * Les variantes humoristiques vivent dans humor.ts et disparaissent en mode sobre.
 */
export const SITE = {
  name: 'Ça vote ?',
  domain: 'çavote.fr',
  description:
    'Un test pour voir quels candidats à la présidentielle 2027 sont proches de tes réponses, avec les sources et les limites. Et un fil d’actu politique qui ne se prend pas au sérieux, sauf sur les faits.',
}

/** Mention éditoriale publique, voulue par la rédaction */
export const AI_NOTICE =
  'Ça vote ? est alimenté par l’IA, avec le moins d’intervention humaine possible, pour limiter le risque d’influence humaine. Les mêmes règles s’appliquent à tous les candidats, et chaque information renvoie à sa source publique : programmes, déclarations, documents officiels, presse.'

export const UI_COPY = {
  nav: {
    home: 'Accueil',
    test: 'Le test',
    radar: 'Radar',
    actors: 'Candidats',
    studio: 'Studio',
    more: 'Plus',
    profile: 'Mon profil',
    method: 'Méthode',
    shop: 'Boutique',
  },
  home: {
    title: 'Qu’est-ce qui compte pour toi ?',
    lede: '42 questions sur ce que tu veux pour le pays. Ensuite, on regarde qui propose quoi, avec les sources. Tes réponses restent sur ton téléphone.',
    cta: 'Faire le test',
    ctaSecondary: 'Lire le fil d’actu',
    duration: 'Environ 10 minutes. Tu peux passer les questions.',
  },
  test: {
    start: 'Commencer',
    next: 'Suivante',
    back: 'Précédente',
    skip: 'Je préfère passer',
    dontKnow: 'Je ne sais pas',
    depends: 'Cela dépend',
    dependsHint: 'Si tu veux, précise de quoi (reste sur ton appareil) :',
    scale: ['Tout à fait opposé', 'Plutôt opposé', 'Position intermédiaire', 'Plutôt favorable', 'Tout à fait favorable'] as const,
    chapterDone: 'Chapitre terminé',
    continue: 'Continuer',
    prioritiesTitle: 'Qu’est-ce qui pèse le plus pour toi ?',
    prioritiesLede: 'Répartis 10 jetons entre les sept thèmes. Tu peux aussi garder une répartition égale.',
    redLine: 'Ligne rouge',
    redLineOn: 'Ligne rouge posée',
    redLineHint: 'Un désaccord sur ce point compterait vraiment pour toi. Il sera signalé à part dans les résultats, sans changer les scores.',
    scaleAgainst: 'Contre',
    scaleFor: 'Pour',
    tokensLeft: (n: number) => (n === 0 ? 'Tous tes jetons sont posés' : `${n} jeton${n > 1 ? 's' : ''} à poser`),
    tokensHelp: 'Touche un thème pour y poser un jeton, ou fais glisser un jeton dessus. Touche « − » pour le reprendre.',
    tokensEqual: 'Garder une répartition égale',
    tokensReset: 'Reprendre tous les jetons',
    seeResults: 'Voir mes résultats',
  },
  storage: {
    title: 'Où vont tes réponses ?',
    body: 'Nulle part. Le calcul se fait dans ton navigateur. Rien n’est envoyé à nos serveurs ni à une IA.',
    session: 'Ne rien garder après fermeture',
    sessionHint: 'Tout s’efface quand tu fermes l’onglet.',
    local: 'Garder sur cet appareil',
    localHint: 'Pour reprendre plus tard et voir ce qui change pendant la campagne. Si l’appareil est partagé, préfère l’autre option. Vider les données du navigateur efface aussi ton profil.',
  },
  results: {
    title: 'Voilà ce qui ressort de tes réponses.',
    scoreLabel: 'Proximité sur les sujets documentés',
    notComparable: 'Données insuffisamment comparables pour classer.',
    alphabetical: 'Liste par ordre alphabétique, pas par préférence.',
    close: 'Écart de moins de 2 points : l’ordre n’est pas déterminant.',
    sensitive: 'Ordre sensible aux hypothèses : en faisant varier un peu le poids des thèmes, le classement change.',
    unknown: 'On n’a pas trouvé de position explicite sur ce point.',
    why: 'Le détail, question par question',
    cardTitle: 'Ta carte d’électeur',
    cardTraits: 'Ce qui ressort le plus de tes réponses',
    cardMatch: 'Le plus proche de tes réponses',
    cardNoMatch: 'Pas encore assez de positions communes pour désigner un candidat plus proche.',
    lean: { strong: 'Nettement', mild: 'Plutôt', middle: 'Pile entre les deux' },
    leanNote: 'Lecture : 0 à 20 « nettement », 20 à 40 « plutôt », 40 à 60 « entre les deux », puis l’inverse vers 100.',
    agreement: { proche: 'proche (0 ou 1 cran d’écart)', moyen: 'écart moyen (2 crans)', oppose: 'opposé (3 ou 4 crans)', ambigu: 'position ambiguë', inconnu: 'position inconnue' },
    closeOn: 'Proches sur',
    farOn: 'Opposés sur',
    redLines: 'Tes lignes rouges',
    redLineStatus: { desaccord: 'désaccord documenté', inconnu: 'position inconnue', ambigu: 'position ambiguë, désaccord possible', accord: 'pas de désaccord' },
    tie: 'Ex æquo',
    gaugeLegend: 'Noir : proximité sur les positions connues. Jaune : la fourchette possible tant que des positions manquent.',
  },
  consent: {
    title: 'Un cookie ? Seulement pour compter.',
    body: 'Si tu acceptes, Google Analytics mesure la fréquentation du site : pages vues, durée de visite, type d’appareil, pays. Il est coupé pendant le test, sur tes résultats, ton profil et le studio : il ne voit jamais tes réponses. Si tu refuses, tout marche pareil.',
    details: 'Choix gardé 6 mois sur cet appareil, modifiable en bas de chaque page. Les données sont traitées par Google, aux États-Unis, dans le cadre du Data Privacy Framework.',
    humor: 'On ne vend rien. On veut juste savoir si quelqu’un nous lit.',
    accept: 'Accepter',
    refuse: 'Refuser',
    more: 'Détails',
    manage: 'Cookies : changer d’avis',
  },
  erase: 'Effacer toutes mes données',
  share: 'Préparer une image à partager',
} as const
