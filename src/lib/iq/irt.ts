import type { AbilityEstimate, DesignDifficulty, ItemParameters } from './types';

/**
 * Constante d'échelle logistique. D ≈ 1,702 rend le modèle logistique quasi
 * indiscernable du modèle à ogive normale, ce qui permet de lire `a` et `b` avec les
 * conventions habituelles de la littérature psychométrique.
 */
export const D = 1.702;

/** Pouvoir discriminant attribué par défaut, faute de données de calibration. */
export const DEFAULT_DISCRIMINATION = 1.0;

/**
 * Correspondance entre la difficulté de conception (1 à 5) et `b`, sur l'échelle de θ.
 *
 * Les cinq niveaux couvrent −1,8 à +1,8 écart-type, soit environ du 4ᵉ au 96ᵉ centile.
 * Étaler davantage produirait des items que presque personne ne réussit ou ne rate,
 * donc peu informatifs.
 */
const DIFFICULTY_TO_B: Record<DesignDifficulty, number> = {
  1: -1.8,
  2: -0.9,
  3: 0.0,
  4: 0.9,
  5: 1.8,
};

/**
 * Construit les paramètres a priori d'un item.
 *
 * `c` n'est pas un réglage esthétique : c'est la probabilité de tomber juste au hasard,
 * donc l'inverse du nombre d'options. C'est ce terme qui empêche le modèle de
 * confondre « a répondu au hasard » et « a une aptitude faible mais réelle ».
 */
export function makeParams(difficulty: DesignDifficulty, optionCount: number): ItemParameters {
  if (optionCount < 2) {
    throw new Error(`optionCount doit valoir au moins 2, reçu ${optionCount}`);
  }
  return {
    a: DEFAULT_DISCRIMINATION,
    b: DIFFICULTY_TO_B[difficulty],
    c: 1 / optionCount,
  };
}

/** Probabilité de réponse correcte selon le modèle 3PL. */
export function probability(theta: number, { a, b, c }: ItemParameters): number {
  const logistic = 1 / (1 + Math.exp(-D * a * (theta - b)));
  return c + (1 - c) * logistic;
}

/** Information de Fisher apportée par un item à un niveau θ donné. */
export function itemInformation(theta: number, params: ItemParameters): number {
  const p = probability(theta, params);
  const q = 1 - p;
  if (p <= params.c || q <= 0) return 0;
  const ratio = (p - params.c) / (1 - params.c);
  return D * D * params.a * params.a * (q / p) * ratio * ratio;
}

/** Densité de la loi normale centrée réduite. */
function standardNormalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

const GRID_MIN = -4;
const GRID_MAX = 4;
const GRID_STEP = 0.05;

const THETA_GRID: number[] = (() => {
  const grid: number[] = [];
  for (let t = GRID_MIN; t <= GRID_MAX + 1e-9; t += GRID_STEP) {
    grid.push(Number(t.toFixed(4)));
  }
  return grid;
})();

export interface ScoredResponse {
  params: ItemParameters;
  correct: boolean;
}

/**
 * Estimation de θ par espérance a posteriori (EAP), sur une grille de quadrature.
 *
 * Le choix de l'EAP plutôt que du maximum de vraisemblance est délibéré : le MV
 * diverge vers ±∞ pour un sans-faute ou un zéro pointé, ce qui est courant sur un test
 * court. L'EAP reste toujours fini et fournit gratuitement une erreur type, dont on a
 * besoin pour afficher un intervalle de confiance.
 *
 * A priori : loi normale centrée réduite. Un candidat sur lequel les réponses
 * n'apportent aucune information se voit donc restituer l'a priori, avec une erreur
 * type proche de 1 — ce qui est la traduction honnête de « on ne sait pas ».
 */
export function estimateAbility(responses: ScoredResponse[]): AbilityEstimate {
  if (responses.length === 0) {
    return { theta: 0, standardError: 1, itemCount: 0 };
  }

  // Log-vraisemblance par point de grille, pour éviter les sous-dépassements.
  const logLikelihood = THETA_GRID.map((theta) => {
    let total = 0;
    for (const { params, correct } of responses) {
      const p = probability(theta, params);
      const clamped = Math.min(Math.max(p, 1e-12), 1 - 1e-12);
      total += correct ? Math.log(clamped) : Math.log(1 - clamped);
    }
    return total;
  });

  const maxLog = Math.max(...logLikelihood);

  let sumW = 0;
  let sumThetaW = 0;
  const weights = THETA_GRID.map((theta, i) => {
    const w = Math.exp(logLikelihood[i] - maxLog) * standardNormalPdf(theta);
    sumW += w;
    sumThetaW += theta * w;
    return w;
  });

  if (sumW === 0 || !Number.isFinite(sumW)) {
    return { theta: 0, standardError: 1, itemCount: responses.length };
  }

  const theta = sumThetaW / sumW;

  let sumVarW = 0;
  THETA_GRID.forEach((t, i) => {
    const d = t - theta;
    sumVarW += d * d * weights[i];
  });

  return {
    theta,
    standardError: Math.sqrt(sumVarW / sumW),
    itemCount: responses.length,
  };
}

/** Coefficient binomial, calculé en logarithmes pour rester stable. */
function logChoose(n: number, k: number): number {
  let result = 0;
  for (let i = 1; i <= k; i++) {
    result += Math.log(n - k + i) - Math.log(i);
  }
  return result;
}

/**
 * Test binomial unilatéral : P(X ≥ observés) sous l'hypothèse « le candidat répond au
 * hasard ». Une p-value élevée signifie que le score ne se distingue pas du hasard.
 */
export function probabilityOfScoreByChance(
  correctCount: number,
  itemCount: number,
  chanceRate: number
): number {
  if (itemCount === 0) return 1;
  const k0 = Math.max(0, Math.min(correctCount, itemCount));
  let tail = 0;
  for (let k = k0; k <= itemCount; k++) {
    const logP =
      logChoose(itemCount, k) +
      k * Math.log(chanceRate) +
      (itemCount - k) * Math.log(1 - chanceRate);
    tail += Math.exp(logP);
  }
  return Math.min(1, tail);
}
