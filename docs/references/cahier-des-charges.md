# Cahier des charges du média et de la plateforme Ça vote

**Document de référence pour la conception, le développement par IA, la validation et l’exploitation éditoriale.**

Nom de travail : **Ça vote ?** La disponibilité du nom, de la marque et du domaine reste à vérifier. Ce document ne vaut pas validation de ces disponibilités.

Le projet est un média satirique indépendant adossé à un outil d’exploration politique. Il part des préférences du votant, explicite ses priorités et ses arbitrages, puis lui permet d’examiner les propositions documentées des acteurs politiques. Son utilité se prolonge au fil de la campagne grâce à la veille, aux versions des programmes, au recalcul local et à la création de visuels partageables.

Ce cahier des charges ne contient ni calendrier de réalisation, ni échéance de livraison. Les horodatages mentionnés dans les spécifications sont des données indispensables à la traçabilité des sources, et non des dates de projet. Les exigences chiffrées sont des paramètres de conception initiaux à tester ; elles ne constituent pas des garanties scientifiques.

## 1 Règles de lecture et autorité du document

**DOIT** désigne une obligation de conformité. **DEVRAIT** désigne une recommandation dont tout écart doit être documenté. **PEUT** désigne une extension facultative. Une fonctionnalité annoncée ne doit jamais être simulée comme fonctionnelle en production.

Les instructions du propriétaire du projet priment sur ce document. Une modification de méthode exige une nouvelle version, une justification publique et de nouveaux tests. L’IA de développement ne doit pas résoudre une ambiguïté méthodologique en inventant une position politique, un coefficient de fiabilité ou une source.

Les exemples politiques et numériques sont fictifs sauf mention explicite d’une source. Aucun exemple ne doit devenir une donnée publiée sur un candidat réel.

## 2 Positionnement et promesse

### 2.1 Le problème à résoudre

Le public principal veut participer à la vie démocratique mais se reconnaît mal dans l’offre politique et ne souhaite pas croire une déclaration, un plateau télévisé ou un classement sur parole. Il peut partager des idées avec plusieurs familles politiques sans se reconnaître dans leurs partis. Les personnes qui ne se retrouvent ni dans le RN ni dans LFI appartiennent au cœur de cible, sans constituer une règle d’exclusion du produit.

Le site doit accueillir toutes les sensibilités, appliquer les mêmes règles aux acteurs politiques et ne pas orienter le questionnaire pour fabriquer un résultat « raisonnable », centriste ou favorable aux opinions de l’équipe.

### 2.2 La promesse publique

« Tu veux voter, mais tu ne sais plus à qui faire confiance. Commence par préciser ce que tu veux. Ici, on examine les propositions, les actes et les déclarations, avec leurs sources et leurs limites, pour t’aider à faire un choix éclairé. Nos analyses aussi se vérifient. »

Signature : **Les résultats sont sérieux. Le reste beaucoup moins.**

Accroche principale : **Tu sais ce que tu veux. Beaucoup moins qui le représente.**

Le site ne doit pas présenter comme un fait général que « les médias sont manipulés ». Il doit traiter les biais, erreurs, cadrages et conflits d’intérêts lorsqu’ils sont documentables. La défiance est un problème auquel répondre, pas une croyance à exploiter.

### 2.3 Engagement éditorial

Le média assume un engagement en faveur de la vérifiabilité des faits, du pluralisme, des droits fondamentaux, de la participation démocratique et de la transparence. Il peut conclure qu’une affirmation est fausse, qu’une proposition exige une modification du droit ou que deux engagements se contredisent lorsque les éléments le démontrent.

Il ne doit pas entretenir une fausse équivalence entre une affirmation étayée et une affirmation réfutée. Il ne doit pas non plus convertir sa doctrine éditoriale en bonus ou malus caché dans le score.

L’aide à la décision doit être concrète : désaccords essentiels, concessions nécessaires, angles morts documentaires, conditions d’application et informations à consulter avant de trancher. Elle ne doit jamais prendre la forme d’une consigne personnalisée de vote ou d’une campagne de persuasion adaptée au profil politique.

### 2.4 Déclaration d’indépendance

Texte cible, publiable seulement après vérification de chaque affirmation :

« Le projet n’est affilié à aucun parti, candidat ou organisation politique et ne reçoit aucun financement politique. Les membres de l’équipe ne sont adhérents à aucun parti politique. Nous avons des opinions ; elles ne doivent pas entrer dans les règles de calcul. Nos sources, notre méthode et nos corrections sont consultables. »

L’absence d’adhésion est un engagement à vérifier et à maintenir, pas un badge à générer automatiquement. Le registre interne des conflits d’intérêts doit couvrir fonctions politiques, prestations, financements et liens susceptibles d’affecter le travail. Les conflits pertinents doivent être signalés publiquement sans publier inutilement des opinions individuelles sensibles.

La phrase satirique « On ne sait pas encore pour qui on votera. Pour qui on ne votera pas, ça commence à se préciser » peut apparaître dans le manifeste, sans désigner de candidat et sans servir de promesse d’impartialité.

## 3 Périmètre du produit

Le produit doit réunir sur un seul domaine un site public indexable, une application web installable, un espace éditorial, un studio de création et une boutique distincte. La mécanique souhaitée reprend le principe vitrine publique puis espace de suivi récurrent évoqué à partir de GLP1Suivi, sans copier ses contenus, son identité ou son code.

La consultation et le test ne doivent demander ni compte ni email. L’espace « Mon profil » est un espace local sur l’appareil, non un compte serveur dissimulé. La PWA est installable, mais l’installation n’est jamais obligatoire.

| Surface | Route cible | Fonction indispensable |
|---|---|---|
| Accueil | `/` | Expliquer la promesse et démarrer le bilan |
| Bilan | `/test` | Réponses, arbitrages, priorités et sauvegarde locale |
| Espace local | `/mon-profil` | Profil, priorités, version et reprise |
| Résultats | `/resultats` | Proximités documentées, limites et explications |
| Évolutions | `/changements` | Différences pertinentes et recalcul |
| Média | `/radar` | Articles et suivi des déclarations |
| Acteurs | `/acteurs/[slug]` | Statut, positions, programme et sources |
| Thèmes | `/themes/[slug]` | Explications et corpus par sujet |
| Comparaison | `/comparateur` | Comparaison secondaire entre acteurs |
| Vie concrète | `/pour-moi` | Mesures susceptibles de concerner la situation saisie |
| Tendances | `/tendances` | Statistiques volontaires avec limites visibles |
| Studio | `/studio` | Posts, stories, fonds d’écran et exports locaux |
| Boutique | `/boutique` | Objets et packs sans influence sur le calcul |
| Méthode | `/methodologie` | Questions, codage, formules, paramètres et limites |
| Preuves | `/sources` | Référentiel consultable et versions |
| Corrections | `/corrections` | Errata, décisions et effets sur les résultats |
| Gouvernance | `/independance` | Doctrine, financement et conflits pertinents |
| Observatoire des médias | `/medias` | Propriété, financement, contrôle, orientations et contenus analysés |
| Administration | `/admin` | Veille, validation, publication et incidents |

Les routes personnelles doivent être exclues de l’indexation. Leur URL ne doit contenir aucune réponse, score, priorité ou identifiant de profil. Les liens publics doivent pointer vers un article ou le test, pas vers une page exposant le résultat individuel.

## 4 Identité graphique et ton

### 4.1 Système visuel

Univers : journal imprimé, annotations humaines et interaction numérique nette. Références de mécanismes éditoriaux : satire de presse, gros titres, dessins au trait et commentaires incisifs. Ne pas reproduire les logos, dessins, maquettes ou signatures distinctives de Charlie Hebdo ou du Canard enchaîné.

| Usage | Valeur initiale | Règle |
|---|---|---|
| Papier | `#F3EBDD` | Fond général, texture discrète facultative |
| Encre | `#151515` | Texte principal |
| Rouge éditorial | `#E3262E` | Annotations, corrections, alertes documentées |
| Jaune stabilo | `#FFD84D` | Mise en évidence avec texte encre |
| Bleu interactif | `#3264FF` | Actions et focus, contraste vérifié |
| Surface | `#FFFFFF` | Cartes et documents |

Typographies proposées : une sans sérif massive pour les titres, une sérif lisible pour les contenus longs et une écriture manuscrite réservée aux annotations brèves. Les polices doivent être auto-hébergées, licenciées et chargées sans requête à un tiers depuis le parcours politique.

Les couleurs ne doivent pas suggérer implicitement des affiliations partisanes. Une couleur d’acteur doit rester stable et ne pas être la seule information permettant de le reconnaître. Les scores doivent fonctionner en monochrome.

### 4.2 Ton éditorial

Tutoiement dans l’expérience, vocabulaire précis dans la méthode, humour ciblant discours, raisonnements, promesses et mise en scène. Ne jamais ridiculiser l’utilisateur pour une difficulté de compréhension, une origine, une vulnérabilité ou une réponse.

Une carte miroir doit montrer ce qu’elle a déduit et les réponses utilisées. La plaisanterie ne doit pas prétendre démontrer une contradiction que le moteur n’a pas établie. Vouloir davantage de services publics et moins d’impôts n’est pas en soi une contradiction : il peut exister d’autres ressources ou arbitrages.

Exemple admissible : « Tu veux renforcer l’hôpital et réduire les prélèvements. La question suivante porte sur la façon de financer les deux. Le tableur vient de s’asseoir à côté de toi. »

Chaque interlude doit être ignorable. Un mode sobre doit conserver l’ensemble des informations et retirer les commentaires satiriques. Le sérieux des faits ne doit pas dépendre de la présence de l’humour.

## 5 Parcours du premier bilan

### 5.1 Avant la première réponse

Présenter l’objectif, la possibilité de passer une question, le calcul local, les limites du résultat et la possibilité d’effacer les données. Aucun email, inscription, consentement commercial ou contribution statistique ne conditionne l’accès.

