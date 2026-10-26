Tu es documentaliste pour Ça vote ?, un site français qui aide les électeurs à comparer les candidats à la présidentielle 2027. Le site compare les réponses d’un électeur aux positions publiques des candidats, et chaque position affichée doit être prouvée par une phrase exacte du candidat, avec le lien où on peut la lire. Ton travail : trouver ces phrases.

## Ta mission

Pour chaque candidat listé plus bas, et pour chacune des affirmations listées sous son nom, cherche sur le web si le candidat a pris position publiquement. Traite un seul candidat par réponse, dans l’ordre de la liste. Quand tu as fini un candidat, attends que j’écrive « suite » pour passer au suivant.

Utilise ta recherche web. Ouvre chaque page que tu cites et copie la phrase depuis la page elle-même : n’écris jamais une citation de mémoire.

## Où chercher, dans cet ordre

1. Le programme, le site de campagne ou le site du parti du candidat (adresses données sous son nom).
2. Ses interviews et déclarations dans des médias reconnus : Le Monde, Le Figaro, Libération, franceinfo, Les Échos, Le Parisien, Ouest-France, BFMTV, LCI, France Inter, RTL, Europe 1, Sud Radio, L’Opinion, Mediapart, L’Humanité, La Croix, Marianne, presse régionale.
3. S’il est ou a été parlementaire : ses votes et amendements sur assemblee-nationale.fr ou senat.fr.

Interdit : Wikipédia, les autres sites de quiz ou comparateurs (monvote2027, quizz-du-berger, candidator, votons, elyseescope…), les résumés d’IA, les comptes de réseaux sociaux non officiels, les pages qui demandent un abonnement pour lire la phrase.

## Les règles, sans exception

- Une position = une phrase copiée mot pour mot depuis la page, entre 30 et 300 caractères, prononcée ou écrite par le candidat ou publiée officiellement par son parti. Pas un résumé de journaliste, pas une paraphrase.
- La phrase doit répondre précisément à l’affirmation. Une phrase voisine ne compte pas : « augmenter le budget de la police » ne répond pas à « augmenter les effectifs de police ». En cas de doute, n’écris rien.
- Ne déduis jamais une position de l’idéologie du candidat ou de son parti.
- Préfère 2025 et 2026. Une phrase plus ancienne est acceptée seulement si rien de plus récent ne la contredit ; signale-le dans « note ».
- Un acte de ministre ou de Premier ministre d’il y a plusieurs années n’est pas une position de candidat.
- Si tu ne trouves rien de solide pour une affirmation, n’écris rien pour elle. Une réponse avec 3 positions solides vaut mieux que 20 approximatives.

## L’échelle

Pour chaque affirmation, la valeur dit si le candidat est d’accord AVEC L’AFFIRMATION telle qu’elle est écrite :
- 2 : tout à fait d’accord
- 1 : plutôt d’accord
- 0 : position intermédiaire, exprimée explicitement
- -1 : plutôt pas d’accord
- -2 : pas du tout d’accord

Si tu hésites entre deux niveaux voisins, mets "value": null et "set": [les deux niveaux], par exemple [1, 2].

## Le type de source (champ basis)

- programme-2027 : programme ou site de campagne pour 2027
- declaration : interview, discours, tribune, déclaration publique
- programme-2022 : programme de 2022
- parti : texte officiel du parti, pas du candidat lui-même
- vote : vote ou amendement au Parlement (la citation est la ligne de la page du scrutin où figure son nom)

## Ce que tu me renvoies

Uniquement un bloc de code JSON, sans texte avant ni après, exactement de cette forme :

```json
{
  "actor": "identifiant-du-candidat",
  "positions": [
    {
      "itemId": "eco-01",
      "value": 2,
      "set": [],
      "basis": "declaration",
      "quote": "la phrase exacte copiée depuis la page",
      "url": "https://adresse-exacte-de-la-page",
      "sourceTitle": "titre de la page ou de l’article",
      "publisher": "nom du média ou du parti",
      "date": "2026-05-14",
      "note": "précision utile, ou chaîne vide"
    }
  ]
}
```

