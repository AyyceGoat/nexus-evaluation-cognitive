import type { ArticlesDuDomaine } from './types';

/**
 * Articles du domaine « Science & Technologie ».
 *
 * Deux exigences propres à ce domaine. Les résultats établis et les hypothèses
 * en cours de test ne sont pas présentés du même ton : quand une question est
 * ouverte, elle est donnée comme ouverte. Et les analogies servent à faire
 * entrer dans un raisonnement, jamais à le remplacer — une image qui trompe est
 * pire qu'une équation qu'on ne montre pas.
 */
export const articlesScience: ArticlesDuDomaine = {
  /* ═════════════════════════════════════════════════════════════════════ */
  sci_relativite: [
    {
      titre: 'Le problème que personne ne savait résoudre en 1900',
      paragraphes: [
        'La physique de la fin du XIXᵉ siècle possède deux théories superbes et incompatibles. La mécanique de Newton dit que les vitesses s’additionnent : si vous marchez à 5 km/h dans un train roulant à 100 km/h, vous allez à 105 km/h pour un observateur au sol. L’électromagnétisme de Maxwell, lui, prédit que la lumière se propage à une vitesse fixe, déterminée par deux constantes du vide — sans préciser par rapport à quoi.',
        'L’expérience de Michelson et Morley, en 1887, cherche à mesurer le mouvement de la Terre à travers l’« éther » supposé porter les ondes lumineuses. Elle ne trouve rien, avec une précision qui exclut l’explication par l’erreur de mesure. Plusieurs physiciens — Lorentz, Poincaré — approchent la solution mathématique en conservant l’éther. Einstein, en 1905, prend le problème par l’autre bout.',
      ],
    },
    {
      titre: 'La relativité restreinte : deux postulats, des conséquences déroutantes',
      paragraphes: [
        'Einstein part de deux affirmations simples. Premièrement, les lois de la physique sont les mêmes pour tous les observateurs en mouvement uniforme. Deuxièmement, la vitesse de la lumière dans le vide est la même pour tous ces observateurs, quelle que soit la vitesse de la source. Le second postulat contredit frontalement l’addition des vitesses, et c’est délibéré.',
        'Si l’on accepte ces deux points, il faut renoncer à l’idée d’un temps universel. Deux évènements simultanés pour un observateur ne le sont pas pour un autre en mouvement : la simultanéité dépend du référentiel. Le temps se dilate — une horloge en mouvement bat plus lentement vue du sol —, les longueurs se contractent dans le sens du déplacement, et la masse et l’énergie se révèlent être deux formes d’une même quantité, ce que résume E = mc².',
        'Ces effets ne sont pas des curiosités théoriques. Les muons produits par les rayons cosmiques dans la haute atmosphère ont une durée de vie si courte qu’ils devraient se désintégrer avant d’atteindre le sol ; on les détecte pourtant en abondance, parce que leur temps propre s’écoule plus lentement à la vitesse à laquelle ils voyagent. Les accélérateurs de particules exploitent ce résultat tous les jours.',
      ],
    },
    {
      titre: 'La relativité générale : la gravitation comme géométrie',
      paragraphes: [
        'En 1907, Einstein a ce qu’il appellera « la pensée la plus heureuse de sa vie » : une personne en chute libre ne ressent pas son propre poids. Accélération et gravitation produisent localement les mêmes effets et sont donc, en un sens précis, la même chose. Il lui faudra huit ans de travail mathématique, avec l’aide de Marcel Grossmann pour la géométrie non euclidienne, pour en tirer une théorie.',
        'Le résultat, présenté en novembre 1915, remplace la force de gravitation par une géométrie : la masse et l’énergie courbent l’espace-temps, et les corps suivent les trajectoires les plus droites possibles dans cet espace courbé. La Terre ne tourne pas autour du Soleil parce qu’une force l’attire, mais parce qu’elle suit une géodésique dans une région déformée par la masse solaire.',
        'La théorie fait des prédictions vérifiables et risquées. Elle explique l’avance du périhélie de Mercure — 43 secondes d’arc par siècle que Newton ne rendait pas — sans paramètre ajustable. Elle prédit que la lumière est déviée par la masse, de 1,75 seconde d’arc au bord du Soleil, soit le double de la valeur newtonienne. La mesure de l’éclipse du 29 mai 1919, par les expéditions britanniques à Príncipe et à Sobral, confirme la valeur d’Einstein et le rend célèbre dans le monde entier en quelques jours.',
      ],
    },
    {
      titre: 'Un siècle de vérifications',
      paragraphes: [
        'Le décalage gravitationnel des fréquences est mesuré en laboratoire par Pound et Rebka en 1959. Les trous noirs, solution trouvée par Schwarzschild dès 1916 et longtemps tenue pour une curiosité mathématique, sont aujourd’hui observés : image de l’ombre du trou noir de M87 publiée en avril 2019, puis de celui de notre galaxie en 2022.',
        'La confirmation la plus spectaculaire est la détection directe des ondes gravitationnelles, prédites en 1916. Le 14 septembre 2015, les interféromètres LIGO enregistrent le passage d’une onde produite par la fusion de deux trous noirs à plus d’un milliard d’années-lumière ; l’annonce est faite le 11 février 2016. L’instrument mesure une variation de longueur de l’ordre du millième du diamètre d’un proton sur des bras de quatre kilomètres.',
        'La théorie a aussi transformé la cosmologie : univers en expansion, modèle du Big Bang, fond diffus cosmologique. Deux inconnues majeures subsistent — la matière noire et l’énergie noire —, dont la nature n’est pas expliquée par la relativité générale et pourrait indiquer ses limites.',
      ],
    },
    {
      titre: 'Le GPS, preuve quotidienne',
      paragraphes: [
        'Les horloges atomiques des satellites de navigation subissent deux effets contraires. Parce qu’elles se déplacent vite, elles retardent d’environ 7 microsecondes par jour selon la relativité restreinte. Parce qu’elles sont plus loin de la masse terrestre, donc dans un champ gravitationnel plus faible, elles avancent d’environ 45 microsecondes par jour selon la relativité générale.',
        'Le solde est d’environ 38 microsecondes d’avance par jour. La lumière parcourant 30 centimètres par nanoseconde, une telle dérive non corrigée produirait une erreur de position de l’ordre de dix kilomètres après vingt-quatre heures. Les satellites embarquent donc une correction relativiste permanente : chaque itinéraire calculé sur un téléphone est une vérification de la théorie.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est l’exemple le plus net de ce qu’une théorie physique peut accomplir : partir d’un problème de cohérence, renoncer à des évidences aussi ancrées que le temps universel, et aboutir à des prédictions numériques vérifiées à plusieurs décimales un siècle plus tard par des instruments que son auteur n’imaginait pas.',
        'Parce que l’incompatibilité entre la relativité générale et la mécanique quantique est le grand chantier ouvert de la physique. Les deux théories sont extraordinairement bien vérifiées dans leurs domaines respectifs, et ne peuvent pas être vraies simultanément dans les situations où la gravitation et le quantique comptent tous les deux — au centre d’un trou noir, au tout début de l’univers. Savoir qu’un tel trou existe au cœur de la physique est en soi une information précieuse.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_mecanique_quantique: [
    {
      titre: 'Une théorie née d’un bricolage réussi',
      paragraphes: [
        'En 1900, Max Planck cherche à expliquer le rayonnement d’un corps chaud, problème sur lequel la physique classique donne une réponse absurde. Il trouve la bonne formule en supposant que l’énergie ne peut être échangée que par paquets discrets, proportionnels à une constante minuscule qu’il introduit sans y croire vraiment. Einstein prend cette hypothèse au sérieux en 1905 pour expliquer l’effet photoélectrique — c’est ce travail, et non la relativité, qui lui vaudra le prix Nobel.',
        'La construction s’accélère dans les années 1920 : modèle atomique de Bohr en 1913, hypothèse ondulatoire de la matière par de Broglie en 1924, mécanique matricielle de Heisenberg en 1925, équation de Schrödinger en 1926, interprétation probabiliste de Born la même année. En une décennie, la physique change de fondements.',
      ],
    },
    {
      titre: 'Les trois faits contre-intuitifs',
      paragraphes: [
        'Le premier est la dualité. Un électron envoyé sur deux fentes produit des franges d’interférence, ce qui est un comportement d’onde. Si l’on place un détecteur pour savoir par quelle fente il passe, les franges disparaissent et il se comporte comme une particule. L’expérience a été réalisée avec des électrons uniques, envoyés un par un, par Tonomura en 1989 : les franges apparaissent progressivement, ce qui interdit de les expliquer par une interaction entre particules.',
        'Le deuxième est l’indétermination, énoncée par Heisenberg en 1927 : le produit des imprécisions sur la position et sur la quantité de mouvement ne peut descendre en dessous d’une limite fixée par la constante de Planck. Ce n’est pas une insuffisance des instruments mais une propriété de la nature — une particule n’a pas simultanément une position et une vitesse parfaitement définies.',
        'Le troisième est l’intrication. Deux particules préparées ensemble forment un système unique dont les mesures sont corrélées, quelle que soit la distance qui les sépare. Einstein, Podolsky et Rosen y voyaient en 1935 la preuve que la théorie était incomplète. John Bell a montré en 1964 que la question était expérimentalement tranchable, et les expériences d’Alain Aspect en 1982, puis de nombreuses autres, ont donné raison à la mécanique quantique. Aspect, Clauser et Zeilinger ont reçu le prix Nobel de physique 2022 pour ces travaux.',
      ],
    },
    {
      titre: 'Ce que « mesurer » veut dire, et le désaccord qui persiste',
      paragraphes: [
        'La théorie décrit l’état d’un système par une fonction d’onde qui évolue de façon parfaitement déterministe. Mais lorsqu’on mesure, on obtient un résultat unique, avec une probabilité donnée par le carré de l’amplitude. Le passage de la superposition au résultat unique n’est pas décrit par l’équation : c’est le problème de la mesure, et il n’est pas résolu.',
        'D’où des interprétations concurrentes, qui font les mêmes prédictions et racontent des choses très différentes. L’interprétation dite de Copenhague considère la fonction d’onde comme un outil de calcul et s’abstient de décrire ce qui se passe. Celle des mondes multiples, proposée par Everett en 1957, supprime la réduction en admettant que toutes les branches se réalisent. Celle de l’onde pilote, de de Broglie et Bohm, restaure des trajectoires définies au prix d’une non-localité explicite. La théorie de la décohérence explique par ailleurs très bien pourquoi les superpositions deviennent inobservables à notre échelle, sans pour autant clore la question de la mesure.',
        'Il est important de savoir que ce débat porte sur l’interprétation et non sur les prédictions. La mécanique quantique est la théorie la mieux vérifiée de l’histoire : le moment magnétique de l’électron est prédit et mesuré avec un accord de l’ordre de la douzième décimale.',
      ],
    },
    {
      titre: 'Ce qu’elle a permis de construire',
      paragraphes: [
        'Presque toute l’électronique. Le transistor repose sur la physique quantique des semi-conducteurs ; il y en a des dizaines de milliards dans un téléphone. Le laser exploite l’émission stimulée décrite par Einstein en 1917 ; il sert à lire un disque, découper de l’acier, transmettre des données dans une fibre et opérer un œil.',
        'L’imagerie médicale par résonance magnétique repose sur le spin nucléaire. Les horloges atomiques, qui définissent la seconde et sans lesquelles ni les réseaux de télécommunications ni la navigation par satellite ne fonctionneraient, mesurent une transition quantique du césium. Les diodes électroluminescentes, les panneaux photovoltaïques et la microscopie électronique sont dans le même cas.',
        'Les technologies « quantiques » de deuxième génération exploitent directement la superposition et l’intrication. La cryptographie quantique permet une distribution de clés dont toute interception est détectable. L’ordinateur quantique, encore expérimental, promet des accélérations sur certaines classes de problèmes — l’algorithme de Shor, publié en 1994, factoriserait les grands nombres et casserait une partie de la cryptographie actuelle, ce qui motive dès aujourd’hui la migration vers des algorithmes post-quantiques.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’une part considérable de l’économie contemporaine repose sur une théorie dont personne ne s’accorde sur ce qu’elle dit du monde. C’est un fait remarquable sur la nature de la connaissance scientifique : une théorie peut être exacte, féconde et indispensable tout en restant philosophiquement obscure.',
        'Parce que c’est aussi le domaine où l’intuition ordinaire échoue le plus complètement, et où l’habitude de suivre le formalisme plutôt que l’image mentale paie. Le revers est que le vocabulaire quantique est massivement détourné pour vendre des discours pseudo-scientifiques : l’indétermination ne dit rien sur le libre arbitre, l’intrication ne permet pas de transmettre de l’information plus vite que la lumière, et l’observateur dont parle la théorie est un appareil de mesure, non une conscience.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_intelligence_artificielle: [
    {
      titre: 'Soixante-dix ans en quatre mots : ambition, hiver, données, échelle',
      paragraphes: [
        'Le terme « intelligence artificielle » est forgé en 1956 pour la conférence de Dartmouth, organisée par John McCarthy, Marvin Minsky et quelques autres, dont la proposition estimait qu’un progrès significatif pouvait être accompli en un été par dix personnes. Alan Turing avait posé six ans plus tôt, en 1950, la question « une machine peut-elle penser ? » et proposé de la remplacer par un test opérationnel.',
        'Suivent deux « hivers ». Le perceptron de Rosenblatt, en 1957, est le premier réseau de neurones apprenant ; Minsky et Papert montrent en 1969 ses limites théoriques, et le financement s’effondre. L’approche symbolique — systèmes experts à base de règles — domine les années 1980 puis déçoit à son tour, faute de pouvoir écrire à la main toutes les règles du monde réel.',
      ],
    },
    {
      titre: 'Le retour des réseaux, et les trois ingrédients qui manquaient',
      paragraphes: [
        'L’algorithme de rétropropagation, popularisé en 1986 par Rumelhart, Hinton et Williams, permet d’entraîner des réseaux à plusieurs couches. Yann LeCun l’applique avec succès à la reconnaissance de chiffres manuscrits dès 1989. La théorie était donc largement en place ; ce qui manquait était ailleurs.',
        'Trois choses arrivent ensemble au début des années 2010. Les données : ImageNet, base de plus d’un million d’images étiquetées, constituée par Fei-Fei Li. La puissance de calcul : les processeurs graphiques, conçus pour le jeu vidéo, s’avèrent parfaits pour les multiplications de matrices. Et des améliorations techniques d’apparence modeste mais décisives sur les fonctions d’activation et l’initialisation.',
        'Le basculement est daté : en 2012, le réseau AlexNet fait tomber le taux d’erreur du concours ImageNet d’environ 26 % à 15 %, un écart sans précédent. En quelques années, la vision par ordinateur, la reconnaissance vocale et la traduction automatique sont refondues sur cette base.',
      ],
    },
    {
      titre: 'Le Transformer, et pourquoi tout a accéléré après 2017',
      paragraphes: [
        'En juin 2017, un article de chercheurs de Google intitulé « Attention Is All You Need » propose une architecture qui abandonne le traitement séquentiel du texte au profit d’un mécanisme d’attention comparant tous les éléments entre eux. L’avantage pratique est qu’elle se parallélise, donc qu’elle peut être entraînée sur des quantités de texte bien supérieures.',
        'S’y ajoute une observation empirique, formalisée vers 2020 sous le nom de lois d’échelle : la performance de ces modèles s’améliore de manière régulière et prévisible quand on augmente conjointement la taille du modèle, la quantité de données et le calcul. Cette régularité a justifié des investissements d’un ordre de grandeur inédit, et elle a tenu — jusqu’ici.',
        'Les jalons publics suivent : GPT-3 en 2020 avec 175 milliards de paramètres, ChatGPT le 30 novembre 2022, qui rend la technologie tangible pour le grand public. Les prix Nobel 2024 en consacrent deux facettes : la physique pour Hopfield et Hinton sur les fondements des réseaux, la chimie pour Hassabis, Jumper et Baker, notamment pour AlphaFold, qui a résolu le problème de la prédiction de la structure des protéines resté ouvert pendant cinquante ans.',
      ],
    },
    {
      titre: 'Ce que ces systèmes font, et ce qu’ils ne font pas',
      paragraphes: [
        'Un grand modèle de langage est entraîné à prédire la suite d’un texte. Cet objectif, apparemment pauvre, suffit à produire des capacités étendues — traduire, résumer, programmer, raisonner par étapes — parce que prédire correctement exige d’avoir capté beaucoup de régularités du monde décrit par le texte.',
        'Les limites découlent du même mécanisme. Le modèle produit l’énoncé le plus plausible, pas le plus vrai : d’où les affirmations fausses énoncées avec assurance, qu’on appelle par euphémisme des hallucinations. Il n’a pas d’accès direct au monde ni de moyen de vérifier, sauf si on lui en donne un. Ses connaissances s’arrêtent à ses données d’entraînement. Et il reproduit les biais de ces données.',
        'La question de savoir si ces systèmes « comprennent » est activement débattue, et le débat n’est pas purement sémantique : il porte sur la présence ou non d’un modèle interne du monde, testable par des expériences de généralisation. Il est prudent de considérer que la réponse n’est pas connue, plutôt que d’adopter l’une des deux positions tranchées.',
      ],
    },
    {
      titre: 'Les coûts et les questions ouvertes',
      paragraphes: [
        'L’entraînement des plus grands modèles consomme des quantités d’électricité et d’eau de refroidissement significatives, et la construction des centres de données est devenue un enjeu d’aménagement et de réseau électrique dans plusieurs pays. Les estimations publiques varient beaucoup, faute de transparence des opérateurs.',
        'Les questions non résolues sont de trois ordres. Économique : quels emplois sont transformés, lesquels disparaissent, et à quelle vitesse — les travaux disponibles suggèrent une exposition forte des tâches de rédaction, de programmation et d’analyse, mais les effets nets sur l’emploi restent incertains. Juridique : statut des données d’entraînement, droit d’auteur, responsabilité en cas de dommage. Et technique : comment vérifier qu’un système poursuit bien l’objectif qu’on lui a assigné, question dite d’alignement, qui n’a pas de solution générale connue.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est la première technologie à automatiser une part du travail intellectuel de rédaction, de synthèse et de programmation, c’est-à-dire précisément les tâches que la révolution industrielle avait épargnées. La comparaison avec les vagues précédentes est instructive sans être concluante : l’histoire suggère un déplacement des métiers plutôt qu’une disparition du travail, mais elle ne dit rien de la vitesse ni du sort des personnes pendant la transition.',
        'Parce que l’écart se creuse entre ceux qui savent s’en servir et les autres, et que cet écart se comble par la pratique plus que par le diplôme. Comprendre le mécanisme — prédiction de la suite la plus plausible — est le meilleur moyen de savoir quand faire confiance à la réponse et quand la vérifier.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_batteries_lithium: [
    {
      titre: 'Pourquoi le lithium',
      paragraphes: [
        'Une batterie stocke de l’énergie chimique et la restitue sous forme de courant. Sa performance dépend d’abord du choix des matériaux : il faut un élément qui cède facilement un électron et qui soit léger, puisqu’on transporte la batterie avec la charge. Le lithium est le métal le plus léger du tableau périodique et l’un des plus électropositifs ; c’est le meilleur candidat théorique, et il l’est resté.',
        'Le problème pratique est qu’il est aussi très réactif. La solution trouvée est le principe de l’intercalation : au lieu de déposer du lithium métallique, on fait migrer des ions lithium entre deux structures hôtes qui les accueillent sans se détruire. C’est ce qui rend la batterie rechargeable des centaines de fois.',
      ],
    },
    {
      titre: 'Trois chercheurs, trois pièces du puzzle',
      paragraphes: [
        'Stanley Whittingham, dans les années 1970 chez Exxon, démontre l’intercalation avec une cathode en disulfure de titane. La batterie fonctionne mais l’anode en lithium métallique provoque des courts-circuits par croissance de filaments.',
        'John Goodenough, en 1980 à Oxford, remplace la cathode par un oxyde de cobalt lithié, ce qui double la tension disponible et reste aujourd’hui la base des cathodes les plus énergétiques. Akira Yoshino, en 1985 au Japon, remplace l’anode métallique par du carbone graphité, éliminant le danger. Sony commercialise la première batterie lithium-ion en 1991. Les trois hommes reçoivent le prix Nobel de chimie en 2019 ; Goodenough, à 97 ans, est le plus âgé des lauréats de l’histoire.',
      ],
    },
    {
      titre: 'La courbe qui a tout changé',
      paragraphes: [
        'La densité d’énergie des cellules est passée d’environ 100 wattheures par kilogramme en 1991 à 250-300 aujourd’hui. C’est important, mais le chiffre décisif est le prix. Le coût d’un pack de batteries pour véhicule électrique était de l’ordre de 1 100 dollars par kilowattheure en 2010 ; il est tombé sous 150 dollars au début des années 2020, soit une division par plus de sept en une dizaine d’années.',
        'Cette baisse suit une régularité connue sous le nom de courbe d’apprentissage : chaque doublement de la production cumulée fait baisser le coût unitaire d’un pourcentage à peu près constant. C’est elle, et non une percée scientifique unique, qui a rendu la voiture électrique et le stockage de réseau économiquement possibles. Le seuil symbolique des 100 dollars par kilowattheure, longtemps considéré comme le point de parité avec le moteur thermique, est atteint sur certaines chimies.',
        'Deux familles se partagent le marché. Les chimies au nickel-manganèse-cobalt offrent la meilleure densité, donc l’autonomie ; celles au lithium-fer-phosphate, sans cobalt, sont moins denses mais plus sûres, plus durables et moins chères, et ont repris une part majoritaire du marché mondial. Le choix entre les deux est un arbitrage, pas un progrès linéaire.',
      ],
    },
    {
      titre: 'La chaîne d’approvisionnement, et ses points durs',
      paragraphes: [
        'Le lithium provient principalement des saumures d’Amérique du Sud — Chili, Argentine, Bolivie — et des roches dures d’Australie, avec un raffinage très concentré en Chine. Le cobalt vient pour environ 70 % de la République démocratique du Congo, où une part de la production relève de l’exploitation artisanale, avec des conditions de travail et des cas de travail d’enfants documentés par plusieurs enquêtes. C’est l’une des raisons du basculement industriel vers les chimies sans cobalt, à côté de la raison économique.',
        'Le graphite, le nickel et le manganèse posent des questions comparables de concentration géographique. L’extraction du lithium consomme par ailleurs de grandes quantités d’eau dans des régions arides, ce qui crée des conflits d’usage réels avec les populations locales et l’agriculture.',
        'Le recyclage est l’enjeu de la décennie : les métaux d’une batterie usée sont présents à des concentrations très supérieures à celles des minerais, ce qui rend la filière intéressante dès qu’un volume suffisant arrive en fin de vie. Les taux de récupération atteignent déjà des niveaux élevés sur le cobalt et le nickel ; le lithium est plus difficile à récupérer économiquement.',
      ],
    },
    {
      titre: 'Ce qui vient après',
      paragraphes: [
        'Les batteries à électrolyte solide remplacent le liquide inflammable par un matériau solide : elles promettent plus de densité, une charge plus rapide et une sécurité accrue. Elles butent depuis des années sur la tenue des interfaces au cyclage, et les annonces de mise en production ont été repoussées à plusieurs reprises — la prudence est de mise devant les calendriers annoncés.',
        'Les batteries sodium-ion, moins denses, sont en revanche déjà produites en série. Elles n’intéressent pas l’automobile longue distance, mais le sodium est abondant et bon marché partout, ce qui en fait un candidat crédible pour le stockage stationnaire, celui dont les réseaux électriques ont besoin pour absorber le solaire et l’éolien.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le problème central de la transition énergétique n’est pas de produire de l’électricité propre — le solaire est devenu la source la moins chère de l’histoire dans de nombreuses régions — mais de la disposer au moment où on la consomme. Le stockage est le maillon qui décide si un réseau peut être majoritairement renouvelable.',
        'Parce que cette histoire illustre aussi comment une technologie devient dominante : non par une invention géniale isolée, mais par quarante ans d’améliorations incrémentales et par le volume de production. C’est un argument concret dans les débats sur les politiques industrielles : ce qui fait baisser les coûts, c’est de fabriquer beaucoup, tôt.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_internet: [
    {
      titre: 'L’idée fondatrice : découper les messages',
      paragraphes: [
        'Le réseau téléphonique fonctionnait par commutation de circuits : établir un appel, c’était réserver un chemin physique de bout en bout pendant toute la durée de la conversation. Ce modèle est coûteux et fragile — couper le chemin coupe la communication.',
        'Au début des années 1960, Paul Baran aux États-Unis et Donald Davies au Royaume-Uni proposent indépendamment l’inverse : découper les messages en petits paquets, chacun portant l’adresse de destination, et laisser chaque nœud du réseau décider du prochain saut. Les paquets d’un même message peuvent suivre des chemins différents et sont réassemblés à l’arrivée. Le réseau devient tolérant aux pannes, et le débit se partage entre tous les usages.',
        'ARPANET met ce principe en service en 1969 ; le premier message, envoyé le 29 octobre entre l’UCLA et Stanford, s’interrompt après deux lettres parce que la machine distante tombe en panne. En 1974, Vinton Cerf et Robert Kahn publient les protocoles TCP/IP, qui permettent d’interconnecter des réseaux hétérogènes — c’est cette capacité d’interconnexion, plus que le réseau lui-même, qui donne son nom à Internet. Le basculement général vers TCP/IP a lieu le 1ᵉʳ janvier 1983.',
      ],
    },
    {
      titre: 'Internet n’est pas le Web',
      paragraphes: [
        'Internet est l’infrastructure : des câbles, des routeurs, des protocoles d’adressage et d’acheminement. Le Web n’est qu’une application qui circule dessus, comme le courrier électronique, la visioconférence ou le streaming.',
        'Il est né vingt ans après le réseau. Tim Berners-Lee, ingénieur au CERN, rédige en mars 1989 une proposition de système documentaire hypertexte pour organiser l’information de laboratoire. Il en fait une implémentation fonctionnelle et met en ligne le premier site en août 1991. L’ouverture du protocole au domaine public et le navigateur Mosaic en 1993 produisent l’adoption de masse.',
      ],
    },
    {
      titre: 'La géographie physique du réseau',
      paragraphes: [
        'Une idée fausse très répandue veut que les communications intercontinentales passent par satellite. En réalité, plus de 95 % du trafic international transite par des câbles sous-marins en fibre optique : plus de cinq cents câbles en service, totalisant environ 1,4 million de kilomètres. Un câble transatlantique moderne a le diamètre d’un tuyau d’arrosage et transporte des dizaines de terabits par seconde.',
        'Cette matérialité crée des points de passage critiques. Le corridor de la mer Rouge et de l’Égypte concentre l’essentiel des liaisons entre l’Europe et l’Asie ; les coupures survenues en février 2024 y ont dégradé le trafic sur plusieurs continents. Les détroits, les atterrages et les stations de raccordement sont des infrastructures stratégiques, et leur protection est devenue un sujet militaire explicite.',
        'Pour l’Afrique, cette géographie est déterminante. Les câbles SAT-3, WACS, puis plus récemment Equiano et 2Africa ont multiplié la capacité et fait baisser les prix de gros. Le second levier est plus discret et tout aussi important : les points d’échange Internet locaux. Sans eux, deux utilisateurs d’un même pays voient leur trafic remonter jusqu’en Europe et redescendre, ce qui ajoute des dizaines de millisecondes de latence et un coût de transit inutile.',
      ],
    },
    {
      titre: 'Les quatre pièces qui font marcher une adresse web',
      paragraphes: [
        'Le nom de domaine, d’abord, traduit par le DNS — un annuaire hiérarchique conçu en 1983-1984 par Paul Mockapetris — en une adresse IP numérique. C’est un point de centralisation relatif du réseau, et donc un levier de censure et de blocage largement utilisé.',
        'Le routage, ensuite : le protocole BGP, par lequel les grands opérateurs s’annoncent mutuellement les chemins disponibles. Il repose sur la confiance mutuelle, et de mauvaises annonces — par erreur ou volontairement — ont déjà détourné le trafic de pays entiers.',
        'Les réseaux de diffusion de contenu, enfin, qui recopient les pages et les vidéos dans des serveurs proches des utilisateurs. Une part majoritaire du trafic ne traverse plus l’Internet public : elle est servie depuis un cache situé chez l’opérateur local. Et le chiffrement TLS, généralisé dans les années 2010, qui a fait passer le Web de l’exception au défaut en matière de confidentialité.',
      ],
    },
    {
      titre: 'Une architecture ouverte, une utilisation concentrée',
      paragraphes: [
        'Le réseau a été conçu décentralisé, et il l’est resté techniquement : il n’existe aucun interrupteur central. Mais son usage s’est fortement concentré. Une poignée de plateformes capte l’essentiel du temps d’attention, trois fournisseurs d’informatique en nuage hébergent une grande partie des services, et quelques réseaux de diffusion acheminent la majorité du trafic. Une panne chez l’un d’eux rend inaccessibles des milliers de sites indépendants — démonstration régulière que la décentralisation de l’architecture ne garantit pas celle des usages.',
        'Les tensions de gouvernance suivent : neutralité du réseau, fragmentation en Internets nationaux, souveraineté des données, contrôle des passerelles. L’épuisement des adresses IPv4, constaté en 2011, et la transition lente vers IPv6 illustrent une difficulté propre à ce système : rien ne peut être imposé, tout doit être adopté.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que savoir que le réseau est fait de câbles, de contrats de transit et d’annuaires change la lecture de l’actualité : une coupure de câble, une décision de justice sur le DNS, un différend entre opérateurs ou un point d’échange manquant ont des effets concrets sur ce que des millions de personnes peuvent faire.',
        'Parce que le principe de conception le plus important est aussi le plus transposable : l’intelligence est aux extrémités, le réseau ne fait que transporter. C’est ce choix qui a permis d’inventer le Web, la voix sur IP et le streaming sans demander la permission à personne, et c’est exactement lui qui est en jeu dans les débats sur la neutralité.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_crispr: [
    {
      titre: 'Un système immunitaire bactérien, découvert par hasard',
      paragraphes: [
        'En 1987, des chercheurs japonais remarquent dans le génome d’une bactérie des séquences répétées séparées par des fragments variables, sans y voir de fonction. Francisco Mojica, en Espagne, retrouve les mêmes motifs dans les années 1990 et 2000 et propose l’hypothèse correcte : ce sont des archives. La bactérie conserve des morceaux d’ADN des virus qui l’ont attaquée, pour les reconnaître à la prochaine rencontre.',
        'La fonction est démontrée expérimentalement en 2007 par Rodolphe Barrangou et Philippe Horvath, travaillant sur des bactéries lactiques d’intérêt industriel. Le mécanisme est un système immunitaire adaptatif : une séquence guide, copiée de l’archive, conduit une enzyme coupeuse — Cas9 — exactement sur l’ADN correspondant, qu’elle sectionne.',
      ],
    },
    {
      titre: 'L’idée qui transforme un mécanisme en outil',
      paragraphes: [
        'En août 2012, Emmanuelle Charpentier et Jennifer Doudna publient le résultat décisif : le guide peut être remplacé par n’importe quelle séquence choisie par l’expérimentateur. L’enzyme ira couper là où on le lui demande. Quelques mois plus tard, en janvier 2013, plusieurs équipes — dont celles de Feng Zhang et de George Church — montrent que cela fonctionne dans des cellules humaines.',
        'L’intérêt n’est pas d’avoir inventé la modification génétique, qui existait depuis les années 1970, mais de l’avoir rendue précise, rapide et bon marché. Ce qui exigeait auparavant des mois de travail et un budget conséquent devient une manipulation de laboratoire réalisable en quelques jours pour quelques centaines d’euros. C’est un changement d’accessibilité, et c’est ce qui explique la vitesse de diffusion.',
        'Le prix Nobel de chimie 2020 récompense Charpentier et Doudna. Le partage du mérite a par ailleurs donné lieu à l’un des contentieux de brevets les plus coûteux de la biotechnologie entre les institutions américaines et européennes concernées.',
      ],
    },
    {
      titre: 'Comment on répare réellement un gène',
      paragraphes: [
        'Couper est la partie facile. La cellule, une fois son ADN sectionné, le répare selon deux voies. La première, majoritaire, recolle les extrémités en perdant ou ajoutant quelques bases : elle suffit pour désactiver un gène, ce qui est souvent l’objectif. La seconde utilise un modèle fourni par l’expérimentateur pour reconstruire la séquence souhaitée ; elle est plus rare et donc plus difficile à obtenir.',
        'Cette limite a motivé des outils plus fins. L’édition de bases, développée dans le laboratoire de David Liu, modifie chimiquement une seule lettre de l’ADN sans couper le double brin. L’édition « prime », publiée en 2019, permet des remplacements de séquences courtes avec une précision supérieure. Ce sont ces techniques de deuxième génération qui portent l’essentiel des espoirs thérapeutiques actuels.',
      ],
    },
    {
      titre: 'De la promesse au traitement autorisé',
      paragraphes: [
        'Le seuil a été franchi fin 2023. Une thérapie fondée sur CRISPR contre la drépanocytose et la bêta-thalassémie a été autorisée au Royaume-Uni en novembre puis aux États-Unis le 8 décembre 2023. Le principe : prélever les cellules souches de la moelle du patient, désactiver hors du corps un gène qui réprime la production d’hémoglobine fœtale, et réinjecter les cellules corrigées. Les résultats cliniques publiés montrent une disparition des crises douloureuses chez la grande majorité des patients traités.',
        'Le problème est le prix, de l’ordre de deux millions de dollars par patient, et la lourdeur du protocole, qui inclut une chimiothérapie de conditionnement. Or la drépanocytose est massivement présente en Afrique subsaharienne, où naissent environ trois quarts des enfants atteints dans le monde. Une thérapie efficace mais inaccessible aux populations les plus concernées pose un problème d’équité qui est aujourd’hui le principal sujet de discussion autour de cette technologie.',
      ],
    },
    {
      titre: 'La ligne qui a été franchie en 2018',
      paragraphes: [
        'Il existe une distinction éthique fondamentale entre modifier les cellules d’une personne malade — ce qui ne se transmet pas — et modifier un embryon, ce qui affecte toutes les cellules de la personne et toute sa descendance. La seconde opération est interdite ou moratoire dans la quasi-totalité des pays.',
        'En novembre 2018, le chercheur chinois He Jiankui annonce la naissance de deux jumelles dont il a modifié un gène au stade embryonnaire. La condamnation scientifique internationale a été immédiate et pratiquement unanime, pour des raisons techniques autant qu’éthiques : la modification était inutile — il existait des moyens sûrs d’éviter la transmission du VIH concerné —, imparfaitement réalisée, et sans consentement éclairé réel. Il a été condamné à trois ans de prison en Chine.',
        'Les objections techniques demeurent valables pour toute tentative future : effets hors cible, mosaïcisme lorsque la modification n’atteint pas toutes les cellules de l’embryon, et impossibilité de connaître les conséquences sur des fonctions que le gène remplit peut-être ailleurs.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que pour la première fois des maladies génétiques d’un seul gène — drépanocytose, mucoviscidose, amyotrophie spinale, certaines cécités héréditaires — passent du statut de fatalité à celui de cible thérapeutique identifiée. Ce n’est pas encore une médecine de routine, mais ce n’est plus une hypothèse.',
        'Parce que la technique est suffisamment simple pour se diffuser hors des grands laboratoires, ce qui déplace la question de la régulation. On ne contrôle pas un outil accessible comme on contrôle un accélérateur de particules. Les débats sur les cultures éditées, sur le forçage génétique pour éradiquer des moustiques vecteurs du paludisme, et sur les limites de l’amélioration humaine, ne relèvent plus de la science-fiction.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_neurosciences: [
    {
      titre: 'Les ordres de grandeur, corrigés',
      paragraphes: [
        'Le cerveau humain contient environ 86 milliards de neurones — chiffre établi en 2009 par l’équipe de Suzana Herculano-Houzel, qui a corrigé l’estimation de « cent milliards » répétée pendant des décennies sans source solide. Il compte un nombre comparable de cellules gliales, longtemps considérées comme un simple soutien et dont on sait aujourd’hui qu’elles participent au traitement de l’information.',
        'Chaque neurone forme en moyenne plusieurs milliers de connexions, ce qui porte le nombre de synapses à l’ordre de cent mille milliards. L’organe représente environ 2 % de la masse corporelle et consomme environ 20 % de l’énergie au repos, soit une vingtaine de watts — moins qu’une ampoule, pour une tâche qu’aucun centre de données ne réalise avec cette efficacité.',
      ],
    },
    {
      titre: 'Comment on a appris ce qu’on sait',
      paragraphes: [
        'Longtemps, la seule méthode fut la lésion : observer ce qu’une personne perd quand une région est détruite. Le cas de Phineas Gage, en 1848, dont une barre de fer traversa le lobe frontal et qui survécut avec une personnalité durablement modifiée, ouvre l’étude des fonctions exécutives. Paul Broca en 1861, puis Carl Wernicke en 1874, localisent deux régions du langage aux rôles distincts — produire et comprendre.',
        'Le cas le plus instructif de l’histoire est celui du patient connu sous les initiales H. M. En 1953, une chirurgie destinée à traiter une épilepsie grave retire ses deux hippocampes. Il conserve son intelligence, sa personnalité et ses souvenirs anciens, mais devient incapable de former de nouveaux souvenirs conscients. Il apprend en revanche des gestes qu’il exécute de mieux en mieux sans se souvenir de les avoir appris. C’est cette dissociation qui a établi que la mémoire n’est pas une fonction unique.',
        'Santiago Ramón y Cajal avait par ailleurs établi dès la fin du XIXᵉ siècle, par le dessin sous microscope, que le système nerveux est fait de cellules distinctes communiquant par contact et non d’un réseau continu — la doctrine du neurone, qui lui vaut le Nobel en 1906.',
      ],
    },
    {
      titre: 'Les outils modernes, et ce qu’ils voient vraiment',
      paragraphes: [
        'L’imagerie par résonance magnétique fonctionnelle, développée dans les années 1990, mesure les variations locales d’oxygénation du sang, qui suivent l’activité neuronale avec quelques secondes de retard. C’est un signal indirect, à la résolution spatiale de quelques millimètres — chaque point de mesure contient des centaines de milliers de neurones. Elle permet de comparer des conditions expérimentales, pas de « lire les pensées ».',
        'Ses pièges ont été documentés par les chercheurs du domaine eux-mêmes : puissance statistique insuffisante dans beaucoup d’études anciennes, et surtout inférence inversée — conclure d’une activation qu’une fonction est en jeu, alors que la même région s’active dans de nombreuses tâches différentes. Une étude célèbre de 2009 a obtenu des « activations » significatives dans le cerveau d’un saumon mort, simplement en appliquant les corrections statistiques usuelles de l’époque : la démonstration a durablement resserré les pratiques.',
        'L’optogénétique, développée à partir de 2005, a changé la nature des preuves disponibles. En insérant dans des neurones précis un gène de protéine sensible à la lumière, on peut les activer ou les éteindre au millième de seconde avec une fibre optique. On passe ainsi de la corrélation à la causalité : non plus « cette région s’active quand l’animal a peur », mais « allumer ces neurones déclenche le comportement de peur ».',
      ],
    },
    {
      titre: 'La plasticité, résultat le plus utile',
      paragraphes: [
        'Le cerveau adulte n’est pas figé. L’apprentissage modifie la force des synapses, et un usage intensif remodèle les cartes corticales : l’étude des chauffeurs de taxi londoniens, en 2000, a montré un hippocampe postérieur plus volumineux chez eux que dans la population générale, et d’autant plus que l’ancienneté était grande. Les musiciens présentent des différences comparables sur les régions motrices et auditives.',
        'Cette plasticité connaît des fenêtres. Certaines fonctions — la vision binoculaire, les phonèmes d’une langue — se câblent dans des périodes critiques de l’enfance, après lesquelles la récupération est partielle. D’autres restent modifiables toute la vie, ce qui fonde la rééducation après un accident vasculaire cérébral.',
        'Le mécanisme central le mieux établi est l’apprentissage par renforcement : les neurones dopaminergiques du mésencéphale signalent non pas la récompense elle-même, mais l’écart entre la récompense obtenue et celle qui était attendue. Ce signal d’erreur de prédiction a été identifié dans les années 1990 par Wolfram Schultz et ses collègues, et il se trouve qu’il correspond très précisément à un algorithme d’apprentissage automatique développé indépendamment en informatique — l’une des convergences les plus remarquables entre les deux disciplines.',
      ],
    },
    {
      titre: 'Ce qu’il faut cesser de répéter',
      paragraphes: [
        'On n’utilise pas 10 % de son cerveau : l’imagerie montre une activité dans l’ensemble des régions, et une région durablement inactive s’atrophie. Il n’existe pas de personnes « cerveau gauche » et « cerveau droit » : la spécialisation hémisphérique est réelle pour certaines fonctions, mais les deux hémisphères travaillent ensemble en permanence et aucune étude ne soutient des profils de personnalité fondés là-dessus.',
        'Les « styles d’apprentissage » — visuel, auditif, kinesthésique — n’ont pas résisté aux tests : adapter l’enseignement au style déclaré d’un élève n’améliore pas ses résultats. Les tests de latéralité cérébrale vendus comme outils d’orientation n’ont aucune validité établie. Et les images de cerveaux colorés servent régulièrement à donner une apparence de rigueur à des conclusions que les données ne soutiennent pas.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le champ est celui où le décalage entre ce qui est établi et ce qui est vendu est le plus grand. Savoir ce que mesure réellement une IRM fonctionnelle, et ce qu’une corrélation autorise à conclure, est une compétence directement défensive face au marché de la « neuro-optimisation ».',
        'Parce que les résultats solides ont des applications immédiates : l’apprentissage se consolide par la répétition espacée et par le sommeil plutôt que par la durée d’exposition ; l’attention ne se partage pas entre deux tâches exigeantes ; et la plasticité signifie que presque toutes les compétences restent acquérables, plus lentement, à tout âge.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_evolution: [
    {
      titre: 'Un mécanisme en trois conditions',
      paragraphes: [
        'La sélection naturelle n’est pas une hypothèse compliquée. Elle découle logiquement de trois faits observables. Premièrement, les individus d’une espèce ne sont pas identiques. Deuxièmement, une partie de ces différences est héritée. Troisièmement, ils ne laissent pas tous le même nombre de descendants. Si ces trois conditions sont réunies, la composition de la population change nécessairement au fil des générations, sans qu’aucune intention n’intervienne.',
        'Charles Darwin publie "De l’origine des espèces" le 24 novembre 1859, après vingt ans d’accumulation de preuves. Il se hâte parce qu’Alfred Russel Wallace lui a envoyé en 1858, depuis l’Indonésie, un manuscrit exposant la même idée — les deux hommes présentent d’abord leurs travaux conjointement. Ce que Darwin ne pouvait pas expliquer, c’était le mécanisme de l’hérédité : les travaux de Mendel, publiés en 1866, sont restés ignorés jusqu’en 1900.',
      ],
    },
    {
      titre: 'La synthèse, et ce qu’elle a ajouté',
      paragraphes: [
        'Entre les années 1920 et 1940, la génétique des populations réconcilie l’hérédité mendélienne, discontinue, avec la variation continue observée dans la nature. Fisher, Haldane et Wright en écrivent les mathématiques ; Dobzhansky et Mayr y ajoutent la spéciation et la génétique des populations naturelles. C’est cette « synthèse moderne » qui fait de l’évolution une théorie quantitative et prédictive.',
        'La structure de l’ADN, élucidée en 1953, fournit le support matériel manquant. La théorie neutraliste de Motoo Kimura, en 1968, montre qu’une grande partie des changements moléculaires ne sont ni avantageux ni nuisibles et se fixent par simple dérive aléatoire : la sélection n’est pas le seul moteur, et ce point est souvent omis dans les vulgarisations.',
      ],
    },
    {
      titre: 'Les preuves, et pourquoi elles convergent',
      paragraphes: [
        'Les fossiles fournissent des formes intermédiaires prédites avant d’être trouvées. Le cas de Tiktaalik, découvert en 2004 dans l’Arctique canadien, est exemplaire : les chercheurs avaient cherché dans des couches d’un âge précis, choisi parce que la théorie plaçait là la transition entre poissons et tétrapodes. L’animal a des branchies, des écailles, un cou mobile et des os de membres antérieurs.',
        'L’anatomie comparée montre des homologies inexplicables autrement : le même plan osseux — humérus, radius, cubitus, carpe — dans une main humaine, une nageoire de baleine, une aile de chauve-souris. Un ingénieur repartant de zéro ne produirait pas cela ; un processus qui bricole à partir de l’existant, oui.',
        'La biologie moléculaire apporte la preuve la plus indépendante. Le code génétique est presque universel, les arbres construits à partir de séquences d’ADN recoupent ceux établis par l’anatomie et par les fossiles, et l’on retrouve dans les génomes des gènes désactivés dont la présence n’a de sens que par l’ascendance — comme les gènes de synthèse de la vitamine C, rendus inopérants chez les primates.',
        'Enfin, on observe l’évolution en temps réel. Peter et Rosemary Grant ont documenté pendant quarante ans les variations de la taille des becs de pinsons des Galápagos en réponse aux sécheresses. L’expérience de Richard Lenski, lancée en 1988 et poursuivie sur plus de soixante-quinze mille générations de bactéries, a vu apparaître de nouvelles capacités métaboliques. La résistance aux antibiotiques et l’adaptation des virus grippaux sont des cas d’évolution qui se mesurent en mois.',
      ],
    },
    {
      titre: 'L’espèce humaine dans cet arbre',
      paragraphes: [
        'La lignée humaine et celle des chimpanzés divergent il y a environ six à sept millions d’années. La découverte du squelette surnommé Lucy, en Éthiopie en 1974, daté d’environ 3,2 millions d’années, a montré que la bipédie précède largement l’augmentation du volume cérébral. "Homo sapiens" apparaît en Afrique il y a environ 300 000 ans, et les sorties du continent qui ont peuplé le reste du monde datent pour l’essentiel de 60 000 à 70 000 ans.',
        'La paléogénétique a bouleversé ce tableau. Le séquençage du génome de Néandertal, publié en 2010 par l’équipe de Svante Pääbo — prix Nobel de médecine 2022 —, a montré que les populations non africaines actuelles portent environ 1 à 2 % d’ADN néandertalien. Il y a donc eu métissage, et non simple remplacement. D’autres populations, comme les Denisoviens, ont laissé des traces comparables en Asie et en Océanie.',
      ],
    },
    {
      titre: 'Les malentendus tenaces',
      paragraphes: [
        '« Ce n’est qu’une théorie » confond deux sens du mot. En science, une théorie n’est pas une conjecture mais un cadre explicatif intégrant des faits établis et produisant des prédictions vérifiables — au même titre que la théorie atomique ou celle de la gravitation.',
        'L’évolution n’est pas une échelle et n’a pas de but. Il n’y a pas d’espèce « plus évoluée » : une bactérie et un être humain ont derrière eux la même durée d’évolution. Et le processus ne produit pas l’optimal mais le viable : le nerf laryngé récurrent de la girafe descend jusqu’au thorax avant de remonter au larynx, sur plusieurs mètres, parce que l’héritage embryonnaire l’exige.',
        'Enfin, l’évolution décrit ce qui est, pas ce qui doit être. Tirer d’un mécanisme biologique une prescription morale — le « darwinisme social » — est une erreur de raisonnement identifiée depuis longtemps, et l’histoire du XXᵉ siècle a montré ce qu’elle coûte.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la médecine en dépend en pratique quotidienne. La résistance aux antibiotiques est de l’évolution en action, et la comprendre dicte des règles concrètes : ne pas interrompre un traitement, ne pas en prescrire sans nécessité. Le choix annuel des souches vaccinales contre la grippe, le suivi des variants d’un virus par phylogénie, et la compréhension du cancer comme population de cellules en compétition reposent tous sur ce cadre.',
        'Parce que c’est aussi le meilleur exemple pédagogique d’explication d’un ordre complexe sans recours à une intention. Comprendre comment un processus aveugle, cumulatif et sélectif produit des structures fonctionnelles est un outil de pensée qui dépasse la biologie : on le retrouve en économie, en linguistique, en informatique et dans l’étude des cultures.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_sommeil: [
    {
      titre: 'Un état actif, et non une mise en veille',
      paragraphes: [
        'On a longtemps pris le sommeil pour une simple suspension de l’activité. L’électroencéphalographie a montré l’inverse : le cerveau endormi est intensément actif, selon des régimes distincts qui se succèdent dans un ordre précis. Le sommeil n’est pas l’absence de veille, c’est un autre mode de fonctionnement, aussi structuré que l’éveil.',
        'On distingue le sommeil lent, découpé en stades de profondeur croissante, et le sommeil paradoxal, où l’activité corticale ressemble à celle de l’éveil tandis que les muscles sont paralysés et que les yeux bougent rapidement. C’est le stade où les rêves narratifs sont les plus fréquents.',
      ],
    },
    {
      titre: 'L’architecture d’une nuit',
      paragraphes: [
        'Les cycles durent environ quatre-vingt-dix minutes et se répètent quatre à six fois par nuit. Leur composition change au fil de la nuit, et ce point est le plus utile à connaître : le sommeil lent profond domine les premiers cycles, le sommeil paradoxal les derniers, en seconde moitié de nuit.',
        'La conséquence pratique est directe. Se coucher tard en se levant à l’heure habituelle sacrifie surtout le sommeil paradoxal ; se lever très tôt après un coucher normal sacrifie surtout la fin de nuit. Ces deux privations n’ont pas les mêmes effets, car les deux stades ne font pas le même travail — le sommeil lent profond est associé à la consolidation des souvenirs factuels et à la récupération physique, le paradoxal à l’intégration émotionnelle et à la consolidation procédurale.',
      ],
    },
    {
      titre: 'Deux horloges, dont une seule se voit',
      paragraphes: [
        'Le modèle dominant, proposé par Alexander Borbély en 1982, décrit la somnolence comme la résultante de deux processus indépendants. Le premier est homéostatique : l’adénosine, produit du métabolisme cellulaire, s’accumule dans le cerveau pendant l’éveil et crée une pression de sommeil croissante. La caféine agit en bloquant ses récepteurs — elle masque la dette sans la rembourser, et sa demi-vie d’environ cinq heures explique pourquoi un café de milieu d’après-midi pèse encore au coucher.',
        'Le second est circadien : une horloge interne d’une période légèrement supérieure à vingt-quatre heures, logée dans le noyau suprachiasmatique de l’hypothalamus, et remise à l’heure chaque jour par la lumière. Des cellules spécialisées de la rétine, distinctes de celles de la vision, signalent la luminosité ambiante et commandent la sécrétion de mélatonine.',
        'La lumière du matin avance l’horloge, celle du soir la retarde. C’est le levier le plus efficace pour agir sur son sommeil, et il est asymétrique : une exposition matinale à la lumière naturelle — qui vaut plusieurs milliers de lux contre quelques centaines pour un éclairage intérieur — a plus d’effet que n’importe quelle restriction d’écran le soir. L’effet de la lumière bleue des écrans existe mais reste modeste comparé à celui du contenu consulté et de l’heure du coucher.',
      ],
    },
    {
      titre: 'À quoi sert le sommeil',
      paragraphes: [
        'La consolidation mnésique est la fonction la mieux établie. Pendant le sommeil lent, l’hippocampe rejoue les séquences d’activité enregistrées dans la journée, et ces rejouements accompagnent le transfert progressif des souvenirs vers le cortex. Une nuit de sommeil après un apprentissage améliore mesurablement la rétention par rapport à un temps équivalent d’éveil.',
        'Une seconde fonction, mise en évidence à partir de 2013 par l’équipe de Maiken Nedergaard, est le nettoyage : la circulation du liquide céphalorachidien dans les espaces périvasculaires augmente fortement pendant le sommeil et évacue des déchets métaboliques, dont des protéines impliquées dans les maladies neurodégénératives. Le mécanisme est encore discuté dans ses détails chez l’humain, mais la direction du résultat est robuste.',
        'S’y ajoutent la régulation métabolique et immunitaire. Une restriction de sommeil à quatre ou cinq heures pendant quelques nuits dégrade la tolérance au glucose, augmente l’appétit par modification de la leptine et de la ghréline, et réduit la réponse en anticorps à une vaccination.',
      ],
    },
    {
      titre: 'Les conséquences de la privation, et les remèdes qui marchent',
      paragraphes: [
        'La performance cognitive se dégrade de manière régulière et, surtout, l’auto-évaluation ne suit pas : après plusieurs nuits courtes, les gens continuent de se juger normalement performants alors que leurs temps de réaction se sont allongés. C’est cette dissociation qui rend la privation dangereuse, notamment au volant. Le travail de nuit posté a été classé par le Centre international de recherche sur le cancer comme probablement cancérogène.',
        'Le besoin moyen de l’adulte se situe entre sept et neuf heures. Les « petits dormeurs » constitutionnels existent mais sont rares et portent des variants génétiques identifiés ; statistiquement, quelqu’un qui se croit dans ce cas est presque toujours en dette chronique. L’adolescence décale physiologiquement l’horloge de une à trois heures vers le soir, ce qui a conduit plusieurs systèmes scolaires à retarder l’heure de début des cours, avec des résultats mesurables sur l’assiduité et les notes.',
        'Pour l’insomnie chronique, le traitement de première intention recommandé par les sociétés savantes n’est pas médicamenteux : c’est la thérapie cognitivo-comportementale de l’insomnie, dont l’efficacité à long terme est supérieure à celle des hypnotiques, lesquels perdent leur effet et créent une dépendance. L’alcool, souvent utilisé comme aide à l’endormissement, accélère effectivement celui-ci mais supprime le sommeil paradoxal et fragmente la seconde moitié de nuit.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est le levier de performance cognitive le plus puissant et le moins coûteux qui existe. Aucun complément, aucune technique d’étude, aucune application ne produit sur la mémoire, l’attention et l’humeur un effet comparable à celui d’une heure de sommeil supplémentaire chez quelqu’un qui est en dette.',
        'Parce que les mécanismes sont suffisamment bien compris pour donner des règles d’action non négociables et peu nombreuses : une heure de lever régulière, de la lumière le matin, pas de caféine après le début d’après-midi, et une durée suffisante plutôt qu’un horaire de coucher « optimal ». Le reste relève largement du marketing.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  sci_conquete_spatiale: [
    {
      titre: 'La contrainte que rien ne contourne',
      paragraphes: [
        'Konstantin Tsiolkovski établit en 1903 l’équation qui gouverne tout vol spatial : la vitesse qu’une fusée peut atteindre dépend du logarithme du rapport entre sa masse au départ et sa masse à vide. Le logarithme est la mauvaise nouvelle — pour aller un peu plus vite, il faut beaucoup plus d’ergols. Mettre un kilogramme en orbite exige d’en brûler plusieurs dizaines.',
        'C’est cette équation qui explique la forme des lanceurs, l’étagement, et le fait qu’une fusée soit à plus de 90 % de sa masse composée de carburant et de comburant. Elle explique aussi pourquoi atteindre l’orbite basse — environ 7,8 kilomètres par seconde — est bien plus difficile que monter à 100 kilomètres d’altitude : la difficulté est la vitesse horizontale, pas la hauteur.',
      ],
    },
    {
      titre: 'La course, 1957-1972',
      paragraphes: [
        'Le 4 octobre 1957, l’URSS place en orbite Spoutnik 1, sphère de 83 kilogrammes émettant un signal audible par n’importe quel radioamateur. Le choc aux États-Unis est immense et débouche sur la création de la NASA en 1958. Le 12 avril 1961, Youri Gagarine effectue le premier vol humain. Le 25 mai 1961, Kennedy fixe au Congrès l’objectif d’un homme sur la Lune avant la fin de la décennie.',
        'Le programme Apollo mobilise jusqu’à 400 000 personnes et atteint en 1966 environ 4,4 % du budget fédéral américain — pour référence, la NASA en représente aujourd’hui environ 0,4 %. Le coût humain est réel : l’incendie d’Apollo 1 tue trois astronautes au sol en janvier 1967, et le programme soviétique perd Vladimir Komarov la même année.',
        'Le 20 juillet 1969, Armstrong et Aldrin posent le module lunaire, Collins restant en orbite. Six missions se poseront au total, la dernière en décembre 1972 : douze hommes ont marché sur la Lune, et personne depuis plus de cinquante ans. La raison de l’arrêt est budgétaire et politique — l’objectif était de gagner une course, et la course était gagnée.',
      ],
    },
    {
      titre: 'La longue période des orbites basses',
      paragraphes: [
        'Après Apollo, l’effort se déplace vers le vol habité permanent en orbite. Les Soviétiques enchaînent les stations Saliout puis Mir ; les États-Unis misent sur la navette spatiale, en service de 1981 à 2011. La navette était techniquement remarquable et économiquement décevante : conçue pour rendre l’accès à l’espace routinier et peu coûteux, elle a coûté plusieurs dizaines de milliers de dollars par kilogramme mis en orbite. Deux accidents, Challenger en 1986 et Columbia en 2003, ont tué quatorze astronautes.',
        'La Station spatiale internationale, assemblée à partir de 1998, est habitée sans interruption depuis novembre 2000. Elle est le plus grand projet de coopération scientifique internationale jamais mené, et sa continuité pendant des crises diplomatiques majeures en fait aussi un objet politique singulier.',
      ],
    },
    {
      titre: 'La baisse du coût d’accès, fait majeur des vingt dernières années',
      paragraphes: [
        'Le changement décisif est économique. La réutilisation du premier étage, longtemps jugée irréaliste, est devenue routinière : premier atterrissage réussi en décembre 2015, puis des centaines de vols avec des étages réemployés. Le coût par kilogramme en orbite basse a été réduit d’un ordre de grandeur par rapport à l’ère de la navette.',
        'Cette baisse a des effets en cascade. Elle rend possibles les constellations de plusieurs milliers de satellites de télécommunications, qui apportent l’accès à Internet dans des zones sans infrastructure terrestre — enjeu considérable pour les régions isolées. Elle rend aussi possible une accumulation de débris préoccupante : plus de 35 000 objets de plus de dix centimètres sont suivis en orbite, et le risque de collisions en chaîne, décrit par Donald Kessler dès 1978, n’est plus théorique. L’astronomie au sol est par ailleurs affectée par les traînées lumineuses de ces constellations.',
        'Le paysage s’est aussi élargi. La Chine mène des vols habités depuis 2003, a posé un engin sur la face cachée de la Lune en 2019 et exploite sa propre station spatiale depuis 2021-2022. L’Inde a réussi un atterrissage lunaire en août 2023 pour un budget très inférieur à celui des programmes comparables.',
      ],
    },
    {
      titre: 'Mars : ce qui est difficile, précisément',
      paragraphes: [
        'Les obstacles ne sont pas ceux qu’on imagine. Le transit dure de six à neuf mois, et les fenêtres de départ favorables ne se présentent qu’environ tous les vingt-six mois : une mission ne peut pas être interrompue ni écourtée. Il n’y a aucune possibilité de secours.',
        'Le rayonnement est le problème de santé principal : hors de la magnétosphère terrestre, l’équipage reçoit une dose cumulée qui approche ou dépasse les limites professionnelles admises, et le blindage coûte de la masse. La descente est un autre problème dur : l’atmosphère martienne est trop mince pour freiner efficacement un engin lourd, et trop épaisse pour être ignorée. Enfin, le retour suppose soit d’emporter les ergols du voyage de retour, soit de les fabriquer sur place à partir du dioxyde de carbone atmosphérique et de la glace d’eau — technique démontrée à très petite échelle par l’instrument MOXIE de la mission Perseverance en 2021.',
        'Les calendriers annoncés par les acteurs publics et privés ont été repoussés à de nombreuses reprises. Il est raisonnable de considérer un vol habité vers Mars comme un objectif des décennies à venir, sans date crédible aujourd’hui.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que l’espace est devenu une infrastructure ordinaire dont dépendent la navigation, la météorologie, les télécommunications, la surveillance des récoltes et des catastrophes, et la mesure du climat. Les données satellitaires constituent l’une des principales sources d’observation du réchauffement : l’espace sert d’abord à regarder la Terre.',
        'Parce que la bascule d’un modèle entièrement étatique vers un modèle mixte, où des entreprises privées fournissent le transport et où les agences achètent un service, est l’un des changements industriels les plus instructifs des vingt dernières années — y compris pour ses risques, puisqu’une dépendance à un petit nombre d’opérateurs privés pour un accès stratégique pose des questions nouvelles de souveraineté.',
      ],
    },
  ],
};
