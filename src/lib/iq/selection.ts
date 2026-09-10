import { APTITUDES } from './types';
import type { Aptitude, DesignDifficulty, IQItem } from './types';

/** Nombre d'items servis par passation, par défaut. */
export const DEFAULT_SESSION_LENGTH = 35;

/** Plafond d'items partagés entre deux passations consécutives, exprimé en proportion. */
export const MAX_OVERLAP_RATIO = 0.2;

const DIFFICULTIES: DesignDifficulty[] = [1, 2, 3, 4, 5];

export interface SelectionOptions {
  /** Longueur de la passation. Le cahier des charges impose entre 30 et 40 items. */
  count?: number;
  /** Items déjà vus lors des passations récentes, à éviter en priorité. */
  excludeIds?: Iterable<string>;
  /** Source d'aléa injectable, pour rendre les tests déterministes. */
  rng?: () => number;
}

/** Mélange de Fisher-Yates, uniforme — contrairement à `sort(() => 0.5 - Math.random())`. */
export function shuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Répartit `total` prises sur les cinq niveaux de difficulté, aussi également que
 * possible, en commençant par le milieu de l'échelle : les items de difficulté moyenne
 * sont ceux qui informent le plus sur un candidat dont on ne sait encore rien.
 */
function difficultyPlan(total: number): DesignDifficulty[] {
  const plan: DesignDifficulty[] = [];
  const order: DesignDifficulty[] = [3, 2, 4, 1, 5];
  let i = 0;
  while (plan.length < total) {
    plan.push(order[i % order.length]);
    i++;
  }
  return plan.sort((a, b) => a - b);
}

/**
 * Compose une passation équilibrée : autant d'items par aptitude, et à l'intérieur de
 * chaque aptitude une répartition sur les cinq niveaux de difficulté.
 *
 * Les items passés dans `excludeIds` — ceux des passations précédentes — ne sont
 * repris que s'il devient impossible de faire autrement. Avec 24 items par aptitude et
 * 7 servis, trois passations consécutives peuvent être entièrement disjointes.
 */
export function selectSession(bank: readonly IQItem[], options: SelectionOptions = {}): IQItem[] {
  const count = options.count ?? DEFAULT_SESSION_LENGTH;
  const rng = options.rng ?? Math.random;
  const excluded = new Set(options.excludeIds ?? []);

  const perAptitude = Math.floor(count / APTITUDES.length);
  const remainder = count - perAptitude * APTITUDES.length;

  const byAptitude = new Map<Aptitude, IQItem[]>();
  for (const aptitude of APTITUDES) {
    byAptitude.set(
      aptitude,
      bank.filter((item) => item.aptitude === aptitude)
    );
  }

  // Les aptitudes qui reçoivent un item supplémentaire changent d'une passation à l'autre.
  const bonusAptitudes = new Set(shuffle(APTITUDES, rng).slice(0, remainder));

  const chosen: IQItem[] = [];
  const used = new Set<string>();

  for (const aptitude of APTITUDES) {
    const pool = byAptitude.get(aptitude) ?? [];
    const target = perAptitude + (bonusAptitudes.has(aptitude) ? 1 : 0);

    for (const difficulty of difficultyPlan(target)) {
      const item = pickOne(pool, difficulty, used, excluded, rng);
      if (item) {
        chosen.push(item);
        used.add(item.id);
      }
    }
  }

  // Difficulté croissante, ordre aléatoire à difficulté égale : la montée en charge
  // évite de décourager sur les premiers items, le mélange évite un ordre prévisible.
  const grouped = new Map<DesignDifficulty, IQItem[]>();
  for (const item of chosen) {
    const list = grouped.get(item.designDifficulty) ?? [];
    list.push(item);
    grouped.set(item.designDifficulty, list);
  }

  return DIFFICULTIES.flatMap((d) => shuffle(grouped.get(d) ?? [], rng));
}

/**
 * Choisit un item d'une difficulté donnée, en élargissant la recherche aux difficultés
 * voisines si nécessaire, et en n'acceptant un item déjà vu qu'en dernier recours.
 */
function pickOne(
  pool: readonly IQItem[],
  wanted: DesignDifficulty,
  used: Set<string>,
  excluded: Set<string>,
  rng: () => number
): IQItem | null {
  // Difficultés candidates, de la plus proche à la plus éloignée de celle visée.
  const byDistance = [...DIFFICULTIES].sort(
    (a, b) => Math.abs(a - wanted) - Math.abs(b - wanted)
  );

  for (const preferUnseen of [true, false]) {
    for (const difficulty of byDistance) {
      const candidates = pool.filter(
        (item) =>
          item.designDifficulty === difficulty &&
          !used.has(item.id) &&
          (!preferUnseen || !excluded.has(item.id))
      );
      if (candidates.length > 0) {
        return shuffle(candidates, rng)[0];
      }
    }
  }

  return null;
}

/** Proportion d'items communs à deux passations. Sert au contrôle d'exposition. */
export function overlapRatio(a: readonly IQItem[], b: readonly IQItem[]): number {
  if (a.length === 0) return 0;
  const idsB = new Set(b.map((item) => item.id));
  const shared = a.filter((item) => idsB.has(item.id)).length;
  return shared / a.length;
}
