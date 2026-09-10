import { probabilityOfScoreByChance } from './irt';
import type { IQItem, ItemResponse, ValidityAssessment } from './types';

/**
 * Une réponse donnée en moins de ce ratio du temps attendu n'a pas pu être réfléchie :
 * l'énoncé n'a matériellement pas eu le temps d'être lu.
 */
const ABERRANT_TIME_RATIO = 0.2;

/** Plancher absolu : sous ce seuil, aucun item n'est lisible, quelle que soit sa difficulté. */
const ABERRANT_TIME_FLOOR_SECONDS = 3;

/** Au-delà de cette proportion de réponses expédiées, la passation n'est plus interprétable. */
const MAX_ABERRANT_RATIO = 0.3;

/** Seuil du test binomial : au-dessus, le score ne se distingue pas du hasard. */
const CHANCE_ALPHA = 0.05;

/**
 * Erreur type au-delà de laquelle l'estimation est trop imprécise pour être présentée
 * sans réserve. 0,45 sur l'échelle de θ correspond à un intervalle de ±13 points de QI.
 */
const LOW_PRECISION_SE = 0.45;

/**
 * Détecte les réponses trop rapides pour être réfléchies.
 *
 * On compare au temps attendu de l'item plutôt qu'à un seuil unique : cinq secondes
 * sont plausibles sur une analogie verbale facile, pas sur une matrice 3×3.
 */
export function detectAberrantResponses(
  responses: ItemResponse[],
  itemsById: Map<string, IQItem>
): string[] {
  const flagged: string[] = [];

  for (const response of responses) {
    if (response.selectedIndex < 0) continue; // Item sauté : traité ailleurs.
    const item = itemsById.get(response.itemId);
    if (!item) continue;

    const threshold = Math.max(
      ABERRANT_TIME_FLOOR_SECONDS,
      item.expectedSeconds * ABERRANT_TIME_RATIO
    );

    if (response.responseSeconds < threshold) {
      flagged.push(response.itemId);
    }
  }

  return flagged;
}

/**
 * Décide si la passation peut être restituée comme une mesure, et avec quelles réserves.
 *
 * Trois verdicts :
 * - `not_interpretable` : le profil est indiscernable du hasard, ou une part trop
 *   importante des réponses a été expédiée. Aucun score n'est affiché — annoncer un
 *   chiffre dans ce cas reviendrait à inventer une mesure.
 * - `low_precision` : mesure valide mais imprécise. Le score est affiché avec son
 *   intervalle, en insistant sur ce dernier.
 * - `ok` : rien à signaler.
 */
export function assessValidity(
  responses: ItemResponse[],
  itemsById: Map<string, IQItem>,
  standardError: number
): ValidityAssessment {
  const answered = responses.filter((r) => r.selectedIndex >= 0);
  const correctCount = responses.filter((r) => r.correct).length;

  const administered = responses
    .map((r) => itemsById.get(r.itemId))
    .filter((item): item is IQItem => Boolean(item));

  const expectedByChance = administered.reduce((sum, item) => sum + item.params.c, 0);
  const meanChanceRate =
    administered.length > 0 ? expectedByChance / administered.length : 0.2;

  const aboveChanceP = probabilityOfScoreByChance(
    correctCount,
    administered.length,
    meanChanceRate
  );

  const aberrantItemIds = detectAberrantResponses(responses, itemsById);
  const aberrantRatio =
    answered.length > 0 ? aberrantItemIds.length / answered.length : 0;

  const base = {
    aberrantCount: aberrantItemIds.length,
    aberrantItemIds,
    correctCount,
    expectedByChance: Math.round(expectedByChance * 10) / 10,
    aboveChanceP,
  };

  if (aboveChanceP > CHANCE_ALPHA) {
    return {
      ...base,
      verdict: 'not_interpretable',
      message:
        `Vos réponses ne se distinguent pas statistiquement d'un tirage au hasard ` +
        `(${correctCount} bonnes réponses, contre ${base.expectedByChance} attendues en répondant au hasard). ` +
        `Aucun score ne peut être calculé sur cette base. Reprenez le test en prenant le temps de lire chaque énoncé.`,
    };
  }

  if (aberrantRatio > MAX_ABERRANT_RATIO) {
    return {
      ...base,
      verdict: 'not_interpretable',
      message:
        `${aberrantItemIds.length} réponses sur ${answered.length} ont été données trop vite pour que l'énoncé ait pu être lu. ` +
        `Le résultat ne reflète pas vos aptitudes. Reprenez le test sans vous presser.`,
    };
  }

  if (standardError > LOW_PRECISION_SE || aberrantItemIds.length > 0) {
    const reasons: string[] = [];
    if (standardError > LOW_PRECISION_SE) {
      reasons.push("le nombre d'items exploitables est faible");
    }
    if (aberrantItemIds.length > 0) {
      reasons.push(
        `${aberrantItemIds.length} réponse${aberrantItemIds.length > 1 ? 's ont' : ' a'} été donnée${aberrantItemIds.length > 1 ? 's' : ''} très rapidement`
      );
    }
    return {
      ...base,
      verdict: 'low_precision',
      message: `Estimation à prendre avec précaution : ${reasons.join(' et ')}. Lisez l'intervalle plutôt que le chiffre central.`,
    };
  }

  return { ...base, verdict: 'ok', message: null };
}
