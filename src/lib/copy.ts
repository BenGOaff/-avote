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
    essentialsTitle: 'Tes exigences',
    essentialsLede: 'Coche les questions sur lesquelles un désaccord compterait vraiment pour toi. Elles apparaîtront à part dans les résultats, sans modifier les scores.',
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
    why: 'Pourquoi ce résultat',
  },
  erase: 'Effacer toutes mes données',
  share: 'Préparer une image à partager',
} as const
