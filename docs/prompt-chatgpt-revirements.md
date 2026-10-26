# Prompt ChatGPT : les revirements des candidats

À coller en entier dans une nouvelle conversation (ChatGPT avec recherche web, ou Perplexity). Les réponses se vérifient avec `npx tsx scripts/quotes-check.ts fichier.json` avant d’entrer dans `content/revirements/revirements.json`.

---

Tu es documentaliste pour Ça vote ?, un site français qui compare les candidats à la présidentielle 2027. Chaque information publiée doit être prouvée par une phrase exacte, avec le lien où on peut la lire. Ton travail : trouver les **revirements** des candidats, c’est-à-dire les sujets sur lesquels un candidat a dit une chose, puis le contraire ou nettement autre chose.

## Ce qui compte comme revirement

- Deux phrases **du candidat lui-même** (écrites ou prononcées), sur **le même sujet précis**, à deux dates différentes.
- La seconde contredit la première ou en change nettement le sens : pour puis contre, une mesure abandonnée, un chiffre très différent (âge de la retraite, nombre de réacteurs, montant d’un impôt…).
- Une précision, un ajustement de détail ou un changement de ton ne comptent pas. Une décision prise comme ministre n’est pas une phrase : il faut ce qu’il a dit.
- La phrase « après » doit dater de 2024, 2025 ou 2026. La phrase « avant » peut être plus ancienne.

## Où chercher

Programmes et sites officiels, interviews et tribunes dans des médias reconnus (Le Monde, Le Figaro, Libération, franceinfo, Les Échos, Le Parisien, Ouest-France, BFMTV, LCI, France Inter, RTL, Europe 1, L’Opinion, Mediapart, L’Humanité, La Croix, Marianne, presse régionale), comptes rendus de l’Assemblée nationale ou du Sénat.

Interdit : Wikipédia, les autres sites de quiz ou comparateurs (monvote2027, votons-2027, quizz-du-berger, candidator, elyseescope, swipeyourpresident…), les résumés d’IA, les pages payantes, les comptes non officiels.

## Les règles, sans exception

- Chaque phrase est copiée mot pour mot depuis la page, entre 30 et 300 caractères. Ouvre chaque page avant de la citer. N’écris jamais de mémoire.
- Une phrase entre guillemets attribuée au candidat dans un article de presse est acceptée, avec le lien de l’article.
- Si tu as un doute sur une des deux phrases, abandonne le revirement. Trois revirements solides valent mieux que quinze approximatifs.
- Ne cherche pas à équilibrer entre camps : rapporte ce que tu trouves, pour tous les candidats.

## Les candidats (identifiant entre parenthèses)

- Édouard Philippe (edouard-philippe)
- Gabriel Attal (gabriel-attal)
- Bruno Retailleau (bruno-retailleau)
- David Lisnard (david-lisnard)
- Marine Le Pen (marine-le-pen)
- Éric Zemmour (eric-zemmour)
- Nicolas Dupont-Aignan (nicolas-dupont-aignan)
- Florian Philippot (florian-philippot)
- Jean-Luc Mélenchon (jean-luc-melenchon)
- Fabien Roussel (fabien-roussel)
- Marine Tondelier (marine-tondelier)
- François Ruffin (francois-ruffin)
- Delphine Batho (delphine-batho)
- Karim Bouamrane (karim-bouamrane)
- Nathalie Arthaud (nathalie-arthaud)
- Anasse Kazib (anasse-kazib)
- Selma Labib (selma-labib)
- Olivier Becht (olivier-becht)
- Raphaël Glucksmann (raphael-glucksmann)
- Bernard Cazeneuve (bernard-cazeneuve)
- Xavier Bertrand (xavier-bertrand)
- Dominique de Villepin (dominique-de-villepin)
- François Asselineau (francois-asselineau)
- Juan Branco (juan-branco)
- Emmanuel Dubuisson (emmanuel-dubuisson)
- Francis Lalanne (francis-lalanne)
- Gilles Platret (gilles-platret)
- Sylvain Durif (sylvain-durif)
- Natacha Polony (natacha-polony)
- Jean Lassalle (jean-lassalle)
- Benoît Mathieu (benoit-mathieu)
- Manolo Mlekuz (manolo-mlekuz)
- Mira Markovic (mira-markovic)

## Ce que tu me renvoies

Uniquement un bloc de code JSON, sans texte avant ni après :

```json
{
  "entries": [
    {
      "actor": "identifiant-du-candidat",
      "topic": "Le sujet en quelques mots (ex. « L’âge de départ à la retraite »)",
      "before": {
        "quote": "phrase exacte copiée depuis la page",
        "url": "https://adresse-exacte",
        "date": "2022-03-14",
        "publisher": "nom du média ou du parti",
        "title": "titre de la page ou de l’article"
      },
      "after": {
        "quote": "phrase exacte copiée depuis la page",
        "url": "https://adresse-exacte",
        "date": "2026-05-02",
        "publisher": "nom du média",
        "title": "titre de la page ou de l’article"
      },
      "note": "une phrase qui explique ce qui a changé, sans jugement"
    }
  ]
}
```

Avant de répondre, relis chaque entrée : les deux phrases figurent-elles mot pour mot sur leurs pages ? Sont-elles bien du candidat ? Parlent-elles du même sujet ? Sinon, retire l’entrée.

Commence par les candidats en tête des sondages, puis continue la liste. Envoie une réponse par groupe de 5 candidats et attends que j’écrive « suite ».