Avant de répondre, relis chaque entrée : la phrase figure-t-elle mot pour mot sur la page dont tu donnes l’adresse ? Répond-elle exactement à l’affirmation ? Sinon, retire l’entrée.

## Les candidats et les affirmations

### Anasse Kazib (identifiant : anasse-kazib)
Parti ou mouvement : Révolution permanente. Sites officiels : https://anasse2027.fr/, https://anasse2027.fr/programme.
Affirmations à chercher (29) :
- eco-08 : Les droits de succession devraient baisser pour la plupart des héritages.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- eco-11 : Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net.
- eco-12 : Les droits de succession devraient fortement augmenter sur les plus gros héritages.
- tra-08 : Une partie des retraites devrait être financée par une épargne placée (capitalisation).
- san-01 : Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-01 : Les communes devraient rester obligées d’avoir un minimum de logements sociaux.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- log-04 : Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées.
- sec-02 : Les courtes peines de prison devraient plus souvent être remplacées par d’autres sanctions.
- sec-08 : Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs.
- sec-09 : L’État devrait construire davantage de places de prison.
- lib-01 : Une personne atteinte d’une maladie grave et incurable devrait pouvoir obtenir une aide à mourir, sous conditions strictes.
- cli-06 : Les normes environnementales imposées aux agriculteurs et aux entreprises devraient être allégées.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- ani-07 : L’État devrait garantir aux agriculteurs des prix minimums pour leurs produits.
- cli-03 : L’usage des pesticides en agriculture devrait être réduit, même si cela augmente certains coûts de production.
- eur-01 : La France devrait confier davantage de décisions à l’Union européenne.
- eur-04 : L’Union européenne devrait conclure moins d’accords de libre-échange avec d’autres régions du monde.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- eur-07 : La France devrait continuer à fournir une aide militaire à l’Ukraine.
- dem-01 : Les députés devraient être élus à la proportionnelle.
- dem-02 : Les citoyens devraient pouvoir déclencher un référendum par pétition.
- dem-05 : Les régions, départements et communes devraient avoir plus de pouvoirs et de ressources propres.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
- dem-03 : L’article 49.3 de la Constitution devrait être supprimé ou fortement limité.

### Dominique de Villepin (identifiant : dominique-de-villepin)
Parti ou mouvement : La France humaniste. Sites officiels : https://lafrancehumaniste.fr/.
Affirmations à chercher (32) :
- eco-01 : Les personnes aux revenus les plus élevés devraient payer davantage d’impôt sur le revenu.
- eco-06 : Le SMIC devrait augmenter plus vite que ce que prévoient les règles actuelles.
- eco-07 : Les taxes sur l’électricité, le gaz et les carburants devraient baisser.
- eco-08 : Les droits de succession devraient baisser pour la plupart des héritages.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- tra-01 : L’âge légal de départ à la retraite devrait être abaissé.
- tra-05 : Les règles d’indemnisation du chômage devraient être durcies pour inciter à reprendre un emploi plus vite.
- tra-09 : Les pensions de retraite devraient toujours augmenter au moins autant que les prix.
- tra-11 : L’âge de départ à la retraite devrait être relevé au-delà de 64 ans.
- san-01 : Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- log-04 : Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées.
- tra-04 : Les loyers devraient être plafonnés dans les zones où il est difficile de se loger.
- sec-01 : Il faudrait augmenter les effectifs de police et de gendarmerie.
- sec-02 : Les courtes peines de prison devraient plus souvent être remplacées par d’autres sanctions.
- sec-08 : Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs.
- sec-09 : L’État devrait construire davantage de places de prison.
- imm-06 : Le regroupement familial devrait être fortement restreint ou suspendu.
- sec-04 : Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-01 : Une personne atteinte d’une maladie grave et incurable devrait pouvoir obtenir une aide à mourir, sous conditions strictes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- eur-03 : Le budget de la défense devrait continuer à augmenter.
- eur-04 : L’Union européenne devrait conclure moins d’accords de libre-échange avec d’autres régions du monde.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- eur-07 : La France devrait continuer à fournir une aide militaire à l’Ukraine.
- dem-01 : Les députés devraient être élus à la proportionnelle.
- dem-02 : Les citoyens devraient pouvoir déclencher un référendum par pétition.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
- dem-03 : L’article 49.3 de la Constitution devrait être supprimé ou fortement limité.

