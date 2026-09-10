import type { MatrixCell, MatrixCellShape, MatrixItemData } from '../../types/matrix';
import { makeParams } from '../../lib/iq/irt';
import type { Aptitude, DesignDifficulty, IQItem } from '../../lib/iq/types';

/**
 * Tous les items de la banque proposent cinq options.
 *
 * Ce n'est pas un détail de présentation : le nombre d'options fixe la pseudo-chance
 * `c = 1/5 = 0,2` du modèle 3PL. Avec quatre options, un candidat répondant au hasard
 * réussit 25 % des items ; avec cinq, 20 %. Le modèle a besoin de connaître cette
 * valeur exactement, donc elle est imposée ici et vérifiée par les tests.
 */
export const OPTIONS_PER_ITEM = 5;

const UNCALIBRATED = {
  source: 'design' as const,
  responseCount: 0,
  updatedAt: null,
};

interface BaseItemConfig {
  id: string;
  difficulty: DesignDifficulty;
  prompt: string;
  correctIndex: number;
  explanation: string;
  reasoning: string[];
  expectedSeconds: number;
}

/** Construit un item à énoncé et options textuels. */
export function textItem(
  aptitude: Aptitude,
  config: BaseItemConfig & { options: string[] }
): IQItem {
  assertShape(config.id, config.options.length, config.correctIndex);
  return {
    id: config.id,
    aptitude,
    designDifficulty: config.difficulty,
    params: makeParams(config.difficulty, config.options.length),
    calibration: { ...UNCALIBRATED },
    prompt: config.prompt,
    options: config.options,
    correctIndex: config.correctIndex,
    explanation: config.explanation,
    reasoning: config.reasoning,
    expectedSeconds: config.expectedSeconds,
  };
}

/** Construit un item visuel rendu en SVG. */
export function visualItem(
  aptitude: Aptitude,
  config: BaseItemConfig & {
    kind: MatrixItemData['type'];
    gridSize?: 2 | 3;
    /** Cases affichées, hors case manquante. Chaque case est une liste de figures. */
    cells: MatrixCellShape[][];
    /** Cinq propositions, chacune une liste de figures. */
    options: MatrixCellShape[][];
  }
): IQItem {
  assertShape(config.id, config.options.length, config.correctIndex);

  const cells: MatrixCell[] = config.cells.map((shapes, i) => ({
    id: `${config.id}-c${i}`,
    shapes,
  }));
  // La dernière case de la grille est toujours l'inconnue.
  cells.push({ id: `${config.id}-q`, shapes: [], text: '?' });

  return {
    id: config.id,
    aptitude,
    designDifficulty: config.difficulty,
    params: makeParams(config.difficulty, config.options.length),
    calibration: { ...UNCALIBRATED },
    prompt: config.prompt,
    visual: {
      type: config.kind,
      gridSize: config.gridSize,
      cells,
      options: config.options.map((shapes, i) => ({
        id: `${config.id}-o${i}`,
        shapes,
      })),
    },
    correctIndex: config.correctIndex,
    explanation: config.explanation,
    reasoning: config.reasoning,
    expectedSeconds: config.expectedSeconds,
  };
}

function assertShape(id: string, optionCount: number, correctIndex: number): void {
  if (optionCount !== OPTIONS_PER_ITEM) {
    throw new Error(`Item ${id} : ${optionCount} options, ${OPTIONS_PER_ITEM} attendues.`);
  }
  if (correctIndex < 0 || correctIndex >= optionCount) {
    throw new Error(`Item ${id} : correctIndex ${correctIndex} hors bornes.`);
  }
}

// ── Raccourcis de figures ────────────────────────────────────────────────────
// Les figures n'imposent pas de couleur : `MatrixRenderer` retombe sur
// `currentColor`, donc la couleur vient du thème et non de la donnée.

/** `n` points disposés automatiquement par le moteur de rendu. */
export function dots(count: number): MatrixCellShape {
  return { type: 'dots', count };
}

/**
 * `n` traits parallèles, orientables.
 *
 * Un faisceau de traits est invariant par rotation de 180°. Les items de rotation
 * n'utilisent donc que des angles compris entre 0 et 150° : au-delà, deux figures
 * seraient indiscernables et l'item deviendrait ambigu.
 */
export function bars(count: number, rotation = 0, size = 2): MatrixCellShape {
  return { type: 'line', count, rotation, size };
}

export function circle(size: DesignDifficulty | number = 3, filled = false): MatrixCellShape {
  return { type: 'circle', size, fill: filled ? 'currentColor' : 'transparent' };
}

export function square(size: number = 3, filled = false): MatrixCellShape {
  return { type: 'square', size, fill: filled ? 'currentColor' : 'transparent' };
}

/**
 * Triangle non pivoté. La signature suit celle des autres formes — taille d'abord —
 * pour qu'un `triangle(2)` isolé signifie bien « petit triangle » et non « pivoté de
 * 2° ». Les items de rotation passent par `rotatedTriangle`.
 */
export function triangle(size = 3, filled = false): MatrixCellShape {
  return { type: 'triangle', size, fill: filled ? 'currentColor' : 'transparent' };
}

/** Triangle orienté. Un triangle se répète tous les 120° : au-delà, l'item devient ambigu. */
export function rotatedTriangle(rotation: number, size = 3, filled = false): MatrixCellShape {
  return { type: 'triangle', rotation, size, fill: filled ? 'currentColor' : 'transparent' };
}

export function diamond(size = 3, filled = false): MatrixCellShape {
  return { type: 'diamond', size, fill: filled ? 'currentColor' : 'transparent' };
}

export function star(size = 3, filled = false): MatrixCellShape {
  return { type: 'star', size, fill: filled ? 'currentColor' : 'transparent' };
}

export function cross(size = 3): MatrixCellShape {
  return { type: 'cross', size };
}
