import { describe, expect, it } from 'vitest';
import {
  AMORTISSEMENT,
  PAS_MAX,
  RAIDEUR,
  avancerRessort,
  facteurAmortissement,
  type EtatRessort,
} from '../ressort';

/** Simule `duree` secondes de suivi vers une cible fixe, à 60 images par seconde. */
function simuler(cible: number, duree: number, depart: EtatRessort = { position: 0, vitesse: 0 }) {
  const dt = 1 / 60;
  const trace: number[] = [];
  let etat = depart;
  for (let t = 0; t < duree; t += dt) {
    etat = avancerRessort(etat, cible, dt);
    trace.push(etat.position);
  }
  return { etat, trace };
}

/** Retard maximal en régime établi, pour une cible sinusoïdale de pulsation donnée. */
function retardMaximalPour(pulsation: number): number {
  const dt = 1 / 60;
  let etat: EtatRessort = { position: 0, vitesse: 0 };
  let retard = 0;

  for (let i = 0; i < 240; i++) {
    const cible = Math.sin(i * dt * pulsation);
    etat = avancerRessort(etat, cible, dt);
    // On ignore le régime transitoire du départ.
    if (i > 60) retard = Math.max(retard, Math.abs(cible - etat.position));
  }
  return retard;
}

describe('ressort de la tête', () => {
  it('est sous-amorti, donc capable de dépasser', () => {
    const zeta = facteurAmortissement();
    expect(zeta).toBeLessThan(1);
    expect(zeta).toBeGreaterThan(0.5);
    expect(zeta).toBeCloseTo(AMORTISSEMENT / (2 * Math.sqrt(RAIDEUR)), 10);
  });

  it('dépasse la cible sur un mouvement rapide, puis se stabilise', () => {
    const { trace, etat } = simuler(1, 3);

    // Dépassement : la trajectoire passe au-dessus de la cible.
    expect(Math.max(...trace)).toBeGreaterThan(1);
    // Léger : pas un rebond de ressort de porte.
    expect(Math.max(...trace)).toBeLessThan(1.15);
    // Stabilisation : à trois secondes, on est sur la cible et à l'arrêt.
    expect(etat.position).toBeCloseTo(1, 2);
    expect(Math.abs(etat.vitesse)).toBeLessThan(0.01);
  });

  it('ne saute jamais : le premier pas reste une petite fraction du trajet', () => {
    const { trace } = simuler(1, 0.05);
    // Un « snap » mettrait la tête à destination en une image.
    //
    // La borne est passée de 5 % à 12 % en même temps que la raideur : à k = 210,
    // un pas de 50 ms couvre 5,8 % du trajet, contre 1,7 % à k = 60. C'est le
    // réglage voulu — le suivi traînait — et la propriété vérifiée reste la même :
    // aucune image ne doit emporter une part notable du chemin, sinon le mouvement
    // se lit comme un saut et non comme un suivi.
    expect(trace[0]).toBeLessThan(0.12);
  });

  it('revient à la pose neutre quand la cible revient à zéro', () => {
    const { etat: apresSuivi } = simuler(1, 2);
    const { etat: apresRetour } = simuler(0, 3, apresSuivi);
    expect(apresRetour.position).toBeCloseTo(0, 2);
  });

  it('reste stable malgré un pas de temps aberrant', () => {
    // Onglet remis au premier plan après une minute : `delta` vaut 60 secondes.
    let etat: EtatRessort = { position: 0, vitesse: 0 };
    for (let i = 0; i < 10; i++) {
      etat = avancerRessort(etat, 1, 60);
    }
    expect(Number.isFinite(etat.position)).toBe(true);
    // Le plafonnement du pas empêche la divergence.
    expect(Math.abs(etat.position)).toBeLessThan(2);
  });

  it('plafonne le pas de temps à 1/30 de seconde', () => {
    const grandPas = avancerRessort({ position: 0, vitesse: 0 }, 1, 5);
    const pasPlafonne = avancerRessort({ position: 0, vitesse: 0 }, 1, PAS_MAX);
    expect(grandPas.position).toBeCloseTo(pasPlafonne.position, 12);
  });

  it('ignore un pas de temps négatif', () => {
    const etat = avancerRessort({ position: 0.4, vitesse: 0 }, 1, -1);
    expect(etat.position).toBe(0.4);
  });

  it('suit une cible mobile avec un retard perceptible mais borné', () => {
    // Balayage de souris réaliste : environ 2 rad/s. La pulsation propre du ressort
    // vaut √210 ≈ 14,5 rad/s, donc le suivi est net à cette vitesse tout en gardant du
    // retard — c'est le comportement voulu.
    const retard = retardMaximalPour(2);

    // Il y a bien un retard : le suivi n'est pas collé à la souris.
    expect(retard).toBeGreaterThan(0.02);
    // Mais il reste faible aux vitesses usuelles.
    expect(retard).toBeLessThan(0.35);
  });

  it('accroît son retard avec la vitesse de la cible, sans décrocher', () => {
    // Valeurs mesurées sur ce ressort, consignées pour détecter une dérive plutôt que
    // pour imposer un seuil arbitraire : le retard croît avec la fréquence, ce qui est
    // exactement ce qu'on attend d'une inertie.
    const lent = retardMaximalPour(1);
    const moyen = retardMaximalPour(2);
    const rapide = retardMaximalPour(4);

    expect(lent).toBeLessThan(moyen);
    expect(moyen).toBeLessThan(rapide);
    // Même au plus rapide, la tête reste dans l'amplitude de la cible : elle traîne,
    // elle ne part pas ailleurs.
    expect(rapide).toBeLessThan(1);
  });
});