### Bernard Cazeneuve (identifiant : bernard-cazeneuve)
Parti ou mouvement : sans parti. Sites officiels : https://bc2027.fr/.
Affirmations à chercher (39) :
- eco-04 : L’État devrait pouvoir plafonner le prix de certains produits de première nécessité.
- eco-06 : Le SMIC devrait augmenter plus vite que ce que prévoient les règles actuelles.
- eco-07 : Les taxes sur l’électricité, le gaz et les carburants devraient baisser.
- eco-08 : Les droits de succession devraient baisser pour la plupart des héritages.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- eco-11 : Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net.
- eco-12 : Les droits de succession devraient fortement augmenter sur les plus gros héritages.
- tra-05 : Les règles d’indemnisation du chômage devraient être durcies pour inciter à reprendre un emploi plus vite.
- tra-09 : Les pensions de retraite devraient toujours augmenter au moins autant que les prix.
- tra-14 : L’État devrait nationaliser de grandes entreprises dans des secteurs stratégiques (énergie, banques, autoroutes).
- san-01 : Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent.
- tra-02 : L’hôpital public devrait recevoir davantage de moyens, même si cela impose d’autres économies ou de nouvelles recettes.
- edu-06 : Un service national obligatoire devrait être instauré pour tous les jeunes.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-01 : Les communes devraient rester obligées d’avoir un minimum de logements sociaux.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- log-04 : Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées.
- tra-04 : Les loyers devraient être plafonnés dans les zones où il est difficile de se loger.
- sec-01 : Il faudrait augmenter les effectifs de police et de gendarmerie.
- sec-08 : Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs.
- sec-09 : L’État devrait construire davantage de places de prison.
- imm-03 : L’accès au logement social et à certaines aides devrait être réservé en priorité aux personnes de nationalité française.
- imm-06 : Le regroupement familial devrait être fortement restreint ou suspendu.
- imm-07 : Toutes les personnes sans titre de séjour présentes en France devraient être régularisées.
- sec-04 : Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-01 : Une personne atteinte d’une maladie grave et incurable devrait pouvoir obtenir une aide à mourir, sous conditions strictes.
- lib-06 : Le port de signes religieux devrait être davantage restreint dans l’espace public.
- cli-06 : Les normes environnementales imposées aux agriculteurs et aux entreprises devraient être allégées.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- ani-07 : L’État devrait garantir aux agriculteurs des prix minimums pour leurs produits.
- cli-03 : L’usage des pesticides en agriculture devrait être réduit, même si cela augmente certains coûts de production.
- eur-04 : L’Union européenne devrait conclure moins d’accords de libre-échange avec d’autres régions du monde.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- eur-07 : La France devrait continuer à fournir une aide militaire à l’Ukraine.
- dem-02 : Les citoyens devraient pouvoir déclencher un référendum par pétition.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.

