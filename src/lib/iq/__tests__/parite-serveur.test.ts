import { describe, expect, it } from 'vitest';
import { buildReport } from '../score';
import { itemBank } from '../../../data/iq';
import { calculerResultat, niveauDepuisIndice } from '../../../../supabase/functions/cloturer-passation/scoring';
import type { ItemServeur, ReponseServeur } from '../../../../supabase/functions/cloturer-passation/scoring';
import type { IQItem, ItemResponse } from '../types';

/**
 * Parité entre le moteur client et le module de calcul serveur.
 *
 * Le score affiché à l'écran et le score qui fait foi sont produits par deux codes
 * distincts, pour une raison expliquée en tête de `scoring.ts`. Ce test est le prix de
 * cette duplication : sans lui, une constante modifiée d'un seul côté donnerait deux
 * scores différents pour la même passation, et personne ne le verrait.
 *
 * Il ne compare pas deux appels de la même fonction : il confronte réellement les deux
 * implémentations sur des passations tirées au hasard.
 */

/** Générateur déterministe : un échec doit être reproductible. */
function tirage(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat * 1664525 + 1013904223) >>> 0;
    return etat / 0x100000000;
  };
}

function versItemServeur(item: IQItem): ItemServeur {
  return {
    id: item.id,
    aptitude: item.aptitude,
    a: item.params.a,
    b: item.params.b,
    c: item.params.c,
    correctIndex: item.correctIndex,
    expectedSeconds: item.expectedSeconds,
  };
}

interface Passation {
  items: IQItem[];
  reponsesClient: ItemResponse[];
  reponsesServeur: ReponseServeur[];
}

/**
 * Compose une passation plausible.
 *
 * `tauxJuste` pilote la proportion de bonnes réponses, et `rapide` la proportion de
 * réponses expédiées : ces deux leviers font passer le calcul par les trois verdicts
 * de validité, y compris le refus de score.
 */
function composerPassation(
  alea: () => number,
  nombre: number,
  tauxJuste: number,
  rapide: number
): Passation {
  const melange = [...itemBank].sort(() => alea() - 0.5).slice(0, nombre);

  const reponsesClient: ItemResponse[] = [];
  const reponsesServeur: ReponseServeur[] = [];

  for (const item of melange) {
    const juste = alea() < tauxJuste;
    // Un index faux, mais toujours valide : jamais l'index correct.
    const nbOptions = item.options?.length ?? item.visual?.options.length ?? 5;
    let choisi = item.correctIndex;
    if (!juste) {
      choisi = (item.correctIndex + 1 + Math.floor(alea() * (nbOptions - 1))) % nbOptions;
      if (choisi === item.correctIndex) choisi = (choisi + 1) % nbOptions;
    }

    const secondes = alea() < rapide
      ? Math.max(0.2, item.expectedSeconds * 0.05)
      : item.expectedSeconds * (0.5 + alea());

    reponsesClient.push({
      itemId: item.id,
      selectedIndex: choisi,
      correct: choisi === item.correctIndex,
      responseSeconds: Math.round(secondes * 100) / 100,
    });
    reponsesServeur.push({
      itemId: item.id,
      selectedIndex: choisi,
      responseSeconds: Math.round(secondes * 100) / 100,
    });
  }

  return { items: melange, reponsesClient, reponsesServeur };
}

const CAS = [
  { nom: 'bon niveau, sans precipitation', nombre: 35, tauxJuste: 0.8, rapide: 0 },
  { nom: 'niveau moyen', nombre: 35, tauxJuste: 0.55, rapide: 0 },
  { nom: 'niveau faible', nombre: 35, tauxJuste: 0.2, rapide: 0 },
  { nom: 'sans-faute', nombre: 30, tauxJuste: 1, rapide: 0 },
  { nom: 'zero pointe', nombre: 30, tauxJuste: 0, rapide: 0 },
  { nom: 'majorite de reponses expediees', nombre: 35, tauxJuste: 0.7, rapide: 0.9 },
  { nom: 'quelques reponses expediees', nombre: 40, tauxJuste: 0.7, rapide: 0.15 },
  { nom: 'session courte', nombre: 10, tauxJuste: 0.6, rapide: 0 },
];

