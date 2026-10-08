# Charte graphique et profil de voix de Ça vote

Document d’exécution pour l’agent de code et les personnes qui conçoivent, rédigent ou publient le produit.

**Marque : Ça vote ?** Domaine acheté par la porteuse du projet : **çavote.fr**. L’achat du domaine ne vaut pas validation juridique de marque. Afficher le domaine avec sa cédille ; laisser la bibliothèque URL gérer sa représentation technique, sans inventer un domaine de remplacement.

Cette charte complète le cahier des charges fonctionnel. Elle remplace ses anciennes propositions de palette et de slogans. Les instructions ultérieures de Béné priment. Les exemples rédactionnels sont des candidats à utiliser selon le contexte, jamais des phrases obligatoires à répéter sur toutes les pages.

## 1 Ce que le produit doit faire ressentir

Un journal que des gens ont lu, annoté et parfois corrigé au marqueur. Une conception professionnelle, avec des gestes humains visibles. L’impression de bricolage doit venir de quelques dessins et accents contrôlés, jamais d’une interface confuse ou de chiffres mal présentés.

L’utilisateur doit comprendre ce qu’il peut faire sans qu’on lui explique le concept de marque. La rigueur apparaît dans les preuves, l’historique et les explications. L’humour apparaît quand le sujet le permet. Aucun texte ne doit annoncer « nous sommes sérieux, drôles, humains ou irrévérencieux ».

Pas de signature obligatoire. Supprimer des textes publics « Les résultats sont sérieux. Le reste beaucoup moins » et les formulations équivalentes qui transforment une règle interne en slogan. Ne pas inventer de manifeste pour remplir un écran.

## 2 Identité stable

Trois éléments permettent la reconnaissance : papier crème, encre noire, point d’interrogation sur papier jaune. Ils doivent survivre à une réduction, au monochrome et à la disparition des illustrations.

Le jaune identifie la marque et certaines sélections. Il n’identifie aucun parti. Le rouge signale une correction ou une alerte étayée ; il ne doit pas transformer la satire en accusation. Le bleu distingue les liens et interactions secondaires.

## 3 Couleurs et associations

| Jeton | Clair | Usage |
|---|---|---|
| `paper` | `#F5F0E6` | Fond général |
| `ink` | `#191919` | Texte et titres |
| `highlight` | `#FFE34D` | Signature et sélection |
| `correction` | `#C83232` | Erreur ou correction établie |
| `reference` | `#2447B8` | Liens et focus |
| `muted` | `#625E57` | Texte secondaire |
| `surface` | `#FFFDFA` | Zone de lecture |
| `line` | `#D7D0C4` | Séparateurs et contours discrets |

| Jeton sombre | Valeur | Usage |
|---|---|---|
| `paper` | `#191919` | Fond général |
| `ink` | `#F5F0E6` | Texte |
| `surface` | `#242424` | Surfaces |
| `highlight` | `#FFE34D` | Identité inchangée |
| `reference` | `#A8BCFF` | Liens et focus |
| `correction` | `#FF9B91` | Corrections |
| `muted` | `#BDB7AD` | Texte secondaire |
| `line` | `#59554F` | Séparateurs |

Associations autorisées : encre sur papier ; encre sur jaune ; crème sur encre ; bleu de référence sur surface claire ; couleurs adaptées au sombre sur surfaces sombres. Ne pas utiliser blanc sur jaune. Ne pas supposer qu’une opacité conserve le contraste.

Vérifier chaque couple réellement utilisé : texte normal au moins 4,5:1, grand texte au moins 3:1, éléments d’interface et focus au moins 3:1 selon leur contexte. Tester hover, disabled et selected séparément. Les couleurs du tableau sont une base de conception ; leur simple présence ne vaut pas audit d’accessibilité.

Couleurs de données distinctes du statut politique : chaque série possède libellé et motif ou symbole ; tableaux accessibles associés. Ne jamais utiliser vert pour « bon candidat » et rouge pour « mauvais candidat ». Une contradiction documentée n’est pas la même chose qu’un désaccord avec le votant.

## 4 Typographies

