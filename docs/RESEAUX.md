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

Le flux `/social/x.xml` est prêt : texte de 230 caractères au plus, lien compris dans la limite.

- **Avec Zapier ou Make** : même principe, *RSS → X (Twitter) : Create Post*, si l'intégration X est disponible sur ton compte.
- **Publication directe par navigateur automatisé** avec la session du compte : préparée puis retirée en attendant ta décision. Voir la réponse de la session du 10 octobre 2026.

## Réglages (Settings → Secrets and variables → Actions)

| Nom | Rôle |
|---|---|
| `SOCIAL_MAX_PER_DAY` | Publications par jour au plus (défaut 4) |
| `SOCIAL_MODEL` | Modèle de rédaction (défaut : celui de la veille) |
| `SOCIAL_BUDGET_USD` | Plafond de dépense par passage (défaut 0,30 $) |
