# Boutique : mise en ligne sur Spreadshop

Fichiers prêts : `impression/clair/` (encre noire, pour produits blancs, crème, gris clair) et `impression/sombre/` (encre crème, pour produits noirs, marine, bordeaux). Même nom de fichier dans les deux dossiers. Régénérer après une modification de `designs.json` : `npx tsx scripts/boutique-impression.ts`.

## Ordre conseillé
1. Importer les designs **clair** par lots de 10 (lot 1 d'abord : ce sont les plus forts), produits clairs uniquement.
2. Pour chaque design : titre = la phrase ci-dessous, mots-clés ci-dessous, puis choisir les produits.
3. Activer la boutique une fois au moins le lot 1 en ligne. Prévenir pour qu'on affiche le bouton « Ouvrir la boutique » sur le site.
4. Ajouter les versions **sombre** ensuite, pour les designs qui se vendent.

## Produits
- Avec dessin (designs hauts) : tee-shirt homme, tee-shirt femme, sweat, tote bag. Placement poitrine centrée, largeur maximale.
- Texte seul (designs larges) : les mêmes, plus le mug (le texte tient sur la face).
- Ne pas mettre les designs avec dessin sur les badges : trop de détails à cette taille.
- Commission : la même sur tous les tee-shirts, pour qu'aucun camp ne paie plus cher que l'autre.

## Interdits Spreadshop à respecter
Pas de nom de candidat, pas de visage, pas de logo de parti : c'est déjà le cas de tous les designs. Ne pas ajouter de description qui attribue un design à un parti.

## Titres et mots-clés
| Lot | Fichier | Titre | Mots-clés |
|---|---|---|---|
| 1 | `cafe.png` | Pas de politique avant le café. | présidentielle 2027, politique, humour, café, bureau, collègues |
| 1 | `vaisselle.png` | Le premier qui parle politique fait la vaisselle. | présidentielle 2027, politique, humour, famille, repas de famille, vaisselle |
| 1 | `tonton-rn.png` | Tonton vote RN. Noël va être long. | présidentielle 2027, politique, humour, famille, Noël, tonton, RN |
| 1 | `tonton-lfi.png` | Tonton vote LFI. Noël aussi. | présidentielle 2027, politique, humour, famille, Noël, tonton, LFI |
| 1 | `chat-elle-gauche.png` | Elle vote à gauche. Je vote à droite. Le chat s’abstient. | présidentielle 2027, politique, humour, couple, chat, abstention |
| 1 | `chat-elle-droite.png` | Elle vote à droite. Je vote à gauche. Le chat s’abstient. | présidentielle 2027, politique, humour, couple, chat, abstention |
| 1 | `chat-il-gauche.png` | Il vote à gauche. Je vote à droite. Le chat s’abstient. | présidentielle 2027, politique, humour, couple, chat, abstention |
| 1 | `chat-il-droite.png` | Il vote à droite. Je vote à gauche. Le chat s’abstient. | présidentielle 2027, politique, humour, couple, chat, abstention |
| 1 | `lit.png` | Je couche avec l’opposition. | présidentielle 2027, politique, humour, couple, opposition, cadeau couple |
| 1 | `vote-blanc.png` | Vote blanc. Mon avis, non. | présidentielle 2027, politique, humour, vote blanc, abstention |
| 2 | `centriste.png` | Centriste. Des ennemis partout. | présidentielle 2027, politique, humour, centre, centriste, modéré |
| 2 | `pasteque.png` | Pastèque. Verte dehors, rouge dedans. | présidentielle 2027, politique, humour, écologie, écolo, pastèque |
| 2 | `mandat.png` | Un mandat. Pas un trône. | présidentielle 2027, politique, humour, démocratie, mandat, pouvoir |
| 2 | `velo.png` | Je viens à vélo. Avec mes convictions. | présidentielle 2027, politique, humour, écolo, vélo, militant |
| 2 | `tract.png` | Je sais. Encore un tract. | présidentielle 2027, politique, humour, militant, tract, marché |
| 2 | `1er-mai.png` | 1er mai. Pas que le muguet. | présidentielle 2027, politique, humour, 1er mai, fête du travail, syndicat |
| 2 | `1871.png` | 1871. On se souvient. | présidentielle 2027, politique, humour, Commune de Paris, histoire, 1871 |
| 2 | `1936.png` | 1936. Pas un cadeau. | présidentielle 2027, politique, humour, Front populaire, congés payés, 1936 |
| 2 | `1968.png` | 1968. | présidentielle 2027, politique, humour, Mai 68, histoire, 1968 |
| 2 | `1789.png` | 1789. On en reparle ? | présidentielle 2027, politique, humour, Révolution française, histoire, 1789 |
| 3 | `49-3.png` | 49.3 Et mon avis ? | présidentielle 2027, politique, humour, 49.3, Assemblée nationale, démocratie |
| 3 | `comptes.png` | Des comptes. Pas des contes. | présidentielle 2027, politique, humour, démocratie, transparence |
| 3 | `servir.png` | Servir. Pas se servir. | présidentielle 2027, politique, humour, démocratie, service public |
| 3 | `merite.png` | Mon vote se mérite. | présidentielle 2027, politique, humour, électeur, vote |
| 3 | `subir.png` | Je refuse de subir. Mais qui choisir ? | présidentielle 2027, politique, humour, indécis, électeur |
| 3 | `renseigne.png` | Je vote, donc je me renseigne. | présidentielle 2027, politique, humour, électeur, information, citoyen |
| 3 | `gauchiasse.png` | Gauchiasse. Et alors ? | présidentielle 2027, politique, humour, gauche, humour de gauche |
| 3 | `droitard.png` | Droitard. Et alors ? | présidentielle 2027, politique, humour, droite, humour de droite |
| 3 | `ruisselle.png` | Mon salaire ne ruisselle pas. | présidentielle 2027, politique, humour, gauche, salaire, ruissellement |
| 3 | `modere.png` | Modéré. Pas muet. | présidentielle 2027, politique, humour, centre, modéré |
| 4 | `insoumis-mere.png` | Insoumis. Sauf à ma mère. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumis-femme.png` | Insoumis. Sauf à ma femme. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumis-fille.png` | Insoumis. Sauf à ma fille. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumis-fils.png` | Insoumis. Sauf à mon fils. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumis-chat.png` | Insoumis. Sauf à mon chat. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumis-patron.png` | Insoumis. Sauf à mon patron. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumis-belle-mere.png` | Insoumis. Sauf à ma belle-mère. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumise-mere.png` | Insoumise. Sauf à ma mère. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumise-mari.png` | Insoumise. Sauf à mon mari. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 4 | `insoumise-fille.png` | Insoumise. Sauf à ma fille. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 5 | `insoumise-fils.png` | Insoumise. Sauf à mon fils. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 5 | `insoumise-chat.png` | Insoumise. Sauf à mon chat. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 5 | `insoumise-patron.png` | Insoumise. Sauf à mon patron. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
| 5 | `insoumise-belle-mere.png` | Insoumise. Sauf à ma belle-mère. | présidentielle 2027, politique, humour, insoumis, LFI, famille, cadeau |