| Fonction | Famille proposée | Graisse et usage |
|---|---|---|
| Logo et grands titres | Archivo Black | Titres courts, noir massif |
| Interface et texte courant | Public Sans | 400, 600, 700 |
| Articles et analyses | Source Serif 4 | 400, 600 ; italiques pour contexte précis |
| Annotation dessinée | Caveat | 700 ; quelques mots seulement |

Vérifier les licences et les fichiers officiels lors de l’implémentation. Auto-héberger les WOFF2 nécessaires, conserver les notices et tester accents, cédille, apostrophes et chiffres. Ne pas charger une bibliothèque de polices tierce depuis le parcours personnel.

Éviter quatre familles chargées partout : interface avec Public Sans et Archivo Black ; serif sur les articles ; Caveat seulement si une annotation existe. Fallback sans serif `Arial, sans-serif`, serif `Georgia, serif`, annotation fallback à la sans serif plutôt qu’à une cursive fantaisiste. Ajuster les métriques pour éviter les sauts de mise en page.

Échelle recommandée : texte interface 17 px avec interligne 1,5 ; article 19 px avec interligne 1,65 ; secondaire 14 à 15 px ; boutons 16 à 17 px en 600 ; annotations 22 px minimum. Les annotations essentielles doivent aussi exister sous une forme textuelle normale.

Titres fluides : H1 `clamp(2.25rem, 5vw, 4.5rem)` ; H2 `clamp(1.75rem, 3vw, 2.75rem)` ; H3 1,35 à 1,6 rem. Ajuster selon le contenu réel. Interligne titres autour de 1,05 à 1,15. Corps à casse normale. Capitales réservées aux titres courts et petits libellés, sans longs blocs criés.

Chiffres des scores et tableaux en sans serif, chiffres tabulaires. Décimales, unités et signe de pourcentage insécables avec leurs valeurs. Ne pas réduire le texte pour éviter de concevoir un retour à la ligne.

## 5 Logo et signe

Le logo de référence est un mot-symbole **ÇA VOTE** en noir avec, à droite, un point d’interrogation noir sur papier jaune légèrement irrégulier. Le point d’interrogation du papier termine le nom ; ne pas en ajouter un second après VOTE. La cédille doit rester identifiable.

Le papier peut être incliné de −4 degrés. Le mot-symbole reste horizontal. Le caractère humain est porté par le contour du papier et le tracé du signe, pas par une déformation de toutes les lettres.

Le logo image fourni est une exploration raster sur laquelle travailler, pas un SVG maître ni un système de fichiers de production déjà validé. Après choix de la piste, reconstruire le logo en vectoriel avec tracés propres, ajustement optique et variantes testées. Ne pas vectoriser automatiquement les défauts du raster comme des exigences.

Versions requises : horizontale ; compacte sur deux lignes ; symbole seul ; monochrome noir ; monochrome clair ; version très petite sans texture. SVG maître avec texte converti en tracés, PNG transparents et PDF vectoriel pour imprimeur. Aucun slogan dans le logo.

Zone de protection : au moins un demi-diamètre du point du signe autour du logo. Tailles initiales minimales à éprouver : horizontal 132 px à l’écran ; symbole 24 px ; pour favicon 16 px, dessin optiquement simplifié distinct. Si la cédille devient illisible, utiliser le symbole plutôt qu’un mot-symbole trop petit.

Interdictions : étirer, ombre floue, gradient, rotation du logo complet, remplacement de la cédille, ajout d’un drapeau, imitation d’un logo de journal connu. Sur fond sombre, lettres crème et papier jaune ; sur photographie, utiliser une surface unie permettant la lisibilité.

## 6 Favicon et icônes

Favicon : jaune plein et signe noir centré. À petite taille, aucun papier déchiré, texture ou effet de perspective. Décliner SVG, ICO 16/32/48 px, PNG Apple 180 px et PWA 192/512 px. Le signe de la version maskable reste dans la zone centrale sûre, testée avec masques circulaire et carré arrondi.

L’avatar social reprend le signe seul. Son intégrité doit être vérifiée à 32 px et dans un cercle. Une seule icône officielle par usage, centralisée ; l’agent ne doit pas inventer des variations à chaque page.

## 7 Dessins et marques humaines

