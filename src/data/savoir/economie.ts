import type { ArticlesDuDomaine } from './types';

/**
 * Articles du domaine « Économie & Argent ».
 *
 * Les ordres de grandeur financiers bougent d'une année sur l'autre. Ils sont
 * donc donnés avec leur date de référence, et arrondis à la précision qu'ils
 * méritent : annoncer trois décimales sur un encours mondial serait une fausse
 * précision, et vieillirait plus mal qu'un ordre de grandeur honnête.
 */
export const articlesEconomie: ArticlesDuDomaine = {
  /* ═════════════════════════════════════════════════════════════════════ */
  econ_banques_centrales: [
    {
      titre: 'À quoi sert une banque centrale',
      paragraphes: [
        'Une banque centrale a le monopole de l’émission de la monnaie légale et sert de banque aux banques. Ce second rôle est le plus important à comprendre : les banques commerciales détiennent des comptes chez elle, s’y refinancent, et y règlent leurs dettes mutuelles. C’est cette position de sommet qui lui donne la capacité d’agir sur le coût du crédit dans toute l’économie.',
        'Les premières institutions du genre naissent pour financer des États : la Riksbank suédoise en 1668, la Banque d’Angleterre en 1694, créée pour emprunter au nom de la Couronne en guerre. Leurs missions actuelles — stabilité des prix, stabilité financière, parfois emploi — sont beaucoup plus récentes et ont été construites par accumulation de crises.',
      ],
    },
    {
      titre: 'Les trois leviers, et lequel compte vraiment',
      paragraphes: [
        'Le premier levier est le taux directeur : le prix auquel les banques se refinancent auprès de la banque centrale pour de très courtes durées. Il se transmet aux taux du marché monétaire, puis aux taux des crédits et des dépôts. C’est l’instrument principal, et son effet met généralement de douze à dix-huit mois à se déployer pleinement — ce décalage explique une grande partie des erreurs de politique monétaire.',
        'Le deuxième est l’intervention sur les marchés : achat ou vente de titres, en général de dette publique. Depuis 2008, cette pratique a pris une ampleur inédite sous le nom d’assouplissement quantitatif. Le bilan de la Réserve fédérale américaine est passé d’environ 900 milliards de dollars avant la crise à plus de 4 000 milliards en 2014, puis au-delà de 8 000 milliards après 2020.',
        'Le troisième est réglementaire : réserves obligatoires, exigences de fonds propres, contrôle prudentiel. Mais l’outil le plus puissant n’est aucun des trois : c’est la parole. Une banque centrale crédible agit en annonçant ce qu’elle fera, parce que les marchés ajustent immédiatement les taux longs. La formule de Mario Draghi le 26 juillet 2012 — faire « tout ce qu’il faudra » pour préserver l’euro — a fait refluer les taux italiens et espagnols sans qu’un seul euro soit dépensé ce jour-là.',
      ],
    },
    {
      titre: 'L’indépendance, et pourquoi elle a été inventée',
      paragraphes: [
        'Un gouvernement qui contrôle la monnaie a une tentation permanente : financer ses dépenses par émission monétaire plutôt que par l’impôt, surtout à l’approche d’une élection. Le résultat historique de cette tentation est l’inflation, puis l’hyperinflation dans les cas extrêmes — Allemagne 1923, Zimbabwe 2008, Venezuela après 2016.',
        'D’où le modèle de la banque centrale indépendante, inspiré de la Bundesbank allemande et généralisé dans les années 1990. Son acte fondateur symbolique est la politique de Paul Volcker à la tête de la Réserve fédérale : à partir de 1979, il porte le taux directeur jusqu’aux environs de 20 % pour casser une inflation qui avait atteint près de 15 % en mars 1980. Il y parvient, au prix d’une récession sévère et d’un chômage américain culminant à 10,8 % en novembre 1982. La démonstration a marqué toute une génération de banquiers centraux : la désinflation coûte cher, et elle coûte d’autant plus cher qu’on l’a retardée.',
        'Le cadre dominant qui en est issu est le ciblage d’inflation, expérimenté d’abord par la Nouvelle-Zélande en 1990 : la banque centrale annonce une cible — le plus souvent 2 % — et rend compte publiquement de ses écarts. La Réserve fédérale a un mandat double, prix et emploi, depuis 1977 ; la Banque centrale européenne a la stabilité des prix pour objectif principal.',
      ],
    },
    {
      titre: 'Le cas de la zone franc',
      paragraphes: [
        'En Afrique de l’Ouest et en Afrique centrale, la politique monétaire est conduite par deux institutions régionales : la BCEAO, pour les huit pays de l’UEMOA, et la BEAC pour les six pays de la CEMAC. Leur particularité est le régime de change : une parité fixe avec l’euro, à 655,957 francs CFA pour un euro depuis l’introduction de l’euro, héritée de la parité avec le franc français après la dévaluation de janvier 1994.',
        'Ce choix a une conséquence mécanique qu’il faut comprendre pour juger le débat qui l’entoure. Un taux de change fixe avec une devise étrangère implique de renoncer à une politique monétaire autonome : les taux doivent suivre ceux de la zone d’ancrage, sous peine de fuite des capitaux. On échange donc de la souveraineté monétaire contre de la stabilité des prix et la convertibilité — et l’inflation y a effectivement été plus basse et plus régulière que dans la plupart des pays voisins à monnaie flottante. Les critiques portent sur l’autre plateau de la balance : l’impossibilité d’ajuster le change en cas de choc sur les matières premières, et la compétitivité des exportations. Les deux arguments sont solides ; c’est ce qui rend le débat réel.',
      ],
    },
    {
      titre: 'Ce que la séquence 2020-2024 a montré',
      paragraphes: [
        'En 2020, les banques centrales ont réagi à la pandémie par des baisses de taux immédiates et des achats d’actifs massifs, évitant une crise financière en plus de la crise sanitaire. En 2021, l’inflation est revenue dans les pays riches à des niveaux oubliés depuis quarante ans, sous l’effet combiné des ruptures d’approvisionnement, du rebond de la demande et, en Europe, du choc énergétique de 2022.',
        'La réaction a été tardive, ce que la plupart des institutions concernées ont reconnu depuis : l’inflation a d’abord été qualifiée de transitoire. Puis le resserrement a été le plus rapide depuis les années 1980 — la Réserve fédérale portant son taux d’une fourchette de 0-0,25 % à 5,25-5,50 % en dix-sept mois, jusqu’en juillet 2023. La leçon retenue est ancienne et coûte cher à réapprendre : les banques centrales voient l’inflation avec retard, et leurs remèdes agissent avec retard.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’un taux directeur détermine le coût d’un crédit immobilier, le rendement d’une épargne, la valeur d’une monnaie à l’importation, et la charge de la dette d’un État. Peu de décisions administratives touchent aussi directement autant de gens.',
        'Parce que c’est aussi l’un des rares lieux où l’on peut observer un arbitrage démocratique explicite : confier à des techniciens non élus un pouvoir considérable, pour se protéger d’une tentation dont les élus ont montré qu’ils y cédaient. Que cet arbitrage soit bon est une question politique légitime, et régulièrement rouverte.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_dollar_mondial: [
    {
      titre: 'Ce que signifie « monnaie de réserve »',
      paragraphes: [
        'Une monnaie de réserve est celle que les banques centrales du monde détiennent pour régler leurs échanges et défendre leur propre devise, et celle dans laquelle les acteurs privés facturent, empruntent et placent hors de leur pays. Le dollar occupe cette place depuis 1944, et il l’occupe encore avec une avance considérable : de l’ordre de 58 % des réserves de change allouées dans le monde en 2024, contre environ 20 % pour l’euro, 5 % pour le yen et 2 à 3 % pour le renminbi.',
        'Les autres indicateurs sont plus déséquilibrés encore. Selon l’enquête triennale de la Banque des règlements internationaux de 2022, le dollar intervient dans environ 88 % des transactions de change — chaque opération ayant deux jambes, le total dépasse 100 %. Il sert à facturer une part du commerce mondial très supérieure à la part des États-Unis dans ce commerce, et il domine l’émission de dette internationale.',
      ],
    },
    {
      titre: 'Comment cette position s’est construite',
      paragraphes: [
        'Elle a été organisée à Bretton Woods en juillet 1944 : les monnaies sont rattachées au dollar, seul le dollar est convertible en or, à 35 dollars l’once. Les États-Unis sortaient de la guerre avec l’essentiel des réserves d’or mondiales et la seule grande économie intacte ; le choix reflétait une réalité plus qu’il ne la créait.',
        'La fin de la convertibilité en or, annoncée par Nixon le 15 août 1971, aurait pu détruire cette position. Elle l’a au contraire renforcée, pour une raison contre-intuitive : libérés de l’obligation de couvrir leur monnaie en or, les États-Unis ont pu fournir au monde la liquidité qu’il demandait sans limite physique. Les accords de facturation pétrolière en dollars, à partir de 1974, ont ancré l’usage sur le marché le plus stratégique de la planète.',
        'La véritable raison de la persistance est cependant l’effet de réseau. On utilise le dollar parce que tout le monde l’utilise : les marchés les plus profonds y sont libellés, les contrats types y sont rédigés, le marché des bons du Trésor américain offre une liquidité sans équivalent. Changer de monnaie de référence exigerait une coordination que personne n’est en position d’organiser.',
      ],
    },
    {
      titre: 'Le privilège, et son revers',
      paragraphes: [
        'Valéry Giscard d’Estaing parlait de « privilège exorbitant ». Il est réel : les États-Unis empruntent dans leur propre monnaie, à des taux plus bas que ne le justifierait leur endettement, et ne subissent pas de crise de balance des paiements au sens classique. Ils bénéficient aussi d’un accès à l’information financière mondiale et d’un levier de sanctions sans équivalent, puisque presque tout paiement international transite par une banque correspondante américaine.',
        'Le revers a été formulé dès 1960 par l’économiste belge Robert Triffin, et porte son nom. Pour fournir au monde les dollars dont il a besoin, les États-Unis doivent émettre plus d’engagements qu’ils n’ont de réserves, donc accepter des déficits durables. Mais plus ces engagements s’accumulent, plus la confiance dans la monnaie s’érode. Le dilemme est structurel : l’émetteur de la monnaie mondiale ne peut pas être simultanément le garant de sa rareté et le fournisseur de son abondance.',
        'Il existe un coût domestique, moins commenté : la demande mondiale de dollars soutient la devise, ce qui renchérit les exportations américaines et pèse sur l’industrie. Une partie du débat politique américain sur la désindustrialisation touche à ce point sans toujours le nommer.',
      ],
    },
    {
      titre: 'La dédollarisation : ce qui bouge et ce qui ne bouge pas',
      paragraphes: [
        'Le gel d’environ 300 milliards de dollars de réserves russes en 2022 a été un signal fort : détenir des réserves en dollars ou en euros signifie les détenir dans le système juridique de l’émetteur. Depuis, plusieurs banques centrales ont accru leurs achats d’or, dont les volumes atteignent des records, et les accords de règlement bilatéraux en monnaies locales se multiplient — notamment entre la Chine et ses partenaires, via son système de paiement CIPS.',
        'Il faut pourtant mesurer les mouvements à leur échelle réelle. La part du dollar dans les réserves recule lentement — d’environ 70 % au début des années 2000 à environ 58 % aujourd’hui — mais ce recul profite surtout à un ensemble de devises secondaires, dollars australien et canadien, won, couronnes, et non à un successeur unique. Le renminbi reste bridé par le contrôle des capitaux chinois : une monnaie de réserve doit être librement sortable, ce que Pékin n’accorde pas.',
        'La conclusion raisonnable est donc un affaiblissement graduel plutôt qu’un remplacement. Un monde à plusieurs monnaies régionales est plus probable qu’un basculement, et il serait moins stable — l’expérience de l’entre-deux-guerres, partagée entre livre déclinante et dollar montant, n’a pas laissé un bon souvenir.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la politique monétaire américaine est de fait la politique monétaire du monde. Quand la Réserve fédérale relève ses taux, les capitaux quittent les pays émergents, leurs monnaies baissent, leur dette en dollars se renchérit et leurs importations coûtent plus cher — sans qu’aucun de ces pays ait voté pour ce resserrement. C’est un mécanisme central de la vulnérabilité financière des économies africaines et latino-américaines.',
        'Parce que la capacité d’exclure un pays du système de paiement en dollars est devenue une arme majeure, ce qui transforme une question technique en question de souveraineté. Les projets de monnaies numériques de banque centrale et de systèmes de paiement alternatifs se comprennent d’abord comme des réponses à cela.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_bitcoin: [
    {
      titre: 'Le problème que Bitcoin prétend résoudre',
      paragraphes: [
        'Transférer de l’argent sur un réseau ouvert pose un problème précis : empêcher qu’une même unité soit dépensée deux fois. Sans autorité centrale tenant le registre, rien n’interdit à quelqu’un d’envoyer les mêmes fonds à deux destinataires. Toutes les tentatives de monnaie électronique des années 1990 butaient sur ce point et finissaient par réintroduire un tiers de confiance.',
        'Le 31 octobre 2008, en pleine crise financière, un document de neuf pages signé du pseudonyme Satoshi Nakamoto propose une solution. Le premier bloc est miné le 3 janvier 2009 et contient, inscrit dans ses données, le titre d’un article du "Times" sur le sauvetage des banques — une signature politique explicite. L’identité de l’auteur n’est toujours pas établie.',
      ],
    },
    {
      titre: 'Comment ça marche, en termes simples',
      paragraphes: [
        'Le registre des transactions est public et répliqué sur des milliers de machines. Les transactions sont regroupées en blocs, chaînés les uns aux autres par une empreinte cryptographique : modifier un bloc ancien invaliderait toute la suite, ce qui rend le passé pratiquement infalsifiable.',
        'Reste à décider qui écrit le prochain bloc. C’est la « preuve de travail » : les mineurs cherchent par tâtonnement un nombre qui, combiné au bloc, produit une empreinte commençant par suffisamment de zéros. Trouver ce nombre exige des milliards de milliards d’essais ; le vérifier prend une microseconde. Le réseau ajuste la difficulté toutes les 2 016 blocs pour qu’un bloc sorte en moyenne toutes les dix minutes, quelle que soit la puissance de calcul engagée.',
        'Le mineur gagnant reçoit une récompense en bitcoins neufs. Cette récompense est divisée par deux tous les 210 000 blocs, soit environ tous les quatre ans : 50 bitcoins à l’origine, 25 en 2012, 12,5 en 2016, 6,25 en 2020, 3,125 depuis avril 2024. La somme de cette série converge, ce qui fixe le total à 21 millions d’unités, dont plus de 19,5 millions sont déjà émises. Cette rareté programmée est le cœur de l’argument de ses partisans.',
      ],
    },
    {
      titre: 'Les jalons, de la pizza aux ETF',
      paragraphes: [
        'Le 22 mai 2010, un développeur paie deux pizzas 10 000 bitcoins : c’est la première transaction commerciale connue, et elle donne un point de comparaison qui se passe de commentaire. En février 2014, la plateforme Mt. Gox, qui traitait alors la majeure partie des échanges mondiaux, s’effondre après la disparition de centaines de milliers de bitcoins — première démonstration que l’absence de tiers de confiance dans le protocole n’empêche pas de dépendre de tiers de confiance en pratique.',
        'En septembre 2021, le Salvador fait du bitcoin une monnaie légale, expérience dont l’adoption effective par la population est restée limitée. Le 10 janvier 2024, l’autorité américaine des marchés autorise des fonds indiciels cotés adossés au bitcoin au comptant, ce qui ouvre l’accès aux investisseurs institutionnels par les circuits financiers classiques. En quelques mois, ces fonds captent des dizaines de milliards de dollars.',
        'Parallèlement, Ethereum, lancé en 2015, introduit les « contrats intelligents » — des programmes exécutés par le réseau — et abandonne la preuve de travail pour la preuve d’enjeu en septembre 2022, réduisant sa consommation d’énergie de plus de 99 %.',
      ],
    },
    {
      titre: 'Les objections sérieuses',
      paragraphes: [
        'La consommation d’énergie, d’abord. Le réseau Bitcoin consomme, selon les estimations disponibles, de l’ordre de 100 à 150 térawattheures par an, soit la consommation électrique d’un pays de taille moyenne. Cette dépense est intrinsèque au mécanisme : c’est elle qui rend l’attaque coûteuse. Les défenseurs soulignent l’usage croissant d’électricité excédentaire ou fatale ; le débat porte sur la proportion.',
        'La capacité, ensuite. Le réseau traite environ sept transactions par seconde, contre plusieurs dizaines de milliers pour un réseau de cartes bancaires. Les solutions de second niveau, comme le Lightning Network, déplacent les paiements hors de la chaîne principale, avec leurs propres compromis.',
        'La volatilité, enfin, qui est l’objection la plus dirimante pour un usage monétaire. Un instrument dont le prix peut varier de 50 % en quelques mois ne peut servir ni d’unité de compte ni de réserve de précaution pour un ménage. En pratique, le bitcoin s’est installé comme un actif spéculatif et une réserve de valeur pariée sur le long terme, non comme un moyen de paiement — l’inverse de ce que son document fondateur annonçait.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que l’innovation technique, indépendamment du prix, est réelle et a été copiée partout : un registre partagé peut être tenu par des participants qui ne se font pas confiance et n’obéissent à aucune autorité. C’est un résultat qui n’existait pas avant 2009, et il a des applications au-delà de la monnaie.',
        'Parce que, dans les pays à inflation forte ou à contrôle des changes strict, l’usage des cryptomonnaies n’est pas spéculatif mais pratique : transférer de la valeur, protéger une épargne, recevoir des fonds de l’étranger à moindre coût. Cet usage, notable au Nigeria, en Argentine, en Turquie ou au Venezuela, se juge à l’aune des alternatives disponibles localement, pas à celle d’un compte en banque suisse.',
        'Parce qu’il a enfin forcé les banques centrales à se positionner, d’où les projets de monnaie numérique de banque centrale : e-CNY en Chine, euro numérique à l’étude. La question de fond posée en 2008 — qui tient le registre de la monnaie, et au nom de quoi — reste entièrement ouverte.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_etf: [
    {
      titre: 'L’idée, et la statistique qui la fonde',
      paragraphes: [
        'Un fonds indiciel n’essaie pas de choisir les bonnes actions : il achète tout un marché dans les proportions de sa capitalisation, et se contente de suivre l’indice. Un ETF — "exchange-traded fund" — est un fonds de ce type dont les parts se négocient en Bourse comme une action, en continu.',
        'Le raisonnement est arithmétique avant d’être financier. La performance moyenne de tous les investisseurs est, par construction, celle du marché, avant frais. Après frais, la moyenne est donc inférieure au marché, et d’autant plus que les frais sont élevés. Les rapports SPIVA, qui comparent chaque année les fonds actifs à leur indice de référence, confirment ce résultat avec une régularité monotone : sur des horizons de dix à quinze ans, la grande majorité des gérants actifs font moins bien que leur indice, dans presque toutes les catégories.',
      ],
    },
    {
      titre: 'D’une idée universitaire à 11 000 milliards de dollars',
      paragraphes: [
        'L’idée vient de la théorie financière des années 1960. John Bogle la met en pratique pour le grand public en lançant en 1976 le premier fonds indiciel accessible aux particuliers, accueilli à l’époque avec dérision. Le premier ETF au sens moderne, adossé au S&P 500, est coté en janvier 1993.',
        'L’adoption a été lente puis massive. Les encours mondiaux des ETF dépassent aujourd’hui les 11 000 milliards de dollars, et aux États-Unis la gestion passive a dépassé la gestion active en encours sur les actions. Le levier principal est le coût : un ETF large facture couramment de 0,03 % à 0,20 % par an, contre 1,5 % à 2,5 % pour un fonds actif distribué en banque. Sur trente ans, un écart annuel de 2 % ampute le capital final de plus d’un tiers — c’est l’intérêt composé appliqué aux frais.',
      ],
    },
    {
      titre: 'La mécanique qui fait tenir le prix',
      paragraphes: [
        'Un ETF pourrait dériver de la valeur de son panier, comme le font parfois les fonds fermés. Il ne le fait pas grâce au mécanisme de création-rachat : des intermédiaires agréés peuvent à tout moment apporter au fonds le panier de titres sous-jacents en échange de parts neuves, ou l’inverse. Si la part cote au-dessus du panier, il devient rentable d’acheter le panier et de créer des parts, ce qui ramène le prix. L’arbitrage fait le travail en continu.',
        'Ce mécanisme explique aussi les cas où la promesse tient moins bien. Sur des sous-jacents peu liquides — obligations d’entreprises à haut rendement, marchés émergents étroits — l’arbitrage devient coûteux et l’écart peut s’élargir aux moments de tension, précisément quand on voudrait vendre. Les ETF dits synthétiques, qui répliquent l’indice par un contrat d’échange plutôt qu’en détenant les titres, ajoutent un risque de contrepartie qu’il faut lire dans le prospectus.',
      ],
    },
    {
      titre: 'Le pari de Buffett, et ses limites',
      paragraphes: [
        'En 2007, Warren Buffett a parié qu’un simple fonds indiciel sur le S&P 500 battrait sur dix ans un panier de fonds spéculatifs choisis par un professionnel. Le résultat, publié en 2017 : environ 126 % de performance cumulée pour l’indice, contre environ 36 % pour le panier de fonds, frais compris. L’écart vient moins de la sélection des titres que de l’empilement des frais.',
        'Il faut cependant savoir ce que cet argument ne dit pas. Il porte sur une classe d’actifs, sur une période donnée, et dans un marché particulièrement large et liquide. Il ne dit pas que les marchés sont parfaitement efficients, ni qu’aucun gérant ne surperforme — certains le font, mais les identifier à l’avance est le vrai problème. Et il suppose que l’investisseur tienne sa position pendant les baisses, ce qui est la difficulté pratique la plus fréquente.',
      ],
    },
    {
      titre: 'Les objections récentes',
      paragraphes: [
        'La première est la concentration. Un indice pondéré par la capitalisation achète mécaniquement davantage de ce qui a déjà monté : les dix premières valeurs du S&P 500 représentent aujourd’hui plus de 30 % de l’indice, ce qui fait d’un placement « diversifié » un pari largement technologique et américain.',
        'La deuxième est la gouvernance. Trois gestionnaires — BlackRock, Vanguard, State Street — détiennent ensemble des participations significatives dans la quasi-totalité des grandes entreprises cotées, et votent aux assemblées générales. Une concentration du pouvoir actionnarial de cette ampleur est un fait nouveau, dont les conséquences sur la concurrence font l’objet de travaux sérieux.',
        'La troisième porte sur la formation des prix : si tout le monde indexe, plus personne n’analyse les entreprises pour fixer leur valeur relative. On ignore où se situe le seuil à partir duquel ce phénomène deviendrait dommageable, mais la question est légitime et la réponse n’est pas connue.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est probablement l’innovation financière qui a le plus amélioré le sort de l’épargnant ordinaire. Elle a rendu accessible, pour quelques dizaines de points de base, une diversification qui exigeait auparavant un patrimoine important et un intermédiaire cher.',
        'Parce qu’elle déplace le vrai sujet là où il doit être : non pas « quelle action acheter », mais la durée de détention, la répartition entre classes d’actifs, la régularité des versements et les frais. Ces quatre paramètres expliquent l’essentiel des écarts de résultat entre deux épargnants, bien plus que le talent de sélection.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_bretton_woods: [
    {
      titre: 'Trois semaines dans un hôtel du New Hampshire',
      paragraphes: [
        'Du 1ᵉʳ au 22 juillet 1944, alors que la guerre n’est pas terminée, 730 délégués de 44 pays se réunissent à l’hôtel Mount Washington, à Bretton Woods, pour organiser l’économie mondiale de l’après-guerre. L’objectif est explicite et fondé sur un diagnostic partagé : les désordres monétaires des années 1930 — dévaluations compétitives, protectionnisme, blocs monétaires — avaient nourri la crise, puis la guerre. Il fallait un système qui rende ces comportements inutiles.',
        'Deux plans s’opposent. Celui de John Maynard Keynes, pour le Royaume-Uni, propose une chambre de compensation internationale et une unité de réserve créée pour l’occasion, le "bancor", avec des pénalités symétriques pour les pays excédentaires comme déficitaires. Celui de Harry Dexter White, pour le Trésor américain, place le dollar au centre. Les États-Unis détenant alors la majeure partie des réserves d’or mondiales, c’est leur plan qui l’emporte pour l’essentiel.',
      ],
    },
    {
      titre: 'Comment le système fonctionnait',
      paragraphes: [
        'Le dollar est convertible en or à 35 dollars l’once, uniquement entre banques centrales. Les autres monnaies sont rattachées au dollar avec une marge de fluctuation étroite, de l’ordre de 1 %. Une parité ne peut être modifiée qu’en cas de « déséquilibre fondamental », et avec l’accord du Fonds monétaire international — d’où l’expression de « change fixe mais ajustable ».',
        'Deux institutions sont créées pour faire tenir l’ensemble. Le FMI prête à court terme aux pays en difficulté de balance des paiements, afin qu’ils n’aient pas à dévaluer ni à imposer des restrictions commerciales. La Banque internationale pour la reconstruction et le développement, future Banque mondiale, prête à long terme pour l’investissement. Le contrôle des mouvements de capitaux est la norme, et non l’exception : c’est ce qui permet de tenir simultanément un change fixe et une politique monétaire nationale.',
        'Le système ne devient pleinement opérationnel qu’en 1958, quand les principales monnaies européennes retrouvent la convertibilité. Sa période de plein exercice est donc courte — une quinzaine d’années — et coïncide avec la croissance la plus forte de l’histoire des pays développés.',
      ],
    },
    {
      titre: 'La faille, identifiée dès 1960',
      paragraphes: [
        'Robert Triffin l’expose devant le Congrès américain en 1960. Le monde a besoin de dollars pour commercer, et ces dollars ne peuvent venir que des déficits américains. Mais chaque dollar émis au-delà du stock d’or américain affaiblit la crédibilité de la promesse de conversion. Le système exige donc des États-Unis qu’ils fassent simultanément deux choses incompatibles.',
        'Les faits suivent la démonstration. Les engagements en dollars détenus à l’étranger dépassent les réserves d’or américaines au cours des années 1960, tandis que les dépenses de la guerre du Vietnam et des programmes sociaux creusent les déficits. La France, puis d’autres, commencent à demander la conversion effective de leurs dollars en or. Un « pool de l’or » tente à partir de 1961 de maintenir le cours de marché à 35 dollars, et cède en 1968.',
      ],
    },
    {
      titre: 'Le 15 août 1971 et la suite',
      paragraphes: [
        'Le 15 août 1971, Richard Nixon annonce à la télévision la suspension de la convertibilité du dollar en or, présentée comme temporaire. Elle ne sera jamais rétablie. Les accords du Smithsonian, en décembre 1971, tentent de sauver le système avec des parités révisées et une once à 38 dollars ; ils cèdent au bout d’un an. En mars 1973, les principales monnaies passent au flottement, situation ratifiée par les accords de la Jamaïque en 1976.',
        'Ce qui a survécu n’est pas rien : le FMI et la Banque mondiale existent toujours, avec des missions transformées ; le dollar est resté central sans l’ancrage en or ; et le principe d’une coopération monétaire institutionnalisée s’est maintenu. Ce qui a disparu, c’est le contrôle des capitaux, dont la levée progressive à partir des années 1970 a rendu les changes fixes presque impraticables pour une économie ouverte — ce que la crise du système monétaire européen en 1992-1993 et les crises asiatiques de 1997 ont confirmé.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le « triangle d’incompatibilité » établi par cette histoire est l’un des rares résultats vraiment robustes de la macroéconomie : on ne peut pas avoir en même temps un taux de change fixe, la libre circulation des capitaux et une politique monétaire autonome. Il faut en abandonner un. La zone euro a abandonné le troisième, la Chine contrôle le deuxième, la plupart des pays ont renoncé au premier. Toute discussion sur un régime de change se ramène à ce choix.',
        'Parce que les débats actuels sur la réforme du système monétaire international — droits de tirage spéciaux, monnaie de réserve multipolaire, rôle du FMI dans les crises de dette souveraine — reprennent les termes de juillet 1944, y compris le plan de Keynes, régulièrement ressorti des archives par ceux qui trouvent le système actuel trop asymétrique.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_creation_monetaire: [
    {
      titre: 'Une question mal posée dans la plupart des manuels',
      paragraphes: [
        'Demandez d’où vient l’argent, et l’on vous répondra généralement : la banque centrale l’imprime, les banques le prêtent. C’est faux dans les deux termes. Les billets représentent une fraction marginale de la monnaie en circulation — de l’ordre de 5 à 10 % selon les pays. L’essentiel de la monnaie existe sous forme de dépôts bancaires, et ces dépôts sont créés par les banques commerciales au moment où elles accordent un crédit.',
        'Ce n’est pas une thèse hétérodoxe. La Banque d’Angleterre l’a exposé explicitement dans son bulletin trimestriel du premier trimestre 2014, dans un article intitulé « La création monétaire dans l’économie moderne », en précisant que la présentation habituelle du multiplicateur bancaire décrit mal la réalité.',
      ],
    },
    {
      titre: 'Ce qui se passe réellement quand une banque prête',
      paragraphes: [
        'Une banque qui accorde un prêt de dix millions n’a pas besoin de trouver dix millions déposés chez elle. Elle inscrit simultanément deux lignes dans son bilan : une créance de dix millions à l’actif — ce que l’emprunteur lui doit — et un dépôt de dix millions au passif, immédiatement disponible sur le compte de l’emprunteur. Cette monnaie n’existait pas la seconde précédente. Les crédits font les dépôts, et non l’inverse.',
        'Symétriquement, un remboursement détruit de la monnaie : la créance et le dépôt disparaissent ensemble. La masse monétaire d’une économie est donc essentiellement le stock net de crédit bancaire en cours, ce qui explique pourquoi les récessions sont souvent accompagnées d’une contraction monétaire — non par décision, mais parce que les remboursements excèdent les nouveaux prêts.',
        'L’ancienne présentation par le « multiplicateur » — la banque reçoit 100, garde 10 en réserve, prête 90, et ainsi de suite jusqu’à un total de 1 000 — décrit un enchaînement qui n’est pas celui de la pratique. Elle suppose que les réserves précèdent le crédit ; en réalité, la banque prête d’abord et se procure ensuite les réserves nécessaires au règlement, sur le marché interbancaire ou auprès de la banque centrale.',
      ],
    },
    {
      titre: 'Alors qu’est-ce qui limite la création monétaire ?',
      paragraphes: [
        'Quatre contraintes, dont aucune n’est le stock de dépôts existants. La première est la rentabilité : un prêt n’est accordé que s’il rapporte plus que son coût de financement et son risque anticipé. La deuxième est la demande : il faut des emprunteurs solvables qui souhaitent s’endetter, ce qui manque précisément dans les récessions.',
        'La troisième, et la plus contraignante aujourd’hui, est réglementaire : les accords de Bâle imposent aux banques de détenir des fonds propres en proportion de leurs actifs pondérés par le risque. C’est le capital, non les réserves, qui plafonne l’expansion du crédit. Les réserves obligatoires, longtemps présentées comme le levier central, ont été réduites à zéro aux États-Unis en mars 2020 et sont fixées à 1 % dans la zone euro.',
        'La quatrième est le taux directeur, qui agit sur le coût du refinancement et donc sur les deux premières contraintes. C’est par ce canal indirect que la banque centrale influence la création monétaire : elle ne la décide pas, elle en modifie le prix.',
      ],
    },
    {
      titre: 'L’assouplissement quantitatif, et pourquoi il n’a pas produit l’inflation attendue',
      paragraphes: [
        'Lorsqu’une banque centrale achète des titres, elle crédite le compte de réserve de la banque vendeuse : elle crée des réserves, c’est-à-dire de la monnaie de banque centrale. Beaucoup en ont déduit en 2009 qu’une inflation massive était inévitable. Elle ne s’est pas produite pendant plus d’une décennie.',
        'La raison tient à la distinction précédente. Les réserves ne circulent pas dans l’économie réelle : elles ne servent qu’aux règlements entre banques. Elles ne deviennent de la monnaie au sens large que si les banques prêtent davantage — ce qu’elles n’ont pas fait, faute de demande solvable et en reconstituant leurs fonds propres. L’épisode inflationniste de 2021-2023 a eu d’autres moteurs principaux : ruptures d’offre, rebond brutal de la demande, et surtout transferts budgétaires directs aux ménages, qui, eux, créent du pouvoir d’achat immédiat.',
      ],
    },
    {
      titre: 'La fragilité intrinsèque, et ses remèdes',
      paragraphes: [
        'Une banque transforme des dépôts exigibles à tout moment en crédits immobilisés pour des années. Cette transformation d’échéances est son utilité économique et sa faiblesse structurelle : aucune banque solvable ne peut rembourser tous ses déposants simultanément. D’où les paniques bancaires, dont la logique est parfaitement rationnelle au niveau individuel.',
        'Les remèdes historiques sont l’assurance des dépôts, le prêteur en dernier ressort et la supervision prudentielle. Ils fonctionnent, mais les paniques modernes sont plus rapides : en mars 2023, la Silicon Valley Bank a perdu environ 42 milliards de dollars de dépôts en une seule journée, la rumeur circulant par messagerie instantanée et les virements s’effectuant en quelques clics.',
        'Des propositions radicales reviennent périodiquement : interdire la création monétaire privée en imposant une couverture intégrale des dépôts, idée déjà formulée dans le « plan de Chicago » de 1933. Les électeurs suisses l’ont rejetée à environ 75 % lors du référendum « monnaie pleine » de juin 2018. L’objection principale est qu’une telle réforme transférerait à l’État la décision d’allouer le crédit, ce qui déplace le problème plus qu’il ne le résout.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la plupart des débats publics sur la monnaie sont faussés par le modèle erroné. « L’État n’a pas d’argent, il faut le trouver quelque part » et « les banques prêtent l’épargne des déposants » sont deux affirmations qui décrivent mal le fonctionnement réel du système, et qui orientent mal les conclusions.',
        'Parce que la vraie question devient alors politiquement plus intéressante : puisque la monnaie est créée par des entreprises privées en fonction de leur appréciation du risque, c’est le secteur bancaire qui arbitre de fait entre les usages financés — immobilier, consommation, industrie, transition énergétique. Savoir cela permet de discuter sérieusement des instruments qui orientent cette allocation, plutôt que de s’en étonner.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_interet_compose: [
    {
      titre: 'La différence entre additionner et multiplier',
      paragraphes: [
        'Avec un intérêt simple, on gagne chaque année un pourcentage du capital initial. Avec un intérêt composé, on gagne un pourcentage du capital augmenté des intérêts déjà perçus. La différence paraît mineure sur un an et devient décisive sur trente : 1 000 unités placées à 7 % rapportent 70 par an en intérêt simple, soit 3 100 au bout de trente ans ; en intérêt composé, le capital atteint environ 7 600.',
        'La formule est C × (1 + t)ⁿ. L’essentiel est dans l’exposant : le rendement compte, mais la durée compte davantage, parce qu’elle agit en puissance et non en proportion. C’est pourquoi le paramètre le plus précieux d’un plan d’épargne n’est pas le placement choisi, mais l’âge auquel on commence.',
      ],
    },
    {
      titre: 'Deux règles de calcul mental qui suffisent',
      paragraphes: [
        'La règle de 72 : pour savoir en combien d’années un capital double, divisez 72 par le taux annuel en pourcentage. À 6 %, un capital double en douze ans ; à 9 %, en huit ans. L’approximation est excellente pour des taux compris entre 4 et 12 %.',
        'La règle du rendement réel : ce qui compte est le rendement diminué de l’inflation. Un placement à 5 % dans une économie à 4 % d’inflation enrichit de 1 % par an, pas de 5 %. C’est la raison pour laquelle un compte d’épargne réglementé peut appauvrir lentement son détenteur sans jamais afficher de perte.',
      ],
    },
    {
      titre: 'Les chiffres qui rendent le mécanisme tangible',
      paragraphes: [
        'La fortune de Warren Buffett illustre l’effet de la durée : l’essentiel de son patrimoine a été accumulé après ses cinquante ans, non parce que ses rendements se sont améliorés, mais parce que la base sur laquelle ils s’appliquaient était devenue grande. Il investit depuis l’âge de onze ans ; c’est cette longueur, plus que le talent de sélection, qui produit les derniers ordres de grandeur.',
        'Autre comparaison, plus utile : deux personnes placent 100 par mois au même taux de 7 %. La première commence à 25 ans et arrête à 35, soit dix ans de versements ; la seconde commence à 35 ans et verse jusqu’à 65 ans, soit trente ans. À 65 ans, la première a souvent un capital comparable ou supérieur à celui de la seconde, avec trois fois moins d’argent versé. La différence est entièrement due au temps laissé aux premiers versements.',
        'Les rendements réels de long terme, établis sur plus d’un siècle par les travaux de Dimson, Marsh et Staunton, tournent autour de 5 % par an pour les actions des grandes économies, une fois l’inflation retirée. C’est l’ordre de grandeur raisonnable à retenir — ni les 15 % promis par un vendeur, ni le zéro supposé par la prudence excessive.',
      ],
    },
    {
      titre: 'Le même mécanisme, retourné contre soi',
      paragraphes: [
        'L’intérêt composé s’applique aux dettes avec la même force. Un découvert ou un crédit renouvelable à 20 % par an double la somme due en moins de quatre ans si rien n’est remboursé. Les dettes de consommation à taux élevé sont, mathématiquement, le placement à rendement garanti le plus rentable qui existe — en les remboursant.',
        'Les frais fonctionnent également en composé, et c’est l’erreur la plus coûteuse en pratique. Un placement à 7 % assorti de 2 % de frais annuels ne rend pas 7 % moins un peu : il rend 5 % composés, ce qui, sur trente ans, ampute le capital final de plus d’un tiers par rapport au même placement à 0,2 % de frais. Cette soustraction discrète explique une grande partie de l’écart entre les performances affichées par les fonds et ce que touche réellement l’épargnant.',
      ],
    },
    {
      titre: 'Le versement régulier, et le risque de séquence',
      paragraphes: [
        'La formule suppose un rendement constant. En pratique il varie, et l’ordre dans lequel les bonnes et les mauvaises années se présentent modifie le résultat : c’est le risque de séquence. Il est presque indifférent pendant la phase d’accumulation, et décisif au moment où l’on commence à retirer. Deux retraités ayant obtenu le même rendement moyen sur vingt ans peuvent finir l’un avec un capital intact, l’autre ruiné, selon que la mauvaise décennie est arrivée en premier ou en second.',
        'Le versement régulier d’une somme fixe atténue ce risque pendant l’accumulation, par un mécanisme arithmétique simple : à montant constant, on achète mécaniquement plus de parts quand les prix sont bas et moins quand ils sont hauts. Le prix moyen payé est donc inférieur à la moyenne des prix de la période. Ce n’est pas une technique de marché, c’est une conséquence de la moyenne harmonique, et elle ne demande aucune prévision.',
        'Son avantage réel est cependant comportemental plus que mathématique. Un versement automatique retire la décision au moment où elle est la plus difficile à bien prendre — après une baisse. Les études sur les comportements d’épargnants montrent régulièrement que l’écart entre le rendement des fonds et celui effectivement obtenu par leurs détenteurs vient des entrées et sorties au mauvais moment, pas du choix des supports.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est le seul mécanisme financier dont la maîtrise est à la portée de tous et dont l’effet est considérable. Il n’exige ni information privilégiée, ni talent particulier, ni capital de départ important : il exige de commencer tôt, de verser régulièrement, de minimiser les frais et de ne pas interrompre.',
        'Parce que l’intuition humaine est linéaire et se trompe systématiquement sur les processus exponentiels. C’est le même biais qui fait sous-estimer une épidémie à ses débuts, la progression d’une dette, ou l’effet de trois ans de retard sur un plan d’épargne. Se forcer à calculer plutôt qu’à estimer est ici un avantage durable.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_private_equity: [
    {
      titre: 'Deux métiers qu’on confond souvent',
      paragraphes: [
        'Le capital-investissement, ou "private equity", consiste à acheter des entreprises non cotées, à les transformer pendant quelques années, puis à les revendre. Le capital-risque, ou "venture capital", consiste à financer des entreprises naissantes en échange d’une participation minoritaire. Les deux prennent des participations hors Bourse, mais leurs mécanismes, leurs risques et leurs métiers sont différents.',
        'Le point commun est la structure juridique : un fonds levé auprès d’investisseurs institutionnels — fonds de pension, assureurs, fonds souverains, grandes fortunes — avec une durée de vie d’environ dix ans, géré par une société de gestion qui décide des investissements.',
      ],
    },
    {
      titre: 'Le rachat avec effet de levier',
      paragraphes: [
        'L’opération emblématique du capital-investissement est le LBO, rachat financé principalement par de la dette. Le principe : acheter une entreprise pour 100 en apportant 30 de fonds propres et 70 empruntés, la dette étant remboursée par les flux de trésorerie de l’entreprise elle-même. Si l’entreprise est revendue 130 quelques années plus tard, la dette ayant été réduite à 40, les fonds propres passent de 30 à 90 : un triplement, pour une valeur d’entreprise qui n’a progressé que de 30 %.',
        'Le levier amplifie donc les rendements — et les pertes. Une entreprise chargée de dette supporte mal un retournement de son marché ou une hausse des taux. Le cas le plus documenté est celui du distributeur américain de jouets Toys « R » Us, racheté en 2005 dans une opération à forte dette et placé en faillite en 2017 : la charge d’intérêts avait absorbé les moyens qui auraient permis d’affronter la concurrence du commerce en ligne.',
        'L’acte de naissance de l’industrie est le rachat de RJR Nabisco en 1988-1989 par KKR pour environ 25 milliards de dollars, alors la plus grosse opération de l’histoire, racontée dans "Barbarians at the Gate". KKR avait été fondée en 1976 ; les grands acteurs actuels — Blackstone, Apollo, Carlyle, EQT — gèrent aujourd’hui chacun des centaines de milliards.',
      ],
    },
    {
      titre: 'La rémunération, et le débat sur les rendements',
      paragraphes: [
        'La structure classique est dite « 2 et 20 » : 2 % de frais de gestion annuels sur les montants engagés, et 20 % des plus-values au-delà d’un rendement minimal, ce qu’on appelle le "carried interest". Cette part de plus-value est, dans plusieurs pays, imposée comme un gain en capital et non comme un revenu du travail, ce qui constitue l’un des sujets fiscaux les plus disputés de la finance.',
        'Les rendements affichés par le secteur sont élevés, mais leur mesure est contestée. Les travaux de Ludovic Phalippou, notamment, montrent que la comparaison avec les marchés cotés est souvent flattée par l’indicateur utilisé — le taux de rendement interne, sensible au calendrier des flux — et que les performances nettes de frais, comparées à un indice de petites capitalisations à effet de levier équivalent, sont beaucoup moins exceptionnelles qu’annoncé. Le débat n’est pas tranché, mais il est suffisamment sérieux pour qu’on lise avec méfiance toute performance présentée en TRI.',
        'Le secteur pose aussi un problème de valorisation : les actifs non cotés sont évalués par les gérants eux-mêmes, selon des méthodes dont la prudence varie. En période de baisse des marchés cotés, les portefeuilles non cotés se déprécient plus tard et moins fort, ce qui améliore artificiellement les statistiques de risque.',
      ],
    },
    {
      titre: 'Le capital-risque et sa loi de puissance',
      paragraphes: [
        'Le capital-risque obéit à une logique statistique très différente. Sur dix participations, la majorité ne rendra rien ou presque, quelques-unes rendront le capital investi, et une seule produira l’essentiel du rendement du fonds. Cette distribution en loi de puissance dicte tout le comportement du métier : on cherche les entreprises capables de croître cent fois, pas celles qui ont la plus forte probabilité de réussir modestement.',
        'L’écosystème s’est formé dans la vallée de Santa Clara à partir des années 1960-1970, avec la fondation de Sequoia et de Kleiner Perkins en 1972, puis s’est structuré avec l’apparition des accélérateurs, dont Y Combinator en 2005. Il finance aujourd’hui la quasi-totalité des entreprises technologiques devenues dominantes, ce qui donne à quelques dizaines de sociétés de gestion une influence considérable sur les technologies qui existeront.',
        'En Afrique, le capital-risque est jeune mais réel : les levées annuelles sur le continent sont passées de quelques centaines de millions de dollars au milieu des années 2010 à plusieurs milliards au pic de 2021-2022, concentrées sur le Nigeria, l’Égypte, le Kenya et l’Afrique du Sud, et majoritairement dans les services financiers numériques. Le repli de 2023-2024 a suivi celui du marché mondial.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la part de l’économie détenue hors Bourse a fortement augmenté : les entreprises restent privées plus longtemps, et la richesse créée pendant leur phase de croissance la plus rapide échappe désormais largement à l’épargnant qui n’a accès qu’aux marchés cotés. C’est un changement de structure du capitalisme, pas seulement une mode financière.',
        'Parce que ces fonds sont propriétaires d’entreprises qui emploient des millions de personnes, y compris dans des secteurs sensibles — cliniques, maisons de retraite, crèches, logement. Comprendre comment un LBO produit son rendement permet de poser la bonne question devant ces cas : ce qui est optimisé, et sur quel horizon.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_bulles_speculatives: [
    {
      titre: 'Ce qu’est une bulle, et comment la reconnaître trop tard',
      paragraphes: [
        'Une bulle est une hausse de prix qui se nourrit d’elle-même : on achète non parce que l’actif rapportera, mais parce qu’il montera, et il monte parce qu’on l’achète. Le problème pratique est qu’une bulle ne se distingue d’une revalorisation justifiée qu’après son éclatement — beaucoup de hausses qualifiées de bulles à l’époque étaient de justes anticipations, et inversement.',
        'Charles Kindleberger, dans "Manias, Panics and Crashes", propose une séquence en cinq temps qui se vérifie avec une régularité troublante : un déplacement — innovation, déréglementation, baisse des taux — ouvre une perspective de gains nouvelle ; le crédit s’étend ; l’euphorie attire des acteurs sans compétence particulière ; les initiés commencent à sortir ; puis vient la panique et la course à la liquidité. Hyman Minsky en a tiré une conclusion plus dérangeante : la stabilité elle-même engendre l’instabilité, parce qu’une période calme incite à prendre davantage de risque avec davantage de dette.',
      ],
    },
    {
      titre: 'La tulipomanie, et ce que l’histoire réelle enseigne',
      paragraphes: [
        'L’épisode hollandais de 1636-1637, où des bulbes de tulipes rares se seraient échangés au prix d’une maison, est l’exemple invoqué partout. Les travaux de l’historienne Anne Goldgar ont sérieusement révisé le tableau : les prix extravagants concernaient un petit nombre de bulbes d’exception et un cercle étroit de connaisseurs aisés, les contrats étaient souvent des promesses à terme jamais exécutées, et l’effondrement n’a pas ruiné l’économie néerlandaise, qui a continué de prospérer.',
        'La leçon est double. D’abord, un récit de bulle spectaculaire mérite d’être vérifié, car il se transmet mieux quand il est exagéré. Ensuite, la véritable gravité d’une bulle ne dépend pas de l’ampleur de la hausse mais de la quantité de dette bancaire qui y est adossée. Une bulle payée comptant ruine des spéculateurs ; une bulle financée à crédit emporte le système de paiement.',
      ],
    },
    {
      titre: 'Trois bulles à effet de levier',
      paragraphes: [
        'Les bulles jumelles de 1720 en sont la démonstration ancienne : la Compagnie des Mers du Sud à Londres et le système de John Law à Paris reposaient toutes deux sur un montage où de la dette publique était échangée contre des actions d’une compagnie coloniale, avec émission monétaire à l’appui. L’effondrement a ruiné des milliers d’épargnants et durablement discrédité le papier-monnaie en France. Isaac Newton, qui y perdit une fortune, aurait constaté qu’il savait calculer le mouvement des astres mais non la folie des hommes.',
        'La bulle japonaise de la fin des années 1980 associe immobilier et actions dans une spirale de garanties croisées : les terrains montent, servent de collatéral à des crédits qui achètent des actions et d’autres terrains. L’indice Nikkei culmine le 29 décembre 1989 à 38 957 points. Il mettra plus de trente ans à retrouver ce niveau, et le pays entrera dans deux décennies de stagnation et de déflation — la « décennie perdue », en réalité plus longue.',
        'La bulle des valeurs Internet est plus pure, car moins endettée. L’indice Nasdaq atteint 5 048 points le 10 mars 2000 et perd environ 78 % jusqu’en octobre 2002. Le point remarquable est que le récit de fond était juste : Internet a bien transformé l’économie. Ce qui était faux, c’était le prix, et l’idée que les gagnants seraient les entreprises cotées en 1999. Une bonne histoire ne rend pas un prix raisonnable.',
      ],
    },
    {
      titre: 'Les signaux récurrents',
      paragraphes: [
        'Ils sont connus et se répètent : l’arrivée massive de particuliers sans expérience, la justification par un changement de paradigme qui rendrait les mesures classiques obsolètes, la multiplication des montages à levier accessibles au détail, la transformation d’une classe d’actifs en sujet de conversation courante, et la disparition du scepticisme — quand quelqu’un qui met en garde est considéré comme n’ayant simplement pas compris.',
        'Le plus fiable reste cependant le crédit. Carmen Reinhart et Kenneth Rogoff, dans "This Time Is Different", ont montré sur huit siècles que les crises financières graves sont presque toujours précédées d’une expansion rapide du crédit privé rapporté au PIB. C’est l’indicateur le moins spectaculaire et le plus prédictif.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’il est très probable que vous assistiez à plusieurs bulles au cours de votre vie d’épargnant, et que chacune sera présentée comme différente des précédentes. Connaître la séquence ne permet pas de prédire la date de l’éclatement — personne n’y parvient de manière répétée — mais permet de ne pas engager une somme dont la perte serait grave.',
        'Parce que la leçon la plus utile est peut-être négative : « avoir raison trop tôt » est financièrement équivalent à avoir tort. Ceux qui ont vendu en 1997 ou en 2005 avaient identifié le problème, et ont manqué des années de hausse. D’où la règle pratique que les bulles rendent visible : raisonner en répartition et en horizon de temps plutôt qu’en prédiction de retournement.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  econ_subprimes: [
    {
      titre: 'Le point de départ : un crédit qui ne regarde plus l’emprunteur',
      paragraphes: [
        'Un crédit "subprime" est un prêt immobilier accordé à un emprunteur dont le profil ne satisfait pas les critères habituels de solvabilité. Ce segment existait de longue date aux États-Unis, mais il gonfle brutalement au milieu des années 2000 pour atteindre environ un cinquième des nouveaux prêts immobiliers en 2005-2006. Beaucoup de ces prêts comportent un taux d’appel très bas les deux ou trois premières années, puis une révision qui double parfois la mensualité.',
        'Le changement décisif est ailleurs : dans le modèle d’affaires. Le prêteur qui accorde le crédit ne le conserve pas. Il le revend, le crédit est regroupé avec des milliers d’autres dans un véhicule qui émet des titres, et ces titres sont vendus à des investisseurs du monde entier. La conséquence est immédiate : celui qui décide d’accorder le prêt ne supporte pas le risque de non-remboursement. Il est rémunéré au volume.',
      ],
    },
    {
      titre: 'La machine à transformer du risque en AAA',
      paragraphes: [
        'La titrisation découpe le flux de remboursements en tranches de priorité. Les tranches supérieures ne subissent de perte qu’après épuisement des tranches inférieures, ce qui permet de leur attribuer la meilleure notation, AAA, alors que le portefeuille sous-jacent est de mauvaise qualité. L’opération est mathématiquement valide — à une condition, qui était fausse : que les défauts soient peu corrélés entre eux.',
        'Or les prix immobiliers américains montaient partout en même temps, et pouvaient donc baisser partout en même temps. Quand cela s’est produit, les défauts sont survenus simultanément dans tout le portefeuille, et les tranches réputées sûres ont été touchées.',
        'Deux amplificateurs ont aggravé le tout. Les CDO, qui titrisaient des tranches d’autres titrisations, empilant l’opacité sur l’opacité. Et les CDS, contrats d’assurance contre le défaut, vendus en volumes sans rapport avec les encours assurés, et notamment par un assureur unique, AIG, qui n’avait provisionné presque rien. Les agences de notation, payées par les émetteurs qu’elles notaient, ont accordé des AAA à grande échelle : ce conflit d’intérêts est l’un des points les plus nettement établis par les enquêtes ultérieures.',
      ],
    },
    {
      titre: 'L’enchaînement, de 2006 à septembre 2008',
      paragraphes: [
        'Les prix immobiliers américains atteignent leur sommet au milieu de 2006 et commencent à reculer. Les défauts montent dès 2007, les premiers fonds adossés à ces titres ferment à l’été 2007, et le marché du financement à court terme se grippe : les banques cessent de se prêter entre elles, ne sachant pas qui détient quoi.',
        'En mars 2008, Bear Stearns est reprise en urgence par JPMorgan avec le soutien de la Réserve fédérale. Le 7 septembre, les organismes hypothécaires Fannie Mae et Freddie Mac sont placés sous tutelle publique. Le 15 septembre 2008, Lehman Brothers dépose la plus grande faillite de l’histoire des États-Unis, avec plus de 600 milliards de dollars de dettes — et cette fois sans sauvetage. Le lendemain, AIG est nationalisée de fait pour 85 milliards de dollars.',
        'Le blocage est alors total : les marchés monétaires, où les entreprises se financent au jour le jour, cessent de fonctionner. Le Congrès rejette d’abord le plan de sauvetage le 29 septembre — le Dow perd 777 points dans la journée — puis l’adopte le 3 octobre sous la forme du TARP, doté de 700 milliards de dollars.',
      ],
    },
    {
      titre: 'Le coût réel',
      paragraphes: [
        'Aux États-Unis, le chômage passe d’environ 4,5 % à 10 % en octobre 2009 ; plusieurs millions de logements font l’objet d’une procédure de saisie sur la décennie. La crise se propage au monde entier par le canal bancaire et par l’effondrement du commerce : le PIB mondial recule en 2009, pour la première fois depuis la Seconde Guerre mondiale.',
        'En Europe, elle se prolonge en crise des dettes souveraines à partir de 2010, parce que les sauvetages bancaires ont transféré la dette privée vers les États et parce que la zone euro n’avait pas de mécanisme de prêteur en dernier ressort pour ses membres. Grèce, Irlande, Portugal, Espagne, Chypre : la séquence dure jusqu’au milieu des années 2010, avec des coûts sociaux durables.',
        'Les réponses réglementaires sont substantielles : loi Dodd-Frank aux États-Unis en juillet 2010, accords de Bâle III relevant fortement les exigences de fonds propres et de liquidité, tests de résistance réguliers, encadrement de la titrisation, mécanismes de résolution bancaire pour éviter le choix entre faillite et sauvetage public.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le mécanisme central — dissocier celui qui décide du risque et celui qui le porte — n’est pas propre à l’immobilier américain. Il réapparaît partout où une chaîne d’intermédiaires est rémunérée au volume, et c’est la première question à poser devant n’importe quel montage financier : qui perd de l’argent si cela tourne mal ?',
        'Parce que la crise a durablement déplacé le débat politique. La perception que les pertes avaient été socialisées tandis que les gains étaient restés privés a nourri une méfiance envers les institutions financières et les élites économiques dont les effets politiques, dans la décennie suivante, ont largement dépassé le champ de la finance.',
        'Parce qu’elle rappelle enfin que la complexité n’est pas la sécurité. Les modèles de risque les plus sophistiqués du monde ont validé ces montages, en s’appuyant sur des historiques qui ne contenaient aucune baisse nationale des prix immobiliers. Un modèle ne peut pas voir ce qui n’est jamais arrivé dans ses données.',
      ],
    },
  ],
};