L’utilisateur choisit une session sans conservation après fermeture ou une sauvegarde locale explicite. Expliquer que l’effacement des données du navigateur peut supprimer le profil et qu’un appareil partagé exige de la prudence. Ne pas promettre une synchronisation multiappareil inexistante.

### 5.2 Socle initial

Prévoir 42 items principaux, répartis en sept chapitres de six items. Ce nombre est une cible de conception à valider par les essais de compréhension, pas une preuve que le profil serait complet. Les approfondissements ne doivent pas remplacer silencieusement le socle comparable.

| Chapitre | Domaines à couvrir |
|---|---|
| Ressources et économie | Fiscalité, redistribution, dette, régulation, entreprises, pouvoir d’achat |
| Travail et biens communs | Emploi, retraites, santé, éducation, logement, services publics |
| Sécurité et migrations | Justice, police, prévention, immigration, asile, intégration |
| Libertés et société | Vie privée, expression, égalité, discriminations, droits et autonomie |
| Climat et ressources | Énergie, transport, agriculture, adaptation, biodiversité, financement |
| Europe et monde | Intégration européenne, souveraineté, échanges, défense, coopération |
| Démocratie et institutions | Représentation, contrôle, participation, décentralisation, probité, pouvoirs |

Prévoir des dimensions descriptives séparées : intervention économique, redistribution, biens communs, autonomie individuelle, contrôle sécuritaire, ouverture migratoire, transition écologique, intégration européenne et transformation institutionnelle. Les définitions doivent être publiques, et leur indépendance ne doit pas être prétendue sans validation.

Les questions doivent couvrir des enjeux importants même lorsque tous les acteurs sont d’accord. Le questionnaire ne doit pas être sélectionné uniquement pour maximiser les différences entre partis ou le potentiel viral.

### 5.3 Structure de chaque item

Chaque question possède un identifiant immuable, un thème principal, un concept unique, une formulation neutre, une explication courte, les options, une règle de codage, les éventuelles dimensions alimentées et une version sémantique.

Une question ne doit pas associer deux politiques auxquelles on pourrait répondre différemment. Les termes techniques doivent être expliqués. Les chiffres nécessaires doivent être sourcés ; un chiffre hypothétique doit être annoncé comme hypothétique.

Options ordinales : tout à fait opposé, plutôt opposé, position intermédiaire, plutôt favorable, tout à fait favorable. Ajouter séparément « Je ne sais pas », « Je préfère passer » et, lorsque pertinent, « Cela dépend » avec une clarification facultative.

La position intermédiaire est une réponse substantielle. L’ignorance et l’omission sont des valeurs manquantes, jamais un zéro politique. Une réponse conditionnelle non résolue n’est pas convertie automatiquement au milieu de l’échelle.

Pour un arbitrage non ordinal, utiliser des alternatives explicites et une matrice de distances documentée ; ne pas plaquer une échelle gauche droite. Les vignettes de compréhension ne participent pas au score.

### 5.4 Priorités et lignes rouges

Après le socle, distribuer dix jetons entre les sept thèmes. Le parcours peut proposer une répartition uniforme sans obliger à inventer des priorités. L’utilisateur peut marquer des propositions comme essentielles et identifier ses lignes rouges.

Les lignes rouges doivent apparaître à part : « désaccord documenté sur une exigence essentielle » ou « position inconnue ». Elles ne produisent aucun malus secret et ne suppriment aucun acteur de la comparaison par défaut.

L’utilisateur peut masquer un acteur à sa demande. L’interface indique alors que la sélection est personnelle et permet de restaurer la liste complète. Le score des autres ne change pas.

### 5.5 Respiration et reprise

Afficher progression réelle, retour arrière, sauvegarde locale, chapitre terminé et carte miroir. Une modification de réponse doit recalculer toutes les conclusions dépendantes et invalider les exports préparés avec l’ancienne réponse.

Les interludes doivent venir de règles explicites, exécutées localement. Un LLM ne doit pas recevoir les réponses de l’utilisateur pour produire une analyse humoristique ou une interprétation politique.

## 6 Validation du questionnaire et du profil

Avant publication, chaque item doit être examiné pour ambiguïté, orientation, double question, accessibilité, présupposé et correspondance possible avec les positions publiques. Prévoir des essais avec des sensibilités politiques et niveaux de connaissance variés.

Les dimensions doivent être décrites comme des résumés des réponses à ce questionnaire, pas comme un diagnostic de personnalité ou une mesure exhaustive de l’identité politique. Les adjectifs « libertaire », « conservateur » ou « libéral » exigent une définition ; l’utilisateur peut choisir un résumé descriptif sans étiquette.

Une dimension nécessite au moins trois items répondus et au moins 60 % de ses items disponibles. À défaut : « Pas assez de réponses pour résumer ce point ». Les seuils doivent être exposés dans la méthode et réévalués après validation.

Pour une dimension d’items ordinalement codés de −2 à +2, appliquer les orientations publiées puis une moyenne pondérée, transformée en indice 0 à 100. Les poids des items sont égaux au sein du concept, sauf justification publique. L’indice est une position sur une échelle définie, jamais « 82 % de gauche ».

Un pourcentage de questions répondues peut être affiché comme complétude. Il ne doit pas être rebaptisé « profil fiable à 92 % ». La fiabilité psychométrique, si étudiée, doit être rapportée avec sa méthode et ses limites. Aucun chiffre de confiance ne doit être inventé.

## 7 Doctrine des sources

### 7.1 Distinguer la position et la vérité

Un programme officiel est une source forte pour établir ce qu’un acteur propose. Il ne prouve pas que sa promesse est financée, réalisable ou que sa description du monde est exacte. Une statistique officielle renseigne un fait dans un périmètre donné ; elle ne constitue pas une position de candidat.

Le référentiel doit séparer propositions, déclarations, actes, votes, faits contextuels et analyses de faisabilité. La popularité d’une publication ou le nombre de médias qui la reprennent ne constitue pas une preuve supplémentaire si tous citent la même origine.

### 7.2 Sources et usages autorisés

| Famille | Usage principal | Contrôle indispensable |
|---|---|---|
| Programme personnel authentifié | Engagement explicite du candidat | Élection, version, auteur, retrait ou remplacement |
| Document officiel de parti | Position du parti | Attribution distincte du candidat et mandat concerné |
| Texte législatif et vote officiel | Action ou décision précisément documentée | Texte voté, amendement, étape, mandat et portée |
| Entretien ou discours intégral | Déclaration personnelle | Enregistrement ou texte complet, contexte et passage |
| Organisme statistique ou institution | Fait, droit, compétence, coût publié | Définition, méthode, périmètre et version |
| Recherche et expertise indépendante | Analyse et éléments contradictoires | Méthode, financement, limites et pertinence |
| Média d’information | Détection, contextualisation, enquête | Origine des affirmations et preuves consultables |
| Réseau social officiel | Déclaration attribuable | Authenticité, modifications, caractère incomplet |
| Extrait viral, compte anonyme, rumeur | Signal de veille uniquement | Aucune attribution publiable sans vérification |

Répertoire cible : sites officiels des acteurs et partis, Conseil constitutionnel pour les candidatures officielles, Assemblée nationale, Sénat, Légifrance, Journal officiel, INSEE, Eurostat, DREES, DARES, Banque de France, Cour des comptes et institutions compétentes selon le sujet. Une source ne doit pas être considérée infaillible du seul fait qu’elle appartient à cette liste.

### 7.3 Traçabilité minimale

Pour toute assertion publiée, conserver : URL canonique, éditeur, auteur ou locuteur, type, titre, horodatage de publication connu ou valeur inconnue, horodatage de collecte, dernière vérification effective, document ou extrait autorisé, page ou timecode, contexte utile, langue, empreinte du contenu, statut d’accès et droits de conservation.

Une copie interne ou un extrait doit permettre l’audit dans les limites des droits d’accès et de reproduction. Une capture d’écran seule ne remplace pas l’identification de la source. Une source derrière abonnement ne doit pas être contournée ; privilégier une preuve publique ou indiquer la restriction.

La dernière vérification ne peut être mise à jour par une simple visite du robot : elle représente le contrôle défini et exécuté. Afficher séparément « collecté », « revu » et « publié ».

### 7.4 Qualification documentaire

Utiliser des statuts explicables : explicite et directement attribuable ; explicite mais conditionnel ; attribution au parti uniquement ; déclaration provisoire ; ambigu ; contradictoire ; inconnu ; retiré ; remplacé.

Ne pas calculer un « 83 % de fiabilité de la source » sans procédure validée. Le nombre de sources, leur indépendance et les raisons de qualification doivent être visibles. Deux sources concordantes peuvent renforcer une attribution ; une seule source primaire explicite peut suffire. Aucun quota ne remplace l’examen du contexte.

## 8 Codage des positions politiques

Chaque position doit correspondre à un item versionné et à un acteur identifié. Elle doit contenir une valeur ordinale, un ensemble de valeurs possibles ou une valeur manquante, ainsi qu’une justification traçable.

Le manuel de codage doit préciser ce qui distingue chaque niveau, les conditions à conserver et les inférences interdites. « Pour » ne doit devenir « tout à fait pour » que si le manuel et la source justifient cette intensité. Les niveaux adjacents ambigus doivent être conservés comme ensemble possible plutôt que départagés arbitrairement.

La position personnelle du candidat prévaut pour son propre engagement lorsqu’elle est explicite et applicable. Une position de parti peut apparaître comme contexte, mais ne doit pas être imputée au candidat sans preuve d’adoption. Un vote passé ne doit pas être assimilé automatiquement à un engagement futur.

Une déclaration récente n’annule pas automatiquement un programme. En cas de conflit, présenter les deux, qualifier l’éventuelle rétractation et demander une décision éditoriale. Si le conflit n’est pas résolu, utiliser l’ensemble des codages admissibles ou exclure l’item du score central.

