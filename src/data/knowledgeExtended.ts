export interface KnowledgeConcept {
  term: string;
  definition: string;
}

export interface KnowledgeFlashcard {
  front: string;
  back: string;
}

export interface ExtendedKnowledgeItem {
  id: string;
  title: string;
  domainId: string;
  domainName: string;
  category: string;
  icon: string;
  color: string;
  readTimeMinutes: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  summary: string;
  content: string;
  keyConcepts: KnowledgeConcept[];
  relatedItemIds: string[];
  flashcards: KnowledgeFlashcard[];
}

export interface ExtendedDomain {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const extendedDomains: ExtendedDomain[] = [
  {
    id: 'history_geopolitics',
    name: 'Histoire & Géopolitique',
    icon: '⚔️',
    description: 'Chute des empires, guerres mondiales, routes de la soie, guerre froide et dynamiques de pouvoir.',
    color: 'from-amber-500/20 to-red-500/20',
  },
  {
    id: 'economy_finance',
    name: 'Économie & Argent',
    icon: '📈',
    description: 'Banques centrales, Bitcoin, création monétaire, Bretton Woods, ETF et crises financières.',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'science_tech',
    name: 'Science & Technologie',
    icon: '🔬',
    description: 'Relativité, physique quantique, intelligence artificielle, CRISPR, Internet et espace.',
    color: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    id: 'psychology_philosophy',
    name: 'Psychologie & Philosophie',
    icon: '🧠',
    description: 'Stoïcisme, biais cognitifs, théorie des jeux, dopamine, Dunning-Kruger et Jung.',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'legendary_figures',
    name: 'Personnalités Légendaires',
    icon: '👑',
    description: 'Biographies et leçons des esprits qui ont transformé l\'histoire, la science et l\'industrie.',
    color: 'from-amber-500/20 to-yellow-500/20',
  },
];

export const extendedKnowledgeItems: ExtendedKnowledgeItem[] = [
  // =========================================================================
  // 1. HISTOIRE & GÉOPOLITIQUE
  // =========================================================================
  {
    id: 'hist_chute_rome',
    title: 'La chute de l’Empire romain',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Antiquité & Empires',
    icon: '🏛️',
    color: 'from-amber-500/20 to-red-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'En 476 ap. J.-C., le dernier empereur romain d\'Occident est déposé. Cet effondrement résulte d\'une convergence de crises internes, d\'inflation, d\'instabilité politique et d\'invasions barbares.',
    content: `
La chute de l'Empire romain d'Occident (traditionnellement datée de 476 avec la déposition de Romulus Augustule par le chef germain Odoacre) marque la transition de l'Antiquité vers le Moyen Âge.

### Les Causes Majeures de l'Effondrement
1. **Crises Politiques et Militaires** : Instabilité chronique, guerres civiles perpétuelles et dépendance croissante envers des mercenaires barbares non assimilés.
2. **Effondrement Économique & Hyperinflation** : Dévaluation continue du denier d'argent, dépenses militaires excessives et déclin des rendements agricoles.
3. **Pression Migratoire des Peuples Barbares** : Poussés par l'avancée des Huns, les Wisigoths, Vandales et Francs franchissent le Rhin et le Danube.
4. **Division de l'Empire (395)** : La séparation entre l'Occident (Rome/Ravenne) et l'Orient (Constantinople) a affaibli la partie occidentale, privée des riches revenus de l'Égypte et du Levant.
    `,
    keyConcepts: [
      { term: 'Odoacre', definition: 'Général germain qui déposa en 476 le dernier empereur romain d\'Occident Romulus Augustule.' },
      { term: 'Empire Romain d\'Orient', definition: 'Partie orientale de l\'Empire ayant survécu sous le nom d\'Empire Byzantin jusqu\'en 1453.' },
    ],
    relatedItemIds: ['hist_colonisation', 'fig_marcus_aurelius', 'phil_stoicisme'],
    flashcards: [
      { front: 'Quelle année marque la chute officielle de l\'Empire romain d\'Occident ?', back: 'L\'an 476 après J.-C.' },
      { front: 'Quel chef a destitué le dernier empereur Romulus Augustule ?', back: 'Odoacre.' },
    ],
  },
  {
    id: 'hist_guerre_froide',
    title: 'La guerre froide (1947 - 1991)',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Époque Contemporaine',
    icon: '🌍',
    color: 'from-blue-500/20 to-red-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'Affrontement idéologique, géopolitique, technologique et militaire indirect entre les deux superpuissances du XXe siècle : les États-Unis (capitalisme) et l\'URSS (communisme).',
    content: `
La **Guerre froide** a structuré l'ordre mondial durant près d'un demi-siècle sans qu'aucun affrontement militaire direct n'ait lieu entre les deux géants en raison de la dissuasion nucléaire (**Destruction Mutuelle Assurée - MAD**).

### Les Grands Théâtres d'Affrontement Indirect
- **Le Rideau de Fer & Berlin** : Blocus de Berlin (1948) et érection du Mur de Berlin (1961).
- **Guerres par Procuration (Proxy Wars)** : Guerre de Corée (1950-1953), Guerre du Vietnam (1955-1975), Guerre d'Afghanistan (1979-1989).
- **La Crise des Missiles de Cuba (1962)** : Le moment où le monde a frôlé la guerre thermonucléaire globale.
- **La Course à l'Espace & à l'Armement** : Spoutnik (1957), Apollo 11 (1969) et Initiative de Défense Stratégique (Star Wars).
    `,
    keyConcepts: [
      { term: 'MAD (Mutually Assured Destruction)', definition: 'Doctrine militaire où l\'usage d\'armes nucléaires par deux camps garantit l\'annihilation totale mutuelle.' },
      { term: 'Endiguement (Containment)', definition: 'Stratégie américaine visant à bloquer toute expansion de l\'influence communiste dans le monde.' },
    ],
    relatedItemIds: ['hist_effondrement_urss', 'hist_guerre_coree', 'hist_projet_manhattan', 'sci_conquete_spatiale'],
    flashcards: [
      { front: 'Qu\'est-ce que la doctrine MAD en pleine guerre froide ?', back: 'La Destruction Mutuelle Assurée par les arsenaux nucléaires dissuadant toute frappe directe.' },
      { front: 'En quelle année le mur de Berlin a-t-il été abattu ?', back: 'En novembre 1989.' },
    ],
  },
  {
    id: 'hist_guerre_coree',
    title: 'La guerre de Corée (1950 - 1953)',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Guerres Modernes',
    icon: '🪖',
    color: 'from-red-500/20 to-blue-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Premier conflit armé majeur de la guerre froide, divisant la péninsule coréenne le long du 38e parallèle entre le Nord communiste et le Sud pro-occidental.',
    content: `
Le 25 juin 1950, l'armée nord-coréenne de Kim Il-sung envahit le Sud. Ce conflit a transformé la division coloniale en une frontière étanche toujours active aujourd'hui.

### Déroulement et Interventions Internationales
1. **La contre-offensive de l'ONU et des USA** menée par le général Douglas MacArthur avec le débarquement d'Incheon.
2. **L'intervention massive de la Chine populaire** de Mao Zedong qui repousse les forces alliées vers le sud.
3. **L'Armistice de Panmunjom (1953)** : Aucun traité de paix définitif n'a été signé ; une zone démilitarisée (DMZ) sépare toujours les deux États.
    `,
    keyConcepts: [
      { term: '38e Parallèle', definition: 'Ligne de démarcation géographique et politique séparant la Corée du Nord et la Corée du Sud.' },
      { term: 'Panmunjom', definition: 'Village frontalier où fut signé l\'armistice suspendant les hostilités en juillet 1953.' },
    ],
    relatedItemIds: ['hist_guerre_froide', 'hist_effondrement_urss'],
    flashcards: [
      { front: 'Quel parallèle sépare les deux Corées ?', back: 'Le 38e parallèle.' },
      { front: 'La guerre de Corée s\'est-elle terminée par un traité de paix ?', back: 'Non, uniquement par un armistice en 1953.' },
    ],
  },
  {
    id: 'hist_projet_manhattan',
    title: 'Le projet Manhattan & l’Ère Atomique',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Science Militaire',
    icon: '☢️',
    color: 'from-yellow-500/20 to-orange-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Programme de recherche secret dirigé par J. Robert Oppenheimer pendant la 2nde Guerre mondiale qui a abouti à la première bombe nucléaire de l\'histoire.',
    content: `
Lancé en 1942 sous la direction scientifique de J. Robert Oppenheimer et militaire du général Leslie Groves à Los Alamos (Nouveau-Mexique), le projet Manhattan a mobilisé plus de 130 000 personnes.

### Les Jalons Scientifiques
- **Trinity (16 juillet 1945)** : Première explosion nucléaire expérimentale dans le désert du Nouveau-Mexique.
- **Hiroshima & Nagasaki (août 1945)** : Largage des bombes *Little Boy* (uranium) et *Fat Man* (plutonium), provoquant la capitulation du Japon.
- **Dilemme éthique** : Oppenheimer cita le texte sacré hindou *Bhagavad Gita* : « Maintenant, je suis devenu la Mort, le destructeur des mondes ».
    `,
    keyConcepts: [
      { term: 'Fission Nucléaire', definition: 'Scission d\'un noyau atomique lourd libérant une quantité phénoménale d\'énergie thermique et radiative.' },
      { term: 'Trinity', definition: 'Nom de code du tout premier essai d\'arme nucléaire de l\'histoire le 16 juillet 1945.' },
    ],
    relatedItemIds: ['sci_relativite', 'sci_mecanique_quantique', 'hist_guerre_froide'],
    flashcards: [
      { front: 'Qui était le directeur scientifique du projet Manhattan ?', back: 'J. Robert Oppenheimer.' },
      { front: 'Quel était le nom du premier essai nucléaire en 1945 ?', back: 'L\'essai Trinity.' },
    ],
  },
  {
    id: 'hist_routes_soie',
    title: 'Les routes de la soie : Du commerce antique aux « Nouvelles Routes »',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Commerce Mondial',
    icon: '🐪',
    color: 'from-amber-500/20 to-yellow-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Réseau de routes commerciales reliant l\'Asie, le Moyen-Orient et l\'Europe, vecteur d\'échanges d\'épices, de soie, de papier, mais aussi de religions et d\'idées.',
    content: `
Établies sous la dynastie Han (-200 av. J.-C.), les routes de la soie s'étendaient sur plus de 6 000 kilomètres.

### Les Échanges Majeurs
- **Marchandises** : Soie, porcelaine, thé et jade de Chine ; chevaux, or, verre et épices de Méditerranée et d'Inde.
- **Vecteur d'Idées & Technologies** : Diffusion du bouddhisme en Asie de l'Est, de l'islam en Asie centrale, ainsi que des inventions chinoises majeures (papier, poudre à canon, boussole).
- **Le Projet Actuel (Belt and Road Initiative - BRI)** : La Chine moderne réinvestit des centaines de milliards de dollars dans des infrastructures ferroviaires et portuaires mondiales reliant l'Afrique, l'Asie et l'Europe.
    `,
    keyConcepts: [
      { term: 'Belt and Road Initiative (BRI)', definition: 'Projet géopolitique et infrastructurel chinois contemporain recréant des corridors commerciaux terrestres et maritimes mondiaux.' },
      { term: 'Caravansérail', definition: 'Auberge fortifiée où les caravanes de marchands faisaient étape sur les routes marchandes.' },
    ],
    relatedItemIds: ['econ_bretton_woods', 'hist_colonisation'],
    flashcards: [
      { front: 'Sous quelle dynastie chinoise les routes de la soie ont-elles été ouvertes ?', back: 'Sous la dynastie Han.' },
      { front: 'Comment s\'appelle le méga-projet contemporain d\'infrastructures de la Chine ?', back: 'La "Belt and Road Initiative" (Nouvelles Routes de la Soie).' },
    ],
  },
  {
    id: 'hist_effondrement_urss',
    title: 'L’effondrement de l’URSS (1991)',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Géopolitique Moderne',
    icon: '🚩',
    color: 'from-red-500/20 to-indigo-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'La dislocation de l\'Union Soviétique en 15 républiques indépendantes met fin à la guerre froide et transforme la carte géopolitique de l\'Eurasie.',
    content: `
Le 26 décembre 1991, le drapeau rouge est abaissé au-dessus du Kremlin. L'URSS implose sous le poids de contradictions économiques internes et de réformes politiques.

### Facteurs Clés de la Dislocation
1. **Économie Planifiée à Bout de Souffle** : Pénuries chroniques, retard technologique civil et surarmement militaire absorbant jusqu'à 20% du PIB.
2. **Glasnost & Perestroïka** : Politiques de Mikhaïl Gorbatchev pour introduire la transparence (Glasnost) et la restructuration économique (Perestroïka), déclenchant des revendications démocratiques incontrôlables.
3. **Révolutions de 1989** : Chute des régimes communistes satellites en Europe de l'Est (Pologne, RDA, Roumanie).
4. **Déclaration d'Alma-Ata** : Création de la CEI et fin officielle de l'Union Soviétique.
    `,
    keyConcepts: [
      { term: 'Perestroïka', definition: 'Terme russe désignant la réforme et la restructuration de l\'économie soviétique initiée par Gorbatchev en 1985.' },
      { term: 'Glasnost', definition: 'Politique de liberté d\'expression et de transparence politique en URSS.' },
    ],
    relatedItemIds: ['hist_guerre_froide', 'econ_bretton_woods'],
    flashcards: [
      { front: 'Qui était le dernier dirigeant de l\'URSS ?', back: 'Mikhaïl Gorbatchev.' },
      { front: 'Que signifient Glasnost et Perestroïka ?', back: 'Transparence (Glasnost) et Restructuration économique (Perestroïka).' },
    ],
  },
  {
    id: 'hist_colonisation',
    title: 'La colonisation européenne & la Décolonisation',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Histoire Mondiale',
    icon: '🌍',
    color: 'from-amber-500/20 to-orange-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'De la conférence de Berlin (1884-1885) au partage de l\'Afrique jusqu\'aux luttes d\'indépendance du XXe siècle, un processus ayant profondément façonné les frontières contemporaines.',
    content: `
L'impérialisme européen des XIXe et XXe siècles a vu les puissances occidentales (France, Grande-Bretagne, Portugal, Belgique, Allemagne) soumettre de vastes territoires en Afrique et en Asie.

### La Conférence de Berlin (1884-1885)
Sans aucun représentant africain présent, les puissances européennes ont établi les règles du « partage de l'Afrique », traçant des frontières artificielles ignorant les réalités ethniques, culturelles et linguistiques séculaires.

### Les Vagues de Décolonisation (1950 - 1975)
Sous l'impulsion de leaders visionnaires (Kwame Nkrumah, Félix Houphouët-Boigny, Patrice Lumumba, Amílcar Cabral), les nations africaines ont reconquis leur souveraineté politique, ouvrant la voie à la construction des États modernes et à l'intégration panafricaine.
    `,
    keyConcepts: [
      { term: 'Conférence de Berlin', definition: 'Conférence internationale de 1884-1885 organisée par Bismarck actant le partage colonial du continent africain.' },
      { term: 'Panafricanisme', definition: 'Mouvement politique et culturel visant à unifier et solidariser les peuples et diasporas d\'Afrique.' },
    ],
    relatedItemIds: ['fig_nelson_mandela', 'econ_mobile_money'],
    flashcards: [
      { front: 'Quelle conférence a fixé les règles du partage colonial de l\'Afrique ?', back: 'La conférence de Berlin (1884-1885).' },
      { front: 'Quel leader ghanéen fut une figure pionnière du panafricanisme ?', back: 'Kwame Nkrumah.' },
    ],
  },
  {
    id: 'hist_plan_marshall',
    title: 'Le plan Marshall & la Reconstruction Européenne',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Économie Historique',
    icon: '🏗️',
    color: 'from-emerald-500/20 to-blue-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Programme d\'aide économique américain de plus de 13 milliards de dollars (1948) pour reconstruire l\'Europe dévastée par la 2nde Guerre mondiale et endiguer le communisme.',
    content: `
Proposé par le général George Marshall en juin 1947, le plan d'aide économique (officiellement *European Recovery Program*) visait deux objectifs stratégiques indissociables :

1. **Rebâtir le tissu industriel et agricole européen** pour éviter des famines et relancer le commerce transatlantique.
2. **Ancrer l'Europe de l'Ouest dans le bloc capitaliste** et créer des débouchés majeurs pour l'industrie américaine en plein essor.
    `,
    keyConcepts: [
      { term: 'European Recovery Program', definition: 'Nom officiel du Plan Marshall mis en œuvre entre 1948 et 1952.' },
      { term: 'OECE', definition: 'Organisation Européenne de Coopération Économique (ancêtre de l\'OCDE) créée pour répartir l\'aide Marshall.' },
    ],
    relatedItemIds: ['hist_guerre_froide', 'econ_bretton_woods'],
    flashcards: [
      { front: 'En quelle année le Plan Marshall a-t-il été lancé ?', back: 'En 1948.' },
      { front: 'Quel était l\'objectif géopolitique clé du Plan Marshall ?', back: 'Reconstruire l\'Europe de l\'Ouest et empêcher l\'avancée du communisme soviétique.' },
    ],
  },
  {
    id: 'hist_revolution_industrielle',
    title: 'La révolution industrielle : Vapeur, Électricité & Numérique',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Histoire Économique',
    icon: '⚙️',
    color: 'from-orange-500/20 to-red-500/20',
    readTimeMinutes: 6,
    level: 'Débutant',
    summary: 'Transformation radicale des modes de production amorcée en Grande-Bretagne au XVIIIe siècle, passant d\'une société agraire et artisanale à une société industrielle et urbaine.',
    content: `
L'humanité a connu 4 grandes vagues industrielles successives :

1. **1ère Révolution (1760-1840)** : Machine à vapeur de James Watt, charbon, métallurgie et mécanisation textile.
2. **2ème Révolution (1870-1914)** : Électricité, moteur à explosion (pétrole), chimie lourde et production de masse (fordisme).
3. **3ème Révolution (1970-2000)** : Électronique, microprocesseurs, informatique personnelle et automatisation.
4. **4ème Révolution (Industrie 4.0)** : Intelligence artificielle, cloud computing, IoT, nanotechnologies et énergies renouvelables.
    `,
    keyConcepts: [
      { term: 'Machine à Vapeur', definition: 'Invention perfectionnée par James Watt convertissant l\'énergie thermique de l\'eau en énergie mécanique.' },
      { term: 'Fordisme', definition: 'Organisation du travail combinant travail à la chaîne, standardisation et salaires stimulants.' },
    ],
    relatedItemIds: ['sci_internet', 'sci_intelligence_artificielle'],
    flashcards: [
      { front: 'Quelle source d\'énergie a alimenté la première révolution industrielle ?', back: 'Le charbon et la machine à vapeur.' },
      { front: 'Qu\'est-ce qui caractérise l\'industrie 4.0 ?', back: 'L\'IA, les objets connectés (IoT), le cloud et l\'automatisation avancée.' },
    ],
  },
  {
    id: 'hist_crise_1929',
    title: 'La crise de 1929 & la Grande Dépression',
    domainId: 'history_geopolitics',
    domainName: 'Histoire & Géopolitique',
    category: 'Crises Économiques',
    icon: '📉',
    color: 'from-red-500/20 to-amber-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Le krach boursier de Wall Street en octobre 1929 (« Jeudi Noir ») déclenche la plus grave récession économique mondiale du XXe siècle, avec chômage de masse et faillites bancaires.',
    content: `
Le 24 octobre 1929, la spéculation effrénée sur les actions américaines achetées à crédit provoque l'effondrement brutal de la Bourse de New York.

### Conséquences Mondiales
- Faillite en chaîne de milliers de banques américaines.
- Explosion du chômage (25% aux USA, plus de 30% en Allemagne).
- Contraction du commerce mondial de plus de 60%.
- Conséquences politiques : Montée des totalitarismes en Europe (arrivée d'Hitler au pouvoir en 1933).
- Réponse économique : Le **New Deal** du président Roosevelt (grands travaux publics, régulation bancaire Glass-Steagall) et naissance du keynésianisme.
    `,
    keyConcepts: [
      { term: 'New Deal', definition: 'Programme interventionniste de relance économique lancé par Franklin D. Roosevelt en 1933.' },
      { term: 'Loi Glass-Steagall', definition: 'Loi bancaire américaine de 1933 séparant strictement les banques de dépôt des banques d\'investissement.' },
    ],
    relatedItemIds: ['econ_subprimes', 'econ_bulles_speculatives', 'econ_banques_centrales'],
    flashcards: [
      { front: 'Quel jour a débuté le krach de 1929 ?', back: 'Le jeudi 24 octobre 1929 (« Jeudi Noir »).' },
      { front: 'Comment s\'appelle le programme de relance de Franklin D. Roosevelt ?', back: 'Le New Deal.' },
    ],
  },

  // =========================================================================
  // 2. ÉCONOMIE & ARGENT
  // =========================================================================
  {
    id: 'econ_banques_centrales',
    title: 'Le fonctionnement des banques centrales',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Politique Monétaire',
    icon: '🏦',
    color: 'from-emerald-500/20 to-teal-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Les banques centrales (BCE, Fed, BCEAO) régulent la masse monétaire, fixent les taux directeurs et assurent la stabilité des prix et du système financier.',
    content: `
La banque centrale est l'institution publique au sommet du système bancaire d'un État ou d'une zone monétaire (comme la **BCEAO** pour l'UEMOA en Afrique de l'Ouest).

### Les 3 Outils Majeurs de la Banque Centrale
1. **Les Taux Directeurs** : Taux auquel les banques commerciales empruntent de la liquidité. Hausse des taux = crédit plus cher, freinage de l'inflation. Baisse des taux = crédit facile, relance économique.
2. **Les Réserves Obligatoires** : Part des dépôts que les banques commerciales doivent obligatoirement immobiliser.
3. **L'Assouplissement Quantitatif (Quantitative Easing - QE)** : Achat massif d'obligations d'État sur les marchés pour injecter de la monnaie liquide dans l'économie.
    `,
    keyConcepts: [
      { term: 'Taux Directeur', definition: 'Taux d\'intérêt fixé par la banque centrale influençant le coût de l\'argent pour l\'ensemble de l\'économie.' },
      { term: 'BCEAO', definition: 'Banque Centrale des États de l\'Afrique de l\'Ouest, émettrice du Franc CFA pour 8 pays de l\'UEMOA.' },
    ],
    relatedItemIds: ['econ_creation_monetaire', 'econ_dollar_mondial', 'econ_bretton_woods'],
    flashcards: [
      { front: 'Quel est l\'effet d\'une hausse des taux directeurs ?', back: 'Elle renchérit le coût du crédit pour ralentir l\'inflation.' },
      { front: 'Quelle est la banque centrale émettrice du Franc CFA en Afrique de l\'Ouest ?', back: 'La BCEAO.' },
    ],
  },
  {
    id: 'econ_dollar_mondial',
    title: 'Le dollar comme monnaie de réserve mondiale',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Monnaies & Géopolitique',
    icon: '💵',
    color: 'from-emerald-500/20 to-blue-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Le dollar américain représente près de 60% des réserves de change mondiales et 85% des transactions de change, conférant aux États-Unis un « privilège exorbitant ».',
    content: `
Depuis les accords de Bretton Woods (1944), le dollar règne comme la devise de référence des échanges internationaux, du commerce du pétrole (**pétrodollar**) et des réserves des banques centrales.

### Les Avantages du « Privilège Exorbitant »
- Capacité pour les États-Unis d'emprunter à des taux très faibles dans leur propre devise.
- Portée extraterritoriale des lois américaines (sanctions financières via le réseau SWIFT).
- Débats contemporains sur la **dédollarisation** menée par les pays des BRICS (échanges en Yuan, Roupies ou monnaies locales).
    `,
    keyConcepts: [
      { term: 'Monnaie de Réserve', definition: 'Devise étrangère détenue en quantité massive par les banques centrales pour soutenir leur propre monnaie et régler le commerce extérieur.' },
      { term: 'Pétrodollar', definition: 'Dollars américains reçus par les pays producteurs de pétrole en échange de leurs exportations d\'or noir.' },
    ],
    relatedItemIds: ['econ_bretton_woods', 'econ_bitcoin', 'econ_banques_centrales'],
    flashcards: [
      { front: 'Quelle part approximative des réserves de change mondiales est détenue en dollars ?', back: 'Près de 60%.' },
      { front: 'Quel terme désigne le commerce du pétrole facturé en dollars ?', back: 'Le pétrodollar.' },
    ],
  },
  {
    id: 'econ_bitcoin',
    title: 'Le Bitcoin & la Révolution des Cryptomonnaies',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Fintech & Blockchain',
    icon: '₿',
    color: 'from-amber-500/20 to-orange-500/20',
    readTimeMinutes: 6,
    level: 'Débutant',
    summary: 'Créé en 2008 par Satoshi Nakamoto, le Bitcoin est la première monnaie numérique décentralisée et rare (limitée à 21 millions d\'unités), fonctionnant sur une blockchain sans tiers de confiance.',
    content: `
Le Bitcoin résout le problème historique de la « double dépense » numérique sans avoir besoin d'une banque centrale grâce à son registre distribué : la **Blockchain**.

### Principes Fondamentaux
- **Rareté Programmée** : Il n'existera jamais plus de 21 millions de Bitcoins. Tous les 4 ans, le nombre de nouveaux bitcoins créés par bloc est divisé par deux (**Halving**).
- **Preuve de Travail (Proof of Work)** : Les mineurs utilisent de la puissance de calcul pour valider les transactions et sécuriser le réseau.
- **Inclusion & Souveraineté** : Permet à n'importe quel individu disposant d'un smartphone d'envoyer et recevoir de la valeur n'importe où dans le monde en quelques minutes.
    `,
    keyConcepts: [
      { term: 'Halving', definition: 'Événement programmé tous les 210 000 blocs (environ 4 ans) réduisant de 50% la récompense accordée aux mineurs de Bitcoin.' },
      { term: 'Blockchain', definition: 'Grand livre de comptes numérique partagé, infalsifiable et décentralisé enregistrant l\'historique de toutes les transactions.' },
    ],
    relatedItemIds: ['econ_creation_monetaire', 'econ_mobile_money', 'sci_internet'],
    flashcards: [
      { front: 'Quel est le nombre maximal de Bitcoins qui existeront ?', back: '21 millions de Bitcoins.' },
      { front: 'Qui a publié le livre blanc de Bitcoin en 2008 ?', back: 'Satoshi Nakamoto.' },
    ],
  },
  {
    id: 'econ_etf',
    title: 'Les ETF (Exchange-Traded Funds) & l’Investissement Passif',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Marchés Financiers',
    icon: '📊',
    color: 'from-cyan-500/20 to-blue-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Les ETF (ou trackers) sont des fonds cotés en bourse répliquant la performance d\'un indice (comme le S&P 500 ou le MSCI World) à des frais ultra-réduits.',
    content: `
Popularisés par John Bogle (fondateur de Vanguard), les **ETF** ont révolutionné l'investissement financier en rendant la diversification instantanée accessible aux particuliers.

### Avantages Majeurs
- **Diversification Instantanée** : Acheter un seul ETF S&P 500 permet de détenir une fraction des 500 plus grandes entreprises américaines.
- **Frais Minimes** : Frais de gestion souvent inférieurs à 0,2% par an, contre 1,5 à 2,5% pour les fonds gérés activement traditionnels.
- **Performance Supérieure** : Sur un horizon de 10 ans, plus de 90% des gestionnaires de fonds actifs sous-performent leur indice de référence.
    `,
    keyConcepts: [
      { term: 'S&P 500', definition: 'Indice boursier américain regroupant les 500 plus grandes entreprises cotées (Apple, Microsoft, Amazon, etc.).' },
      { term: 'MSCI World', definition: 'Indice actions mondial regroupant plus de 1 400 grandes entreprises de 23 pays développés.' },
    ],
    relatedItemIds: ['econ_interet_compose', 'fig_warren_buffett', 'econ_private_equity'],
    flashcards: [
      { front: 'Que signifie l\'acronyme ETF ?', back: 'Exchange-Traded Fund (Fonds Négocié en Bourse).' },
      { front: 'Qui est considéré comme le père de l\'investissement indiciel passif ?', back: 'John Bogle (fondateur de Vanguard).' },
    ],
  },
  {
    id: 'econ_bretton_woods',
    title: 'Le système de Bretton Woods (1944)',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Histoire Monétaire',
    icon: '🏛️',
    color: 'from-amber-500/20 to-emerald-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Conférence historique établissant l\'architecture financière internationale d\'après-guerre : parité fixe des devises sur le dollar américain, lui-même convertible en or (35$/once).',
    content: `
En juillet 1944, 730 délégués de 44 nations se réunissent à Bretton Woods (New Hampshire).

### Les Piliers Institués
1. **Création du FMI et de la Banque Mondiale** : Pour stabiliser les balances de paiement et financer la reconstruction.
2. **Le Dollar comme Pivot d'Or** : Seul le dollar est convertible en or à 35$ l'once, les autres monnaies ayant des taux de change fixes avec le dollar.
3. **La Fin du Système (1971)** : Face aux déficits de la guerre du Vietnam, le président Richard Nixon suspend unilatéralement la convertibilité-or le 15 août 1971 (« Choc Nixon »), faisant basculer le monde dans l'ère des changes flottants et de la monnaie fiduciaire pure.
    `,
    keyConcepts: [
      { term: 'Choc Nixon (1971)', definition: 'Décision du président américain Richard Nixon suspendant définitivement la convertibilité du dollar en or.' },
      { term: 'FMI', definition: 'Fonds Monétaire International, garant de la stabilité financière et prêteur en dernier ressort pour les États.' },
    ],
    relatedItemIds: ['econ_dollar_mondial', 'econ_creation_monetaire', 'econ_banques_centrales'],
    flashcards: [
      { front: 'Quel président américain a mis fin à la convertibilité du dollar en or en 1971 ?', back: 'Richard Nixon.' },
      { front: 'Quelles deux grandes institutions internationales sont nées à Bretton Woods ?', back: 'Le FMI (Fonds Monétaire International) et la Banque Mondiale.' },
    ],
  },
  {
    id: 'econ_creation_monetaire',
    title: 'La création monétaire : Crédit & Multiplicateur bancaire',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Système Bancaire',
    icon: '💳',
    color: 'from-emerald-500/20 to-teal-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Contrairement à une idée reçue, l\'argent moderne n\'est pas créé par les planches à billets des gouvernements, mais par les banques commerciales lorsqu\'elles accordent des crédits (« les crédits font les dépôts »).',
    content: `
Plus de 90% de la monnaie en circulation est de la **monnaie scripturale** (chiffres sur des comptes bancaires informatiques).

### Le Mécanisme : « Les Crédits font les Dépôts »
Lorsqu'un particulier contracte un emprunt de 10 millions FCFA pour acheter un bien, la banque ne puise pas dans l'épargne d'un autre client : elle **crée ex-nihilo** une nouvelle créance à son actif et crédite le compte du client. 
Lorsque le client rembourse le capital de son crédit, la monnaie correspondante est **détruite**.
    `,
    keyConcepts: [
      { term: 'Monnaie Scripturale', definition: 'Monnaie enregistrée sous forme d\'écritures sur les comptes bancaires (cartes, virements).' },
      { term: 'Création Ex-Nihilo', definition: 'Création d\'argent neuf à partir de rien par simple inscription comptable lors de l\'octroi d\'un prêt.' },
    ],
    relatedItemIds: ['econ_banques_centrales', 'econ_bitcoin', 'econ_subprimes'],
    flashcards: [
      { front: 'Qui crée la grande majorité de la monnaie en circulation dans le monde ?', back: 'Les banques commerciales lorsqu\'elles accordent des crédits.' },
      { front: 'Que devient la monnaie lorsque le capital d\'un emprunt est remboursé ?', back: 'Elle est détruite comptablement.' },
    ],
  },
  {
    id: 'econ_interet_compose',
    title: 'L’intérêt composé : « La 8e merveille du monde »',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Finance Personnelle',
    icon: '⏳',
    color: 'from-emerald-500/20 to-yellow-500/20',
    readTimeMinutes: 4,
    level: 'Débutant',
    summary: 'L\'intérêt composé désigne le processus où les intérêts générés par un capital produisent à leur tour de nouveaux intérêts, entraînant une croissance exponentielle avec le temps.',
    content: `
Attribué à Albert Einstein qui l'aurait qualifié de « huitième merveille du monde », l'effet boule de neige des intérêts composés est le moteur fondamental de l'accumulation de patrimoine à long terme.

### La Formule Mathématique
$$V_f = V_i \\times (1 + r)^n$$
- $V_i$ : Capital initial
- $r$ : Taux de rendement annuel
- $n$ : Nombre d'années

### Règle des 72
Pour savoir en combien d'années votre capital va doubler, divisez 72 par le taux de rendement annuel.
*(Exemple : à 8% par an, votre argent double tous les 72 / 8 = 9 ans).*
    `,
    keyConcepts: [
      { term: 'Règle des 72', definition: 'Formule mentale rapide : 72 divisé par le taux d\'intérêt annuel donne le nombre d\'années nécessaires pour doubler un investissement.' },
      { term: 'Croissance Exponentielle', definition: 'Croissance dont le taux d\'augmentation est proportionnel à la valeur accumulée actuelle.' },
    ],
    relatedItemIds: ['econ_etf', 'fig_warren_buffett'],
    flashcards: [
      { front: 'Quelle est la règle mentale rapide pour calculer le doublement d\'un capital ?', back: 'La Règle des 72 (72 ÷ taux annuel = années).' },
      { front: 'Quel facteur clé démultiplie l\'effet des intérêts composés ?', back: 'La durée (le temps n).' },
    ],
  },
  {
    id: 'econ_private_equity',
    title: 'Le Private Equity & le Capital-Risque (Venture Capital)',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Investissement',
    icon: '🚀',
    color: 'from-purple-500/20 to-indigo-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Investissement direct dans des entreprises non cotées en bourse, allant du financement de startups innovantes (Venture Capital) au rachat d\'entreprises matures (LBO).',
    content: `
Le **Private Equity** finance l'économie réelle en dehors des marchés boursiers publics.

### Les Différents Stades d'Investissement
1. **Venture Capital (Capital-Risque)** : Financement d'amorçage pour les jeunes startups technologiques à fort potentiel (ex: financement initial de Stripe, Wave ou Airbnb).
2. **Growth Equity (Capital-Développement)** : Accompagnement d'entreprises en phase d'expansion commerciale rapide.
3. **LBO (Leveraged Buy-Out)** : Rachat d'entreprises matures rentables financé majoritairement par de la dette remboursée par les flux de trésorerie de l'entreprise cible.
    `,
    keyConcepts: [
      { term: 'LBO (Leveraged Buy-Out)', definition: 'Technique financière de rachat d\'entreprise par effet de levier d\'endettement bancaire.' },
      { term: 'Licorne (Unicorn)', definition: 'Startup non cotée en bourse valorisée à plus de 1 milliard de dollars.' },
    ],
    relatedItemIds: ['econ_etf', 'fig_elon_musk', 'fig_steve_jobs'],
    flashcards: [
      { front: 'Qu\'est-ce qu\'une licorne dans l\'écosystème tech ?', back: 'Une startup non cotée valorisée à au moins 1 milliard de dollars.' },
      { front: 'Quel segment du private equity finance les startups technologiques ?', back: 'Le Venture Capital (Capital-Risque).' },
    ],
  },
  {
    id: 'econ_bulles_speculatives',
    title: 'Les bulles spéculatives : De la Tulipomanie aux Dot-Com',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Psychologie des Marchés',
    icon: '🫧',
    color: 'from-pink-500/20 to-orange-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Phénomène de marché où le prix d\'un actif s\'envole à des niveaux déconnectés de sa valeur intrinsèque, alimenté par l\'euphorie collective (FOMO), avant un krach brutal.',
    content: `
Les bulles spéculatives suivent toujours les mêmes phases psychologiques :

1. **La Tulipomanie (Hollande, 1637)** : Premier exemple documenté, où un seul bulbe de tulipe rare s'échangeait pour le prix d'un hôtel particulier à Amsterdam.
2. **La Bulle Internet / Dot-Com (1999-2000)** : Explosion boursière des entreprises technologiques sans rentabilité.
3. **Les 5 Phases d'une Bulle (Hyman Minsky)** :
   - Déplacement (nouveauté technologique)
   - Boom (afflux de capitaux)
   - Euphorie (le grand public achète par peur de rater le train - FOMO)
   - Prise de bénéfices (les initiés vendent)
   - Panique & Capitulation (effondrement vertical des cours).
    `,
    keyConcepts: [
      { term: 'FOMO (Fear Of Missing Out)', definition: 'Peur irrationnelle de rater une opportunité financière poussant à acheter au sommet d\'une bulle.' },
      { term: 'Moment Minsky', definition: 'Point de basculement où l\'endettement spéculatif devient insoutenable, déclenchant le krach.' },
    ],
    relatedItemIds: ['econ_subprimes', 'hist_crise_1929', 'econ_bitcoin'],
    flashcards: [
      { front: 'Quelle est la première bulle spéculative célèbre de l\'histoire moderne ?', back: 'La Tulipomanie hollandaise en 1637.' },
      { front: 'Quel économiste a modélisé les phases d\'instabilité financière des bulles ?', back: 'Hyman Minsky.' },
    ],
  },
  {
    id: 'econ_subprimes',
    title: 'La crise des subprimes (2007 - 2008)',
    domainId: 'economy_finance',
    domainName: 'Économie & Argent',
    category: 'Crises Financières',
    icon: '🏚️',
    color: 'from-red-500/20 to-rose-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'L\'octroi massif de crédits immobiliers à risque aux États-Unis, titrisés et disséminés dans le système bancaire mondial, a provoqué la faillite de Lehman Brothers et la crise financière globale de 2008.',
    content: `
Les crédits **subprimes** étaient des prêts hypothécaires accordés à des emprunteurs insolvables à taux variables.

### L'Engrenage de la Titrisation
Les banques ont regroupé ces crédits toxiques avec d'autres dettes dans des produits financiers complexes (**CDO - Collateralized Debt Obligations**) notés artificiellement « AAA » (sécurité maximale) par les agences de notation.
Lorsque les taux d'intérêt ont monté et que les prix de l'immobilier ont chuté, des millions d'américains ont fait défaut. Le 15 septembre 2008, la prestigieuse banque d'affaires **Lehman Brothers** fait faillite, gelant le crédit mondial.
    `,
    keyConcepts: [
      { term: 'Titrisation', definition: 'Technique consistant à transformer des créances bancaires (comme des prêts immobiliers) en titres financiers négociables sur les marchés.' },
      { term: 'Lehman Brothers', definition: 'Banque d\'affaires américaine dont la faillite le 15 septembre 2008 a déclenché la panique financière mondiale.' },
    ],
    relatedItemIds: ['hist_crise_1929', 'econ_banques_centrales', 'econ_bulles_speculatives'],
    flashcards: [
      { front: 'Quelle banque d\'investissement majeure a fait faillite en septembre 2008 ?', back: 'Lehman Brothers.' },
      { front: 'Qu\'étaient les prêts subprimes ?', back: 'Des crédits immobiliers à haut risque accordés à des emprunteurs peu solvables.' },
    ],
  },

  // =========================================================================
  // 3. SCIENCE & TECHNOLOGIE
  // =========================================================================
  {
    id: 'sci_relativite',
    title: 'La relativité d’Einstein (Restreinte & Générale)',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Physique Théorique',
    icon: '🌌',
    color: 'from-indigo-500/20 to-cyan-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'Albert Einstein a révolutionné notre conception de l\'Univers : l\'espace et le temps ne sont pas absolus mais forment un tissu à quatre dimensions déformé par la masse et l\'énergie.',
    content: `
La physique einsteinienne se décompose en deux théories majeures :

### 1. La Relativité Restreinte (1905)
- La vitesse de la lumière dans le vide ($c \\approx 300\\,000\\text{ km/s}$) est constante pour tous les observateurs.
- Le temps s'écoule plus lentement pour un objet en mouvement rapide (**dilatation temporelle**).
- L'équivalence masse-énergie fondamentale :
$$E = mc^2$$

### 2. La Relativité Générale (1915)
La gravitation n'est pas une force invisible qui attire les corps à distance (comme le pensait Newton), mais la **courbure de l'espace-temps** causée par la présence de matière. Les planètes suivent simplement les lignes droites (géodésiques) dans un espace courbé par le Soleil.
    `,
    keyConcepts: [
      { term: 'Espace-Temps', definition: 'Modèle mathématique à 4 dimensions (3 spatiales + 1 temporelle) formant le tissu de l\'Univers.' },
      { term: 'Dilatation Temporelle', definition: 'Phénomène relativiste où le temps s\'écoule plus lentement pour une horloge en mouvement rapide ou soumise à une forte gravité.' },
    ],
    relatedItemIds: ['sci_mecanique_quantique', 'sci_conquete_spatiale'],
    flashcards: [
      { front: 'Quelle célèbre équation relie la masse et l\'énergie ?', back: 'E = mc².' },
      { front: 'Comment la relativité générale explique-t-elle la gravité ?', back: 'Comme une courbure de l\'espace-temps générée par la masse des corps célestes.' },
    ],
  },
  {
    id: 'sci_mecanique_quantique',
    title: 'La mécanique quantique : Dualité & Incertitude',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Physique Quantique',
    icon: '⚛️',
    color: 'from-cyan-500/20 to-blue-500/20',
    readTimeMinutes: 6,
    level: 'Avancé',
    summary: 'L\'étude de l\'infiniment petit (atomes, électrons, photons) régie par des lois probabilistes déroutantes : dualité onde-corpuscule, principe d\'incertitude et superposition d\'états.',
    content: `
À l'échelle atomique, le monde déterministe de la physique classique cède la place à un univers probabiliste.

### Les 3 Principes Piliers
1. **Dualité Onde-Corpuscule** : Une particule (comme l'électron ou le photon) se comporte à la fois comme une onde et comme une particule selon le dispositif de mesure (expérience des fentes de Young).
2. **Principe d'Incertitude de Heisenberg** : Il est physiquement impossible de connaître simultanément avec une précision absolue la position ($x$) et la vitesse ($p$) d'une particule :
$$\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$$
3. **Superposition & Intrication** : Tant qu'elle n'est pas mesurée, une particule est dans une combinaison de tous ses états possibles (paradoxe du Chat de Schrödinger).
    `,
    keyConcepts: [
      { term: 'Principe de Heisenberg', definition: 'Limite fondamentale interdisant la mesure exacte simultanée de la position et de l\'impulsion d\'une particule.' },
      { term: 'Chat de Schrödinger', definition: 'Expérience de pensée illustrant le paradoxe de la superposition quantique appliquée à l\'échelle macroscopique.' },
    ],
    relatedItemIds: ['sci_relativite', 'ai_quantum', 'sci_intelligence_artificielle'],
    flashcards: [
      { front: 'Quel physicien a formulé le principe d\'incertitude en 1927 ?', back: 'Werner Heisenberg.' },
      { front: 'Qu\'illustre l\'expérience des fentes de Young ?', back: 'La dualité onde-particule de la matière et de la lumière.' },
    ],
  },
  {
    id: 'sci_intelligence_artificielle',
    title: 'L’intelligence artificielle : Des Réseaux Neuronaux aux LLM',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Informatique & IA',
    icon: '🤖',
    color: 'from-purple-500/20 to-pink-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'La discipline informatique visant à créer des systèmes capables d\'effectuer des tâches requérant l\'intelligence humaine (vision, langage, raisonnement, prise de décision).',
    content: `
L'essor récent de l'IA repose sur le **Deep Learning** (apprentissage profond par réseaux de neurones artificiels multi-couches) et l'accès à des volumes gigantesques de données (Big Data) et de puissance GPU.

### Évolution Historique
- **1950 (Test de Turing)** : Alan Turing pose la question : « Les machines peuvent-elles penser ? ».
- **1997 (Deep Blue)** : L'ordinateur d'IBM bat le champion du monde d'échecs Garry Kasparov.
- **2016 (AlphaGo)** : DeepMind bat le champion Lee Sedol au jeu de Go grâce à l'apprentissage par renforcement.
- **2022+ (Ère Générative)** : Les Transformers (GPT-4, Gemini) génèrent du texte, du code et des images de manière fluide.
    `,
    keyConcepts: [
      { term: 'Deep Learning', definition: 'Sous-domaine du Machine Learning utilisant des réseaux de neurones profonds à multiples couches cachées.' },
      { term: 'Test de Turing', definition: 'Épreuve proposée par Alan Turing où un juge humain doit distinguer s\'il converse avec un humain ou une machine.' },
    ],
    relatedItemIds: ['fig_alan_turing', 'sci_internet', 'ai_transformers'],
    flashcards: [
      { front: 'Qui a proposé le célèbre test d\'intelligence des machines en 1950 ?', back: 'Alan Turing.' },
      { front: 'Quel système d\'IA a vaincu le champion du monde de Go en 2016 ?', back: 'AlphaGo (Google DeepMind).' },
    ],
  },
  {
    id: 'sci_batteries_lithium',
    title: 'Les batteries lithium-ion & la Transition Énergétique',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Énergie & Chimie',
    icon: '🔋',
    color: 'from-emerald-500/20 to-teal-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Technologie d\'accumulateur récompensée par le Prix Nobel de chimie 2019 ayant permis l\'explosion des smartphones, des ordinateurs portables et des véhicules électriques.',
    content: `
Inventée grâce aux travaux de John Goodenough, Stanley Whittingham et Akira Yoshino, la batterie lithium-ion stocke une quantité d'énergie par unité de poids bien supérieure aux anciennes batteries au plomb ou nickel.

### Fonctionnement Électrochimique
Pendant la décharge, les ions lithium ($Li^+$) migrent de l'anode (en graphite) vers la cathode (en oxyde de cobalt ou phosphate de fer) à travers un électrolyte liquide, libérant des électrons dans le circuit externe.
Le défi contemporain concerne le recyclage et la recherche sur les **batteries à l'état solide (Solid-State)** pour doubler l'autonomie et éliminer les risques d'incendie.
    `,
    keyConcepts: [
      { term: 'Densité Énergétique', definition: 'Quantité d\'énergie qu\'une batterie peut stocker par rapport à sa masse ou son volume (exprimée en Wh/kg).' },
      { term: 'Batterie Solide (Solid-State)', definition: 'Batterie de nouvelle génération remplaçant l\'électrolyte liquide inflammable par un matériau céramique ou polymère solide.' },
    ],
    relatedItemIds: ['fig_elon_musk', 'sci_internet'],
    flashcards: [
      { front: 'En quelle année le Prix Nobel de chimie a-t-il récompensé les inventeurs de la batterie Li-ion ?', back: 'En 2019.' },
      { front: 'Quel est l\'avantage clé des futures batteries à l\'état solide ?', back: 'Une plus haute densité énergétique et l\'élimination du risque d\'incendie.' },
    ],
  },
  {
    id: 'sci_internet',
    title: 'Le fonctionnement d’Internet : Des Câbles sous-marins au DNS',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Réseaux & Télécoms',
    icon: '🌐',
    color: 'from-blue-500/20 to-cyan-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Internet n\'est pas un « nuage » immatériel : c\'est une gigantesque infrastructure physique mondiale de câbles sous-marins en fibre optique et de routeurs régis par le protocole TCP/IP.',
    content: `
Plus de 98% du trafic Internet intercontinental transite au fond des océans par des câbles sous-marins de la taille d'un tuyau d'arrosage.

### Les Couches Piliers d'Internet
1. **TCP/IP** : Découpe les fichiers en petits paquets de données numérotés, les achemine par des routes différentes et les réassemble à destination sans perte.
2. **DNS (Domain Name System)** : L'annuaire d'Internet traduisant les noms compréhensibles (ex: \`nexus.com\`) en adresses IP chiffrées (ex: \`192.0.2.1\`).
3. **HTTP / HTTPS** : Protocole sécurisé de transfert des pages web entre serveurs et navigateurs.
    `,
    keyConcepts: [
      { term: 'TCP/IP', definition: 'Ensemble des protocoles de communication fondamentaux permettant le routage et l\'échange de données sur Internet.' },
      { term: 'DNS (Domain Name System)', definition: 'Système qui associe un nom de domaine textuel à une adresse IP numérique.' },
    ],
    relatedItemIds: ['sci_intelligence_artificielle', 'fig_steve_jobs', 'fig_alan_turing'],
    flashcards: [
      { front: 'Par où transite plus de 98% du trafic Internet mondial ?', back: 'Par des câbles sous-marins en fibre optique.' },
      { front: 'Quel protocole joue le rôle d\'annuaire traduisant les noms de domaine en adresses IP ?', back: 'Le DNS (Domain Name System).' },
    ],
  },
  {
    id: 'sci_crispr',
    title: 'CRISPR-Cas9 & l’Édition Génétique',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Biotechnologies',
    icon: '🧬',
    color: 'from-pink-500/20 to-purple-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Découverte récompensée par le Prix Nobel 2020 permettant de couper, modifier et réparer l\'ADN de n\'importe quelle cellule vivante avec la précision d\'un traitement de texte.',
    content: `
Découvert par Emmanuelle Charpentier et Jennifer Doudna, le système **CRISPR-Cas9** s'inspire du système immunitaire naturel des bactéries contre les virus.

### Comment fonctionnent les « Ciseaux Moléculaires » ?
1. Un **ARN guide** reconnaît la séquence exacte d'ADN défectueuse à cibler.
2. L'enzyme **Cas9** agit comme une paire de ciseaux et coupe précisément l'ADN à cet endroit.
3. Les mécanismes naturels de réparation cellulaire insèrent ou corrigent le gène sain.

### Applications Révolutionnaires & Éthique
Traitements de la drépanocytose, thérapies anticancéreuses, création de cultures agricoles résistantes à la sécheresse, mais débats éthiques intenses sur la modification héréditaire des embryons humains.
    `,
    keyConcepts: [
      { term: 'Cas9', definition: 'Enzyme endonucléase capable de découper des brins d\'ADN ciblés avec une extrême précision.' },
      { term: 'ARN Guide', definition: 'Brin d\'ARN synthétique programmé pour diriger l\'enzyme Cas9 vers la séquence d\'ADN exacte à modifier.' },
    ],
    relatedItemIds: ['sci_evolution', 'sci_neurosciences'],
    flashcards: [
      { front: 'Qui a reçu le Prix Nobel de chimie en 2020 pour l\'invention de CRISPR-Cas9 ?', back: 'Emmanuelle Charpentier et Jennifer Doudna.' },
      { front: 'Quelle est la fonction de l\'enzyme Cas9 ?', back: 'Couper le brin d\'ADN au point précis indiqué par l\'ARN guide.' },
    ],
  },
  {
    id: 'sci_neurosciences',
    title: 'Les neurosciences : Cartographie des 86 milliards de neurones',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Biologie & Cerveau',
    icon: '🧠',
    color: 'from-purple-500/20 to-indigo-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'L\'exploration scientifique du système nerveux central, de la chimie synaptique aux réseaux neuronaux régissant la conscience, la mémoire et les émotions.',
    content: `
Le cerveau humain contient environ **86 milliards de neurones**, chacun formant jusqu'à 10 000 connexions synaptiques, créant un réseau de plus de 100 000 milliards de synapses.

### Les Grands Systèmes Cérébraux
- **Cortex Préfrontal** : Siège des fonctions exécutives, de la planification, de la logique et du contrôle des impulsions.
- **Hippocampe** : Console et encode les souvenirs à court terme vers la mémoire à long terme.
- **Amygdale** : Détecte les menaces et orchestre les réponses émotionnelles primaires (peur, colère).
- **Neurotransmetteurs Clés** : Dopamine (motivation), Sérotonine (humeur), GABA (inhibition/calme), Acétylcholine (apprentissage).
    `,
    keyConcepts: [
      { term: 'Synapse', definition: 'Zone de jonction et de transmission d\'informations chimiques ou électriques entre deux neurones.' },
      { term: 'Neuroplasticité', definition: 'Capacité du cerveau à créer de nouvelles voies synaptiques et à se réorganiser tout au long de la vie.' },
    ],
    relatedItemIds: ['psy_dopamine', 'sci_sommeil', 'psy_dunning_kruger'],
    flashcards: [
      { front: 'Combien de neurones contient environ le cerveau humain ?', back: 'Environ 86 milliards de neurones.' },
      { front: 'Quelle région du cerveau est responsable de la consolidation de la mémoire ?', back: 'L\'hippocampe.' },
    ],
  },
  {
    id: 'sci_evolution',
    title: 'La théorie de l’évolution & la Sélection Naturelle',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Biologie Fondamentale',
    icon: '🦎',
    color: 'from-emerald-500/20 to-amber-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Formulée par Charles Darwin en 1859, la théorie de l\'évolution explique la diversité du vivant par la descendance avec modification et la sélection naturelle des traits adaptatifs les plus favorables.',
    content: `
Dans son ouvrage monumental *« De l'origine des espèces »* (1859), Charles Darwin démontre que toutes les formes de vie descendent d'ancêtres communs.

### Les 3 Moteurs de l'Évolution
1. **La Variabilité Génétique** : Des mutations aléatoires dans l'ADN font apparaître de nouveaux caractères héréditaires au sein d'une espèce.
2. **La Pression Environnementale** : Les ressources limitées, les prédateurs et les climats sélectionnent les individus les mieux adaptés (**« Survival of the fittest »**).
3. **Le Succès Reproducteur Différentiel** : Les individus porteurs de traits avantageux survivent plus longtemps et transmettent ces gènes à leur descendance.
    `,
    keyConcepts: [
      { term: 'Sélection Naturelle', definition: 'Mécanisme par lequel les individus possédant des caractéristiques avantageuses dans leur environnement ont plus de chances de se reproduire.' },
      { term: 'Spéciation', definition: 'Processus évolutif menant à l\'apparition de nouvelles espèces distinctes à partir d\'une population ancestrale commune.' },
    ],
    relatedItemIds: ['sci_crispr', 'sci_neurosciences'],
    flashcards: [
      { front: 'Quel naturaliste a publié « De l\'origine des espèces » en 1859 ?', back: 'Charles Darwin.' },
      { front: 'Quel est le moteur principal de l\'évolution des espèces ?', back: 'La sélection naturelle des mutations génétiques avantageuses.' },
    ],
  },
  {
    id: 'sci_sommeil',
    title: 'Le fonctionnement du sommeil & les Cycles Circadiens',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Neurobiologie & Santé',
    icon: '💤',
    color: 'from-indigo-500/20 to-purple-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Le sommeil n\'est pas une simple extinction d\'activité : c\'est un processus actif indispensable au nettoyage des toxines cérébrales, à la consolidation mémorielle et à l\'équilibre hormonal.',
    content: `
Le sommeil s'organise en cycles successifs d'environ 90 minutes alternant deux grandes phases :

### Les Deux Grands Stades
1. **Sommeil Lent Profond (NREM)** : Ralentissement cardiaque, sécrétion de l'hormone de croissance, récupération physique et activation du **système glymphatique** (nettoyage des protéines bêta-amyloïdes du cerveau).
2. **Sommeil Paradoxal (REM)** : Activité cérébrale intense, mouvements oculaires rapides et rêves vifs ; indispensable à la consolidation de la mémoire émotionnelle et à la créativité.

### Le Rythme Circadien & la Mélatonine
Horloge biologique interne de 24h synchronisée par la lumière du soleil via le noyau suprachiasmatique, qui déclenche la sécrétion de **mélatonine** à la tombée de la nuit.
    `,
    keyConcepts: [
      { term: 'Système Glymphatique', definition: 'Système de drainage éliminant les déchets métaboliques et toxines accumulés dans le cerveau pendant la nuit.' },
      { term: 'Mélatonine', definition: 'Hormone produite par la glande pinéale régulant l\'endormissement en réponse à l\'obscurité.' },
    ],
    relatedItemIds: ['sci_neurosciences', 'psy_dopamine'],
    flashcards: [
      { front: 'Combien de temps dure en moyenne un cycle complet de sommeil ?', back: 'Environ 90 minutes.' },
      { front: 'Quelle hormone régule le signal de l\'endormissement ?', back: 'La mélatonine.' },
    ],
  },
  {
    id: 'sci_conquete_spatiale',
    title: 'La conquête spatiale : D’Apollo aux Voyages vers Mars',
    domainId: 'science_tech',
    domainName: 'Science & Technologie',
    category: 'Astronomie & Espace',
    icon: '🚀',
    color: 'from-cyan-500/20 to-indigo-500/20',
    readTimeMinutes: 6,
    level: 'Débutant',
    summary: 'De l\'envoi de Spoutnik en 1957 et des premiers pas d\'Armstrong sur la Lune (1969) au télescope James Webb et aux missions habitées vers Mars.',
    content: `
L'exploration spatiale a débuté comme une rivalité géopolitique féroce de guerre froide avant de devenir une collaboration scientifique internationale (ISS) puis une industrie commerciale (**New Space**).

### Les Grandes Étapes
- **1961 (Youri Gagarine)** : Premier être humain dans l'espace.
- **1969 (Apollo 11)** : Neil Armstrong et Buzz Aldrin posent le pied sur la Lune (« Un petit pas pour l'homme, un bond de géant pour l'humanité »).
- **2021 (Télescope James Webb - JWST)** : Observation des premières galaxies nées après le Big Bang et analyse des atmosphères d'exoplanètes.
- **Le Programme Artemis & Mars** : Retour durable sur la Lune pour y établir une base permanente préparant les premiers vols habités vers la planète rouge.
    `,
    keyConcepts: [
      { term: 'Programme Artemis', definition: 'Programme spatial international de la NASA visant à renvoyer des astronautes sur la Lune et y établir une base permanente.' },
      { term: 'Télescope James Webb', definition: 'Télescope spatial infrarouge ultra-puissant observant les confins de l\'Univers à 1,5 million de km de la Terre.' },
    ],
    relatedItemIds: ['fig_elon_musk', 'sci_relativite', 'hist_guerre_froide'],
    flashcards: [
      { front: 'Qui fut le premier humain dans l\'espace en 1961 ?', back: 'Youri Gagarine.' },
      { front: 'Quel est le nom du programme spatial actuel préparant le retour sur la Lune ?', back: 'Le programme Artemis.' },
    ],
  },

  // =========================================================================
  // 4. PSYCHOLOGIE & PHILOSOPHIE
  // =========================================================================
  {
    id: 'phil_stoicisme',
    title: 'Le stoïcisme : Maîtriser ce qui dépend de nous',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Philosophie Antique',
    icon: '🏛️',
    color: 'from-cyan-500/20 to-blue-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Fondé par Zénon de Cition et porté par Marc Aurèle, Épictète et Sénèque, le stoïcisme enseigne la paix intérieure (**ataraxie**) en distinguant ce qui dépend de notre volonté de ce qui ne dépend pas d\'elle.',
    content: `
Le principe cardinal du stoïcisme est résumé par la **dichotomie du contrôle** d'Épictète :

### La Règle d'Or
1. **Ce qui dépend de nous** : Nos pensées, nos jugements, nos intentions, nos désirs et nos réactions morales.
2. **Ce qui ne dépend pas de nous** : La météo, les actions d'autrui, la maladie, la réputation, le cours de la bourse et la mort.

Souffrir d'événements extérieurs est une erreur de jugement : ce ne sont pas les choses qui nous perturbent, mais l'opinion que nous portons sur elles.
    `,
    keyConcepts: [
      { term: 'Dichotomie du Contrôle', definition: 'Distinction stoïcienne fondamentale entre ce qui est en notre pouvoir direct et ce qui échappe à notre volonté.' },
      { term: 'Amor Fati', definition: 'Amour et acceptation sereine de son destin, quel qu\'il soit.' },
    ],
    relatedItemIds: ['fig_marcus_aurelius', 'psy_frankl', 'psy_biais_cognitifs'],
    flashcards: [
      { front: 'Quelle distinction fondamentale fait Épictète au début de son Manuel ?', back: 'La distinction entre les choses qui dépendent de nous et celles qui n\'en dépendent pas.' },
      { front: 'Quels sont les 3 grands philosophes stoïciens romains ?', back: 'Marc Aurèle, Sénèque et Épictète.' },
    ],
  },
  {
    id: 'phil_absurde_camus',
    title: 'L’absurde chez Camus : Vivre sans appel',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Philosophie Existentielle',
    icon: '🪨',
    color: 'from-amber-500/20 to-orange-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Dans « Le Mythe de Sisyphe » (1942), Albert Camus définit l\'absurde comme la confrontation tragique entre le besoin humain de sens et le silence irrationnel du monde.',
    content: `
L'absurde n'est ni dans l'homme seul, ni dans le monde seul : il naît de leur face-à-face.

### Les 3 Réponses Face à l'Absurde
1. **Le suicide physique** : Rejeté par Camus comme une capitulation lâche.
2. **Le suicide philosophique (l'espoir religieux)** : Rejeté comme une illusion réconfortante.
3. **La Révolte lucide** : Accepter l'absurdité du monde tout en choisissant de vivre intensément, passionnément et librement.

*« Il faut imaginer Sisyphe heureux »* : En roulant son rocher sans fin, Sisyphe est le héros suprême de la conscience lucide et de la liberté.
    `,
    keyConcepts: [
      { term: 'Sentiment de l\'Absurde', definition: 'Prise de conscience du divorce entre l\'aspiration humaine à la clarté et le chaos muet de l\'Univers.' },
      { term: 'Révolte Camussienne', definition: 'Refus de la résignation et célébration lucide de l\'existence présente malgré l\'absence de sens ultime.' },
    ],
    relatedItemIds: ['psy_frankl', 'phil_stoicisme'],
    flashcards: [
      { front: 'Dans quel essai philosophique majeur Albert Camus développe-t-il la notion d\'absurde ?', back: '« Le Mythe de Sisyphe » (1942).' },
      { front: 'Par quelle célèbre phrase se termine « Le Mythe de Sisyphe » ?', back: '« Il faut imaginer Sisyphe heureux ».' },
    ],
  },
  {
    id: 'psy_biais_cognitifs',
    title: 'Les biais cognitifs : Les raccourcis trompeurs du cerveau',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Sciences Cognitives',
    icon: '🪤',
    color: 'from-purple-500/20 to-indigo-500/20',
    readTimeMinutes: 6,
    level: 'Débutant',
    summary: 'Décrits par Daniel Kahneman et Amos Tversky, les biais cognitifs sont des distorsions systématiques de la pensée logique dues aux raccourcis automatiques de notre Système 1 (pensée rapide).',
    content: `
Notre cerveau emploie des raccourcis mentaux (**heuristiques**) pour économiser son énergie et réagir vite, mais ces automatismes génèrent des erreurs de jugement prévisibles :

### Les 4 Biais les Plus Répandus
- **Biais de Confirmation** : Recherche et mémorisation exclusive des faits qui valident nos préjugés préexistants.
- **Biais d'Ancrage** : Tendance à se focaliser excessivement sur la première information reçue (prix initial, premier chiffre mentionné).
- **Aversion à la Perte** : La douleur psychologique d'une perte est ressentie environ deux fois plus intensément que le plaisir d'un gain équivalent.
- **Biais du Survivant** : Tirer des conclusions en analysant uniquement les réussites visibles en oubliant la masse invisible des échecs.
    `,
    keyConcepts: [
      { term: 'Système 1 et Système 2', definition: 'Modèle de Kahneman : Système 1 (rapide, intuitif, automatique) vs Système 2 (lent, analytique, réflexif).' },
      { term: 'Biais du Survivant', definition: 'Erreur logique consistant à surestimer les chances de succès en se focalisant uniquement sur ceux qui ont réussi.' },
    ],
    relatedItemIds: ['psy_dunning_kruger', 'phil_logic', 'econ_bulles_speculatives'],
    flashcards: [
      { front: 'Quel psychologue nobélisé a écrit « Système 1 / Système 2 : Les deux vitesses de la pensée » ?', back: 'Daniel Kahneman.' },
      { front: 'Qu\'est-ce que l\'aversion à la perte ?', back: 'Le fait que la douleur d\'une perte financière soit ressentie 2 fois plus fort que la joie d\'un gain équivalent.' },
    ],
  },
  {
    id: 'psy_dunning_kruger',
    title: 'L’effet Dunning-Kruger : Pourquoi les incompétents se croient experts',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Psychologie Sociale',
    icon: '🏔️',
    color: 'from-pink-500/20 to-purple-500/20',
    readTimeMinutes: 4,
    level: 'Débutant',
    summary: 'Biais cognitif démontrant que les individus les moins qualifiés dans un domaine surestiment massivement leurs compétences, tandis que les experts ont tendance à douter d\'eux-mêmes.',
    content: `
Mis en évidence en 1999 par David Dunning et Justin Kruger à l'université Cornell, ce phénomène décrit la courbe d'apprentissage :

### La Courbe Dunning-Kruger
1. **La « Montagne de l'Incompétence » (Mont Stupide)** : Avec un minimum de connaissances superficielles, la confiance en soi est maximale.
2. **La « Vallée de l'Humilité »** : En approfondissant le sujet, on prend conscience de la complexité réelle et la confiance s'effondre.
3. **Le « Plateau de la Compétence »** : Après des années de pratique, l'expertise réelle s'installe avec une juste mesure de ses connaissances.
    `,
    keyConcepts: [
      { term: 'Métacognition', definition: 'Capacité à évaluer la qualité et les limites de ses propres processus de pensée.' },
      { term: 'Syndrome de l\'Imposteur', definition: 'Doute persistant de ses propres compétences chez les personnes hautement qualifiées.' },
    ],
    relatedItemIds: ['psy_biais_cognitifs', 'neuro_metacognition'],
    flashcards: [
      { front: 'Que décrit l\'effet Dunning-Kruger ?', back: 'Les novices ont tendance à surestimer leur compétence, tandis que les experts sous-estiment la leur.' },
      { front: 'En quelle année l\'étude de Dunning et Kruger a-t-elle été publiée ?', back: 'En 1999.' },
    ],
  },
  {
    id: 'psy_maslow',
    title: 'La pyramide de Maslow : Hiérarchie des Besoins Humains',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Psychologie Humaniste',
    icon: '🔺',
    color: 'from-amber-500/20 to-red-500/20',
    readTimeMinutes: 4,
    level: 'Débutant',
    summary: 'Modèle hiérarchique proposé par Abraham Maslow en 1943 articulant les besoins humains en 5 niveaux, des besoins physiologiques vitaux à l\'accomplissement de soi.',
    content: `
Maslow postule qu'un être humain ne peut pleinement se consacrer à des besoins supérieurs que si ses besoins de base sont raisonnablement satisfaits.

### Les 5 Niveaux de la Pyramide
1. **Besoins Physiologiques** : Faim, soif, sommeil, respiration, abri.
2. **Besoin de Sécurité** : Stabilité de l'emploi, sécurité physique, santé, ressources financières.
3. **Besoin d'Appartenance** : Amour, amitié, relations familiales, intégration dans un groupe.
4. **Besoin d'Estime** : Respect de soi, reconnaissance sociale, confiance, statut.
5. **Besoin d'Accomplissement de Soi** : Réalisation de son plein potentiel, créativité, quête spirituelle et éthique.
    `,
    keyConcepts: [
      { term: 'Accomplissement de Soi', definition: 'Sommet de la pyramide de Maslow désignant la réalisation complète de son potentiel créatif et humain.' },
    ],
    relatedItemIds: ['psy_frankl', 'psy_dopamine'],
    flashcards: [
      { front: 'Quel psychologue a conceptualisé la hiérarchie des besoins en 1943 ?', back: 'Abraham Maslow.' },
      { front: 'Quel est le sommet de la pyramide de Maslow ?', back: 'Le besoin d\'accomplissement de soi.' },
    ],
  },
  {
    id: 'psy_dopamine',
    title: 'La dopamine : Molécule du Désir & Circuit de la Récompense',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Neurobiologie Comportementale',
    icon: '✨',
    color: 'from-pink-500/20 to-purple-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'La dopamine n\'est pas la molécule du plaisir obtenu, mais celle de l\'anticipation, du désir et de la motivation qui nous pousse à agir et poursuivre des objectifs.',
    content: `
Le système dopaminergique mésolimbique s'active lors de la promesse d'une récompense (nourriture, statut social, likes sur les réseaux sociaux, victoire dans un jeu).

### Le Mécanisme de l'Addiction Moderne
Les applications numériques exploitent le mécanisme des **récompenses variables imprévisibles** (comme les machines à sous) pour générer des pics répétés de dopamine.
Lorsque les stimuli sont trop fréquents, les récepteurs cérébraux s'insensibilisent, provoquant le phénomène de tolérance et d'ennui chronique.
    `,
    keyConcepts: [
      { term: 'Circuit de la Récompense', definition: 'Réseau neuronal (aire tegmentale ventrale, noyau accumbens) renforçant les comportements favorisant la survie par libération de dopamine.' },
      { term: 'Tolérance Dopaminergique', definition: 'Diminution de la sensibilité des récepteurs cérébraux suite à une surstimulation chronique.' },
    ],
    relatedItemIds: ['sci_neurosciences', 'sci_sommeil'],
    flashcards: [
      { front: 'Quel rôle principal joue la dopamine dans le comportement humain ?', back: 'Elle stimule la motivation, le désir et l\'anticipation d\'une récompense.' },
      { front: 'Quel type de récompense génère les plus forts pics de dopamine ?', back: 'Les récompenses aléatoires et imprévisibles.' },
    ],
  },
  {
    id: 'psy_stanford_milgram',
    title: 'L’expérience de Stanford & l’Expérience de Milgram',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Psychologie Sociale',
    icon: '⚡',
    color: 'from-red-500/20 to-amber-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'Deux expériences phares des années 1960-70 démontrant comment des individus ordinaires peuvent infliger des sévices extrêmes sous l\'effet de l\'autorité (Milgram) ou de l\'attribution d\'un rôle de pouvoir déshumanisant (Stanford).',
    content: `
### 1. L'Expérience de Milgram (1961)
À l'université Yale, Stanley Milgram demande à des volontaires d'administrer des chocs électriques croissants (jusqu'à 450 volts, potentiellement mortels) à un complice chaque fois qu'il se trompe.
**Résultat stupéfiant** : 65% des participants ont obéi jusqu'au choc maximal sous l'injonction calme d'une figure d'autorité en blouse blanche (**état agentique**).

### 2. L'Expérience de Stanford (1971)
Philip Zimbardo recrée une prison fictive avec des étudiants répartis au hasard entre « gardiens » et « prisonniers ». En moins de 6 jours, les gardiens ont sombré dans le sadisme psychologique, forçant l'interruption prématurée de l'étude.
    `,
    keyConcepts: [
      { term: 'État Agentique', definition: 'Concept de Milgram : état où l\'individu se considère comme le simple exécutant de la volonté d\'une autorité légitime.' },
      { term: 'Effet Lucifer', definition: 'Transformation d\'individus bienveillants en bourreaux sous la pression d\'un environnement institutionnel toxique.' },
    ],
    relatedItemIds: ['psy_biais_cognitifs', 'phil_absurde_camus'],
    flashcards: [
      { front: 'Quel pourcentage de sujets a administré le choc électrique maximal de 450V dans l\'expérience de Milgram ?', back: 'Environ 65% des participants.' },
      { front: 'Qui a dirigé l\'expérience de la prison de Stanford en 1971 ?', back: 'Philip Zimbardo.' },
    ],
  },
  {
    id: 'psy_carl_jung',
    title: 'Carl Gustav Jung : Inconscient Collectif, Archétypes & Ombre',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Psychologie Analytique',
    icon: '🎭',
    color: 'from-purple-500/20 to-blue-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'Fondateur de la psychologie analytique, Carl Jung a introduit les concepts d\'inconscient collectif, d\'archétypes universels, d\'introversion/extraversion et de l\'intégration de l\'Ombre.',
    content: `
Élève dissident de Sigmund Freud, Carl Jung a élargi la psychanalyse en explorant les mythes, les contes et les symboles universels partagés par toutes les civilisations humaines.

### Les Concepts Clés de Jung
1. **L'Inconscient Collectif** : Couche psychique profonde contenant des mémoires et symboles ancestraux partagés par toute l'humanité.
2. **Les Archétypes** : Figures universelles inscrites dans l'inconscient (Le Héros, Le Sage, La Mère Nourricière, L'Ombre, L'Anima/Animus).
3. **L'Ombre** : La partie refoulée, sombre et instinctive de notre personnalité. Selon Jung, la maturité psychologique (**Individuation**) exige de reconnaître et d'intégrer son Ombre plutôt que de la projeter sur autrui.
    `,
    keyConcepts: [
      { term: 'Archétype', definition: 'Structure psychique universelle innée se manifestant à travers les mythes, rêves et contes de toutes les cultures.' },
      { term: 'Individuation', definition: 'Processus de maturation par lequel une personne unifie les différentes composantes conscientes et inconscientes de sa psyché.' },
    ],
    relatedItemIds: ['psy_frankl', 'phil_stoicisme'],
    flashcards: [
      { front: 'Quelle couche de l\'inconscient universellement partagé Carl Jung a-t-il théorisée ?', back: 'L\'inconscient collectif.' },
      { front: 'Qu\'appelle-t-on l\'Ombre chez Jung ?', back: 'Les aspects refoulés et non reconnus de notre propre personnalité.' },
    ],
  },
  {
    id: 'psy_frankl',
    title: 'Viktor Frankl : La Logothérapie & le Sens de la Vie',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Psychologie Existentielle',
    icon: '🕯️',
    color: 'from-amber-500/20 to-yellow-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Survivant des camps d\'Auschwitz et auteur de « Découvrir un sens à sa vie », le psychiatre autrichien Viktor Frankl a fondé la logothérapie : la motivation humaine fondamentale est la quête de sens.',
    content: `
Dans les camps de concentration nazis, Frankl a observé que les prisonniers qui survivaient le plus longtemps n'étaient pas les plus forts physiquement, mais ceux qui conservaient un **but impérieux** et une raison de vivre (un proche à retrouver, une œuvre à achever).

### La Dernière des Libertés Humaines
*« On peut tout enlever à un homme sauf une chose : la dernière des libertés humaines — choisir son attitude face à n'importe quel ensemble de circonstances. »*

La logothérapie aide l'individu à trouver du sens à travers :
1. Une création ou une action concrète.
2. L'expérience de la beauté, de la nature ou de l'amour d'un être.
3. L'attitude choisie avec dignité face à une souffrance inévitable.
    `,
    keyConcepts: [
      { term: 'Logothérapie', definition: 'École de psychothérapie fondée par Viktor Frankl centrée sur la découverte d\'un sens personnel à l\'existence.' },
      { term: 'Volonté de Sens', definition: 'Motivation primaire de l\'être humain selon Frankl, supérieure à la quête de plaisir (Freud) ou de pouvoir (Adler).' },
    ],
    relatedItemIds: ['phil_stoicisme', 'phil_absurde_camus', 'psy_maslow'],
    flashcards: [
      { front: 'Quel célèbre livre le psychiatre Viktor Frankl a-t-il écrit après sa libération d\'Auschwitz ?', back: '« Découvrir un sens à sa vie » (Man\'s Search for Meaning).' },
      { front: 'Comment s\'appelle la thérapie par le sens créée par Frankl ?', back: 'La Logothérapie.' },
    ],
  },
  {
    id: 'psy_theorie_jeux',
    title: 'La théorie des jeux : Équilibre de Nash & Dilemme du Prisonnier',
    domainId: 'psychology_philosophy',
    domainName: 'Psychologie & Philosophie',
    category: 'Logique & Mathématiques Sociales',
    icon: '♟️',
    color: 'from-blue-500/20 to-indigo-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Discipline mathématique modélisant les décisions stratégiques d\'acteurs rationnels en situation d\'interdépendance (guerre, diplomatie, économie, écologie).',
    content: `
Fondée par John von Neumann et développée par John Nash (Prix Nobel 1994), la théorie des jeux analyse les choix d'individus dont les gains dépendent des choix des autres.

### Le Dilemme du Prisonnier
Deux suspects arrêtés pour un crime sont interrogés séparément :
- Si les deux gardent le silence (coopération) : 1 an de prison chacun.
- Si l'un trahit et l'autre se tait : le traître est libéré, l'autre prend 5 ans.
- Si les deux se trahissent mutuellement : 3 ans chacun.
**Résultat logique** : La rationalité individuelle pousse les deux à trahir, aboutissant à un résultat sous-optimal pour le groupe.

### L'Équilibre de Nash
Situation où aucun joueur n'a intérêt à modifier unilatéralement sa stratégie si les autres ne changent pas la leur.
    `,
    keyConcepts: [
      { term: 'Équilibre de Nash', definition: 'État d\'un jeu stratégique où aucun joueur ne peut améliorer son sort en changeant seul de stratégie.' },
      { term: 'Jeu à Somme Nulle', definition: 'Situation où le gain d\'un participant équivaut exactement à la perte d\'un autre (gains totaux = 0).' },
    ],
    relatedItemIds: ['phil_logic', 'econ_banques_centrales'],
    flashcards: [
      { front: 'Quel mathématicien a formalisé l\'Équilibre de Nash ?', back: 'John Nash (Prix Nobel d\'économie 1994).' },
      { front: 'Qu\'illustre le dilemme du prisonnier ?', back: 'Comment des choix rationnels individuels peuvent mener à une situation défavorable pour tous.' },
    ],
  },

  // =========================================================================
  // 5. PERSONNALITÉS LÉGENDAIRES
  // =========================================================================
  {
    id: 'fig_leonard_de_vinci',
    title: 'Léonard de Vinci : Le Génie Universel de la Renaissance',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Renaissance & Savoir Universel',
    icon: '🎨',
    color: 'from-amber-500/20 to-yellow-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Peintre de La Joconde, anatomiste, ingénieur militaire, architecte et botaniste, Léonard de Vinci incarne l\'idéal humaniste de l\'homme universel (Homo Universalis).',
    content: `
Né en 1452 en Toscane, Léonard de Vinci a fondé sa méthode sur l'observation empirique rigoureuse de la nature plutôt que sur les dogmes scolastiques médiévaux.

### Les Réalisations Majeures
- **Chefs-d'œuvre picturaux** : *La Joconde* (Mona Lisa) et *La Cène*, pionnier de la technique du **sfumato** (dégradé subtil sans contours nets).
- **L'Homme de Vitruve** : Dessin célèbre synthétisant les proportions idéales du corps humain et l'harmonie géométrique.
- **Inventions Visionnaires** : Croquis avant-gardistes de machines volantes (ornithoptère, parachute), de scaphandres sous-marins et de chars d'assaut des siècles avant leur réalisation technique.
    `,
    keyConcepts: [
      { term: 'Sfumato', definition: 'Technique picturale de Léonard de Vinci créant des transitions douces et vaporeuses entre ombre et lumière.' },
      { term: 'Homo Universalis', definition: 'Idéal de la Renaissance d\'un esprit accompli maîtrisant tous les arts, sciences et philosophies.' },
    ],
    relatedItemIds: ['sci_relativite', 'fig_alan_turing'],
    flashcards: [
      { front: 'Quel tableau mondialement célèbre de Léonard de Vinci est exposé au Louvre ?', back: 'La Joconde (Mona Lisa).' },
      { front: 'Quelle technique picturale créant des contours vaporeux a-t-il perfectionnée ?', back: 'Le sfumato.' },
    ],
  },
  {
    id: 'fig_napoleon_bonaparte',
    title: 'Napoléon Bonaparte : De l’Officier Corse à l’Empereur des Français',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Histoire & Stratégie',
    icon: '⚔️',
    color: 'from-red-500/20 to-amber-500/20',
    readTimeMinutes: 6,
    level: 'Intermédiaire',
    summary: 'Génie militaire et réformateur institutionnel ayant conquis la majeure partie de l\'Europe continentale et légué le Code Civil moderne avant sa chute finale à Waterloo.',
    content: `
Général issu de la Révolution française, Napoléon prend le pouvoir lors du coup d'État du 18 Brumaire (1799) puis se sacre Empereur en 1804.

### L'Héritage Civil et Institutionnel
- **Le Code Civil (1804)** : Unification du droit, égalité devant la loi et laïcisation de l'état civil, toujours à la base du droit dans des dizaines de pays.
- **Institutions Pérennes** : Création de la Banque de France, des Lycées, du Baccalauréat, du Conseil d'État et de la Légion d'Honneur.
- **Génie Tactique** : Victoire légendaire d'Austerlitz (1805) par manœuvre d'enveloppement, avant la désastreuse campagne de Russie (1812) et l'exil à Sainte-Hélène.
    `,
    keyConcepts: [
      { term: 'Code Napoléon (Code Civil)', definition: 'Recueil de lois unifiées de 1804 consacrant l\'égalité juridique et le droit de propriété.' },
      { term: 'Bataille d\'Austerlitz', definition: 'Victoire militaire éclatante de Napoléon le 2 décembre 1805 contre les armées austro-russes.' },
    ],
    relatedItemIds: ['hist_chute_rome', 'fig_winston_churchill'],
    flashcards: [
      { front: 'En quelle année le Code Civil napoléonien a-t-il été promulgué ?', back: 'En 1804.' },
      { front: 'Sur quelle île de l\'Atlantique Sud Napoléon est-il mort en exil en 1821 ?', back: 'L\'île de Sainte-Hélène.' },
    ],
  },
  {
    id: 'fig_winston_churchill',
    title: 'Winston Churchill : Le Lion Britannique face au Nazisme',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Leadership & 2nde Guerre Mondiale',
    icon: '🦁',
    color: 'from-blue-500/20 to-indigo-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Premier ministre britannique dont le courage oratoire et la détermination inébranlable ont galvanisé le Royaume-Uni et les Alliés contre l\'Allemagne nazie lors de la Seconde Guerre mondiale.',
    content: `
Nommé Premier ministre en mai 1940 au pire moment de l'offensive allemande, Churchill refuse toute négociation d'armistice avec Hitler.

### Des Discours Entrés dans la Légende
- *« Je n'ai rien d'autre à offrir que du sang, du labeur, des larmes et de la sueur. »*
- *« Nous nous battrons sur les plages, nous nous battrons sur les terrains de débarquement... nous ne nous rendrons jamais. »*
- Prix Nobel de littérature en 1953 pour ses mémoires historiques et sa maîtrise de l'éloquence.
    `,
    keyConcepts: [
      { term: 'Bataille d\'Angleterre (1940)', definition: 'Campagne aérienne décisive où la Royal Air Force a repoussé la Luftwaffe nazie.' },
      { term: 'Rideau de Fer', definition: 'Expression popularisée par Churchill en 1946 pour décrire la division de l\'Europe pendant la guerre froide.' },
    ],
    relatedItemIds: ['hist_guerre_froide', 'fig_napoleon_bonaparte'],
    flashcards: [
      { front: 'Quel Prix Nobel Winston Churchill a-t-il reçu en 1953 ?', back: 'Le Prix Nobel de littérature.' },
      { front: 'Quelle célèbre expression a-t-il popularisée en 1946 pour désigner la division de l\'Europe ?', back: 'Le « Rideau de Fer ».' },
    ],
  },
  {
    id: 'fig_steve_jobs',
    title: 'Steve Jobs : L’Intersection de la Technologie et des Arts Libéraux',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Entrepreneuriat & Innovation Tech',
    icon: '🍎',
    color: 'from-gray-500/20 to-indigo-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Cofondateur d\'Apple et de Pixar, visionnaire du design et du marketing ayant transformé l\'informatique personnelle, la musique (iPod), la téléphonie (iPhone) et l\'animation 3D.',
    content: `
Steve Jobs a révolutionné 6 industries majeures grâce à son obsession du design épuré, de la simplicité d'usage et de l'intégration verticale matériel/logiciel.

### Les Grands Lancements
- **1984 (Macintosh)** : Premier ordinateur personnel grand public avec interface graphique et souris.
- **2001 (iPod & iTunes)** : Réinvention de l'industrie musicale (« 1000 chansons dans votre poche »).
- **2007 (iPhone)** : Écran tactile multipoint, navigateur web complet et naissance de l'App Store.
- **Philosophie** : *« Stay hungry, stay foolish »* (Restez insatiables, restez fous).
    `,
    keyConcepts: [
      { term: 'Champ de Distorsion de la Réalité', definition: 'Capacité charismatique de Steve Jobs à convaincre ses équipes de réaliser l\'impossible dans des délais records.' },
      { term: 'Intégration Verticale', definition: 'Contrôle complet par une entreprise du matériel, du système d\'exploitation et des services logiciels.' },
    ],
    relatedItemIds: ['sci_internet', 'fig_elon_musk', 'econ_private_equity'],
    flashcards: [
      { front: 'En quelle année Steve Jobs a-t-il dévoilé le premier iPhone ?', back: 'En janvier 2007.' },
      { front: 'Quel studio d\'animation 3D a-t-il financé et dirigé après son départ d\'Apple en 1985 ?', back: 'Pixar (créateur de Toy Story).' },
    ],
  },
  {
    id: 'fig_elon_musk',
    title: 'Elon Musk : Ingénierie des Premiers Principes & Rêve Multiplanétaire',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Aérospatiale & Véhicules Électriques',
    icon: '🚀',
    color: 'from-cyan-500/20 to-orange-500/20',
    readTimeMinutes: 6,
    level: 'Débutant',
    summary: 'Fondateur de SpaceX, PDG de Tesla, Neuralink et xAI, appliquant la méthode de raisonnement par les premiers principes pour diviser par 10 le coût d\'accès à l\'espace et accélérer la transition énergétique.',
    content: `
Elon Musk a cofondé Zip2 puis X.com (devenu PayPal) avant de réinvestir l'intégralité de sa fortune dans SpaceX (2002) et Tesla (2004).

### Réalisations Majeures
- **SpaceX & Falcon 9** : Première fusée orbitale réutilisable atterrissant à la verticale, réduisant drastiquement le coût du kilo en orbite.
- **Starlink** : Constellation de milliers de satellites offrant Internet haut débit partout sur Terre.
- **Tesla** : Démocratisation mondiale des véhicules électriques haute performance.
- **Méthode** : Raisonnement par les **Premiers Principes** (décomposer un problème complexe à ses vérités fondamentales physiques plutôt que raisonner par analogie).
    `,
    keyConcepts: [
      { term: 'Premiers Principes', definition: 'Méthode de réflexion consistant à décomposer un problème jusqu\'à ses vérités fondamentales sans se fier aux conventions.' },
      { term: 'Fusée Réutilisable', definition: 'Lanceur spatial dont le premier étage revient se poser sur Terre pour revoler plusieurs dizaines de fois.' },
    ],
    relatedItemIds: ['sci_conquete_spatiale', 'sci_batteries_lithium', 'fig_steve_jobs'],
    flashcards: [
      { front: 'Quelle innovation majeure a permis à la fusée Falcon 9 de réduire les coûts spatiaux ?', back: 'La réutilisabilité du premier étage atterrissant à la verticale.' },
      { front: 'Comment s\'appelle la méthode de raisonnement fondamentale prônée par Elon Musk ?', back: 'Le raisonnement par les premiers principes.' },
    ],
  },
  {
    id: 'fig_warren_buffett',
    title: 'Warren Buffett : « L’Oracle d’Omaha » & le Value Investing',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Finance & Bourse',
    icon: '📈',
    color: 'from-emerald-500/20 to-yellow-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Considéré comme le plus grand investisseur boursier de tous les temps, PDG de Berkshire Hathaway, appliquant la philosophie du « Value Investing » (acheter des entreprises exceptionnelles à un prix raisonnable pour le très long terme).',
    content: `
Élève de Benjamin Graham (auteur de *L'Investisseur Intelligent*), Warren Buffett a bâti une fortune de plus de 100 milliards de dollars grâce à la patience et à la discipline.

### Les 3 Règles d'Or de Buffett
1. **Règle n°1** : Ne jamais perdre d'argent. **Règle n°2** : Ne jamais oublier la règle n°1.
2. **Le Fossé Concurrentiel (Moat)** : N'investir que dans des entreprises dotées d'un avantage compétitif durable quasi-inattaquable (ex: Coca-Cola, Apple, American Express).
3. **Cercle de Compétence** : N'investir que dans ce que l'on comprend parfaitement.
    `,
    keyConcepts: [
      { term: 'Moat (Fossé Économique)', definition: 'Avantage concurrentiel défensif et durable protégeant la rentabilité d\'une entreprise contre ses rivaux.' },
      { term: 'Value Investing', definition: 'Stratégie consistant à acheter des actions dont le cours est inférieur à leur valeur intrinsèque réelle.' },
    ],
    relatedItemIds: ['econ_interet_compose', 'econ_etf', 'econ_bulles_speculatives'],
    flashcards: [
      { front: 'Quel est le surnom de Warren Buffett ?', back: 'L\'Oracle d\'Omaha.' },
      { front: 'Qu\'appelle-t-on le « Moat » d\'une entreprise selon Buffett ?', back: 'Son avantage concurrentiel durable (fossé défensif).' },
    ],
  },
  {
    id: 'fig_alan_turing',
    title: 'Alan Turing : Le Père de l’Informatique & le Déchiffreur d’Enigma',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Mathématiques & Informatique',
    icon: '💻',
    color: 'from-blue-500/20 to-purple-500/20',
    readTimeMinutes: 5,
    level: 'Intermédiaire',
    summary: 'Mathématicien britannique ayant théorisé la machine universelle de Turing (fondement des ordinateurs modernes) et cassé le code secret de la machine Enigma nazie à Bletchley Park.',
    content: `
Alan Turing est l'un des plus grands esprits scientifiques du XXe siècle.

### Les Contributions Historiques
- **La Machine de Turing (1936)** : Modèle abstrait prouvant qu'une machine universelle programmable peut exécuter n'importe quel algorithme mathématique.
- **Bletchley Park & Enigma** : Conçoit la machine électromécanique *« Bombe »* qui décrypte les messages chiffrés de l'armée nazie, raccourcissant la Seconde Guerre mondiale de deux ans et sauvant des millions de vies.
- **Pionnier de l'IA** : Propose le célèbre Test de Turing en 1950.
    `,
    keyConcepts: [
      { term: 'Machine de Turing', definition: 'Modèle conceptuel universel posant les bases de l\'architecture des ordinateurs et de l\'informatique théorique.' },
      { term: 'Enigma', definition: 'Machine de chiffrement électromécanique utilisée par l\'armée allemande pendant la 2nde Guerre mondiale.' },
    ],
    relatedItemIds: ['sci_intelligence_artificielle', 'sci_internet'],
    flashcards: [
      { front: 'Quel code secret de l\'armée nazie Alan Turing a-t-il brisé à Bletchley Park ?', back: 'Le code Enigma.' },
      { front: 'Quel concept théorique de 1936 est la base de tous les ordinateurs modernes ?', back: 'La Machine universelle de Turing.' },
    ],
  },
  {
    id: 'fig_marie_curie',
    title: 'Marie Curie : Double Prix Nobel & Pionnière de la Radioactivité',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Physique & Chimie',
    icon: '✨',
    color: 'from-indigo-500/20 to-pink-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Seule personne de l\'histoire à avoir reçu deux Prix Nobel dans deux disciplines scientifiques distinctes (Physique en 1903 et Chimie en 1911) pour ses découvertes sur le polonium, le radium et la radioactivité.',
    content: `
D'origine polonaise et installée à Paris, Marie Skłodowska-Curie a mené des recherches héroïques dans des conditions matérielles précaires avec son époux Pierre Curie.

### Les Découvertes Majeures
- Découverte et isolation de deux nouveaux éléments hautement radioactifs : le **Polonium** (nommé en hommage à sa Pologne natale) et le **Radium**.
- Première femme professeure à la Sorbonne.
- Pendant la Première Guerre mondiale, elle crée les **« Petites Curies »**, des ambulances radiologiques mobiles pour radiographier les soldats blessés au front.
    `,
    keyConcepts: [
      { term: 'Radioactivité', definition: 'Phénomène physique naturel par lequel des noyaux atomiques instables se désintègrent en émettant des rayonnements d\'énergie.' },
      { term: 'Petites Curies', definition: 'Véhicules équipés d\'appareils à rayons X créés par Marie Curie pour soigner les soldats de 14-18.' },
    ],
    relatedItemIds: ['hist_projet_manhattan', 'sci_mecanique_quantique'],
    flashcards: [
      { front: 'Quels sont les deux Prix Nobel obtenus par Marie Curie ?', back: 'Prix Nobel de Physique (1903) et Prix Nobel de Chimie (1911).' },
      { front: 'Quels deux éléments chimiques radioactifs a-t-elle découverts ?', back: 'Le Polonium et le Radium.' },
    ],
  },
  {
    id: 'fig_nelson_mandela',
    title: 'Nelson Mandela : Du Bagne de Robben Island à la Présidence d’Afrique du Sud',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Histoire & Droits Humains',
    icon: '🇿🇦',
    color: 'from-emerald-500/20 to-amber-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Héros de la lutte anti-apartheid, emprisonné pendant 27 ans, Prix Nobel de la Paix 1993 et premier président noir d\'Afrique du Sud, symbole universel du pardon et de la réconciliation nationale.',
    content: `
Surnommé « Madiba », Nelson Mandela a dirigé la branche armée de l'ANC avant d'être condamné à perpétuité lors du procès de Rivonia en 1964.

### Du Triomphe Éthique à la « Nation Arc-en-Ciel »
Libéré en 1990 sous la pression internationale et les négociations avec Frederik de Klerk, Mandela a évité une guerre civile raciale en prônant la réconciliation et le pardon inspiré de la philosophie **Ubuntu**.
Élu président en 1994, il unit la nation autour de la Coupe du Monde de Rugby de 1995 et met en place la Commission Vérité et Réconciliation présidée par Desmond Tutu.
    `,
    keyConcepts: [
      { term: 'Apartheid', definition: 'Régime d\'oppression et de ségrégation raciale institutionnalisé en Afrique du Sud de 1948 à 1991.' },
      { term: 'Nation Arc-en-Ciel', definition: 'Concept désignant l\'idéal d\'une Afrique du Sud multiraciale et fraternelle unifiée.' },
    ],
    relatedItemIds: ['phil_ubuntu', 'hist_colonisation'],
    flashcards: [
      { front: 'Combien d\'années Nelson Mandela a-t-il passées en prison ?', back: '27 années (dont 18 ans à Robben Island).' },
      { front: 'En quelle année a-t-il été élu premier président noir d\'Afrique du Sud ?', back: 'En 1994.' },
    ],
  },
  {
    id: 'fig_marcus_aurelius',
    title: 'Marcus Aurelius (Marc Aurèle) : L’Empereur-Philosophe',
    domainId: 'legendary_figures',
    domainName: 'Personnalités Légendaires',
    category: 'Rome Antique & Philosophie',
    icon: '👑',
    color: 'from-amber-500/20 to-yellow-500/20',
    readTimeMinutes: 5,
    level: 'Débutant',
    summary: 'Empereur romain du IIe siècle et philosophe stoïcien, auteur des célèbres « Pensées pour moi-même » écrites au milieu des campagnes militaires, incarnation du souverain gouvernant avec vertu et détachement.',
    content: `
Dernier des « Cinq Bons Empereurs » de la Pax Romana, Marc Aurèle a gouverné l'Empire tout en faisant face à la peste antonine et aux invasions germaniques sur le Danube.

### « Pensées pour moi-même » (Méditations)
Ce journal intime rédigé sous sa tente de campagne n'était pas destiné à la publication. Il y consigne des rappels moraux :
- *« Le matin, dis-toi par avance : je vais rencontrer des indiscrets, des ingrats, des insolents... Mais moi qui ai compris la nature du bien, nul ne peut me nuire. »*
- *« Ne perds plus ton temps à discuter de ce que doit être un homme de bien : sois-le. »*
    `,
    keyConcepts: [
      { term: 'Pax Romana', definition: 'Période de paix et de prospérité relative dans l\'Empire romain aux Ier et IIe siècles ap. J.-C.' },
      { term: 'Pensées pour moi-même', definition: 'Recueil de méditations intimes stoïciennes de Marc Aurèle sur le devoir, la mort et la vertu.' },
    ],
    relatedItemIds: ['phil_stoicisme', 'hist_chute_rome'],
    flashcards: [
      { front: 'Quel est le titre de l\'ouvrage intime stoïcien laissé par Marc Aurèle ?', back: '« Pensées pour moi-même » (ou Méditations).' },
      { front: 'Quel était le statut politique de Marc Aurèle ?', back: 'Empereur de Rome (161 - 180 ap. J.-C.).' },
    ],
  },
];
