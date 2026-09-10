/**
 * Types de description des figures rendues en SVG par `MatrixRenderer`.
 *
 * Ils décrivent une géométrie, jamais une identité visuelle : aucune couleur n'y est
 * imposée, le rendu retombe sur `currentColor` et hérite donc du thème.
 */

export interface MatrixCellShape {
  type: 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'line' | 'dots' | 'polygon';
  color?: string;
  fill?: string;
  stroke?: string;
  rotation?: number;
  count?: number;
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  /** 1 à 5. Correspond à des rayons de 8, 14, 20, 28 et 36 unités SVG. */
  size?: number;
  innerShape?: string;
  pattern?: string;
}

export interface MatrixCell {
  id: string;
  shapes: MatrixCellShape[];
  customSvg?: string;
  text?: string;
}

export interface MatrixItemData {
  type: 'grid' | 'sequence' | 'fold' | 'analogy';
  gridSize?: 2 | 3;
  /** Cases de la grille ; la dernière porte `text: '?'`. */
  cells: MatrixCell[];
  options: MatrixCell[];
}
