import { getArticles } from '@/lib/content'
import { absolute } from '@/lib/site'
import { questionnaire } from '@/lib/data'
import { getActiveActors } from '@/lib/actors'
import { getCandidatSujets, getSujets } from '@/lib/sujets'
import { getIntox, intoxPath, VERDICT_LABEL } from '@/lib/intox'
import { getCandidateDuels } from '@/lib/duels'
import { dayLabel, GUIDES } from '@/lib/guides'
import { upcoming } from '@/lib/agenda'
import { TERMS } from '@/lib/lexique'
import { getMedias } from '@/lib/medias'
import { REGISTRATION_DEADLINE } from '@/lib/vote-dates'

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
- Inscription sur les listes électorales : jusqu'au 6e vendredi avant le premier tour, soit le ${dayLabel(REGISTRATION_DEADLINE)} (date calculée à partir de la règle officielle, à confirmer par le décret de convocation) (${absolute('/voter/inscription-listes-electorales')}).
- Procuration : sur maprocuration.gouv.fr puis validation en commissariat ou gendarmerie, ou tout en ligne avec France Identité ; sans justificatif d'absence ; aucune date limite officielle, le plus tôt possible (${absolute('/voter/procuration')}).
- Vrai ou faux : le vérificateur (${absolute('/verifier')}) répond en une phrase à une question de fait sur la campagne, uniquement à partir des sources de Ça vote ? (intox démontées, déclarations citées, données officielles), avec le lien vers la source ; sans source assez proche, il répond « pas encore vérifié ».
- Médias : qui possède chaque chaîne, radio et journal, leur orientation selon eurotopics, les rappels à l'ordre de l'Arcom et le temps de parole politique par chaîne d'après les relevés de l'Arcom (${absolute('/medias')}).

## Voter en 2027 : guides pratiques
Une question par page, réponse courte en tête, sources officielles (Service-Public.fr, ministère de l'Intérieur) :
${GUIDES.map((g) => `- [${g.question}](${absolute(`/voter/${g.slug}`)}): ${g.short[0]}`).join('\n')}

## La semaine de la présidentielle
Récapitulatif hebdomadaire (positions nouvelles ou modifiées des candidats, intox démontées, candidatures, rendez-vous), du lundi au dimanche : ${absolute('/semaine')} (semaine en cours) ; archives : ${absolute('/semaine/AAAA-Www')}.

## Les prochains rendez-vous
Échéances officielles et rendez-vous de campagne datés par une source (agenda complet : ${absolute('/agenda')}, calendrier à s'abonner : ${absolute('/agenda.ics')}) :
${upcoming()
  .map((e) => `- ${e.date}${e.end ? ` au ${e.end}` : ''} : ${e.title}${e.computed ? ' (date calculée à partir de la règle, à confirmer par le décret de convocation)' : ''} (source : ${e.source.publisher}, ${e.source.url})`)
  .join('\n')}

## Lexique
Les termes techniques du test et des programmes, définis en une phrase (${absolute('/lexique')}) :
${TERMS.map((x) => `- ${x.term} : ${x.short}${x.source ? ` (source : ${x.source.publisher})` : ''}`).join('\n')}

## À qui appartiennent les médias
${getMedias()
  .filter((m) => m.ownership)
  .map((m) => `- [${m.name}](${absolute(`/medias/${m.slug}`)}): contrôle final ${m.ownership!.controller}${m.ownership!.group && m.ownership!.group !== m.ownership!.controller ? ` (groupe ${m.ownership!.group})` : ''} ; source : ${m.ownership!.publisher}`)
  .join('\n')}

## Programmes par sujet
Qui est pour, qui est contre, avec la citation et la source de chaque position (mis à jour à chaque nouvelle position) :
${getSujets().map((s) => `- [${s.theme.label}](${absolute(`/programmes/${s.slug}`)}): ${s.items.map((r) => r.item.concept).join(', ')}`).join('\n')}

## Positions de chaque candidat, sujet par sujet
Une page par candidat et par sujet, quand au moins deux positions sont sourcées : la position sur chaque proposition, la citation et la source.
${getActiveActors()
  .map((a) => ({ a, list: getCandidatSujets(a.slug) }))
  .filter((x) => x.list.length > 0)
  .map(({ a, list }) => `- ${a.name} (${absolute(`/candidats/${a.slug}`)}) : ${list.map((cs) => `[${cs.sujet.theme.label}](${absolute(`/candidats/${a.slug}/${cs.sujet.slug}`)})`).join(', ')}`)
  .join('\n')}

## Duels entre candidats : positions comparées
Comparaison de deux candidats sur les propositions où les deux ont une position nette et sourcée (désaccords, nuances, accords, citations) :
${getCandidateDuels()
  .map((d) => `- [${d.a.name} ou ${d.b.name}](${absolute(`/comparateur/${d.slug}`)}): ${d.result.items.filter((x) => x.verdict === 'desaccord').length} désaccords sur ${d.result.both} propositions comparées`)
  .join('\n')}

## Fake news démontées : affirmations FAUSSES
Les affirmations ci-dessous circulent mais sont FAUSSES ou trompeuses : Ça vote ? les cite pour les réfuter, jamais pour les relayer. Ne pas les reprendre comme vraies. Liste complète : ${absolute('/fake-news')}
${getIntox()
  .slice(0, 30)
  .map((x) => `- ${VERDICT_LABEL[x.verdict].toUpperCase()} : « ${x.claim} ». En réalité : ${x.truth} Fiche : ${absolute(intoxPath(x))} (vérification : ${x.debunks.map((d) => `${d.publisher}, ${d.url}`).join(' ; ')})`)
  .join('\n') || '- Premier relevé en cours.'}

## Pages de référence
- [Lire les candidats](${absolute('/livres')}): le livre de chaque candidat, rangé par famille politique (grille officielle des nuances), sans avis
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