Une absence de position, une abstention ou une absence parlementaire ne signifie pas un avis intermédiaire. Un vote sur un texte comportant plusieurs mesures ne permet pas d’attribuer séparément chaque mesure sans élément supplémentaire.

Toute position qui entre dans un calcul public exige deux examens indépendants. Les deux lecteurs doivent accéder à la preuve complète. Un désaccord de codage est arbitré et consigné. Deux modèles d’IA ne valent pas deux validations humaines indépendantes.

Une équipe réduite peut automatiser collecte, extraction et propositions de codage. Si elle ne peut assurer la validation, les éléments restent en attente et l’interface affiche la limite. Le produit ne doit pas compenser le manque de relecture par une assurance artificielle.

## 9 Veille intensive et publication réactive

### 9.1 Architecture de la veille

Combiner abonnements RSS, API autorisées, notifications de sources, suivi des documents officiels, surveillance de contenu par empreinte et import éditorial. Les modalités doivent respecter accès, licences et conditions des services. Ne pas dépendre uniquement des moteurs de recherche ou d’une seule IA.

La couverture doit être symétrique : mêmes classes de sources surveillées pour tous les acteurs, avec exceptions documentées pour l’absence de canal ou de publication. Le tableau de bord doit révéler les écarts de couverture, pas seulement le volume d’articles produits.

### 9.2 Chaîne obligatoire

1. Détecter ou recevoir une nouvelle pièce.
2. Vérifier l’origine, l’accès et l’authenticité.
3. Archiver ce qui peut légalement l’être et calculer l’empreinte.
4. Dédupliquer les reprises d’une même source.
5. Extraire les assertions candidates avec citations et contexte.
6. Identifier acteur, thème, proposition et éventuels conflits.
7. Proposer une qualification et les items potentiellement concernés.
8. Faire examiner les éléments et codages.
9. Prévisualiser les effets sur des profils synthétiques.
10. Publier une version atomique et son journal de changement.
11. Mettre à disposition l’article ou la fiche puis notifier le client d’une version disponible.

L’actualité peut être marquée « nouvelle pièce détectée, analyse en cours ». Elle ne doit pas modifier les scores avant validation. La promesse de quasi temps réel porte sur la détection et la diffusion des publications validées ; elle ne doit pas prétendre que tous les faits sont vérifiés instantanément.

### 9.3 Priorisation et maîtrise de la charge

Prioriser nouveau programme, retrait de candidature, correction majeure, mesure explicite, évolution sur une priorité de campagne et conflit documentaire. La viralité seule ne doit pas passer devant la qualité de la preuve.

Le tableau de bord doit mesurer âge des pièces en attente, sources en échec, acteurs sous-couverts, propositions non revues, divergences de codage et coûts d’ingestion. Les budgets de recherche et de LLM doivent être configurables. En cas de surcharge : réduire les résumés accessoires, préserver les vérifications et rendre le retard visible.

### 9.4 Distinguer surveillance et promesse de service

Afficher la dernière collecte réussie et la dernière revue substantielle par flux. Une panne ne doit pas produire le message « aucune nouveauté ». Le système doit afficher « surveillance interrompue » ou « référentiel conservé, nouvelles pièces non vérifiées » selon le cas.

Aucun engagement numérique de fraîcheur ne doit être communiqué avant que les mesures de fonctionnement le justifient. Les objectifs d’exploitation sont configurables et contrôlés ; le lancement dépend de la qualité constatée, non d’une date.

## 10 Moteur de proximité politique

### 10.1 Objet exact du score

Le score est un **indice de proximité avec les réponses, sur les positions documentées du questionnaire**. Ce n’est ni une probabilité de vote, ni une proportion exacte du programme approuvé, ni une garantie de représentation ou d’exécution future.

Libellé recommandé : « Proximité sur les sujets documentés : 74 sur 100 ». Une présentation en pourcentage doit conserver cette définition immédiatement accessible. Ne pas utiliser « 74 % de tes choix représentés » : la distance entre positions n’est pas une mesure de représentation complète.

L’interface doit présenter séparément proximité, couverture documentaire, réponses manquantes, désaccords essentiels et robustesse de l’ordre affiché.

### 10.2 Codage et distance

Pour les items ordinaux : réponse utilisateur `uᵢ ∈ {−2,−1,0,1,2}` ; position validée `cᵢ` sur la même échelle. Valeur manquante : `null` avec raison.

Distance normalisée : `dᵢ = |uᵢ − cᵢ| / 4`. Proximité d’item : `sᵢ = 1 − dᵢ`.

Pour un item non ordinal, utiliser une fonction `dᵢ(u,c)` symétrique, bornée entre 0 et 1 et publiée dans le manuel. Toutes les distances doivent correspondre à une différence de politique explicable ; elles ne sont pas choisies pour arranger le classement.

### 10.3 Pondération par thèmes

Le score global donne le même poids aux sept thèmes : `bₜ = 1/7`. Si `nₜ` est le nombre d’items actifs du thème, chaque item reçoit `wᵢ = bₜ/nₜ`. Ajouter des questions à un thème ne doit pas augmenter son poids total.

Pour le score selon les priorités, si `pₜ` est le nombre de jetons d’un thème et `Σpₜ = 10`, utiliser `bₜ = (1+pₜ)/17`, puis `wᵢ = bₜ/nₜ`. Le socle de 1 empêche qu’un thème disparaisse silencieusement. Un mode concentré uniquement sur les priorités peut être proposé séparément, avec son propre libellé.

Les lignes rouges restent des indicateurs distincts. Les options de pondération sont toujours visibles et modifiables. Aucun poids dépendant de l’identité du candidat n’est autorisé.

### 10.4 Couverture et score central

Soit `A` l’ensemble des items répondus par l’utilisateur et `K_c` les items de `A` dotés d’une position candidate utilisable. Les formules s’appliquent séparément aux poids globaux et aux poids prioritaires.

`W = Σ(i∈A) wᵢ`

`Wc = Σ(i∈Kc) wᵢ`

`Couverture_c = Wc / W`

`Score_observé_c = 100 × Σ(i∈Kc)(wᵢ × sᵢ) / Wc`

Si `W=0`, aucun résultat. Si `Wc=0`, aucune proximité calculable. Le score observé ne doit pas récompenser indirectement un candidat dont seules les positions avantageuses sont connues.

### 10.5 Bornes documentaires

Définir une borne basse qui suppose une proximité nulle sur les items inconnus, et une borne haute qui suppose une proximité maximale :

`Basse_c = 100 × Σ(i∈Kc)(wᵢ × sᵢ) / W`

`Haute_c = Basse_c + 100 × (W − Wc) / W`

Ces bornes sont des scénarios d’information manquante, pas un intervalle de confiance statistique. Elles sont conservatrices et peuvent être larges.

Pour une position connue mais codée par ensemble de valeurs possibles, utiliser pour les bornes la proximité minimale et maximale sur cet ensemble. Ne pas calculer un score central avec le milieu de cet ensemble sans convention explicite et justifiée ; par défaut, l’item ambigu n’entre pas dans le score central.

### 10.6 Comparabilité et classement

Le classement principal doit utiliser un socle commun de positions non ambiguës disponibles pour tous les acteurs de la sélection. Le moteur publie la couverture de ce socle et le nombre de thèmes représentés.

Paramètres initiaux de publication d’un classement : l’utilisateur a répondu à au moins 28 des 42 items du socle et à la moitié des items dans au moins cinq thèmes ; au moins 70 % du poids répondu est disponible sur le socle commun ; au moins cinq thèmes sont représentés dans ce socle ; au moins 60 % du poids des items marqués essentiels est couvert. Un ensemble essentiel vide n’impose pas ce dernier seuil. Ces seuils sont des garde-fous de produit à éprouver, non des constantes scientifiques. Un questionnaire inachevé peut afficher un aperçu explicitement provisoire, sans podium assuré.

En dessous des seuils, présenter les acteurs en liste alphabétique avec leurs dossiers, proximités observées et données manquantes. Afficher « Données insuffisamment comparables pour classer ». Ne pas forcer un podium.

Les critères d’inclusion des acteurs sont publics. Avant une liste officielle, distinguer personnes ayant déclaré leur candidature, personnes ayant annoncé une démarche et personnalités seulement évoquées. Les dernières ne doivent pas être intégrées par défaut au classement des candidats. Un acteur peu documenté reste visible comme dossier incomplet et ne disparaît pas sans explication.

Si l’utilisateur compare une sélection personnelle, recalculer le socle commun et signaler que sa composition a changé. Pour faciliter la stabilité, afficher aussi les proximités par acteur sur le même référentiel individuel, sans les présenter comme directement comparables si les couvertures diffèrent.

Les différences inférieures à deux points sur le socle commun sont affichées comme proches, avec ordre non déterminant. Tester aussi des codages alternatifs admissibles et variations modérées des poids ; si l’ordre change, le résultat indique « ordre sensible aux hypothèses ». Une analyse de sensibilité n’est pas une probabilité de classement.

### 10.7 Exemple de référence

Quatre items de même poids, tous répondus ; trois positions connues ; proximités 1, 0,5 et 0. Proximité observée : 50 sur 100. Couverture : 75 %. Borne basse : 37,5 ; borne haute : 62,5. Le moteur doit reproduire ces valeurs avant arrondi.

Conserver les valeurs exactes pour le calcul et arrondir uniquement l’affichage. Un ordre ne doit jamais dépendre d’un arrondi ou d’un tri alphabétique caché présenté comme une préférence.

## 11 Résultats et aide concrète à la décision

Ordre de présentation obligatoire : résumé descriptif des préférences ; priorités ; proximités avec limites ; accords ; désaccords essentiels ; informations manquantes ; preuves ; possibilités d’approfondissement ; studio facultatif.

Chaque fiche doit permettre « Pourquoi ce résultat » avec réponse utilisateur, position attribuée, extrait court, source, poids, distance, contribution et version. Un utilisateur doit pouvoir refaire le calcul sans demander à une IA de lui expliquer une boîte noire.

