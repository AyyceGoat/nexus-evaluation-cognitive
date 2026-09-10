import { D } from './irt';
import type { IQItem, ItemParameters, SessionRecord } from './types';

/**
 * Nombre de réponses exigé sur un item avant de remplacer ses paramètres de conception
 * par des paramètres mesurés.
 *
 * 200 est un compromis assumé : en dessous de ~150 réponses, l'erreur type sur la
 * difficulté empirique dépasse l'écart entre deux de nos cinq niveaux de conception,
 * et « mesurer » reviendrait à ajouter du bruit à une estimation déjà raisonnable.
 * La littérature exige davantage pour un étalonnage publiable ; ici l'objectif est
 * seulement de faire mieux qu'un barème posé à vue.
 */
export const MIN_RESPONSES_FOR_CALIBRATION = 200;

/**
 * Nombre de passations complètes exigé avant de calculer un percentile sur la
 * population réelle plutôt que sur la loi normale théorique.
 */
export const MIN_SESSIONS_FOR_NORMING = 300;

/** Bornes de sécurité : au-delà, un paramètre traduit un artefact, pas une mesure. */
const A_MIN = 0.4;
const A_MAX = 2.5;
const B_MIN = -3;
const B_MAX = 3;

/**
 * Inverse de la fonction de répartition normale centrée réduite.
 * Approximation rationnelle de Peter Acklam, erreur relative < 1,15·10⁻⁹.
 */
export function probit(p: number): number {
  if (p <= 0 || p >= 1) throw new Error(`probit attend p dans ]0,1[, reçu ${p}`);

  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  if (p > pHigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export interface ItemStatistics {
  itemId: string;
  responseCount: number;
  /** Proportion brute de réussite. */
  proportionCorrect: number;
  /**
   * Corrélation entre la réussite à cet item et le score total du candidat.
   * Un item qui ne corrèle pas avec le reste du test ne mesure pas la même chose.
   */
  pointBiserial: number;
}

/** Agrège les réponses par item, avec la corrélation item-total. */
export function computeItemStatistics(sessions: readonly SessionRecord[]): Map<string, ItemStatistics> {
  const scores = new Map<string, { correct: number; total: number; totals: number[]; hits: number[] }>();

  for (const session of sessions) {
    if (session.responses.length === 0) continue;
    const sessionScore = session.responses.filter((r) => r.correct).length / session.responses.length;

    for (const response of session.responses) {
      const entry = scores.get(response.itemId) ?? { correct: 0, total: 0, totals: [], hits: [] };
      entry.total += 1;
      if (response.correct) entry.correct += 1;
      entry.totals.push(sessionScore);
      entry.hits.push(response.correct ? 1 : 0);
      scores.set(response.itemId, entry);
    }
  }

  const out = new Map<string, ItemStatistics>();
  for (const [itemId, entry] of scores) {
    out.set(itemId, {
      itemId,
      responseCount: entry.total,
      proportionCorrect: entry.correct / entry.total,
      pointBiserial: correlation(entry.hits, entry.totals),
    });
  }
  return out;
}

function correlation(x: readonly number[], y: readonly number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

/**
 * Recalcule les paramètres d'un item à partir de ses statistiques observées.
 *
 * La difficulté vient de la proportion de réussite, corrigée du hasard : une réussite
 * de 20 % sur un item à cinq options ne signifie pas « item très difficile » mais
 * « personne ne l'a résolu ». Le pouvoir discriminant vient de la corrélation
 * item-total, transformée en pente.
 */
export function calibrateItem(item: IQItem, stats: ItemStatistics): IQItem {
  if (stats.responseCount < MIN_RESPONSES_FOR_CALIBRATION) return item;

  const { c } = item.params;
  const corrected = clamp((stats.proportionCorrect - c) / (1 - c), 0.01, 0.99);

  const rpb = clamp(stats.pointBiserial, -0.95, 0.95);
  const a = clamp(Math.abs(rpb) / Math.sqrt(Math.max(1e-6, 1 - rpb * rpb)), A_MIN, A_MAX);
  const b = clamp(-probit(corrected) / (D * a), B_MIN, B_MAX);

  const params: ItemParameters = { a, b, c };

  return {
    ...item,
    params,
    calibration: {
      source: 'empirical',
      responseCount: stats.responseCount,
      updatedAt: new Date().toISOString(),
    },
  };
}

/** Applique la recalibration à toute la banque. Les items sous le seuil sont inchangés. */
export function recalibrateBank(
  bank: readonly IQItem[],
  sessions: readonly SessionRecord[]
): { items: IQItem[]; calibratedCount: number } {
  const stats = computeItemStatistics(sessions);
  let calibratedCount = 0;

  const items = bank.map((item) => {
    const s = stats.get(item.id);
    if (!s) return item;
    const next = calibrateItem(item, s);
    if (next !== item) calibratedCount++;
    return next;
  });

  return { items, calibratedCount };
}

export interface NormingStats {
  populationSize: number;
  meanTheta: number;
  sdTheta: number;
  /** θ triés, servant au calcul direct des percentiles. */
  sortedThetas: number[];
}

/**
 * Résume la distribution des aptitudes observées. Sert à re-normer : si la population
 * réelle de NEXUS est plus forte ou plus faible que la loi de référence, les
 * percentiles doivent s'appuyer sur elle et non sur une distribution théorique.
 */
export function computeNormingStats(thetas: readonly number[]): NormingStats {
  const n = thetas.length;
  if (n === 0) {
    return { populationSize: 0, meanTheta: 0, sdTheta: 1, sortedThetas: [] };
  }
  const mean = thetas.reduce((s, t) => s + t, 0) / n;
  const variance = thetas.reduce((s, t) => s + (t - mean) ** 2, 0) / n;
  return {
    populationSize: n,
    meanTheta: mean,
    sdTheta: Math.sqrt(variance) || 1,
    sortedThetas: [...thetas].sort((x, y) => x - y),
  };
}
