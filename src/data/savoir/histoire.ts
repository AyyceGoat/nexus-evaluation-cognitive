import type { ArticlesDuDomaine } from './types';

/**
 * Articles du domaine « Histoire & Géopolitique ».
 *
 * Chargé à la demande, quand un sujet de ce domaine est ouvert. Les cinq
 * domaines sont dans cinq modules séparés pour cette raison : la prose d'un
 * domaine pèse plus que tout le code de l'écran qui l'affiche, et personne ne
 * lit les cinquante sujets d'un coup.
 *
 * Règle de rédaction tenue dans tout le fichier : les dates et les chiffres sont
 * ceux que l'historiographie établit ; quand un chiffre est débattu, la
 * fourchette est donnée comme fourchette, et le débat est nommé plutôt que
 * tranché à la place du lecteur.
 */
export const articlesHistoire: ArticlesDuDomaine = {
  /* ═════════════════════════════════════════════════════════════════════ */
  hist_chute_rome: [
    {
      titre: 'Ce que « la chute » désigne, et ce qu’elle ne désigne pas',
      paragraphes: [
        'On parle couramment de la chute de l’Empire romain en 476, comme d’un évènement unique et daté. La réalité est plus embarrassante : ce qui disparaît cette année-là, c’est la fonction d’empereur d’Occident, et elle disparaît sans bataille. L’Empire romain d’Orient, lui, continue depuis Constantinople pendant près de mille ans encore, jusqu’en 1453. Pendant tout ce temps, ses habitants ne s’appellent pas « Byzantins » — ce mot est une invention d’érudits du XVIᵉ siècle — mais Romains.',
        'La formule « déclin et chute » vient de Edward Gibbon, qui publie entre 1776 et 1789 son "History of the Decline and Fall of the Roman Empire". Elle a imposé une image : celle d’un organisme malade qui s’affaiblit puis s’écroule. L’historiographie du dernier demi-siècle a largement défait cette image, sans pour autant s’accorder sur ce qu’il faut mettre à la place. C’est l’un des débats les plus vifs de l’histoire ancienne, et il est utile de savoir qu’il est ouvert avant d’en lire les termes.',
      ],
    },
    {
      titre: 'La crise du IIIᵉ siècle : la vraie rupture',
      paragraphes: [
        'Entre 235 et 284, l’Empire traverse un demi-siècle de convulsions qu’on appelle la crise du IIIᵉ siècle. Une vingtaine d’empereurs se succèdent, presque tous assassinés ou tués au combat. Les frontières sont percées sur le Rhin, le Danube et en Orient, où la Perse sassanide, puissance neuve et structurée, capture même l’empereur Valérien en 260. L’Empire se fragmente un temps en trois : un Empire des Gaules, le royaume de Palmyre en Orient, et le centre resté à Rome.',
        'À cela s’ajoute une crise monétaire lourde de conséquences. Le denier, puis l’antoninien, sont progressivement dépréciés : la part d’argent fin y tombe de près de 100 % au Iᵉʳ siècle à quelques pour cent au milieu du IIIᵉ. Les prix s’envolent, la fiscalité se rigidifie, l’économie se rétracte vers l’échange local. En 301, Dioclétien tente un blocage général des prix par son Édit sur les prix maximaux : il échoue, comme échouent presque toujours les blocages de prix.',
        'L’Empire sort pourtant de cette crise. Dioclétien (284-305) le réorganise en profondeur : partage du pouvoir entre plusieurs empereurs, doublement du nombre de provinces, armée et fiscalité refondues. Constantin poursuit, autorise le christianisme par l’édit de Milan en 313, et fonde en 330 sur le Bosphore une nouvelle capitale, Constantinople. L’Empire de 350 est debout — mais c’est un autre Empire, plus lourd, plus fiscal, et dont le centre de gravité a glissé vers l’Orient.',
      ],
    },
    {
      titre: '395 : deux moitiés, deux destins',
      paragraphes: [
        'À la mort de Théodose Iᵉʳ en 395, l’Empire est partagé entre ses deux fils : Arcadius en Orient, Honorius en Occident. Le partage n’est pas pensé comme une rupture — l’Empire avait déjà été gouverné à plusieurs — mais il ne sera jamais défait. Or les deux moitiés ne sont pas comparables. L’Orient est plus peuplé, plus urbanisé, plus riche en recettes fiscales, et sa capitale est une forteresse presque imprenable. L’Occident est plus rural, plus exposé sur ses frontières, et ses provinces les plus productives — l’Afrique du Nord, l’Espagne, la Gaule — sont précisément celles qui vont lui échapper.',
        'Cette asymétrie explique une grande part de la suite. Quand l’Occident perd l’Afrique du Nord en 439, il perd le grenier à blé de Rome et une base fiscale majeure ; il ne peut plus payer son armée, qui est devenue en bonne partie une armée de fédérés recrutés parmi les peuples installés dans l’Empire. L’Orient, lui, garde l’Égypte, la Syrie et l’Anatolie, et traverse le Vᵉ siècle sans perdre sa structure d’État.',
      ],
    },
    {
      titre: 'Les peuples en mouvement, de 376 à 410',
      paragraphes: [
        'En 376, des groupes goths poussés par l’avancée des Huns demandent à franchir le Danube. Rome accepte, puis gère l’installation de manière désastreuse : famine, abus, révolte. En 378, à Andrinople, l’armée romaine d’Orient est écrasée et l’empereur Valens tué sur le champ de bataille. C’est le premier désastre militaire irréparable depuis des siècles, et il installe durablement des groupes armés autonomes à l’intérieur des frontières.',
        'Le 24 août 410, les Goths d’Alaric entrent dans Rome et la pillent pendant trois jours. La ville n’était plus la capitale politique — la cour siégeait à Ravenne — mais le choc symbolique est immense dans tout le monde méditerranéen ; c’est en réponse à ce choc que saint Augustin entreprend "La Cité de Dieu". Suivent l’installation des Vandales en Afrique du Nord (prise de Carthage en 439), le sac de Rome par ces mêmes Vandales en 455, et la campagne d’Attila arrêtée en 451 aux Champs Catalauniques par une coalition romano-gothique.',
      ],
    },
    {
      titre: '476 : une date de convention',
      paragraphes: [
        'Le 4 septembre 476, le chef militaire Odoacre dépose le jeune empereur Romulus Augustule. Le geste décisif est ce qui suit : Odoacre n’intronise pas de successeur et renvoie les insignes impériaux à l’empereur d’Orient Zénon, en se faisant reconnaître comme patrice gouvernant l’Italie au nom de l’Empire. Autrement dit, personne n’annonce la fin de l’Empire romain ; on cesse simplement de nommer un empereur en Occident.',
        'La date est d’ailleurs contestable à plusieurs titres. Julius Nepos, déposé en 475 mais réfugié en Dalmatie, est encore reconnu par l’Orient comme empereur légitime jusqu’à son assassinat en 480. Et la vie institutionnelle romaine — le Sénat, le droit, l’administration fiscale, le latin — se poursuit en Italie sous Odoacre puis sous le roi ostrogoth Théodoric, qui gouverne de Ravenne de 493 à 526 en se présentant comme le continuateur de l’ordre romain.',
      ],
    },
    {
      titre: 'Les causes : quatre lectures qui s’affrontent',
      paragraphes: [
        'La première lecture est militaire et extérieure : l’Empire d’Occident tombe parce qu’il est submergé. C’est la thèse défendue notamment par Peter Heather, qui insiste sur la pression nouvelle exercée par les Huns et sur l’incapacité fiscale de l’Occident à financer la riposte.',
        'La deuxième est interne et graduelle : il n’y a pas d’invasion mais une « accommodation », une lente intégration des élites militaires étrangères dans l’appareil romain, jusqu’à ce que la distinction entre Romains et non-Romains cesse d’avoir un sens politique. Walter Goffart en est l’un des principaux défenseurs.',
        'La troisième porte sur ce qui a effectivement disparu. Bryan Ward-Perkins, dans "The Fall of Rome and the End of Civilization" (2005), oppose à la vision d’une simple « transformation » les données archéologiques : effondrement de la production de poteries standardisées, disparition des toitures de tuiles, rétrécissement des échanges à longue distance, chute des niveaux d’alphabétisation. Son argument est concret : au Vᵉ siècle, le niveau de vie matériel baisse réellement, et pour beaucoup de gens.',
        'La quatrième est environnementale et sanitaire. Kyle Harper, dans "The Fate of Rome" (2017), replace l’histoire romaine dans celle du climat et des épidémies : optimum climatique romain, puis refroidissement ; peste antonine (165-180), peste de Cyprien (249-262), et plus tard la peste justinienne à partir de 541, qui frappe l’Orient. Ces lectures ne s’excluent pas : la plus solide est probablement celle qui les combine.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que cet épisode est le cas d’école de toutes les discussions sur l’effondrement des systèmes complexes : un ensemble qui paraît invincible, qui ne tombe pas d’un coup, et dont la fin est surtout visible après coup. Les mêmes questions se reposent aujourd’hui à propos d’autres ordres — la dépendance à des chaînes d’approvisionnement lointaines, le coût fiscal de la sécurité, la capacité d’un État à lever l’impôt.',
        'Parce que c’est aussi un cas d’école de fabrication du récit historique. « 476 » est une date de manuel, choisie tardivement, qui ne correspond à aucune expérience vécue par les contemporains. Savoir repérer ce genre de raccourci — une date nette posée sur un processus long — est directement utile pour lire l’actualité.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_guerre_froide: [
    {
      titre: 'Une guerre qui n’a jamais eu lieu, et qui a tout structuré',
      paragraphes: [
        'La guerre froide désigne l’affrontement entre les États-Unis et l’Union soviétique, et entre les blocs qu’ils organisent, de la fin de la Seconde Guerre mondiale à la disparition de l’URSS en décembre 1991. Sa particularité est dans son nom : les deux protagonistes ne se sont jamais affrontés directement en bataille rangée. Le conflit s’est mené par la dissuasion nucléaire, par l’économie, par le renseignement, par la propagande, et par des guerres réelles et meurtrières menées par d’autres — Corée, Vietnam, Afghanistan, Angola, Amérique centrale.',
        'L’expression est popularisée en 1945-1947, notamment par George Orwell puis par le journaliste Walter Lippmann. Le terme est trompeur pour une raison qu’il faut garder en tête : « froide » vaut pour l’Europe et l’Amérique du Nord. Pour la Corée, le Vietnam ou l’Angola, elle fut parfaitement chaude, et le bilan humain de ses guerres périphériques se compte en millions de morts.',
      ],
    },
    {
      titre: 'La rupture, 1945-1949',
      paragraphes: [
        'Les conférences de Yalta (février 1945) et de Potsdam (juillet-août 1945) organisent la victoire commune et laissent en suspens l’essentiel : le sort de l’Europe centrale et de l’Allemagne. Sur le terrain, les armées soviétiques occupent la moitié orientale du continent et y installent des régimes communistes entre 1945 et 1948. Le 5 mars 1946, à Fulton (Missouri), Churchill parle d’un « rideau de fer » tombé de Stettin à Trieste.',
        'Deux textes fixent la doctrine américaine. Le « long télégramme » de George Kennan, envoyé de Moscou en février 1946, puis son article anonyme de juillet 1947 dans "Foreign Affairs", formulent la stratégie du "containment" : contenir l’expansion soviétique sans chercher à renverser le régime. Le 12 mars 1947, le président Truman en tire la doctrine qui porte son nom. Le 5 juin 1947, le secrétaire d’État Marshall annonce à Harvard le programme d’aide à la reconstruction européenne. L’URSS le refuse et l’interdit à ses satellites.',
        'La crise de Berlin tranche. Le 24 juin 1948, l’URSS coupe les accès terrestres aux secteurs occidentaux de la ville ; les Occidentaux répondent par un pont aérien qui ravitaille deux millions de personnes pendant onze mois, jusqu’à la levée du blocus le 12 mai 1949. Le 4 avril 1949, l’OTAN est créée ; l’Allemagne est scindée en deux États la même année. En réponse au réarmement de la RFA, le pacte de Varsovie est signé le 14 mai 1955.',
      ],
    },
    {
      titre: 'L’équilibre de la terreur',
      paragraphes: [
        'Le 29 août 1949, l’URSS fait exploser sa première bombe atomique, quatre ans seulement après les États-Unis — délai considérablement raccourci par l’espionnage du projet Manhattan. La bombe H suit de part et d’autre au début des années 1950. À partir de là, la logique change : la puissance ne sert plus à vaincre mais à empêcher. C’est la « destruction mutuelle assurée », dont la conséquence paradoxale est que les deux camps ont un intérêt commun à la stabilité.',
        'Cette stabilité a failli céder plusieurs fois. En octobre 1962, la découverte de missiles soviétiques à Cuba ouvre treize jours pendant lesquels une guerre nucléaire a été une possibilité sérieuse ; la crise se dénoue par un compromis partiellement secret — retrait des missiles de Cuba contre engagement américain de non-invasion et retrait discret des missiles Jupiter de Turquie. En novembre 1983, l’exercice OTAN "Able Archer 83" est interprété à Moscou comme la couverture possible d’une attaque réelle. Le monde a tenu, mais pas par construction.',
      ],
    },
    {
      titre: 'Les grandes dates, dans l’ordre',
      paragraphes: [
        '1950-1953 : guerre de Corée. 1953 : mort de Staline. 1956 : l’insurrection de Budapest est écrasée, et la crise de Suez révèle que Londres et Paris ne peuvent plus agir sans Washington. 4 octobre 1957 : Spoutnik, et la peur américaine du retard technologique. 13 août 1961 : construction du mur de Berlin. Octobre 1962 : crise de Cuba.',
        '1963-1975, la détente : téléphone rouge et traité d’interdiction partielle des essais en 1963, traité de non-prolifération en 1968, accords SALT I en 1972, acte final d’Helsinki en 1975 — ce dernier reconnaissant les frontières européennes en échange d’engagements sur les droits humains dont les dissidents de l’Est se serviront ensuite comme d’un levier.',
        '1979-1985, la reprise des tensions : invasion soviétique de l’Afghanistan en décembre 1979, crise des euromissiles, initiative de défense stratégique annoncée par Reagan en mars 1983, destruction du vol KAL 007 en septembre 1983.',
      ],
    },
    {
      titre: 'La sortie, 1985-1991',
      paragraphes: [
        'Mikhaïl Gorbatchev arrive au pouvoir en mars 1985 avec le constat que l’URSS ne peut plus soutenir simultanément la course aux armements, la guerre d’Afghanistan et le niveau de vie de sa population — d’autant que l’effondrement du prix du pétrole en 1986 ampute ses recettes en devises. Il lance la "glasnost" (transparence) et la "perestroïka" (restructuration), et cherche un désarmement négocié. Le sommet de Reykjavik en octobre 1986 échoue de peu ; le traité FNI, signé en décembre 1987, élimine pour la première fois une catégorie entière de missiles.',
        'Le tournant est que Gorbatchev renonce à employer la force pour maintenir les régimes d’Europe de l’Est. En 1989, ceux-ci tombent en quelques mois : élections en Pologne en juin, ouverture du rideau de fer hongrois en été, chute du mur de Berlin le 9 novembre, révolutions en Tchécoslovaquie et en Roumanie en décembre. Au sommet de Malte, début décembre 1989, Bush et Gorbatchev constatent ensemble la fin de l’affrontement.',
        'L’URSS elle-même se défait deux ans plus tard : échec du putsch d’août 1991, accords de Belovej le 8 décembre, démission de Gorbatchev le 25 décembre, disparition formelle de l’Union le 26 décembre 1991.',
      ],
    },
    {
      titre: 'Ce que la guerre froide a laissé',
      paragraphes: [
        'Des institutions, d’abord : l’OTAN, l’ONU telle qu’elle fonctionne réellement avec son Conseil de sécurité paralysé par les vetos, les organisations de Bretton Woods, la construction européenne née en partie de la nécessité d’ancrer l’Allemagne de l’Ouest. Des technologies ensuite, presque toutes issues d’efforts militaires ou spatiaux : l’aviation civile à réaction, le nucléaire électrique, le GPS, l’ancêtre d’Internet.',
        'Et une géographie politique dont nous n’avons pas fini de sortir. Les frontières coréennes, la question de Taïwan, la carte de l’Europe orientale, la présence militaire américaine en Allemagne, au Japon et en Corée du Sud : tout cela date de là. Les débats actuels sur l’élargissement de l’OTAN, sur la dissuasion nucléaire ou sur les zones d’influence reprennent, souvent mot pour mot, des raisonnements formulés entre 1946 et 1950.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la guerre froide est le laboratoire de la stratégie contemporaine. Les notions de dissuasion, d’escalade, de signal, de « ligne rouge », de guerre par procuration, y ont été forgées et testées. Les lire correctement permet d’éviter deux erreurs symétriques dans l’analyse des crises actuelles : croire que toute tension annonce la guerre, ou croire qu’aucune ne peut y mener.',
        'Parce qu’elle montre aussi qu’un ordre international qui paraissait immuable à ceux qui y vivaient s’est défait en trois ans, et que presque personne ne l’avait prévu. C’est un bon antidote au fatalisme comme à la certitude.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_guerre_coree: [
    {
      titre: 'Une division née d’une décision improvisée',
      paragraphes: [
        'La Corée est une colonie japonaise depuis 1910. En août 1945, la capitulation du Japon prend de vitesse les Alliés : il faut décider en quelques jours qui désarmera les troupes japonaises sur la péninsule. Deux officiers américains tracent une ligne sur une carte au 38ᵉ parallèle, choisie pour laisser Séoul au sud ; Moscou accepte. Aucune population n’est consultée, et cette ligne ne correspond à aucune frontière historique.',
        'Les deux zones d’occupation deviennent deux États en 1948 : la République de Corée au sud le 15 août, avec Syngman Rhee, et la République populaire démocratique de Corée au nord le 9 septembre, avec Kim Il-sung. Chacun des deux régimes se proclame le gouvernement légitime de la Corée entière, et chacun réprime durement son opposition intérieure. Les troupes d’occupation soviétiques puis américaines se retirent en 1948-1949.',
      ],
    },
    {
      titre: 'L’invasion du 25 juin 1950',
      paragraphes: [
        'Le 25 juin 1950, l’armée nord-coréenne franchit le 38ᵉ parallèle avec une supériorité écrasante en blindés et en artillerie. Kim Il-sung avait obtenu l’accord de Staline, longtemps réticent, et celui de Mao. Séoul tombe en trois jours. En six semaines, les forces sud-coréennes et américaines sont réduites à un réduit défensif autour de Pusan, à l’extrême sud-est.',
        'La réaction internationale est immédiate et, rétrospectivement, invraisemblable : le Conseil de sécurité de l’ONU autorise une intervention armée, parce que l’URSS boycottait alors ses séances pour protester contre le refus d’y admettre la Chine populaire. C’est la seule fois où l’ONU a mené une guerre sous son propre drapeau contre un État agresseur, avec des contingents de seize pays sous commandement américain.',
      ],
    },
    {
      titre: 'Quatre renversements en un an',
      paragraphes: [
        'Le 15 septembre 1950, MacArthur lance un débarquement amphibie à Incheon, loin sur les arrières nord-coréens. L’opération est risquée — marées de plusieurs mètres, chenal étroit — et réussit complètement : l’armée du Nord s’effondre, Séoul est reprise fin septembre.',
        'La décision suivante change la guerre. Au lieu de s’arrêter au 38ᵉ parallèle, les forces de l’ONU le franchissent en octobre et remontent vers la frontière chinoise du Yalou. Pékin avait averti qu’il n’accepterait pas une armée américaine à sa frontière. Fin octobre, plus de 200 000 « volontaires du peuple » chinois, sous Peng Dehuai, entrent en Corée et infligent aux forces de l’ONU une retraite brutale, dont le combat du réservoir de Chosin en novembre-décembre 1950, mené par -30 °C, reste l’épisode le plus dur.',
        'Séoul est reprise par le Nord en janvier 1951, puis reperdue en mars. Le front se stabilise à peu près sur la ligne de départ. MacArthur, qui réclame publiquement l’extension de la guerre à la Chine et l’emploi éventuel de l’arme nucléaire, est relevé de son commandement par Truman le 11 avril 1951 — affirmation, restée célèbre, de l’autorité civile sur le commandement militaire.',
      ],
    },
    {
      titre: 'Deux ans de guerre de position, et un armistice sans paix',
      paragraphes: [
        'De l’été 1951 à juillet 1953, le conflit devient une guerre de tranchées et de collines, doublée d’une campagne aérienne massive : les bombardements américains détruisent la quasi-totalité des villes nord-coréennes. Les négociations, entamées en juillet 1951, achoppent pendant deux ans sur le sort des prisonniers de guerre refusant le rapatriement.',
        'L’armistice est signé le 27 juillet 1953 à Panmunjom, par le commandement de l’ONU, la Corée du Nord et la Chine. La Corée du Sud ne le signe pas. Il crée une zone démilitarisée de 4 km de large sur 250 km de long, toujours en place. Ce n’est pas un traité de paix : juridiquement, la guerre de Corée n’est pas terminée.',
        'Le bilan humain est écrasant et les estimations varient : environ 3 millions de morts au total, dont une large majorité de civils coréens, auxquels s’ajoutent plusieurs centaines de milliers de soldats chinois et environ 36 500 morts américains. Proportionnellement à sa population, la Corée a perdu davantage que la plupart des belligérants de la Seconde Guerre mondiale.',
      ],
    },
    {
      titre: 'Les conséquences, bien au-delà de la péninsule',
      paragraphes: [
        'La guerre transforme la guerre froide en confrontation militarisée mondiale. Le budget de défense américain est multiplié par plus de trois, conformément à la doctrine du document NSC-68 rédigé quelques mois avant l’invasion ; l’OTAN, jusque-là une alliance sur le papier, se dote d’un commandement intégré et de forces permanentes. Le réarmement de l’Allemagne de l’Ouest, impensable en 1949, est engagé.',
        'En Asie, elle fige des situations qui durent encore : protection américaine de Taïwan par l’interposition de la VIIᵉ flotte, alliance américano-japonaise et relance industrielle du Japon par les commandes de guerre, division coréenne pérennisée. Elle inaugure aussi la pratique des guerres limitées menées sans déclaration de guerre formelle.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la crise nord-coréenne d’aujourd’hui — armes nucléaires, incidents de frontière, absence de traité de paix — est la continuation directe et non résolue de 1950. On ne comprend ni la posture de Pyongyang ni celle de Séoul sans cette généalogie.',
        'Parce qu’elle offre aussi l’un des exemples les plus nets de ce que les stratèges appellent l’escalade par franchissement d’objectif : une opération victorieuse sur un objectif limité est prolongée au-delà, la puissance voisine réagit, et la guerre repart pour deux ans et des centaines de milliers de morts sur la même ligne qu’au départ.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_projet_manhattan: [
    {
      titre: 'Une lettre, une peur, un programme',
      paragraphes: [
        'La fission de l’uranium est mise en évidence fin 1938 par Otto Hahn et Fritz Strassmann, et interprétée par Lise Meitner et Otto Frisch. Le 2 août 1939, une lettre signée par Albert Einstein, rédigée pour l’essentiel par le physicien Leó Szilárd, avertit le président Roosevelt qu’une bombe d’un type nouveau est concevable et que l’Allemagne pourrait s’y employer. La crainte d’une bombe allemande est le moteur initial du projet, et elle n’était pas absurde : l’Allemagne disposait des meilleurs physiciens du monde.',
        'Les premiers travaux américains restent modestes jusqu’à ce que le rapport britannique MAUD, en 1941, conclue qu’une bombe est réalisable en quelques années. Le 2 décembre 1942, sous les gradins d’un stade de l’université de Chicago, la pile de Fermi atteint la première réaction en chaîne contrôlée de l’histoire. Le principe est démontré ; reste un problème industriel d’une ampleur inédite.',
      ],
    },
    {
      titre: 'Une entreprise industrielle déguisée en laboratoire',
      paragraphes: [
        'Le Manhattan Engineer District est créé en août 1942 ; le général Leslie Groves en prend la direction en septembre et recrute Robert Oppenheimer pour diriger le laboratoire d’armes. Trois grands sites sont construits de toutes pièces : Los Alamos au Nouveau-Mexique pour la conception, Oak Ridge dans le Tennessee pour la séparation isotopique de l’uranium, Hanford dans l’État de Washington pour la production de plutonium en réacteur.',
        'Les ordres de grandeur expliquent pourquoi cette histoire est autant celle d’ingénieurs que de physiciens : environ 2 milliards de dollars de 1945 — plusieurs dizaines de milliards actuels — et jusqu’à 125 000 à 130 000 personnes employées simultanément. La quasi-totalité d’entre elles ignoraient ce qu’elles fabriquaient. Enrichir l’uranium 235, présent à 0,7 % dans l’uranium naturel, a exigé de bâtir à Oak Ridge l’usine de diffusion gazeuse K-25, alors le plus grand bâtiment du monde.',
        'Deux voies sont menées en parallèle, faute de savoir laquelle aboutirait. L’uranium 235 permet un dispositif simple à « canon », où deux masses sont projetées l’une contre l’autre. Le plutonium 239, lui, se désassemble trop vite pour ce procédé : il a fallu inventer l’implosion, une compression sphérique par explosifs dont la mise au point fut le problème technique le plus difficile du projet.',
      ],
    },
    {
      titre: 'Trinity, Hiroshima, Nagasaki',
      paragraphes: [
        'Le 16 juillet 1945 à 5 h 29, dans le désert d’Alamogordo, le dispositif à implosion de l’essai Trinity dégage l’équivalent d’environ 21 kilotonnes de TNT. L’Allemagne avait capitulé deux mois plus tôt — la justification initiale du projet avait donc disparu avant qu’il n’aboutisse, ce qui est au cœur des débats moraux ultérieurs.',
        'Le 6 août 1945, la bombe à uranium "Little Boy" est larguée sur Hiroshima ; le 9 août, la bombe à plutonium "Fat Man" sur Nagasaki. Les estimations de victimes, difficiles pour des villes dont l’administration a été détruite avec elles, situent les morts de fin 1945 entre 90 000 et 146 000 à Hiroshima et entre 60 000 et 80 000 à Nagasaki, en comptant les décès par irradiation des semaines suivantes. Le Japon annonce sa capitulation le 15 août.',
        'Le débat sur la nécessité de ces bombardements n’est pas clos. Il porte sur le poids relatif de la bombe et de l’entrée en guerre de l’URSS contre le Japon le 9 août, sur les pertes qu’aurait coûté un débarquement, et sur les alternatives écartées — démonstration sur un site inhabité, avertissement explicite. Plusieurs scientifiques du projet avaient plaidé pour ces alternatives, dans le rapport Franck de juin 1945 et dans une pétition portée par Szilárd.',
      ],
    },
    {
      titre: 'L’après : prolifération, contrôle, remords',
      paragraphes: [
        'Le monopole américain dure quatre ans. L’URSS teste sa première bombe le 29 août 1949, aidée par un espionnage efficace à l’intérieur même de Los Alamos, dont celui du physicien Klaus Fuchs. Suivent le Royaume-Uni (1952), la France (1960), la Chine (1964), puis l’Inde, le Pakistan, Israël de facto, et la Corée du Nord.',
        'Le contrôle s’organise en réaction : loi sur l’énergie atomique et commission civile américaine en 1946, Agence internationale de l’énergie atomique en 1957, traité de non-prolifération en 1968. Le destin personnel d’Oppenheimer résume l’ambivalence de l’époque : devenu opposant à la bombe H, il est privé de son habilitation de sécurité en 1954 au terme d’une procédure dont le caractère inéquitable a été officiellement reconnu par le département de l’Énergie en 2022.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le projet Manhattan crée un modèle qui n’existait pas : la « grande science » financée et dirigée par l’État, associant recherche fondamentale, ingénierie et production de masse sous contrainte de calendrier. C’est ce modèle qu’on retrouve ensuite dans le programme Apollo, dans le séquençage du génome humain, et dans les débats actuels sur le financement public des grands programmes technologiques.',
        'Parce qu’il pose aussi, le premier et de la manière la plus nette, la question de la responsabilité du chercheur devant l’usage de sa découverte. Cette question est aujourd’hui reposée presque terme pour terme à propos de l’intelligence artificielle, et les arguments échangés en 1945 méritent d’être lus dans l’original plutôt que résumés.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_routes_soie: [
    {
      titre: 'Un nom moderne pour un réseau ancien',
      paragraphes: [
        'L’expression « route de la soie » n’a jamais été employée par ceux qui l’empruntaient : elle est forgée en 1877 par le géographe allemand Ferdinand von Richthofen. Elle est doublement trompeuse. Il n’y avait pas une route mais un réseau de pistes, de cols et d’oasis, complété très tôt par des voies maritimes ; et la soie n’était qu’une marchandise parmi beaucoup d’autres, même si elle fut longtemps la plus emblématique.',
        'Presque personne ne faisait le trajet complet. Les marchandises passaient de main en main, d’étape en étape, avec une marge prélevée à chaque relais — ce qui explique qu’à Rome la soie coûtait une fortune tandis qu’elle était un textile courant en Chine. Les véritables professionnels de ce commerce furent longtemps les marchands sogdiens d’Asie centrale, dont la langue servit de langue véhiculaire du négoce.',
      ],
    },
    {
      titre: 'L’ouverture par la Chine des Han',
      paragraphes: [
        'L’impulsion décisive est politique et militaire. Vers 138 avant notre ère, l’empereur Han Wudi envoie l’émissaire Zhang Qian chercher des alliés contre les Xiongnu, confédération nomade qui menaçait la frontière nord. Zhang Qian revient après des années de captivité avec une description des royaumes d’Asie centrale et, surtout, la nouvelle qu’il existe à l’ouest des chevaux bien supérieurs à ceux de Chine.',
        'Ces « chevaux célestes » de la vallée de Ferghana deviennent un objectif d’État : la Chine a besoin de cavalerie pour tenir ses steppes. Les routes s’organisent autour de ce besoin, avec garnisons, relais et prolongement de la Grande Muraille vers l’ouest. Le commerce suit la stratégie, et non l’inverse — un schéma qui se répétera.',
      ],
    },
    {
      titre: 'Ce qui circulait vraiment',
      paragraphes: [
        'Des marchandises : soie, laque et céramiques vers l’ouest ; chevaux, jade, laine, verre romain puis syrien, épices, or et argent vers l’est. Le papier, inventé en Chine, se diffuse vers l’ouest à partir du VIIIᵉ siècle, la tradition situant le transfert du savoir-faire après la bataille de Talas en 751 ; suivront la poudre à canon, la boussole et l’imprimerie.',
        'Des religions et des idées, plus importantes encore. Le bouddhisme gagne la Chine par l’Asie centrale aux premiers siècles de notre ère, et les grottes de Dunhuang en conservent la plus extraordinaire bibliothèque. Le manichéisme, le christianisme nestorien, puis l’islam empruntent les mêmes pistes. Les mathématiques, l’astronomie et la médecine circulent de même, avec les traductions arabes comme pivot.',
        'Des maladies, aussi. La peste noire qui tue entre un tiers et la moitié de la population européenne entre 1347 et 1351 arrive par ces réseaux, via les comptoirs de la mer Noire. C’est le rappel le plus brutal qu’un réseau d’échanges transporte tout ce qui peut voyager, et pas seulement ce qu’on souhaite y voir circuler.',
      ],
    },
    {
      titre: 'L’apogée mongol, puis le déplacement vers la mer',
      paragraphes: [
        'Aux XIIIᵉ et XIVᵉ siècles, l’unification de l’Eurasie sous domination mongole crée ce qu’on a appelé la "Pax Mongolica" : un espace où un marchand pouvait circuler de la Crimée à Pékin sous une seule autorité. C’est la période des grands voyageurs documentés — Marco Polo, parti de Venise en 1271 et revenu en 1295, Ibn Battuta au siècle suivant.',
        'Le déclin est simultanément politique et technique. La fragmentation de l’empire mongol, la peste, puis le contrôle ottoman des débouchés méditerranéens renchérissent la voie terrestre. Surtout, la navigation hauturière la contourne : quand Vasco de Gama atteint l’Inde par le Cap en 1498, le transport maritime devient plus sûr et beaucoup moins coûteux à la tonne. La Chine des Ming, après les expéditions de Zheng He, se replie elle-même sur ses frontières.',
      ],
    },
    {
      titre: 'Les « nouvelles routes de la soie »',
      paragraphes: [
        'En septembre 2013, à Astana, Xi Jinping propose une « ceinture économique de la route de la soie », complétée quelques semaines plus tard par une « route maritime » : c’est l’initiative « la Ceinture et la Route », qui associe aujourd’hui environ 150 pays. Les instruments sont des prêts, des concessions portuaires, des corridors ferroviaires et des zones économiques ; les montants engagés depuis 2013 se comptent en centaines de milliards de dollars, avec des estimations qui varient fortement selon ce qu’on inclut.',
        'Les débats sont de trois ordres. La soutenabilité de la dette, illustrée par la concession du port sri-lankais de Hambantota à un opérateur chinois pour 99 ans en 2017. L’intérêt économique réel des corridors ferroviaires Chine-Europe, plus rapides que la mer mais bien plus chers. Et la dimension stratégique : infrastructures portuaires, normes techniques, réseaux numériques. Le choix du nom n’est pas innocent — il inscrit une politique du XXIᵉ siècle dans une continuité historique flatteuse et largement reconstruite.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que les routes de la soie sont le meilleur argument contre l’idée de civilisations séparées se développant chacune pour soi. Le papier, la boussole, les chiffres dits arabes, le bouddhisme chinois, la porcelaine européenne : tout cela est le produit de circulations, et la plupart des « inventions nationales » ont une histoire de transfert.',
        'Parce que le mécanisme central — qui contrôle le corridor prélève la rente — reste exactement d’actualité, qu’il s’agisse du canal de Suez, du détroit de Malacca, des câbles sous-marins ou des gazoducs. Comprendre les caravansérails aide à lire une carte des chokepoints contemporains.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_effondrement_urss: [
    {
      titre: 'Un effondrement sans défaite militaire',
      paragraphes: [
        'L’Union soviétique disparaît le 26 décembre 1991. Elle n’a perdu aucune guerre sur son territoire, subi aucune invasion, connu ni famine ni insurrection générale. Elle possédait encore la deuxième armée du monde et environ 30 000 armes nucléaires. C’est ce qui rend le cas si intéressant : un État se défait par l’intérieur, en moins de sept ans, sous l’effet de réformes voulues par son propre dirigeant.',
        'Presque personne ne l’avait prévu, ni les services de renseignement occidentaux, ni les soviétologues universitaires, ni les dissidents. Les rares exceptions — l’économiste Emmanuel Todd en 1976, le dissident Andreï Amalrik en 1970 — s’appuyaient sur des indicateurs démographiques et sociaux plutôt que sur l’analyse politique classique.',
      ],
    },
    {
      titre: 'Les fragilités de fond',
      paragraphes: [
        'L’économie soviétique croît encore dans les années 1950 et 1960, puis ralentit continuellement. Elle souffre d’un défaut structurel : la planification alloue les ressources sans mécanisme de prix, donc sans information fiable sur la rareté. Les usines sont évaluées sur des volumes, pas sur l’utilité, ce qui produit des excédents d’acier et des pénuries permanentes de biens de consommation. L’agriculture reste si peu productive que l’URSS, premier pays agricole par la surface, importe massivement du blé à partir des années 1970.',
        'Le régime tient largement par la rente pétrolière : les exportations d’hydrocarbures financent les importations alimentaires et technologiques. Or le prix du pétrole s’effondre en 1986, divisé par plus de deux en quelques mois. La marge de manœuvre budgétaire disparaît au moment précis où les réformes en auraient eu besoin.',
        'S’y ajoutent deux saignées : la guerre d’Afghanistan, engagée en décembre 1979, qui coûtera environ 15 000 morts soviétiques et un discrédit durable ; et la catastrophe de Tchernobyl, le 26 avril 1986, dont le coût direct fut immense et dont la gestion — mensonge initial, évacuation tardive — a détruit ce qui restait de crédibilité à la parole officielle. Gorbatchev lui-même a désigné plus tard Tchernobyl comme la véritable cause de l’effondrement.',
      ],
    },
    {
      titre: 'Gorbatchev : réformer pour sauver, ouvrir pour perdre',
      paragraphes: [
        'Arrivé au secrétariat général en mars 1985, Mikhaïl Gorbatchev veut sauver le système socialiste, pas le supprimer. Ses deux instruments sont la "perestroïka", restructuration économique, et la "glasnost", transparence de l’information. Le second produit un effet qu’il n’avait pas anticipé : la levée de la censure permet de dire publiquement ce que chacun savait en privé, sur les pénuries, sur la corruption, sur les crimes staliniens. La légitimité historique du régime s’effondre en quelques années.',
        'Les réformes économiques, elles, restent à mi-chemin : la loi sur les coopératives de 1988 autorise une activité privée sans libérer les prix, ce qui crée des circuits de rente sans créer d’offre. Le résultat est le pire des deux mondes — l’ancien système ne fonctionne plus, le nouveau n’existe pas encore. En 1990-1991, les pénuries deviennent générales dans les grandes villes.',
        'L’ouverture politique produit une dynamique irréversible. Les élections au Congrès des députés du peuple, en mars 1989, sont les premières compétitives depuis 1917 ; elles donnent une tribune légale aux opposants et aux mouvements nationaux.',
      ],
    },
    {
      titre: 'La question nationale, moteur de la dislocation',
      paragraphes: [
        'L’URSS était une fédération de quinze républiques dont les frontières correspondaient à des nations. Dès que la contrainte se relâche, ces cadres deviennent des instruments politiques. Dans les pays baltes, annexés en 1940 au titre du pacte germano-soviétique, les fronts populaires réclament d’abord l’autonomie puis l’indépendance ; le 23 août 1989, environ deux millions de personnes forment une chaîne humaine de 600 km à travers l’Estonie, la Lettonie et la Lituanie. La Lituanie proclame son indépendance le 11 mars 1990.',
        'Ailleurs, la décompression libère des conflits : Nagorno-Karabakh entre Arménie et Azerbaïdjan dès 1988, répression meurtrière à Tbilissi en avril 1989, assaut de la tour de télévision de Vilnius en janvier 1991. Le référendum de mars 1991 sur le maintien d’une union rénovée est boycotté par six républiques.',
        'Le facteur décisif est cependant russe. Boris Eltsine, élu à la tête du Soviet suprême de Russie en mai 1990 puis président de Russie au suffrage universel le 12 juin 1991, choisit de retourner l’appareil de la plus grande république contre le centre fédéral. L’URSS ne s’est pas seulement défaite par ses périphéries : son cœur a fait sécession.',
      ],
    },
    {
      titre: 'Les quatre derniers mois',
      paragraphes: [
        'Du 19 au 21 août 1991, un comité d’État conservateur tente un coup de force, assigne Gorbatchev à résidence en Crimée et envoie les chars à Moscou. Le putsch échoue en trois jours, faute de volonté d’ouvrir le feu et devant la résistance civile rassemblée autour d’Eltsine. Gorbatchev revient à Moscou en ayant perdu toute autorité, et le Parti communiste est suspendu.',
        'Le 1ᵉʳ décembre 1991, l’Ukraine vote son indépendance à plus de 90 %. Le 8 décembre, les dirigeants de Russie, d’Ukraine et de Biélorussie signent les accords de Belovej constatant que l’URSS « cesse d’exister » et créant la Communauté des États indépendants ; huit autres républiques les rejoignent à Alma-Ata le 21 décembre. Gorbatchev démissionne le 25 décembre ; le drapeau rouge est descendu du Kremlin le même soir. Le 26, le Soviet suprême acte la dissolution.',
      ],
    },
    {
      titre: 'Les conséquences, trente ans après',
      paragraphes: [
        'Quinze États naissent, et avec eux environ 25 millions de Russes se retrouvent hors de Russie — l’un des ressorts des conflits ultérieurs. La transition économique des années 1990 est brutale : le PIB russe chute d’environ 40 % entre 1991 et 1998, l’hyperinflation efface l’épargne, l’espérance de vie masculine recule de plusieurs années, phénomène rare en temps de paix. Les privatisations créent en quelques années une concentration extrême de la propriété.',
        'L’héritage nucléaire est traité avec un succès qui mérite d’être rappelé : l’Ukraine, le Kazakhstan et la Biélorussie renoncent aux armes stationnées sur leur sol, avec le mémorandum de Budapest de 1994 en contrepartie d’assurances de sécurité. Les débats actuels sur la valeur de telles assurances viennent de là.',
        'Enfin, la lecture de 1991 est elle-même devenue un enjeu politique. Vladimir Poutine a qualifié l’effondrement de « plus grande catastrophe géopolitique du siècle » ; à l’inverse, il est vécu dans les pays baltes ou en Europe centrale comme une libération. Une même date, deux mémoires incompatibles : c’est un fait politique dont il faut tenir compte pour lire la région.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est le laboratoire de la question « comment un régime autoritaire se libéralise-t-il sans se désintégrer ? ». La Chine a tiré de 1991 une conclusion explicite et opposée à celle de Gorbatchev : réformer l’économie d’abord, ne rien céder sur le contrôle politique. Les trajectoires russe et chinoise depuis trente ans sont deux réponses à la même question.',
        'Parce que c’est aussi une leçon d’humilité pour l’analyse. Les meilleurs spécialistes du monde, disposant de moyens considérables, n’ont pas vu venir la disparition de l’objet qu’ils étudiaient. Les indicateurs qui l’annonçaient — mortalité infantile, alcoolisme, fiabilité des données officielles — étaient publics et considérés comme secondaires.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_colonisation: [
    {
      titre: 'De quoi parle-t-on exactement',
      paragraphes: [
        'La colonisation européenne désigne un processus long, discontinu, qui s’étend des voyages ibériques de la fin du XVᵉ siècle aux indépendances du XXᵉ. Elle recouvre des formes très différentes : colonies de peuplement où les migrants européens deviennent majoritaires, colonies d’exploitation où une administration réduite encadre une production destinée à l’exportation, protectorats laissant subsister des souverains locaux, mandats confiés par la Société des Nations après 1919.',
        'L’extension est considérable. À la veille de 1914, les puissances européennes, leurs anciennes colonies devenues indépendantes et le Japon contrôlent la très grande majorité des terres émergées ; l’Afrique, à l’exception de l’Éthiopie et du Liberia, est entièrement partagée. Le cadre de ce partage a été posé à la conférence de Berlin de 1884-1885, où aucun Africain n’était représenté et où les frontières furent tracées selon les positions et les prétentions européennes.',
      ],
    },
    {
      titre: 'Les mécanismes économiques',
      paragraphes: [
        'La traite atlantique constitue le premier de ces mécanismes et le plus destructeur. Les bases de données historiques les mieux établies recensent environ 12,5 millions de personnes embarquées de force depuis l’Afrique entre le XVIᵉ et le XIXᵉ siècle, dont environ 10,7 millions ont survécu à la traversée. L’économie de plantation des Amériques — sucre, coton, tabac — repose sur ce travail forcé.',
        'Dans les colonies d’exploitation, le modèle est celui de la culture de rente : arachide au Sénégal, cacao en Côte d’Ivoire et au Ghana, coton au Soudan, hévéa en Indochine, cuivre en Rhodésie du Nord. L’infrastructure suit cette logique — les voies ferrées relient les zones de production aux ports, rarement les régions entre elles, ce qui reste visible sur les cartes ferroviaires actuelles. Le travail forcé, l’impôt de capitation payable en monnaie coloniale et la réquisition sont des instruments courants jusqu’au milieu du XXᵉ siècle.',
        'Le cas de l’État indépendant du Congo, propriété personnelle de Léopold II de 1885 à 1908, est l’exemple extrême : le rendement du caoutchouc y est obtenu par un système de quotas et de mutilations dont le scandale international finit par contraindre la Belgique à reprendre le territoire. Les estimations de la surmortalité, très débattues, se comptent en millions.',
      ],
    },
    {
      titre: 'Les résistances, dès le premier jour',
      paragraphes: [
        'L’idée d’une domination subie passivement ne résiste pas à l’examen. La révolution haïtienne, de 1791 à l’indépendance proclamée le 1ᵉʳ janvier 1804, est la seule révolte d’esclaves de l’histoire ayant abouti à la fondation d’un État. En Inde, la grande révolte de 1857 met fin au règne de la Compagnie des Indes. En Éthiopie, la victoire d’Adoua sur l’Italie en 1896 préserve l’indépendance du pays.',
        'Ailleurs, les résistances armées sont écrasées mais durables : Samori Touré en Afrique de l’Ouest, Abdelkader en Algérie, les guerres hereros et namas en Afrique du Sud-Ouest allemande entre 1904 et 1908 — qualifiées de génocide par l’Allemagne en 2021 —, la révolte Maji-Maji au Tanganyika. Ces épisodes comptent parce qu’ils montrent que la conquête fut une guerre, et non un processus administratif.',
      ],
    },
    {
      titre: 'La décolonisation : trois vagues',
      paragraphes: [
        'La première, en Asie, suit immédiatement la Seconde Guerre mondiale. L’Inde et le Pakistan accèdent à l’indépendance le 15 août 1947 ; la partition provoque des déplacements de 10 à 15 millions de personnes et des massacres dont le bilan est estimé à plusieurs centaines de milliers, peut-être un million de morts. L’Indonésie proclame son indépendance en 1945 et l’obtient en 1949 après quatre ans de guerre. En Indochine, la défaite française de Diên Biên Phu, le 7 mai 1954, met fin à huit ans de guerre.',
        'La deuxième, africaine, culmine en 1960 : dix-sept pays deviennent indépendants cette seule année, et l’Assemblée générale de l’ONU adopte le 14 décembre 1960 la résolution 1514 affirmant le droit des peuples coloniaux à l’autodétermination. La conférence de Bandung, en 1955, avait donné à ce mouvement une expression politique commune et l’amorce du non-alignement.',
        'La troisième est celle des indépendances arrachées par la guerre : l’Algérie, de 1954 aux accords d’Évian du 18 mars 1962, au prix d’un conflit dont le bilan reste disputé et lourd de part et d’autre ; les colonies portugaises — Angola, Mozambique, Guinée-Bissau — libérées en 1974-1975 à la suite de la révolution des Œillets à Lisbonne ; le Zimbabwe en 1980 ; la Namibie en 1990. L’apartheid sud-africain ne tombe qu’en 1994.',
      ],
    },
    {
      titre: 'Ce qui est resté',
      paragraphes: [
        'Des frontières, d’abord : la quasi-totalité des frontières africaines actuelles sont des tracés coloniaux, conservés après 1960 par une décision explicite de l’Organisation de l’unité africaine, au motif que les remettre en cause déclencherait des guerres sans fin. Ce choix a évité certains conflits et figé d’autres.',
        'Des structures économiques ensuite : spécialisation sur quelques matières premières exportées brutes, faible transformation locale, dépendance aux cours mondiaux. Des institutions monétaires enfin, dont le franc CFA, créé le 26 décembre 1945 et plusieurs fois réformé, est l’exemple le plus discuté : garantie de convertibilité et stabilité des prix d’un côté, contrainte de politique monétaire et souveraineté partagée de l’autre. Le débat sur son avenir, y compris le projet de monnaie unique ouest-africaine, est ouvert et légitime.',
        'Des sociétés, aussi : langues officielles héritées, systèmes juridiques et scolaires, diasporas, et une mémoire qui structure le débat politique dans les anciennes métropoles comme dans les anciennes colonies.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la plupart des institutions avec lesquelles vivent aujourd’hui les deux tiers de l’humanité — frontières, administrations, monnaies, langues d’enseignement — ont été dessinées pendant cette période, souvent en quelques années et sans consultation. Comprendre leur origine n’est pas un exercice de mémoire : c’est la condition pour discuter sérieusement de leur réforme.',
        'Parce que le sujet est aussi un test de rigueur. Il se prête à deux erreurs opposées : l’effacement, qui présente la colonisation comme une parenthèse modernisatrice, et l’explication unique, qui ferait de tout problème actuel un effet direct du fait colonial. Les travaux les plus solides tiennent les deux bouts : ils documentent précisément les mécanismes, et distinguent ce qui en découle de ce qui relève de décisions prises après les indépendances.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_plan_marshall: [
    {
      titre: 'L’Europe de l’hiver 1947',
      paragraphes: [
        'Deux ans après la fin des combats, l’Europe occidentale ne redémarre pas. Les destructions matérielles sont importantes mais pas décisives — l’outillage industriel allemand a mieux survécu qu’on ne le croyait. Le problème est ailleurs : les circuits d’échange sont brisés, les monnaies inconvertibles, la production de charbon insuffisante, et surtout les Européens n’ont plus de dollars pour acheter ce que seuls les États-Unis peuvent encore vendre. C’est le « déficit de dollars ».',
        'L’hiver 1946-1947 est exceptionnellement rigoureux et aggrave tout : pénurie de charbon, rationnement alimentaire plus strict qu’en temps de guerre dans certains pays, grèves massives en France et en Italie où les partis communistes réalisent des scores élevés. À Washington, la conclusion est que l’effondrement économique produira des effondrements politiques.',
      ],
    },
    {
      titre: 'Le discours du 5 juin 1947 et son architecture',
      paragraphes: [
        'Le 5 juin 1947, le secrétaire d’État George Marshall prononce à Harvard un discours de quelques minutes qui propose une aide américaine à la reconstruction, à deux conditions : que les Européens en établissent eux-mêmes le plan, et qu’ils le fassent ensemble. Ce point est essentiel et souvent oublié — le programme n’est pas conçu comme une série d’aides bilatérales, mais comme une incitation à la coopération européenne.',
        'L’offre est formellement ouverte à tous, URSS comprise. Molotov participe à la conférence de Paris de juillet 1947 puis la quitte, refusant la mise en commun des informations économiques et la coordination. Moscou interdit ensuite à la Pologne et à la Tchécoslovaquie, qui avaient accepté, d’y prendre part, et crée en janvier 1949 le Comecon. Le plan a donc contribué à fixer la division de l’Europe autant qu’il a répondu à une nécessité économique.',
        'L’Economic Cooperation Act est signé le 3 avril 1948. Seize pays participent, réunis d’abord dans un comité de coopération puis dans l’OECE en avril 1948 — laquelle deviendra l’OCDE en 1961.',
      ],
    },
    {
      titre: 'Les chiffres, et ce qu’ils ne disent pas',
      paragraphes: [
        'De 1948 à 1952, environ 13,3 milliards de dollars sont versés, dont à peu près 3,3 pour le Royaume-Uni, 2,3 pour la France, 1,5 pour l’Allemagne de l’Ouest et 1,2 pour l’Italie. En part du revenu national des bénéficiaires, l’aide représente selon les pays et les années de l’ordre de 2 à 5 % — significatif, mais très loin de suffire à expliquer des taux de croissance qui atteindront 8 % par an.',
        'Le mécanisme des « fonds de contrepartie » explique une partie de l’effet réel. L’aide était souvent fournie en marchandises ; les entreprises locales les payaient en monnaie nationale, et ces sommes, versées sur un compte spécial, servaient à financer des investissements avec l’accord de Washington. Un même dollar servait donc deux fois : à l’importation, puis à l’investissement intérieur.',
      ],
    },
    {
      titre: 'A-t-il marché ? Le débat des historiens',
      paragraphes: [
        'La thèse critique a été formulée par Alan Milward : la reprise européenne était déjà engagée en 1947, les niveaux de production d’avant-guerre ont été retrouvés avant que l’aide ne produise ses effets, et les montants étaient trop faibles pour être déterminants. À l’appui : plusieurs pays ont crû vite en recevant peu.',
        'La réponse la plus influente est celle de Barry Eichengreen et Bradford De Long, en 1993 : le plan a fonctionné non comme un transfert de capital mais comme un « programme d’ajustement structurel qui a réussi ». Son apport principal aurait été politique et institutionnel — lever des goulets d’étranglement précis, notamment sur les matières premières importées, et surtout appuyer un compromis social durable où les syndicats acceptaient la modération salariale contre l’investissement et la croissance, dans un cadre d’économie de marché ouverte.',
        'Une troisième lecture insiste sur le rôle de la contrainte de coopération : c’est pour répartir l’aide que les Européens ont appris à négocier ensemble des quotas, des paiements et des libéralisations commerciales, avec l’Union européenne des paiements créée en 1950. La Communauté européenne du charbon et de l’acier, en 1951, prolonge directement cette habitude.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le plan Marshall est invoqué chaque fois qu’il faut reconstruire quelque chose — un « plan Marshall pour l’Afrique », pour les Balkans, pour l’Ukraine, pour le climat. L’invocation est presque toujours inexacte : elle retient le transfert d’argent et oublie les deux traits qui ont fait l’originalité du dispositif, à savoir la conditionnalité coopérative et le fait que les bénéficiaires écrivaient le plan.',
        'Parce qu’il illustre enfin une leçon d’économie du développement qui n’a rien perdu de son actualité : ce qui manquait à l’Europe de 1947 n’était pas l’argent seul, mais des institutions capables de coordonner les décisions et de rendre les engagements crédibles. L’argent sans ce cadre produit peu ; c’est le résultat le plus solide de cinquante ans de recherche sur l’aide.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_revolution_industrielle: [
    {
      titre: 'La rupture la plus importante depuis l’agriculture',
      paragraphes: [
        'Pendant des millénaires, le revenu par habitant a été à peu près stable : les reconstitutions historiques les plus utilisées estiment la croissance du produit par tête à une fraction de pour cent par siècle avant 1700. Puis, à partir de la seconde moitié du XVIIIᵉ siècle en Angleterre, elle passe à 1 puis 2 % par an et ne redescend plus. C’est le fait central : la révolution industrielle n’a pas rendu les sociétés plus riches une fois, elle a rendu l’enrichissement continu.',
        'Le mécanisme commun aux trois vagues successives est le remplacement de l’énergie musculaire par l’énergie extérieure convertie en travail mécanique, puis par le traitement automatisé de l’information. Chaque vague élargit ce qu’une personne peut produire en une heure.',
      ],
    },
    {
      titre: 'Première vague : charbon, vapeur, coton (1760-1840)',
      paragraphes: [
        'Trois secteurs s’entraînent mutuellement. Le textile d’abord, avec la navette volante, la "spinning jenny", le métier à eau d’Arkwright en 1769, puis le métier mécanique de Cartwright en 1785 : le prix du fil s’effondre et la demande explose. La métallurgie ensuite, grâce au coke et au puddlage mis au point par Henry Cort en 1784, qui permettent un fer bon marché en grande quantité. La vapeur enfin : la machine atmosphérique de Newcomen datait de 1712, mais c’est le condenseur séparé breveté par James Watt en 1769, puis le mouvement rotatif, qui la rendent utilisable partout et non seulement pour pomper l’eau des mines.',
        'Les transports suivent immédiatement. La ligne Liverpool-Manchester, ouverte en 1830 après la victoire de la "Rocket" de Stephenson aux essais de Rainhill en 1829, démontre qu’un chemin de fer peut être rentable. En quarante ans, le réseau britannique dépasse 20 000 km et divise les coûts de transport intérieur par un facteur considérable.',
        'Pourquoi l’Angleterre ? Les réponses convergent sur une combinaison : du charbon abondant et proche des voies d’eau, des salaires élevés qui rendaient rentable de remplacer du travail par des machines — argument central de Robert Allen —, des droits de propriété et un système de brevets fonctionnels, un marché intérieur unifié, des débouchés coloniaux, un secteur financier capable de prêter à long terme, et une culture d’artisans-ingénieurs pratiquant la mesure.',
      ],
    },
    {
      titre: 'Deuxième vague : acier, électricité, chimie (1870-1914)',
      paragraphes: [
        'Le procédé Bessemer, breveté en 1856, fait tomber le coût de l’acier et rend possibles rails, ponts, navires et gratte-ciel. L’électricité devient une industrie : lampe à incandescence d’Edison en 1879, première centrale commerciale à Pearl Street à New York en 1882, puis victoire du courant alternatif qui permet le transport de l’énergie sur de longues distances. Le moteur à combustion interne suit — cycle d’Otto en 1876, automobile de Benz en 1886.',
        'La chimie de synthèse est la transformation la moins visible et la plus lourde de conséquences. Le procédé Haber-Bosch, mis au point entre 1909 et 1913, fixe l’azote atmosphérique pour produire des engrais. On estime aujourd’hui qu’une part majeure de l’azote contenu dans les protéines de l’humanité vient de ce procédé : sans lui, la population mondiale actuelle ne serait pas nourrissable.',
        'L’organisation du travail change aussi. Le taylorisme décompose les gestes ; la chaîne de montage installée par Ford à Highland Park en 1913 fait tomber le temps d’assemblage d’une Model T de plusieurs heures à environ une heure et demie, et son prix avec.',
      ],
    },
    {
      titre: 'Troisième vague : information (1947 à aujourd’hui)',
      paragraphes: [
        'Le transistor est inventé en décembre 1947 aux Bell Labs par Bardeen, Brattain et Shockley. Le circuit intégré suit en 1958-1959 avec Kilby et Noyce, et le premier microprocesseur, l’Intel 4004, en 1971. En 1965, Gordon Moore observe le doublement régulier du nombre de composants par circuit : cette régularité, devenue objectif industriel autant que constat, a tenu près d’un demi-siècle.',
        'Les réseaux prennent le relais : ARPANET en 1969, protocole TCP/IP standardisé en 1983, Web conçu par Tim Berners-Lee au CERN en 1989-1991, téléphone tactile généralisé à partir de 2007. Le coût de duplication et de transmission de l’information tend vers zéro, ce qui déplace la valeur vers ce qui ne se duplique pas.',
      ],
    },
    {
      titre: 'Le coût, qu’il serait malhonnête d’omettre',
      paragraphes: [
        'Les premières décennies industrielles ont été dures pour ceux qui les ont vécues : journées de douze à seize heures, travail des enfants dans les mines et les filatures, espérance de vie dans les villes manufacturières inférieure à celle des campagnes, épidémies de choléra liées à l’absence d’égouts. Les gains de niveau de vie pour les ouvriers ne deviennent nets qu’à partir des années 1840-1870, une fois obtenues les premières lois sur le travail et l’assainissement des villes.',
        'Le coût environnemental est de très longue durée. La concentration de CO₂ dans l’atmosphère était d’environ 280 parties par million avant l’industrialisation ; elle dépasse aujourd’hui 420 ppm, niveau inédit depuis plusieurs millions d’années. Le changement climatique est la facture différée de la première vague, et la question énergétique actuelle est exactement celle de savoir comment maintenir les gains de productivité sans la ligne de charbon qui les a lancés.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que tout ce qui fait le quotidien d’une vie moderne — vivre plus de soixante-dix ans, savoir lire, acheter de la nourriture qu’on n’a pas produite, se déplacer plus vite qu’un cheval — est un produit direct de cette séquence, et n’a que quelques générations d’ancienneté.',
        'Parce que les débats actuels sur l’automatisation reprennent, presque à l’identique, ceux du XIXᵉ siècle sur les machines. L’histoire n’y donne pas une réponse rassurante mais une réponse précise : l’emploi total ne disparaît pas, la composition des métiers change radicalement, et le sort des personnes dépend entièrement des institutions — formation, protection sociale, droit du travail — mises en place pendant la transition.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  hist_crise_1929: [
    {
      titre: 'Les années folles et leur ressort caché',
      paragraphes: [
        'Les États-Unis des années 1920 connaissent une décennie d’expansion réelle : électrification des foyers, automobile de masse, radio, appareils ménagers. La productivité industrielle progresse fortement. Mais deux fragilités s’installent. D’une part, les gains sont mal répartis et la consommation s’appuie de plus en plus sur le crédit. D’autre part, la Bourse se finance à crédit : l’achat sur marge permet d’acquérir des actions en n’avançant qu’une fraction du prix, le reste étant emprunté au courtier avec les titres pour garantie.',
        'Ce montage transforme toute baisse en effondrement. Si le cours recule, le courtier exige un complément de garantie ; l’investisseur doit vendre pour l’obtenir, ce qui fait baisser davantage, ce qui déclenche de nouveaux appels. Une bulle immobilière en Floride en 1925-1926 avait déjà donné un avertissement, resté sans effet.',
      ],
    },
    {
      titre: 'Octobre 1929 : la mécanique du krach',
      paragraphes: [
        'L’indice Dow Jones atteint son sommet le 3 septembre 1929, à 381,17 points. La chute s’installe en octobre : jeudi noir le 24, puis lundi 28 octobre avec près de 13 % de baisse en une séance, et mardi 29 octobre avec près de 12 % de plus, dans un volume que les téléscripteurs ne parviennent plus à suivre.',
        'Le krach n’est pourtant pas la crise. L’indice reprend même une partie du terrain perdu au printemps 1930. La véritable descente est lente et s’étale sur trois ans : le point bas est atteint le 8 juillet 1932, à 41,22 points, soit une perte d’environ 89 % depuis le sommet. Il faudra attendre novembre 1954 — vingt-cinq ans — pour retrouver le niveau de 1929.',
      ],
    },
    {
      titre: 'Comment un krach devient une dépression',
      paragraphes: [
        'Le passage de la Bourse à l’économie réelle se fait par les banques. Entre 1930 et 1933, trois vagues de paniques bancaires emportent environ 9 000 établissements américains. À l’époque, aucun mécanisme d’assurance des dépôts n’existe : une faillite signifie la perte sèche de l’épargne, donc la ruée sur les guichets dès le premier doute. La chute de la Bank of United States en décembre 1930 accélère la contagion.',
        'Milton Friedman et Anna Schwartz ont montré la conséquence monétaire : la masse monétaire américaine se contracte d’environ un tiers entre 1929 et 1933, et la Réserve fédérale, loin de compenser, laisse faire au nom de la défense de l’étalon-or et de la crainte de la spéculation. C’est l’erreur de politique économique la plus étudiée de l’histoire.',
        'Le canal international est l’étalon-or lui-même, thèse développée notamment par Barry Eichengreen dans "Golden Fetters" (1992). Un pays attaqué sur sa monnaie devait augmenter ses taux et réduire ses dépenses au pire moment. La faillite de la banque autrichienne Creditanstalt en mai 1931 propage la crise en Europe ; le Royaume-Uni abandonne l’or le 21 septembre 1931. Les pays qui en sortent tôt se redressent tôt : c’est l’un des résultats les plus robustes de la littérature.',
        'Enfin, le protectionnisme achève le commerce mondial. Le tarif Smoot-Hawley, adopté le 17 juin 1930 malgré la pétition de plus d’un millier d’économistes, déclenche des représailles ; la valeur du commerce international recule des deux tiers entre 1929 et 1934.',
      ],
    },
    {
      titre: 'Ce que vivent les gens',
      paragraphes: [
        'Aux États-Unis, la production réelle recule d’environ un quart et le chômage passe d’environ 3 % en 1929 à près de 25 % en 1933 ; les prix baissent de l’ordre d’un quart, ce qui alourdit mécaniquement toutes les dettes. S’ajoutent, au milieu des années 1930, les tempêtes de poussière du Dust Bowl qui chassent des centaines de milliers d’agriculteurs des Grandes Plaines.',
        'En Allemagne, la dépression se greffe sur les réparations et l’hyperinflation encore fraîche de 1923. Le chômage atteint environ six millions de personnes en 1932. Aux élections de juillet 1932, le parti nazi devient le premier parti du Reichstag ; Hitler est nommé chancelier le 30 janvier 1933. Le lien entre la crise économique et cette bascule politique est l’une des raisons pour lesquelles 1929 est étudié bien au-delà de l’économie.',
      ],
    },
    {
      titre: 'La réponse, et les institutions qu’elle a créées',
      paragraphes: [
        'Franklin Roosevelt prend ses fonctions le 4 mars 1933 et agit en quelques jours : fermeture temporaire de toutes les banques le 6 mars, loi bancaire d’urgence, réouverture progressive des seuls établissements jugés solides, abandon de la convertibilité en or en avril. Suivent la séparation des banques de dépôt et d’investissement et la création de l’assurance des dépôts par le Glass-Steagall Act du 16 juin 1933, la Securities and Exchange Commission en 1934, et la sécurité sociale américaine en 1935.',
        'Ces institutions sont la véritable trace de 1929. Assurance des dépôts, prêteur en dernier ressort assumé, régulation des marchés de titres, stabilisateurs automatiques budgétaires : ce sont des réponses directes aux mécanismes observés entre 1929 et 1933.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que les deux grandes crises récentes ont été gérées par des gens qui avaient étudié celle-là. Ben Bernanke, président de la Réserve fédérale en 2008, était un spécialiste universitaire de la Grande Dépression ; la décision d’inonder le système de liquidités plutôt que de le laisser se contracter découle explicitement du diagnostic de Friedman et Schwartz. La réponse de 2020 a suivi la même logique, à une échelle plus grande encore.',
        'Parce qu’elle rappelle enfin qu’une crise financière n’est grave que par ce qu’elle casse ensuite : le crédit, les banques, les prix et l’emploi. La Bourse n’est que le premier domino, et le plus visible.',
      ],
    },
  ],
};
