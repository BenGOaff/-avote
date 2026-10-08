/**
 * Paramètres provisoires du moteur (cahier §10.6, §6, §31).
 * Ce sont des garde-fous de produit à éprouver, pas des constantes scientifiques.
 * Toute modification = nouvelle version publiée dans /methodologie.
 */
export const ENGINE_CONFIG = {
  version: '0.1.0',
  status: 'provisoire' as const,
  priorityTokens: 10,
  ranking: {
    minAnswered: 28,
    minThemesHalfAnswered: 5,
    minCommonWeightShare: 0.7,
    minCommonThemes: 5,
    minEssentialCoverage: 0.6,
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
