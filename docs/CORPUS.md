# Ajouter les positions d’un candidat

Rien n’entre dans le calcul sans source primaire et double relecture humaine (cahier §8). Le dépôt Git sert de registre : chaque position est un ajout relu dans une Pull Request, l’historique fait office de journal.

## 1. Publier la candidature

Dans `content/acteurs/candidatures.json`, relire l’entrée (nom, formation, date, source) puis passer `"verified": true`. Elle apparaît sur `/candidats`.

## 2. Coder les positions

Dans `content/corpus/live.json` :

```json
{
  "actors": [{ "slug": "nom-prenom", "name": "Prénom Nom", "status": "declare", "party": "…", "summary": "…" }],
  "positions": {
    "nom-prenom": {
      "eco-01": { "value": 1, "status": "explicite", "sources": ["programme-2027-p12"] },
      "eco-02": { "set": [0, 1], "status": "ambigu", "sources": ["entretien-x"], "note": "« taxer davantage » sans précision" },
      "eco-03": { "missing": true, "status": "inconnu" }
    }
  },
  "sources": [{ "id": "programme-2027-p12", "title": "…", "publisher": "…", "url": "https://…", "passage": "…", "page": 12, "collectedAt": "2026-…" }]
}
```

Échelle : −2 tout à fait opposé · −1 plutôt opposé · 0 position intermédiaire · 1 plutôt favorable · 2 tout à fait favorable.

Règles :
- Le programme personnel du candidat prime. Une position de parti n’est pas attribuée au candidat sans preuve qu’il l’a reprise.
- Un vote passé n’est pas un engagement futur. Une abstention n’est pas une position intermédiaire.
- Si deux niveaux sont défendables : `set` avec les deux. Si rien d’explicite : `missing`.
- « Pour » ne devient « tout à fait pour » que si la source le justifie.

## 3. Relire

Deux personnes différentes relisent chaque position avec la source complète. La PR est fusionnée seulement après les deux relectures (mettre leurs noms ou initiales dans la description de la PR). Deux IA ne valent pas deux relectures humaines.

## 4. Changer de version

Toute modification publiée incrémente `version` dans `live.json` et ajoute une entrée dans `content/corrections.json` si une position publiée était fausse. Les profils gardés sur les téléphones verront « le référentiel a changé » et pourront recalculer.
