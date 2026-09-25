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
 * ── État ──
 *
 * Trois sur cinquante. Les quarante-sept autres s'écrivent une fois le ton
 * validé à l'oreille : les réécrire cinquante fois après coup serait du travail
 * perdu, et le ton d'une phrase lue ne se juge pas à l'écrit.
 *
 * `scripts/genere-audio.mjs` refuse de générer un article dont l'introduction
 * manque, plutôt que d'en inventer une.
 */
export const INTRODUCTIONS: Record<string, string> = {
  hist_chute_rome:
    'Voici l’histoire de la chute de l’Empire romain. Elle tient dans une date que tout ' +
    'le monde connaît, 476, et cette date est une convention que personne n’a vécue.',

  econ_subprimes:
    'Voici comment des prêts immobiliers accordés à des ménages américains ont fait ' +
    'tomber l’économie mondiale. Tout part d’une idée qui paraissait raisonnable : ne pas ' +
    'garder le risque qu’on a créé.',

  psy_dopamine:
    'Voici l’histoire de la dopamine, et elle commence par une correction. Ce n’est pas ' +
    'la molécule du plaisir : elle ne mesure pas ce que vous obtenez, mais l’écart entre ' +
    'ce que vous obtenez et ce que vous attendiez.',
};