### Delphine Batho (identifiant : delphine-batho)
Parti ou mouvement : Génération écologie. Sites officiels : https://www.generationecologie.fr/.
Affirmations à chercher (30) :
- eco-01 : Les personnes aux revenus les plus élevés devraient payer davantage d’impôt sur le revenu.
- eco-03 : Réduire la dette publique devrait passer avant toute nouvelle dépense publique.
- eco-06 : Le SMIC devrait augmenter plus vite que ce que prévoient les règles actuelles.
- eco-07 : Les taxes sur l’électricité, le gaz et les carburants devraient baisser.
- eco-08 : Les droits de succession devraient baisser pour la plupart des héritages.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- eco-11 : Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net.
- tra-08 : Une partie des retraites devrait être financée par une épargne placée (capitalisation).
- tra-14 : L’État devrait nationaliser de grandes entreprises dans des secteurs stratégiques (énergie, banques, autoroutes).
- edu-06 : Un service national obligatoire devrait être instauré pour tous les jeunes.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-01 : Les communes devraient rester obligées d’avoir un minimum de logements sociaux.
- log-02 : L’État devrait financer la construction de beaucoup plus de logements sociaux.
- sec-01 : Il faudrait augmenter les effectifs de police et de gendarmerie.
- sec-02 : Les courtes peines de prison devraient plus souvent être remplacées par d’autres sanctions.
- sec-09 : L’État devrait construire davantage de places de prison.
- imm-06 : Le regroupement familial devrait être fortement restreint ou suspendu.
- imm-07 : Toutes les personnes sans titre de séjour présentes en France devraient être régularisées.
- sec-04 : Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-06 : Le port de signes religieux devrait être davantage restreint dans l’espace public.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- eur-01 : La France devrait confier davantage de décisions à l’Union européenne.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- eur-09 : La France devrait quitter l’Union européenne.
- dem-01 : Les députés devraient être élus à la proportionnelle.
- dem-02 : Les citoyens devraient pouvoir déclencher un référendum par pétition.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
- dem-03 : L’article 49.3 de la Constitution devrait être supprimé ou fortement limité.

### Olivier Becht (identifiant : olivier-becht)
Parti ou mouvement : Renaissance. Sites officiels : aucun site officiel connu.
Affirmations à chercher (39) :
- eco-04 : L’État devrait pouvoir plafonner le prix de certains produits de première nécessité.
- eco-05 : Les cotisations payées par les employeurs sur les salaires devraient baisser.
- eco-06 : Le SMIC devrait augmenter plus vite que ce que prévoient les règles actuelles.
- eco-07 : Les taxes sur l’électricité, le gaz et les carburants devraient baisser.
- eco-08 : Les droits de succession devraient baisser pour la plupart des héritages.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- eco-11 : Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net.
- tra-01 : L’âge légal de départ à la retraite devrait être abaissé.
- tra-05 : Les règles d’indemnisation du chômage devraient être durcies pour inciter à reprendre un emploi plus vite.
- tra-09 : Les pensions de retraite devraient toujours augmenter au moins autant que les prix.
- tra-11 : L’âge de départ à la retraite devrait être relevé au-delà de 64 ans.
- tra-13 : Les aides publiques aux entreprises devraient être fortement réduites.
- tra-14 : L’État devrait nationaliser de grandes entreprises dans des secteurs stratégiques (énergie, banques, autoroutes).
- san-01 : Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent.
- tra-02 : L’hôpital public devrait recevoir davantage de moyens, même si cela impose d’autres économies ou de nouvelles recettes.
- edu-06 : Un service national obligatoire devrait être instauré pour tous les jeunes.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-01 : Les communes devraient rester obligées d’avoir un minimum de logements sociaux.
- log-02 : L’État devrait financer la construction de beaucoup plus de logements sociaux.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- log-04 : Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées.
- tra-04 : Les loyers devraient être plafonnés dans les zones où il est difficile de se loger.
- imm-03 : L’accès au logement social et à certaines aides devrait être réservé en priorité aux personnes de nationalité française.
- imm-06 : Le regroupement familial devrait être fortement restreint ou suspendu.
- sec-04 : Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-06 : Le port de signes religieux devrait être davantage restreint dans l’espace public.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- ani-07 : L’État devrait garantir aux agriculteurs des prix minimums pour leurs produits.
- eur-01 : La France devrait confier davantage de décisions à l’Union européenne.
- eur-04 : L’Union européenne devrait conclure moins d’accords de libre-échange avec d’autres régions du monde.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- eur-07 : La France devrait continuer à fournir une aide militaire à l’Ukraine.
- eur-09 : La France devrait quitter l’Union européenne.
- dem-01 : Les députés devraient être élus à la proportionnelle.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
- dem-03 : L’article 49.3 de la Constitution devrait être supprimé ou fortement limité.

