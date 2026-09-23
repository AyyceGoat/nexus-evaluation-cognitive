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
    // Les ombres portées coûtent une passe de rendu entière, et la scène n'en
    // affiche aucune : aucun maillage ne porte `receiveShadow`. Le drapeau est
    // conservé pour rester dans le contrat, mais il vaut toujours faux.
    ombres: false,
  };

  // Le mouvement réduit ne renvoie PAS au poster : la scène s'affiche, en pose fixe.
  // Retirer l'image à quelqu'un qui demande moins d'animation serait le punir.

  // ── Tactile : poster, sans discussion ──────────────────────────────────
  //
  // Décision assumée, et prise faute de pouvoir mesurer autrement. La boucle de
  // rendu a été mesurée à 24 images par seconde sur un rendu logiciel de bureau
  // (`npm run verifie:fps`) ; je n'ai aucun moyen de mesurer un vrai GPU de
  // téléphone depuis cette machine. Servir une 3D dont je ne peux pas garantir
  // la fluidité sur l'appareil où elle compte le plus serait un pari.
  //
  // Le poster n'est pas un pis-aller : c'est le même buste, en SVG, sans boucle
  // de rendu, sans three.js téléchargé, et sans un octet dépensé en batterie.
  // Sur mobile, cela retire aussi 247 ko compressés du chargement.
  //
  // Un écran tactile de bureau tombe dans ce cas : il n'a pas de curseur à
  // suivre, donc le robot n'y aurait de toute façon rien à suivre.
  if (tactile) {
    return { ...base, verdict: 'poster', raison: 'appareil tactile' };
  }

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
