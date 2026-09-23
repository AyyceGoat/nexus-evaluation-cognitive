import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { couleursDuTheme } from '../theme';

/**
 * Les couleurs de repli du robot ne doivent pas dériver de la palette.
 *
 * Ce test existe parce que la dérive s'est produite ailleurs : le script de contraste
 * gardait sa propre copie des couleurs et mesurait encore l'ancienne palette après sa
 * refonte. Ici, une dérive serait plus sournoise qu'une mesure fausse — le robot
 * rendrait des couleurs qui ne sont plus celles du produit, sans qu'aucune erreur
 * n'apparaisse nulle part.
 *
 * Hors navigateur, `couleursDuTheme()` rend précisément ces valeurs de repli : le test
 * lit donc ce que la scène utiliserait, et non une constante recopiée à côté.
 */
describe('couleurs de la scène 3D', () => {
  const css = readFileSync('src/index.css', 'utf8');

  const palette = new Map<string, string>();
  for (const [, nom, valeur] of css.matchAll(/--color-([a-z]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    palette.set(nom, valeur.toLowerCase());
  }

  it('trouve une palette complète dans index.css', () => {
    for (const nom of ['noir', 'graphite', 'ardoise', 'brume', 'craie', 'mesure']) {
      expect(palette.get(nom), `--color-${nom} absente de index.css`).toBeDefined();
    }
  });

  it('les valeurs de repli correspondent à index.css', () => {
    const couleurs = couleursDuTheme() as unknown as Record<string, string>;

    let comparees = 0;
    for (const [nom, attendue] of palette) {
      if (!(nom in couleurs)) continue;
      comparees++;
      expect(couleurs[nom].toLowerCase(), `couleur « ${nom} » de la scène`).toBe(attendue);
    }

    // Sans ce contrôle, l'assertion passerait à vide si les noms changeaient.
    expect(comparees, 'aucune couleur comparée').toBe(6);
  });
});
