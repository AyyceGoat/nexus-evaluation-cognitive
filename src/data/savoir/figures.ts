import type { ArticlesDuDomaine } from './types';

/**
 * Articles du domaine « Figures légendaires ».
 *
 * Une biographie de vulgarisation glisse facilement vers l'hagiographie : on
 * retient les réussites, on arrondit les dates, on efface ce qui dérange. La
 * règle suivie ici est l'inverse. Chaque article dit ce que la personne a
 * effectivement accompli, par quel mécanisme, et ce que son bilan comporte de
 * lourd — y compris quand c'est incommode. Une figure dont on a retiré les
 * contradictions n'enseigne plus rien.
 */
export const articlesFigures: ArticlesDuDomaine = {
  /* ═════════════════════════════════════════════════════════════════════ */
  fig_leonard_de_vinci: [
    {
      titre: 'Un enfant illégitime devenu apprenti',
      paragraphes: [
        'Léonard naît en 1452 près du village de Vinci, fils naturel d’un notaire et d’une paysanne. Cette illégitimité lui interdit la profession de son père et l’université ; elle le dirige vers l’atelier. Il est placé vers quatorze ans chez Andrea del Verrocchio à Florence, l’un des meilleurs ateliers d’Europe, où l’on apprenait indistinctement la peinture, la sculpture, la fonte du bronze et la mécanique des machines de chantier.',
        'Il n’a donc reçu aucune formation savante et ne lisait pas le latin couramment — il l’a appris tard et seul. Il se qualifiait lui-même d’« homme sans lettres », avec un mélange de dépit et de revendication : sa méthode serait l’observation directe plutôt que l’autorité des Anciens. C’est un trait décisif pour comprendre ce qu’il a fait de différent.',
      ],
    },
    {
      titre: 'Les années de Milan, et le peu d’œuvres achevées',
      paragraphes: [
        'De 1482 à 1499, il est au service de Ludovic Sforza à Milan, comme peintre, ingénieur militaire et organisateur de fêtes. C’est là qu’il peint "La Cène", entre 1495 et 1498. Il refuse la fresque traditionnelle, qui impose de peindre vite sur enduit frais, et essaie une technique à sec permettant les retouches. L’œuvre commence à se dégrader de son vivant : la recherche de la perfection lui a coûté la conservation, ce qui résume un problème récurrent chez lui.',
        'On ne lui attribue qu’une quinzaine à une vingtaine de peintures, dont plusieurs inachevées. Le grand cheval de bronze commandé par Sforza, dont il fit un modèle en terre de sept mètres, ne fut jamais fondu — le bronze partit en canons. La bataille d’Anghiari, au Palazzo Vecchio, fut abandonnée. Il quitta Florence en laissant des commandes en plan, et sa réputation d’inconstance était établie chez ses contemporains.',
        '"La Joconde", entreprise vers 1503 et probablement retouchée jusqu’à la fin de sa vie, illustre l’autre versant : une technique de transitions imperceptibles, le "sfumato", obtenue par dizaines de couches translucides, qui ne pouvait pas résulter d’un travail rapide.',
      ],
    },
    {
      titre: 'Les carnets : un savoir qui n’a servi à personne',
      paragraphes: [
        'Il reste environ six mille pages de ses notes, probablement une fraction de ce qu’il a écrit. Elles mêlent sans séparation l’anatomie, l’hydraulique, l’optique, la botanique, la mécanique, des listes de courses et des devinettes. Il écrivait en miroir, de droite à gauche — probablement par commodité de gaucher plus que par secret.',
        'L’anatomie est son domaine le plus abouti. Il a pratiqué une trentaine de dissections humaines, décrit correctement le fonctionnement des valves cardiaques, dessiné un fœtus dans l’utérus avec une exactitude inégalée avant le XIXᵉ siècle, et compris que le cœur est un muscle et non un foyer de chaleur. Ses planches anatomiques sont supérieures à tout ce qui existait.',
        'Le point tragique est là : il n’a rien publié. Les carnets furent dispersés à sa mort entre plusieurs héritiers et collectionneurs, et l’essentiel ne fut étudié qu’à partir du XIXᵉ siècle. Ses découvertes anatomiques ont donc dû être refaites par d’autres, cinquante à trois cents ans plus tard. Il est l’exemple le plus net de ce que coûte le fait de ne pas transmettre : un savoir non diffusé n’a, historiquement, pas existé.',
      ],
    },
    {
      titre: 'Les machines, et ce qu’il faut en penser',
      paragraphes: [
        'Il a dessiné des machines volantes à ailes battantes, un appareil à vis proche d’un hélicoptère, un char blindé, un scaphandre, des métiers à tisser automatiques, des systèmes d’écluses. Presque rien n’a été construit, et la plupart de ces dispositifs n’auraient pas fonctionné : la source d’énergie manquait, et la puissance musculaire humaine est très insuffisante pour le vol battu.',
        'Cela n’enlève rien à la valeur de la démarche, mais il faut la qualifier correctement. Léonard n’a pas « inventé l’hélicoptère » : il a systématiquement analysé des problèmes mécaniques en décomposant les mouvements, ce qui est l’acte fondateur du dessin d’ingénieur. Ses études du vol des oiseaux, de la turbulence de l’eau et de la résistance des matériaux sont des travaux de mécanique appliquée, deux siècles avant que la discipline n’existe.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’il incarne une méthode plutôt qu’un palmarès : regarder soi-même, dessiner pour comprendre, décomposer un mouvement, refuser l’argument d’autorité. Cette méthode est devenue celle des sciences expérimentales, et le dessin analytique reste l’outil de base de l’ingénieur.',
        'Parce que son échec est instructif autant que son génie. Il a dispersé son effort, refusé de finir, négligé la publication, et son influence scientifique réelle sur son époque a été quasi nulle. Le mythe du génie universel dont tout découle est faux : ce qui transforme un savoir en progrès, c’est sa mise en circulation.',
        'Parce qu’il oblige enfin à distinguer deux choses que l’on confond volontiers : avoir compris quelque chose, et l’avoir établi. Léonard avait compris le mouvement du sang dans les valves cardiaques ; c’est William Harvey, en 1628, qui l’a établi, en publiant une démonstration que d’autres pouvaient reprendre et vérifier. La différence n’est pas d’intelligence, elle est de méthode — et c’est cette méthode, collective et publique, qui distingue la science de la perspicacité individuelle.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_napoleon_bonaparte: [
    {
      titre: 'Un officier d’artillerie dans une révolution',
      paragraphes: [
        'Napoleone Buonaparte naît à Ajaccio en 1769, un an après le rattachement de la Corse à la France. Petite noblesse locale, boursier des écoles militaires françaises, il choisit l’artillerie — arme technique, accessible sans grande naissance, et celle qui décidera de ses batailles.',
        'La Révolution lui ouvre une carrière que l’Ancien Régime lui aurait fermée. Il se distingue au siège de Toulon en 1793, obtient le grade de général de brigade à vingt-quatre ans, puis sauve la Convention en dispersant une insurrection royaliste à Paris en octobre 1795. La campagne d’Italie de 1796-1797, menée avec une armée mal équipée contre les Autrichiens, établit sa réputation : marches rapides, concentration des forces sur un point, batailles cherchées plutôt qu’évitées.',
        'L’expédition d’Égypte de 1798-1799 est un échec militaire — la flotte est détruite à Aboukir — mais un succès de communication, qu’il organise lui-même, et une entreprise scientifique majeure avec les 167 savants embarqués, dont les travaux fondent l’égyptologie. Il abandonne son armée et rentre pour prendre le pouvoir le 18 brumaire an VIII, soit le 9 novembre 1799.',
      ],
    },
    {
      titre: 'Le bâtisseur d’institutions',
      paragraphes: [
        'C’est la partie de son œuvre qui a duré le plus longtemps, et souvent la moins connue. Le Code civil, promulgué le 21 mars 1804, unifie un droit jusque-là éclaté entre coutumes du Nord et droit romain du Midi ; il consacre l’égalité civile, la propriété et la laïcité de l’état civil, tout en plaçant la femme mariée sous l’autorité de son mari. Il est encore la matrice des codes civils de dizaines de pays, en Europe, en Amérique latine, au Moyen-Orient et en Afrique francophone.',
        'S’y ajoutent la Banque de France en 1800, le franc germinal, les préfets, la Cour des comptes, les lycées, l’Université impériale, la Légion d’honneur, le Concordat de 1801 qui règle les rapports avec l’Église. Le point commun de ces créations est la centralisation administrative : un pouvoir qui nomme, contrôle et uniformise. L’architecture administrative française actuelle en descend directement.',
      ],
    },
    {
      titre: 'L’apogée militaire et la mécanique de la chute',
      paragraphes: [
        'Il se fait sacrer empereur le 2 décembre 1804. Un an plus tard, le 2 décembre 1805, Austerlitz est probablement sa bataille la mieux conduite : il feint la faiblesse sur son aile droite, attire l’adversaire, puis coupe le centre. Iéna, Friedland, Wagram suivent. En 1807, il domine le continent.',
        'Trois erreurs enchaînées défont cela. Le blocus continental, destiné à asphyxier le Royaume-Uni — dont la flotte était intouchable depuis Trafalgar en octobre 1805 —, ruine les ports du continent et rend l’occupation impopulaire partout. L’intervention en Espagne à partir de 1808 ouvre une guerre de guérilla qui immobilise des centaines de milliers d’hommes pendant six ans ; il l’appelait lui-même son « ulcère ». Enfin la campagne de Russie, en 1812 : environ six cent mille hommes entrent, moins de cent mille en reviennent, détruits par la stratégie de la terre brûlée, la dysenterie, le typhus et l’hiver plus que par les batailles.',
        'La coalition finit par apprendre à ne pas l’affronter en personne. Battu à Leipzig en octobre 1813, il abdique en avril 1814, revient de l’île d’Elbe pour cent jours, et perd définitivement à Waterloo le 18 juin 1815. Il meurt en captivité à Sainte-Hélène le 5 mai 1821.',
      ],
    },
    {
      titre: 'Le coût, qui appartient au bilan',
      paragraphes: [
        'Les guerres napoléoniennes ont causé, selon les estimations, entre trois et six millions de morts, militaires et civils. La conscription a pesé sur une génération entière ; les campagnes de 1813 et 1814 furent menées avec des adolescents.',
        'Le fait le plus lourd pour un lecteur francophone est le rétablissement de l’esclavage dans les colonies par la loi du 20 mai 1802, huit ans après son abolition par la Convention. L’expédition envoyée à Saint-Domingue pour rétablir l’ordre colonial fut anéantie par la résistance et la fièvre jaune, et aboutit à l’indépendance d’Haïti le 1ᵉʳ janvier 1804 — premier État né d’une révolte d’esclaves victorieuse. Toussaint Louverture, arrêté par traîtrise, mourut en captivité au fort de Joux en 1803. L’esclavage ne sera définitivement aboli en France qu’en 1848.',
        'À cela s’ajoutent un régime policier, la censure de la presse ramenée à quatre titres surveillés à Paris, et la confiscation d’une grande part des libertés politiques conquises en 1789. Le bilan est donc double et il faut le tenir entier : un législateur dont les codes survivent deux siècles, et un pouvoir personnel qui a fait reculer la liberté et rétabli la servitude.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que son héritage institutionnel structure encore la vie quotidienne de centaines de millions de personnes : le droit des contrats, le mariage civil, le cadastre, l’organisation administrative, le baccalauréat. Peu de vies ont laissé une empreinte administrative aussi durable.',
        'Parce que sa trajectoire est le cas d’étude classique du talent qui se détruit par l’absence de contrepoids. Aucune institution ne pouvait lui dire non, aucune n’a corrigé les décisions de 1808 et de 1812. C’est un argument empirique sur l’utilité des contre-pouvoirs, valable indépendamment de l’opinion qu’on a du personnage.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_winston_churchill: [
    {
      titre: 'Quarante ans d’échecs avant 1940',
      paragraphes: [
        'Winston Churchill (1874-1965) entre en politique en 1900, après une carrière d’officier et de correspondant de guerre marquée par une évasion spectaculaire pendant la guerre des Boers. Ce qui frappe dans son parcours, c’est la longue accumulation de revers.',
        'Premier lord de l’Amirauté en 1911, il porte l’expédition des Dardanelles en 1915 : un désastre qui coûte des dizaines de milliers de vies et son poste. Chancelier de l’Échiquier en 1925, il ramène la livre à l’étalon-or à sa parité d’avant-guerre, décision qui surévalue la monnaie, aggrave le chômage et la grève générale de 1926 — il la reconnaîtra plus tard comme sa plus grande erreur économique. Dans les années 1930, isolé sur les bancs de son propre parti, il est tenu pour un vétéran aigri.',
        'Sur un point, cet isolement lui donne raison. Il alerte sur le réarmement allemand quand la position dominante est l’apaisement, et il est l’un des rares à dénoncer les accords de Munich en 1938. Quand la guerre confirme le diagnostic, il devient le seul recours disponible.',
      ],
    },
    {
      titre: 'Mai 1940, le moment décisif',
      paragraphes: [
        'Il devient Premier ministre le 10 mai 1940, le jour où la Wehrmacht attaque à l’ouest. En quelques semaines, l’armée française s’effondre, le corps expéditionnaire britannique est évacué de Dunkerque, et le Royaume-Uni se retrouve seul face à l’Allemagne, sans allié continental et sans engagement américain.',
        'Le moment le plus important de sa carrière n’est pas un discours mais une décision prise en cabinet de guerre, fin mai 1940. Lord Halifax plaide pour explorer une médiation italienne afin de connaître les conditions d’une paix. Churchill refuse, au motif que négocier en position de faiblesse livrerait le pays. L’argument n’était pas évident : la plupart des observateurs jugeaient la situation britannique désespérée. C’est cette décision, plus que la rhétorique, qui a changé le cours de la guerre.',
        'Sa contribution propre fut ensuite double : maintenir la cohésion intérieure par la parole — ses discours de 1940 sont des actes politiques, non de l’ornement — et obtenir l’engagement américain, par la relation avec Roosevelt, le prêt-bail et la Charte de l’Atlantique.',
      ],
    },
    {
      titre: 'Ce que son bilan comporte de lourd',
      paragraphes: [
        'Churchill fut un impérialiste convaincu et ne s’en cachait pas : il considérait la domination britannique comme un bienfait et s’opposa toute sa vie à l’indépendance de l’Inde, dans des termes sur les Indiens et sur Gandhi qui sont documentés et indéfendables.',
        'Le dossier le plus grave est la famine du Bengale de 1943, qui a tué environ trois millions de personnes. Ses causes sont multiples — cyclone, chute des importations de riz birman après l’occupation japonaise, spéculation, défaillance des autorités provinciales — et les historiens continuent d’en discuter la part. Mais les décisions du gouvernement britannique sur les priorités de transport maritime et sur les exportations de céréales, ainsi que le refus initial d’une partie des offres d’aide, ont aggravé la crise, et les propos de Churchill lui-même sur ce sujet sont attestés. On peut soutenir que la guerre imposait des arbitrages et constater simultanément que ces arbitrages ont sacrifié une population coloniale.',
        'S’y ajoutent l’usage de la troupe contre des grévistes gallois en 1910, le soutien aux bombardements de zones urbaines allemandes, et le début de la répression de la révolte Mau Mau au Kenya sous son second mandat.',
      ],
    },
    {
      titre: 'Après la guerre',
      paragraphes: [
        'Il perd les élections de juillet 1945 quelques semaines après la victoire — les Britanniques voulaient un État social, non un chef de guerre. Il prononce en mars 1946 à Fulton le discours du « rideau de fer », qui formule publiquement la nouvelle ligne de partage du monde. Redevenu Premier ministre de 1951 à 1955, il reçoit le prix Nobel de littérature en 1953 pour son œuvre historique et ses discours.',
        'Un aspect moins connu de cette période mérite d’être signalé : en septembre 1946, à Zurich, il appelle à la construction d’une forme d’« États-Unis d’Europe » fondée sur une réconciliation franco-allemande. Il n’y incluait pas le Royaume-Uni, qu’il voyait en soutien plutôt qu’en membre — ambiguïté qui a nourri soixante-dix ans de débat britannique sur l’Europe, et que les deux camps citent encore à l’appui de leur position.',
        'Il faut enfin dire un mot de l’écrivain, puisque c’est ce qui lui a valu le Nobel. Il vivait de sa plume, produisait à un rythme industriel, et son histoire de la Seconde Guerre mondiale en six volumes a durablement fixé le récit du conflit — écrit par l’un de ses principaux acteurs, avec un accès aux documents que personne d’autre n’avait. C’est une source de premier ordre et un plaidoyer : les historiens l’utilisent en le sachant.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est le cas le plus net d’un homme dont les défauts — entêtement, goût du risque, certitude de savoir mieux — sont exactement les qualités qui ont compté au seul moment où il fallait refuser un consensus raisonnable. Le même caractère a produit les Dardanelles et le refus de négocier en 1940. On ne peut pas séparer les deux.',
        'Parce qu’il oblige aussi à tenir un jugement composite. Une personne peut avoir eu raison contre tous sur une question décisive et avoir défendu, sur une autre, des positions qui ont coûté des millions de vies. Refuser de simplifier ce genre de bilan est probablement l’exercice d’histoire le plus utile qu’on puisse faire.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_steve_jobs: [
    {
      titre: 'Ce qu’il faisait, puisqu’il n’était pas ingénieur',
      paragraphes: [
        'Steve Jobs (1955-2011) ne savait ni concevoir un circuit ni écrire un programme. Apple, fondée le 1ᵉʳ avril 1976, tenait sa technique de Steve Wozniak, dont l’Apple II fut l’un des ordinateurs personnels les mieux conçus de son temps. Comprendre ce que Jobs apportait à la place est la clé du personnage.',
        'Il faisait trois choses. Il décidait ce qui ne serait pas fait, en supprimant options, boutons, gammes et projets — sa contribution la plus systématique. Il exigeait que le matériel et le logiciel soient conçus ensemble, contre la doctrine dominante de l’industrie. Et il imposait un niveau de finition sur des détails que le marché ne réclamait pas, en tenant que la qualité perçue relève de milliers de décisions invisibles.',
      ],
    },
    {
      titre: 'L’éviction, et les douze années qui ont tout construit',
      paragraphes: [
        'La visite du centre de recherche Xerox à Palo Alto, en 1979, lui montre l’interface graphique, la souris et le fenêtrage, inventés là et non exploités. Le Macintosh de 1984 les porte au marché. Mais la machine est chère et lente, les ventes déçoivent, et le conflit avec le directeur général qu’il avait lui-même recruté aboutit à son départ d’Apple en 1985.',
        'Les années suivantes sont décisives, et souvent résumées trop vite. Il fonde NeXT, dont les machines se vendent mal mais dont le système d’exploitation, moderne et fondé sur Unix, reviendra chez Apple en 1997 pour devenir la base de tous ses systèmes actuels. Il rachète en 1986, pour cinq millions de dollars, la division informatique graphique de Lucasfilm : ce sera Pixar, et "Toy Story" en 1995, premier long métrage entièrement en images de synthèse. Financièrement, Pixar l’a enrichi bien plus qu’Apple à cette date.',
      ],
    },
    {
      titre: 'Le retour, et la séquence de produits',
      paragraphes: [
        'Il revient en 1997 dans une entreprise proche de la faillite. Il élague la gamme, accepte un investissement de Microsoft, et lance l’iMac en 1998. Puis vient une séquence rare : l’iPod en octobre 2001, le magasin iTunes en 2003, l’iPhone présenté le 9 janvier 2007, l’iPad en 2010.',
        'Aucun de ces objets n’était le premier de sa catégorie. Il existait des lecteurs de musique numériques, des téléphones intelligents et des tablettes. Ce qui a changé, c’est l’assemblage : un appareil, un logiciel, un magasin de contenus et un accord avec les industries concernées, formant un ensemble cohérent. L’iPhone a par ailleurs imposé aux opérateurs téléphoniques de renoncer au contrôle du logiciel embarqué, ce qui fut une bataille commerciale autant que technique, et ce qui a rendu possible l’économie des applications.',
        'Le magasin d’applications, ouvert en juillet 2008, est probablement sa conséquence la plus lourde, et il n’était pas prévu : Jobs s’était d’abord opposé à l’exécution de logiciels tiers sur le téléphone. Le dispositif a créé en quelques années une industrie entière, en permettant à un développeur isolé d’atteindre un marché mondial sans distributeur. Il a aussi installé un point de passage obligé, avec une commission et un droit de veto sur ce qui peut être installé, qui fait aujourd’hui l’objet de procédures de concurrence sur plusieurs continents et de législations spécifiques en Europe.',
        'Le prix payé par l’iTunes Store côté musique est du même ordre : il a sauvé une industrie ravagée par le téléchargement illégal en rendant l’achat légal plus simple que le piratage, tout en imposant le découpage des albums à la chanson et un prix unique, que les maisons de disques ont longtemps combattu.',
      ],
    },
    {
      titre: 'Le personnage, sans embellissement',
      paragraphes: [
        'Il était par de nombreux témoignages concordants dur, humiliant en public, capable de s’attribuer les idées des autres et de renvoyer un employé dans un ascenseur. Il a nié pendant des années la paternité de sa fille aînée, y compris devant un tribunal. Les conditions de travail chez ses sous-traitants asiatiques ont fait l’objet de scandales documentés.',
        'On lit souvent que cette brutalité était la condition de l’excellence. C’est un raisonnement fragile : elle a aussi fait partir des gens de valeur, et l’industrie compte des dirigeants aussi exigeants sans être cruels. Il est plus honnête de dire qu’il a réussi avec ce caractère plutôt que grâce à lui.',
        'Le fait le plus grave le concerne personnellement. Diagnostiqué en 2003 d’une tumeur neuroendocrine du pancréas — forme rare et beaucoup plus opérable que le cancer pancréatique habituel —, il a refusé la chirurgie pendant environ neuf mois au profit de régimes et de traitements alternatifs. Il a lui-même reconnu ensuite que ce retard avait probablement été déterminant. Il est mort le 5 octobre 2011, à cinquante-six ans.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que sa contribution la mieux transposable est une discipline de soustraction. Dans presque tout projet, la difficulté n’est pas de trouver quoi ajouter mais d’accepter de retirer. Il pratiquait cela comme une méthode, pas comme une esthétique.',
        'Parce qu’il illustre enfin que la valeur se déplace vers l’intégration. Ses concurrents fabriquaient des composants excellents assemblés par d’autres ; il a montré qu’en maîtrisant la chaîne complète — puce, système, magasin, boutique — on capte la marge et on contrôle l’expérience. C’est le modèle dominant de l’industrie depuis, avec les questions de concurrence que cela pose.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_elon_musk: [
    {
      titre: 'Le raisonnement par premiers principes',
      paragraphes: [
        'Elon Musk, né en 1971 à Pretoria, décrit sa méthode comme un raisonnement par premiers principes : au lieu de partir de ce qui se fait et de l’améliorer par comparaison, décomposer un problème jusqu’aux lois physiques et aux coûts de matière première, puis reconstruire.',
        'L’exemple qu’il cite lui-même est celui des batteries. Vers 2010, le prix courant tournait autour de 600 dollars par kilowattheure et l’industrie le tenait pour une donnée. En additionnant le coût des métaux constitutifs au cours des matières premières, on obtenait un ordre de grandeur bien inférieur. La conclusion n’était donc pas que les batteries sont chères, mais que la chaîne de production et d’intégration l’était — ce qui est un problème attaquable. La suite lui a donné raison : les prix ont été divisés par plus de cinq en une décennie.',
      ],
    },
    {
      titre: 'Les réalisations vérifiables',
      paragraphes: [
        'SpaceX, fondée en 2002, a atteint l’orbite avec sa première fusée en septembre 2008, après trois échecs qui avaient presque épuisé la trésorerie. Elle a réussi le premier retour et atterrissage vertical d’un étage orbital en décembre 2015, puis a fait de la réutilisation une routine. Elle a transporté des astronautes vers la Station spatiale en mai 2020, mettant fin à neuf ans de dépendance américaine aux lanceurs russes, et assure aujourd’hui la majorité des lancements orbitaux mondiaux. La baisse du coût d’accès à l’orbite est un fait industriel établi et considérable.',
        'Tesla, qu’il a rejointe en 2004 comme investisseur avant d’en prendre la direction en 2008, a rendu la voiture électrique désirable plutôt que subie, avec la Model S en 2012, puis a franchi la production de masse avec la Model 3 — au prix d’une crise industrielle qu’il a lui-même appelée « l’enfer de la production ». Son effet le plus important est indirect : c’est parce que Tesla a démontré un marché que l’ensemble des constructeurs mondiaux a engagé sa conversion.',
        'S’y ajoutent Starlink, qui apporte une connexion à haut débit là où aucune infrastructure terrestre n’existe, et un ensemble d’entreprises plus jeunes — Neuralink, Boring Company, xAI — dont les résultats sont à ce jour beaucoup moins établis.',
      ],
    },
    {
      titre: 'L’écart entre les annonces et les livraisons',
      paragraphes: [
        'Il est constant, documenté, et il fait partie du dossier. La conduite entièrement autonome est annoncée comme imminente depuis 2016 et n’est pas livrée ; les véhicules vendus avec cette promesse ne l’ont pas obtenue. Les calendriers de la Model 3, du camion Semi, du Cybertruck et de Starship ont tous glissé de plusieurs années. Une mission habitée vers Mars a été annoncée pour des dates successivement dépassées.',
        'Cet écart a eu des conséquences juridiques : en 2018, un message affirmant qu’un financement était « sécurisé » pour retirer Tesla de la Bourse a valu à l’entreprise et à lui-même une transaction avec l’autorité américaine des marchés, vingt millions de dollars chacun, et son retrait de la présidence du conseil.',
        'Deux lectures s’opposent, et les deux ont des arguments. La première considère ces annonces comme un instrument : elles mobilisent des équipes et des capitaux sur des objectifs que personne n’aurait financés en annonçant le calendrier réel. La seconde y voit des promesses vendues à des clients et à des investisseurs qui ont payé pour elles. Les deux peuvent être vraies simultanément.',
      ],
    },
    {
      titre: 'Les controverses',
      paragraphes: [
        'Les conditions de travail dans ses usines ont fait l’objet de plaintes et de condamnations, notamment sur la sécurité et sur des faits de discrimination. L’opposition à la syndicalisation a donné lieu à des procédures défavorables à l’entreprise.',
        'Le rachat de Twitter en octobre 2022 pour quarante-quatre milliards de dollars, suivi du licenciement de la majeure partie du personnel et d’une refonte de la modération, a fait chuter la valorisation de la plateforme et fait de son propriétaire un acteur politique de premier plan. Ses interventions publiques sur des sujets politiques, sanitaires et géopolitiques ont suscité des controverses répétées, et le fait qu’un même individu contrôle un réseau social, un opérateur de communications par satellite et le principal transporteur spatial occidental pose des questions de concentration qui sont légitimes indépendamment de ses opinions.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’il a démontré deux choses que l’on tenait pour impossibles : qu’une entreprise nouvelle pouvait concurrencer les agences spatiales étatiques, et qu’un constructeur automobile pouvait naître et survivre face aux groupes centenaires. Ces deux démonstrations ont modifié le comportement d’industries entières.',
        'Parce qu’il est aussi le cas d’étude le plus utile pour apprendre à séparer ce qui est livré de ce qui est annoncé. Faire cette séparation sur quelqu’un dont on admire une partie du travail, ou dont on rejette les prises de position, est un exercice d’honnêteté intellectuelle qui sert bien au-delà de ce dossier.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_warren_buffett: [
    {
      titre: 'Un investisseur, et une méthode apprise',
      paragraphes: [
        'Warren Buffett, né en 1930 à Omaha dans le Nebraska, achète sa première action à onze ans. Sa formation décisive est celle qu’il reçoit à l’université Columbia auprès de Benjamin Graham, l’auteur de "Security Analysis" et de "L’Investisseur intelligent", fondateur de l’analyse fondamentale.',
        'Graham lui enseigne deux idées qu’il n’abandonnera jamais. La première est la valeur intrinsèque : une action est une part d’entreprise, dont on peut estimer la valeur à partir de ses bénéfices et de ses actifs, indépendamment du prix coté. La seconde est la marge de sécurité : n’acheter qu’avec un écart suffisant entre cette valeur estimée et le prix payé, parce que l’estimation peut être fausse.',
      ],
    },
    {
      titre: 'Le tournant, et le rôle de Munger',
      paragraphes: [
        'La méthode initiale de Graham consiste à acheter très bas des entreprises médiocres — ce que Buffett appelait les « mégots de cigare », dont il reste une bouffée gratuite. Elle fonctionne sur de petits montants et devient impraticable quand les sommes grandissent.',
        'Charlie Munger, son associé pendant plus de quarante ans, mort en novembre 2023, l’a convaincu de changer de critère : il vaut mieux payer un prix raisonnable pour une entreprise excellente qu’un prix dérisoire pour une entreprise médiocre. Le critère devient la qualité durable du modèle d’affaires, résumé par la notion de « douve » — un avantage concurrentiel défendable : une marque que personne ne peut recréer, un coût structurellement plus bas, un effet de réseau, un coût de changement élevé pour le client.',
        'Les acquisitions de See’s Candies en 1972 et la prise de participation dans Coca-Cola en 1988 illustrent ce virage. Berkshire Hathaway, à l’origine une filature textile rachetée à partir de 1965 et dont l’activité industrielle a fini par disparaître, devient le véhicule de cette stratégie.',
      ],
    },
    {
      titre: 'Le mécanisme que les résumés omettent',
      paragraphes: [
        'La performance de Berkshire est réelle : une progression de la valeur comptable par action de l’ordre de 19 à 20 % par an entre 1965 et le début des années 2020, contre environ 10 % pour l’indice large américain, dividendes compris. Sur soixante ans, cet écart annuel produit une différence de facteur plusieurs milliers.',
        'Mais l’explication courante — « il choisit bien les actions » — est incomplète. Une étude académique de référence, "Buffett’s Alpha", publiée par Frazzini, Kabiller et Pedersen, décompose cette performance et identifie deux moteurs. D’abord un biais systématique vers les entreprises de qualité, peu volatiles et raisonnablement valorisées, qui constitue effectivement une stratégie gagnante sur longue période. Ensuite, et c’est le point décisif, un effet de levier d’environ 1,6 pour 1, obtenu à un coût exceptionnellement faible grâce au « flottant » des activités d’assurance : les primes encaissées avant le paiement des sinistres constituent un capital utilisable, parfois à coût négatif.',
        'Autrement dit, Buffett a appliqué une bonne stratégie avec le financement le moins cher du marché, pendant soixante ans. Cela ne diminue pas la performance ; cela explique pourquoi elle n’est pas reproductible par un particulier qui ne dispose pas d’une compagnie d’assurance.',
      ],
    },
    {
      titre: 'Ce qu’il conseille, et ce qu’il fait',
      paragraphes: [
        'Il y a chez lui un écart assumé entre son métier et son conseil. Il recommande publiquement aux particuliers d’acheter un fonds indiciel à frais réduits et de ne plus y toucher, et a inscrit cette instruction dans les dispositions testamentaires concernant sa succession. En 2007, il a parié qu’un tel fonds battrait sur dix ans un panier de fonds spéculatifs sélectionnés ; il a gagné avec un écart considérable.',
        'Ses formules les plus reprises condensent des règles de conduite : ne jamais investir dans une activité qu’on ne comprend pas ; considérer la volatilité du marché comme une occasion et non comme une information ; se méfier de l’activité — « le marché boursier est fait pour transférer l’argent des actifs vers les patients ». Il vit depuis 1958 dans la même maison, ce qui, chez quelqu’un dont le patrimoine dépasse la centaine de milliards de dollars, est une donnée biographique cohérente avec son discours.',
        'Il s’est engagé en 2010, avec Bill et Melinda Gates, dans le Giving Pledge, et a promis de céder la quasi-totalité de sa fortune à des fondations. Ses positions critiques sur la fiscalité des plus riches — constatant qu’il paie proportionnellement moins d’impôt que son assistante — sont documentées et constantes.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que sa méthode transposable ne relève pas de la finance mais du tempérament : définir son domaine de compétence et refuser tout ce qui en sort, agir rarement et fortement plutôt que souvent, et mesurer une décision sur des décennies. Ces trois règles s’appliquent bien au-delà du placement.',
        'Parce que son cas enseigne enfin à chercher le mécanisme derrière une performance exceptionnelle. Le flottant des assurances est la pièce que les biographies flatteuses omettent, et c’est précisément celle qui explique le plus. Devant n’importe quel succès remarquable, la bonne question est : quel avantage structurel, non reproductible, était en place ?',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_alan_turing: [
    {
      titre: 'L’article de 1936, qui invente l’ordinateur avant l’ordinateur',
      paragraphes: [
        'Alan Turing (1912-1954) publie à vingt-quatre ans un article intitulé « Sur les nombres calculables », en réponse à une question de logique posée par David Hilbert : existe-t-il une procédure mécanique permettant de décider si un énoncé mathématique est démontrable ?',
        'Pour répondre, il lui faut d’abord définir ce que signifie « procédure mécanique ». Il imagine pour cela une machine abstraite : un ruban infini divisé en cases, une tête qui lit et écrit un symbole, et une table finie d’instructions indiquant quoi faire selon le symbole lu et l’état courant. Cette construction, la machine de Turing, capture la notion de calcul de manière si générale qu’elle est restée la définition de référence.',
        'Le résultat qu’il en tire est négatif et fondamental : il n’existe pas d’algorithme capable de déterminer, pour tout programme et toute entrée, si ce programme finira par s’arrêter. C’est le problème de l’arrêt, et son indécidabilité pose une limite absolue à ce que tout ordinateur, présent ou futur, quelle que soit sa puissance, pourra jamais calculer. L’informatique théorique naît de cet article, dix ans avant la première machine électronique.',
      ],
    },
    {
      titre: 'Bletchley Park',
      paragraphes: [
        'Pendant la guerre, Turing travaille au centre de déchiffrement britannique de Bletchley Park, où il dirige la section chargée du chiffre Enigma de la marine allemande — le plus difficile, et celui dont dépendait la bataille de l’Atlantique et donc le ravitaillement du Royaume-Uni.',
        'Sa contribution principale est méthodologique. Avec Gordon Welchman, il conçoit la « Bombe », machine électromécanique qui teste massivement les configurations possibles en exploitant non pas la force brute mais les contradictions logiques : la machine élimine les réglages incompatibles avec un fragment de texte supposé. Il développe aussi une méthode statistique, dite Banburismus, pour réduire l’espace de recherche par le calcul de vraisemblances.',
        'Une précision de rigueur : Colossus, souvent attribué à Turing, est l’œuvre de Tommy Flowers et Max Newman, et visait un autre chiffre, celui des téléimprimeurs de haut commandement. Quant à l’impact global du déchiffrement, l’estimation communément citée — une guerre raccourcie d’environ deux ans — provient de l’historien officiel Harry Hinsley ; c’est une estimation raisonnée, pas une mesure.',
      ],
    },
    {
      titre: 'L’intelligence des machines, et la morphogenèse',
      paragraphes: [
        'En 1950, il publie « Les machines peuvent-elles penser ? ». Son apport est de refuser la question telle quelle, jugée trop dépendante des définitions, et de la remplacer par une épreuve opérationnelle : un examinateur dialogue par écrit avec un humain et une machine sans savoir lequel est lequel ; si la machine n’est pas distinguable, il faut lui reconnaître ce qu’on reconnaît à l’humain. L’article anticipe et réfute une à une neuf objections, dont l’argument religieux et celui de la conscience.',
        'Son dernier travail, publié en 1952, est d’une tout autre nature et souvent ignoré : un modèle mathématique de la morphogenèse, expliquant comment des motifs réguliers — taches, rayures, disposition des feuilles — peuvent émerger spontanément d’un système chimique homogène par la combinaison de réaction et de diffusion. Le mécanisme, resté théorique de son vivant, a été confirmé expérimentalement des décennies plus tard et fonde tout un champ de la biologie du développement.',
      ],
    },
    {
      titre: 'La condamnation',
      paragraphes: [
        'En 1952, après un cambriolage dont il signale lui-même les circonstances à la police, Turing est poursuivi pour « indécence grave » en raison de sa relation avec un homme, l’homosexualité étant alors un délit au Royaume-Uni. Condamné, il accepte, pour éviter la prison, un traitement hormonal à base d’œstrogènes dont les effets physiques et psychologiques furent lourds. Il perd son habilitation de sécurité et l’accès à ses travaux de cryptographie.',
        'Il meurt le 7 juin 1954, à quarante et un ans, d’un empoisonnement au cyanure. La conclusion officielle fut le suicide ; certains biographes évoquent l’hypothèse d’un accident lié à ses manipulations chimiques domestiques. Le gouvernement britannique a présenté des excuses officielles en 2009, une grâce royale a été accordée en 2013, et une loi de 2017 a étendu cette réhabilitation à des dizaines de milliers d’autres condamnés. Son portrait figure sur le billet de cinquante livres depuis 2021.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la totalité de l’informatique repose sur son cadre conceptuel. Tout langage de programmation, tout processeur, tout modèle d’intelligence artificielle est une machine de Turing en pratique, et se heurte aux limites qu’il a démontrées en 1936. Savoir que certaines questions sont non seulement difficiles mais démontrablement indécidables est l’un des résultats les plus profonds du siècle.',
        'Parce que sa fin est un rappel que le talent ne protège de rien. Un État a détruit l’un de ses plus grands scientifiques, à qui il devait une partie de sa survie, en application d’une loi qui punissait sa vie privée. C’est un argument concret, et non sentimental, en faveur de l’examen critique des normes que l’on tient pour évidentes.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_marie_curie: [
    {
      titre: 'De Varsovie à la Sorbonne',
      paragraphes: [
        'Maria Skłodowska naît en 1867 à Varsovie, dans une Pologne sous domination russe où l’université est fermée aux femmes. Elle suit d’abord les cours clandestins de l’« université volante », travaille plusieurs années comme préceptrice pour financer les études de sa sœur, puis arrive à Paris en 1891 et s’inscrit à la Sorbonne. Elle y vit dans un dénuement documenté par ses lettres, et sort première de sa promotion en physique.',
        'Elle épouse Pierre Curie en 1895. Leur collaboration est un cas rare d’égalité scientifique réelle : ils publient ensemble, et c’est elle qui choisit le sujet de recherche à partir duquel tout découlera.',
      ],
    },
    {
      titre: 'La découverte, et le travail qu’elle a coûté',
      paragraphes: [
        'En 1896, Henri Becquerel observe que des sels d’uranium émettent un rayonnement spontané. Marie Curie décide d’en faire son sujet de thèse et pose la bonne question : l’intensité du rayonnement dépend-elle de la quantité d’uranium présente, ou de sa forme chimique ? Ses mesures montrent qu’elle dépend de la seule quantité d’élément, donc que le phénomène vient de l’atome lui-même et non de la molécule. C’est une conclusion considérable, puisqu’elle contredit l’idée d’un atome indivisible et inerte.',
        'Elle remarque ensuite que certains minerais rayonnent plus que leur teneur en uranium ne l’explique, et en déduit la présence d’éléments inconnus. En 1898, avec Pierre, elle identifie le polonium — nommé d’après son pays occupé — puis le radium. C’est elle qui forge le terme « radioactivité ».',
        'La démonstration exige un travail physique écrasant. Pour isoler un décigramme de chlorure de radium, elle traite plusieurs tonnes de résidus de pechblende dans un hangar sans chauffage adapté, remuant des bassines de matière bouillante pendant quatre ans. Le radium métallique ne sera isolé qu’en 1910.',
      ],
    },
    {
      titre: 'Deux Nobel, et deux scandales',
      paragraphes: [
        'Le prix Nobel de physique 1903 récompense Becquerel et les Curie. La proposition initiale du comité ne mentionnait pas Marie ; c’est Pierre qui a fait savoir qu’il refuserait une distinction dont elle serait exclue. En 1911, elle reçoit seule le prix Nobel de chimie pour la découverte et l’isolement du radium. Elle est à ce jour la seule personne à avoir obtenu des prix Nobel dans deux disciplines scientifiques différentes.',
        'Pierre meurt en 1906, écrasé par une voiture à cheval dans une rue de Paris. Elle a trente-huit ans et deux filles. La faculté lui propose une pension de veuve ; elle demande et obtient la chaire de son mari, et devient en novembre 1906 la première femme à enseigner à la Sorbonne. Sa leçon inaugurale reprend le cours exactement à la phrase où Pierre l’avait laissé, sans un mot de circonstance.',
        'L’année 1911 est aussi celle de deux humiliations publiques. L’Académie des sciences la rejette de peu lors d’une élection où la presse mène campagne contre sa candidature, en invoquant son sexe et son origine étrangère. Puis la révélation de sa liaison avec le physicien Paul Langevin, marié, déclenche une campagne de presse d’une violence extrême, qui la qualifie d’étrangère briseuse de foyer et provoque des attroupements devant son domicile — au moment même où elle reçoit son second Nobel.',
      ],
    },
    {
      titre: 'La guerre, le refus de breveter, et le prix payé',
      paragraphes: [
        'Deux décisions résument son rapport à la science. Elle refuse de breveter le procédé d’isolement du radium, estimant qu’un résultat scientifique doit rester accessible, et s’interdit ainsi une fortune considérable. Pendant la Première Guerre mondiale, elle conçoit et équipe des véhicules radiologiques mobiles — les « petites Curie » — qu’elle conduit elle-même au plus près du front, et forme environ cent cinquante femmes à la radiologie pour les servir. Des centaines de milliers de blessés ont été radiographiés grâce à ce dispositif.',
        'Elle meurt le 4 juillet 1934 d’une anémie aplasique, causée par des années d’exposition à des rayonnements dont la nocivité n’était pas connue au début de ses travaux. Ses carnets de laboratoire sont encore radioactifs aujourd’hui et se consultent avec des précautions. Sa fille Irène Joliot-Curie recevra le prix Nobel de chimie en 1935, et mourra également d’une leucémie liée à son travail.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que ses découvertes ouvrent la physique du noyau atomique et, par conséquence directe, la radiothérapie, l’imagerie médicale nucléaire, la datation radiométrique et l’énergie nucléaire. L’institut qu’elle a fondé reste l’un des principaux centres de recherche et de traitement du cancer.',
        'Parce que son parcours documente précisément ce que coûtaient les obstacles institutionnels : université interdite dans son pays, exclusion envisagée d’un prix qu’elle méritait, refus d’une académie, campagne de presse sur sa vie privée. Elle a produit son œuvre contre cela, ce qui interdit de lire son succès comme la preuve que ces obstacles étaient surmontables sans dommage.',
        'Parce qu’elle illustre enfin un arbitrage que la recherche connaît bien et dont on parle peu : le risque pris par le chercheur sur lui-même. Elle a manipulé pendant trente ans des matières dont la dangerosité n’était pas établie au départ mais qui l’était devenue à la fin de sa vie, et elle a continué. Sa fille a fait le même choix et en est morte aussi. Il ne s’agit pas d’imprudence individuelle mais de l’absence, à l’époque, de toute culture de radioprotection — culture qui existe précisément parce que ces deux morts, parmi d’autres, l’ont rendue nécessaire.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_nelson_mandela: [
    {
      titre: 'Avocat, militant, puis combattant',
      paragraphes: [
        'Nelson Mandela naît en 1918 dans une famille de la noblesse thembu du Transkei. Il devient avocat à Johannesburg et rejoint le Congrès national africain, dont il fonde en 1944 la Ligue de la jeunesse avec Walter Sisulu et Oliver Tambo, pour pousser l’organisation vers l’action directe.',
        'L’apartheid est institutionnalisé à partir de 1948 : classification raciale de la population, interdiction des mariages mixtes, attribution des territoires, laissez-passer obligatoires, éducation séparée. La campagne de défi de 1952 organise la désobéissance civile de masse ; la Charte de la liberté de 1955 formule le programme d’une Afrique du Sud non raciale. Mandela est arrêté, poursuivi pour trahison, et acquitté après un procès de plusieurs années.',
        'Le tournant est le massacre de Sharpeville, le 21 mars 1960 : la police tire sur une manifestation contre les laissez-passer et tue soixante-neuf personnes. L’ANC est interdit, et Mandela conclut que la non-violence a cessé d’être une option praticable. Il fonde en 1961 la branche armée, Umkhonto we Sizwe, dont la doctrine initiale est le sabotage d’infrastructures en évitant les victimes.',
      ],
    },
    {
      titre: 'Vingt-sept ans',
      paragraphes: [
        'Arrêté le 5 août 1962, il est jugé au procès de Rivonia avec ses codétenus. Le 20 avril 1964, il prononce depuis le banc des accusés une déclaration de plusieurs heures qui se termine par l’affirmation qu’il est prêt à mourir pour l’idéal d’une société démocratique et libre. Les accusés échappent à la peine capitale et sont condamnés à la perpétuité.',
        'Il passe dix-huit ans à Robben Island, à casser du calcaire dans une carrière dont la réverbération lui abîmera définitivement les yeux, puis est transféré à Pollsmoor et enfin à Victor Verster. Ces années ont un effet que ses geôliers n’avaient pas prévu : il y apprend l’afrikaans et étudie l’histoire de la communauté afrikaner, convaincu qu’il faudra un jour négocier avec elle et qu’on ne négocie pas avec ce qu’on ne comprend pas.',
        'En 1985, le gouvernement lui propose la liberté à condition qu’il renonce à la lutte armée. Il refuse, par un message lu publiquement par sa fille : un prisonnier ne peut pas conclure de contrat. Le refus renforce considérablement sa position. Il est libéré le 11 février 1990, après des négociations secrètes engagées depuis sa cellule.',
      ],
    },
    {
      titre: 'La transition, et les deux décisions qui l’ont sauvée',
      paragraphes: [
        'La période 1990-1994 est plus dangereuse qu’on ne s’en souvient : des milliers de personnes meurent dans des violences politiques, l’extrême droite blanche s’arme, et l’assassinat du dirigeant Chris Hani en avril 1993 met le pays au bord de la guerre civile. Mandela s’adresse alors à la télévision nationale pour appeler au calme, dans un rôle de chef d’État qu’il n’occupait pas encore.',
        'Deux décisions ont rendu la transition possible. La première est la Commission Vérité et Réconciliation, présidée par Desmond Tutu à partir de 1996 : une amnistie conditionnée à l’aveu public et complet des faits, devant les victimes. Ce n’était ni l’impunité ni les procès ; ce dispositif a été critiqué par des familles de victimes, à juste titre, et il a néanmoins permis d’établir publiquement les faits sans effondrement du pays.',
        'La seconde est son départ. Élu président lors des premières élections universelles du 27 avril 1994, il ne se présente pas à un second mandat en 1999. Dans un continent où la longévité au pouvoir était la norme, ce retrait volontaire après cinq ans est probablement son acte politique le plus important. Il reçoit le prix Nobel de la paix en 1993, conjointement avec Frederik de Klerk.',
      ],
    },
    {
      titre: 'Ce que son mandat n’a pas réglé',
      paragraphes: [
        'La réconciliation politique a réussi ; la transformation économique beaucoup moins. Le compromis négocié a protégé la propriété existante, et les inégalités de richesse et de terre sont restées parmi les plus fortes du monde. Le programme économique adopté en 1996 était nettement plus orthodoxe que les engagements de la Charte de la liberté, choix défendu par la nécessité de rassurer les créanciers et vivement contesté depuis.',
        'La réponse à l’épidémie de VIH fut insuffisante sous son mandat, ce qu’il a lui-même reconnu publiquement par la suite, avant de s’engager activement sur le sujet — son propre fils est mort du sida en 2005. Son successeur immédiat aggrava considérablement les choses.',
        'Sa vie privée fut mise à mal par la prison : son mariage avec Winnie Madikizela-Mandela, dont le rôle militant fut majeur et le parcours ultérieur controversé, se termina par un divorce en 1996.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’il a démontré qu’une sortie négociée d’un régime raciste était possible sans guerre civile, dans un pays que tous les observateurs voyaient s’y précipiter. Le mécanisme n’était ni le pardon spontané ni la magnanimité : c’était une négociation dure, menée par quelqu’un qui avait pris la peine de comprendre son adversaire et qui a su distinguer la réconciliation de l’oubli.',
        'Parce que le geste de partir reste le plus instructif. Renoncer au pouvoir quand on l’exerce légitimement, qu’on est populaire et qu’on pourrait le garder, est rare, et c’est précisément ce qui a transformé une victoire personnelle en institution durable.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  fig_marcus_aurelius: [
    {
      titre: 'Un empereur qui n’écrivait pas pour être lu',
      paragraphes: [
        'Marc Aurèle règne de 161 à 180. Il est le dernier de ceux que l’histoire a appelés les « bons empereurs », et le seul chef d’État de l’Antiquité dont nous possédions le journal intime. Les "Pensées pour moi-même" — le titre grec signifie littéralement « à soi-même » — n’ont pas été écrites pour la publication : ce sont des notes prises pour son propre usage, souvent le soir, pendant ses campagnes militaires sur le Danube.',
        'Cela change entièrement la manière de les lire. On y trouve des répétitions, des retours sur les mêmes idées, des rappels agacés adressés à lui-même — « cesse de te plaindre », « fais ce que la nature demande » —, et aucune volonté de séduire. C’est un document d’entraînement moral, pas un traité.',
      ],
    },
    {
      titre: 'Un règne de crises continues',
      paragraphes: [
        'Il est utile de savoir dans quelles conditions ce texte a été écrit, car la sérénité qu’il recherche n’était pas celle d’un homme tranquille. Son règne commence par une guerre contre les Parthes, de 161 à 166. Les armées qui en reviennent rapportent une épidémie — la peste antonine, probablement la variole — qui ravage l’Empire pendant une quinzaine d’années et dont les estimations de mortalité vont de cinq à dix millions de personnes.',
        'Suivent les guerres marcomanes sur le Danube, où des peuples germaniques franchissent la frontière ; il y passe l’essentiel de la dernière décennie de sa vie, sous la tente. Le Trésor est vide : il fait vendre aux enchères le mobilier et les objets précieux du palais impérial plutôt que de lever un impôt exceptionnel. En 175, l’un de ses généraux, Avidius Cassius, se proclame empereur en Orient sur une fausse nouvelle de sa mort ; Marc Aurèle marche contre lui et fait savoir qu’il souhaitait lui pardonner, mais Cassius est assassiné par ses propres soldats.',
        'Il partage par ailleurs le pouvoir avec son frère adoptif Lucius Verus jusqu’à la mort de celui-ci en 169. C’est la première expérience durable de collégialité impériale, et elle n’allait pas de soi : Hadrien avait organisé une succession en deux temps, et Marc Aurèle a choisi d’associer Verus à égalité de titre alors que le Sénat ne l’avait désigné que lui. Le précédent servira ensuite de modèle, jusqu’au partage de l’Empire en deux moitiés deux siècles plus tard.',
      ],
    },
    {
      titre: 'Ce que le carnet contient',
      paragraphes: [
        'Trois exercices reviennent constamment. Le premier est le rappel de la distinction stoïcienne : ce qui arrive n’est pas en notre pouvoir, le jugement que nous en portons l’est. Il l’applique à l’ingratitude, à la trahison, à la maladie et à la mort de ses enfants — il en perdit plusieurs.',
        'Le deuxième est la « vue d’en haut » : se représenter l’immensité du temps et de l’espace, la brièveté de toute réputation, le fait que les hommes qu’on cherche à impressionner sont eux-mêmes en train de mourir. Chez un homme disposant du pouvoir absolu, cet exercice a une fonction évidente : il désamorce la démesure.',
        'Le troisième est le devoir social. Contre l’idée d’un stoïcisme replié, il écrit que l’homme est fait pour l’action commune, comme la main est faite pour saisir, et qu’une journée sans utilité pour autrui est perdue. La formule qui le résume le mieux est son rappel matinal : se lever pour faire le travail d’un être humain.',
      ],
    },
    {
      titre: 'Les deux taches du bilan',
      paragraphes: [
        'La première est la persécution des chrétiens, qui s’est poursuivie sous son règne — les martyrs de Lyon en 177 en sont l’épisode le plus connu. Il les mentionne avec dédain dans son carnet. On peut expliquer historiquement cette attitude par la lecture qu’un Romain faisait du refus des cultes civiques ; on ne peut pas la présenter comme un accident étranger à sa personne.',
        'La seconde est sa succession. Après quatre-vingts ans pendant lesquels les empereurs avaient adopté leur meilleur successeur possible, il transmet le pouvoir à son fils biologique, Commode, dont le règne fut désastreux et se termina par un assassinat en 192, ouvrant une longue période d’instabilité. On peut plaider qu’aucune autre option n’était politiquement praticable ; il reste que le philosophe le plus lucide de son temps a laissé l’Empire à celui dont il aurait pu mesurer l’inaptitude.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est le seul document de ce genre : le carnet privé d’un homme qui détenait un pouvoir sans contrôle et qui s’efforçait chaque jour de ne pas s’y perdre. Sa valeur ne vient pas de son originalité philosophique — il reprend Épictète — mais du fait qu’il montre la doctrine à l’usage, sur quelqu’un qui en avait un besoin réel.',
        'Parce que le texte a traversé dix-huit siècles sans perdre sa lisibilité, et qu’il est aujourd’hui l’un des livres les plus lus par des gens en situation de responsabilité ou d’épreuve. La raison probable est qu’il ne promet rien : il propose seulement de faire correctement le travail du jour, et de cesser d’attendre du monde qu’il soit autrement qu’il est.',
      ],
    },
  ],
};
