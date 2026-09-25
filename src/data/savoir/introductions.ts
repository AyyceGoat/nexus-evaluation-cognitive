/**
 * Phrases d'introduction de la lecture à voix haute.
 *
 * ── Pourquoi elles sont écrites à la main ──
 *
 * Une introduction fabriquée par gabarit — « Voici l'article intitulé untel,
 * six minutes de lecture » — s'entend comme un gabarit dès le deuxième article.
 * Or c'est la première phrase qui décide si on écoute la suite.
 *
 * Chacune suit donc la même contrainte et aucun modèle : annoncer le sujet, et
 * donner dans la même respiration une raison d'écouter — un chiffre qui
 * surprend, une idée reçue à défaire, une conséquence inattendue. Puis se
 * taire, et laisser l'article commencer.
 *
 * ── Ce qu'elles ne font pas ──
 *
 * Elles ne résument pas. Le résumé existe déjà, à l'écran, et sert à décider si
 * on lit. Ici la décision est prise : quelqu'un a appuyé sur « écouter ».
 * Répéter le résumé lui ferait entendre deux fois la même chose avant d'entrer
 * dans le sujet.
 *
 * ── Sur la répétition de « Voici » ──
 *
 * Les trois premières, validées à l'oreille, ouvraient sur « Voici ». La
 * tournure est retenue pour la majorité parce qu'elle fait exactement ce qu'on
 * attend d'une entrée en matière : elle pose et elle avance. Mais pas pour
 * toutes, et c'est délibéré : cinquante articles ouvrant sur le même mot
 * produiraient précisément l'effet de gabarit qu'on cherche à éviter — sauf
 * qu'il serait au niveau de la collection au lieu de la phrase.
 *
 * `scripts/genere-audio.mjs` refuse de générer un article dont l'introduction
 * manque, plutôt que d'en inventer une.
 */