Quatre gestes : surlignage jaune, cercle noir imparfait, flèche dessinée, tampon rectangulaire. Créer une petite collection de SVG validés avec variantes fixes. Aucun générateur aléatoire de tremblement, rotation ou salissure au rendu.

Les gestes ont une fonction : souligner une expression, relier une preuve, signaler un statut. Au plus un geste dominant par bloc éditorial, et un secondaire si nécessaire. Dans le test, pas plus d’un accent décoratif par écran ; dans les sources et tableaux, aucun accent gênant la lecture.

Texture papier facultative, très faible, sans requête distante ni superposition au texte. En mode sombre, sobre, fort contraste, impression ou petite taille : texture désactivée. L’identité ne doit pas dépendre de cette texture.

Illustrations au trait noir avec un accent jaune, sans personnages corporate. Le signe `?` suffit comme élément récurrent ; ne pas ajouter de mascotte sans décision de la propriétaire. Les photos de personnes publiques restent authentiques et créditées ; une caricature doit être identifiable comme telle.

## 8 Mise en page

Grille d’espacement : 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Marges mobile 20 px, écran large 32 px minimum ; conteneur général jusqu’à 1200 px ; article 65 à 72 caractères ; test jusqu’à 760 px. Les valeurs sont des tokens, pas des nombres dispersés dans les composants.

Grille mobile une colonne ; deux colonnes quand chaque élément conserve une largeur utilisable ; grande grille à douze colonnes pour les surfaces denses. Les breakpoints dépendent de la rupture du contenu, pas de modèles de téléphone.

Les textes ne sont jamais tournés pour « faire bricolé ». Éviter les titres trop condensés, les tableaux sans respiration et les espaces vides utilisés pour compenser une absence de contenu. En mobile, la limite d’un score reste immédiatement visible, pas cachée dans un tooltip.

## 9 Composants et états

| Composant | Construction | États indispensables |
|---|---|---|
| Bouton principal | Encre, texte papier, rayon 6 px, hauteur minimale 48 px | Focus, hover, pressed, loading, disabled |
| Bouton secondaire | Surface et bordure encre, sans concurrencer l’action principale | Identiques au principal |
| Lien | Bleu et soulignement ou signal clair | Visité si utile, focus visible |
| Carte de réponse | Grande zone interactive, libellé normal et bordure | Sélection jaune + coche + état accessible |
| Carte éditoriale | Surface claire, rayon 6 px, bordure fine | Lien clair, sans toute la carte interactive si conflit |
| Badge documentaire | Texte précis et pictogramme facultatif | Statut explicite, jamais couleur seule |
| Source | Éditeur, document, passage et lien | Accessible, indisponible, remplacée |
| Score | Valeur, périmètre, couverture et détail | Incomplet, provisoire, non comparable |
| Alerte | Message factuel et action utile | Erreur, correction, information manquante |
| Tableau | En-têtes stables, unités et lignes lisibles | Mobile accessible, tri explicite |

Ombre de signature : `3px 3px 0` encre, réservée à un bouton ou une carte mise en avant, pas à chaque surface. Bordures principales 1,5 à 2 px ; séparateurs 1 px. Rayon uniforme 6 px ; éviter les capsules partout.

L’état sélectionné ne doit pas déplacer le contenu. L’état de chargement indique l’action réelle sans simuler une réflexion psychologique. Ne pas afficher « on analyse ta personnalité » pour un calcul déterministe.

## 10 Animation et accessibilité

Interactions brèves, 120 à 180 ms, limitées à couleur et déplacement de pression très faible. Pas de compteurs animés qui donnent une dramaturgie trompeuse aux scores. Pas de vibration permanente, confettis politiques ou animations de jugement.

Respecter `prefers-reduced-motion`. Navigation clavier, focus visible, annonces adaptées aux lecteurs d’écran et cibles d’au moins 48 px pour les principaux contrôles. Textes à 200 % et mise en page à 400 % sans perte fonctionnelle. SVG décoratifs masqués aux technologies d’assistance ; SVG significatifs avec équivalent textuel.

Mode sobre : pas de plaisanterie, annotation manuscrite ni texture ; mêmes faits, actions et preuves. Mode sobre et mode sombre sont indépendants. Aucune disparition d’une explication sous prétexte de sobriété.

