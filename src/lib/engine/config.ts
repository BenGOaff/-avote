/**
 * Paramètres provisoires du moteur (cahier §10.6, §6, §31).
 * Ce sont des garde-fous de produit à éprouver, pas des constantes scientifiques.
 * Toute modification = nouvelle version publiée dans /methodologie.
 */
export const ENGINE_CONFIG = {
  version: '0.3.0',
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
    /**
     * Couverture mesurée sur les sujets débattus (0.3.0) : une affirmation entre dans la mesure de la couverture
     * si au moins ce tiers des candidats du référentiel s'est prononcé dessus. Un sujet dont presque personne ne parle
     * ne distingue personne ; il compte toujours dans la proximité de ceux qui se sont prononcés.
     */
    minItemActorsShare: 1 / 3,
    /** En dessous de cet écart (points sur 100), l'ordre n'est pas déterminant */
    closeGap: 2,
  },
  dimensions: {
    minAnswered: 3,
    minShare: 0.6,
  },
  /** Nombre maximal de lignes rouges : au-delà, presque chaque candidat en franchit une et le signalement ne distingue plus personne */
  maxRedLines: 5,
  /** Distance d'item à partir de laquelle on parle de désaccord documenté sur une exigence essentielle (2 crans sur 4) */
  redLineDistance: 0.5,
  /** Variation des poids de thème testée dans l'analyse de sensibilité */
  sensitivityFactors: [0.5, 1.5],
}
