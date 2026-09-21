/**
 * Calcul du score, côté serveur.
 *
 * ── Pourquoi ce code existe deux fois ──
 *
 * La même mathématique vit dans `src/lib/iq/` pour l'affichage immédiat, et ici pour
 * le calcul qui fait foi. Ce n'est pas un oubli : une Edge Function Deno et un bundle
 * navigateur ne peuvent pas partager proprement un module sans dépendre du bundler de
 * déploiement, et un score dont l'autorité dépend d'un détail d'outillage n'est pas une
 * autorité.
 *
 * La duplication est donc assumée, mais elle n'est pas laissée sans surveillance :
 * `src/lib/iq/__tests__/parite-serveur.test.ts` confronte les deux implémentations sur
 * des jeux de réponses tirés au hasard et échoue au moindre écart. Ce fichier
 * n'importe rien, précisément pour que ce test puisse le charger.
 *
 * ── Ce qui fait l'autorité ──
 *
 * Les paramètres d'items et le corrigé viennent de `public.iq_items`, table sans
 * politique RLS, donc invisible depuis l'API. Le navigateur n'envoie que l'index
 * choisi et la durée. Il ne peut donc ni décider qu'une réponse est juste, ni décider
 * du score.
 */

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type Aptitude = 'matrix' | 'series' | 'verbal' | 'spatial' | 'memory';

export type Verdict = 'ok' | 'low_precision' | 'not_interpretable';

export type Niveau =
  | 'fondamental'
  | 'intermediaire'
  | 'avance'
  | 'superieur'
  | 'exceptionnel';

export interface ItemServeur {
  id: string;
  aptitude: Aptitude;
  a: number;
  b: number;
  c: number;
  correctIndex: number;
  expectedSeconds: number;
}

export interface ReponseServeur {
  itemId: string;
  selectedIndex: number;
  responseSeconds: number;
}

export interface AptitudeServeur {
  aptitude: Aptitude;
  theta: number;
  standardError: number;
  scaledPoint: number;
  scaledLower95: number;
  scaledUpper95: number;
  correctCount: number;
  itemCount: number;
  radarValue: number;
}

export interface ResultatServeur {
  theta: number;
  standardError: number;
  scaledPoint: number;
  scaledLower95: number;
  scaledUpper95: number;
  percentile: number | null;
  verdict: Verdict;
  validityMessage: string | null;
  aberrantCount: number;
  aberrantItemIds: string[];
  aboveChanceP: number;
  expectedByChance: number;
  correctCount: number;
  itemCount: number;
  niveau: Niveau;
  aptitudes: AptitudeServeur[];
  strengths: Aptitude[];
  weaknesses: Aptitude[];
}

/* ── Constantes : identiques à celles du client, par construction ─────────── */

const D = 1.702;
const SCALE_MEAN = 100;
const SCALE_SD = 15;
const Z_95 = 1.96;

const GRID_MIN = -4;
const GRID_MAX = 4;
const GRID_STEP = 0.05;

const ABERRANT_TIME_RATIO = 0.2;
const ABERRANT_TIME_FLOOR_SECONDS = 3;
const MAX_ABERRANT_RATIO = 0.3;
const CHANCE_ALPHA = 0.05;
const LOW_PRECISION_SE = 0.45;
const SIGNIFICANCE_MARGIN = 1.645;

export const APTITUDES: readonly Aptitude[] = [
  'matrix',
  'series',
  'verbal',
  'spatial',
  'memory',
];

const THETA_GRID: number[] = (() => {
  const grid: number[] = [];
  for (let t = GRID_MIN; t <= GRID_MAX + 1e-9; t += GRID_STEP) {
    grid.push(Number(t.toFixed(4)));
  }
  return grid;
})();

/* ── Modèle 3PL ────────────────────────────────────────────────────────────── */

function probability(theta: number, a: number, b: number, c: number): number {
  const logistic = 1 / (1 + Math.exp(-D * a * (theta - b)));
  return c + (1 - c) * logistic;
}

function standardNormalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

interface Notee {
  a: number;
  b: number;
  c: number;
  correct: boolean;
}

interface Estimation {
  theta: number;
  standardError: number;
  itemCount: number;
}

