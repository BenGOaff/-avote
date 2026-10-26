# Chercher des positions de candidats avec ChatGPT ou Perplexity

Ce guide sert à gagner du temps. L’outil cherche, il ne décide rien : chaque position passe ensuite par
`scripts/positions-import.ts`, qui retélécharge la page et refuse toute citation qui n’y figure pas mot pour mot.

## 1. Le message à coller (remplace NOM et SLUG)

```
Tu es documentaliste. Candidat : NOM (présidentielle française 2027).
Pour chaque affirmation de la liste ci-dessous, cherche si NOM a pris position publiquement.

Règles strictes :
- Sources acceptées : programme ou site officiel du candidat ou de son parti, interview ou déclaration dans un média reconnu
  (Le Monde, Le Figaro, Libération, franceinfo, Les Échos, BFMTV, LCI, France Inter, Ouest-France, Le Parisien…),
  compte rendu de vote à l’Assemblée nationale ou au Sénat.
- Interdit : Wikipédia, sites de quiz ou comparateurs (monvote2027, quizz-du-berger…), résumés d’IA, réseaux sociaux non officiels.
- Pour chaque position : une citation copiée MOT POUR MOT depuis la page (au moins 30 caractères), l’adresse exacte de cette page, la date.
- Si tu ne trouves pas de citation exacte qui répond précisément à l’affirmation, n’écris rien pour cette affirmation. Ne déduis jamais.
- Préfère 2025-2026. Une position plus ancienne seulement si rien de plus récent ne la contredit.
- Échelle : 2 = tout à fait d’accord avec l’affirmation, 1 = plutôt d’accord, 0 = position intermédiaire explicite,
  -1 = plutôt pas d’accord, -2 = pas du tout d’accord. Si tu hésites entre deux niveaux voisins, mets value null et set [a, b].

Réponds uniquement avec ce JSON, sans texte autour :
{ "actor": "SLUG", "positions": [
  { "itemId": "eco-01", "value": 2, "set": [], "basis": "programme-2027",
    "quote": "phrase exacte copiée de la page", "url": "https://…",
    "sourceTitle": "titre de la page", "publisher": "nom du média ou du parti",
    "date": "AAAA-MM-JJ", "note": "" }
] }
basis = programme-2027 | declaration | programme-2022 | parti | vote

Affirmations : (colle ici les lignes utiles de la liste)
```

## 2. Ce que tu me renvoies

Le JSON tel quel (un fichier ou un message). Je lance la vérification, je relis chaque citation face à l’affirmation, et je
n’importe que ce qui passe. Ce qui ne passe pas est simplement ignoré.

Astuce : demande 15 à 20 affirmations à la fois, et redemande « vérifie que chaque citation figure mot pour mot sur la page »
avant de copier le résultat. Perplexity est plus fiable que ChatGPT pour les liens exacts.

## 3. Identifiants des candidats

Utilise le slug de `content/acteurs/candidatures.json` (ex. xavier-bertrand, bernard-cazeneuve).

## 4. La liste des affirmations