## 11 Adaptation aux surfaces

Accueil : titre naturel, entrée évidente vers le test, aperçu réel de ce que l’on obtient et actualité documentée. Pas de manifeste gigantesque ni de fausses statistiques de fréquentation.

Test : la surface la plus calme ; question, explication, options, retour et progression. Les cartes miroir respirent entre chapitres. Les réponses ne changent pas de style selon leur contenu politique.

Résultats : profil descriptif avant classement ; priorités et limites visibles ; sources accessibles. Aucune décoration ne rend un candidat artificiellement plus séduisant.

Radar : hiérarchie de presse, titres factuels ou satire clairement située ; annotation possible hors citation. Une citation ne doit pas être graphiquement modifiée pour lui faire dire autre chose.

Observatoire médias : carte des liens et tableau accessible ; distinguer propriété, finance et contrôle par types de relations. Les couleurs ne classent pas les médias en bons et mauvais. Orientation observée toujours accompagnée du corpus.

Studio : un manifeste visuel sans candidat par défaut ; vérification du texte et du recadrage avant export. Boutique : même marque mais espace commercial explicite ; aucun produit entre une réserve méthodologique et son explication.

## 12 Réseaux sociaux et impression

Formats initiaux : carré 1080 × 1080 ; vertical 1080 × 1920 ; paysage 1200 × 630. Conserver les informations essentielles dans une zone centrale adaptable ; tester les recadrages propres au canal plutôt que supposer une zone sûre universelle.

Composition reconnaissable : crème, grand titre noir, signe jaune, un geste humain. Domaine lisible **çavote.fr**. Pas de slogan générique pour remplir le bas. Une carte de résultat conserve les réserves nécessaires ou renvoie explicitement à leur détail sans afficher une certitude fausse.

Fonds d’écran : prévoir plusieurs ratios et une zone libre pour l’horloge, les widgets et les commandes. Le texte ne doit pas traverser ces zones. Les données politiques de l’export restent traitées localement.

Impression : fichiers vectoriels, une version une couleur et une version deux couleurs. Les HEX sont des couleurs écran ; obtenir des épreuves et définir les valeurs CMJN ou tons directs selon le support. Ne pas promettre une correspondance parfaite sans épreuve. Tailles minimales de traits et de texte fixées avec le fabricant.

## 13 Profil de voix

La voix est française, lucide, chaleureuse sans flatterie, capable d’insolence mais attentive aux gens. Elle parle normalement ; elle ne fait pas un numéro à chaque phrase. L’indignation doit naître d’un fait, pas d’une injonction permanente.

Les références demandées servent de directions, pas de modèles à imiter phrase par phrase :

| Référence | Qualité à retenir | À éviter |
|---|---|---|
| Brassens | Humanité envers les gens ordinaires, indépendance, méfiance envers les certitudes collectives | Faux parler ancien, rimes et folklore automatiques |
| Coluche | Parler concret, dégonfler les prétentions, montrer ce que les décisions font aux gens | Grossièreté systématique, imitation de sketches |
| Desproges | Précision, ironie sèche, chute inattendue et économie | Cruauté gratuite, cynisme qui rend toute action vaine |
| Stéphane Hessel | Dignité, mémoire, attention aux injustices et possibilité d’agir | Sermon, héroïsation du média, comparaison historique abusive |

Le site ne cite pas ces noms pour présenter sa personnalité au public. Il ne reprend pas leurs citations comme s’il en était l’auteur. L’agent doit produire une voix originale qui partage ces qualités générales.

Formule interne : familiarité sans infantilisation ; ironie envers le pouvoir ; respect envers le lecteur ; mémoire historique lorsque pertinente ; faits vérifiables avant jugement.

## 14 Intention selon le contexte

| Contexte | Voix attendue | Humour |
|---|---|---|
| Navigation et boutons | Simple, fonctionnelle | Aucun nécessaire |
| Question politique | Neutre, compréhensible | Aucun cadrage comique de la réponse |
| Débrief de chapitre | Proche, observateur | Une remarque possible si elle apporte quelque chose |
| Sources et méthode | Précise, transparente | Rare et périphérique |
| Analyse d’une promesse | Concrète, incisive | Possible après exposition des faits |
| Violence, discrimination, deuil | Sobre et attentive | Pas aux dépens des personnes concernées |
| Correction du site | Responsable et directe | Pas de blague pour minimiser l’erreur |
| Information absente | Honnête | Ne pas ridiculiser l’absence de réponse |
| Boutique | Claire, sans pression | Compatible avec le visuel, pas avec les conditions |

