import type { MatrixItemData } from '../../types/matrix';

/**
 * Les cinq aptitudes évaluées.
 *
 * Remplace les six « dimensions » de l'ancien moteur : `logic` a été fusionnée dans
 * `series` et `verbal` (les syllogismes sont des analogies conceptuelles, les tables
 * de vérité relèvent du raisonnement séquentiel), et `memory_speed` est scindée en
 * une aptitude propre, `memory`, la vitesse étant traitée séparément comme indicateur
 * de validité et non comme une aptitude.
 */
export type Aptitude = 'matrix' | 'series' | 'verbal' | 'spatial' | 'memory';

export const APTITUDES: readonly Aptitude[] = ['matrix', 'series', 'verbal', 'spatial', 'memory'];

/**
 * Taille de la banque d'items.
 *
 * Écrite en dur, et c'est délibéré : la landing affichait ce nombre en important la
 * banque entière, ce qui expédiait au navigateur les 120 énoncés AVEC leur corrigé,
 * pour afficher un chiffre dans une phrase. Un test vérifie que cette constante ne
 * s'écarte pas de la banque réelle.
 */
export const TAILLE_BANQUE = 120;

export const APTITUDE_LABEL: Record<Aptitude, string> = {
  matrix: 'Matrices logiques',
  series: 'Séries numériques',
  verbal: 'Analogies verbales',
  spatial: 'Rotation spatiale',
  memory: 'Mémoire de travail',
};

export const APTITUDE_DESCRIPTION: Record<Aptitude, string> = {
  matrix:
    "Déduire la règle qui gouverne un motif géométrique et l'appliquer à une case manquante, sans support linguistique.",
  series:
    'Identifier la loi de construction d\'une suite de nombres et prolonger la suite.',
  verbal:
    'Saisir la relation qui unit deux termes et la transposer à un autre couple.',
  spatial:
    "Manipuler mentalement une forme dans l'espace : rotation, symétrie, pliage.",
  memory:
    'Retenir une information puis la transformer en mémoire avant de répondre.',
};

/** Difficulté attribuée à la conception, de 1 (très facile) à 5 (très difficile). */
export type DesignDifficulty = 1 | 2 | 3 | 4 | 5;

/**
 * Paramètres d'item du modèle 3PL.
 *
 * - `a` : pouvoir discriminant (pente). Plus il est élevé, plus l'item sépare
 *   nettement deux niveaux d'aptitude voisins.
 * - `b` : difficulté, sur la même échelle que θ (centrée 0, écart-type 1).
 * - `c` : asymptote basse, dite pseudo-chance. C'est la probabilité de réussite d'un
 *   candidat d'aptitude arbitrairement faible, donc `1 / nombre d'options` pour un QCM.
 */
export interface ItemParameters {
  a: number;
  b: number;
  c: number;
}

export type CalibrationSource = 'design' | 'empirical';

export interface ItemCalibration {
  /** `design` : paramètres posés a priori. `empirical` : recalculés sur les passations. */
  source: CalibrationSource;
  /** Nombre de réponses ayant servi au calcul. 0 tant que l'item n'est pas calibré. */
  responseCount: number;
  /** ISO 8601, ou null si jamais recalibré. */
  updatedAt: string | null;
}

/**
 * Un item de la banque.
 *
 * `visual` et `options` sont exclusifs : un item est soit une matrice/figure rendue en
 * SVG dont les réponses sont des figures, soit un énoncé textuel à options textuelles.
 */
export interface IQItem {
  id: string;
  aptitude: Aptitude;
  designDifficulty: DesignDifficulty;
  params: ItemParameters;
  calibration: ItemCalibration;
  prompt: string;
  /** Options textuelles. Absent si l'item est visuel. */
  options?: string[];
  /** Données de rendu SVG. Absent si l'item est textuel. */
  visual?: MatrixItemData;
  correctIndex: number;
  explanation: string;
  reasoning: string[];
  /** Temps de résolution attendu, en secondes. Sert à la détection des réponses aberrantes. */
  expectedSeconds: number;
}

/** Une réponse enregistrée. C'est l'unité de stockage et la matière de la recalibration. */
export interface ItemResponse {
  itemId: string;
  /** Index choisi, ou -1 si l'item a été laissé sans réponse. */
  selectedIndex: number;
  correct: boolean;
  responseSeconds: number;
}

export interface SessionRecord {
  sessionId: string;
  /** ISO 8601. */
  startedAt: string;
  finishedAt: string;
  responses: ItemResponse[];
}

/** Estimation d'aptitude issue du modèle. */
export interface AbilityEstimate {
  /** θ, échelle centrée 0 / écart-type 1. */
  theta: number;
  /** Erreur type de l'estimation, sur l'échelle de θ. */
  standardError: number;
  /** Nombre d'items ayant contribué. */
  itemCount: number;
}

/** Estimation projetée sur l'échelle usuelle moyenne 100 / écart-type 15. */
export interface ScaledScore {
  point: number;
  lower95: number;
  upper95: number;
}

export type ValidityVerdict = 'ok' | 'low_precision' | 'not_interpretable';

export interface ValidityAssessment {
  verdict: ValidityVerdict;
  /** Nombre de réponses données trop vite pour être réfléchies. */
  aberrantCount: number;
  aberrantItemIds: string[];
  /** Réponses correctes observées, et ce qu'un pur hasard produirait en moyenne. */
  correctCount: number;
  expectedByChance: number;
  /**
   * p-value d'un test binomial unilatéral : « ce score est-il supérieur au hasard ? ».
   * Une valeur élevée signifie que le profil ne se distingue pas du hasard.
   */
  aboveChanceP: number;
  /** Message destiné à l'utilisateur, en français, factuel. */
  message: string | null;
}

/** Référentiel de comparaison servant au calcul du percentile. */
export interface NormReference {
  /** `prior` : distribution théorique. `empirical` : passations réellement enregistrées. */
  source: 'prior' | 'empirical';
  /** Effectif du référentiel. 0 pour `prior`. */
  populationSize: number;
  /** Phrase nommant explicitement la population, affichée dans le rapport. */
  label: string;
}

export interface AptitudeResult {
  aptitude: Aptitude;
  label: string;
  description: string;
  estimate: AbilityEstimate;
  scaled: ScaledScore;
  correctCount: number;
  itemCount: number;
  /** Position sur 0–100 pour le radar. Dérivée de θ, bornée. */
  radarValue: number;
}

export interface IQReport {
  sessionId: string;
  createdAt: string;
  candidateName: string | null;
  overall: AbilityEstimate;
  scaled: ScaledScore;
  percentile: number | null;
  norm: NormReference;
  aptitudes: AptitudeResult[];
  strengths: Aptitude[];
  weaknesses: Aptitude[];
  validity: ValidityAssessment;
  totalSeconds: number;
  itemCount: number;
  correctCount: number;
  responses: ItemResponse[];
}
