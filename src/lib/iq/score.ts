import { estimateAbility, type ScoredResponse } from './irt';
import { MIN_SESSIONS_FOR_NORMING } from './calibration';
import {
  describeNorm,
  empiricalPercentile,
  theoreticalPercentile,
  toRadarValue,
  toScaledScore,
} from './scale';
import { assessValidity } from './validity';
import { APTITUDES, APTITUDE_DESCRIPTION, APTITUDE_LABEL } from './types';
import type { Aptitude, AptitudeResult, IQItem, IQReport, ItemResponse } from './types';

/**
 * Marge exigée pour déclarer une aptitude « forte » ou « faible », en erreurs types.
 *
 * Valeur choisie sur mesure, pas au jugé : avec sept items par aptitude, l'erreur type
 * mesurée est d'environ 0,62. À une erreur type, un candidat rigoureusement moyen se
 * voyait attribuer en moyenne un point fort ou faible par passation — autant dire une
 * affirmation inventée une fois sur une. À 1,645 (seuil unilatéral à 5 %), ce taux
 * tombe nettement, au prix de rapports qui ne dégagent souvent aucune force marquée.
 * C'est la bonne réponse : sur sept items, il n'y a le plus souvent rien à conclure.
 */
const SIGNIFICANCE_MARGIN = 1.645;

export interface ReportInput {
  sessionId: string;
  candidateName?: string | null;
  /** Items réellement administrés. */
  items: readonly IQItem[];
  responses: readonly ItemResponse[];
  /** θ des passations de référence, pour le percentile empirique. */
  referenceThetas?: readonly number[];
  totalSeconds?: number;
  now?: Date;
}

export function buildReport(input: ReportInput): IQReport {
  const itemsById = new Map(input.items.map((item) => [item.id, item]));
  const responses = [...input.responses];

  // Un item laissé sans réponse est compté comme échoué. C'est le choix le plus
  // défavorable au candidat, mais le seul qui empêche d'améliorer son score en
  // sautant les items difficiles. Ce parti pris est documenté dans docs/SCORING.md.
  const scored: ScoredResponse[] = [];
  for (const response of responses) {
    const item = itemsById.get(response.itemId);
    if (!item) continue;
    scored.push({ params: item.params, correct: response.correct });
  }

  const overall = estimateAbility(scored);
  const scaled = toScaledScore(overall);
  const validity = assessValidity(responses, itemsById, overall.standardError);

  const aptitudes: AptitudeResult[] = APTITUDES.map((aptitude) =>
    buildAptitudeResult(aptitude, responses, itemsById)
  );

  const strengths: Aptitude[] = [];
  const weaknesses: Aptitude[] = [];
  for (const result of aptitudes) {
    if (result.itemCount === 0) continue;
    const margin = SIGNIFICANCE_MARGIN * result.estimate.standardError;
    if (result.estimate.theta - margin > 0) strengths.push(result.aptitude);
    else if (result.estimate.theta + margin < 0) weaknesses.push(result.aptitude);
  }

  const reference = input.referenceThetas ?? [];
  const usableNorm = reference.length >= MIN_SESSIONS_FOR_NORMING;
  const norm = describeNorm(usableNorm ? reference.length : 0);

  // Un profil non interprétable ne reçoit pas de percentile : le situer dans une
  // population supposerait qu'on a mesuré quelque chose.
  const percentile =
    validity.verdict === 'not_interpretable'
      ? null
      : usableNorm
        ? empiricalPercentile(overall.theta, [...reference])
        : theoreticalPercentile(overall.theta);

  const totalSeconds =
    input.totalSeconds ?? responses.reduce((sum, r) => sum + r.responseSeconds, 0);

  return {
    sessionId: input.sessionId,
    createdAt: (input.now ?? new Date()).toISOString(),
    candidateName: input.candidateName?.trim() || null,
    overall,
    scaled,
    percentile,
    norm,
    aptitudes,
    strengths,
    weaknesses,
    validity,
    totalSeconds,
    itemCount: responses.length,
    correctCount: responses.filter((r) => r.correct).length,
    responses,
  };
}

function buildAptitudeResult(
  aptitude: Aptitude,
  responses: readonly ItemResponse[],
  itemsById: Map<string, IQItem>
): AptitudeResult {
  const subset = responses.filter((r) => itemsById.get(r.itemId)?.aptitude === aptitude);

  const scored: ScoredResponse[] = subset.map((r) => ({
    params: itemsById.get(r.itemId)!.params,
    correct: r.correct,
  }));

  const estimate = estimateAbility(scored);

  return {
    aptitude,
    label: APTITUDE_LABEL[aptitude],
    description: APTITUDE_DESCRIPTION[aptitude],
    estimate,
    scaled: toScaledScore(estimate),
    correctCount: subset.filter((r) => r.correct).length,
    itemCount: subset.length,
    radarValue: toRadarValue(estimate.theta),
  };
}
