import { describe, expect, it } from 'vitest';
import { itemBank } from '../../../data/iq';
import { estimateAbility, probability, probabilityOfScoreByChance } from '../irt';
import { selectSession, overlapRatio, MAX_OVERLAP_RATIO, DEFAULT_SESSION_LENGTH } from '../selection';
import { buildReport } from '../score';
import { SCALE_MEAN, toScaledScore } from '../scale';
import { APTITUDES } from '../types';
import type { IQItem, ItemResponse } from '../types';

/** Générateur pseudo-aléatoire déterministe, pour des tests reproductibles. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Simule les réponses d'un candidat d'aptitude vraie `theta`. */
function simulate(items: readonly IQItem[], theta: number, rng: () => number): ItemResponse[] {
  return items.map((item) => {
    const p = probability(theta, item.params);
    const correct = rng() < p;
    return {
      itemId: item.id,
      selectedIndex: correct ? item.correctIndex : (item.correctIndex + 1) % 5,
      correct,
      responseSeconds: item.expectedSeconds,
    };
  });
}

/** Simule un candidat qui répond au hasard, sans lire les énoncés. */
function simulateRandomResponder(items: readonly IQItem[], rng: () => number): ItemResponse[] {
  return items.map((item) => {
    const choice = Math.floor(rng() * 5);
    return {
      itemId: item.id,
      selectedIndex: choice,
      correct: choice === item.correctIndex,
      responseSeconds: item.expectedSeconds,
    };
  });
}

describe('modèle 3PL', () => {
  const params = { a: 1, b: 0, c: 0.2 };

  it('est borné par la pseudo-chance et par 1', () => {
    expect(probability(-6, params)).toBeGreaterThanOrEqual(0.2);
    expect(probability(-6, params)).toBeLessThan(0.21);
    expect(probability(6, params)).toBeGreaterThan(0.99);
    expect(probability(6, params)).toBeLessThanOrEqual(1);
  });

  it('est croissant avec l\'aptitude', () => {
    for (let t = -3; t < 3; t += 0.5) {
      expect(probability(t + 0.5, params)).toBeGreaterThan(probability(t, params));
    }
  });

  it('vaut le point milieu entre c et 1 lorsque θ égale la difficulté', () => {
    expect(probability(0, params)).toBeCloseTo(0.2 + 0.8 / 2, 6);
  });
});

describe('estimation de θ', () => {
  it('renvoie l\'a priori en l\'absence de réponse', () => {
    const e = estimateAbility([]);
    expect(e.theta).toBe(0);
    expect(e.standardError).toBe(1);
  });

  it('place très haut un sans-faute et très bas un zéro pointé', () => {
    const params = { a: 1, b: 0, c: 0.2 };
    const allRight = estimateAbility(Array.from({ length: 30 }, () => ({ params, correct: true })));
    const allWrong = estimateAbility(Array.from({ length: 30 }, () => ({ params, correct: false })));

    expect(allRight.theta).toBeGreaterThan(1.5);
    expect(allWrong.theta).toBeLessThan(-1.5);
    // L'EAP reste fini là où le maximum de vraisemblance divergerait.
    expect(Number.isFinite(allRight.theta)).toBe(true);
    expect(Number.isFinite(allWrong.theta)).toBe(true);
  });

  it('retrouve l\'aptitude vraie d\'un candidat simulé', () => {
    const rng = mulberry32(20260909);
    for (const trueTheta of [-1, 0, 1]) {
      const estimates: number[] = [];
      for (let i = 0; i < 300; i++) {
        const items = selectSession(itemBank, { rng });
        estimates.push(estimateAbility(
          simulate(items, trueTheta, rng).map((r) => ({
            params: itemBank.find((it) => it.id === r.itemId)!.params,
            correct: r.correct,
          }))
        ).theta);
      }
      const mean = estimates.reduce((s, v) => s + v, 0) / estimates.length;
      // L'EAP contracte légèrement vers l'a priori : l'écart attendu croît avec |θ|.
      expect(Math.abs(mean - trueTheta)).toBeLessThan(0.35);
    }
  });
});

