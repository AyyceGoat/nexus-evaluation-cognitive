import type { ArticlesDuDomaine } from './types';

/**
 * Articles du domaine « Psychologie & Philosophie ».
 *
 * Ce domaine demande une précaution particulière. Plusieurs de ses sujets les
 * plus célèbres reposent sur des études dont les conclusions populaires ne
 * correspondent pas à ce que les travaux originaux établissent — Dunning-Kruger,
 * la pyramide de Maslow, l'expérience de Stanford. La règle suivie ici est de
 * donner d'abord ce que l'étude a réellement mesuré, puis ce qui en a été fait,
 * puis l'état de la critique. Un article de vulgarisation qui répète une erreur
 * répandue ne rend pas service ; il coûte même plus cher qu'une absence
 * d'article, parce qu'il installe une fausse certitude.
 */
export const articlesPensee: ArticlesDuDomaine = {
  /* ═════════════════════════════════════════════════════════════════════ */
  phil_stoicisme: [
    {
      titre: 'Une école, trois auteurs qui nous restent',
      paragraphes: [
        'Le stoïcisme est fondé à Athènes vers 301 avant notre ère par Zénon de Citium, qui enseignait sous un portique peint — le "stoa poikilè" — d’où l’école tire son nom. Ses successeurs, Cléanthe et surtout Chrysippe, en font un système complet couvrant la logique, la physique et l’éthique. De cette production considérable, presque rien n’a survécu.',
        'Ce que nous lisons aujourd’hui vient de trois Romains, à trois places sociales opposées. Sénèque (vers 4 av. J.-C. – 65 ap. J.-C.), sénateur, homme d’affaires immensément riche et précepteur de Néron, auteur de lettres à Lucilius. Épictète (vers 50-135), né esclave en Phrygie, dont l’enseignement oral nous est parvenu par les notes de son élève Arrien. Marc Aurèle (121-180), empereur romain, qui tenait un carnet personnel sans intention de publication — ce sont les "Pensées pour moi-même". Un esclave, un ministre et un empereur écrivant la même doctrine : le fait est en lui-même un argument sur sa portée.',
      ],
    },
    {
      titre: 'La distinction centrale',
      paragraphes: [
        'Tout part d’un partage que le "Manuel" d’Épictète place en première ligne : certaines choses dépendent de nous, d’autres non. Dépendent de nous nos jugements, nos intentions, nos désirs, nos réactions. N’en dépendent pas notre corps, notre réputation, nos biens, les actions d’autrui, l’issue des évènements. Le trouble, selon les stoïciens, naît systématiquement de la confusion entre les deux : nous exigeons du monde ce qu’il ne nous doit pas, et nous négligeons le seul terrain où nous avons réellement prise.',
        'La conséquence n’est pas le renoncement à l’action, et c’est le contrepoint le plus important à faire. Un stoïcien agit, s’engage, gouverne — Marc Aurèle a passé des années en campagne militaire. Mais il distingue l’effort, qui lui appartient, du résultat, qui ne lui appartient pas. Il s’engage pleinement et accueille l’issue sans s’y être suspendu.',
        'La seconde thèse forte est que la vertu est le seul bien véritable. Santé, richesse, honneurs sont des « préférables » : on a raison de les rechercher, mais leur perte n’entame pas ce qui compte. C’est une position exigeante, et les stoïciens eux-mêmes reconnaissaient que le sage parfait est une figure limite.',
      ],
    },
    {
      titre: 'Les exercices, car c’était une pratique',
      paragraphes: [
        'La "premeditatio malorum" consiste à se représenter par avance ce qui pourrait mal tourner, non pour s’angoisser mais pour retirer à l’évènement son pouvoir de surprise et vérifier qu’on y survivrait. La version moderne, utilisée en gestion de projet sous le nom de "pre-mortem", est exactement le même exercice.',
        'La « vue d’en haut » consiste à se représenter sa situation à l’échelle de la cité, du continent, du temps historique — Marc Aurèle y revient constamment. Elle recalibre l’importance attribuée à un incident. L’examen du soir, pratiqué par Sénèque, consiste à passer sa journée en revue en cherchant ce qu’on a mal jugé.',
        'Enfin la distinction entre l’évènement et le jugement porté sur lui, formulée par Épictète : « ce ne sont pas les choses qui troublent les hommes, mais les opinions qu’ils en ont ». Cette phrase est citée explicitement par Albert Ellis et Aaron Beck comme source de la thérapie cognitive, aujourd’hui le traitement psychologique le mieux validé pour l’anxiété et la dépression. Le lien entre stoïcisme et psychothérapie contemporaine n’est pas une reconstruction rétrospective : il est revendiqué par les fondateurs de cette dernière.',
      ],
    },
    {
      titre: 'Deux malentendus à écarter',
      paragraphes: [
        'Le premier est linguistique. « Stoïque » en français courant signifie impassible, insensible. Or les stoïciens ne visaient pas la suppression des émotions mais la correction des jugements qui produisent les émotions destructrices. Ils reconnaissaient des affects positifs — la joie de l’action juste, l’affection — et Sénèque écrit longuement sur le chagrin. Viser l’absence de sentiment serait, dans leur vocabulaire, une erreur sur la nature humaine.',
        'Le second est politique. On reproche au stoïcisme un quiétisme commode : si seul mon jugement compte, pourquoi combattre l’injustice ? L’objection a du poids, et la biographie de Sénèque — richesse considérable accumulée au service d’un tyran — lui donne un relief embarrassant. Les stoïciens y répondaient par le devoir de participation aux affaires communes, la doctrine du cosmopolitisme et l’égalité de nature entre esclaves et libres, position remarquable pour l’époque et effectivement soutenue par Épictète et Marc Aurèle. Le débat reste ouvert, et c’est ainsi qu’il faut le présenter.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est la philosophie antique qui a le mieux survécu à l’épreuve de l’usage : ses exercices sont repris, souvent sans être nommés, par la thérapie cognitive, la préparation mentale sportive et la gestion du risque. Un corpus vieux de deux mille ans dont les techniques passent encore les essais cliniques mérite l’attention.',
        'Parce que son outil principal — trier ce qui dépend de soi — est immédiatement applicable et rarement appliqué. La plupart de nos ruminations portent, à l’examen, sur des objets hors de notre prise : l’opinion d’autrui, un résultat déjà joué, un passé non modifiable. Faire ce tri ne résout pas les problèmes, mais il réaffecte l’effort là où il produit quelque chose.',
        'Parce qu’il faut enfin se méfier de sa version commerciale actuelle, qui réduit souvent la doctrine à une technique de productivité individuelle en supprimant précisément ce qui lui donnait sa force : l’exigence morale, le devoir envers la cité, et l’idée que la vertu est le seul bien.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  phil_absurde_camus: [
    {
      titre: 'Un homme, un lieu, une expérience',
      paragraphes: [
        'Albert Camus naît en 1913 en Algérie, dans une famille très pauvre ; son père meurt à la Marne en 1914, sa mère est domestique et à demi sourde. Il est tuberculeux dès dix-sept ans, ce qui lui interdit l’agrégation et l’installe très jeune dans la proximité de la mort. Journaliste, résistant, directeur du journal "Combat", prix Nobel de littérature en 1957, il meurt dans un accident de voiture le 4 janvier 1960, à quarante-six ans, avec un billet de train non utilisé dans sa poche.',
        'Ces éléments biographiques comptent, parce que sa philosophie ne part pas d’un problème de bibliothèque mais d’une expérience : la pauvreté, la maladie, la lumière et la mer d’Algérie, et l’absence de consolation religieuse. Il a lui-même refusé l’étiquette d’existentialiste, qu’on lui appose toujours.',
      ],
    },
    {
      titre: 'Ce qu’il appelle l’absurde',
      paragraphes: [
        'L’absurde n’est pas une propriété du monde, et ce point est constamment mal rapporté. Ce n’est pas « la vie est absurde » au sens de « rien n’a de sens ». L’absurde est un rapport, un divorce : la confrontation entre le besoin humain de sens, d’unité et de clarté, et le silence du monde qui ne répond pas. Il naît de la rencontre des deux termes et disparaît si l’un des deux disparaît.',
        '« Le Mythe de Sisyphe », publié en 1942, s’ouvre sur une phrase restée célèbre : il n’y a qu’un problème philosophique vraiment sérieux, le suicide. La question posée est donc pratique : si l’existence n’a pas de sens donné, faut-il continuer ? Le livre est la réponse à cette question, et cette réponse est non.',
      ],
    },
    {
      titre: 'Trois issues, dont deux refusées',
      paragraphes: [
        'La première issue est le suicide. Camus la refuse au motif qu’elle ne résout pas l’absurde mais le supprime en supprimant l’un de ses deux termes ; c’est un consentement, pas une réponse.',
        'La deuxième est ce qu’il nomme le « suicide philosophique » : le saut dans une transcendance qui restaurerait le sens — foi religieuse, mais aussi tout système historique ou politique qui promettrait une signification totale. Il conduit sa critique contre Kierkegaard, Jaspers et Chestov, et il lui reproche de trahir la lucidité qui avait fait découvrir l’absurde. Ce n’est pas un rejet de la religion par argument métaphysique, c’est un refus de renoncer à la clarté qu’on vient d’acquérir.',
        'La troisième est la révolte, qu’il retient. Elle consiste à tenir les deux termes ensemble : maintenir la lucidité sur l’absence de sens donné, et refuser de s’y résigner. Trois conséquences en découlent, qu’il nomme : la révolte, la liberté et la passion — vivre le plus possible, plutôt que le mieux selon une échelle extérieure. Sisyphe, condamné à rouler éternellement son rocher, est son emblème parce qu’il connaît sa condition et la domine par cette connaissance même : « il faut imaginer Sisyphe heureux ».',
      ],
    },
    {
      titre: 'De l’absurde à la révolte solidaire',
      paragraphes: [
        '« L’Étranger », la même année 1942, met en scène Meursault, un homme qui ne joue pas la comédie des sentiments attendus et que la société condamne moins pour son meurtre que pour n’avoir pas pleuré à l’enterrement de sa mère. « La Peste », en 1947, marque un déplacement décisif : face à l’épidémie, le docteur Rieux soigne sans espoir de victoire définitive et sans justification transcendante. La révolte cesse d’être solitaire et devient solidaire.',
        '« L’Homme révolté », en 1951, tire les conséquences politiques : Camus y soutient que les révolutions qui prétendent justifier le meurtre au nom d’un sens futur de l’histoire retombent dans le « suicide philosophique », sous forme collective. La formule qui résume son déplacement est « je me révolte, donc nous sommes ». Le livre provoque une rupture publique et définitive avec Sartre et la revue "Les Temps modernes" en 1952, sur la question des camps soviétiques et de la violence révolutionnaire.',
        'Sa position sur la guerre d’Algérie lui a valu d’être attaqué des deux côtés : il appelle en 1956 à une trêve civile épargnant les populations, refuse le terrorisme comme la répression, et ne se rallie ni à l’indépendance ni au maintien de l’ordre colonial. Cette position, jugée intenable à l’époque, est aujourd’hui discutée avec plus de nuance ; elle reste l’un des points où son œuvre est le plus vivement débattue.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que c’est l’une des rares philosophies qui prend au sérieux la question « pourquoi continuer ? » sans y répondre par une promesse. Elle n’offre aucune consolation, ce qui la rend inconfortable et fiable : elle ne peut pas être démentie par les faits, puisqu’elle part de leur pire état.',
        'Parce que la structure de l’argument — refuser à la fois le désespoir et la fausse consolation — se transpose bien au-delà de la métaphysique. Elle éclaire la manière de tenir devant un diagnostic, un deuil, une injustice durable, ou une crise dont on sait qu’elle ne se résoudra pas de son vivant. « La Peste » est régulièrement relu pour cette raison, et l’a été massivement en 2020.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_biais_cognitifs: [
    {
      titre: 'Deux psychologues et un programme de recherche',
      paragraphes: [
        'En 1974, Amos Tversky et Daniel Kahneman publient dans "Science" un article intitulé « Jugement en situation d’incertitude : heuristiques et biais ». Leur thèse est que les erreurs de jugement humaines ne sont pas aléatoires : elles sont systématiques, prévisibles, et proviennent de raccourcis mentaux — des heuristiques — qui fonctionnent bien dans la plupart des cas et échouent dans des conditions identifiables.',
        'Ce programme a transformé l’économie autant que la psychologie, en fournissant une alternative documentée au modèle de l’agent parfaitement rationnel. Kahneman a reçu le prix Nobel d’économie en 2002 ; Tversky, mort en 1996, ne pouvait pas le partager.',
      ],
    },
    {
      titre: 'Les trois heuristiques d’origine',
      paragraphes: [
        'La disponibilité : on juge de la fréquence d’un évènement par la facilité avec laquelle des exemples viennent à l’esprit. Les accidents d’avion sont surestimés et les accidents domestiques sous-estimés, parce que les premiers sont racontés et les seconds non. C’est le mécanisme par lequel la couverture médiatique déforme la perception du risque, indépendamment de toute intention.',
        'La représentativité : on juge de la probabilité d’appartenance à une catégorie par la ressemblance au stéréotype de cette catégorie, en négligeant la fréquence de base. Décrire quelqu’un comme timide et méticuleux fait conclure « bibliothécaire » plutôt que « commercial », alors qu’il y a bien plus de commerciaux que de bibliothécaires. L’oubli des fréquences de base est probablement l’erreur la plus coûteuse en pratique, notamment en diagnostic médical.',
        'L’ancrage : un nombre présenté avant une estimation influence l’estimation, même quand il est manifestement arbitraire. L’effet a été montré avec des nombres tirés d’une roue de loterie. C’est le fondement de toute négociation par première offre, et il résiste à la connaissance qu’on en a.',
      ],
    },
    {
      titre: 'Les biais qui coûtent le plus cher',
      paragraphes: [
        'Le biais de confirmation, étudié dès 1960 par Peter Wason : on cherche les informations qui confirment ce qu’on croit et on soumet les autres à un examen plus sévère. Il ne relève pas de la malhonnêteté et s’observe chez les experts autant que chez les novices, souvent davantage parce qu’ils disposent de meilleurs arguments.',
        'L’aversion à la perte, établie par la théorie des perspectives de 1979 : perdre cent unités fait à peu près deux fois plus mal que gagner cent unités ne fait plaisir. Elle explique le maintien de positions perdantes, la réticence à changer d’emploi et l’effet de la présentation d’un même choix en termes de gains ou de pertes — c’est l’effet de cadrage.',
        'Les coûts irrécupérables : on persévère dans un projet parce qu’on y a déjà investi, alors que seul l’avenir devrait entrer dans la décision. Le biais rétrospectif : après coup, on juge l’évènement prévisible, ce qui rend l’évaluation des décisions passées systématiquement injuste. Et l’erreur d’attribution : on explique le comportement d’autrui par son caractère et le sien par les circonstances.',
      ],
    },
    {
      titre: 'Ce que la crise de la réplication a changé',
      paragraphes: [
        'La psychologie sociale a traversé à partir de 2011 une crise sérieuse : de nombreux résultats célèbres n’ont pas résisté à des tentatives de reproduction rigoureuses. Plusieurs effets d’amorçage comportemental sont aujourd’hui considérés comme non établis ; l’épuisement de la volonté est vivement contesté ; certaines expériences très médiatisées se sont révélées fragiles ou, dans quelques cas, fondées sur des données falsifiées.',
        'Il faut donc distinguer deux niveaux. Les heuristiques centrales — ancrage, disponibilité, aversion à la perte, cadrage — reposent sur des effets robustes, reproduits à grande échelle et souvent observables sur des données de terrain. Les applications les plus spectaculaires, en revanche, méritent d’être vérifiées une par une. Kahneman lui-même a publiquement reconnu que le chapitre de son livre consacré à l’amorçage ne tenait plus.',
        'Un résultat plus décevant encore concerne la correction : connaître un biais ne suffit généralement pas à s’en protéger. Les formations à la « débiaisation » ont des effets faibles et peu durables. Ce qui fonctionne mieux relève du dispositif plutôt que de la volonté : listes de vérification, critères de décision fixés avant de voir les données, avis contradictoire organisé, et recours aux statistiques de référence plutôt qu’au jugement au cas par cas.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que ces mécanismes sont exploités professionnellement : ancrage dans l’affichage des prix, rareté artificielle, cadrage des offres, pertes présentées comme des gains manqués. Les reconnaître ne rend pas invulnérable, mais déplace l’attention du contenu de l’offre vers sa mise en scène.',
        'Parce que la leçon la plus utile est modeste : puisqu’on ne se corrige pas par la seule lucidité, il faut changer la procédure. Décider selon des critères écrits à l’avance, demander à quelqu’un d’argumenter contre, chercher la fréquence de base avant l’intuition. Ce sont des gestes de méthode, pas des efforts de caractère.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_dunning_kruger: [
    {
      titre: 'Ce que l’étude de 1999 a réellement fait',
      paragraphes: [
        'Justin Kruger et David Dunning publient en 1999 un article au titre explicite : « Non qualifié et inconscient de l’être ». Ils font passer à des étudiants des épreuves de grammaire, de logique et d’humour, puis leur demandent d’estimer leur propre résultat et leur rang par rapport aux autres.',
        'Le résultat central est que l’auto-évaluation corrèle faiblement avec la performance réelle. Les participants du quart inférieur se situaient en moyenne autour du soixantième centile alors qu’ils se situaient autour du douzième ; ceux du quart supérieur se sous-estimaient légèrement. L’interprétation proposée par les auteurs est métacognitive : les compétences nécessaires pour bien faire sont largement les mêmes que celles nécessaires pour juger si l’on a bien fait. Quelqu’un qui ignore les règles de grammaire ne peut pas détecter ses propres fautes.',
      ],
    },
    {
      titre: 'Le graphique qui n’est pas dans l’article',
      paragraphes: [
        'L’image qui circule partout — une courbe avec un « pic de la bêtise » au début, une « vallée du désespoir » ensuite, puis une remontée — ne figure pas dans l’étude et ne correspond à aucune de ses données. Elle a été fabriquée plus tard, dans des présentations de management et sur Internet, en mélangeant le résultat de 1999 avec une courbe d’apprentissage.',
        'Ce que montrent les données réelles est bien plus plat : une auto-évaluation relativement uniforme quel que soit le niveau, donc une surestimation en bas et une légère sous-estimation en haut. Il n’y a ni pic, ni vallée, ni parcours en plusieurs phases.',
      ],
    },
    {
      titre: 'L’objection statistique, qui est sérieuse',
      paragraphes: [
        'Plusieurs auteurs ont montré qu’une bonne partie du motif observé peut être produite mécaniquement, sans aucun phénomène psychologique. Deux effets se combinent. D’abord la régression vers la moyenne : toute mesure comportant du bruit fait apparaître les extrêmes comme moins extrêmes sur une seconde mesure. Ensuite l’effet « meilleur que la moyenne » : la plupart des gens s’estiment un peu au-dessus de la moyenne sur presque tout, indépendamment de leur niveau réel.',
        'Si l’on simule des participants dont l’auto-évaluation est purement aléatoire autour d’une valeur légèrement supérieure à la moyenne, on obtient un graphique très semblable à celui de Kruger et Dunning. Des travaux publiés notamment par Edward Nuhfer et ses collègues, puis par Gignac et Zajenkowski en 2020, concluent que l’effet est en grande partie, peut-être entièrement, un artefact de cette nature.',
        'La réponse des défenseurs de l’interprétation métacognitive existe : des protocoles contrôlant la régression retrouvent une part d’effet résiduel, et le déficit de métacognition chez les personnes peu compétentes est par ailleurs documenté par d’autres méthodes. La position honnête aujourd’hui est donc : le phénomène de mauvaise auto-évaluation est réel et bien attesté, son ampleur et son mécanisme sont contestés, et le célèbre graphique est faux.',
      ],
    },
    {
      titre: 'Ce que la métacognition bien mesurée montre',
      paragraphes: [
        'Il existe une littérature plus ancienne et plus solide sur la question voisine du calibrage : demander à quelqu’un d’assortir ses jugements d’une probabilité, puis vérifier si les évènements auxquels il attribuait 80 % de chances se produisent bien environ 80 % du temps. C’est une mesure directe de la qualité de l’auto-évaluation, et elle échappe aux critiques adressées au protocole de 1999.',
        'Les résultats sont nets et plus intéressants que l’effet Dunning-Kruger. L’excès de confiance est général : sur des questions de culture générale, les réponses données avec une certitude de 100 % sont fausses dans une proportion notable des cas. Mais le calibrage dépend beaucoup du métier, et il dépend d’une seule chose — la présence d’un retour d’information rapide, fréquent et sans ambiguïté. Les prévisionnistes météo et les bookmakers sont remarquablement bien calibrés : ils apprennent chaque jour si leur probabilité était bonne. Les médecins sur des pronostics à long terme, les recruteurs et les analystes financiers le sont beaucoup moins, parce qu’ils n’observent presque jamais le résultat de leurs jugements dans des conditions comparables.',
        'La conclusion pratique est nettement plus utile que le graphique populaire : ce qui produit une bonne auto-évaluation n’est ni l’intelligence ni l’humilité, c’est une boucle de retour. Là où elle manque, il faut la fabriquer — écrire ses prédictions avec leur date et leur probabilité, puis les relire.',
      ],
    },
    {
      titre: 'L’usage social, et son problème',
      paragraphes: [
        'L’effet est presque toujours invoqué pour disqualifier quelqu’un d’autre : celui qui ne sait pas qu’il ne sait pas est toujours l’interlocuteur. Or l’étude, si l’on retient son interprétation, s’applique d’abord à celui qui la cite, puisque personne n’a accès à ses propres angles morts par introspection. Utilisé comme argument dans une discussion, il fonctionne comme une attaque sur la compétence de l’adversaire plutôt que sur son raisonnement.',
        'Il est également devenu un exemple de la manière dont un résultat scientifique se déforme en circulant : titre frappant, graphique inventé, application universelle, et perte complète des conditions expérimentales d’origine — des étudiants américains, des tâches de laboratoire, une auto-évaluation par rang percentile.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le noyau utile résiste à la critique : l’auto-évaluation est un instrument peu fiable, et elle l’est d’autant plus qu’on est débutant. La conséquence pratique est de ne pas se fier à son sentiment de compétence mais à des retours extérieurs mesurables — un test, un résultat, une relecture par quelqu’un de plus compétent.',
        'Parce que ce dossier est aussi un excellent exercice de lecture critique. Un résultat célèbre, une interprétation plausible, un graphique inventé et une objection statistique solide : savoir démonter cet assemblage est directement transférable à la plupart des « études montrent que » qu’on rencontre.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_maslow: [
    {
      titre: 'L’article de 1943, et ce qu’il proposait',
      paragraphes: [
        'Abraham Maslow publie en 1943 « Une théorie de la motivation humaine », développée en 1954 dans "Motivation and Personality". Il y distingue cinq classes de besoins : physiologiques, de sécurité, d’appartenance et d’amour, d’estime, et de réalisation de soi. Sa thèse est qu’un besoin non satisfait domine la motivation, et que les besoins supérieurs se manifestent surtout lorsque les inférieurs sont raisonnablement couverts.',
        'Son projet était une réaction délibérée aux deux courants dominants de l’époque, la psychanalyse et le comportementalisme, qu’il jugeait construits sur la pathologie et sur l’animal. Il voulait étudier les gens qui vont bien, et fonder une psychologie de la santé plutôt que du trouble. C’est l’origine du courant humaniste.',
      ],
    },
    {
      titre: 'La pyramide n’est pas de lui',
      paragraphes: [
        'Maslow n’a jamais dessiné de pyramide. Aucun de ses écrits n’en contient. La représentation pyramidale apparaît dans la littérature de management au début des années 1960 et se diffuse à partir de là, jusqu’à devenir la seule forme sous laquelle sa théorie est connue.',
        'Ce n’est pas un détail graphique. La pyramide impose deux idées que Maslow ne soutenait pas : que les étages doivent être franchis dans l’ordre, et que la réalisation de soi est un sommet rare et étroit. Maslow écrivait au contraire que les besoins se chevauchent, qu’un même comportement peut en servir plusieurs, et qu’un besoin partiellement insatisfait n’empêche pas les autres d’agir. Il donnait lui-même des contre-exemples, dont celui de l’artiste qui sacrifie sa sécurité matérielle à sa création.',
      ],
    },
    {
      titre: 'Ce que les données disent',
      paragraphes: [
        'La théorie a été testée, et le verdict est nuancé mais net sur un point. Une revue de référence de Wahba et Bridwell, en 1976, conclut à une absence de soutien empirique pour la hiérarchie stricte, et à un soutien faible pour le découpage même en cinq classes.',
        'Le test le plus large est celui de Louis Tay et Ed Diener, publié en 2011 sur des données recueillies dans 123 pays. Leur résultat est intéressant parce qu’il valide une moitié de la thèse et réfute l’autre : les catégories de besoins identifiées par Maslow sont bien universelles et prédisent le bien-être partout, mais elles ne fonctionnent pas séquentiellement. On peut éprouver et satisfaire des besoins d’appartenance ou d’estime alors que la sécurité matérielle est précaire — ce que l’observation ordinaire dans les pays pauvres confirme largement.',
        'Maslow a lui-même ajouté tardivement un niveau au-delà de la réalisation de soi, la transcendance de soi — le dépassement de l’intérêt propre au profit d’une cause, d’une œuvre ou d’autrui. Ce sixième niveau n’apparaît presque jamais dans les versions popularisées, alors qu’il modifie le sens de l’ensemble : le sommet n’est plus l’épanouissement personnel, mais ce qui le dépasse. La pyramide à cinq étages fige donc une version que son auteur avait lui-même révisée.',
      ],
    },
    {
      titre: 'Le problème de méthode, à la source',
      paragraphes: [
        'La manière dont Maslow a identifié la réalisation de soi mérite d’être connue, car elle explique la fragilité du modèle. Il a constitué un échantillon de personnes qu’il jugeait accomplies — Lincoln, Jefferson, Einstein, Eleanor Roosevelt, quelques contemporains et étudiants — puis a dégagé leurs traits communs : autonomie de jugement, acceptation de soi, humour non hostile, capacité d’expériences intenses, centration sur un problème extérieur plutôt que sur soi.',
        'La difficulté est que le critère de sélection était son propre jugement sur ce qu’est une vie accomplie. Les traits trouvés décrivent donc, au moins en partie, son idéal ; le raisonnement tourne en cercle. L’échantillon était par ailleurs minuscule, occidental, très majoritairement masculin, et Maslow n’a pas publié de protocole reproductible. Il en était conscient et présentait ces travaux comme exploratoires — ce sont ses lecteurs qui les ont traités comme établis.',
        'Il faut lui reconnaître en revanche une postérité qu’il n’avait pas prévue. Son livre de 1965 sur le management, tiré du journal tenu pendant une immersion dans une entreprise californienne, a irrigué toute la littérature ultérieure sur la motivation au travail, la délégation et le sens de la tâche. Son influence pratique est considérable et largement indépendante de la validité de sa hiérarchie.',
      ],
    },
    {
      titre: 'Pourquoi le modèle a survécu à sa réfutation',
      paragraphes: [
        'Parce qu’il est simple, visuellement mémorable, et qu’il fournit un vocabulaire commode pour parler de motivation en entreprise ou en formation. Beaucoup de modèles managériaux tiennent par ces qualités plus que par leur validité, et il est utile de le savoir en tant que tel.',
        'Les cadres alternatifs mieux étayés existent et sont peu connus. La théorie de l’autodétermination de Deci et Ryan identifie trois besoins psychologiques fondamentaux — autonomie, compétence, affiliation — sans hiérarchie, avec un appui expérimental important, notamment sur la distinction entre motivation intrinsèque et extrinsèque et sur l’effet d’éviction produit par certaines récompenses. C’est le modèle à connaître si l’on veut un outil qui tient.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que ce cas montre comment une idée devient vraie par répétition. La pyramide figure dans d’innombrables manuels, formations et présentations, attribuée à un auteur qui ne l’a pas produite et sous une forme que les données contredisent. Savoir cela vaut mieux que de connaître les cinq étages.',
        'Parce que la partie solide reste utile : les besoins décrits sont réels et universels. Ce qu’il faut abandonner, c’est l’ordre — et l’abandonner change des décisions concrètes. Une équipe mal payée peut être profondément motivée par le sens de son travail ; un salaire élevé ne compense pas un défaut de reconnaissance. La lecture séquentielle conduit à l’inverse de ces deux conclusions.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_dopamine: [
    {
      titre: 'La molécule du plaisir : une erreur d’étiquette',
      paragraphes: [
        'La dopamine est présentée partout comme l’hormone du plaisir ou de la récompense. Les travaux des trente dernières années ont établi quelque chose de plus précis et de plus intéressant : elle code l’anticipation et l’effort, pas la satisfaction. Le plaisir proprement dit repose surtout sur d’autres systèmes, notamment les opioïdes et les endocannabinoïdes internes.',
        'La démonstration la plus claire vient des travaux de Kent Berridge et Terry Robinson, qui ont dissocié expérimentalement le « vouloir » du « aimer ». Un animal privé de dopamine dans les circuits concernés cesse de rechercher la nourriture mais manifeste toujours les réactions de plaisir quand on la lui place dans la bouche. Il aime encore, il ne veut plus. C’est exactement la dissociation que décrivent les personnes dépendantes à un stade avancé : une envie intense d’un produit qui ne procure plus de plaisir.',
      ],
    },
    {
      titre: 'Le signal d’erreur de prédiction',
      paragraphes: [
        'Dans les années 1990, Wolfram Schultz et ses collègues ont enregistré l’activité des neurones dopaminergiques de primates pendant un apprentissage. Le résultat est d’une élégance rare. Au début, une récompense inattendue déclenche une bouffée d’activité. Quand un signal annonce régulièrement la récompense, la bouffée se déplace sur le signal et disparaît au moment de la récompense elle-même. Et si la récompense annoncée n’arrive pas, l’activité chute en dessous de son niveau de base.',
        'Ces neurones ne signalent donc pas la récompense mais l’écart entre ce qui arrive et ce qui était attendu. C’est un signal d’apprentissage : il indique de combien il faut corriger la prédiction. Le fait remarquable est que cette grandeur correspond très précisément à celle utilisée par les algorithmes d’apprentissage par renforcement développés indépendamment en informatique. Deux disciplines ont trouvé la même solution au même problème.',
        'Une conséquence quotidienne en découle : ce qui est prévisible cesse d’exciter. Une augmentation de salaire, une nouvelle acquisition ou une réussite attendue produisent un effet qui s’éteint rapidement, non par ingratitude mais parce que le système ne réagit qu’aux écarts.',
      ],
    },
    {
      titre: 'Quatre circuits, quatre pathologies',
      paragraphes: [
        'La dopamine ne fait pas qu’une chose, parce qu’elle circule dans des voies distinctes. La voie nigro-striée commande le mouvement : sa dégénérescence est la maladie de Parkinson, traitée par un précurseur de la dopamine, la L-dopa. La voie mésolimbique porte la motivation et l’apprentissage par renforcement, et elle est la cible de toutes les substances addictives. La voie méso-corticale intervient dans la mémoire de travail et l’attention. Une quatrième régule la sécrétion de prolactine.',
        'Cette séparation explique les effets secondaires des médicaments : un antipsychotique qui bloque les récepteurs dopaminergiques pour réduire des hallucinations peut produire des troubles moteurs et hormonaux, parce qu’il n’atteint pas seulement le circuit visé. Inversement, les traitements dopaminergiques de Parkinson provoquent parfois des comportements compulsifs — jeu, achats — chez des patients qui n’en avaient aucun.',
      ],
    },
    {
      titre: 'Pourquoi les applications sont conçues comme des machines à sous',
      paragraphes: [
        'Le renforcement le plus puissant n’est pas la récompense systématique mais la récompense à intervalle variable : une réponse renforcée de manière imprévisible produit un comportement beaucoup plus persistant qu’une réponse toujours récompensée. Ce résultat, établi par les travaux sur le conditionnement, est la raison d’être de la machine à sous.',
        'Il est aujourd’hui la structure de base du fil d’actualité : on fait défiler sans savoir si la prochaine unité de contenu sera intéressante, et c’est précisément cette incertitude qui maintient le geste. La notification, le nombre de mentions, le rafraîchissement par glissement vers le bas reproduisent le même schéma. Cela ne suppose aucune intention malveillante : c’est le résultat de l’optimisation du temps passé, qui converge naturellement vers ce dispositif.',
        'En revanche, la mode du « jeûne dopaminergique » repose sur une confusion. On ne peut pas vider ni reposer un système de neurotransmission indispensable au mouvement et à la motivation, et les périodes d’abstinence de comportement compulsif agissent sur la sensibilisation des circuits aux signaux associés, non sur un « stock » de dopamine. La pratique peut être utile ; son explication est fausse.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que comprendre que le système code l’anticipation, pas la satisfaction, désamorce une illusion coûteuse : celle qui fait croire que le prochain achat, la prochaine étape, la prochaine validation produiront un contentement durable. L’intensité ressentie avant est une prédiction, et les prédictions sont systématiquement trop optimistes sur la durée de l’effet.',
        'Parce que cela déplace aussi la stratégie face aux habitudes qu’on veut changer. Puisque ce sont les signaux annonciateurs qui déclenchent le désir, agir sur l’environnement — retirer le signal — est plus efficace que résister au désir une fois qu’il est déclenché. C’est le résultat le mieux établi de la littérature sur les habitudes, et il est mécaniquement lié à ce qui précède.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_stanford_milgram: [
    {
      titre: 'Deux expériences devenues des fables',
      paragraphes: [
        'L’expérience de Milgram sur l’obéissance et celle de Stanford sur la prison sont probablement les deux études de psychologie les plus citées hors de la discipline. Elles servent de preuve à une thèse forte : des gens ordinaires commettent des actes cruels dès que la situation les y pousse.',
        'Les deux ont fait l’objet, dans les quinze dernières années, de réexamens d’archives qui ont sérieusement révisé ce qu’on peut en tirer. La thèse générale sur le poids des situations n’est pas morte — elle est soutenue par d’autres travaux —, mais ces deux études la soutiennent beaucoup moins bien qu’on ne le croit. C’est un cas où connaître le détail change la conclusion.',
      ],
    },
    {
      titre: 'Milgram : ce qui a été mesuré',
      paragraphes: [
        'De 1961 à 1962, à Yale, Stanley Milgram demande à des volontaires de jouer le rôle d’« enseignant » et d’administrer à un « élève » des chocs électriques croissants à chaque erreur. L’élève est un comédien, les chocs sont fictifs, et un expérimentateur en blouse enjoint de continuer. Dans la condition la plus rapportée, environ 65 % des participants vont jusqu’à la tension maximale de 450 volts.',
        'Ce chiffre unique masque l’essentiel. Milgram a mené une vingtaine de variantes, et les taux d’obéissance varient énormément : ils s’effondrent quand l’expérimentateur donne ses ordres par téléphone, quand l’expérience se déroule hors de l’université, quand la victime est dans la même pièce, ou quand un autre participant refuse le premier. C’est ce tableau de variations, et non le taux de 65 %, qui constitue le résultat scientifique.',
        'Le réexamen des archives par Gina Perry a mis au jour des problèmes de procédure : l’expérimentateur sortait fréquemment du protocole pour insister bien au-delà des quatre relances prévues, certains participants ont été maltraités et débriefés tardivement ou pas du tout, et surtout une fraction non négligeable d’entre eux a déclaré avoir douté de la réalité des chocs. Or ceux qui doutaient obéissaient davantage, ce qui affaiblit directement l’interprétation.',
      ],
    },
    {
      titre: 'Stanford : une étude qui ne tient pas',
      paragraphes: [
        'En août 1971, Philip Zimbardo répartit des étudiants volontaires en « gardiens » et « prisonniers » dans un sous-sol aménagé de l’université Stanford. L’expérience, prévue pour deux semaines, est interrompue au bout de six jours devant la brutalité des gardiens. Le récit diffusé est que des étudiants ordinaires sont devenus cruels par le seul effet du rôle.',
        'Les archives, exploitées notamment par Thibault Le Texier à partir de 2018, montrent autre chose. Les gardiens n’ont pas été laissés à eux-mêmes : ils ont reçu des consignes explicites d’humiliation lors d’une réunion préalable, et étaient rappelés à l’ordre quand ils n’étaient pas assez durs. Zimbardo n’était pas un observateur mais le directeur de la prison, partie prenante de l’action. Plusieurs participants ont expliqué qu’ils jouaient un rôle attendu ; l’un des épisodes présentés comme une crise de détresse a été décrit par l’intéressé comme une simulation destinée à sortir de l’étude. Aucune donnée systématique n’a été recueillie, et il n’y avait ni condition de contrôle ni hypothèse testable.',
        'La contre-épreuve la plus éclairante est l’étude carcérale conduite en 2002 par Alexander Haslam et Stephen Reicher avec la BBC. Sans consignes orientées, les résultats ont été très différents : les gardiens n’ont pas basculé dans la tyrannie, les groupes se sont organisés, et ce sont les dynamiques d’identité collective — le fait de se reconnaître ou non dans un groupe et dans son projet — qui ont déterminé les comportements.',
      ],
    },
    {
      titre: 'Ce qui reste, et qui est solide',
      paragraphes: [
        'Le pouvoir des situations sur le comportement est bien établi, par un ensemble d’autres travaux plus robustes : effets de conformité au groupe, diffusion de la responsabilité, obéissance aux hiérarchies légitimes, glissement progressif des normes. La leçon n’est pas fausse ; ce sont ses deux preuves vedettes qui sont fragiles.',
        'La lecture contemporaine est en outre différente et mieux étayée. Ce n’est pas que les gens obéissent aveuglément, c’est qu’ils adhèrent : ils commettent des actes graves quand ils s’identifient à un projet présenté comme légitime et qu’ils se persuadent d’y contribuer utilement. Cette lecture — dite du « suivisme engagé » — explique mieux les variations observées chez Milgram que l’idée d’une soumission passive, et elle rejoint les travaux historiques sur les exécutants des crimes de masse.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la version populaire est déresponsabilisante : si n’importe qui devient bourreau par la seule force du contexte, personne n’est vraiment coupable. La version étayée est plus exigeante : on n’obéit pas par automatisme, on se convainc, et cette conviction se construit par étapes qu’il est possible d’identifier et d’interrompre.',
        'Parce que ces deux dossiers illustrent enfin la différence entre une histoire mémorable et une preuve. Ces expériences sont enseignées depuis cinquante ans, reprises dans des films et des manuels, et leur solidité méthodologique n’a été examinée sérieusement que bien plus tard. C’est un rappel utile sur la manière dont une discipline se corrige — lentement, et sous la pression d’archives.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_carl_jung: [
    {
      titre: 'Le dauphin de Freud, et la rupture',
      paragraphes: [
        'Carl Gustav Jung (1875-1961), psychiatre suisse, est d’abord le collaborateur le plus prometteur de Freud, qui voit en lui son successeur. La rupture, consommée en 1913, porte sur deux points : Jung refuse de réduire l’énergie psychique à la sexualité, et il attribue à l’inconscient une dimension collective et créatrice que Freud n’admet pas.',
        'Les années qui suivent sont pour lui une période de crise psychique intense, qu’il traverse en consignant ses visions et ses dialogues intérieurs dans un manuscrit calligraphié et illustré, le "Livre rouge", tenu de 1913 à 1930 environ et publié seulement en 2009. Toute son œuvre ultérieure en découle, ce qui est un point important pour juger de son statut : c’est une élaboration à partir d’une expérience personnelle, non une théorie construite sur des données recueillies.',
      ],
    },
    {
      titre: 'Les concepts et ce qu’ils désignent',
      paragraphes: [
        'L’inconscient collectif est la couche de l’inconscient qui ne provient pas de la biographie individuelle mais d’une structure commune à l’espèce, comparable à un héritage. Ce qu’elle contient, ce ne sont pas des images mais des dispositions à former certaines images : les archétypes.',
        'Les archétypes les plus travaillés par Jung sont peu nombreux. La Persona est le masque social, l’ensemble des rôles par lesquels on se présente. L’Ombre rassemble ce qu’on refuse de reconnaître en soi et qu’on projette volontiers sur les autres — Jung soutenait que l’intégrer, c’est-à-dire l’admettre sans y céder, est la condition de toute maturité psychique. L’Anima et l’Animus désignent la part féminine chez l’homme et masculine chez la femme, formulation datée dont on peut retenir l’idée d’une intégration des dispositions refoulées par le rôle de genre. Le Soi est la totalité intégrée, terme et non point de départ.',
        'L’individuation nomme ce processus : devenir ce qu’on est en particulier, en intégrant les parties écartées, plutôt qu’en s’identifiant à sa Persona. C’est un processus de la seconde moitié de la vie, selon lui, et c’est l’une de ses contributions les plus reprises en psychothérapie.',
      ],
    },
    {
      titre: 'Les types psychologiques, et le test qui n’en découle pas vraiment',
      paragraphes: [
        'Jung publie en 1921 "Types psychologiques", où il distingue deux attitudes — introversion et extraversion — et quatre fonctions : penser, sentir, sensation, intuition. Son propos était typologique et souple ; il insistait sur le fait que personne n’est d’un type pur.',
        'Dans les années 1940, Katharine Briggs et sa fille Isabel Myers en tirent un questionnaire à seize profils, qui devient l’outil de personnalité le plus vendu au monde. Ses propriétés psychométriques sont pourtant faibles : la stabilité des résultats dans le temps est médiocre — une part importante des personnes changent de type en quelques semaines —, et surtout les traits mesurés se distribuent de façon continue et non bimodale, ce qui prive de fondement le découpage en catégories opposées. Le modèle empirique qui tient, en psychologie de la personnalité, est celui des cinq grands facteurs, obtenu par analyse statistique et prédictif de résultats réels.',
        'Il est utile de noter que Jung n’est pas responsable du questionnaire, et qu’il aurait probablement contesté le principe de classer les gens en cases fixes à partir d’un formulaire.',
      ],
    },
    {
      titre: 'Le statut scientifique, sans indulgence ni mépris',
      paragraphes: [
        'La majeure partie de l’édifice jungien n’est pas falsifiable au sens expérimental : on ne conçoit pas d’épreuve qui pourrait établir l’inexistence de l’inconscient collectif. Sa notion de synchronicité — coïncidences porteuses de sens — est particulièrement problématique, puisqu’elle propose une explication non causale à un phénomène que l’étude des probabilités explique sans reste.',
        'Cela ne rend pas son œuvre inutile, à condition de savoir de quel ordre elle relève. Elle est féconde comme herméneutique : une grille pour interpréter des récits, des mythes, des rêves, des œuvres. Son influence culturelle est immense — le « voyage du héros » de Joseph Campbell, qui structure une grande partie de la narration cinématographique contemporaine, en descend directement. Et plusieurs de ses intuitions cliniques, notamment sur la seconde moitié de la vie et sur l’intégration des parts refusées, ont été reprises par des courants thérapeutiques qui, eux, sont évalués.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que le concept d’Ombre est un outil d’une efficacité pratique remarquable, indépendamment de la théorie qui le porte. Ce qui nous irrite le plus violemment chez autrui désigne souvent une disposition que nous nous interdisons. Prendre l’habitude de retourner la question — qu’est-ce que cette réaction dit de moi — produit des résultats que peu d’autres grilles fournissent aussi vite.',
        'Parce que ce dossier apprend enfin à distinguer deux valeurs qu’on confond : une pensée peut être puissante comme instrument d’interprétation et faible comme théorie scientifique. Confondre les deux conduit soit à rejeter Jung en bloc, soit à lui prêter une autorité qu’il n’a pas. La bonne posture est de savoir laquelle des deux on utilise.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_frankl: [
    {
      titre: 'Un psychiatre déporté',
      paragraphes: [
        'Viktor Frankl (1905-1997), neurologue et psychiatre viennois, avait élaboré avant la guerre l’essentiel de sa théorie sur le rôle du sens dans la santé psychique. Déporté en 1942, il passe trois ans dans les camps, dont Theresienstadt et, brièvement, Auschwitz. Sa femme, ses parents et son frère y meurent ; il est le seul survivant de sa famille proche avec une sœur émigrée.',
        'Il écrit à sa libération, en 1946, le livre qui l’a rendu célèbre — publié en français sous le titre "Découvrir un sens à sa vie" — en quelques semaines. Le livre comprend deux parties : le récit de l’expérience concentrationnaire lue en psychiatre, et l’exposé de sa méthode, la logothérapie.',
        'Deux précisions de rigueur. D’abord, son témoignage est celui d’un survivant parmi des millions de victimes, et il ne prétend pas expliquer qui a survécu : les déterminants de la survie dans les camps furent avant tout le hasard, la date d’arrivée, l’affectation, la brutalité arbitraire. Frankl le dit lui-même, et l’oublier transformerait son propos en une injure aux morts. Ensuite, certains aspects de sa biographie et de la genèse du livre ont été discutés par des historiens, sans que cela remette en cause le fond de son apport clinique.',
      ],
    },
    {
      titre: 'La thèse : la volonté de sens',
      paragraphes: [
        'Frankl se présente comme le fondateur de la « troisième école viennoise de psychothérapie ». La première, celle de Freud, place au centre la recherche du plaisir ; la deuxième, celle d’Adler, la recherche de la puissance. Frankl y ajoute une motivation qu’il tient pour plus fondamentale : la volonté de sens, le besoin de trouver à son existence une signification.',
        'La conséquence clinique est qu’il existe des souffrances qui ne sont pas des maladies. Il appelle « vide existentiel » l’état de quelqu’un qui a tout ce qu’il faut et ne voit pas à quoi bon, et « névrose noogène » la détresse née d’un conflit de valeurs plutôt que d’un trouble psychique. Les traiter comme une pathologie à corriger serait une erreur de diagnostic.',
        'Il cite volontiers Nietzsche : qui a un pourquoi peut supporter presque n’importe quel comment. La formulation résume sa thèse centrale — la souffrance devient supportable quand elle est reliée à une signification, et insupportable quand elle est purement gratuite.',
      ],
    },
    {
      titre: 'Les trois voies, et la liberté qui reste',
      paragraphes: [
        'Frankl soutient qu’on ne trouve pas le sens de la vie en général, mais le sens d’une situation particulière, et par trois voies. La première est l’œuvre : créer, accomplir, produire quelque chose. La deuxième est l’expérience : rencontrer quelqu’un, aimer, être saisi par une beauté. La troisième, celle qui l’a rendu célèbre, est l’attitude adoptée devant une souffrance inévitable.',
        'Ce dernier point est sa proposition la plus forte et la plus exigeante. Quand une situation ne peut être changée — un deuil, une maladie incurable, une injustice consommée —, il reste un espace de liberté : la manière dont on s’y tient. C’est ce qu’il appelle parfois la « liberté dernière ». Il insiste pour qu’on ne la confonde pas avec une valorisation de la souffrance : chercher la souffrance serait masochiste, et la souffrance évitable doit être évitée.',
        'Il en tire une posture qu’il nomme « optimisme tragique » : dire oui à la vie en connaissant la mort, la douleur et la faute, sans les nier ni s’y résigner. C’est une position proche, par sa structure, de la révolte de Camus.',
      ],
    },
    {
      titre: 'La logothérapie en pratique',
      paragraphes: [
        'La technique la plus connue est l’intention paradoxale : demander au patient de souhaiter précisément ce qu’il craint. Quelqu’un qui redoute de transpirer en public s’efforce de transpirer le plus possible ; l’insomniaque s’applique à rester éveillé. Le mécanisme est que l’anxiété d’anticipation entretient le symptôme, et que le paradoxe rompt le cercle. Cette technique a été reprise et validée par les thérapies comportementales, où elle porte d’autres noms.',
        'La seconde est la « dé-réflexion » : détourner l’attention du symptôme vers une tâche extérieure, notamment pour les troubles où l’hyper-observation de soi aggrave le problème. La troisième est la clarification des valeurs par le dialogue, dont on retrouve la trace directe dans la thérapie d’acceptation et d’engagement, aujourd’hui empiriquement soutenue.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce que la question du sens est traitée ici comme un sujet clinique et non comme une question de salon. C’est un apport durable : les échelles de mesure du sens de la vie prédisent aujourd’hui de manière robuste le bien-être, la résistance au stress et plusieurs indicateurs de santé, ce qui donne à l’intuition de Frankl un appui qu’il n’avait pas.',
        'Parce que sa proposition renverse la question habituelle. Il n’invite pas à demander ce que la vie peut nous apporter, mais à considérer que la situation présente pose une question à laquelle il s’agit de répondre par une action. Ce renversement est immédiatement praticable, et il vaut particulièrement dans les circonstances qu’on ne choisit pas.',
      ],
    },
  ],

  /* ═════════════════════════════════════════════════════════════════════ */
  psy_theorie_jeux: [
    {
      titre: 'Une science des interactions stratégiques',
      paragraphes: [
        'La théorie des jeux étudie les situations où le résultat de ma décision dépend de la décision d’autrui, et réciproquement. C’est une différence de nature avec les problèmes d’optimisation ordinaires : on ne cherche pas le meilleur choix dans un environnement fixe, mais le meilleur choix face à quelqu’un qui fait le même calcul en tenant compte du mien.',
        'L’acte fondateur est le livre de John von Neumann et Oskar Morgenstern, "Theory of Games and Economic Behavior", publié en 1944. La notion qui a rendu la théorie applicable à presque tout est celle de John Nash, formulée en 1950-1951 : un équilibre est une configuration où aucun joueur ne gagnerait à changer unilatéralement de stratégie, les autres gardant la leur. Nash a démontré qu’un tel équilibre existe toujours, sous des conditions très générales. Il reçoit le prix Nobel d’économie en 1994.',
      ],
    },
    {
      titre: 'Le dilemme du prisonnier',
      paragraphes: [
        'Formalisé en 1950 par Merrill Flood et Melvin Dresher à la RAND, il tire son nom de l’histoire dont Albert Tucker l’a habillé. Deux complices arrêtés séparément ont le choix entre se taire et dénoncer l’autre. Si les deux se taisent, chacun prend une peine légère. Si un seul dénonce, il sort libre et l’autre prend le maximum. Si les deux dénoncent, chacun prend une peine lourde.',
        'Le raisonnement est implacable : quoi que fasse l’autre, dénoncer est individuellement meilleur. Les deux dénoncent donc, et obtiennent tous deux un résultat pire que s’ils s’étaient tus. L’équilibre de Nash est ici collectivement mauvais — c’est le point qui a fait la fortune du modèle, parce qu’il montre qu’un désastre collectif peut résulter de décisions parfaitement rationnelles, sans bêtise ni méchanceté d’aucun acteur.',
        'On reconnaît cette structure dans la course aux armements, la surpêche, le dopage sportif, les émissions de gaz à effet de serre, la publicité, l’évasion fiscale. Toutes ces situations ont en commun que le comportement coopératif est collectivement supérieur et individuellement dominé.',
      ],
    },
    {
      titre: 'Ce qui change quand le jeu se répète',
      paragraphes: [
        'La conclusion pessimiste ne survit pas à la répétition. Si les mêmes joueurs se retrouvent indéfiniment et savent qu’ils se retrouveront, la coopération devient rationnelle : trahir aujourd’hui coûte les gains de toutes les parties suivantes.',
        'Robert Axelrod l’a démontré expérimentalement en 1980 en organisant un tournoi de programmes informatiques jouant au dilemme répété. La stratégie gagnante, soumise par Anatol Rapoport, était la plus simple de toutes : coopérer au premier tour, puis faire ce que l’adversaire a fait au tour précédent. Axelrod en a tiré quatre propriétés des stratégies performantes : être gentille — ne jamais trahir la première ; être réactive — riposter immédiatement ; être indulgente — reprendre la coopération dès que l’autre la reprend ; et être lisible — se laisser comprendre, car une stratégie imprévisible ne peut pas être suivie.',
        'La leçon est d’une portée pratique considérable : ce qui rend la coopération possible, c’est l’ombre de l’avenir. D’où l’importance des relations durables, des réputations, des contrats et des institutions — tous des dispositifs qui transforment une interaction unique en interaction répétée.',
      ],
    },
    {
      titre: 'Les autres modèles à connaître',
      paragraphes: [
        'La chasse au cerf décrit les problèmes de coordination : deux chasseurs gagnent davantage en s’associant pour un cerf, mais chacun peut préférer le lièvre sûr si l’autre risque de faire défaut. Le résultat dépend entièrement de ce que chacun croit que l’autre va faire, ce qui donne toute son importance à la confiance et aux signaux. Thomas Schelling, prix Nobel 2005, a développé la notion de point focal : une solution s’impose parce qu’elle est évidente pour tous, indépendamment de sa supériorité intrinsèque.',
        'Le jeu de la poule mouillée modélise les affrontements où reculer est coûteux mais la collision catastrophique — crises diplomatiques, grèves, guerres commerciales. Il a une propriété perverse : s’engager de manière irréversible peut être avantageux, ce qui explique les stratégies fondées sur des ultimatums publics et sur l’impossibilité affichée de céder.',
        'Enfin, la théorie des mécanismes renverse la question : au lieu d’analyser un jeu donné, elle conçoit des règles produisant le résultat souhaité. Elle a été récompensée en 2007 puis, pour les enchères, en 2020. Ses applications sont très concrètes : enchères de fréquences radio, attribution des internats médicaux, et surtout appariement des donneurs de rein, qui sauve des vies grâce à un algorithme d’échange en chaîne.',
      ],
    },
    {
      titre: 'Les limites',
      paragraphes: [
        'Les modèles supposent des joueurs qui calculent, connaissent les règles et savent que les autres calculent aussi. L’économie expérimentale a montré que les humains s’en écartent systématiquement : ils coopèrent plus que prédit dans des jeux uniques, punissent les comportements injustes à leurs propres frais, et se soucient de l’équité du partage et non seulement de leur gain — le jeu de l’ultimatum en est la démonstration la plus nette.',
        'Ces écarts ne ruinent pas la théorie ; ils précisent son usage. Elle décrit très bien les incitations en présence, ce qui est déjà l’essentiel pour analyser une situation. Elle prédit moins bien le comportement réel, qu’il faut mesurer.',
      ],
    },
    {
      titre: 'Pourquoi ça compte',
      paragraphes: [
        'Parce qu’elle fournit la question à poser devant n’importe quel blocage collectif : quelles sont les incitations de chacun, et quel résultat produisent-elles si chacun les suit ? Beaucoup de situations qu’on attribue à la mauvaise volonté sont en réalité des équilibres, et se traitent en changeant les règles plutôt qu’en exigeant de la vertu.',
        'Parce que les quatre règles tirées du tournoi d’Axelrod constituent l’un des rares conseils de conduite dérivés d’un résultat formel : ne pas trahir le premier, réagir immédiatement, pardonner vite, rester lisible. Elles s’appliquent aussi bien à une négociation commerciale qu’à une relation de travail durable.',
      ],
    },
  ],
};