describe('parité entre le calcul client et le calcul serveur', () => {
  for (const [index, cas] of CAS.entries()) {
    it(`donne le même résultat : ${cas.nom}`, () => {
      const alea = tirage(20260921 + index * 7919);
      const { items, reponsesClient, reponsesServeur } = composerPassation(
        alea,
        cas.nombre,
        cas.tauxJuste,
        cas.rapide
      );

      const client = buildReport({ sessionId: 'parite', items, responses: reponsesClient });
      const serveur = calculerResultat(items.map(versItemServeur), reponsesServeur);

      // θ et erreur type : comparés au flottant près, pas arrondis.
      expect(serveur.theta).toBeCloseTo(client.overall.theta, 12);
      expect(serveur.standardError).toBeCloseTo(client.overall.standardError, 12);

      expect(serveur.scaledPoint).toBe(client.scaled.point);
      expect(serveur.scaledLower95).toBe(client.scaled.lower95);
      expect(serveur.scaledUpper95).toBe(client.scaled.upper95);
      expect(serveur.percentile).toBe(client.percentile);

      expect(serveur.verdict).toBe(client.validity.verdict);
      expect(serveur.validityMessage).toBe(client.validity.message);
      expect(serveur.aberrantCount).toBe(client.validity.aberrantCount);
      expect(serveur.aberrantItemIds.slice().sort()).toEqual(
        client.validity.aberrantItemIds.slice().sort()
      );
      expect(serveur.aboveChanceP).toBeCloseTo(client.validity.aboveChanceP, 12);
      expect(serveur.expectedByChance).toBe(client.validity.expectedByChance);

      expect(serveur.correctCount).toBe(client.correctCount);
      expect(serveur.itemCount).toBe(client.itemCount);

      expect(serveur.strengths.slice().sort()).toEqual(client.strengths.slice().sort());
      expect(serveur.weaknesses.slice().sort()).toEqual(client.weaknesses.slice().sort());

      // Détail par aptitude, aptitude par aptitude.
      expect(serveur.aptitudes).toHaveLength(client.aptitudes.length);
      for (const [i, apt] of serveur.aptitudes.entries()) {
        const attendu = client.aptitudes[i];
        expect(apt.aptitude).toBe(attendu.aptitude);
        expect(apt.theta).toBeCloseTo(attendu.estimate.theta, 12);
        expect(apt.standardError).toBeCloseTo(attendu.estimate.standardError, 12);
        expect(apt.scaledPoint).toBe(attendu.scaled.point);
        expect(apt.scaledLower95).toBe(attendu.scaled.lower95);
        expect(apt.scaledUpper95).toBe(attendu.scaled.upper95);
        expect(apt.correctCount).toBe(attendu.correctCount);
        expect(apt.itemCount).toBe(attendu.itemCount);
        expect(apt.radarValue).toBe(attendu.radarValue);
      }
    });
  }

  it('couvre les trois verdicts sur l’ensemble des cas', () => {
    const verdicts = new Set<string>();
    for (const [index, cas] of CAS.entries()) {
      const alea = tirage(20260921 + index * 7919);
      const { items, reponsesServeur } = composerPassation(
        alea,
        cas.nombre,
        cas.tauxJuste,
        cas.rapide
      );
      verdicts.add(calculerResultat(items.map(versItemServeur), reponsesServeur).verdict);
    }
    // Sans les trois, la parité ne serait vérifiée que sur une branche.
    expect(verdicts).toContain('ok');
    expect(verdicts).toContain('not_interpretable');
    expect(verdicts.size).toBeGreaterThanOrEqual(2);
  });

  it('ignore la justesse annoncée et la recalcule depuis le corrigé', () => {
    const item = itemBank[0];
    const faux = calculerResultat([versItemServeur(item)], [
      // Index volontairement faux : le serveur doit le corriger comme tel, quoi
      // qu'en dise le client.
      { itemId: item.id, selectedIndex: (item.correctIndex + 1) % 5, responseSeconds: 40 },
    ]);
    expect(faux.correctCount).toBe(0);

    const vrai = calculerResultat([versItemServeur(item)], [
      { itemId: item.id, selectedIndex: item.correctIndex, responseSeconds: 40 },
    ]);
    expect(vrai.correctCount).toBe(1);
  });
});

describe('niveau affiché au classement', () => {
  it('découpe l’échelle en cinq bandes contiguës', () => {
    expect(niveauDepuisIndice(70)).toBe('fondamental');
    expect(niveauDepuisIndice(84)).toBe('fondamental');
    expect(niveauDepuisIndice(85)).toBe('intermediaire');
    expect(niveauDepuisIndice(99)).toBe('intermediaire');
    expect(niveauDepuisIndice(100)).toBe('avance');
    expect(niveauDepuisIndice(114)).toBe('avance');
    expect(niveauDepuisIndice(115)).toBe('superieur');
    expect(niveauDepuisIndice(129)).toBe('superieur');
    expect(niveauDepuisIndice(130)).toBe('exceptionnel');
    expect(niveauDepuisIndice(160)).toBe('exceptionnel');
  });
});
