import type { AbilityEstimate, NormReference, ScaledScore } from './types';

/** Moyenne et écart-type de l'échelle de restitution usuelle. */
export const SCALE_MEAN = 100;
export const SCALE_SD = 15;

/** Quantile normal à 95 % bilatéral. */
const Z_95 = 1.96;

/**
 * Fonction d'erreur, approximation d'Abramowitz & Stegun 7.1.26.
 * Erreur absolue maximale ≈ 1,5·10⁻⁷, largement suffisante pour un percentile entier.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);

  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);

  return sign * y;
}

/** Fonction de répartition de la loi normale centrée réduite. */
export function standardNormalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/**
 * Projette θ et son erreur type sur l'échelle 100/15.
 *
 * L'intervalle est celui de l'estimation, pas une fourchette décorative : il dit dans
 * quelle plage se situe le score vrai avec 95 % de confiance, compte tenu du nombre
 * d'items administrés.
 */
export function toScaledScore(estimate: AbilityEstimate): ScaledScore {
  const point = SCALE_MEAN + SCALE_SD * estimate.theta;
  const margin = Z_95 * SCALE_SD * estimate.standardError;
  return {
    point: Math.round(point),
    lower95: Math.round(point - margin),
    upper95: Math.round(point + margin),
  };
}

/**
 * Percentile théorique, lu sur la loi normale centrée réduite.
 * Utilisé tant qu'aucun référentiel empirique n'est disponible.
 */
export function theoreticalPercentile(theta: number): number {
  return clampPercentile(Math.round(standardNormalCdf(theta) * 100));
}

/**
 * Percentile empirique : proportion des passations de référence dont le θ est
 * strictement inférieur à celui du candidat.
 */
export function empiricalPercentile(theta: number, referenceThetas: number[]): number {
  if (referenceThetas.length === 0) return theoreticalPercentile(theta);
  const below = referenceThetas.filter((t) => t < theta).length;
  return clampPercentile(Math.round((below / referenceThetas.length) * 100));
}

/** Un percentile de 0 ou 100 n'a pas de sens sur un échantillon fini. */
function clampPercentile(p: number): number {
  return Math.min(99, Math.max(1, p));
}

/**
 * Effectif minimal avant de substituer le référentiel empirique au référentiel
 * théorique. En deçà, un percentile « mesuré » serait plus trompeur que le théorique :
 * sur 50 passations, un centile vaut deux personnes.
 */
export const MIN_POPULATION_FOR_EMPIRICAL_NORM = 300;

/** Décrit, en toutes lettres, la population à laquelle le candidat est comparé. */
export function describeNorm(populationSize: number): NormReference {
  if (populationSize >= MIN_POPULATION_FOR_EMPIRICAL_NORM) {
    return {
      source: 'empirical',
      populationSize,
      label: `calculé sur les ${populationSize.toLocaleString('fr-FR')} passations complètes enregistrées sur NEXUS`,
    };
  }
  return {
    source: 'prior',
    populationSize: 0,
    label:
      'situé sur une distribution théorique de référence (moyenne 100, écart-type 15), faute de passations enregistrées en nombre suffisant',
  };
}

/** Position 0–100 pour le radar : le percentile de l'aptitude dans la distribution. */
export function toRadarValue(theta: number): number {
  return Math.min(100, Math.max(0, Math.round(standardNormalCdf(theta) * 100)));
}