Le produit peut afficher : « A est plus proche sur tes réponses globales ; B l’est davantage sur tes priorités ; C manque de positions sur deux sujets essentiels ». Il ne doit pas afficher : « Tu devrais voter B ».

Prévoir un bilan de décision exportable localement : ce que je veux, mes exigences, les concessions identifiées, les inconnues à lever et les documents à lire. Aucune rubrique ne doit prétendre mesurer honnêteté, compétence ou intégrité à partir du score de proximité.

Un acteur à score élevé peut présenter des désaccords importants ou des contraintes d’application. Ces éléments ne doivent pas être relégués derrière un accord général ou un bouton commercial.

## 12 Suivi et recalcul

Le navigateur conserve, avec l’accord de sauvegarde locale, réponses, priorités, lignes rouges, versions de questions, référentiel utilisé et résultat reproductible. Le serveur publie uniquement des données politiques publiques et leur manifeste.

Lorsqu’un nouveau manifeste est disponible, afficher ce qui a changé, les sujets concernés et un bouton de recalcul. Les réponses ne quittent pas l’appareil. Le recalcul doit pouvoir se faire hors ligne avec le dernier corpus vérifié téléchargé.

Pour expliquer une différence, conserver le même instantané de réponses et de priorités, puis comparer ancien et nouveau référentiel. Séparer effet de position, effet de couverture, changement de socle commun, nouvelle question, correction de méthode et changement de réponse utilisateur.

Une question reformulée sans changement de sens conserve une équivalence documentée. Une modification sémantique demande une nouvelle réponse ; l’ancienne n’est pas transférée silencieusement. Une question ajoutée reste manquante jusqu’à réponse.

Si la pondération ou le dénominateur change, ne pas attribuer tout l’écart à un candidat. Présenter une décomposition exacte lorsque possible et sinon expliquer les facteurs sans inventer une contribution additive.

Les données publiques doivent être diffusées par lots atomiques versionnés. Le client ne doit jamais mélanger questions d’une version et positions d’une autre. Toute rupture de schéma déclenche une migration testée ou un mode de lecture sans perte des anciennes réponses.

## 13 Rubrique Ça change quoi pour moi

La situation personnelle est facultative et reste locale : statut professionnel, tranche de revenus, logement, enfants à charge, transport, territoire large et autres critères uniquement s’ils sont nécessaires à une règle précise. Ne pas collecter de coordonnées, commune exacte ou données de santé par défaut.

Chaque mesure possède une règle d’éligibilité documentée, ses paramètres, conditions, effets possibles et inconnues. Le résultat distingue « pourrait te concerner », « conditions à préciser » et « calcul estimatif possible ».

Un calcul financier doit exposer texte source, situation de référence, unités, hypothèses, exclusions, interactions prises en compte et formule. Ne pas agréger des mesures incompatibles ni présenter un effet mensuel certain d’une promesse non adoptée.

Les conséquences matérielles doivent rester séparées du profil de valeurs et du score politique. Un avantage financier ne doit pas produire automatiquement une proximité idéologique supplémentaire.

Le site ne doit pas promettre un gain personnalisé lorsque les informations ne le permettent pas. Le résultat peut être une question à poser ou une inconnue documentée ; c’est une sortie valide.

## 14 Média Le Radar

Formats : déclaration expliquée ; avant après ; promesse et conditions ; coût documenté ; compétence institutionnelle ; conséquence concrète ; programme résumé ; contradiction démontrée.

Chaque article doit distinguer visuellement fait établi, citation, interprétation, satire et incertitude. La source primaire doit être accessible avant les commentaires. Un titre satirique ne doit pas inventer une citation ou déformer une proposition.

Structure minimale : ce qui est affirmé ; contexte ; ce que les pièces permettent de conclure ; ce qu’elles ne permettent pas de conclure ; éléments contradictoires pertinents ; effet éventuel sur le référentiel ; sources ; historique de correction.

Un bouton « Est-ce que cela concerne mes réponses » peut ouvrir l’analyse locale. Un article sans changement codable doit indiquer qu’il ne modifie pas le score. Une déclaration n’est pas automatiquement une évolution de position.

Les « casseroles » doivent être traitées comme dossiers de faits vérifiés et procédure, avec distinction accusation, enquête, jugement, recours et décision définitive. Aucun badge de culpabilité construit à partir d’une rumeur, aucune notation opaque de moralité.

Le fact-checking peut conclure étayé, réfuté, trompeur par omission, invérifiable ou contesté, selon un manuel public. Les désaccords de valeurs ne doivent pas être qualifiés de fausses informations.

### 14.1 Sources d’information hors contrôle de grandes fortunes

Cette rubrique est une composante obligatoire du positionnement. Elle doit permettre de découvrir et de soutenir des médias dont les mécanismes de propriété, de gouvernance et de financement protègent leur autonomie face aux grandes fortunes et groupes industriels. Elle doit proposer des lectures, enquêtes, vidéos et émissions utiles à la compréhension des sujets, avec leurs preuves et leurs limites.

Promesse : « Regarde aussi qui possède ceux qui t’informent. Ici, tu peux découvrir d’autres rédactions, comprendre comment elles se financent et consulter leurs enquêtes. »

Le répertoire doit distinguer contrôle capitalistique, garanties statutaires, dépendance aux financements, ligne éditoriale et qualité d’une production précise. Une orientation engagée n’annule pas la valeur d’une enquête ; une propriété indépendante ne garantit pas l’exactitude de chaque publication. Ne pas confondre humour, commentaire et enquête.

### 14.2 Fiche et classement du répertoire

Chaque fiche doit exposer : éditeur légal ; détenteurs directs et chaîne de contrôle connue ; droits de vote et mécanismes de gouvernance lorsqu’ils sont accessibles ; source de ces informations ; financement déclaré ; protections de la rédaction ; projet éditorial revendiqué ; types de contenu ; accès gratuit ou payant ; canaux officiels ; politique de correction disponible ; dernière vérification effective ; incertitudes.

Catégories initiales : coopérative ; capital protégé par structure non lucrative ; propriété de la rédaction ou des salariés ; association ; média public ; groupe privé ; propriété ou financement insuffisamment documentés. Un média public n’est pas classé comme financièrement indépendant de l’État.

La sélection « hors contrôle de grandes fortunes » exige des preuves de structure et de contrôle, pas seulement une présentation marketing. Une forme coopérative est un indice de gouvernance à examiner ; elle ne prouve pas à elle seule l’absence de tout financeur fortuné. Ne pas attribuer l’étiquette « milliardaire » à une personne sur intuition ou sans preuve pertinente. Présenter les faits de contrôle connus plutôt qu’un classement moral des propriétaires.

Le répertoire permet filtres par thème, format, gratuité et structure. Son ordre par défaut est alphabétique ou établi par des critères publics non commerciaux. Les recommandations sont liées au thème de l’article ou choisies par l’utilisateur, jamais sélectionnées pour conforter son profil politique ou le persuader de voter pour un acteur.

### 14.3 Médias demandés et statut documentaire

| Média | Éléments vérifiés dans les sources officielles | Traitement dans le produit |
|---|---|---|
| Blast | Statuts publiés d’une société coopérative d’intérêt collectif ; présentation d’un projet engagé et indépendant ; flux RSS disponibles | Fiche prioritaire et intégration à la veille ; contrôler gouvernance et financement avant un badge catégorique sur le contrôle |
| Mediapart | Présentation d’un capital protégé par une structure non lucrative, lié au Fonds pour une presse libre ; financement par abonnements déclaré | Fiche prioritaire avec schéma de protection du capital, accès payant signalé et sources de gouvernance |
| Radio Nova | Mentions légales indiquant l’appartenance à Combat Media, présidé par Matthieu Pigasse ; groupe Combat présentant Nova parmi ses marques | Peut figurer comme ressource culturelle, satirique ou éditoriale ; ne pas la présenter comme une coopérative ou un média détenu par sa rédaction, ni comme une preuve de sortie des grands propriétaires |

Les classifications restent révisables à partir de pièces nouvelles. L’appréciation d’un programme de Nova ou d’une enquête de Blast doit porter sur ce contenu, et ne doit pas être déduite uniquement du propriétaire ou de la couleur politique du média.

### 14.4 Flux et lectures complémentaires

Le Radar doit proposer un encart « Pour creuser » : source primaire d’abord, puis enquête originale ou analyse pertinente de médias du répertoire. Plusieurs angles sérieux peuvent être proposés quand ils apportent une information distincte. Ne pas ajouter un article faux ou hors sujet pour fabriquer un équilibre artificiel.

Les contenus sont intégrés par liens, métadonnées et courts extraits autorisés. Ne pas recopier des articles payants, contourner un abonnement ou aspirer des archives sans autorisation. Les lecteurs doivent pouvoir ouvrir la source d’origine et comprendre si le contenu provient de la rédaction, d’une tribune, d’un blog participatif ou d’une chronique satirique. Un billet du Club de Mediapart n’est pas une enquête de la rédaction de Mediapart.

Par défaut, aucun lecteur audio ou vidéo tiers ne se charge avant une action explicite. Un lien sortant ne doit pas transmettre le profil politique dans son URL ou son référent. Prévoir `Referrer-Policy: no-referrer` sur les surfaces personnelles et les sorties depuis celles-ci.

### 14.5 Actualisation et recette du répertoire

Le système doit surveiller les changements de mentions légales, statuts, gouvernance et financement, puis demander une relecture avant reclassement. Une affirmation périmée ou non confirmée perd son badge, conserve son historique et affiche l’incertitude.

Ajouter `MediaOutlet`, `OwnershipRevision`, `FundingDisclosure` et `MediaDirectoryReview` au modèle éditorial. Relier chaque attribution de contrôle à une preuve. L’absence de données ne doit jamais devenir « indépendant » par défaut.

Critères de recette : une fiche sans source de propriété ne peut recevoir le badge ; un changement d’actionnariat déclenche revue et historique ; un commentaire militant ne devient pas une preuve primaire de programme ; une lecture complémentaire n’altère aucun poids ou score ; aucun lien de lecture ne révèle le résultat individuel.