### Karim Bouamrane (identifiant : karim-bouamrane)
Parti ou mouvement : Parti socialiste (hors primaire). Sites officiels : https://www.karimbouamrane2027.org/.
Affirmations à chercher (47) :
- eco-01 : Les personnes aux revenus les plus élevés devraient payer davantage d’impôt sur le revenu.
- eco-03 : Réduire la dette publique devrait passer avant toute nouvelle dépense publique.
- eco-04 : L’État devrait pouvoir plafonner le prix de certains produits de première nécessité.
- eco-05 : Les cotisations payées par les employeurs sur les salaires devraient baisser.
- eco-07 : Les taxes sur l’électricité, le gaz et les carburants devraient baisser.
- eco-08 : Les droits de succession devraient baisser pour la plupart des héritages.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- eco-11 : Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net.
- eco-12 : Les droits de succession devraient fortement augmenter sur les plus gros héritages.
- tra-05 : Les règles d’indemnisation du chômage devraient être durcies pour inciter à reprendre un emploi plus vite.
- tra-08 : Une partie des retraites devrait être financée par une épargne placée (capitalisation).
- tra-09 : Les pensions de retraite devraient toujours augmenter au moins autant que les prix.
- tra-11 : L’âge de départ à la retraite devrait être relevé au-delà de 64 ans.
- tra-14 : L’État devrait nationaliser de grandes entreprises dans des secteurs stratégiques (énergie, banques, autoroutes).
- san-01 : Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent.
- tra-02 : L’hôpital public devrait recevoir davantage de moyens, même si cela impose d’autres économies ou de nouvelles recettes.
- edu-06 : Un service national obligatoire devrait être instauré pour tous les jeunes.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-02 : L’État devrait financer la construction de beaucoup plus de logements sociaux.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- log-04 : Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées.
- tra-06 : Les services publics de proximité (bureau de poste, gare, maternité) devraient être maintenus même lorsqu’ils coûtent cher.
- sec-02 : Les courtes peines de prison devraient plus souvent être remplacées par d’autres sanctions.
- sec-08 : Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs.
- sec-09 : L’État devrait construire davantage de places de prison.
- imm-03 : L’accès au logement social et à certaines aides devrait être réservé en priorité aux personnes de nationalité française.
- imm-06 : Le regroupement familial devrait être fortement restreint ou suspendu.
- sec-04 : Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-01 : Une personne atteinte d’une maladie grave et incurable devrait pouvoir obtenir une aide à mourir, sous conditions strictes.
- lib-06 : Le port de signes religieux devrait être davantage restreint dans l’espace public.
- cli-01 : La France devrait construire de nouveaux réacteurs nucléaires.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- ani-07 : L’État devrait garantir aux agriculteurs des prix minimums pour leurs produits.
- cli-03 : L’usage des pesticides en agriculture devrait être réduit, même si cela augmente certains coûts de production.
- eur-01 : La France devrait confier davantage de décisions à l’Union européenne.
- eur-04 : L’Union européenne devrait conclure moins d’accords de libre-échange avec d’autres régions du monde.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- eur-07 : La France devrait continuer à fournir une aide militaire à l’Ukraine.
- eur-09 : La France devrait quitter l’Union européenne.
- dem-01 : Les députés devraient être élus à la proportionnelle.
- dem-02 : Les citoyens devraient pouvoir déclencher un référendum par pétition.
- dem-05 : Les régions, départements et communes devraient avoir plus de pouvoirs et de ressources propres.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
- dem-03 : L’article 49.3 de la Constitution devrait être supprimé ou fortement limité.

