# Plan visibilité (octobre 2026)

Objectif : être trouvé sur Google, cité par les IA (ChatGPT, Perplexity, Gemini, Claude) et utile à lire pour les humains. Suite de `AUDIT-2026-10.md`.

Principe : une question que les gens posent = une page qui y répond en tête, avec la source. Les pages ne sont générées que quand les données existent. Une donnée absente reste absente : pas de page vide, pas de texte de remplissage.

## Ce que les moteurs et les IA citent
- Une réponse courte en tête de page, en 2 ou 3 phrases, avant le détail.
- Une date de mise à jour visible et vraie.
- Une source par affirmation, et la citation exacte.
- Une page par question précise plutôt qu'une longue page qui répond à tout.
- Des liens entre pages voisines : un candidat vers ses sujets, un sujet vers ses candidats, une intox vers son thème.

## Chantiers, dans l'ordre

| # | Chantier | Requête visée | Règle de génération | État |
|---|---|---|---|---|
| 1 | Une page par intox `/fake-news/<id>` | « est-ce vrai que … » | Toute intox relevée ; verdict dans le titre, jamais l'affirmation seule | fait |
| 2 | « Mis à jour le » sur les fiches candidats, dans le plan du site et en `dateModified` | fraîcheur | Date du dernier codage ou de la dernière relecture ; pas de date si rien n'est daté | fait |
| 3 | Composant « La réponse courte » | extraits Google, citations IA | Réutilisé par les nouvelles pages | fait |
| 4 | Candidat × sujet `/candidats/<slug>/<sujet>` | « que propose X sur l'immigration » | Seulement si au moins 2 positions sourcées sur le sujet | à faire |
| 5 | Duels `/comparateur/<a>-vs-<b>` | « X ou Y », « différence entre X et Y » | Seulement entre candidats qui ont chacun au moins 40 positions et au moins 20 sujets en commun | à faire |
| 6 | Guides pratiques (procuration, inscription, vote blanc…) | « comment faire une procuration 2027 » | Tirés de l'article « Comment voter » et de Service-Public, sources citées | à faire |
| 7 | `llms.txt` et maillage interne | citations IA | Lien vers chaque nouvelle page | au fil des chantiers |

## Ce qu'on ne fait pas
- Pas de texte écrit pour les robots : chaque page doit être utile à lire.
- Pas de page « X ou Y » quand les positions manquent : on n'invente pas de désaccord.
- Pas de date de mise à jour automatique sans changement réel : Google apprend à ignorer les fausses dates.
- Aucune réponse au test dans ces pages : elles sont publiques et identiques pour tout le monde.

## À faire côté hébergement
- Autoriser GPTBot dans le pare-feu Hostinger (hPanel) : il reçoit encore des 429 par moments.