export const INTRODUCTIONS: Record<string, string> = {
  /* ── Histoire & géopolitique ──────────────────────────────────────── */

  hist_chute_rome:
    'Voici l’histoire de la chute de l’Empire romain. Elle tient dans une date que tout ' +
    'le monde connaît, 476, et cette date est une convention que personne n’a vécue.',

  hist_guerre_froide:
    'Voici quarante-quatre ans d’affrontement entre deux puissances qui ne se sont jamais ' +
    'battues directement. Le mot « froide » ne vaut que pour l’Europe : en Corée, au ' +
    'Vietnam, en Angola, elle fut parfaitement chaude.',

  hist_guerre_coree:
    'Voici une guerre qui n’est toujours pas terminée. L’armistice de 1953 n’a jamais été ' +
    'suivi d’un traité de paix, et la frontière qui coupe la Corée en deux a été tracée en ' +
    'quelques jours par deux officiers penchés sur une carte.',

  hist_projet_manhattan:
    'Voici comment cent trente mille personnes ont construit une arme dont la quasi-totalité ' +
    'd’entre elles ignorait la nature. Et quand elle fut prête, l’Allemagne qui avait motivé ' +
    'le projet avait déjà capitulé.',

  hist_routes_soie:
    'Voici l’histoire d’une route qui n’a jamais existé. Ni une route, ni la soie pour ' +
    'marchandise principale, ni même ce nom-là : il a été inventé par un géographe allemand ' +
    'en 1877, et presque personne n’a jamais fait le trajet en entier.',

  hist_effondrement_urss:
    'Voici comment un État doté de la deuxième armée du monde et de trente mille armes ' +
    'nucléaires a disparu en moins de sept ans, sans invasion, sans défaite militaire, sans ' +
    'insurrection générale. Presque personne ne l’avait vu venir.',

  hist_colonisation:
    'Voici cinq siècles au terme desquels une poignée de pays européens contrôlaient la ' +
    'quasi-totalité des terres émergées. Les frontières tracées alors sont, pour l’essentiel, ' +
    'celles d’aujourd’hui.',

  hist_plan_marshall:
    'Treize milliards de dollars dont les historiens se disputent encore l’efficacité. ' +
    'L’originalité du plan Marshall n’était pas l’argent : c’était l’obligation faite aux ' +
    'Européens de décider ensemble comment le dépenser.',

  hist_revolution_industrielle:
    'Voici le moment où l’enrichissement a cessé d’être exceptionnel pour devenir continu. ' +
    'Pendant des millénaires, le revenu par habitant n’avait presque pas bougé. En deux ' +
    'siècles, tout ce qui fait une vie moderne est apparu.',

  hist_crise_1929:
    'Le krach n’est pas la crise, et c’est tout le sujet. La Bourse s’effondre en octobre ' +
    '1929, mais la véritable descente dure trois ans, emporte neuf mille banques, et il ' +
    'faudra vingt-cinq ans pour retrouver les cours d’avant.',

  /* ── Économie & argent ─────────────────────────────────────────────── */

  econ_banques_centrales:
    'Voici les institutions qui décident du prix de l’argent, et pourquoi on a délibérément ' +
    'confié ce pouvoir à des gens que personne n’élit. La réponse tient dans une tentation à ' +
    'laquelle les élus ont montré qu’ils cédaient.',

  econ_dollar_mondial:
    'Voici pourquoi la politique monétaire américaine est, de fait, celle du monde entier. ' +
    'Quand la Réserve fédérale relève ses taux, les monnaies des pays émergents plongent, ' +
    'sans qu’aucun d’eux ait voté pour ce resserrement.',

  econ_bitcoin:
    'Voici une invention de neuf pages, publiée en pleine crise financière par quelqu’un dont ' +
    'on ignore encore l’identité. Elle résout un problème que personne n’avait su résoudre, et ' +
    'échoue sur celui qu’elle prétendait traiter.',

  econ_etf:
    'Voici l’idée la plus rentable de la finance, et elle consiste à renoncer à choisir. Sur ' +
    'dix à quinze ans, la grande majorité des gérants professionnels font moins bien qu’un ' +
    'fonds qui achète tout le marché sans réfléchir.',

  econ_bretton_woods:
    'Trois semaines de juillet 1944 ont organisé l’économie mondiale pour les trente années ' +
    'suivantes. Le système portait en lui sa propre contradiction, et un économiste belge l’a ' +
    'démontrée seize ans avant qu’il ne cède.',

  econ_creation_monetaire:
    'Voici d’où vient réellement l’argent, et ce n’est pas d’où vous croyez. Les banques ne ' +
    'prêtent pas l’épargne de leurs déposants : elles créent la monnaie au moment où elles ' +
    'accordent le crédit.',

  econ_interet_compose:
    'Voici le seul mécanisme financier dont la maîtrise est à la portée de tous et dont ' +
    'l’effet est considérable. Il n’exige ni information privilégiée ni talent particulier : ' +
    'seulement de commencer tôt, et de ne pas interrompre.',

  econ_private_equity:
    'Voici comment on achète une entreprise avec l’argent de l’entreprise elle-même. Le ' +
    'procédé triple parfois la mise en quelques années, et il a coûté son emploi à des ' +
    'dizaines de milliers de salariés.',

  econ_bulles_speculatives:
    'Cinq bulles, quatre siècles, et la même séquence à chaque fois. Ce qui rend une bulle ' +
    'dangereuse n’est pas l’ampleur de la hausse : c’est la quantité de dette bancaire ' +
    'adossée à cette hausse.',

  econ_subprimes:
    'Voici comment des prêts immobiliers accordés à des ménages américains ont fait ' +
    'tomber l’économie mondiale. Tout part d’une idée qui paraissait raisonnable : ne pas ' +
    'garder le risque qu’on a créé.',

  /* ── Science & technologie ─────────────────────────────────────────── */

  sci_relativite:
    'Voici deux théories qui expliquaient parfaitement le monde et se contredisaient. Pour ' +
    'les réconcilier, il a fallu renoncer à l’idée que le temps s’écoule de la même façon ' +
    'pour tout le monde.',

  sci_mecanique_quantique:
    'Voici la théorie la mieux vérifiée de l’histoire des sciences, et personne ne s’accorde ' +
    'sur ce qu’elle dit du monde. Elle fait fonctionner votre téléphone, et son ' +
    'interprétation reste en débat depuis un siècle.',

  sci_intelligence_artificielle:
    'Soixante-dix ans d’échecs, puis quinze ans de bascule. Ce qui manquait n’était pas les ' +
    'idées, posées dès 1986, mais les données et la puissance de calcul pour les faire ' +
    'tourner.',

  sci_batteries_lithium:
    'Voici ce qui décide si un réseau électrique peut se passer du charbon. Le problème de la ' +
    'transition énergétique n’est pas de produire de l’électricité propre : c’est de l’avoir ' +
    'au moment où on la consomme.',

  sci_internet:
    'Voici pourquoi vos communications intercontinentales ne passent pas par satellite. Plus ' +
    'de quatre-vingt-quinze pour cent du trafic mondial circule dans des câbles posés au fond ' +
    'des océans, épais comme un tuyau d’arrosage.',

  sci_crispr:
    'Voici un système immunitaire de bactérie devenu, en quelques années, un outil qui ' +
    'réécrit l’ADN humain. La première thérapie autorisée guérit une maladie du sang, et ' +
    'coûte deux millions de dollars par patient.',

  sci_neurosciences:
    'Quatre-vingt-six milliards de neurones qui consomment vingt watts, soit moins qu’une ' +
    'ampoule. Et voici ce que l’imagerie cérébrale montre réellement, qui est beaucoup moins ' +
    'que ce qu’on lui fait dire.',

  sci_evolution:
    'Voici un mécanisme qui tient en trois conditions et rend compte de toute la diversité du ' +
    'vivant. Il ne produit pas le meilleur, seulement le viable, et on peut l’observer à ' +
    'l’œuvre en quelques mois.',

  sci_sommeil:
    'Voici le levier de performance le plus puissant qui existe, et il est gratuit. Le plus ' +
    'inquiétant dans la privation de sommeil est qu’elle dégrade le jugement sans qu’on s’en ' +
    'aperçoive.',

  sci_conquete_spatiale:
    'Une équation de 1903 gouverne encore chaque décollage. Douze hommes ont marché sur la ' +
    'Lune avant 1973, et personne n’y est retourné depuis — pour des raisons qui ne sont pas ' +
    'techniques.',

  /* ── Psychologie & philosophie ─────────────────────────────────────── */

  phil_stoicisme:
    'Voici une philosophie écrite par un esclave, un ministre et un empereur, qui disaient la ' +
    'même chose. Ses exercices sont repris aujourd’hui par la thérapie cognitive, et ils ' +
    'passent encore les essais cliniques.',

  phil_absurde_camus:
    'Voici la seule question philosophique que Camus jugeait sérieuse : faut-il continuer à ' +
    'vivre. Sa réponse ne promet rien et ne console de rien, et c’est précisément ce qui la ' +
    'rend solide.',

  psy_biais_cognitifs:
    'Voici pourquoi vos erreurs de jugement ne sont pas aléatoires mais prévisibles. Et voici ' +
    'la mauvaise nouvelle établie depuis : connaître un biais ne suffit presque jamais à s’en ' +
    'protéger.',

  psy_dunning_kruger:
    'Voici l’effet le plus cité et le plus mal raconté de la psychologie. Le fameux graphique, ' +
    'avec son pic et sa vallée, ne figure pas dans l’étude de 1999, et l’objection statistique ' +
    'qu’on lui adresse est sérieuse.',

  psy_maslow:
    'Voici une pyramide que Maslow n’a jamais dessinée, dont l’ordre n’est pas soutenu par les ' +
    'données, et qui figure pourtant dans tous les manuels de management. Ce qui en reste vrai ' +
    'mérite quand même d’être connu.',

  psy_dopamine:
    'Voici l’histoire de la dopamine, et elle commence par une correction. Ce n’est pas ' +
    'la molécule du plaisir : elle ne mesure pas ce que vous obtenez, mais l’écart entre ' +
    'ce que vous obtenez et ce que vous attendiez.',

  psy_stanford_milgram:
    'Voici les deux expériences les plus citées de la psychologie, et ce que leurs archives ' +
    'ont révélé quarante ans plus tard. Les gardiens de Stanford n’ont pas glissé vers la ' +
    'cruauté : on leur avait dit quoi faire.',

  psy_carl_jung:
    'Voici une œuvre née d’une crise psychique que son auteur a traversée en consignant ses ' +
    'visions. Elle a donné naissance au test de personnalité le plus vendu au monde, dont les ' +
    'propriétés statistiques sont mauvaises.',

  psy_frankl:
    'Voici un psychiatre qui avait élaboré sa théorie sur le sens de la vie avant d’être ' +
    'déporté, et qui l’a retrouvée intacte en revenant. Sa proposition renverse la question ' +
    'que l’on se pose d’habitude.',

  psy_theorie_jeux:
    'Voici comment un désastre collectif peut résulter de décisions parfaitement ' +
    'rationnelles, sans bêtise ni méchanceté de personne. Et voici ce qui change tout : ' +
    'savoir qu’on se reverra.',

  /* ── Figures légendaires ───────────────────────────────────────────── */

  fig_leonard_de_vinci:
    'Six mille pages de notes qui n’ont servi à personne. Léonard avait compris le ' +
    'fonctionnement des valves du cœur trois siècles avant les autres, et il n’a rien publié : ' +
    'tout a dû être redécouvert.',

  fig_napoleon_bonaparte:
    'Voici un homme dont les codes régissent encore la vie de centaines de millions de ' +
    'personnes, et qui a rétabli l’esclavage dans les colonies huit ans après son abolition. ' +
    'Le bilan se tient entier.',

  fig_winston_churchill:
    'Quarante ans d’échecs, puis trois jours de mai 1940 où un entêtement a changé le cours de ' +
    'la guerre. Le même caractère avait produit, vingt-cinq ans plus tôt, le désastre des ' +
    'Dardanelles.',

  fig_steve_jobs:
    'Voici quelqu’un qui ne savait ni concevoir un circuit ni écrire un programme. Sa ' +
    'contribution était ailleurs, et elle tenait surtout dans ce qu’il refusait de faire.',

  fig_elon_musk:
    'Deux démonstrations qu’on tenait pour impossibles, et un écart constant entre les ' +
    'annonces et les livraisons. Les deux appartiennent au même dossier, et il faut les tenir ' +
    'ensemble.',

  fig_warren_buffett:
    'Voici une performance de soixante ans que les résumés expliquent mal. Le moteur principal ' +
    'n’est pas le choix des actions : c’est un financement dont presque personne ne dispose.',

  fig_alan_turing:
    'Voici l’homme qui a défini ce qu’un ordinateur peut calculer, dix ans avant qu’il en ' +
    'existe un seul. L’État qu’il avait aidé à sauver l’a condamné pour sa vie privée.',

  fig_marie_curie:
    'Voici quelqu’un qui a remué des bassines de minerai bouillant pendant quatre ans dans un ' +
    'hangar mal chauffé, refusé de breveter sa découverte, et reçu deux prix Nobel dans deux ' +
    'sciences différentes.',

  fig_nelson_mandela:
    'Vingt-sept ans de prison, mis à profit pour apprendre la langue de l’adversaire. Et son ' +
    'acte politique le plus important, qui est d’être parti au bout d’un seul mandat.',

  fig_marcus_aurelius:
    'Voici le carnet privé d’un homme qui détenait un pouvoir sans contrôle et s’efforçait ' +
    'chaque jour de ne pas s’y perdre. Il ne l’a jamais écrit pour être lu.',
};
