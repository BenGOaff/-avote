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

- Les 42 questions (`content/questionnaire/v0.1.0.json`) : brouillon à faire relire par des personnes de sensibilités différentes.
- Seuils de classement : 28 réponses, 70 % de socle commun, 5 thèmes, 60 % des exigences.
- Seuil d’écart « proche » : 2 points. Seuil de désaccord sur une exigence : 2 crans.
- Critères d’inclusion des candidats avant la liste officielle.

## Reporté (modules non activés)

- **Boutique** : fournisseur print-on-demand, prix, conditions. Page en place sans aucun produit ni paiement.
- **Tendances** (statistiques anonymes) : désactivé tant que le mécanisme de confidentialité n’est pas validé.
- **Observatoire des médias** : page de méthode en place, aucune fiche publiée.
- **Ça change quoi pour moi** : nécessite des règles d’éligibilité sourcées par mesure.
- **Caricatures** : pas de génération d’images de personnes réelles par IA. Proposition : dessins commandés à un·e illustrateur·rice, intégrés au studio comme gabarits.
- **Logo** : version vectorielle reconstruite (`public/brand`). Un passage par un·e graphiste pour l’ajustement optique final est recommandé.
