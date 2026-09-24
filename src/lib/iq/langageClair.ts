import type { Aptitude, IQReport, ScaledScore } from './types';

/**
 * Traduction du résultat en français courant.
 *
 * ── Le problème ──
 *
 * L'écran de résultat disait : « Vous vous situez au 60ᵉ centile », sous un
 * indice de 106 assorti de « 97 – 115 » et de la mention « intervalle de
 * confiance à 95 % ». Chacun de ces termes est exact. Aucun n'est compris par
 * quelqu'un qui n'a pas fait de statistiques, et un chiffre qu'on ne comprend
 * pas ne renseigne pas : il intimide, ou il est mal interprété, ce qui est pire.
 *
 * ── Le principe retenu ──
 *
 * Rien n'est supprimé. L'indice, le centile, l'intervalle et l'erreur type
 * restent affichés, mais dans un repli « détail technique », pour qui les
 * cherche. La lecture principale est en français ordinaire et répond à trois
 * questions, dans cet ordre :
 *
 *   1. où je me situe par rapport aux autres ;
 *   2. avec quelle précision — dit sans le mot « intervalle » ;
 *   3. ce que je réussis bien, et ce qui me demande plus d'effort.
 *
 * ── Deux règles de rédaction ──
 *
 * Le centile est retourné en dénombrement : « environ 60 personnes sur 100
 * obtiennent un résultat plus faible » est immédiatement compréhensible, là où
 * « 60ᵉ centile » demande de connaître la définition. C'est la même information,
 * exactement.
 *
 * L'imprécision est dite comme une impossibilité, non comme une réserve
 * d'usage : le chiffre du milieu n'est pas « le vrai score entaché d'une petite
 * erreur », il est un point parmi d'autres également compatibles avec les
 * réponses données. Formuler l'inverse serait mentir par prudence apparente.
 *
 * Ce module est volontairement sans dépendance d'affichage : il rend des
 * chaînes, il est testé unitairement, et l'écran n'a plus qu'à les poser.
 */

/**
 * Ce que chaque aptitude demande de faire, en termes d'action.
 *
 * Distinct de `APTITUDE_LABEL` (« Rotation spatiale ») et de
 * `APTITUDE_DESCRIPTION`, qui est exacte mais écrite pour un lecteur déjà
 * familier. Ici, on nomme le geste mental, pas la catégorie.
 */
export const SAVOIR_FAIRE: Record<Aptitude, string> = {
  matrix: 'trouver la règle derrière une suite de figures',
  series: 'repérer la logique d’une suite de nombres',
  verbal: 'saisir le rapport entre des mots',
  spatial: 'faire tourner des formes dans votre tête',
  memory: 'retenir une information et la réutiliser juste après',
};

/** Position relative, en mots plutôt qu'en rang. */
export function positionEnMots(centile: number): string {
  if (centile < 10) return 'nettement en dessous de la moyenne';
  if (centile < 25) return 'en dessous de la moyenne';
  if (centile < 40) return 'un peu en dessous de la moyenne';
  if (centile <= 60) return 'dans la moyenne';
  if (centile < 75) return 'un peu au-dessus de la moyenne';
  if (centile < 90) return 'au-dessus de la moyenne';
  return 'nettement au-dessus de la moyenne';
}

/**
 * « Où je me situe », sans le mot centile.
 *
 * Rend `null` quand le centile n'a pas pu être calculé : mieux vaut ne rien
 * dire que de fabriquer une position.
 */
export function phraseSituation(centile: number | null): string | null {
  if (centile === null) return null;

  const dessous = Math.round(centile);
  const dessus = 100 - dessous;

  if (dessous <= 1) {
    return 'Presque toutes les personnes de référence obtiennent un résultat plus élevé que le vôtre.';
  }
  if (dessus <= 1) {
    return 'Presque toutes les personnes de référence obtiennent un résultat plus faible que le vôtre.';
  }

  return (
    `Sur 100 personnes, environ ${dessous} obtiennent un résultat plus faible que le vôtre, ` +
    `et environ ${dessus} un résultat plus élevé. Vous êtes donc ${positionEnMots(centile)}.`
  );
}

/**
 * « Avec quelle précision », sans le mot intervalle.
 *
 * L'amplitude est donnée en clair, parce que c'est elle qui porte le message :
 * un écart de dix-huit points entre les deux bornes se comprend mieux énoncé
 * qu'à déduire de deux nombres.
 */
export function phrasePrecision(scaled: ScaledScore, nombreQuestions: number): string {
  const amplitude = scaled.upper95 - scaled.lower95;
  return (
    `Ce résultat n’est pas un chiffre exact, et il ne peut pas l’être. ` +
    `${nombreQuestions} questions permettent de situer votre niveau entre ` +
    `${scaled.lower95} et ${scaled.upper95} — ${amplitude} points d’écart — sans pouvoir ` +
    `trancher à l’intérieur. Toutes les valeurs de cette plage collent aussi bien à vos ` +
    `réponses que celle du milieu.`
  );
}

/** Ce qui ressort le mieux, en nommant le geste mental plutôt que la catégorie. */
export function phraseForces(forces: readonly Aptitude[]): string | null {
  if (forces.length === 0) return null;
  const listes = forces.map((a) => SAVOIR_FAIRE[a]);
  return `Vous vous en sortez mieux que sur le reste quand il faut ${enumerer(listes)}.`;
}

/** Ce qui coince, formulé comme un effort demandé et non comme un manque. */
export function phraseDifficultes(faiblesses: readonly Aptitude[]): string | null {
  if (faiblesses.length === 0) return null;
  const listes = faiblesses.map((a) => SAVOIR_FAIRE[a]);
  return `Ce qui vous demande plus d’effort : ${enumerer(listes)}.`;
}

/**
 * Phrase de remplacement quand aucune aptitude ne se détache.
 *
 * C'est le cas le plus fréquent, et l'ancien écran ne le disait pas : il
 * affichait cinq bandes de longueurs différentes, ce qui laissait lire un
 * profil là où il n'y avait que du bruit.
 */
export function phraseProfilPlat(): string {
  return (
    'Aucune de vos cinq aptitudes ne se détache nettement des autres. Sept questions par ' +
    'aptitude ne suffisent pas à les départager : les écarts que vous verrez sur le ' +
    'graphique sont dans la marge d’erreur.'
  );
}

/** Énumération française : « a », « a et b », « a, b et c ». */
function enumerer(elements: readonly string[]): string {
  if (elements.length === 0) return '';
  if (elements.length === 1) return elements[0];
  return `${elements.slice(0, -1).join(', ')} et ${elements[elements.length - 1]}`;
}

/** Les trois à quatre phrases de la lecture principale, dans l'ordre. */
export interface LectureClaire {
  situation: string | null;
  precision: string;
  forces: string | null;
  difficultes: string | null;
  profilPlat: string | null;
}

export function lectureClaire(report: IQReport): LectureClaire {
  const forces = phraseForces(report.strengths);
  const difficultes = phraseDifficultes(report.weaknesses);

  return {
    situation: phraseSituation(report.percentile),
    precision: phrasePrecision(report.scaled, report.itemCount),
    forces,
    difficultes,
    profilPlat: forces === null && difficultes === null ? phraseProfilPlat() : null,
  };
}
