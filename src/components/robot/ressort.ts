/**
 * Ressort amorti, à un degré de liberté.
 *
 * Extrait dans son propre module pour être testable sans monter une scène 3D : c'est le
 * cœur du comportement du robot, et « la tête dépasse légèrement puis se stabilise » est
 * une propriété qu'on peut vérifier numériquement plutôt qu'à l'œil.
 *
 * Le facteur d'amortissement vaut `AMORTISSEMENT / (2·√RAIDEUR)` ≈ 0,71. Sous-amorti,
 * donc la valeur **dépasse** la cible sur un échelon avant de revenir — c'est l'inertie
 * demandée. Un amortissement critique (ζ = 1) donnerait un suivi propre mais sans vie,
 * et une interpolation par `damp` ne dépasse jamais.
 */
export const RAIDEUR = 60;
export const AMORTISSEMENT = 11;

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
