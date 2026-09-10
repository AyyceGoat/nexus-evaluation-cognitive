export interface SubSection {
  title: string;
  content: string;
  subsections?: SubSection[];
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  sections: SubSection[];
}

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: "religions",
    title: "Religions",
    icon: "🕌",
    description: "Explorez les grandes traditions spirituelles qui ont façonné l'humanité",
    color: "from-amber-500/20 to-orange-500/20",
    sections: [
      {
        title: "Introduction aux religions",
        content: `Les religions accompagnent l'humanité depuis ses origines. Dès la Préhistoire, les premières sépultures intentionnelles (il y a environ 100 000 ans) témoignent d'une réflexion sur la mort et l'au-delà. Le sentiment religieux semble naître du besoin fondamental de donner un sens à l'existence, d'expliquer les phénomènes naturels et de structurer la vie en communauté.

L'animisme fut probablement la première forme de spiritualité : les humains attribuaient une âme aux éléments naturels — rivières, montagnes, arbres, animaux. Le chamanisme, présent sur tous les continents, permettait à des individus spéciaux de communiquer avec le monde des esprits.

Avec la sédentarisation et l'apparition des premières civilisations (Mésopotamie, Égypte, Indus), les religions se sont structurées : des panthéons de dieux organisés, des temples monumentaux, des prêtres spécialisés et des textes sacrés ont émergé. Le polythéisme dominait alors le monde.

Le monothéisme, l'idée d'un Dieu unique, est apparu progressivement. Le zoroastrisme en Perse (vers 1500-1000 av. J.-C.) est souvent considéré comme la première religion monothéiste structurée. Le judaïsme s'est développé parallèlement, donnant naissance au christianisme puis à l'islam — les trois religions dites « abrahamiques ».

En Asie, l'hindouisme, le bouddhisme, le jaïnisme, le sikhisme, le taoïsme et le confucianisme ont développé des philosophies et des pratiques spirituelles radicalement différentes des traditions occidentales.

Aujourd'hui, on estime que 85% de la population mondiale se rattache à une forme de croyance religieuse ou spirituelle. Les religions continuent d'influencer la politique, la culture, l'art, l'éthique et les relations internationales.`,
      },
      {
        title: "Christianisme",
        content: `Le christianisme est la religion la plus répandue au monde avec environ 2,4 milliards de fidèles. Il naît au Ier siècle en Palestine romaine, dans un contexte de domination de l'Empire romain sur le peuple juif.

**Origines et contexte historique**

Le christianisme émerge du judaïsme du Second Temple. À cette époque, la Palestine est sous occupation romaine, et le peuple juif attend un Messie (« l'Oint ») qui, selon les prophéties, viendrait libérer Israël. Jésus de Nazareth (vers 4 av. J.-C. – 30/33 ap. J.-C.), un prédicateur juif de Galilée, rassemble des disciples en prêchant l'amour, le pardon et le Royaume de Dieu. Ses enseignements remettent en question les autorités religieuses établies.

Après sa crucifixion sous Ponce Pilate, ses disciples affirment qu'il est ressuscité, ce qui devient le fondement central de la foi chrétienne. Ses apôtres, notamment Pierre et Paul, diffusent le message dans tout l'Empire romain. Paul de Tarse joue un rôle crucial en ouvrant le christianisme aux non-juifs (les « Gentils »), transformant un mouvement juif en religion universelle.

**La Bible**

La Bible chrétienne se compose de deux parties : l'Ancien Testament (repris du judaïsme, avec des variations selon les traditions) et le Nouveau Testament (27 livres incluant les 4 Évangiles, les Actes des Apôtres, les Épîtres et l'Apocalypse). Les Évangiles de Matthieu, Marc, Luc et Jean racontent la vie et les enseignements de Jésus, chacun avec sa perspective propre.

**Expansion historique**

Persécuté pendant trois siècles, le christianisme est légalisé par l'édit de Milan (313) sous Constantin Ier, puis devient religion d'État de l'Empire romain sous Théodose Ier (380). Cette officialisation transforme profondément le mouvement : construction de basiliques, organisation hiérarchique, conciles pour définir la doctrine.`,
        subsections: [
          {
            title: "Catholicisme",
            content: `Le catholicisme est la plus grande branche du christianisme avec environ 1,3 milliard de fidèles. L'Église catholique romaine se considère comme l'Église fondée par Jésus-Christ lui-même, avec une succession apostolique ininterrompue depuis l'apôtre Pierre.

**Organisation et autorité**

Le pape, évêque de Rome, est considéré comme le successeur de Pierre et le chef suprême de l'Église. Depuis le concile Vatican I (1870), le dogme de l'infaillibilité pontificale affirme que le pape ne peut se tromper lorsqu'il définit solennellement une doctrine de foi ou de morale. L'Église est organisée en diocèses dirigés par des évêques, eux-mêmes subdivisés en paroisses.

**Croyances distinctives**

Le catholicisme affirme la Trinité (Dieu en trois personnes : Père, Fils et Saint-Esprit), la transsubstantiation (le pain et le vin deviennent réellement le corps et le sang du Christ lors de l'Eucharistie), la vénération de la Vierge Marie (Immaculée Conception, Assomption), le purgatoire, les sept sacrements (baptême, confirmation, eucharistie, pénitence, onction des malades, ordre, mariage) et l'intercession des saints.

**Tradition et Écriture**

Contrairement au protestantisme, le catholicisme accorde une importance égale à la Tradition (enseignements transmis oralement par les apôtres) et aux Écritures. Le Magistère (autorité enseignante de l'Église) interprète la Bible.

**Impact culturel**

Le catholicisme a profondément façonné l'art occidental (Michel-Ange, Raphaël), l'architecture (cathédrales gothiques), la philosophie (Thomas d'Aquin), l'éducation (universités médiévales) et le droit.`
          },
          {
            title: "Orthodoxie",
            content: `L'Église orthodoxe rassemble environ 220 millions de fidèles, principalement en Europe de l'Est, en Grèce, en Russie et au Moyen-Orient. Elle se sépare de Rome lors du Grand Schisme de 1054.

**Le Grand Schisme**

La rupture entre Rome et Constantinople résulte de siècles de divergences croissantes : la question du Filioque (le Saint-Esprit procède-t-il du Père seul ou du Père « et du Fils » ?), la primauté du pape de Rome contestée par les patriarches orientaux, et des différences liturgiques et culturelles entre monde latin et monde grec.

**Organisation**

L'orthodoxie est organisée en Églises autocéphales (indépendantes) : le Patriarcat œcuménique de Constantinople a une primauté d'honneur, mais chaque Église nationale (russe, grecque, serbe, roumaine, etc.) se gouverne elle-même. Il n'y a pas d'équivalent du pape.

**Croyances et pratiques**

L'orthodoxie partage avec le catholicisme la Trinité, les sept sacrements et la vénération des saints, mais diffère sur plusieurs points : pas de purgatoire (mais une « épreuve des péages »), pas de dogme de l'Immaculée Conception de Marie, importance centrale des icônes dans la prière, liturgie byzantine riche et solennelle, mysticisme de l'hésychasme (prière du cœur).

**Les icônes**

Les icônes ne sont pas de simples représentations artistiques mais des « fenêtres vers le divin ». La querelle des iconoclastes (VIIIe-IXe siècles) a failli détruire cette tradition, mais le concile de Nicée II (787) a confirmé la légitimité de la vénération des images.`
          },
          {
            title: "Protestantisme",
            content: `Le protestantisme naît de la Réforme du XVIe siècle, initiée par Martin Luther en 1517 lorsqu'il affiche ses 95 thèses contre les indulgences sur la porte de l'église de Wittenberg. Il regroupe aujourd'hui environ 900 millions de fidèles dans une grande diversité de dénominations.

**Les principes fondamentaux**

Le protestantisme repose sur cinq « solas » :
- Sola Scriptura : la Bible seule comme autorité
- Sola Fide : le salut par la foi seule
- Sola Gratia : par la grâce seule de Dieu
- Solus Christus : par le Christ seul
- Soli Deo Gloria : pour la gloire de Dieu seul

**Martin Luther**

Moine augustin allemand, Luther est révolté par la vente des indulgences (on pouvait « acheter » le pardon des péchés). Il affirme que le salut vient uniquement de la foi en Dieu, pas des œuvres ou de l'argent. Excommunié par le pape, protégé par des princes allemands, il traduit la Bible en allemand, la rendant accessible au peuple.

**Principales branches**

Le protestantisme est extrêmement diversifié :
- **Luthéranisme** : suit les enseignements de Luther, conserve certaines traditions liturgiques
- **Calvinisme/Réformé** : Jean Calvin développe la doctrine de la prédestination
- **Anglicanisme** : né du schisme d'Henri VIII avec Rome (1534), position intermédiaire entre catholicisme et protestantisme
- **Méthodisme** : fondé par John Wesley au XVIIIe siècle, accent sur la sainteté personnelle
- **Baptisme** : insiste sur le baptême des croyants adultes par immersion

**Impact historique**

La Réforme a eu des conséquences immenses : guerres de religion en Europe, émergence du capitalisme moderne (thèse de Max Weber), diffusion de l'alphabétisation, fondation des États-Unis par des puritains.`
          },
          {
            title: "Évangélisme",
            content: `Le mouvement évangélique est l'une des formes de christianisme en plus forte croissance, avec environ 600 millions de fidèles. Il transcende les dénominations traditionnelles et met l'accent sur l'expérience personnelle de conversion.

**Caractéristiques**

L'évangélisme se distingue par : la conversion personnelle (être « born again », né de nouveau), l'autorité suprême de la Bible, l'activisme missionnaire, la centralité de la croix et du sacrifice de Jésus. Les cultes sont souvent dynamiques, avec musique contemporaine (worship) et prédications engagées.

**Pentecôtisme et mouvement charismatique**

Le pentecôtisme, né au début du XXe siècle (Azusa Street Revival, Los Angeles, 1906), est la branche la plus dynamique. Il insiste sur les dons du Saint-Esprit : parler en langues (glossolalie), prophétie, guérison divine. Le mouvement charismatique a également pénétré le catholicisme et l'orthodoxie.

**Expansion mondiale**

L'évangélisme connaît une croissance explosive en Amérique latine, en Afrique subsaharienne, en Asie du Sud-Est et en Chine. Au Brésil, les évangéliques représentent désormais plus de 30% de la population. Cette croissance est portée par une prédication accessible, des structures communautaires fortes et l'utilisation des médias modernes.`
          },
          {
            title: "Témoins de Jéhovah",
            content: `Les Témoins de Jéhovah forment un mouvement chrétien restaurationniste fondé à la fin du XIXe siècle par Charles Taze Russell aux États-Unis. Ils comptent environ 8,7 millions de membres actifs dans plus de 240 pays.

**Croyances distinctives**

Les Témoins de Jéhovah se distinguent de la majorité des chrétiens par plusieurs points majeurs :
- **Rejet de la Trinité** : ils considèrent que Jéhovah est le seul vrai Dieu, que Jésus est son Fils créé (la première création de Dieu, identifié à l'archange Michel) et que le Saint-Esprit est la force agissante de Dieu, pas une personne
- **Nom de Dieu** : ils insistent sur l'utilisation du nom divin « Jéhovah » (forme francisée du tétragramme YHWH)
- **Pas d'enfer de feu** : les méchants sont simplement détruits, pas tourmentés éternellement
- **Pas d'âme immortelle** : l'âme meurt avec le corps, les fidèles attendent la résurrection

**Pratiques**

Ils refusent les transfusions sanguines (basé sur Actes 15:28-29), ne célèbrent pas Noël, Pâques ni les anniversaires (considérés comme d'origine païenne), ne participent pas à la politique ni au service militaire, et pratiquent le porte-à-porte comme moyen de prédication principal.

**Organisation**

Le mouvement est dirigé depuis le siège mondial de Warwick (New York) par un Collège central. Leur traduction de la Bible, la « Traduction du monde nouveau », diffère sur certains passages clés des traductions traditionnelles.`
          },
          {
            title: "Mormonisme",
            content: `L'Église de Jésus-Christ des Saints des Derniers Jours (mormons) a été fondée en 1830 par Joseph Smith aux États-Unis. Elle compte environ 17 millions de membres dans le monde.

**Origines**

Joseph Smith affirme avoir reçu en 1820, à l'âge de 14 ans, la visite de Dieu le Père et de Jésus-Christ dans une forêt (la « Première Vision »). En 1827, il dit avoir trouvé des plaques d'or contenant un récit ancien des peuples des Amériques, qu'il traduit et publie sous le nom de « Livre de Mormon » en 1830.

**Croyances distinctives**

- **Trois ouvrages en plus de la Bible** : Livre de Mormon, Doctrine et Alliances, Perle de Grand Prix
- **Vision de Dieu** : Dieu le Père a un corps de chair et d'os glorifié ; le Père, le Fils et le Saint-Esprit sont trois êtres distincts (pas de Trinité au sens traditionnel)
- **Plan du salut** : existence pré-mortelle, vie terrestre comme épreuve, trois degrés de gloire dans l'au-delà
- **Temples** : cérémonies sacrées incluant le baptême pour les morts et le mariage éternel
- **Prophète vivant** : un prophète dirige l'Église aujourd'hui, recevant des révélations continues

**Pratiques**

Code de santé strict (Parole de Sagesse : pas d'alcool, tabac, café, thé), dîme de 10%, service missionnaire de deux ans pour les jeunes, importance de la famille.`
          }
        ]
      },
      {
        title: "Islam",
        content: `L'islam est la deuxième religion mondiale avec environ 1,9 milliard de fidèles (musulmans). Le mot « islam » signifie « soumission (à Dieu) » en arabe, et « musulman » signifie « celui qui se soumet ».

**Origines et contexte**

L'islam naît au VIIe siècle dans la péninsule Arabique, dans un contexte de polythéisme (les Arabes adoraient des centaines d'idoles à La Mecque, dans et autour de la Kaaba), mais aussi de présence juive et chrétienne dans la région.

Vers 610, Muhammad ibn Abdallah (vers 570-632), un marchand mecquois réputé pour son honnêteté (surnommé « al-Amîn », le digne de confiance), reçoit dans la grotte de Hira, par l'intermédiaire de l'ange Gabriel (Jibrîl), les premières révélations de Dieu (Allah). Ces révélations, qui se poursuivront pendant 23 ans, formeront le Coran.

Persécuté à La Mecque, Muhammad émigre à Médine en 622 (l'Hégire, point de départ du calendrier islamique). Il y fonde la première communauté musulmane (Oumma), unifie les tribus arabes et revient conquérir La Mecque en 630, purifiant la Kaaba de ses idoles.

**Le Coran**

Le Coran (« récitation ») est considéré comme la parole directe et inaltérée de Dieu, révélée en arabe. Il contient 114 sourates (chapitres) et aborde la théologie, le droit, la morale, l'histoire des prophètes et la vie quotidienne. Les musulmans croient qu'il n'a jamais été modifié depuis sa compilation sous le calife Othman (vers 650).

**Les cinq piliers**

1. Shahada : profession de foi (« Il n'y a de dieu que Dieu, et Muhammad est Son messager »)
2. Salat : cinq prières quotidiennes orientées vers La Mecque
3. Zakat : aumône obligatoire (2,5% de l'épargne annuelle)
4. Sawm : jeûne du mois de Ramadan
5. Hajj : pèlerinage à La Mecque au moins une fois si possible

**Les prophètes**

L'islam reconnaît une chaîne de prophètes depuis Adam, incluant Noé, Abraham, Moïse, David, Salomon et Jésus (considéré comme prophète et Messie, mais pas comme fils de Dieu ni divin). Muhammad est le « sceau des prophètes », le dernier.`,
        subsections: [
          {
            title: "Sunnisme",
            content: `Le sunnisme est la branche majoritaire de l'islam, regroupant environ 85-90% des musulmans (1,6 milliard). Le terme vient de « Sunna », la tradition du Prophète Muhammad (ses paroles, actes et approbations compilés dans les hadiths).

**Après la mort du Prophète**

La distinction sunnite/chiite naît d'un désaccord sur la succession de Muhammad. Les sunnites soutiennent que le Prophète n'a pas désigné de successeur spécifique et que la communauté a correctement choisi Abou Bakr, compagnon proche et beau-père du Prophète, comme premier calife. Les quatre « califes bien guidés » (Abou Bakr, Omar, Othman, Ali) sont tous reconnus comme légitimes.

**Les quatre écoles juridiques**

Le sunnisme est structuré en quatre grandes écoles de jurisprudence (madhab) :
- **Hanafite** : la plus répandue (Turquie, Asie du Sud, Asie centrale), la plus flexible
- **Malikite** : Afrique du Nord et de l'Ouest, basée sur la pratique de Médine
- **Chafiite** : Asie du Sud-Est, Afrique de l'Est, méthodologie rigoureuse
- **Hanbalite** : Arabie Saoudite, la plus littéraliste

Ces écoles divergent sur des questions de pratique, pas de croyance fondamentale.

**Croyances**

Six piliers de la foi : croire en Dieu, en Ses anges, en Ses livres, en Ses messagers, au Jour du Jugement et au destin (qadar).`
          },
          {
            title: "Chiisme",
            content: `Le chiisme représente environ 10-15% des musulmans (200 millions), principalement en Iran, Irak, Bahreïn, Azerbaïdjan et au Liban.

**Origine du schisme**

Les chiites (de « Shî'at Ali », « parti d'Ali ») estiment qu'Ali ibn Abi Talib, cousin et gendre du Prophète, était le successeur légitime désigné par Muhammad lui-même (notamment lors de l'événement de Ghadir Khumm). La tragédie de Karbala (680), où Hussein, petit-fils du Prophète, est massacré avec sa famille par les troupes du calife omeyyade Yazid, est l'événement fondateur de l'identité chiite.

**Les imams**

Le chiisme accorde une place centrale aux imams, descendants d'Ali, considérés comme guides spirituels infaillibles :
- **Chiisme duodécimain** (majoritaire) : reconnaît 12 imams ; le 12e (Muhammad al-Mahdi) est en « occultation » depuis 874 et reviendra comme Mahdi à la fin des temps
- **Ismaélisme** : reconnaît 7 imams, avec l'Aga Khan comme chef actuel
- **Zaïdisme** : reconnaît 5 imams, présent au Yémen

**Pratiques distinctives**

L'Achoura commémore le martyre de Hussein avec des processions, des passions théâtrales (ta'ziyeh) et parfois des actes d'auto-flagellation. Le chiisme possède un clergé structuré (ayatollahs, mollahs) contrairement au sunnisme. Les lieux saints chiites incluent Nadjaf et Karbala (Irak) en plus de La Mecque et Médine.`
          },
          {
            title: "Soufisme",
            content: `Le soufisme (tasawwuf) est la dimension mystique et ésotérique de l'islam. Ce n'est pas une branche séparée mais une voie spirituelle qui existe à l'intérieur du sunnisme et du chiisme.

**Origines**

Le terme vient probablement de « sûf » (laine), en référence aux vêtements simples des premiers ascètes musulmans. Le soufisme émerge aux VIIIe-IXe siècles comme réaction à la mondanité croissante de la civilisation islamique et à un juridisme perçu comme trop formaliste. Des figures comme Rabia al-Adawiyya (femme mystique de Bassora) ont introduit le concept d'amour divin désintéressé.

**Philosophie**

Le soufisme cherche l'union intime avec Dieu (fanâ', « anéantissement de l'ego »). Le voyage spirituel passe par des stations (maqâmât) et des états (ahwâl). Le maître soufi (cheikh, murshid) guide le disciple (murîd) sur ce chemin. La pratique du dhikr (répétition des noms de Dieu) est centrale.

**Grandes figures**

- **Rumi** (1207-1273) : poète persan, fondateur de l'ordre des derviches tourneurs (Mevlevi)
- **Ibn Arabi** (1165-1240) : philosophe de l'« unité de l'existence » (wahdat al-wujûd)
- **Al-Ghazali** (1058-1111) : théologien qui a réconcilié soufisme et orthodoxie sunnite
- **Al-Hallaj** (858-922) : mystique exécuté pour avoir déclaré « Ana al-Haqq » (Je suis la Vérité/Dieu)

**Ordres soufis (tarîqa)**

Qadiriyya, Naqshbandiyya, Tijâniyya, Chistiyya, Shâdhiliyya — chaque ordre a ses propres pratiques et rituels.`
          }
        ]
      },
      {
        title: "Hindouisme",
        content: `L'hindouisme est la plus ancienne religion organisée encore pratiquée, avec environ 1,2 milliard de fidèles (principalement en Inde et au Népal). Contrairement au christianisme ou à l'islam, il n'a pas de fondateur unique, pas de credo unifié et pas d'autorité centrale.

**Origines**

L'hindouisme plonge ses racines dans la civilisation de l'Indus (3300-1300 av. J.-C.) et les traditions védiques apportées par les peuples indo-aryens (vers 1500 av. J.-C.). Les Vedas, textes les plus anciens (1500-500 av. J.-C.), sont les fondements scripturaires. Les Upanishads (800-200 av. J.-C.) développent une philosophie profonde sur la nature de la réalité, de l'âme (Atman) et de l'Absolu (Brahman).

**Concepts fondamentaux**

- **Brahman** : réalité ultime, absolue, infinie — tout en émane et tout y retourne
- **Atman** : l'âme individuelle, qui est en réalité identique à Brahman
- **Samsara** : le cycle des renaissances (réincarnation)
- **Karma** : loi de cause à effet — les actions déterminent les vies futures
- **Dharma** : devoir, éthique, ordre cosmique que chacun doit suivre
- **Moksha** : libération du cycle des renaissances, but ultime

**Les grands textes**

Outre les Vedas et Upanishads : la Bhagavad-Gita (dialogue entre Krishna et Arjuna sur le devoir et la spiritualité), le Ramayana (épopée de Rama) et le Mahabharata (la plus longue épopée du monde, 100 000 strophes).

**Le panthéon hindou**

L'hindouisme reconnaît des millions de divinités, mais trois formes majeures de Dieu (Trimurti) :
- **Brahma** : le créateur
- **Vishnu** : le préservateur (ses avatars incluent Rama et Krishna)
- **Shiva** : le destructeur/transformateur

D'autres divinités majeures : Ganesh (sagesse, obstacles), Lakshmi (prospérité), Saraswati (connaissance), Durga/Kali (puissance féminine), Hanuman (dévotion).

**Les voies vers Moksha**

- Jnana yoga : voie de la connaissance
- Bhakti yoga : voie de la dévotion
- Karma yoga : voie de l'action désintéressée
- Raja yoga : voie de la méditation`,
        subsections: [
          {
            title: "Courants de l'hindouisme",
            content: `L'hindouisme n'est pas monolithique mais comprend de multiples courants :

**Vaishnavisme** (le plus répandu)
Dévotion à Vishnu et ses avatars (Rama, Krishna). Les Hare Krishna (ISKCON) en sont une branche moderne. Textes importants : Bhagavad-Gita, Bhagavata Purana.

**Shaivisme**
Dévotion à Shiva sous toutes ses formes (Nataraja le danseur cosmique, le yogi méditant, le destructeur). Le lingam est son symbole principal. Fort ancrage en Inde du Sud et au Népal.

**Shaktisme**
Dévotion à la Déesse (Devi/Shakti) sous ses multiples formes : Durga la guerrière, Kali la destructrice, Lakshmi la bienveillante, Parvati l'épouse. Associé au tantrisme.

**Smartisme**
Approche libérale qui considère les différentes divinités comme des manifestations d'un même Brahman. Fondé par le philosophe Adi Shankara (VIIIe siècle), promoteur de l'Advaita Vedanta (non-dualité).

**Le système des castes**

Le système des varnas (prêtres, guerriers, marchands, serviteurs) et des jatis (sous-castes professionnelles) a structuré la société indienne pendant des millénaires. Bien que la discrimination de caste soit constitutionnellement interdite en Inde, ses effets sociaux persistent. Gandhi appelait les intouchables « Harijans » (enfants de Dieu), et le Dr Ambedkar, lui-même intouchable, a rédigé la Constitution indienne.`
          }
        ]
      },
      {
        title: "Bouddhisme",
        content: `Le bouddhisme, avec environ 500 millions de pratiquants, est né en Inde au VIe siècle av. J.-C. avec Siddhartha Gautama, qui devint le Bouddha (« l'Éveillé »).

**Le Bouddha historique**

Siddhartha Gautama (vers 563-483 av. J.-C.) naît prince dans le clan Shakya, dans l'actuel Népal. Élevé dans le luxe, il découvre à l'âge de 29 ans la souffrance du monde lors de quatre sorties hors du palais : il voit un vieillard, un malade, un cadavre et un ascète. Bouleversé, il quitte sa famille pour chercher la vérité.

Après six ans d'ascèse extrême puis de méditation, il atteint l'Éveil (bodhi) sous l'arbre de la Bodhi à Bodh Gaya. Il comprend la nature de la souffrance et la voie pour s'en libérer. Il passe les 45 dernières années de sa vie à enseigner.

**Les Quatre Nobles Vérités**

1. Dukkha : la vie est souffrance/insatisfaction
2. Samudaya : la souffrance naît du désir et de l'attachement
3. Nirodha : la cessation de la souffrance est possible
4. Magga : le Noble Octuple Sentier est la voie vers la cessation

**Le Noble Octuple Sentier**

Vue juste, intention juste, parole juste, action juste, moyens d'existence justes, effort juste, attention juste, concentration juste.

**Concepts clés**

- **Anatta** : pas de soi permanent (différence fondamentale avec l'hindouisme)
- **Anicca** : impermanence de toute chose
- **Nirvana** : extinction de la souffrance, libération du samsara
- **Karma** : les actions ont des conséquences
- **Voie du milieu** : ni ascétisme extrême, ni indulgence`,
        subsections: [
          {
            title: "Branches du bouddhisme",
            content: `**Theravada** (« Doctrine des Anciens »)
Branche la plus ancienne, dominante en Asie du Sud-Est (Thaïlande, Myanmar, Sri Lanka, Cambodge, Laos). Se concentre sur l'éveil individuel par la méditation et la discipline monastique. Canon pali (Tipitaka). L'idéal est l'Arhat (celui qui atteint le Nirvana par ses propres efforts).

**Mahayana** (« Grand Véhicule »)
Dominant en Chine, Japon, Corée, Vietnam. L'idéal est le Bodhisattva : celui qui retarde son propre Nirvana pour aider tous les êtres à s'éveiller. Inclut le bouddhisme Chan/Zen (méditation directe), le bouddhisme de la Terre Pure (dévotion au Bouddha Amitabha), et de nombreuses écoles philosophiques.

**Vajrayana** (« Véhicule du Diamant »)
Dominant au Tibet, en Mongolie et au Bhoutan. Utilise des tantras, mantras, mandalas et rituels ésotériques pour accélérer l'éveil. Le Dalaï-Lama est le chef spirituel de l'école Gelugpa (Bonnets jaunes). Le Bardo Thodol (Livre tibétain des morts) est un texte majeur.

**Zen**
Branche du Mahayana développée en Chine (Chan) puis au Japon (Zen). Insiste sur la méditation assise (zazen), les koans (énigmes paradoxales) et l'expérience directe de l'éveil (satori). Influence majeure sur l'art, l'architecture et la culture japonaise.`
          }
        ]
      },
      {
        title: "Judaïsme",
        content: `Le judaïsme, avec environ 15 millions de fidèles, est la plus ancienne religion monothéiste abrahamique. Son histoire, longue de plus de 3 500 ans, a profondément influencé le christianisme et l'islam.

**Origines**

Selon la tradition, Abraham (vers 2000 av. J.-C.) est le père fondateur, ayant conclu une Alliance avec Dieu (YHWH). Son petit-fils Jacob (Israël) engendre les douze tribus d'Israël. Moïse libère les Hébreux de l'esclavage en Égypte (l'Exode) et reçoit la Torah (les Dix Commandements et la Loi) sur le mont Sinaï.

**La Torah et les textes sacrés**

La Torah (les cinq livres de Moïse) est le cœur de la foi juive. Le Tanakh (Bible hébraïque) comprend aussi les Neviim (Prophètes) et les Ketuvim (Écrits). Le Talmud, immense compilation de discussions rabbiniques, interprète et développe la loi juive (halakha).

**Croyances fondamentales**

- Monothéisme strict : « Écoute, Israël : l'Éternel est notre Dieu, l'Éternel est Un » (Shema Israël)
- Alliance entre Dieu et le peuple d'Israël
- La Torah comme guide de vie
- Attente du Messie (pas encore venu selon le judaïsme)
- Justice, éthique et réparation du monde (tikkun olam)

**Principales pratiques**

Shabbat (repos du samedi), cacheroute (lois alimentaires), circoncision (brit milah), Bar/Bat Mitzvah, fêtes (Pessah, Yom Kippour, Rosh Hashana, Hanoukka, Pourim, Souccot).

**Courants modernes**

- Orthodoxe : observance stricte de la halakha
- Conservateur (Massorti) : position intermédiaire
- Réformé (libéral) : adaptation à la modernité
- Ultra-orthodoxe (Haredi) : stricte observance traditionnelle
- Hassidisme : mouvement mystique joyeux fondé par le Baal Shem Tov (XVIIIe siècle)

**Histoire**

Destruction du Premier Temple (586 av. J.-C.), du Second Temple (70 ap. J.-C.), diaspora, persécutions médiévales, ghettos, pogroms, Shoah (6 millions de victimes), création de l'État d'Israël (1948).`
      },
      {
        title: "Sikhisme",
        content: `Le sikhisme, avec environ 30 millions de fidèles principalement au Pendjab (Inde), est fondé par Guru Nanak (1469-1539), dans un contexte de tensions entre hindouisme et islam en Inde.

**Fondation**

Guru Nanak, après une expérience mystique dans une rivière, déclare : « Il n'y a ni hindou, ni musulman. » Il prêche un Dieu unique, sans forme (Ik Onkar), accessible à tous sans distinction de caste, religion ou genre. Le sikhisme rejette le système des castes, l'idolâtrie et les rituels vides.

**Les dix Gurus**

Dix Gurus se succèdent de 1469 à 1708. Le dernier, Guru Gobind Singh, déclare que le livre saint (Guru Granth Sahib) sera désormais le Guru éternel. Il fonde aussi le Khalsa (communauté des initiés) en 1699.

**Guru Granth Sahib**

Livre saint unique : il contient 1 430 pages de poésie spirituelle composée par les Gurus sikhs et des saints hindous et musulmans (fait unique pour un texte sacré). Il est traité avec un immense respect — il est installé sur un trône, éventé, et « couché » chaque soir.

**Les 5 K (symboles du Khalsa)**

Kesh (cheveux non coupés), Kangha (peigne), Kara (bracelet d'acier), Kachera (sous-vêtement spécifique), Kirpan (poignard cérémoniel).

**Valeurs**

Égalité totale (hommes/femmes, castes), service communautaire (seva), repas communautaire gratuit (langar — les temples sikhs servent des millions de repas gratuits chaque jour), honnêteté, courage.`
      }
    ]
  },
  {
    id: "astronomy",
    title: "Astronomie",
    icon: "🔭",
    description: "Voyagez à travers l'univers, des planètes aux galaxies lointaines",
    color: "from-blue-500/20 to-indigo-500/20",
    sections: [
      {
        title: "L'Univers",
        content: `L'univers est tout ce qui existe : matière, énergie, espace et temps. Il est né il y a environ 13,8 milliards d'années lors du Big Bang, une expansion fulgurante à partir d'un point de densité et de température infinies.

**Le Big Bang**

Contrairement à l'idée populaire, le Big Bang n'est pas une explosion dans l'espace — c'est l'expansion de l'espace lui-même. Dans les premières fractions de seconde, l'univers passe par une inflation cosmique, multipliant sa taille par un facteur de 10^26. Les particules fondamentales se forment, puis les premiers atomes (hydrogène et hélium) apparaissent environ 380 000 ans après, libérant la première lumière : le fond diffus cosmologique, que nous détectons encore aujourd'hui.

**Structure de l'univers**

L'univers observable a un diamètre d'environ 93 milliards d'années-lumière. Il contient environ 2 000 milliards de galaxies, chacune abritant des centaines de milliards d'étoiles. Ces galaxies sont organisées en amas, super-amas et filaments, formant une « toile cosmique » avec d'immenses vides entre les structures.

**Composition**

L'univers se compose de : 5% de matière ordinaire (tout ce que nous voyons), 27% de matière noire (invisible, détectable uniquement par sa gravité) et 68% d'énergie sombre (force mystérieuse accélérant l'expansion de l'univers).

**L'expansion accélérée**

En 1998, on découvre que l'expansion de l'univers s'accélère — une surprise totale qui vaut le prix Nobel de physique en 2011. L'énergie sombre, responsable de cette accélération, reste l'une des plus grandes énigmes de la physique moderne.`,
        subsections: [
          {
            title: "Le Système Solaire",
            content: `Notre Système solaire s'est formé il y a 4,6 milliards d'années à partir d'un nuage de gaz et de poussières (nébuleuse solaire). Le Soleil, étoile de type naine jaune, contient 99,86% de la masse totale du système.

**Les planètes telluriques (rocheuses)**

- **Mercure** : plus petite planète, températures extrêmes (-180°C à 430°C), pas d'atmosphère significative
- **Vénus** : « jumelle infernale » de la Terre, 460°C en surface (effet de serre extrême), pression 90 fois celle de la Terre
- **Terre** : seule planète connue abritant la vie, 71% d'eau en surface, atmosphère protectrice
- **Mars** : la planète rouge, possédait de l'eau liquide, Olympus Mons (plus grand volcan du système solaire, 21 km de haut)

**Les géantes gazeuses**

- **Jupiter** : plus grande planète (1 300 Terres), Grande Tache Rouge (tempête depuis 350+ ans), 95 lunes connues dont Europe (océan sous-glaciaire potentiellement habitable)
- **Saturne** : célèbre pour ses anneaux spectaculaires (glace et roche), Titan (seule lune avec atmosphère dense et lacs de méthane)

**Les géantes de glace**

- **Uranus** : tourne « couchée » sur le côté (inclinaison de 98°), couleur bleu-vert (méthane)
- **Neptune** : vents les plus rapides du système solaire (2 100 km/h), Triton (lune qui orbite à l'envers)

**Au-delà**

La ceinture de Kuiper (Pluton, Éris), le nuage d'Oort (réservoir de comètes), et la sonde Voyager 1, l'objet humain le plus éloigné (plus de 24 milliards de km).`
          },
          {
            title: "Étoiles et galaxies",
            content: `**Les étoiles**

Les étoiles naissent dans des nébuleuses, immenses nuages de gaz et de poussières. Quand la gravité comprime suffisamment le gaz, la fusion nucléaire s'allume : l'hydrogène se transforme en hélium, libérant une énergie colossale. Une étoile passe sa vie à lutter entre la gravité (qui l'écrase) et la pression de radiation (qui la repousse).

Le destin d'une étoile dépend de sa masse :
- Étoiles petites → naines blanches → naines noires
- Étoiles moyennes (comme le Soleil) → géante rouge → nébuleuse planétaire → naine blanche
- Étoiles massives → supergéante → supernova → étoile à neutrons ou trou noir

**Les trous noirs**

Un trou noir est une région de l'espace où la gravité est si intense que rien, pas même la lumière, ne peut s'en échapper. L'horizon des événements est la frontière au-delà de laquelle tout est perdu. Les trous noirs supermassifs (millions à milliards de masses solaires) se trouvent au centre de la plupart des galaxies.

**Notre galaxie : la Voie Lactée**

Galaxie spirale barrée contenant 200 à 400 milliards d'étoiles, d'un diamètre de 100 000 années-lumière. Le Soleil se trouve à environ 26 000 années-lumière du centre, dans le bras d'Orion. Au centre se trouve Sagittarius A*, un trou noir supermassif de 4 millions de masses solaires.

**Types de galaxies**

Spirales (Voie Lactée, Andromède), elliptiques (géantes, vieilles étoiles), irrégulières (Nuages de Magellan), lenticulaires. La galaxie d'Andromède entrera en collision avec la Voie Lactée dans 4,5 milliards d'années.`
          }
        ]
      },
    ]
  },
  {
    id: "history",
    title: "Histoire",
    icon: "📜",
    description: "Traversez les grandes époques qui ont forgé notre civilisation",
    color: "from-red-500/20 to-rose-500/20",
    sections: [
      {
        title: "La Préhistoire",
        content: `La Préhistoire couvre l'immense période allant de l'apparition des premiers hominidés (il y a environ 7 millions d'années) à l'invention de l'écriture (vers 3300 av. J.-C.).

**Les origines de l'humanité**

L'Afrique est le berceau de l'humanité. Les plus anciens hominidés connus incluent Toumaï (Sahelanthropus tchadensis, 7 millions d'années) et Lucy (Australopithecus afarensis, 3,2 millions d'années, découverte en Éthiopie en 1974). Le genre Homo apparaît il y a environ 2,8 millions d'années.

**Homo sapiens**

Notre espèce, Homo sapiens, apparaît en Afrique il y a environ 300 000 ans. Nous coexistons un temps avec d'autres espèces humaines : Néandertal (Europe, disparu il y a 40 000 ans — mais 2-4% de notre ADN vient d'eux), Homo erectus, Denisoviens, Homo floresiensis (« Hobbits » d'Indonésie).

**La révolution néolithique**

Vers 10 000 av. J.-C., au Croissant fertile (Mésopotamie), les humains passent de chasseurs-cueilleurs à agriculteurs-éleveurs. Cette révolution transforme tout : sédentarisation, villages, puis villes, surplus alimentaires, spécialisation du travail, hiérarchies sociales, premières inégalités. Le blé, l'orge, les moutons et les chèvres sont parmi les premières espèces domestiquées.

**Art et spiritualité**

Les peintures rupestres de Lascaux (17 000 ans) et Altamira, les Vénus préhistoriques (Vénus de Willendorf, 30 000 ans), les mégalithes (Stonehenge, Carnac) témoignent d'une vie spirituelle et artistique riche bien avant l'écriture.`
      },
      {
        title: "Civilisations antiques",
        content: `**Mésopotamie : berceau de la civilisation**

Entre le Tigre et l'Euphrate (actuel Irak), les Sumériens inventent l'écriture cunéiforme (vers 3300 av. J.-C.), les premières cités-États (Ur, Uruk), la roue, le système sexagésimal (base 60 — nos 60 minutes et 360°). L'Épopée de Gilgamesh est le plus ancien récit littéraire connu. Babylone, sous Hammurabi, produit le premier code de lois écrit (vers 1750 av. J.-C.).

**Égypte ancienne**

Unifiée vers 3100 av. J.-C. par le pharaon Narmer, l'Égypte développe une civilisation extraordinaire durant 3 000 ans. Les pyramides de Gizeh (vers 2560 av. J.-C.), les hiéroglyphes, la momification, le papyrus, les mathématiques et l'astronomie témoignent d'un génie remarquable. Les pharaons célèbres incluent Khéops, Hatchepsout (femme pharaon), Akhénaton (premier monothéiste ?), Ramsès II et Cléopâtre VII.

**Grèce antique**

Berceau de la démocratie (Athènes, Ve siècle av. J.-C.), de la philosophie (Socrate, Platon, Aristote), du théâtre, des Jeux Olympiques et de la science. Alexandre le Grand (356-323 av. J.-C.) crée un empire de la Grèce à l'Inde, diffusant la culture hellénistique.

**Rome antique**

De village du Latium à empire couvrant tout le monde méditerranéen. La République romaine (509-27 av. J.-C.) invente le droit, le Sénat et l'ingénierie (routes, aqueducs, Colisée). L'Empire (27 av. J.-C. - 476 ap. J.-C.) apporte la Pax Romana. Chute de Rome en 476, l'Empire d'Orient (Byzance) survit jusqu'en 1453.`,
        subsections: [
          {
            title: "Autres grandes civilisations",
            content: `**Civilisation de l'Indus** (3300-1300 av. J.-C.)
Mohenjo-daro et Harappa : villes planifiées avec système d'égouts, bains publics, écriture non déchiffrée. L'une des plus avancées de l'Antiquité.

**Chine ancienne**
Dynastie Shang (1600 av. J.-C.) : premiers écrits chinois (os oraculaires). Philosophies fondatrices : confucianisme (Confucius, 551-479 av. J.-C.), taoïsme (Laozi), légisme. Premier empereur Qin Shi Huang unifie la Chine (221 av. J.-C.), commence la Grande Muraille, enterré avec l'Armée de terre cuite.

**Civilisations précolombiennes**
- Mayas : écriture, astronomie, calendrier, mathématiques (concept du zéro)
- Aztèques : Tenochtitlan (actuel Mexico), l'une des plus grandes villes du monde au XVe siècle
- Incas : Empire s'étendant sur 4 000 km, routes, terrasses agricoles, Machu Picchu

**Empire Perse**
Cyrus le Grand (550 av. J.-C.) fonde le plus grand empire du monde antique, de l'Égypte à l'Inde. Premier déclaration des droits de l'homme (Cylindre de Cyrus). Persépolis, capitale monumentale.

**Phénicie**
Inventeurs de l'alphabet (ancêtre de tous les alphabets occidentaux et arabes), navigateurs et commerçants extraordinaires. Carthage, leur plus grande colonie, rivalise avec Rome.`
          }
        ]
      },
      {
        title: "Le Moyen Âge",
        content: `Le Moyen Âge s'étend de la chute de Rome (476) à la chute de Constantinople (1453) ou la découverte des Amériques (1492).

**Haut Moyen Âge (Ve-Xe siècle)**

L'Europe fragmentée voit l'émergence des royaumes barbares (Francs, Wisigoths, Ostrogoths). Charlemagne unifie une grande partie de l'Europe occidentale et est couronné empereur en 800. L'Église catholique devient le pilier de la civilisation : monastères comme centres de savoir, copie de manuscrits, évangélisation. Les Vikings (VIIIe-XIe siècle) terrorisent et transforment l'Europe, atteignant l'Amérique (Vinland) 500 ans avant Colomb.

**L'âge d'or islamique (VIIIe-XIVe siècle)**

Pendant que l'Europe traverse une période difficile, le monde islamique vit son apogée. Bagdad, Cordoue et Le Caire sont les capitales intellectuelles du monde. Les savants musulmans préservent et enrichissent le savoir grec, inventent l'algèbre (Al-Khwarizmi), développent l'optique (Ibn al-Haytham), la médecine (Ibn Sina/Avicenne), la géographie (Al-Idrisi) et la philosophie (Averroès).

**Moyen Âge central (XIe-XIIIe siècle)**

Les Croisades (1095-1291) marquent les confrontations entre chrétienté et islam pour le contrôle de la Terre Sainte. Les cathédrales gothiques s'élèvent (Notre-Dame, Chartres). Les universités naissent (Bologne, Paris, Oxford). La Magna Carta (1215) limite le pouvoir royal en Angleterre.

**Bas Moyen Âge**

La Peste Noire (1347-1353) tue un tiers de l'Europe (25-50 millions de morts), transformant profondément la société. La Guerre de Cent Ans (1337-1453) entre France et Angleterre voit l'émergence de Jeanne d'Arc.`
      }
    ]
  },
  {
    id: "mythology",
    title: "Mythologies",
    icon: "⚡",
    description: "Plongez dans les récits légendaires des dieux et héros de toutes les civilisations",
    color: "from-purple-500/20 to-violet-500/20",
    sections: [
      {
        title: "Mythologie Grecque",
        content: `La mythologie grecque est l'un des systèmes mythologiques les plus riches et les plus influents de l'histoire. Elle a façonné l'art, la littérature, la philosophie et même le vocabulaire du monde occidental.

**Cosmogonie : la création du monde**

Au commencement était le Chaos, un vide primordial. De lui émergent Gaïa (la Terre), Tartare (les Abîmes), Éros (l'Amour), Nyx (la Nuit) et Érèbe (les Ténèbres). Gaïa engendre Ouranos (le Ciel), avec qui elle donne naissance aux Titans, aux Cyclopes et aux Hécatonchires (géants aux cent bras).

**Les Titans et la Titanomachie**

Cronos, le plus jeune Titan, renverse son père Ouranos. Mais une prophétie annonce qu'il sera à son tour détrôné par un de ses enfants. Cronos dévore donc chacun d'eux à la naissance. Rhéa, son épouse, cache le dernier-né : Zeus. Adulte, Zeus libère ses frères et sœurs et mène la guerre contre les Titans (Titanomachie), les vainc et les emprisonne dans le Tartare.

**L'Olympe et les dieux principaux**

Les dieux olympiens règnent depuis le mont Olympe :
- **Zeus** : roi des dieux, maître de la foudre
- **Héra** : reine des dieux, protectrice du mariage
- **Poséidon** : dieu des mers et des tremblements de terre
- **Hadès** : dieu des Enfers (ne réside pas sur l'Olympe)
- **Athéna** : déesse de la sagesse et de la stratégie guerrière
- **Apollon** : dieu du soleil, de la musique, de la prophétie
- **Artémis** : déesse de la chasse et de la lune
- **Arès** : dieu de la guerre
- **Aphrodite** : déesse de l'amour et de la beauté
- **Héphaïstos** : dieu du feu et de la forge
- **Hermès** : messager des dieux, dieu du commerce et des voyageurs
- **Dionysos** : dieu du vin et de l'extase

**Héros légendaires**

Héraclès (12 travaux), Ulysse (Odyssée), Achille (guerre de Troie, talon vulnérable), Persée (tueur de Méduse), Thésée (Minotaure), Jason (Toison d'Or).`,
      },
      {
        title: "Mythologie Nordique",
        content: `La mythologie nordique est l'ensemble des croyances des peuples germaniques et scandinaves (Vikings) avant leur christianisation (XIe-XIIe siècle). Elle nous est connue principalement par l'Edda poétique et l'Edda en prose de Snorri Sturluson (XIIIe siècle).

**Cosmogonie nordique**

Au début, seuls existent le Ginnungagap (vide primordial), Niflheim (monde de glace) et Muspellheim (monde de feu). De la rencontre entre glace et feu naît Ymir, le géant primordial, et Audhumla, la vache nourricière. Le dieu Odin et ses frères tuent Ymir et créent le monde à partir de son corps : sa chair devient la terre, son sang les mers, ses os les montagnes, son crâne le ciel.

**Les Neuf Mondes**

L'univers nordique s'organise autour d'Yggdrasil, l'arbre-monde (un frêne cosmique) :
- Asgard (monde des dieux Ases)
- Midgard (monde des humains)
- Jotunheim (monde des géants)
- Vanaheim (monde des dieux Vanes)
- Alfheim (monde des elfes lumineux)
- Svartalfheim (monde des elfes noirs/nains)
- Niflheim (monde de glace)
- Muspellheim (monde de feu)
- Helheim (monde des morts)

**Les dieux principaux**

- **Odin** : père de tous, dieu de la sagesse, de la guerre et de la magie. Il sacrifie un œil au puits de Mímir pour obtenir la connaissance et se pend à Yggdrasil 9 jours pour découvrir les runes.
- **Thor** : dieu du tonnerre, fils d'Odin, brandissant Mjölnir, son marteau magique. Protecteur des humains contre les géants.
- **Loki** : dieu de la ruse et du chaos, tantôt allié, tantôt ennemi des dieux. Père de Fenrir (le loup), Jörmungandr (le serpent-monde) et Hel (gardienne des morts).
- **Freya** : déesse de l'amour, de la beauté et de la magie
- **Tyr** : dieu du courage et de la justice, qui perd une main dans la gueule de Fenrir

**Le Ragnarök**

Le crépuscule des dieux : une prophétie annonce la fin du monde. Loki et ses enfants monstrueux se libèrent, les géants attaquent Asgard. Odin est dévoré par Fenrir, Thor tue le serpent Jörmungandr mais meurt de son venin. Le monde est englouti puis renaît, purifié, dans un cycle éternel.`
      },
      {
        title: "Mythologie Égyptienne",
        content: `La mythologie égyptienne est l'une des plus anciennes et des plus complexes, développée sur plus de 3 000 ans le long du Nil.

**Cosmogonie**

Selon la tradition héliopolitaine, au commencement était le Noun, l'océan primordial infini. De lui émerge Atoum (le « Tout »), qui crée Shou (l'air) et Tefnout (l'humidité), qui engendrent Geb (la terre) et Nout (le ciel). De Geb et Nout naissent Osiris, Isis, Seth et Nephthys — les dieux qui domineront le mythe central.

**Le mythe d'Osiris**

Osiris, roi bienveillant d'Égypte, est assassiné par son frère Seth (jaloux de son pouvoir), qui découpe son corps en 14 morceaux et les disperse à travers l'Égypte. Isis, épouse d'Osiris, les retrouve tous et reconstitue son corps (premier acte de momification). Elle conçoit magiquement Horus avec le corps reconstitué. Horus grandit et affronte Seth dans un combat épique pour venger son père. Osiris devient roi des morts.

**Les dieux principaux**

- **Rê/Ra** : dieu du soleil, traverse le ciel chaque jour sur sa barque
- **Osiris** : dieu des morts et de la résurrection
- **Isis** : déesse de la magie et de la maternité
- **Horus** : dieu faucon, protecteur du pharaon
- **Anubis** : dieu à tête de chacal, gardien des morts et de l'embaumement
- **Thot** : dieu à tête d'ibis, maître de l'écriture et de la sagesse
- **Seth** : dieu du chaos, des tempêtes et du désert
- **Bastet** : déesse chatte, protectrice du foyer
- **Sekhmet** : déesse lionne, guerrière et guérisseuse
- **Maât** : déesse de la vérité, justice et harmonie cosmique

**La pesée du cœur**

Après la mort, le cœur du défunt est pesé contre la plume de Maât. Si le cœur est plus léger (vie juste), le défunt accède au paradis (Champs d'Ialou). Sinon, il est dévoré par Ammout, monstre mi-crocodile, mi-lion, mi-hippopotame.`
      },
      {
        title: "Mythologie Japonaise",
        content: `La mythologie japonaise, liée au shintoïsme, est consignée dans le Kojiki (712) et le Nihon Shoki (720), les plus anciens textes du Japon.

**La création**

Izanagi et Izanami, couple divin, reçoivent la lance céleste Ame-no-nuboko. Ils plongent la lance dans l'océan primordial ; les gouttes qui tombent forment les îles du Japon. Ils engendrent les kami (esprits/dieux) de la nature. Izanami meurt en donnant naissance au dieu du feu. Izanagi descend au Yomi (pays des morts) pour la ramener, mais en la voyant putréfiée, il fuit, horrifié.

**Les trois divinités suprêmes**

En se purifiant après sa visite au Yomi, Izanagi engendre :
- **Amaterasu** (déesse du soleil) : de son œil gauche — divinité suprême du shintoïsme, ancêtre de la famille impériale
- **Tsukuyomi** (dieu de la lune) : de son œil droit
- **Susanoo** (dieu des tempêtes) : de son nez — impétueux et rebelle

**Le mythe d'Amaterasu**

Susanoo offense Amaterasu qui, furieuse, se retire dans une grotte, plongeant le monde dans l'obscurité. Les dieux attirent Amaterasu hors de la grotte grâce à une danse d'Ame-no-Uzume et un miroir sacré (Yata no Kagami) — l'un des trois trésors impériaux du Japon.

**Les kami**

Le shintoïsme reconnaît des myriades de kami (8 millions symboliquement) : esprits de la nature, ancêtres déifiés, forces naturelles. Chaque montagne, rivière, arbre peut abriter un kami. Le mont Fuji est considéré comme sacré. Les sanctuaires (jinja) avec leurs portes torii rouges marquent l'entrée du monde sacré.`
      },
      {
        title: "Mythologie Hindoue",
        content: `La mythologie hindoue est l'une des plus vastes et complexes au monde, avec des milliers de récits interconnectés dans les Puranas, le Mahabharata et le Ramayana.

**La Trimurti**

- **Brahma** : le créateur, avec quatre têtes regardant les quatre directions. Malgré son rôle, il est peu vénéré (un seul temple majeur, à Pushkar). Selon un mythe, Shiva le punit pour avoir menti.
- **Vishnu** : le préservateur, représenté en bleu, couché sur le serpent cosmique Shesha. Il s'incarne sur terre (avatars) pour restaurer le dharma quand le mal domine. Ses 10 avatars incluent Matsya (poisson), Kurma (tortue), Varaha (sanglier), Narasimha (homme-lion), Rama et Krishna.
- **Shiva** : le destructeur/transformateur, ascète suprême et danseur cosmique (Nataraja). Il médite au mont Kailash, porte le Gange dans ses cheveux, un croissant de lune et un serpent autour du cou. Son troisième œil peut détruire le monde.

**Krishna**

L'une des divinités les plus aimées, avatar de Vishnu. Enfant espiègle volant du beurre, adolescent charmeur jouant de la flûte pour les gopis (bergères), puis guerrier et philosophe de la Bhagavad-Gita où il révèle à Arjuna la nature de la réalité et du devoir.

**Ganesh**

Dieu à tête d'éléphant, fils de Shiva et Parvati. Shiva, revenant après une longue absence, ne reconnaît pas son fils qui lui barre l'entrée et le décapite. Réalisant son erreur, il remplace la tête par celle du premier animal rencontré : un éléphant. Ganesh est le dieu de la sagesse, des débuts et le destructeur des obstacles. Il est invoqué au commencement de toute entreprise.

**Le Ramayana**

L'épopée de Rama (avatar de Vishnu), prince d'Ayodhya, exilé 14 ans dans la forêt. Son épouse Sita est enlevée par le démon Ravana. Avec l'aide d'Hanuman (dieu singe dévoué) et d'une armée de singes, Rama traverse l'océan, combat et vainc Ravana. Le retour victorieux de Rama est célébré lors de Diwali, la fête des lumières.`
      },
      {
        title: "Mythologie Africaine",
        content: `Les mythologies africaines forment un ensemble extraordinairement riche et diversifié, avec des milliers de traditions orales couvrant le continent.

**Caractéristiques communes**

Malgré leur diversité, de nombreuses mythologies africaines partagent des thèmes : un Dieu créateur suprême souvent retiré du monde, des divinités intermédiaires ou esprits de la nature, des ancêtres qui influencent les vivants, une connexion profonde entre monde visible et invisible, et l'importance de la communauté et de la transmission orale.

**Mythologie Yoruba** (Nigeria, Bénin)

Olodumare est le Dieu suprême. Les Orishas sont des divinités intermédiaires :
- **Shango** : dieu du tonnerre et de la justice
- **Yemoja** : déesse mère des eaux
- **Ogun** : dieu du fer et de la guerre
- **Oshun** : déesse de l'amour et des rivières
- **Eshu/Elegba** : messager divin, gardien des carrefours

Cette tradition a survécu à l'esclavage et donné naissance au candomblé (Brésil), à la santería (Cuba) et au vaudou (Haïti).

**Mythologie Égyptienne** (traitée séparément)

**Anansi** (Afrique de l'Ouest)

L'araignée Anansi est un personnage central des contes akan (Ghana). Rusé et intelligent, il utilise la ruse plutôt que la force. Ces contes ont voyagé avec la diaspora africaine jusqu'aux Caraïbes et aux Amériques.

**Mwindo** (Congo)

Héros épique né miraculeusement, Mwindo affronte son père le roi Shemwindo, descend aux enfers, monte au ciel et apprend l'humilité. L'Épopée de Mwindo est l'un des rares textes épiques africains retranscrits.`
      }
    ]
  },
  {
    id: "science",
    title: "Sciences",
    icon: "🔬",
    description: "Comprenez les lois fondamentales qui régissent notre monde",
    color: "from-green-500/20 to-emerald-500/20",
    sections: [
      {
        title: "Physique",
        content: `La physique est la science fondamentale qui étudie la nature, de l'infiniment petit (particules subatomiques) à l'infiniment grand (univers).

**Mécanique classique (Newton)**

Isaac Newton (1643-1727) révolutionne la physique avec ses trois lois du mouvement et la loi de la gravitation universelle. La pomme qui tombe et la Lune en orbite obéissent à la même force. Ses Principia Mathematica (1687) sont l'un des ouvrages scientifiques les plus importants jamais écrits.

**Électromagnétisme (Maxwell)**

James Clerk Maxwell unifie électricité et magnétisme en quatre équations élégantes (1865), prédisant l'existence des ondes électromagnétiques (confirmées par Hertz). La lumière elle-même est une onde électromagnétique. Cette découverte mène à la radio, la télévision, le radar, le micro-ondes, le Wi-Fi.

**Relativité (Einstein)**

Albert Einstein transforme notre compréhension de l'univers :
- **Relativité restreinte (1905)** : rien ne va plus vite que la lumière, E=mc² (l'énergie et la masse sont équivalentes), le temps ralentit à grande vitesse
- **Relativité générale (1915)** : la gravité n'est pas une force mais une courbure de l'espace-temps causée par la masse. Prédictions confirmées : déviation de la lumière, ondes gravitationnelles (détectées en 2015), trous noirs

**Mécanique quantique**

Le monde subatomique obéit à des règles contre-intuitives : les particules sont aussi des ondes (dualité onde-corpuscule), on ne peut connaître simultanément la position et la vitesse d'une particule (principe d'incertitude de Heisenberg), et des particules peuvent être « intriquées » (corrélées instantanément à n'importe quelle distance). Développée par Planck, Bohr, Heisenberg, Schrödinger, Dirac.`
      },
      {
        title: "Biologie",
        content: `La biologie est la science du vivant, depuis les molécules d'ADN jusqu'aux écosystèmes planétaires.

**La cellule**

Tous les êtres vivants sont composés de cellules, unités fondamentales de la vie. Robert Hooke les découvre en 1665. Il existe deux types : les procaryotes (bactéries, sans noyau) et les eucaryotes (avec noyau, présentes chez les animaux, plantes, champignons). La cellule humaine contient environ 20 000 gènes.

**L'ADN et la génétique**

L'ADN (acide désoxyribonucléique) est la molécule qui porte l'information génétique. Sa structure en double hélice est découverte en 1953 par Watson, Crick et Franklin. Le projet Génome Humain (1990-2003) séquence les 3 milliards de paires de bases de notre ADN. CRISPR-Cas9 permet aujourd'hui d'éditer le génome avec précision.

**L'évolution**

Charles Darwin (1809-1882) propose la théorie de l'évolution par sélection naturelle dans « L'Origine des espèces » (1859). Les organismes varient naturellement ; ceux dont les variations sont avantageuses dans leur environnement survivent et se reproduisent davantage. Sur des millions d'années, ce processus produit la diversité de la vie.

**Écologie et biodiversité**

La Terre abrite environ 8,7 millions d'espèces, dont seulement 1,2 million sont décrites. Les écosystèmes fonctionnent en réseaux complexes : producteurs (plantes), consommateurs (animaux), décomposeurs (bactéries, champignons). La 6e extinction de masse est en cours, causée par l'activité humaine — le taux d'extinction est 1 000 fois supérieur au taux naturel.`
      }
    ]
  },
  {
    id: "philosophy",
    title: "Philosophie",
    icon: "🧠",
    description: "Explorez les grandes questions de l'existence et de la pensée humaine",
    color: "from-cyan-500/20 to-teal-500/20",
    sections: [
      {
        title: "La philosophie antique",
        content: `**Les présocratiques**

Avant Socrate, les philosophes grecs cherchaient l'arché, le principe fondamental de toute chose :
- **Thalès** (vers 624-546 av. J.-C.) : l'eau est le principe de tout
- **Héraclite** : « On ne se baigne jamais deux fois dans le même fleuve » — tout est changement
- **Parménide** : le changement est une illusion, seul l'Être existe
- **Démocrite** : tout est composé d'atomes (intuition géniale 2 400 ans avant la physique moderne)
- **Pythagore** : les nombres gouvernent l'univers

**Socrate (470-399 av. J.-C.)**

Le père de la philosophie occidentale. Il n'écrit rien mais révolutionne la pensée par sa méthode : la maïeutique (art d'accoucher les esprits). Par le questionnement incessant, il amène ses interlocuteurs à découvrir qu'ils ne savent rien (« Je sais que je ne sais rien »). Accusé de corrompre la jeunesse et d'impiété, il est condamné à boire la ciguë. Il choisit la mort plutôt que l'exil, fidèle à ses principes.

**Platon (427-347 av. J.-C.)**

Disciple de Socrate, il fonde l'Académie (première université). Sa théorie des Idées (ou Formes) postule que le monde sensible n'est qu'une ombre du monde des Idées parfaites et éternelles. L'allégorie de la caverne illustre cette vision : nous sommes comme des prisonniers ne voyant que les ombres de la réalité. Ses dialogues (La République, Le Banquet, Phédon) restent fondamentaux.

**Aristote (384-322 av. J.-C.)**

Disciple de Platon puis son rival intellectuel, Aristote est peut-être le plus grand encyclopédiste de l'Antiquité. Il fonde la logique formelle, étudie la biologie, la physique, l'éthique, la politique, la poétique. Contrairement à Platon, il part de l'observation du monde réel. Sa philosophie dominera la pensée occidentale et islamique pendant 2 000 ans.

**Stoïcisme et Épicurisme**

- **Stoïciens** (Zénon, Épictète, Marc Aurèle) : accepter ce qu'on ne peut changer, maîtriser ses émotions, vivre selon la raison et la vertu
- **Épicuriens** : le bonheur est dans le plaisir mesuré (ataraxie), l'absence de douleur et l'amitié. Épicure ne prône pas l'hédonisme débridé mais la simplicité`
      }
    ]
  },
  {
    id: "technology",
    title: "Technologie & IA",
    icon: "🤖",
    description: "De la révolution industrielle à l'intelligence artificielle",
    color: "from-pink-500/20 to-fuchsia-500/20",
    sections: [
      {
        title: "L'Intelligence Artificielle",
        content: `L'intelligence artificielle (IA) est l'un des développements technologiques les plus transformateurs de l'histoire humaine, avec le potentiel de redéfinir chaque aspect de notre civilisation.

**Origines**

Le terme « intelligence artificielle » est inventé en 1956 lors de la conférence de Dartmouth par John McCarthy. Mais l'idée est plus ancienne : Alan Turing propose dès 1950 le « test de Turing » pour évaluer si une machine peut penser. Les premiers programmes d'IA jouent aux échecs, prouvent des théorèmes et conversent (ELIZA, 1966).

**L'hiver de l'IA et la renaissance**

Après un enthousiasme initial, l'IA traverse des « hivers » (années 70, 80) où le financement se tarit face aux promesses non tenues. La renaissance vient du deep learning (apprentissage profond) dans les années 2010 : les réseaux de neurones artificiels, inspirés du cerveau humain, alimentés par des données massives et une puissance de calcul exponentiellement croissante, atteignent des performances surhumaines.

**Moments clés**

- 1997 : Deep Blue (IBM) bat Kasparov aux échecs
- 2011 : Watson (IBM) gagne à Jeopardy!
- 2016 : AlphaGo (DeepMind) bat le champion mondial de Go — considéré comme un exploit car le Go a plus de positions possibles que d'atomes dans l'univers
- 2020 : GPT-3 (OpenAI) génère du texte quasi-humain
- 2022 : ChatGPT révolutionne l'accès public à l'IA
- 2023-2024 : GPT-4, Claude, Gemini — l'IA devient multimodale

**Types d'IA**

- **IA étroite** (actuelle) : excelle dans une tâche spécifique
- **IA générale (AGI)** : hypothétique, capable de toute tâche intellectuelle humaine
- **Super-intelligence** : hypothétique, surpasserait l'intelligence humaine dans tous les domaines

**Impact**

L'IA transforme déjà la médecine (diagnostic, découverte de médicaments), la science (AlphaFold prédit la structure de 200 millions de protéines), l'art, l'éducation, le transport et la communication. Les questions éthiques sont immenses : biais algorithmiques, emploi, désinformation, autonomie militaire, vie privée.`
      }
    ]
  },
  {
    id: "geography",
    title: "Géographie",
    icon: "🌍",
    description: "Découvrez les paysages, climats et phénomènes de notre planète",
    color: "from-teal-500/20 to-cyan-500/20",
    sections: [
      {
        title: "La Terre",
        content: `Notre planète est un miracle cosmique : la seule connue à abriter la vie dans l'immensité de l'univers.

**Structure de la Terre**

La Terre est composée de couches concentriques : la croûte (fine coquille rocheuse, 5-70 km), le manteau (roche visqueuse, 2 900 km), le noyau externe (fer liquide, créant le champ magnétique) et le noyau interne (fer solide à 5 400°C, aussi chaud que la surface du Soleil).

**Tectonique des plaques**

La surface terrestre est divisée en 15 plaques tectoniques majeures qui se déplacent de quelques centimètres par an. Leurs interactions créent les séismes, les volcans et les montagnes. L'Himalaya se forme par la collision de la plaque indienne avec la plaque eurasienne. La ceinture de feu du Pacifique concentre 75% des volcans actifs et 90% des séismes.

**Les océans**

Les océans couvrent 71% de la surface terrestre et contiennent 97% de l'eau de la planète. Ils régulent le climat, produisent 50% de l'oxygène (via le phytoplancton) et abritent une biodiversité immense dont 80% reste à découvrir. La fosse des Mariannes (10 994 m) est le point le plus profond — la pression y est 1 000 fois celle de la surface.

**Les continents**

Au fil de l'histoire géologique, les continents se sont assemblés et dispersés. La Pangée, dernier supercontinent, s'est fragmentée il y a 200 millions d'années. L'Afrique et l'Amérique du Sud s'emboîtent comme un puzzle — preuve de la dérive des continents, théorie proposée par Alfred Wegener en 1912.

**Records géographiques**

- Point le plus haut : Everest (8 849 m)
- Point le plus bas : Mer Morte (-430 m)
- Plus grand désert : Sahara (9,2 millions km²)
- Plus long fleuve : Nil (6 650 km) ou Amazone (débat)
- Plus grande forêt : Amazonie (5,5 millions km²)`
      }
    ]
  },
  {
    id: "geopolitics",
    title: "Géopolitique",
    icon: "🏛️",
    description: "Comprenez les enjeux de pouvoir qui façonnent le monde actuel",
    color: "from-slate-500/20 to-gray-500/20",
    sections: [
      {
        title: "L'ordre mondial",
        content: `La géopolitique étudie les relations entre les États, les dynamiques de pouvoir et les enjeux stratégiques qui façonnent le monde.

**Du monde bipolaire au monde multipolaire**

La Guerre froide (1947-1991) divise le monde en deux blocs : États-Unis (capitalisme, démocratie libérale) vs Union soviétique (communisme). La chute du mur de Berlin (1989) et la dissolution de l'URSS (1991) créent un moment unipolaire américain. Mais au XXIe siècle, l'émergence de la Chine, le retour de la Russie et l'affirmation de puissances régionales (Inde, Brésil, Turquie) créent un monde multipolaire.

**Les grandes puissances actuelles**

- **États-Unis** : superpuissance militaire, économique et culturelle, mais relative déclin d'influence
- **Chine** : 2e économie mondiale, en rivalité systémique avec les USA, Initiative Ceinture et Route
- **Russie** : puissance nucléaire et énergétique, influence en ex-URSS
- **Union Européenne** : puissance économique et normative, défis d'unité
- **Inde** : pays le plus peuplé, puissance émergente, démocratie géante

**Enjeux du XXIe siècle**

Le changement climatique est le défi existentiel : montée des eaux, événements extrêmes, migrations climatiques. La course à l'IA et la cybersécurité redéfinissent la puissance. La démographie (vieillissement en Occident et Asie de l'Est, croissance en Afrique) transformera les équilibres. L'eau, les ressources et la sécurité alimentaire deviennent des enjeux stratégiques majeurs.`
      }
    ]
  }
];