### 14.6 Observatoire complet des médias

La rubrique `/medias` doit dépasser le répertoire de médias indépendants : elle couvre presse, télévision, radio, pure players, agences, podcasts et émissions d’information, y compris les médias détenus par de grands groupes. La sélection indépendante reste une entrée de cet observatoire.

Titre public proposé : **Qui possède ton info**. Promesse : « Qui possède, qui finance, qui décide et quels points de vue sont mis en avant ? Regarde les liens, les contenus et les preuves. »

Prévoir `/medias/[slug]`, `/medias/groupes/[slug]`, `/medias/emissions/[slug]`, `/medias/carte` et `/medias/methode`. Toute fiche doit distinguer le média, son groupe, sa rédaction et ses émissions : leurs caractéristiques ne sont pas automatiquement interchangeables.

### 14.7 Les cinq volets de chaque dossier

| Volet | Informations affichées | Limites à rendre visibles |
|---|---|---|
| Qui possède | Actionnaires directs, bénéficiaires du contrôle connus, participations, droits de vote, holdings et autres médias détenus | Capital et contrôle ne sont pas synonymes ; données inconnues explicites |
| Qui finance | Abonnements, ventes, publicité, aides publiques, mécénat, dons, apports de capital, prêts et subventions, avec montants ou parts lorsqu’ils sont documentés | Un prêt n’est pas du chiffre d’affaires ; un don n’est pas une participation ; pas de somme trompeuse de flux hétérogènes |
| Qui décide | Nomination des dirigeants et responsables éditoriaux, gouvernance, droits de veto, garanties rédactionnelles et interventions documentées | Un pouvoir statutaire n’est pas la preuve qu’il a été exercé sur un sujet précis |
| Liens politiques établis | Soutiens publics, fonctions politiques, affiliations institutionnelles déclarées et liens de financement légalement documentés | Aucune affiliation individuelle déduite, aucun transfert automatique de l’opinion du propriétaire au média |
| Ligne et traitement observés | Projet éditorial revendiqué, cadrages, thèmes, invités, opinions exprimées, contradicteurs et traitement des faits | Résultats bornés au corpus, à l’émission et à la période examinés |

Les financements de campagne ou soutiens politiques doivent être vérifiés à partir de documents légalement accessibles et des règles applicables à la personne ou structure concernée. Ne pas suggérer qu’une société finance un parti lorsqu’aucune preuve valable ne l’établit.

### 14.8 Carte des liens et du contrôle

Construire une carte interactive accessible, avec recherche et équivalent tabulaire. Nœuds : personne exerçant un rôle public documenté, société, holding, média, rédaction, émission et organisme de financement. Relations typées : détient du capital ; dispose de droits de vote ; contrôle ; nomme ; finance ; prête ; diffuse ; produit ; soutient publiquement.

Chaque lien comporte source, période de validité, valeur éventuelle, qualification et incertitude. Le trait doit permettre de distinguer propriété, financement et diffusion. L’absence de pourcentage ne devient jamais 100 %. Les participations minoritaires ne doivent pas être affichées comme un contrôle exclusif. Les chaînes indirectes et contrôles conjoints exigent une justification spécifique.

Les autres activités économiques du groupe peuvent être affichées pour comprendre les intérêts potentiels. Une relation sectorielle ne démontre pas une intervention éditoriale. Toute affirmation « le propriétaire a imposé ce traitement » exige une preuve de l’intervention, pas seulement un rapprochement graphique.

### 14.9 Appartenance et orientation politiques

Réserver « affilié à un parti » aux liens organisationnels explicitement établis. Pour le reste, utiliser « ligne revendiquée », « soutien public documenté », « orientation observée sur ce corpus » ou « qualification par un tiers identifié ».

L’analyse doit porter sur les opinions exprimées dans les contenus, pas sur des opinions privées supposées des présentateurs, journalistes ou propriétaires. Un intervenant peut défendre des positions différentes selon les thèmes ; il ne doit pas recevoir une étiquette politique personnelle automatique. Les dossiers de personnes se limitent à leurs fonctions publiques et déclarations pertinentes légalement utilisables ; les traitements de données sensibles exigent une revue spécifique.

Le site peut expliquer qu’une émission valorise régulièrement des arguments favorables à telle politique, ou que ses éditoriaux soutiennent explicitement tel candidat. Il doit présenter les passages, leur fréquence et le périmètre de la conclusion. Il ne doit pas conclure « ce média appartient politiquement à X » à partir de la fortune du propriétaire, d’un seul chroniqueur ou d’un sujet récurrent.

Une proximité observée avec certaines positions ne prouve ni financement ni coordination avec un parti. Les opinions du financier, la ligne officielle et les observations de contenus sont affichées dans trois rubriques distinctes, même lorsqu’elles semblent converger.

### 14.10 Méthode de mesure des contenus

Avant analyse, publier l’univers étudié, les émissions incluses, les genres, les fenêtres d’observation et la méthode d’échantillonnage. Inclure des fenêtres ordinaires et des séquences d’actualité forte. Ne pas sélectionner seulement des extraits polémiques ou utiliser le flux recommandé d’un réseau social comme échantillon représentatif d’une chaîne.

Unité d’analyse : article ou segment identifié, avec auteur ou rôle, titre, sujet, passage, source et contexte. Séparer reportage, entretien, éditorial, tribune, satire, publicité et contenu sponsorisé. Pour un entretien, distinguer propos de l’invité, questions du présentateur, commentaires et éventuelle contestation.

Indicateurs possibles, publiés séparément :

- Part des sujets, selon nombre de pièces ou durée, en indiquant la mesure retenue.
- Place des sujets : une, titre, ouverture, durée, récurrence et visibilité lorsque mesurables.
- Diversité des intervenants et fonctions ; affiliations des personnalités politiques seulement lorsqu’elles sont établies.
- Temps de parole politique, avec source et catégorie précise ; ne pas le confondre avec l’ensemble des opinions exprimées.
- Arguments favorables, défavorables ou mixtes à une proposition définie, avec verbatims et codage.
- Présence de contradiction, réponses demandées, invitations refusées documentées et absence d’information sur ces démarches.
- Titres et cadrages : vocabulaire, problème mis en avant, causes proposées et solutions privilégiées.
- Qualité documentaire : sources primaires accessibles, rectifications et distinction entre faits et commentaires.

Le fait de traiter beaucoup l’immigration, le climat ou l’insécurité ne suffit pas à déterminer une orientation : examiner la manière de les traiter. Ne pas déduire une approbation du temps accordé à un invité ou un biais de l’absence d’un sujet sans univers de comparaison approprié.

Les proportions doivent afficher numérateur, dénominateur, volume, couverture et exclusions. Toute interprétation agrégée exige au moins 30 unités admissibles par périmètre étudié et une représentation de ses différents formats ; ce minimum ne garantit pas la représentativité. Si le corpus est plus faible, présenter des observations ponctuelles sans généralisation. Un corpus complet mais petit doit être décrit comme tel.

Le manuel de codage est public, les catégories sont définies avant mesure et un échantillon est codé indépendamment par deux lecteurs. Publier la mesure d’accord intercodeurs et les désaccords ; une catégorie insuffisamment reproductible ne peut alimenter une conclusion assurée. Les IA proposent les extractions ; les conclusions politiques agrégées exigent validation humaine.

Pas de note globale « manipulation 87 % », de thermomètre de propagande ou de score unique amalgamant propriétaire, opinion et exactitude. Le tableau de bord montre des observations comparables et les limites de leur interprétation.

### 14.11 Sources et vérification de l’observatoire

Ordre de collecte : mentions légales et documents de société ; comptes et rapports publics disponibles ; statuts et conventions ; décisions et données Arcom ; auditions et rapports institutionnels ; déclarations officielles des structures ; travaux de cartographie et enquêtes documentées. Les documents déclaratifs sont identifiés comme tels et confrontés aux autres pièces accessibles.

La carte « Médias français, qui possède quoi ? » du Monde diplomatique et d’Acrimed peut servir au repérage des liens à vérifier, avec attribution et respect des droits. Ne pas recopier son graphisme ni considérer chaque relation comme automatiquement actuelle. L’édition consultée et les preuves primaires de chaque lien importé doivent être conservées.

Les décisions de régulation doivent indiquer objet, périmètre, statut et recours lorsqu’ils sont connus. Une sanction ne prouve pas que tous les contenus d’un média sont faux. L’absence de sanction ne certifie pas une impartialité totale.

La méthode d’analyse des contenus est propre au projet. Ne pas présenter ses étiquettes comme des classifications de l’Arcom. Le cadre officiel du pluralisme prend en compte sujets et points de vue sans instituer une attribution générale de sensibilité politique à chaque intervenant.

### 14.12 Mise à jour et droit de correction

Surveiller changement de capital, acquisition, gouvernance, direction éditoriale, garanties rédactionnelles, financement important, nouveau programme et décision de régulation. Conserver historique des liens et ne jamais écraser une situation ancienne avec la situation actuelle.

Les observations éditoriales utilisent des corpus versionnés et des fenêtres fixes. Une évolution de format, de présentateur ou de méthode doit être signalée avant comparaison. Un article ou extrait ajouté ne doit pas devenir une conclusion sur toute la chaîne en quasi temps réel.

Prévoir contestation sourcée, réponse du média dans un espace identifié et correction visible. Appliquer les mêmes critères à Blast, Mediapart, Nova, médias publics et groupes privés. Les liens commerciaux éventuels avec un média sont déclarés et n’influencent pas son dossier.

### 14.13 Données et critères de recette spécifiques

Ajouter `MediaOrganisation`, `MediaProgramme`, `ControlRelationRevision`, `GovernanceRight`, `FundingFlow`, `PublicPoliticalStatement`, `ContentSample`, `ContentCoding`, `EditorialAnalysisRevision` et `MediaCorrection`. Les données d’orientation portent sur un contenu, un corpus ou une position publique attribuable, jamais sur un profil politique privé inféré.

