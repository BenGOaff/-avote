# La veille automatisée

## Ce qu’elle fait

Six fois par jour (≈ 7 h, 10 h, 13 h, 16 h, 19 h, 22 h), le workflow `.github/workflows/veille.yml` :

1. lit les 15 flux de `content/veille/sources.json` (médias de sensibilités variées, institutions) ;
2. écarte ce qu’il a déjà vu ;
3. demande à Claude de regrouper les reprises d’une même info et de garder les plus utiles (6 maximum par passage) ;
4. fait rédiger une brève par info, dans le profil vocal (`content/voix/profil-vocal.md`), **à partir des seuls titres et chapôs des flux** ;
5. rejette automatiquement toute brève dont une citation n’est pas dans la source, dont un nombre n’apparaît pas dans la source, ou qui contient une tournure interdite ;
6. ouvre une **Pull Request** avec les brouillons. Une fois par jour (passage de 16 h), il propose aussi un article court.

L’état des flux (`content/veille/status.json`) est publié directement : le site affiche « surveillance interrompue » si la collecte tombe en panne.

## Candidats et programmes : suivis tout seuls

- **Annonces et retraits.** À chaque passage, la veille repère dans les flux les annonces de candidature et les retraits. Elle ne retient que ceux dont la phrase est retrouvée dans la source et qui nomment la personne. Le changement est publié directement dans `content/acteurs/candidatures.json`, sans PR. Un candidat retiré sort aussitôt des résultats, du comparateur et de l'urne ; sa fiche reste en ligne avec la mention « Candidature retirée ».
- **Nouveau candidat.** La recherche de ses positions (`positions.yml`) part dans la foulée, sans attendre le passage du lundi.
- **Programme publié.** Chaque matin, `programmes.yml` (`scripts/programmes.ts`, sans IA) relit les sites officiels listés dans le champ `links` de chaque candidat. Il relance la recherche de positions de ce candidat (tous les thèmes, en lisant d'abord la page qui a changé) dans deux cas : un nouveau PDF apparaît, ou une page programme gagne au moins 12 phrases nouvelles. Trois candidats au plus sont relancés par jour, et chacun au plus une fois tous les 14 jours.
- **Positions.** Elles sont publiées directement quand tous les contrôles sont verts : citation retrouvée dans la source, contrôle de pertinence, schéma, tests. Pour revenir à la relecture par PR, crée la variable `POSITIONS_AUTOMERGE` = `false`.
- **Nouveau site officiel.** Un nouveau candidat ajouté par la veille n'a pas encore de lien `links`. Ajoute son site de campagne dans `candidatures.json` pour que le guetteur de programmes le suive.

## Ton rôle

Sur GitHub (l’app mobile suffit) :

- ouvre la PR, lis chaque brouillon et **ouvre sa source** ;
- pour écarter un brouillon : supprime le fichier dans la PR ;
- pour corriger : modifie le fichier ;
- **fusionne** : le site se redéploie et les brèves sont en ligne en 2 à 3 minutes.

Une PR non fusionnée n’est jamais publiée. Tu peux fermer une PR entière.

## Réglages (Settings → Secrets and variables → Actions)

| Nom | Type | Rôle |
|---|---|---|
| `ANTHROPIC_API_KEY` | secret | Clé API Claude (obligatoire) |
| `VEILLE_MODEL` | variable | Modèle, par défaut `claude-opus-5-5` |
| `VEILLE_EFFORT` | variable | `low`, `medium` (défaut) ou `high` |
| `VEILLE_MAX` | variable | Nombre de brèves maximum par passage (défaut 6) |
| `VEILLE_AUTOMERGE` | variable | `true` pour publier les brèves sans relecture (déconseillé, voir ci-dessous) |
| `POSITIONS_AUTOMERGE` | variable | `false` pour relire les positions par PR avant publication (par défaut : publication directe si les contrôles sont verts) |

Et dans **Settings → Actions → General** : cocher *Allow GitHub Actions to create and approve pull requests* et *Read and write permissions*.

## Pourquoi pas de publication 100 % automatique par défaut

Tu es directrice de publication. Une brève fausse ou une satire mal calibrée sur une personne réelle engage ta responsabilité (diffamation, période électorale). Les contrôles automatiques réduisent fortement le risque d’invention, sans l’annuler. La relecture prend une à deux minutes par PR.

Si tu actives `VEILLE_AUTOMERGE`, seules les **brèves** partent sans relecture ; les articles restent toujours en PR.

## Coût

Par passage : un appel de tri (≈ 10 000 jetons d’entrée) et jusqu’à six appels de rédaction, avec réflexion à effort `medium`. Estimation avec `claude-opus-5-5` (4 $ / 20 $ par million de jetons, consigne système mise en cache) : **de l’ordre de 2 à 5 $ par jour** pour six passages et un article. C’est une estimation, à vérifier dans la console Anthropic après une semaine. Pour réduire : `VEILLE_MAX=4`, `VEILLE_EFFORT=low`, ou `VEILLE_MODEL=claude-sonnet-5-5` (prix divisé par deux, qualité à comparer sur quelques jours).

## Ajouter un flux

Vérifier l’URL (réponse 200, RSS valide), les conditions d’utilisation du média, et l’équilibre de l’ensemble des flux. Seuls le titre, le chapô et le lien sont utilisés ; aucun article n’est recopié.

## Tester en local

```bash
npx tsx scripts/veille.ts --dry-run        # collecte seule, sans appel à Claude
ANTHROPIC_API_KEY=… npx tsx scripts/veille.ts --max=2
```
