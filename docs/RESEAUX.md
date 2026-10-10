# Réseaux sociaux

## Ce qui tourne tout seul

Quatre fois par jour, le workflow `.github/workflows/social.yml` lance `scripts/social-plan.ts` :

- **matin** : une *pépite*, c'est-à-dire une mesure qu'un ou deux candidats seulement défendent ou rejettent, avec leur citation vérifiée ; un jour sur trois, une *fracture* (un sujet qui coupe les candidats en deux camps) ;
- **soir** : un *rendez-vous* qui invite au test, à l'urne, au comparateur, aux médias libres ou à l'article sur les sondages, à tour de rôle ;
- **à chaque passage** : un *flash* si une nouvelle brève ou un nouvel article du Radar le mérite (note d'intérêt de 7 sur 10 ou plus).

Il y a au plus 4 publications par jour. Les candidats les moins cités passent en premier, pour que la rotation reste équitable.

Chaque publication passe par les mêmes contrôles que la veille : citations retrouvées dans les pièces, nombres sourcés, tournures interdites. Une relecture vérifie ensuite neutralité et exactitude. Elle est publiée sur le site avec :

- une page, `/social/<id>`, avec la citation, la source et les boutons « Faire le test » et « Glisser un bulletin » ;
- un visuel aux couleurs du site, `/social/<id>/opengraph-image`, avec le portrait du candidat quand un seul est concerné ;
- une ligne dans trois flux : `/social/x.xml`, `/social/facebook.xml`, `/social/linkedin.xml`. Chaque flux donne le texte adapté au réseau, lien compris, et le visuel en pièce jointe.

## Brancher Facebook et LinkedIn (10 minutes, une fois)

Avec Zapier, que tu as déjà, il faut un « Zap » par réseau :

1. **Trigger** : *RSS by Zapier → New Item in Feed*, URL `https://xn--avote-xra.fr/social/facebook.xml`, ou `linkedin.xml` pour l'autre Zap.
2. **Action Facebook** : *Facebook Pages → Create Page Post*. Choisis la page « Ça vote ? ». Message = champ *Description*, lien = champ *Link*.
3. **Action LinkedIn** : *LinkedIn → Create Company Update*. Choisis la page « Ça vote ? ». Comment = champ *Description*, Content URL = champ *Link*.

L'aperçu du lien affiche automatiquement le visuel de la publication. Zapier passe par ses propres applications validées par Facebook et LinkedIn : pas de clé d'API, pas d'application à faire approuver.

Comptes et coûts : la formule gratuite de Zapier compte une tâche par publication et par réseau. Avec 2 à 4 publications par jour sur deux réseaux, le quota gratuit peut ne pas suffire. Dans ce cas, deux possibilités :

- passer par Make (1 000 opérations gratuites par mois, mêmes modules « RSS » puis « Facebook Pages » et « LinkedIn ») ;
- baisser `SOCIAL_MAX_PER_DAY`.

## X

Publication directe, sans l'API officielle (choix de la rédaction, risque de restriction du compte accepté) : `scripts/social-x.ts`, lancé par `social.yml` à chaque passage.

- Un navigateur sans écran reprend la session de @cavote_fr grâce au cookie `auth_token`, rangé dans le secret GitHub `X_AUTH_TOKEN` (`X_CT0` facultatif).
- Il publie le texte X, le lien et le visuel de chaque publication des dernières 24 h, une seule fois (`content/social/_x.json`).
- Sans secret, l'étape est ignorée. Si la session expire, le passage échoue avec « session X expirée » : renouveler le secret. Une capture d'écran de l'échec est jointe au passage (artefact `x-debug`, 3 jours).

## Réglages (Settings → Secrets and variables → Actions)

| Nom | Rôle |
|---|---|
| `SOCIAL_MAX_PER_DAY` | Publications par jour au plus (défaut 4) |
| `SOCIAL_MODEL` | Modèle de rédaction (défaut : celui de la veille) |
| `SOCIAL_BUDGET_USD` | Plafond de dépense par passage (défaut 0,30 $) |
