import { describe, expect, it } from 'vitest';
import { itemBank } from '../../../data/iq';
import { OPTIONS_PER_ITEM } from '../../../data/iq/_builders';
import { APTITUDES } from '../types';
import type { Aptitude, DesignDifficulty } from '../types';

describe('banque d\'items', () => {
  it('compte au moins 120 items', () => {
    expect(itemBank.length).toBeGreaterThanOrEqual(120);
  });

  it('couvre les cinq aptitudes de manière équilibrée', () => {
    for (const aptitude of APTITUDES) {
      const count = itemBank.filter((i) => i.aptitude === aptitude).length;
      expect(count, `aptitude ${aptitude}`).toBeGreaterThanOrEqual(24);
    }
  });

  it('n\'a aucun identifiant en double', () => {
    const ids = itemBank.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('propose exactement cinq options par item, avec une bonne réponse valide', () => {
    for (const item of itemBank) {
      const optionCount = item.options?.length ?? item.visual?.options.length ?? 0;
      expect(optionCount, `item ${item.id}`).toBe(OPTIONS_PER_ITEM);
      expect(item.correctIndex, `item ${item.id}`).toBeGreaterThanOrEqual(0);
      expect(item.correctIndex, `item ${item.id}`).toBeLessThan(optionCount);
    }
  });

  it('fixe la pseudo-chance à 1/5 sur tous les items', () => {
    for (const item of itemBank) {
      expect(item.params.c, `item ${item.id}`).toBeCloseTo(0.2, 10);
    }
  });

  it('est soit textuel soit visuel, jamais les deux ni aucun', () => {
    for (const item of itemBank) {
      const hasText = Boolean(item.options);
      const hasVisual = Boolean(item.visual);
      expect(hasText !== hasVisual, `item ${item.id}`).toBe(true);
    }
  });

  it('couvre les cinq niveaux de difficulté dans chaque aptitude', () => {
    for (const aptitude of APTITUDES) {
      const levels = new Set<DesignDifficulty>(
        itemBank.filter((i) => i.aptitude === aptitude).map((i) => i.designDifficulty)
      );
      expect(levels.size, `aptitude ${aptitude}`).toBe(5);
    }
  });

  it('ne laisse aucun item sans explication ni raisonnement', () => {
    for (const item of itemBank) {
      expect(item.explanation.length, `item ${item.id}`).toBeGreaterThan(20);
      expect(item.reasoning.length, `item ${item.id}`).toBeGreaterThan(0);
      expect(item.expectedSeconds, `item ${item.id}`).toBeGreaterThan(0);
    }
  });

  it('ne place pas systématiquement la bonne réponse au même rang', () => {
    // Un test dont la bonne réponse serait toujours au même endroit serait
    // réussissable sans le résoudre.
    const counts = new Map<number, number>();
    for (const item of itemBank) {
      counts.set(item.correctIndex, (counts.get(item.correctIndex) ?? 0) + 1);
    }
    const max = Math.max(...counts.values());
    expect(counts.size).toBe(OPTIONS_PER_ITEM);
    expect(max / itemBank.length).toBeLessThan(0.45);
  });

  it('ne propose jamais deux options visuelles identiques', () => {
    for (const item of itemBank) {
      if (!item.visual) continue;
      const signatures = item.visual.options.map((o) => JSON.stringify(o.shapes));
      expect(new Set(signatures).size, `item ${item.id}`).toBe(signatures.length);
    }
  });

  it('ne propose jamais deux options textuelles identiques', () => {
    for (const item of itemBank) {
      if (!item.options) continue;
      const normalised = item.options.map((o) => o.trim().toLowerCase());
      expect(new Set(normalised).size, `item ${item.id}`).toBe(normalised.length);
    }
  });
});

describe('répartition des aptitudes', () => {
  it('associe chaque item à une aptitude connue', () => {
    const known = new Set<Aptitude>(APTITUDES);
    for (const item of itemBank) {
      expect(known.has(item.aptitude), `item ${item.id}`).toBe(true);
    }
  });
});
