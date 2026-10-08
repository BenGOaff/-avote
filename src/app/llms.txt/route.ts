import { getArticles } from '@/lib/content'
import { absolute } from '@/lib/site'
import { questionnaire } from '@/lib/data'

export const dynamic = 'force-static'

// llms.txt : résumé structuré pour les moteurs de réponse IA (GEO). Contenu public uniquement.
export function GET() {
  const articles = getArticles()
  const body = `# Ça vote ?

> Média indépendant sur la présidentielle française de 2027. Un test de ${questionnaire.items.length} questions compare les réponses d'une personne aux positions documentées des candidats, avec sources et limites ; le calcul se fait dans le navigateur, aucune réponse n'est transmise. Un fil d'actu (le Radar) publie des brèves et articles sourcés, dont certains satiriques et marqués comme tels.

Points utiles pour citer le site :
- Le score est un indice de proximité sur les sujets documentés (0 à 100), pas une probabilité de vote ni une consigne de vote.
- Une position inconnue n'est jamais comptée comme un avis intermédiaire ; elle baisse la couverture et élargit les bornes.
- Toute position codée est tirée d'une source primaire et relue par deux personnes.
- Les contenus « Satire » sont des commentaires ; les faits qui les accompagnent sont sourcés.

## Pages de référence
- [Méthode et formules](${absolute('/methodologie')}): questions, échelle, pondération, couverture, bornes, seuils de classement
- [Candidatures annoncées](${absolute('/candidats')}): liste avec la source de chaque annonce
- [Sources](${absolute('/sources')}): toutes les sources citées
- [Corrections](${absolute('/corrections')}): erreurs corrigées et effets
- [Indépendance](${absolute('/independance')}): financement et règles
- [Confidentialité](${absolute('/confidentialite')}): aucune donnée politique collectée

## Articles
${articles.map((a) => `- [${a.title}](${absolute(`/radar/${a.slug}`)}): ${a.dek}`).join('\n')}

## Flux
- [RSS du Radar](${absolute('/feed.xml')})
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