L’humour n’a aucun quota minimal. Une page entière sans plaisanterie est acceptable. La confiance prime sur la reconnaissance d’une « patte ».

## 15 Écriture concrète

Tutoiement dans le parcours personnel ; formulation impersonnelle lorsque plus naturelle dans les dossiers. Préférer sujet et verbe, noms exacts, phrases de longueur variée et paragraphes courts. Expliquer le terme difficile au moment où il apparaît.

Éviter les slogans de méthode : « on décrypte pour toi », « la politique autrement », « reprendre le pouvoir sur ton vote », « un choix éclairé en toute transparence », « les résultats sont sérieux ». Montrer le document, le passage et le calcul.

Éviter les structures répétitives de rédaction IA : « pas X mais Y », « question ? réponse », séries de trois phrases à chaque bloc, métaphores permanentes, chutes plaquées, compliments au lecteur, qualificatifs de qualité non démontrés.

Ne pas transformer les préoccupations du public en certitudes générales : pas « tous les médias mentent », « tous pourris », « les Français pensent » à partir des contributions du site. Critiquer des actes et des arguments précis.

Les titres peuvent être mordants s’ils restent vrais hors contexte. Les citations sont exactes et distinguées du commentaire. Ne pas attribuer une intention quand seuls des actes ou propos sont documentés.

## 16 Bibliothèque d’exemples

Exemples de voix, à adapter aux informations réelles ; aucun fait politique nouveau n’est affirmé ici.

| Situation | À éviter | Proposition naturelle |
|---|---|---|
| Entrée | Commence par ce qui compte pour toi, nous vérifions les propositions | Qu’est-ce qui compte pour toi ? |
| Bouton | Découvrir mon ADN citoyen | Faire le test |
| Résultat | Ton profil politique enfin révélé | Voilà ce qui ressort de tes réponses. |
| Source | Une analyse sourcée pour éclairer ton choix | Le passage est ici, page 12. |
| Inconnu | Notre IA poursuit son enquête | On n’a pas trouvé de position explicite sur ce point. |
| Mise à jour | Ton radar citoyen évolue en temps réel | Deux positions ont changé depuis ton dernier passage. |
| Limite | Compatibilité exceptionnelle de 84 % | 84 sur 100 sur les sujets documentés. Il manque trois positions. |
| Correction | Oups, même les meilleurs se trompent | Nous avions attribué cette proposition au candidat. Elle vient du parti. Le dossier a été corrigé. |
| Média | Découvre les vrais médias libres | Qui possède ce média ? |
| Partage | Révèle tes valeurs au monde | Préparer une image à partager |
| Budget non détaillé | Le tableur vient de quitter la conversation | La dépense est annoncée. Le financement reste à préciser. |

Exemples de remarques éditoriales facultatives, seulement si le dossier justifie leur prémisse : « Le montant est précis. Le financement, moins. » ; « Le titre a changé. La proposition, non. » ; « Le communiqué promet une simplification. Il faudra encore lire les conditions. » Ne pas utiliser ces remarques comme preuve.

## 17 Mémoire historique et engagement

La mémoire doit servir l’analyse : rappeler origine d’un droit, mécanisme institutionnel, précédent ou conséquence établie. Donner sources et différences de contexte. Ne pas assimiler automatiquement une controverse actuelle à un régime historique, ni invoquer le passé comme raccourci pour disqualifier un lecteur.

L’engagement peut apparaître dans le choix de vérifier une injustice ou de rappeler un droit. Il ne doit pas devenir un coefficient caché de score, un encouragement ciblé à voter pour un parti ou une injonction à partager le contenu.

L’indignation tient dans un fait expliqué et une conséquence concrète. Si une conclusion est normative, l’annoncer comme appréciation éditoriale ; ne pas la faire passer pour une mesure objective.

## 18 Profil vocal pour audio et vidéo