describe('composition de la passation', () => {
  it('sert le nombre d\'items demandé', () => {
    const items = selectSession(itemBank, { rng: mulberry32(1) });
    expect(items.length).toBe(DEFAULT_SESSION_LENGTH);
  });

  it('équilibre les aptitudes', () => {
    const items = selectSession(itemBank, { rng: mulberry32(2) });
    for (const aptitude of APTITUDES) {
      const n = items.filter((i) => i.aptitude === aptitude).length;
      expect(n, `aptitude ${aptitude}`).toBe(DEFAULT_SESSION_LENGTH / APTITUDES.length);
    }
  });

  it('ne sert jamais deux fois le même item dans une passation', () => {
    const items = selectSession(itemBank, { rng: mulberry32(3) });
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('présente les items par difficulté croissante', () => {
    const items = selectSession(itemBank, { rng: mulberry32(4) });
    for (let i = 1; i < items.length; i++) {
      expect(items[i].designDifficulty).toBeGreaterThanOrEqual(items[i - 1].designDifficulty);
    }
  });

  it('partage moins de 20 % des items entre deux passations consécutives', () => {
    const rng = mulberry32(5);
    for (let trial = 0; trial < 50; trial++) {
      const first = selectSession(itemBank, { rng });
      const second = selectSession(itemBank, {
        rng,
        excludeIds: first.map((i) => i.id),
      });
      expect(overlapRatio(first, second)).toBeLessThan(MAX_OVERLAP_RATIO);
    }
  });
});

describe('test binomial contre le hasard', () => {
  it('donne une p-value élevée pour un score au niveau du hasard', () => {
    expect(probabilityOfScoreByChance(7, 35, 0.2)).toBeGreaterThan(0.05);
  });

  it('donne une p-value faible pour un score nettement supérieur', () => {
    expect(probabilityOfScoreByChance(20, 35, 0.2)).toBeLessThan(0.001);
  });
});

describe('rapport complet', () => {
  const rng = mulberry32(424242);

  it('refuse de produire un score pour un candidat répondant au hasard', () => {
    let notInterpretable = 0;
    const trials = 200;

    for (let i = 0; i < trials; i++) {
      const items = selectSession(itemBank, { rng });
      const responses = simulateRandomResponder(items, rng);
      const report = buildReport({ sessionId: `s${i}`, items, responses });
      if (report.validity.verdict === 'not_interpretable') notInterpretable++;
    }

    // Le seuil du test binomial est fixé à 5 % : on attend donc que la très grande
    // majorité des tirages au hasard soient refusés, sans exiger 100 %.
    expect(notInterpretable / trials).toBeGreaterThan(0.85);
  });

  it('ne renvoie aucun percentile lorsque le profil est inexploitable', () => {
    const items = selectSession(itemBank, { rng });
    const responses = items.map((item) => ({
      itemId: item.id,
      selectedIndex: (item.correctIndex + 1) % 5,
      correct: false,
      responseSeconds: item.expectedSeconds,
    }));
    const report = buildReport({ sessionId: 'zero', items, responses });
    expect(report.validity.verdict).toBe('not_interpretable');
    expect(report.percentile).toBeNull();
  });

  it('produit un score et un intervalle exploitables pour un candidat moyen', () => {
    const items = selectSession(itemBank, { rng });
    const responses = simulate(items, 0.3, rng);
    const report = buildReport({ sessionId: 'moyen', items, responses });

    expect(report.validity.verdict).not.toBe('not_interpretable');
    expect(report.scaled.lower95).toBeLessThan(report.scaled.point);
    expect(report.scaled.upper95).toBeGreaterThan(report.scaled.point);
    expect(report.percentile).not.toBeNull();
    expect(report.aptitudes).toHaveLength(APTITUDES.length);
    for (const a of report.aptitudes) {
      expect(a.itemCount).toBeGreaterThan(0);
    }
  });

  it('signale les réponses expédiées', () => {
    const items = selectSession(itemBank, { rng });
    const responses = simulate(items, 0.5, rng).map((r, i) => ({
      ...r,
      responseSeconds: i < 20 ? 1 : r.responseSeconds,
    }));
    const report = buildReport({ sessionId: 'rapide', items, responses });
    expect(report.validity.aberrantCount).toBeGreaterThanOrEqual(20);
    expect(report.validity.verdict).toBe('not_interpretable');
  });

  it('ne déclare que rarement une force à un candidat rigoureusement moyen', () => {
    // Mesuré, pas supposé : un candidat d'aptitude vraie nulle ne doit pas se voir
    // attribuer de point fort. Le seuil porte sur la moyenne, un tirage isolé pouvant
    // toujours produire un signalement.
    const local = mulberry32(777);
    const trials = 300;
    let flags = 0;

    for (let i = 0; i < trials; i++) {
      const items = selectSession(itemBank, { rng: local });
      const report = buildReport({
        sessionId: `flat${i}`,
        items,
        responses: simulate(items, 0, local),
      });
      flags += report.strengths.length + report.weaknesses.length;
    }

    expect(flags / trials).toBeLessThan(0.5);
  });
});

describe('comportement face aux réponses au hasard', () => {
  // Ces trois tests documentent le comportement réellement observé du modèle, qui est
  // aussi l'argument du désaccord consigné dans docs/SCORING.md : un répondeur au
  // hasard n'obtient PAS un score centré sur 100.
  const N = 300;

  function simulateRandomBatch(seed: number) {
    const local = mulberry32(seed);
    const points: number[] = [];
    const widths: number[] = [];
    let refused = 0;

    for (let i = 0; i < N; i++) {
      const items = selectSession(itemBank, { rng: local });
      const report = buildReport({
        sessionId: `h${i}`,
        items,
        responses: simulateRandomResponder(items, local),
      });
      points.push(report.scaled.point);
      widths.push(report.scaled.upper95 - report.scaled.lower95);
      if (report.validity.verdict === 'not_interpretable') refused++;
    }

    return {
      meanPoint: points.reduce((s, v) => s + v, 0) / N,
      meanWidth: widths.reduce((s, v) => s + v, 0) / N,
      refusalRate: refused / N,
    };
  }

  it('refuse de restituer un score dans la grande majorité des cas', () => {
    expect(simulateRandomBatch(31337).refusalRate).toBeGreaterThan(0.9);
  });

  it('place l\'estimation brute nettement sous la moyenne, jamais autour de 100', () => {
    const { meanPoint } = simulateRandomBatch(31338);
    // Le modèle lit 20 % de réussite pour ce qu'elle est : le plancher de la chance.
    expect(meanPoint).toBeLessThan(80);
    expect(meanPoint).toBeGreaterThan(50);
  });

  it('assortit cette estimation d\'un intervalle large', () => {
    const { meanWidth } = simulateRandomBatch(31339);
    expect(meanWidth).toBeGreaterThan(20);
  });
});

describe('échelle de restitution', () => {
  it('centre l\'a priori sur 100', () => {
    expect(toScaledScore({ theta: 0, standardError: 0.3, itemCount: 35 }).point).toBe(SCALE_MEAN);
  });

  it('élargit l\'intervalle quand la mesure est moins précise', () => {
    const precis = toScaledScore({ theta: 0, standardError: 0.25, itemCount: 40 });
    const flou = toScaledScore({ theta: 0, standardError: 0.6, itemCount: 10 });
    expect(flou.upper95 - flou.lower95).toBeGreaterThan(precis.upper95 - precis.lower95);
  });
});
