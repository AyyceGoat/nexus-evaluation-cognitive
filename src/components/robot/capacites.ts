/**
 * Décide si la scène 3D a le droit d'exister sur cet appareil.
 *
 * Le principe est inversé par rapport à l'habitude : la 3D n'est pas la norme dont on
 * dégrade, c'est un supplément qu'on n'accorde qu'aux appareils qui peuvent le porter.
 * Le site doit être parfait sans elle, donc le repli n'est pas un pis-aller.
 */

export type Verdict = 'canvas' | 'poster';

export interface Capacites {
  verdict: Verdict;
  /** Pourquoi ce verdict. Consigné pour pouvoir en discuter, pas affiché. */
  raison: string;
  mouvementReduit: boolean;
  tactile: boolean;
  /** Densité de pixels à demander au rendu. Plafonnée sur mobile. */
  dpr: [number, number];
  ombres: boolean;
}

/** En dessous, l'appareil n'a pas de quoi faire tourner une boucle de rendu. */
const COEURS_MINIMUM = 4;

/** En dessous, l'appareil est en tension mémoire : on ne lui ajoute pas un canvas. */
const MEMOIRE_MINIMUM_GO = 4;

export function detecterCapacites(): Capacites {
  const mouvementReduit = prefereMouvementReduit();
  const tactile = estTactile();

  const base = {
    mouvementReduit,
    tactile,
    // Plafonner le dpr sur mobile : à dpr 3, le nombre de pixels à calculer est
    // multiplié par neuf pour un gain visuel imperceptible sur un buste sombre.
    dpr: (tactile ? [1, 1.5] : [1, 2]) as [number, number],
    // Les ombres portées coûtent une passe de rendu supplémentaire. Sur mobile,
    // l'éclairage par arête lumineuse suffit.
    ombres: !tactile,
  };

  // Le mouvement réduit ne renvoie PAS au poster : la scène s'affiche, en pose fixe.
  // Retirer l'image à quelqu'un qui demande moins d'animation serait le punir.

  const coeurs = navigator.hardwareConcurrency;
  if (typeof coeurs === 'number' && coeurs > 0 && coeurs < COEURS_MINIMUM) {
    return { ...base, verdict: 'poster', raison: `${coeurs} cœur(s) logique(s)` };
  }

  const memoire = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memoire === 'number' && memoire > 0 && memoire < MEMOIRE_MINIMUM_GO) {
    return { ...base, verdict: 'poster', raison: `${memoire} Go de mémoire annoncés` };
  }

  if (economiseurDeDonnees()) {
    return { ...base, verdict: 'poster', raison: 'économiseur de données actif' };
  }

  if (!webglDisponible()) {
    return { ...base, verdict: 'poster', raison: 'contexte WebGL indisponible' };
  }

  return { ...base, verdict: 'canvas', raison: 'appareil capable' };
}

export function prefereMouvementReduit(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function estTactile(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  // `pointer: coarse` est plus fiable que la détection d'agent utilisateur, et couvre
  // les tablettes comme les écrans tactiles de bureau.
  return window.matchMedia('(pointer: coarse)').matches;
}

function economiseurDeDonnees(): boolean {
  const connexion = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (!connexion) return false;
  if (connexion.saveData) return true;
  return connexion.effectiveType === 'slow-2g' || connexion.effectiveType === '2g';
}

/**
 * Tente réellement d'obtenir un contexte WebGL.
 *
 * Tester la présence de `window.WebGLRenderingContext` ne suffit pas : le constructeur
 * existe alors que la création du contexte échoue — pilote sur liste noire, WebGL
 * désactivé dans les préférences, trop de contextes déjà ouverts.
 */
function webglDisponible(): boolean {
  try {
    const toile = document.createElement('canvas');
    const contexte =
      toile.getContext('webgl2') ??
      toile.getContext('webgl') ??
      toile.getContext('experimental-webgl');

    if (!contexte) return false;

    // Libère immédiatement : on ne garde pas un contexte ouvert pour un test.
    const perte = (contexte as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    perte?.loseContext();
    return true;
  } catch {
    return false;
  }
}
