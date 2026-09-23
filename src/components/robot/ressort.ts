/**
 * Ressort amorti, à un degré de liberté.
 *
 * Extrait dans son propre module pour être testable sans monter une scène 3D : c'est le
 * cœur du comportement du robot, et « la tête dépasse légèrement puis se stabilise » est
 * une propriété qu'on peut vérifier numériquement plutôt qu'à l'œil.
 *
 * ── Réglage revu : le suivi traînait ──
 *
 * Les valeurs précédentes (k = 60, c = 11) donnaient ω = 7,7 rad/s et un temps de
 * stabilisation d'environ 0,73 s. À l'écran, la tête arrivait nettement après le
 * curseur : un retard perceptible n'est plus de l'inertie, c'est de la lenteur.
 *
 * Désormais ω = √210 ≈ 14,5 rad/s et ζ ≈ 0,79, soit une stabilisation en 0,35 s :
 * deux fois plus franc, et toujours sous-amorti — la tête dépasse encore légèrement
 * la cible avant de revenir, ce qui est le mouvement demandé. Un amortissement
 * critique (ζ = 1) suivrait proprement mais sans vie.
 */
export const RAIDEUR = 210;
export const AMORTISSEMENT = 23;

/** Pas de temps maximal accepté. Au retour d'un onglet en veille, `delta` explose. */
export const PAS_MAX = 1 / 30;

export interface EtatRessort {
  position: number;
  vitesse: number;
}

export function avancerRessort(
  etat: EtatRessort,
  cible: number,
  deltaBrut: number,
  raideur = RAIDEUR,
  amortissement = AMORTISSEMENT
): EtatRessort {
  const dt = Math.min(Math.max(deltaBrut, 0), PAS_MAX);
  const acceleration = -raideur * (etat.position - cible) - amortissement * etat.vitesse;
  const vitesse = etat.vitesse + acceleration * dt;
  return { position: etat.position + vitesse * dt, vitesse };
}

/** Facteur d'amortissement. Inférieur à 1 : le système dépasse. */
export function facteurAmortissement(
  raideur = RAIDEUR,
  amortissement = AMORTISSEMENT
): number {
  return amortissement / (2 * Math.sqrt(raideur));
}
