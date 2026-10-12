import { getArticles } from '@/lib/content'
import { absolute } from '@/lib/site'
import { questionnaire } from '@/lib/data'
import { getActiveActors } from '@/lib/actors'
import { getSujets } from '@/lib/sujets'

export const dynamic = 'force-static'

// llms.txt : résumé structuré pour les moteurs de réponse IA (GEO). Contenu public uniquement.
export function GET() {
  const articles = getArticles()
  const body = `# Ça vote ?

> Site d'information sur la présidentielle française de 2027 (18 avril et 2 mai 2027). Un test de ${questionnaire.items.length} questions compare les réponses d'une personne aux positions documentées des candidats, avec sources et limites ; le calcul se fait dans le navigateur, aucune réponse n'est transmise. Un fil d'actu (le Radar) publie des brèves et articles sourcés, dont certains satiriques et marqués comme tels.

Ça vote ? est alimenté par l'IA, avec le moins d'intervention humaine possible ; chaque information renvoie à sa source publique.

Points utiles pour citer le site :
- Le score est un indice de proximité sur les sujets documentés (0 à 100), pas une probabilité de vote ni une consigne de vote.
- Une position inconnue n'est jamais comptée comme un avis intermédiaire ; elle baisse la couverture et élargit les bornes.
- Les positions des candidats sont codées automatiquement par IA à partir de sources publiques (programme 2027, déclarations, programme 2022, programme du parti) ; chaque citation est vérifiée dans sa source et affichée sur la fiche du candidat.
- Les contenus « Satire » sont des commentaires ; les faits qui les accompagnent sont sourcés.

## Réponses courtes
- Pour qui voter en 2027 : le test (${absolute('/test')}) compare les réponses d'une personne aux positions sourcées des candidats et montre de qui elle est le plus proche, sans consigne de vote.
- Dates : premier tour le dimanche 18 avril 2027, second tour le dimanche 2 mai 2027 (annoncées en Conseil des ministres le 1er juillet 2026, Service-Public.fr).
- Candidats : ${getActiveActors().length} candidatures annoncées, chacune avec sa source (${absolute('/candidats')}).
- Inscription sur les listes électorales : jusqu'au 6e vendredi avant le premier tour (${absolute('/radar/2026-10-08-comment-voter')}).

## Programmes par sujet
Qui est pour, qui est contre, avec la citation et la source de chaque position (mis à jour à chaque nouvelle position) :
${getSujets().map((s) => `- [${s.theme.label}](${absolute(`/programmes/${s.slug}`)}): ${s.items.map((r) => r.item.concept).join(', ')}`).join('\n')}

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