/**
 * Estimation de θ par espérance a posteriori, sur grille de quadrature.
 *
 * EAP et non maximum de vraisemblance : le MV diverge vers ±∞ sur un sans-faute ou un
 * zéro pointé, ce qui arrive couramment sur un test court. L'EAP reste fini et fournit
 * l'erreur type dont l'intervalle de confiance a besoin.
 */
function estimateAbility(reponses: Notee[]): Estimation {
  if (reponses.length === 0) {
    return { theta: 0, standardError: 1, itemCount: 0 };
  }

  const logLikelihood = THETA_GRID.map((theta) => {
    let total = 0;
    for (const { a, b, c, correct } of reponses) {
      const p = probability(theta, a, b, c);
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
    return { theta: 0, standardError: 1, itemCount: reponses.length };
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
    itemCount: reponses.length,
  };
}

/* ── Échelle 100/15 ────────────────────────────────────────────────────────── */

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

function standardNormalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function clampPercentile(p: number): number {
  return Math.min(99, Math.max(1, p));
}

function toScaled(estimate: Estimation) {
  const point = SCALE_MEAN + SCALE_SD * estimate.theta;
  const margin = Z_95 * SCALE_SD * estimate.standardError;
  return {
    point: Math.round(point),
    lower95: Math.round(point - margin),
    upper95: Math.round(point + margin),
  };
}

/* ── Test binomial contre le hasard ───────────────────────────────────────── */

function logChoose(n: number, k: number): number {
  let result = 0;
  for (let i = 1; i <= k; i++) {
    result += Math.log(n - k + i) - Math.log(i);
  }
  return result;
}

function probabilityOfScoreByChance(
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

/* ── Niveau affiché au classement ─────────────────────────────────────────── */

/**
 * Cinq bandes larges, calées sur l'indice.
 *
 * Volontairement grossier : l'intervalle de confiance d'une passation de 35 items fait
 * une vingtaine de points. Des paliers plus fins afficheraient une précision que la
 * mesure n'a pas, et deux personnes séparées par trois points seraient rangées dans
 * des cases différentes sans qu'on puisse l'affirmer.
 */
export function niveauDepuisIndice(indice: number): Niveau {
  if (indice < 85) return 'fondamental';
  if (indice < 100) return 'intermediaire';
  if (indice < 115) return 'avance';
  if (indice < 130) return 'superieur';
  return 'exceptionnel';
}

/* ── Calcul complet ───────────────────────────────────────────────────────── */

/**
 * Recalcule tout depuis le journal des réponses et la banque serveur.
 *
 * Un item administré mais laissé sans réponse compte comme échoué : c'est le choix le
 * plus défavorable, mais le seul qui empêche d'améliorer son score en sautant les
 * items difficiles.
 */
export function calculerResultat(
  items: readonly ItemServeur[],
  reponses: readonly ReponseServeur[]
): ResultatServeur {
  const parId = new Map(items.map((item) => [item.id, item]));

  const retenues: Array<{ item: ItemServeur; reponse: ReponseServeur; correct: boolean }> = [];
  for (const reponse of reponses) {
    const item = parId.get(reponse.itemId);
    if (!item) continue;
    retenues.push({
      item,
      reponse,
      correct: reponse.selectedIndex === item.correctIndex,
    });
  }

  const notees: Notee[] = retenues.map(({ item, correct }) => ({
    a: item.a,
    b: item.b,
    c: item.c,
    correct,
  }));

  const overall = estimateAbility(notees);
  const scaled = toScaled(overall);

  const correctCount = retenues.filter((r) => r.correct).length;
  const itemCount = retenues.length;

  // ── Validité ────────────────────────────────────────────────────────────
  const aberrantItemIds: string[] = [];
  let repondues = 0;
  for (const { item, reponse } of retenues) {
    if (reponse.selectedIndex < 0) continue;
    repondues++;
    const seuil = Math.max(
      ABERRANT_TIME_FLOOR_SECONDS,
      item.expectedSeconds * ABERRANT_TIME_RATIO
    );
    if (reponse.responseSeconds < seuil) aberrantItemIds.push(item.id);
  }

  const expectedByChanceBrut = retenues.reduce((somme, r) => somme + r.item.c, 0);
  const tauxHasardMoyen = itemCount > 0 ? expectedByChanceBrut / itemCount : 0.2;
  const aboveChanceP = probabilityOfScoreByChance(correctCount, itemCount, tauxHasardMoyen);
  const expectedByChance = Math.round(expectedByChanceBrut * 10) / 10;
  const ratioAberrant = repondues > 0 ? aberrantItemIds.length / repondues : 0;

  let verdict: Verdict = 'ok';
  let validityMessage: string | null = null;

  if (aboveChanceP > CHANCE_ALPHA) {
    verdict = 'not_interpretable';
    validityMessage =
      `Vos réponses ne se distinguent pas statistiquement d'un tirage au hasard ` +
      `(${correctCount} bonnes réponses, contre ${expectedByChance} attendues en répondant au hasard). ` +
      `Aucun score ne peut être calculé sur cette base. Reprenez le test en prenant le temps de lire chaque énoncé.`;
  } else if (ratioAberrant > MAX_ABERRANT_RATIO) {
    verdict = 'not_interpretable';
    validityMessage =
      `${aberrantItemIds.length} réponses sur ${repondues} ont été données trop vite pour que l'énoncé ait pu être lu. ` +
      `Le résultat ne reflète pas vos aptitudes. Reprenez le test sans vous presser.`;
  } else if (overall.standardError > LOW_PRECISION_SE || aberrantItemIds.length > 0) {
    const raisons: string[] = [];
    if (overall.standardError > LOW_PRECISION_SE) {
      raisons.push("le nombre d'items exploitables est faible");
    }
    if (aberrantItemIds.length > 0) {
      raisons.push(
        `${aberrantItemIds.length} réponse${aberrantItemIds.length > 1 ? 's ont' : ' a'} été donnée${aberrantItemIds.length > 1 ? 's' : ''} très rapidement`
      );
    }
    verdict = 'low_precision';
    validityMessage = `Estimation à prendre avec précaution : ${raisons.join(' et ')}. Lisez l'intervalle plutôt que le chiffre central.`;
  }

  // ── Détail par aptitude ─────────────────────────────────────────────────
  const aptitudes: AptitudeServeur[] = APTITUDES.map((aptitude) => {
    const sousEnsemble = retenues.filter((r) => r.item.aptitude === aptitude);
    const estimation = estimateAbility(
      sousEnsemble.map(({ item, correct }) => ({
        a: item.a,
        b: item.b,
        c: item.c,
        correct,
      }))
    );
    const echelle = toScaled(estimation);
    return {
      aptitude,
      theta: estimation.theta,
      standardError: estimation.standardError,
      scaledPoint: echelle.point,
      scaledLower95: echelle.lower95,
      scaledUpper95: echelle.upper95,
      correctCount: sousEnsemble.filter((r) => r.correct).length,
      itemCount: sousEnsemble.length,
      radarValue: Math.min(100, Math.max(0, Math.round(standardNormalCdf(estimation.theta) * 100))),
    };
  });

  const strengths: Aptitude[] = [];
  const weaknesses: Aptitude[] = [];
  for (const resultat of aptitudes) {
    if (resultat.itemCount === 0) continue;
    const marge = SIGNIFICANCE_MARGIN * resultat.standardError;
    if (resultat.theta - marge > 0) strengths.push(resultat.aptitude);
    else if (resultat.theta + marge < 0) weaknesses.push(resultat.aptitude);
  }

  // Un profil non interprétable ne reçoit pas de percentile : le situer dans une
  // population supposerait qu'on a mesuré quelque chose.
  const percentile =
    verdict === 'not_interpretable'
      ? null
      : clampPercentile(Math.round(standardNormalCdf(overall.theta) * 100));

  return {
    theta: overall.theta,
    standardError: overall.standardError,
    scaledPoint: scaled.point,
    scaledLower95: scaled.lower95,
    scaledUpper95: scaled.upper95,
    percentile,
    verdict,
    validityMessage,
    aberrantCount: aberrantItemIds.length,
    aberrantItemIds,
    aboveChanceP,
    expectedByChance,
    correctCount,
    itemCount,
    niveau: niveauDepuisIndice(scaled.point),
    aptitudes,
    strengths,
    weaknesses,
  };
}
