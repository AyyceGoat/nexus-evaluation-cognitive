import { matrixItems } from './matrix';
import { seriesItems } from './series';
import { verbalItems } from './verbal';
import { spatialItems } from './spatial';
import { memoryItems } from './memory';
import type { IQItem } from '../../lib/iq/types';

/**
 * Banque d'items complète : 24 items par aptitude, cinq aptitudes, soit 120 items.
 *
 * L'intégrité de la banque (identifiants uniques, cinq options par item, indice de
 * bonne réponse valide, répartition des difficultés) est vérifiée par les tests, pas
 * seulement par convention.
 */
export const itemBank: readonly IQItem[] = Object.freeze([
  ...matrixItems,
  ...seriesItems,
  ...verbalItems,
  ...spatialItems,
  ...memoryItems,
]);

export const itemsById: ReadonlyMap<string, IQItem> = new Map(
  itemBank.map((item) => [item.id, item])
);

export { matrixItems, seriesItems, verbalItems, spatialItems, memoryItems };
