# Ça vote ?

Média satirique et outil d’exploration politique pour la présidentielle 2027 — **çavote.fr**.

- **Le test** : 42 questions, calcul de proximité avec les positions documentées des candidats, entièrement dans le navigateur. Aucune réponse n’est envoyée au serveur ni à une IA.
- **Le Radar** : fil d’actu et articles courts, sourcés, dans le profil vocal de la marque. Rédigés en brouillon par une veille automatisée, publiés après relecture.
- **Le Studio** : fonds d’écran, photo de profil, posts et stories générés sur l’appareil.
- **PWA** installable, navigation façon application sur mobile.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis compléter
npm run dev                  # http://localhost:3000
npm test                     # moteur de calcul + veille
npm run validate:content     # schéma des contenus
npm run build
```

Node 20.9 ou plus récent (22 recommandé).

## Organisation

| Dossier | Contenu |
|---|---|
| `src/app` | Pages (Next.js App Router) |
| `src/lib/engine` | Moteur de proximité (formules du cahier §10) et tests |
| `src/lib/local-store.ts` | Profil local (IndexedDB / session), export, effacement |
| `src/styles/tokens.css` | Jetons de la charte (couleurs, typo, espacements) |
| `content/questionnaire` | Les 42 questions versionnées (brouillon à valider) |
| `content/corpus` | Positions des candidats : `demo.json` (fictifs), `live.json` (réels, vérifiés) |
| `content/acteurs` | Candidatures annoncées, avec source, publiées une fois vérifiées |
| `content/radar`, `content/fil` | Articles et brèves (Markdown + en-tête YAML) |
| `content/voix/profil-vocal.md` | Profil vocal utilisé par la veille |
| `content/veille` | Flux RSS suivis, état de la veille |
| `scripts/veille.ts` | Robot de veille (RSS → Claude → brouillons) |
| `scripts/brand` | Génération du logo vectoriel et des icônes |
| `docs/` | Déploiement, veille, Tiquiz, décisions à prendre |

## Documentation

- [Déployer sur le serveur (Docker + tunnel Cloudflare)](docs/DEPLOIEMENT-VPS.md)
- [Ancien déploiement Hostinger](docs/DEPLOIEMENT-HOSTINGER.md) (obsolète)
- [La veille automatisée](docs/VEILLE.md)
- [Le quiz Tiquiz](docs/TIQUIZ.md)
- [Ajouter des positions de candidats](docs/CORPUS.md)
- [Décisions à prendre avant le lancement](docs/DECISIONS.md)
- [Sécurité et confidentialité](docs/SECURITE.md)
- [Cahier des charges](docs/references/cahier-des-charges.md) et [charte design et voix](docs/references/charte-design-et-voix.md)

Les fichiers de logo d’origine (raster) sont conservés dans `design/sources/`. Les versions de production, vectorielles, sont dans `public/brand/` et se régénèrent avec `python3 scripts/brand/build_logo.py` puis `node scripts/brand/build-icons.mjs`.
