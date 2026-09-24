import { describe, expect, it } from 'vitest';
import {
  SAVOIR_FAIRE,
  lectureClaire,
  phraseDifficultes,
  phraseForces,
  phrasePrecision,
  phraseSituation,
  positionEnMots,
} from '../langageClair';
import { APTITUDE_LABEL, type Aptitude, type IQReport, type ScaledScore } from '../types';

/**
 * Ce que ces tests protègent.
 *
 * Le reproche auquel ce module répond est qu'un résultat exact mais
 * incompréhensible ne renseigne pas. Les contrôles portent donc autant sur
 * l'exactitude du contenu que sur l'absence de jargon : une régression ici
 * serait de réintroduire « centile » ou « intervalle de confiance » dans la
 * lecture principale, et elle passerait inaperçue sans test.
 */

/** Les termes bannis de la lecture principale. */
const JARGON = [
  'centile',
  'percentile',
  'intervalle de confiance',
  'écart-type',
  'erreur type',
  'thêta',
  'theta',
  'IRT',
];

function sansJargon(texte: string): void {
  const bas = texte.toLowerCase();
  for (const terme of JARGON) {
    expect(bas, `« ${terme} » ne doit pas figurer dans la lecture principale`).not.toContain(
      terme
    );
  }
}

const echelle = (point: number, bas: number, haut: number): ScaledScore => ({
  point,
  lower95: bas,
  upper95: haut,
});

describe('positionEnMots', () => {
  it('place la moyenne autour de 50', () => {
    expect(positionEnMots(50)).toBe('dans la moyenne');
    expect(positionEnMots(40)).toBe('dans la moyenne');
    expect(positionEnMots(60)).toBe('dans la moyenne');
  });

  it('distingue les sept degrés sans en sauter', () => {
    const rendus = [2, 15, 30, 50, 65, 80, 95].map(positionEnMots);
    expect(new Set(rendus).size).toBe(7);
  });

  it('est monotone : un centile plus haut ne peut pas décrire une position plus basse', () => {
    const ordre = [
      'nettement en dessous de la moyenne',
      'en dessous de la moyenne',
      'un peu en dessous de la moyenne',
      'dans la moyenne',
      'un peu au-dessus de la moyenne',
      'au-dessus de la moyenne',
      'nettement au-dessus de la moyenne',
    ];
    let precedent = -1;
    for (let centile = 1; centile <= 99; centile++) {
      const rang = ordre.indexOf(positionEnMots(centile));
      expect(rang, `centile ${centile} : position inconnue`).toBeGreaterThanOrEqual(0);
      expect(rang, `centile ${centile} : la position recule`).toBeGreaterThanOrEqual(precedent);
      precedent = rang;
    }
  });
});

describe('phraseSituation', () => {
  it('retourne le centile en dénombrement, et les deux parts somment à 100', () => {
    const phrase = phraseSituation(62);
    expect(phrase).not.toBeNull();
    expect(phrase).toContain('environ 62');
    expect(phrase).toContain('environ 38');
    sansJargon(phrase as string);
  });

  it('ne dit rien plutôt que d’inventer une position quand le centile manque', () => {
    expect(phraseSituation(null)).toBeNull();
  });

  it('évite les formulations absurdes aux extrêmes', () => {
    // « environ 0 personnes sur 100 » et « environ 100 » seraient faux et ridicules.
    for (const centile of [1, 99]) {
      const phrase = phraseSituation(centile) as string;
      expect(phrase).not.toContain('environ 0 ');
      expect(phrase).not.toContain('environ 100 ');
      expect(phrase).toContain('Presque toutes');
    }
  });

  it('couvre tout l’intervalle utile sans jargon ni trou', () => {
    for (let centile = 1; centile <= 99; centile++) {
      const phrase = phraseSituation(centile);
      expect(phrase, `centile ${centile}`).not.toBeNull();
      expect((phrase as string).length).toBeGreaterThan(30);
      sansJargon(phrase as string);
    }
  });
});

describe('phrasePrecision', () => {
  it('annonce les deux bornes et leur écart, calculé et non recopié', () => {
    const phrase = phrasePrecision(echelle(106, 97, 115), 35);
    expect(phrase).toContain('97');
    expect(phrase).toContain('115');
    expect(phrase).toContain('18 points');
    expect(phrase).toContain('35 questions');
    sansJargon(phrase);
  });

  it('dit que le chiffre du milieu ne vaut pas mieux que ses voisins', () => {
    const phrase = phrasePrecision(echelle(100, 92, 108), 35);
    expect(phrase.toLowerCase()).toContain('milieu');
  });
});

describe('forces et difficultés', () => {
  it('nomme le geste mental et non la catégorie', () => {
    const phrase = phraseForces(['spatial']) as string;
    expect(phrase).toContain(SAVOIR_FAIRE.spatial);
    // Le libellé technique ne doit pas fuiter dans la lecture principale.
    expect(phrase).not.toContain(APTITUDE_LABEL.spatial);
  });

  it('énumère correctement en français', () => {
    expect(phraseForces(['spatial', 'memory'])).toContain(
      `${SAVOIR_FAIRE.spatial} et ${SAVOIR_FAIRE.memory}`
    );
    const trois = phraseForces(['matrix', 'series', 'verbal']) as string;
    expect(trois).toContain(`${SAVOIR_FAIRE.matrix}, ${SAVOIR_FAIRE.series} et ${SAVOIR_FAIRE.verbal}`);
  });

  it('ne dit rien quand rien ne se détache', () => {
    expect(phraseForces([])).toBeNull();
    expect(phraseDifficultes([])).toBeNull();
  });

  it('couvre les cinq aptitudes', () => {
    const aptitudes: Aptitude[] = ['matrix', 'series', 'verbal', 'spatial', 'memory'];
    for (const aptitude of aptitudes) {
      expect(SAVOIR_FAIRE[aptitude], `savoir-faire manquant pour ${aptitude}`).toBeTruthy();
      expect(SAVOIR_FAIRE[aptitude].length).toBeGreaterThan(15);
    }
  });
});

describe('lectureClaire', () => {
  const rapport = (
    forces: Aptitude[],
    faiblesses: Aptitude[],
    percentile: number | null = 62
  ): IQReport =>
    ({
      percentile,
      scaled: echelle(106, 97, 115),
      itemCount: 35,
      strengths: forces,
      weaknesses: faiblesses,
    }) as unknown as IQReport;

  it('remplace forces et difficultés par une explication quand le profil est plat', () => {
    const lecture = lectureClaire(rapport([], []));
    expect(lecture.forces).toBeNull();
    expect(lecture.difficultes).toBeNull();
    expect(lecture.profilPlat).not.toBeNull();
    sansJargon(lecture.profilPlat as string);
  });

  it('n’affiche pas l’explication de profil plat quand quelque chose se détache', () => {
    const lecture = lectureClaire(rapport(['spatial'], []));
    expect(lecture.profilPlat).toBeNull();
    expect(lecture.forces).not.toBeNull();
  });

  it('produit une lecture entièrement sans jargon', () => {
    const lecture = lectureClaire(rapport(['spatial'], ['memory']));
    for (const phrase of Object.values(lecture)) {
      if (typeof phrase === 'string') sansJargon(phrase);
    }
  });

  it('tient sans centile : la précision et le profil restent dits', () => {
    const lecture = lectureClaire(rapport(['verbal'], [], null));
    expect(lecture.situation).toBeNull();
    expect(lecture.precision.length).toBeGreaterThan(50);
    expect(lecture.forces).not.toBeNull();
  });
});
