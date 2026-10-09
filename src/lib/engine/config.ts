/**
 * Paramètres provisoires du moteur (cahier §10.6, §6, §31).
 * Ce sont des garde-fous de produit à éprouver, pas des constantes scientifiques.
 * Toute modification = nouvelle version publiée dans /methodologie.
 */
export const ENGINE_CONFIG = {
  version: '0.2.0',
  status: 'provisoire' as const,
  priorityTokens: 10,
  ranking: {
    minAnswered: 28,
    /** Version rapide (24 affirmations, deux par thème) : classement indicatif dès 17 réponses (même proportion qu'en 0.2.0 : 10 sur 14) */
    quickMinAnswered: 17,
    minThemesHalfAnswered: 5,
    /** Un candidat n'est classé que s'il a une position (exacte ou entre deux niveaux) sur au moins la moitié du poids de tes réponses… */
    minActorCoverage: 0.5,
    /** … réparties sur au moins 4 thèmes */
    minActorThemes: 4,
    /** En dessous de cet écart (points sur 100), l'ordre n'est pas déterminant */
    closeGap: 2,
  },
  dimensions: {
    minAnswered: 3,
    minShare: 0.6,
  },
  /** Distance d'item à partir de laquelle on parle de désaccord documenté sur une exigence essentielle (2 crans sur 4) */
  redLineDistance: 0.5,
  /** Variation des poids de thème testée dans l'analyse de sensibilité */
  sensitivityFactors: [0.5, 1.5],
}
