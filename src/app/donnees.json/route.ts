/**
 * Données ouvertes : questions, positions documentées des candidats et sources, en un seul fichier JSON.
 * Fichier statique, régénéré à chaque déploiement. Aucune donnée de votant n'y figure.
 */
import { liveCorpus, questionnaire } from '@/lib/data'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import faits from '@content/questionnaire/faits.json'

export const dynamic = 'force-static'

export function GET() {
  const body = {
    _note:
      'Ça vote ? — questions du test, positions documentées des candidats (avec citation et source) et faits officiels. Une position absente est une position non documentée, pas un avis intermédiaire. Méthode : /methodologie.',
    methode: ENGINE_CONFIG.version,
    questionnaire,
    faits: (faits as { items: unknown }).items,
    referentiel: { version: liveCorpus.version, actors: liveCorpus.actors, positions: liveCorpus.positions, sources: (liveCorpus as { sources?: unknown }).sources ?? [] },
  }
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': 'inline; filename="cavote-donnees.json"' },
  })
}
