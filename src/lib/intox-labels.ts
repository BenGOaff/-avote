/** Verdicts des intox démontées (sans dépendance serveur : aussi lus par les scripts) */
export type Verdict = 'faux' | 'trompeur' | 'hors-contexte' | 'manipule' | 'ia'

export const VERDICT_LABEL: Record<Verdict, string> = {
  faux: 'Faux',
  trompeur: 'Trompeur',
  'hors-contexte': 'Sorti de son contexte',
  manipule: 'Trafiqué',
  ia: 'Généré par IA',
}