Si le média produit des voix off : voix adulte, naturelle, claire, sans caricature de journaliste de plateau ni imitation des personnes citées. Aucun clonage de leur voix. Le genre de la voix n’est pas une exigence de marque ; la cohérence de diction compte davantage.

Débit de départ autour de 140 à 165 mots par minute, ajusté aux chiffres et termes complexes. Articulation nette, pauses après un fait important, une réserve ou une question ; chute ironique posée, sans rire ajouté ni intonation qui commande la réaction. Prononcer le nom « Ça vote ? » comme une question ordinaire, sans jingle crié.

L’audio doit distinguer citation et commentaire par les mots, pas uniquement par une intonation. Lire les unités et expliquer les limites numériques utiles. Pas de musique dramatique pour charger une accusation, ni d’effet comique sur une souffrance.

Fournir transcription et sous-titres relus. Les sources sont accessibles dans l’accompagnement ; une synthèse vocale ne doit pas inventer des expressions ou avaler une négation. Pas de lecture des réponses personnelles vers un prestataire sans fonctionnalité distincte explicitement autorisée.

## 19 Contrat pour l’agent de code

Implémenter un système de tokens sémantiques, des composants partagés et un catalogue de textes versionné. Pas de couleurs ad hoc, polices nouvelles, emojis décoratifs, mascottes ou slogans inventés au fil du développement.

Séparer `UI_COPY`, `EDITORIAL_CONTENT`, `METHOD_NOTES` et `HUMOR_VARIANTS`. Une règle interne ne doit jamais être injectée dans `UI_COPY` comme slogan. Les variantes humoristiques sont validées, contextuelles et supprimables en mode sobre ; aucune génération distante à partir des réponses politiques.

Créer une page interne de référence présentant couleurs, styles typographiques, logo, contrôles, états, tableaux, sources, erreurs et exemple complet de résultat. Elle doit être consultable dans les deux thèmes et le mode sobre. Les pages métier utilisent ces composants plutôt que réinventer le design.

Avant chaque changement : lire cette charte et les instructions plus récentes ; identifier le composant concerné ; choisir le token existant ; vérifier le comportement mobile et clavier ; relire les textes comme une personne qui découvre l’écran. Si une extension est nécessaire, la documenter au niveau du système, pas seulement de la page.

Ne pas modifier les scores, le corpus ou la méthode pour améliorer la présentation. Une donnée absente reste absente ; une interface attractive ne justifie aucune conclusion supplémentaire.

## 20 Contrôle qualité de chaque livraison

- Le nom et la cédille sont corrects ; le domaine visible est çavote.fr.
- Le signe de marque est net en petit, la version raster n’est pas présentée comme vectorielle.
- Couleurs et polices viennent des tokens et fichiers approuvés.
- Lisibilité, contrastes et focus sont vérifiés dans les états réels.
- Mobile, zoom, lecteur d’écran, mode sombre et mode sobre fonctionnent.
- Les décorations ne masquent aucune limite, preuve ou action.
- Les textes nomment une action ou une information ; ils n’expliquent pas la stratégie de marque.
- L’humour est facultatif, contextualisé et sans attaque contre la dignité du lecteur.
- Aucun fait ou affiliation politique n’est inventé par une tournure, un badge ou un dessin.
- Chaque export est vérifié avec son recadrage, ses caractères et sa version.
- Les références artistiques ne sont ni pastichées ni présentées comme des collaborations.
- Les contraintes de confidentialité du cahier des charges restent appliquées.

## 21 Consigne courte à placer dans le contexte de l’agent

> Ça vote ? est un média en papier crème, encre noire et jaune, avec une construction nette et quelques marques dessinées fixes. Applique la charte graphique et le cahier des charges. Écris normalement : une action, un fait ou une question utile. N’affiche jamais une consigne de conception comme un slogan. Aucun humour obligatoire, aucun manifeste ajouté pour remplir une page. La voix est humaine, précise et parfois mordante envers les discours du pouvoir, respectueuse envers le lecteur. Les références Brassens, Coluche, Desproges et Hessel servent de qualités générales, pas de modèles à imiter. Préserve preuves, limites, accessibilité et confidentialité. Toute extension du système doit être explicitée et réutilisable.