Recette obligatoire : contrôler indirectement plusieurs médias est visible sans confondre détention et finance ; une information inconnue reste inconnue ; le chroniqueur d’une émission ne détermine pas toute la chaîne ; les opinions rapportées ne sont pas imputées au journaliste ; un soutien public n’est pas transformé en adhésion ; tout graphique possède sources et dénominateur ; les conclusions changent de version avec le corpus ; l’observatoire n’altère aucun score de candidat.

## 15 Tendances et confidentialité

### 15.1 Produit statistique

Publier des tendances de contributions volontaires : réponses par item, priorités par thème et évolution entre fenêtres comparables. Ne pas publier par défaut de classement de candidats issu des profils individuels.

Mention obligatoire près de chaque graphique : « Contributions volontaires des utilisateurs du site. Échantillon non représentatif de la population. Ces résultats ne mesurent pas une intention de vote. » L’étiquette seule ne dispense pas d’examiner le régime juridique applicable aux statistiques publiées.

Ne pas écrire « les Français pensent » ni « X gagnerait ». Les changements de composition de l’audience, de question ou de méthode doivent être signalés ; une évolution de contributions ne prouve pas un changement d’opinion chez les mêmes personnes.

### 15.2 Interdiction des profils sur le serveur

Ne jamais envoyer le vecteur complet de réponses, les scores individuels, les lignes rouges ou le profil descriptif. Aucun `user_id`, email, identifiant publicitaire, cookie stable ou empreinte de navigateur ne doit rejoindre une contribution politique.

Un événement statistique peut déjà constituer une donnée politique sensible s’il est relié à l’émetteur par les métadonnées de transport. L’absence d’email ne suffit pas à l’anonymiser. Le projet doit donc traiter la contribution comme sensible jusqu’à démonstration de l’anonymisation.

### 15.3 Architecture initiale retenue

Contribution facultative, spécifique et séparée du test, déclenchée uniquement à la fin. Chaque participation ne contribue qu’à un item tiré au sort parmi les réponses éligibles. Afficher que les volumes sont des contributions par question, non des utilisateurs uniques garantis.

Avant transport, appliquer une réponse aléatoire généralisée avec aléa cryptographique. Pour `k` catégories et budget `ε`, transmettre la vraie catégorie avec probabilité `exp(ε)/(exp(ε)+k−1)` et chacune des autres avec probabilité `1/(exp(ε)+k−1)`. Le budget doit être fixé avec expertise et tests de précision ; il ne doit pas être choisi implicitement par le développeur.

Le service d’entrée doit être séparé des services newsletter, boutique et statistiques de fréquentation. Il doit refuser les champs non autorisés, désactiver journaux de corps de requête et traces sensibles, vérifier le traitement des métadonnées par CDN et hébergeur, puis agréger sans conserver de ligne de contribution individuelle.

La confidentialité différentielle locale réduit l’information contenue dans une contribution ; elle ne rend pas à elle seule tout le service juridiquement anonyme et ne masque pas l’adresse de transport. Ne jamais afficher « même nous ne pouvons jamais savoir ce que tu penses ».

La garantie mathématique doit couvrir aussi les participations répétées et leur composition. Prévoir une limite locale conservatrice de contribution, une information claire et aucun recoupement serveur. Si la garantie de composition n’est pas validée, ne pas annoncer un budget individuel global garanti.

### 15.4 Publication des agrégats

La distribution brute des réponses brouillées doit être corrigée par l’estimateur approprié. Publier des estimations, leur incertitude liée à la randomisation et le nombre de contributions. Cette incertitude ne couvre pas le biais de sélection de l’audience.

Le seuil initial minimal est de 100 contributions par item et fenêtre, mais le seuil réel doit être le maximum de ce minimum et de celui nécessaire à une précision acceptable pour le `ε` retenu. En dessous : « Volume insuffisant ». Cent contributions ne sont pas une preuve de précision ou d’anonymat.

Pas de tableaux croisés démographiques, de carte communale ni d’export de données individuelles. Les fenêtres publiées sont fixes et non arbitrairement filtrables ; éviter que leur soustraction permette d’isoler une contribution. Mettre les graphiques à jour uniquement lors de publications agrégées admissibles.

### 15.5 Intégrité et limites

Prévoir protection contre robots et afflux coordonnés sans stockage de profil politique : contrôle d’entrée isolé, quotas techniques, jetons non corrélables si une solution éprouvée est retenue, suspension des graphiques contaminés. Ne pas fabriquer un identifiant stable au prétexte de déduplication.

L’anonymat limite la détection parfaite des doublons. L’interface doit le reconnaître. Une flambée statistique suspecte doit être marquée ou suspendue, pas présentée comme une percée politique.

Le module tendances est livré désactivé tant que conformité, métadonnées, mécanisme statistique, budget de confidentialité et scénarios d’attaque ne sont pas validés. Cette dépendance est un critère de qualité, pas une option laissée à l’IA.

## 16 Studio de partage

Générer localement un post carré, une story verticale, une image paysage et un fond d’écran portrait. Dimensions initiales : 1080 × 1080, 1080 × 1920, 1200 × 630 et 1440 × 2560. Adapter les zones sûres aux recadrages et à l’horloge du téléphone.

Trois styles : manifeste typographique ; valeurs abstraites ; journal satirique. Le mode par défaut partage les valeurs et priorités, sans candidat, sans identité et sans statut de vote.

L’utilisateur choisit explicitement les éléments à afficher. Un nom est facultatif et local. Toute image doit être prévisualisée avant téléchargement ou ouverture de la feuille de partage. La publication sur un réseau doit rester une action de l’utilisateur.

Les formulations sont issues de règles locales auditables. Ne pas transformer un indice en faux slogan personnel ou une opinion en accusation factuelle. Une carte de proximité candidate, si demandée, conserve score, périmètre, couverture, version et lien de méthode.

Le rendu doit utiliser SVG ou canvas local avec polices embarquées. Retirer métadonnées inutiles. Ne pas envoyer le texte du profil à un service d’image ou à un LLM. Le QR code mène au test public, pas au profil.

Pour comparer deux profils, une extension peut permettre un échange volontaire de fichiers locaux puis un calcul sur l’appareil. Ne pas stocker une comparaison de couple, déduire une identité tierce ou afficher un score de compatibilité relationnelle comme conclusion scientifique.

## 17 Boutique et monétisation

Objets d’expression fondés sur des valeurs : affiches, stickers, coques, tee-shirts et sacs ; packs numériques facultatifs. Le bilan, les preuves, les explications et la méthode restent accessibles sans achat.

Aucun financement de parti, placement dans les résultats, vente de données politiques ou commission liée à un choix de candidat. Pas de publicité segmentée selon les réponses.

La boutique doit utiliser un stockage et des identifiants séparés du parcours politique. Un achat personnalisé peut révéler une opinion ; prévenir l’utilisateur avant transfert du visuel au fournisseur et limiter ce transfert à ce qui est indispensable à la fabrication. Ne jamais transmettre réponses et scores avec une commande.

Les suggestions de produits peuvent rester locales mais ne doivent pas influencer la hiérarchie politique. Les prix, taxes, frais, retours, conditions et fournisseur doivent être réels et validés ; aucun exemple commercial ne doit être publié comme une offre disponible.

## 18 Données personnelles et obligations de publication

Les opinions politiques relèvent des catégories sensibles. Le calcul local ne dispense pas d’examiner les traitements effectivement réalisés par les scripts, journaux, analytics et prestataires. Une adresse IP hachée reste potentiellement une donnée personnelle, et un identifiant pseudonyme n’est pas une anonymisation.

Prévoir registre des traitements, base juridique adaptée à chaque finalité, examen de l’exception applicable aux données sensibles, contrats prestataires, durées de conservation nécessaires et exercice des droits. Examiner la nécessité d’une analyse d’impact ; réaliser celle-ci lorsque les caractéristiques du traitement l’exigent.

La newsletter doit être générique ou suivre des thèmes choisis séparément, sans recoupement avec le test. Le consentement commercial et la contribution statistique sont distincts, non précochés et révocables. Ne pas promettre la suppression d’une contribution déjà rendue irréversiblement anonyme ; expliquer ce qui peut être retiré et ce qui ne peut plus être individualisé.

Pas de pixels publicitaires, rejeu de session, enregistrement d’écran ou collecte d’événements détaillés sur test, profil et résultats. Les outils de support ne doivent pas aspirer les réponses dans une capture ou un rapport d’erreur.

L’anonymat éditorial de la fondatrice doit être respecté : aucun visage, biographie, prénom ou lien à ses autres activités dans le parcours de marque. Les mentions légales et responsabilités de publication doivent cependant être conformes à la structure réelle. Ne pas créer une fausse rédaction, un faux directeur de publication ou une identité de façade.

Prévoir vérification juridique de l’édition, de la satire, des contenus litigieux, des droits de réponse, des tendances publiées et des règles applicables aux périodes électorales. Le système doit permettre suspension d’une catégorie de publication selon une règle documentée, sans suspendre arbitrairement les sources et la méthode.

## 19 Architecture technique de référence

Architecture proposée : Next.js avec TypeScript strict ; pages publiques rendues pour l’indexation ; modules client pour le bilan, les calculs, le studio et la sauvegarde. PostgreSQL ou Supabase pour le corpus public et l’administration, sans table de profils de votants.

Le runtime, les versions et bibliothèques doivent être choisis sur leur documentation officielle lors de l’implémentation. Ce cahier des charges ne fige pas une version logicielle supposée actuelle.