| Id | Thème | Affirmation |
|---|---|---|
| eco-01 | Pouvoir d’achat et impôts | Les personnes aux revenus les plus élevés devraient payer davantage d’impôt sur le revenu. |
| eco-02 | Pouvoir d’achat et impôts | Les plus grands patrimoines devraient être davantage taxés. |
| eco-03 | Pouvoir d’achat et impôts | Réduire la dette publique devrait passer avant toute nouvelle dépense publique. |
| eco-04 | Pouvoir d’achat et impôts | L’État devrait pouvoir plafonner le prix de certains produits de première nécessité. |
| eco-05 | Pouvoir d’achat et impôts | Les cotisations payées par les employeurs sur les salaires devraient baisser. |
| eco-06 | Pouvoir d’achat et impôts | Le SMIC devrait augmenter plus vite que ce que prévoient les règles actuelles. |
| eco-07 | Pouvoir d’achat et impôts | Les taxes sur l’électricité, le gaz et les carburants devraient baisser. |
| eco-08 | Pouvoir d’achat et impôts | Les droits de succession devraient baisser pour la plupart des héritages. |
| eco-09 | Pouvoir d’achat et impôts | Le nombre d’agents publics (État, collectivités, hôpitaux) devrait baisser. |
| eco-10 | Pouvoir d’achat et impôts | Les salaires devraient augmenter automatiquement au même rythme que les prix. |
| eco-11 | Pouvoir d’achat et impôts | Les cotisations et la CSG payées par les salariés devraient baisser pour augmenter le salaire net. |
| eco-12 | Pouvoir d’achat et impôts | Les droits de succession devraient fortement augmenter sur les plus gros héritages. |
| eco-13 | Pouvoir d’achat et impôts | Les allocations familiales devraient être versées dès le premier enfant. |
| tra-01 | Travail et retraites | L’âge légal de départ à la retraite devrait être abaissé. |
| tra-05 | Travail et retraites | Les règles d’indemnisation du chômage devraient être durcies pour inciter à reprendre un emploi plus vite. |
| tra-07 | Travail et retraites | La durée légale du travail devrait passer de 35 à 32 heures par semaine. |
| tra-08 | Travail et retraites | Une partie des retraites devrait être financée par une épargne placée (capitalisation). |
| tra-09 | Travail et retraites | Les pensions de retraite devraient toujours augmenter au moins autant que les prix. |
| tra-10 | Travail et retraites | L’obligation d’au moins 15 heures d’activité par semaine pour les bénéficiaires du RSA devrait être maintenue. |
| tra-11 | Travail et retraites | L’âge de départ à la retraite devrait être relevé au-delà de 64 ans. |
| tra-12 | Travail et retraites | Les licenciements devraient être interdits dans les entreprises qui font des bénéfices. |
| tra-13 | Travail et retraites | Les aides publiques aux entreprises devraient être fortement réduites. |
| tra-14 | Travail et retraites | L’État devrait nationaliser de grandes entreprises dans des secteurs stratégiques (énergie, banques, autoroutes). |
| san-01 | Santé et autonomie | Les médecins devraient être obligés de s’installer en priorité dans les zones qui en manquent. |
| san-02 | Santé et autonomie | Les franchises médicales (sommes restant à payer sur les médicaments, consultations et transports) devraient être supprimées. |
| san-03 | Santé et autonomie | La Sécurité sociale devrait rembourser à 100 % les soins prescrits, à la place des mutuelles. |
| san-04 | Santé et autonomie | Les dépassements d’honoraires des médecins devraient être davantage limités. |
| san-05 | Santé et autonomie | L’argent public consacré aux personnes âgées dépendantes (EHPAD, aide à domicile) devrait nettement augmenter. |
| san-06 | Santé et autonomie | L’allocation aux adultes handicapés (AAH) devrait être portée au moins au niveau du seuil de pauvreté. |
| tra-02 | Santé et autonomie | L’hôpital public devrait recevoir davantage de moyens, même si cela impose d’autres économies ou de nouvelles recettes. |
| edu-01 | École et jeunesse | Le port d’une tenue commune (uniforme) devrait être obligatoire à l’école. |
| edu-02 | École et jeunesse | Au collège, les élèves devraient être répartis en groupes de niveau en français et en mathématiques. |
| edu-03 | École et jeunesse | La cantine devrait être gratuite pour tous les élèves des écoles publiques. |
| edu-04 | École et jeunesse | L’argent public versé aux écoles privées sous contrat devrait dépendre de leur mixité sociale. |
| edu-05 | École et jeunesse | La plateforme Parcoursup devrait être supprimée. |
| edu-06 | École et jeunesse | Un service national obligatoire devrait être instauré pour tous les jeunes. |
| edu-07 | École et jeunesse | La carte scolaire devrait être supprimée pour laisser les familles choisir leur école publique. |
| tra-03 | École et jeunesse | L’État devrait recruter davantage d’enseignants pour réduire le nombre d’élèves par classe. |
| cli-05 | Logement et transports | Les transports en commun devraient être gratuits ou beaucoup moins chers, financés par l’impôt. |
| log-01 | Logement et transports | Les communes devraient rester obligées d’avoir un minimum de logements sociaux. |
| log-02 | Logement et transports | L’État devrait financer la construction de beaucoup plus de logements sociaux. |
| log-03 | Logement et transports | L’interdiction progressive de louer les logements les plus mal isolés devrait être maintenue. |
| log-04 | Logement et transports | Les zones à faibles émissions (ZFE), qui limitent l’accès des véhicules les plus polluants à certaines villes, devraient être supprimées. |
| tra-04 | Logement et transports | Les loyers devraient être plafonnés dans les zones où il est difficile de se loger. |
| tra-06 | Logement et transports | Les services publics de proximité (bureau de poste, gare, maternité) devraient être maintenus même lorsqu’ils coûtent cher. |
| sec-01 | Sécurité et justice | Il faudrait augmenter les effectifs de police et de gendarmerie. |
| sec-02 | Sécurité et justice | Les courtes peines de prison devraient plus souvent être remplacées par d’autres sanctions. |
| sec-03 | Sécurité et justice | La reconnaissance faciale par caméra devrait être autorisée dans l’espace public. |
| sec-07 | Sécurité et justice | Des peines minimales obligatoires (peines planchers) devraient être instaurées pour certains délits et crimes. |
| sec-08 | Sécurité et justice | Les mineurs de 16 ans et plus devraient pouvoir être jugés plus souvent comme des majeurs. |
| sec-09 | Sécurité et justice | L’État devrait construire davantage de places de prison. |
| imm-01 | Immigration et nationalité | L’aide médicale d’État (AME) devrait être limitée aux soins urgents. |
| imm-02 | Immigration et nationalité | Un enfant né en France de parents étrangers ne devrait plus pouvoir devenir français du seul fait de sa naissance et de sa résidence en France. |
| imm-03 | Immigration et nationalité | L’accès au logement social et à certaines aides devrait être réservé en priorité aux personnes de nationalité française. |
| imm-04 | Immigration et nationalité | Un référendum sur l’immigration devrait être organisé. |
| imm-05 | Immigration et nationalité | Les étrangers non européens résidant légalement en France depuis plusieurs années devraient pouvoir voter aux élections municipales. |
| imm-06 | Immigration et nationalité | Le regroupement familial devrait être fortement restreint ou suspendu. |
| imm-07 | Immigration et nationalité | Toutes les personnes sans titre de séjour présentes en France devraient être régularisées. |
| sec-04 | Immigration et nationalité | Le nombre de personnes étrangères autorisées à s’installer en France chaque année devrait baisser. |
| sec-05 | Immigration et nationalité | Les personnes sans titre de séjour qui travaillent dans des métiers qui peinent à recruter devraient pouvoir être régularisées plus facilement. |
| sec-06 | Immigration et nationalité | L’accès des personnes étrangères en situation régulière à certaines aides sociales devrait exiger une durée de résidence plus longue. |
| lib-01 | Libertés, droits et laïcité | Une personne atteinte d’une maladie grave et incurable devrait pouvoir obtenir une aide à mourir, sous conditions strictes. |
| lib-02 | Libertés, droits et laïcité | L’accès aux réseaux sociaux devrait être interdit aux moins de 15 ans. |
| lib-03 | Libertés, droits et laïcité | La consommation de cannabis par les adultes devrait être légalisée et encadrée. |
| lib-04 | Libertés, droits et laïcité | Les sanctions contre les entreprises qui ne réduisent pas les écarts de salaire entre femmes et hommes devraient être renforcées. |
| lib-05 | Libertés, droits et laïcité | Chaque contrôle d’identité devrait donner lieu à la remise d’un récépissé. |
| lib-06 | Libertés, droits et laïcité | Le port de signes religieux devrait être davantage restreint dans l’espace public. |
| lib-07 | Libertés, droits et laïcité | La gestation pour autrui (GPA) devrait être autorisée en France, sous conditions. |
| lib-08 | Libertés, droits et laïcité | L’accès à la PMA pour les couples de femmes et les femmes seules, ouvert en 2021, devrait être supprimé. |
| lib-09 | Libertés, droits et laïcité | Les traitements médicaux de changement de sexe (bloqueurs de puberté, hormones) devraient être interdits avant 18 ans. |
| cli-01 | Climat et énergie | La France devrait construire de nouveaux réacteurs nucléaires. |
| cli-02 | Climat et énergie | Les vols intérieurs devraient être limités lorsqu’un trajet en train existe. |
| cli-04 | Climat et énergie | Les taxes sur les énergies fossiles devraient augmenter, avec une compensation versée aux ménages modestes. |
| cli-06 | Climat et énergie | Les normes environnementales imposées aux agriculteurs et aux entreprises devraient être allégées. |
| cli-07 | Climat et énergie | La France devrait arrêter de construire de nouvelles éoliennes. |
| cli-08 | Climat et énergie | Le prix de l’électricité en France devrait être fixé selon les coûts de production français, hors du marché européen. |
| cli-09 | Climat et énergie | La vente de voitures neuves essence et diesel devrait rester autorisée après 2035. |
| ani-01 | Animaux, agriculture et alimentation | Les élevages où les animaux n’ont jamais accès à l’extérieur devraient être progressivement interdits. |
| ani-02 | Animaux, agriculture et alimentation | La corrida devrait être interdite partout en France. |
| ani-03 | Animaux, agriculture et alimentation | La chasse devrait être interdite certains jours de la semaine, par exemple le dimanche. |
| ani-04 | Animaux, agriculture et alimentation | La chasse à courre devrait être interdite. |
| ani-05 | Animaux, agriculture et alimentation | L’élevage de chiens et de chats destinés à la vente devrait être interdit. |
| ani-06 | Animaux, agriculture et alimentation | L’abattage des animaux sans étourdissement préalable devrait être interdit, y compris pour des motifs religieux. |
| ani-07 | Animaux, agriculture et alimentation | L’État devrait garantir aux agriculteurs des prix minimums pour leurs produits. |
| ani-08 | Animaux, agriculture et alimentation | Les cantines publiques devraient proposer chaque jour un repas végétarien au choix. |
| ani-09 | Animaux, agriculture et alimentation | Une sécurité sociale de l’alimentation devrait donner à chacun un budget mensuel pour acheter des aliments choisis. |
| cli-03 | Animaux, agriculture et alimentation | L’usage des pesticides en agriculture devrait être réduit, même si cela augmente certains coûts de production. |
| eur-01 | Europe et monde | La France devrait confier davantage de décisions à l’Union européenne. |
| eur-02 | Europe et monde | La France devrait pouvoir écarter une règle européenne lorsqu’elle contredit un choix national. |
| eur-03 | Europe et monde | Le budget de la défense devrait continuer à augmenter. |
| eur-04 | Europe et monde | L’Union européenne devrait conclure moins d’accords de libre-échange avec d’autres régions du monde. |
| eur-05 | Europe et monde | Les grands investissements communs européens (défense, énergie, industrie) devraient être financés par un emprunt commun de l’Union. |
| eur-06 | Europe et monde | L’aide versée par la France aux pays pauvres devrait augmenter. |
| eur-07 | Europe et monde | La France devrait continuer à fournir une aide militaire à l’Ukraine. |
| eur-08 | Europe et monde | La France devrait quitter le commandement militaire intégré de l’OTAN. |
| eur-09 | Europe et monde | La France devrait quitter l’Union européenne. |
| eur-10 | Europe et monde | La France devrait cesser toute livraison d’armes et de composants militaires à Israël. |
| eur-11 | Europe et monde | La France devrait pouvoir ne pas appliquer les décisions de la Cour européenne des droits de l’homme sur l’immigration. |
| dem-01 | Démocratie et institutions | Les députés devraient être élus à la proportionnelle. |
| dem-02 | Démocratie et institutions | Les citoyens devraient pouvoir déclencher un référendum par pétition. |
| dem-03 | Démocratie et institutions | L’article 49.3 de la Constitution devrait être supprimé ou fortement limité. |
| dem-04 | Démocratie et institutions | Une condamnation pour corruption devrait toujours entraîner l’inéligibilité, sans exception possible. |
| dem-05 | Démocratie et institutions | Les régions, départements et communes devraient avoir plus de pouvoirs et de ressources propres. |
| dem-06 | Démocratie et institutions | Le vote blanc devrait être compté dans les suffrages exprimés. |
| dem-07 | Démocratie et institutions | Le nombre de députés et de sénateurs devrait être réduit. |
| dem-08 | Démocratie et institutions | Une nouvelle Constitution devrait être rédigée par une assemblée élue à cet effet. |
| dem-09 | Démocratie et institutions | L’audiovisuel public (France Télévisions, Radio France) devrait être privatisé. |
| dem-10 | Démocratie et institutions | La loi devrait limiter davantage le nombre de médias qu’un même propriétaire peut détenir. |
| dem-11 | Démocratie et institutions | Une règle limitant le déficit public devrait être inscrite dans la Constitution. |
| dem-12 | Démocratie et institutions | Un échelon de collectivités locales (région, département ou intercommunalité) devrait être supprimé. |
| dem-13 | Démocratie et institutions | Les électeurs devraient pouvoir révoquer un élu en cours de mandat par référendum. |