/**
 * Temps de stabilisation : la preuve que le suivi ne traîne plus.
 *
 * Elle est déterministe, donc indépendante du matériel. C'est important : la mesure
 * d'images par seconde, elle, est plafonnée par le rendu logiciel de la machine de
 * développement et ne dit rien du ressenti sur un vrai GPU. Le reproche « il traîne »
 * portait sur CE chiffre, et celui-là se calcule.
 */
describe('franchise du suivi', () => {
  /** Instant où la position entre définitivement dans ±2 % de la cible. */
  function tempsDeStabilisation(cible: number): number {
    const dt = 1 / 60;
    let etat: EtatRessort = { position: 0, vitesse: 0 };
    let dernierEcart = 0;

    for (let i = 0; i < 60 * 5; i++) {
      etat = avancerRessort(etat, cible, dt);
      if (Math.abs(etat.position - cible) > 0.02 * Math.abs(cible)) {
        dernierEcart = (i + 1) * dt;
      }
    }
    return dernierEcart;
  }

  it('se stabilise en moins de 0,45 s', () => {
    const t = tempsDeStabilisation(1);
    // Le réglage précédent (k = 60, c = 11) mettait 0,73 s : perceptible comme un
    // retard, et c'est ce que l'utilisateur a signalé.
    expect(t).toBeLessThan(0.45);
    // Mais pas instantané : sans inertie, le mouvement n'a plus rien de vivant.
    expect(t).toBeGreaterThan(0.12);
  });

  it('est nettement plus franc que l’ancien réglage', () => {
    const dt = 1 / 60;
    const stabiliser = (k: number, c: number) => {
      let etat: EtatRessort = { position: 0, vitesse: 0 };
      let dernier = 0;
      for (let i = 0; i < 60 * 5; i++) {
        etat = avancerRessort(etat, 1, dt, k, c);
        if (Math.abs(etat.position - 1) > 0.02) dernier = (i + 1) * dt;
      }
      return dernier;
    };

    const ancien = stabiliser(60, 11);
    const actuel = stabiliser(RAIDEUR, AMORTISSEMENT);
    expect(actuel).toBeLessThan(ancien * 0.6);
  });

  it('garde un dépassement, donc de l’inertie', () => {
    const { trace } = simuler(1, 2);
    expect(Math.max(...trace)).toBeGreaterThan(1);
    expect(Math.max(...trace)).toBeLessThan(1.1);
  });

  it('reste stable au pas de temps maximal', () => {
    // À `PAS_MAX`, un ressort trop raide divergerait : le produit `dt · ω` doit
    // rester loin de 2.
    const pulsation = Math.sqrt(RAIDEUR);
    expect(PAS_MAX * pulsation).toBeLessThan(1);

    let etat: EtatRessort = { position: 0, vitesse: 0 };
    for (let i = 0; i < 200; i++) etat = avancerRessort(etat, 1, PAS_MAX);
    expect(Number.isFinite(etat.position)).toBe(true);
    expect(etat.position).toBeCloseTo(1, 2);
  });

  it('l’amortissement reste sous-critique', () => {
    expect(facteurAmortissement()).toBeGreaterThan(0.6);
    expect(facteurAmortissement()).toBeLessThan(0.95);
  });
});