| Composant | Responsabilité | Interdiction |
|---|---|---|
| Site public | Contenus, sources et manifestes | Recevoir les réponses politiques |
| Moteur local | Profil, scores, explications et exports | Appeler un LLM avec les réponses |
| Corpus | Documents, assertions, positions et versions | Contenir un profil individuel |
| Veille | Détection, récupération et extraction | Publier un codage sans validation |
| Back-office | Relecture, audit et publication | Modifier une version publiée en place |
| Agrégateur isolé | Contributions brouillées et agrégats | Conserver vecteurs ou identifiants stables |
| Commerce | Produits, commandes et fabrication | Joindre les réponses aux commandes |
| Newsletter | Abonnement indépendant | Segmenter sur le résultat du test |

La base éditoriale ne doit pas être directement accessible en écriture depuis le navigateur. Les lectures publiques doivent porter sur des vues ou fichiers publiés. Les clés privilégiées ne doivent jamais être embarquées côté client.

La sauvegarde politique locale utilise IndexedDB avec schéma versionné, migrations et effacement intégral. Proposer export et import de fichier personnel, avec avertissement de sensibilité et validation de schéma. Une protection chiffrée par mot de passe peut être ajoutée via une implémentation éprouvée ; elle ne doit pas être qualifiée de sécurité absolue sur un appareil compromis.

Service worker : ressources essentielles et dernier corpus publié ; stratégie de mise à jour explicite ; purge à l’effacement ; absence de mélange de versions. Les contenus de paiement et d’administration ne sont pas mis en cache comme le test.

## 20 Modèle de données minimal

| Entité | Champs et relations indispensables |
|---|---|
| Election | Identifiant, territoire, scrutin, statut et source officielle |
| Actor | Identifiant, nom public, statut, parti, candidatures et preuves |
| Topic | Identifiant, définition, ordre et poids de thème |
| QuestionVersion | Identifiant stable, version, thème, texte, options, codage, mapping de dimensions |
| QuestionSet | Versions des items, poids, équivalences et statut de publication |
| SourceDocument | URL, éditeur, auteur, type, horodatages, empreinte, accès et droits |
| EvidenceSpan | Document, passage, page ou timecode, contexte et vérification |
| Claim | Type, acteur, proposition, conditions, preuves et contradictions |
| PositionRevision | Acteur, item versionné, valeur ou ensemble, statut, justification, preuves |
| Review | Objet exact, empreinte examinée, relecteur, décision, motif et conflit déclaré |
| PublicationBundle | Versions compatibles, empreinte, manifeste et signature |
| ChangeEvent | Ancien, nouveau, cause, objets touchés et note publique |
| ArticleRevision | Titre, faits, interprétation, satire, preuves, auteur responsable et correction |
| ImpactRule | Mesure, conditions, variables locales, formule et limites |
| AggregateRelease | Item versionné, fenêtre, méthode, paramètres publics, volumes et estimation |

`LocalVoterState` existe uniquement dans le client : schéma, réponses, priorités, lignes rouges, versions, préférences et historique local. Aucune migration SQL ne doit créer son équivalent serveur.

Tous les liens de preuve doivent être vérifiables par contraintes. Une révision validée ne doit pas être modifiée en place. Les statuts et transitions utilisent des énumérations, pas du texte libre interprété par un LLM.

## 21 Contrats d’API

| Contrat | Entrée autorisée | Sortie |
|---|---|---|
| `GET /api/public/manifest` | Version connue facultative | Version courante, compatibilité, empreinte |
| `GET /api/public/bundles/[version]` | Identifiant public de version | Questions, positions et références publiées |
| `GET /api/public/changes` | Versions publiques | Changements du corpus sans profil utilisateur |
| `GET /api/public/sources/[id]` | Identifiant documentaire public | Métadonnées, passages autorisés et relations |
| `GET /api/public/aggregates` | Fenêtres et items préautorisés | Publications agrégées admissibles |
| `POST /api/contribution` | Item, fenêtre, catégorie brouillée, version de protocole, jeton éventuel | Accusé de réception sans profil |
| `POST /api/report` | Objet public, motif, commentaire | Référence de signalement |

Les API doivent rejeter les champs supplémentaires, limiter tailles, valider types et ne pas enregistrer corps sensibles dans les erreurs. Aucun endpoint `POST /score`, `POST /profile` ou équivalent ne doit recevoir les réponses.

Le signalement doit avertir de ne pas coller un profil personnel dans un commentaire. Le contact facultatif est conservé séparément du contenu public et ne devient pas une identité de votant.

## 22 Back office éditorial

Rôles : lecteur de veille, documentaliste, codeur, relecteur, responsable de publication, administrateur technique. Une personne peut cumuler certains rôles, mais ne peut effectuer les deux validations indépendantes d’une même position.

États obligatoires : détecté ; récupéré ; extrait ; à examiner ; codage proposé ; en relecture ; validé ; prêt à publier ; publié ; contesté ; remplacé ; retiré. Une contestation ne change pas automatiquement la position ; elle ouvre un traitement traçable.

Écrans : boîte de veille, sources défaillantes, documents comparés, passage dans son contexte, codage côte à côte, acteurs sous-couverts, conflits, simulation des effets, validation de lot, journal des corrections et coûts.

L’éditeur ne doit pas pouvoir publier un score directement : il publie des positions et une méthode ; les scores sont des conséquences calculées. Un bouton de publication vérifie dépendances, double revue, schémas, preuves et tests du lot.

En cas d’erreur grave, permettre retrait ou retour au dernier lot valide. Ne jamais effacer silencieusement la trace de la correction. Une correction doit indiquer ce qui était faux, la preuve utilisée et ce qui change dans les résultats.

## 23 Rôle et limites des IA

Les IA peuvent détecter des passages, dédupliquer, proposer des résumés, traduire pour contrôle, suggérer un codage et identifier des incohérences. Toute sortie doit référencer un passage réel de la pièce fournie ; un énoncé sans preuve est rejeté.

Interdictions : inventer une position, produire un chiffre budgétaire non sourcé, transformer une rumeur en fait, décider seule d’un conflit de sources, inférer une opinion individuelle ou publier une consigne de vote adaptée à un profil.

Les documents récupérés sont des entrées non fiables. Le pipeline doit ignorer les instructions intégrées dans ces documents, bloquer les accès non autorisés, séparer extraction et outils d’administration et tester les injections de prompt.

Une IA qui cite une autre IA n’ajoute aucune preuve indépendante. Le consensus de plusieurs modèles ne remplace pas un document primaire ou une validation éditoriale.

Le modèle, la consigne, les pièces d’entrée, les versions et les décisions humaines doivent être traçables dans l’administration. Les réponses personnelles des votants sont exclues de ces traces.

## 24 Qualité technique et accessibilité

Objectif d’accessibilité : WCAG 2.2 niveau AA, à vérifier avec tests automatiques et manuels. Navigation clavier complète, focus visible, boutons tactiles suffisamment grands, lecteur d’écran, réduction des animations, contraste vérifié et absence d’information uniquement par couleur.

Les graphiques doivent posséder un équivalent textuel ou un tableau. Les barres ne doivent pas suggérer une précision supérieure à celle du résultat. Un radar graphique peut compléter le profil mais ne remplace pas les définitions et valeurs accessibles.

Tester les largeurs mobiles courantes, les écrans larges et le zoom. Ne pas masquer une limite méthodologique sur mobile. Les éléments commerciaux ne doivent pas déplacer le bouton principal ou provoquer un clic involontaire.

Cibles de performance pour pages publiques : LCP au plus 2,5 s, INP au plus 200 ms, CLS au plus 0,1 au 75e percentile lorsque les données terrain sont disponibles. Ce sont des budgets de qualité technique, pas des délais de projet. Les mesures de laboratoire ne doivent pas être présentées comme des mesures terrain.

Le calcul doit être déterministe, versionné et fonctionner sans réseau après téléchargement du corpus. Un corpus invalide, incomplet ou non compatible doit être refusé ; afficher le dernier corpus valide ou un état explicite d’indisponibilité.

## 25 Sécurité et exploitation

Authentification renforcée pour l’administration, moindre privilège, revue des permissions, journal d’audit, gestion de secrets hors dépôt, limitation des requêtes et sauvegardes restaurables du corpus public.

Prévoir CSP restrictive, validation des contenus HTML, protection XSS, CSRF selon les sessions, défense SSRF dans les récupérations de sources, contrôle des redirections, import de fichiers borné et absence d’accès aux réseaux internes depuis le collecteur.

Le corpus public doit avoir empreinte et manifeste signé ou mécanisme équivalent permettant de détecter une altération. La signature protège l’intégrité de distribution, pas la vérité des assertions.

Les sauvegardes ne doivent pas aspirer des réponses de votants via journaux, analytics ou traces. Tester réellement qu’un rapport d’erreur ne contient pas le stockage local politique.

Observer disponibilité des sources, état des files, intégrité des bundles, erreurs de calcul, vieillissement documentaire et couverture par acteur. Prévoir alertes configurables, procédure de retour arrière et page d’état sans données personnelles.

Les notifications personnelles, si ajoutées, doivent rester génériques : « Le référentiel a évolué ». Le serveur push ne doit pas connaître les priorités nécessaires à une alerte politiquement ciblée.

## 26 Référencement et distribution

Les pages éditoriales doivent comporter titre descriptif, résumé fidèle, texte accessible, sources, auteur éditorial réel ou signature de marque avec responsabilité identifiable, version et corrections. Utiliser les données structurées adaptées au contenu réellement publié.

Ne pas créer de faux comparatifs, avis inventés, résultats de tests fictifs ou pages de candidat supposé officiel. Les pages archivées doivent préciser leur statut. Les contenus satiriques doivent être reconnaissables hors contexte, notamment dans les aperçus sociaux.

Prévoir flux RSS des articles et corrections, plan de site public, URL canonique, recherche interne et filtres par thème, acteur et type documentaire. Un changement sémantique de question exige une rupture dans les comparaisons de tendances, même si le titre reste proche.

La communication doit promouvoir l’utilité générale du produit. Ne pas développer de segments de diffusion ou de messages destinés à convaincre une catégorie politique particulière de soutenir ou rejeter un candidat.

