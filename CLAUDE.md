# Consignes pour les agents qui travaillent sur ce dépôt

Ça vote ? est un média en papier crème, encre noire et jaune, avec une construction nette et quelques marques dessinées fixes. Avant toute modification, relire `docs/SECURITE.md` et respecter :

## Confidentialité (non négociable)
- Les réponses au test restent dans le navigateur. Ne jamais créer d’API, de table ou de log qui reçoit des réponses, scores, priorités ou exigences.
- Ne jamais envoyer de réponse de votant à un LLM ou à un service tiers.
- Aucune ressource tierce (police, script, image, analytics) : tout est servi par le site.

## Méthode
- Ne pas modifier scores, corpus ou méthode pour améliorer la présentation. Une donnée absente reste absente.
- Toute formule vient de `src/lib/engine/scoring.ts` et doit garder ses tests verts (`npm test`).
- N’inventer aucune source, candidature ou position. Les données de démonstration utilisent des acteurs fictifs.
- Une fonctionnalité non prête est désactivée et annoncée comme telle, jamais simulée.

## Design
- Couleurs, typos et espacements uniquement via `src/styles/tokens.css`. Pas de couleur ad hoc, pas de nouvelle police, pas d’emoji décoratif, pas de mascotte.
- Composants partagés dans `src/styles/globals.css` et `src/components`. Page de référence : `/design`.
- Mobile d’abord, cibles tactiles de 48 px, focus visible, `prefers-reduced-motion`, mode sombre et mode sobre.

## Écriture
- Textes d’interface dans `src/lib/copy.ts` : une action ou une information, jamais un slogan.
- Humour facultatif, dans `src/lib/humor.ts`, masqué en mode sobre.
- Profil vocal : `content/voix/profil-vocal.md`. Ne jamais écrire que le site est drôle, sérieux, indépendant, cash ou sincère : le prouver.

## Vérifier avant de pousser
`npx tsc --noEmit && npm test && npm run validate:content && npm run build`
