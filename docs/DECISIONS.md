# Décisions à prendre avant le lancement

Valeurs provisoires centralisées dans le code et la configuration. Aucune n’est « résolue par défaut » (cahier §31).

## Bloquant pour la mise en ligne

| Sujet | État | Où |
|---|---|---|
| Mentions légales : éditeur, adresse, SIRET, direction de la publication | À compléter | `content/legal.json` |
| Adresse de contact `bonjour@çavote.fr` | À créer (Hostinger Mail) | `content/legal.json` |
| Vérification des 24 candidatures relevées le 8 octobre | À relire une par une | `content/acteurs/candidatures.json` |
| Déclaration d’indépendance (`/independance`) | Texte à valider : chaque phrase doit être vraie | `src/app/independance/page.tsx` |
| Adresse de l’hébergeur dans les mentions légales | À confirmer avec ta facture Hostinger | `content/legal.json` |

## À trancher rapidement

| Sujet | Proposition actuelle |
|---|---|
| Rôle de Tiquiz | Quiz express sans opinion politique (`docs/TIQUIZ.md`). Le test politique reste sur le site. |
| Newsletter : Resend ou Systeme.io | Resend, double opt-in, rien stocké côté site. Si Tiquiz pousse dans Systeme.io, il y aura deux listes. |
| Publication des brèves | PR à relire. Option `VEILLE_AUTOMERGE` disponible. |
| Qui fait la double relecture des positions | Personne désignée pour l’instant : sans deux relecteurs, aucune position réelle ne peut entrer dans le calcul. |

## Méthode (valeurs provisoires, `src/lib/engine/config.ts`)

- Les 96 questions (`content/questionnaire/v0.2.0.json`) : brouillon à faire relire par des personnes de sensibilités différentes.
- Seuils de classement (méthode 0.3.0) : 28 réponses dont la moitié dans 5 thèmes ; un candidat est classé s’il est documenté sur 50 % de tes réponses aux sujets débattus, dans 4 thèmes.
- Seuil d’écart « proche » : 2 points. Seuil de désaccord sur une exigence : 2 crans.
- Critères d’inclusion des candidats avant la liste officielle.

## Reporté (modules non activés)

- **Boutique** : fournisseur print-on-demand, prix, conditions. Page en place sans aucun produit ni paiement.
- **Tendances** (statistiques anonymes) : désactivé tant que le mécanisme de confidentialité n’est pas validé.
- **Observatoire des médias** : page de méthode en place, aucune fiche publiée.
- **Ça change quoi pour moi** : nécessite des règles d’éligibilité sourcées par mesure.
- **Portraits des candidats** (décision de la rédaction, octobre 2026) : illustrations générées par IA, caricature bienveillante dans le style du site, fournies par la rédaction. Conditions : même traitement pour tous (cadrage, expression neutre, aucun trait moqué sur le physique, l’origine ou la santé), mention « Illustration générée par IA » visible sur chaque portrait (AI Act, art. 50), fichiers servis par le site. Logos des partis : fichiers officiels fournis par la rédaction, usage informatif, servis par le site.
- **Logo** : version vectorielle reconstruite (`public/brand`). Un passage par un·e graphiste pour l’ajustement optique final est recommandé.
- **Questionnaire 0.2.0** (octobre 2026) : 96 affirmations en 12 thèmes, pour couvrir la vie de tous les jours (santé, école, logement et transports, animaux et agriculture, droits des personnes LGBT, énergie, médias). L’immigration a son propre thème, séparé de la sécurité, pour ne pas lier les deux sujets par construction. Les 42 affirmations de la 0.1.0 gardent leur texte : les réponses déjà données restent valables. Un thème pèse 1/12 quel que soit son nombre de questions : le nombre d’affirmations ne dit rien de l’importance d’un sujet, ce sont les jetons du votant qui la fixent.
- **Les faits** : sous certaines affirmations, des chiffres et règles de droit officiels (`content/questionnaire/faits.json`), passage copié et lien, vérifiables par `npx tsx scripts/quotes-check.ts content/questionnaire/faits.json`. Hors calcul.
- **Accords rares** : les résultats signalent les sujets tranchés pour le votant où un ou deux candidats seulement sont de son côté, et ceux où personne ne s’est prononcé (`rareAgreements`, `src/lib/engine/scoring.ts`). Hors calcul.
- **Méthode 0.3.0, sujets débattus** (octobre 2026) : avec 96 affirmations, beaucoup de sujets n’ont été abordés que par quelques candidats. Comptés dans la couverture, ils faisaient baisser tout le monde et écartaient du classement les candidats sans programme 2027 complet (Philippe, Attal, Glucksmann, Zemmour), alors que ceux qui publient un programme exhaustif restaient classés. Règle retenue : la couverture se mesure sur les affirmations où au moins un tiers des candidats s’est prononcé ; les autres comptent toujours dans la proximité de ceux qui se sont prononcés et dans les accords rares. Alternative écartée : déduire des positions manquantes (ce que font d’autres tests) ; une donnée absente reste absente.