## 27 Recette méthodologique et technique

| Identifiant | Vérification | Résultat exigé |
|---|---|---|
| POS 01 | Deux personnes de même réponses mais identités différentes | Résultats identiques, identité ignorée |
| QST 01 | Je ne sais pas et réponse intermédiaire | États et calculs distincts |
| QST 02 | Item double ou orienté | Publication bloquée par revue |
| SRC 01 | Source inexistante ou passage absent | Assertion non publiable |
| SRC 02 | Plusieurs reprises d’une même dépêche | Une seule origine documentaire |
| COD 01 | Programme de parti sans adoption personnelle | Aucune imputation silencieuse |
| COD 02 | Abstention ou vote sur texte composite | Pas de position inventée |
| COD 03 | Désaccord entre relecteurs | Arbitrage explicite, publication bloquée avant décision |
| SCR 01 | Concordance totale sur corpus complet | Score 100 |
| SCR 02 | Opposition maximale sur corpus complet | Score 0 |
| SCR 03 | Aucune position connue | Aucun score ni faux zéro |
| SCR 04 | Exemple quatre items | 50 observé, 75 de couverture, bornes 37,5 et 62,5 |
| SCR 05 | Plus d’items ajoutés à un thème | Poids total de thème inchangé |
| SCR 06 | Acteur peu documenté | Pas de podium avantageux par données manquantes |
| SCR 07 | Permutation des noms des acteurs | Scores inchangés |
| SCR 08 | Écart faible ou ordre instable | Proximité ou sensibilité signalée |
| SCR 09 | Changement de priorité | Effet exactement expliqué |
| UPD 01 | Référentiel changé, réponses identiques | Delta attribué aux bonnes causes |
| UPD 02 | Question change de sens | Nouvelle réponse demandée |
| UPD 03 | Téléchargement interrompu | Aucun mélange de versions |
| PRV 01 | Test et résultat avec capture réseau | Aucune réponse politique transmise |
| PRV 02 | Erreur applicative et support | Aucune donnée locale politique dans les traces |
| PRV 03 | Export du studio | Rendu local, aucune fuite vers un tiers |
| PRV 04 | Refus de contribuer | Accès et résultat identiques |
| STA 01 | Faible volume ou bruit trop important | Graphique masqué comme insuffisant |
| STA 02 | Fenêtres et requêtes différentielles | Impossible d’isoler une contribution publiée |
| STA 03 | Afflux suspect | Suspension ou avertissement explicite |
| SEC 01 | Document contenant une injection de prompt | Aucun accès outil ou publication non autorisée |
| SEC 02 | Client appelle une API privilégiée | Requête refusée |
| UX 01 | Clavier, lecteur d’écran, zoom et mobile | Parcours complet sans perte d’information |
| OPS 01 | Restauration d’un corpus sauvegardé | Version intègre et résultats reproductibles |

Le moteur exige tests unitaires, tests par propriétés, profils synthétiques de référence et tests de non-régression. Les publications de corpus exigent validation automatique et simulation des effets sur ces profils. Les parcours sensibles exigent tests de bout en bout et audit des flux réseau.

L’évaluation de pertinence doit utiliser des profils synthétiques pluralistes, des relectures expertes et des essais volontaires sans stocker le profil politique individuel. L’accord avec le candidat préféré d’un testeur n’est pas une preuve de validité. Étudier compréhension, cohérence des explications, stabilité et capacité à identifier les désaccords.

## 28 Critères de mise en service

Le socle public ne peut être ouvert que si les questions sont validées, les formules documentées, les positions publiées traçables, le calcul reproductible, les états incomplets honnêtes, l’accessibilité contrôlée, les flux personnels inspectés et les corrections opérationnelles.

Si le corpus candidat est insuffisant, le site peut ouvrir le profil descriptif et les dossiers documentaires sans classement. Si la veille s’interrompt, conserver le corpus en signalant sa fraîcheur réelle. Si les tendances ne sont pas validées, elles restent désactivées. Si la boutique n’est pas connectée, aucun paiement fictif n’est proposé.

Chaque module possède un état explicite : non activé, expérimental clairement signalé, validé ou suspendu. Une interface soignée ne suffit pas à le déclarer prêt.

## 29 Livrables exigés de l’IA de développement

1. Dépôt complet, architecture documentée, installation reproductible et configuration d’environnement sans secrets.
2. Application publique, moteur local, studio et PWA conformes aux flux décrits.
3. Schéma éditorial, migrations, contraintes, politiques d’accès et absence de tables de profils politiques.
4. Back-office fonctionnel avec preuves, double revue, versions, prévisualisation et publication atomique.
5. Pipeline de veille opérationnel sur des sources autorisées, avec statut réel des connecteurs.
6. Manuel du questionnaire et du codage, formules, paramètres et corpus de test synthétique.
7. Suite de tests et rapport de conformité reliant chaque exigence à son implémentation et à sa vérification.
8. Guide de correction, retour arrière, restauration, surveillance et gestion d’une source indisponible.
9. Documentation des traitements et prestataires, flux réseau et éléments nécessaires à la revue juridique.
10. Boutique et agrégateur uniquement s’ils passent leurs critères propres ; sinon modules désactivés et limites explicites.

Les données de démonstration doivent utiliser des acteurs fictifs. Les positions réelles doivent être acquises et validées par le processus éditorial. L’IA ne doit jamais inventer un corpus plausible pour donner l’impression que le produit est terminé.

## 30 Consigne directement réutilisable pour le développement

> Implémente ce cahier des charges comme contrat produit et qualité. Commence par le modèle de données, les invariants de confidentialité, le moteur déterministe et ses tests, puis relie les surfaces publiques et le back-office. Respecte les dépendances de validation des sources, du codage et des statistiques. Ne crée aucune table serveur de profils de votants. N’envoie aucune réponse politique à un LLM. N’invente aucune source, candidature ou position. Ne force aucun classement lorsque les données ne sont pas comparables. Toute décision laissée ouverte doit être consignée avec son effet, sa justification et la validation nécessaire. Une fonctionnalité bloquée doit être clairement désactivée, jamais simulée en production. Aucun calendrier de réalisation n’est demandé. La livraison est définie par les critères de recette et la qualité vérifiable.

## 31 Arbitrages restant à valider

Les décisions suivantes sont nécessaires, mais ne doivent pas bloquer la construction des composants indépendants : nom et domaine ; structure juridique et responsabilité de publication ; personnes assurant les relectures indépendantes ; manuel définitif des 42 items ; critères d’inclusion avant candidatures officielles ; validation des seuils de classement ; budget et méthode de confidentialité des contributions ; fournisseurs commerciaux et conditions réelles.

L’IA peut créer les interfaces, schémas, tests et états d’attente correspondant à ces décisions. Elle ne peut pas les déclarer résolues par défaut. Les valeurs provisoires doivent être centralisées en configuration, versionnées et identifiées comme telles.

## 32 Références de contrôle

Ces références fondent les points indiqués ; les choix de formules, de seuils et d’architecture du présent document restent des choix de conception propres au projet. Ils ne sont pas présentés comme une certification ou une reproduction de la méthode d’un tiers.

- **CNIL — Donnée sensible** : les opinions politiques relèvent des données sensibles ; conditions spécifiques pour leur traitement. https://www.cnil.fr/fr/definition/donnee-sensible
- **CNIL — Identifier les données personnelles** : métadonnées identifiantes et distinction entre données anonymes et pseudonymes. https://www.cnil.fr/fr/identifier-les-donnees-personnelles
- **CNIL — L’anonymisation de données personnelles** : individualisation, corrélation, inférence et nécessité de réexaminer les risques. https://www.cnil.fr/fr/technologies/lanonymisation-de-donnees-personnelles
- **Vox Pop Labs — Vote Compass Methodology** : conception des questions, calibration des positions, pondération, résultats et limites d’un outil d’exploration politique. Référence méthodologique, sans prétendre reprendre son algorithme. https://www.voxpoplabs.com/votecompass/methodology.pdf
- **Commission des sondages — Recommandations sur les consultations électorales** : vigilance sur les enquêtes en ligne et leur présentation. Le régime applicable doit être examiné selon le dispositif réel. https://www.commission-des-sondages.fr/hist/communiques/controle-sondage-commission-fev08.htm
- **Légifrance — Loi relative à la publication et à la diffusion de certains sondages d’opinion** : texte à examiner avant publication de résultats entrant dans son champ. https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000522846
- **GLP1Suivi** : référence d’inspiration fonctionnelle fournie par la porteuse du projet. La lecture web accessible lors de cette rédaction n’a pas permis un audit complet de l’application ; aucune conformité à sa structure interne n’est affirmée. https://www.glp1suivi.com/

- **Blast — Statuts de la coopérative et présentation** : structure coopérative documentée et projet déclaré. https://www.blast-info.fr/medias/societaires/blast-statuts-public.pdf et https://www.blast-info.fr/presentation
- **Mediapart — Qui sommes nous** : protection du capital et modèle économique déclarés. https://www.mediapart.fr/qui-sommes-nous
- **Radio Nova — Mentions légales** : appartenance déclarée au groupe Combat Media et présidence. https://www.nova.fr/mentions-legales/
- **Combat — Présentation officielle** : présence de Nova parmi les marques et projet de groupe. https://www.combat.fr/

Les exigences juridiques doivent être confrontées aux textes et au dispositif effectivement exploité avant activation des fonctions concernées. Le présent cahier des charges décrit les contrôles nécessaires ; il ne remplace pas une qualification juridique spécifique.

Références supplémentaires pour l’observatoire :

- **Le Monde diplomatique et Acrimed — Médias français qui possède quoi** : outil de repérage, à vérifier relation par relation et sans reproduction non autorisée. https://www.monde-diplomatique.fr/cartes/ppa
- **Légifrance — Délibération Arcom sur le pluralisme des courants de pensée et d’opinion** : distinguer analyse de pluralisme et attribution générale d’une appartenance aux intervenants. https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050029025