### François Asselineau (identifiant : francois-asselineau)
Parti ou mouvement : Union populaire républicaine (UPR). Sites officiels : https://upr.fr/, https://upr.fr/notre-programme.
Affirmations à chercher (28) :
- eco-03 : Réduire la dette publique devrait passer avant toute nouvelle dépense publique.
- eco-11 : Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net.
- eco-12 : Les droits de succession devraient fortement augmenter sur les plus gros héritages.
- tra-01 : L’âge légal de départ à la retraite devrait être abaissé.
- san-01 : Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent.
- edu-06 : Un service national obligatoire devrait être instauré pour tous les jeunes.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-01 : Les communes devraient rester obligées d’avoir un minimum de logements sociaux.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- log-04 : Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées.
- tra-04 : Les loyers devraient être plafonnés dans les zones où il est difficile de se loger.
- sec-01 : Il faudrait augmenter les effectifs de police et de gendarmerie.
- sec-08 : Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs.
- sec-09 : L’État devrait construire davantage de places de prison.
- imm-03 : L’accès au logement social et à certaines aides devrait être réservé en priorité aux personnes de nationalité française.
- imm-06 : Le regroupement familial devrait être fortement restreint ou suspendu.
- imm-07 : Toutes les personnes sans titre de séjour présentes en France devraient être régularisées.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-06 : Le port de signes religieux devrait être davantage restreint dans l’espace public.
- cli-01 : La France devrait construire de nouveaux réacteurs nucléaires.
- cli-06 : Les normes environnementales imposées aux agriculteurs et aux entreprises devraient être allégées.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- cli-08 : Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen.
- ani-07 : L’État devrait garantir aux agriculteurs des prix minimums pour leurs produits.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
- dem-03 : L’article 49.3 de la Constitution devrait être supprimé ou fortement limité.

### Juan Branco (identifiant : juan-branco)
Parti ou mouvement : Les Ruches (mouvement citoyen). Sites officiels : https://ruches.org/, https://ruches.org/le-projet.
Affirmations à chercher (30) :
- eco-01 : Les personnes aux revenus les plus élevés devraient payer davantage d’impôt sur le revenu.
- eco-03 : Réduire la dette publique devrait passer avant toute nouvelle dépense publique.
- eco-04 : L’État devrait pouvoir plafonner le prix de certains produits de première nécessité.
- eco-07 : Les taxes sur l’électricité, le gaz et les carburants devraient baisser.
- eco-09 : Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser.
- tra-01 : L’âge légal de départ à la retraite devrait être abaissé.
- tra-08 : Une partie des retraites devrait être financée par une épargne placée (capitalisation).
- tra-09 : Les pensions de retraite devraient toujours augmenter au moins autant que les prix.
- tra-11 : L’âge de départ à la retraite devrait être relevé au-delà de 64 ans.
- tra-02 : L’hôpital public devrait recevoir davantage de moyens, même si cela impose d’autres économies ou de nouvelles recettes.
- tra-03 : L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe.
- log-01 : Les communes devraient rester obligées d’avoir un minimum de logements sociaux.
- log-02 : L’État devrait financer la construction de beaucoup plus de logements sociaux.
- log-03 : L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue.
- tra-04 : Les loyers devraient être plafonnés dans les zones où il est difficile de se loger.
- sec-01 : Il faudrait augmenter les effectifs de police et de gendarmerie.
- sec-08 : Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs.
- sec-09 : L’État devrait construire davantage de places de prison.
- imm-03 : L’accès au logement social et à certaines aides devrait être réservé en priorité aux personnes de nationalité française.
- sec-04 : Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser.
- sec-05 : Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement.
- lib-01 : Une personne atteinte d’une maladie grave et incurable devrait pouvoir obtenir une aide à mourir, sous conditions strictes.
- lib-06 : Le port de signes religieux devrait être davantage restreint dans l’espace public.
- cli-06 : Les normes environnementales imposées aux agriculteurs et aux entreprises devraient être allégées.
- cli-07 : La France devrait arrêter de construire de nouvelles éoliennes.
- eur-03 : Le budget de la défense devrait continuer à augmenter.
- eur-06 : L’aide versée par la France aux pays pauvres devrait augmenter.
- dem-01 : Les députés devraient être élus à la proportionnelle.
- edu-02 : Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques.
- ani-06 : L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux.
