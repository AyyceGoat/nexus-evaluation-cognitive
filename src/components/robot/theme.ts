/**
 * Lit la palette depuis les variables CSS.
 *
 * Les matériaux three.js n'acceptent pas `var(--color-mesure)` : il leur faut une
 * valeur. Plutôt que de recopier les hex dans le code de la scène — ce qui créerait une
 * seconde source de vérité, et que `scripts/verifie-tokens.mjs` refuserait à juste
 * titre — on les lit au moment du montage sur l'élément racine.
 *
 * Conséquence utile : changer la palette dans `index.css` change aussi le robot.
 */

export interface CouleursScene {
  noir: string;
  graphite: string;
  ardoise: string;
  brume: string;
  craie: string;
  mesure: string;
}

// verifie-tokens: derogation hex — valeurs de repli indispensables : trois.js exige une
// couleur littérale et non une variable CSS, et getComputedStyle est indisponible hors
// navigateur (tests, rendu serveur). Ce sont les seules copies des tokens du projet ;
// `__tests__/theme.test.ts` échoue si elles dérivent de `src/index.css`.
const REPLI: CouleursScene = {
  noir: '#000000',
  graphite: '#181818',
  ardoise: '#2b2b2b',
  brume: '#bebab2',
  craie: '#f7f6f3',
  mesure: '#6ed8c6',
};

export function couleursDuTheme(): CouleursScene {
  if (typeof window === 'undefined' || !document?.documentElement) return REPLI;

  const style = getComputedStyle(document.documentElement);
  const lire = (nom: keyof CouleursScene): string => {
    const valeur = style.getPropertyValue(`--color-${nom}`).trim();
    return valeur || REPLI[nom];
  };

  return {
    noir: lire('noir'),
    graphite: lire('graphite'),
    ardoise: lire('ardoise'),
    brume: lire('brume'),
    craie: lire('craie'),
    mesure: lire('mesure'),
  };
}
