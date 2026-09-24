import { describe, expect, it } from 'vitest';
import {
  SIGLES,
  entierEnMots,
  epeler,
  ordinalEnMots,
  romainVersEntier,
  versSsml,
  versTexte,
} from '../normaliser';

describe('romainVersEntier', () => {
  it('lit les formes du corpus', () => {
    const attendu: Record<string, number> = {
      III: 3,
      V: 5,
      VII: 7,
      VIII: 8,
      XIII: 13,
      XIV: 14,
      XV: 15,
      XVI: 16,
      XVIII: 18,
      XIX: 19,
      XX: 20,
      XXI: 21,
    };
    for (const [romain, n] of Object.entries(attendu)) {
      expect(romainVersEntier(romain), romain).toBe(n);
    }
  });

  it('refuse ce qui n’est pas un chiffre romain', () => {
    expect(romainVersEntier('URSS')).toBeNull();
    expect(romainVersEntier('')).toBeNull();
    expect(romainVersEntier('ABC')).toBeNull();
  });
});

describe('entierEnMots', () => {
  it('traite les pièges du français', () => {
    expect(entierEnMots(0)).toBe('zéro');
    expect(entierEnMots(1)).toBe('un');
    expect(entierEnMots(16)).toBe('seize');
    expect(entierEnMots(20)).toBe('vingt');
    expect(entierEnMots(21)).toBe('vingt et un');
    expect(entierEnMots(31)).toBe('trente et un');
    expect(entierEnMots(70)).toBe('soixante-dix');
    expect(entierEnMots(71)).toBe('soixante et onze');
    expect(entierEnMots(80)).toBe('quatre-vingts');
    expect(entierEnMots(81)).toBe('quatre-vingt-un');
    expect(entierEnMots(90)).toBe('quatre-vingt-dix');
    expect(entierEnMots(99)).toBe('quatre-vingt-dix-neuf');
    expect(entierEnMots(100)).toBe('cent');
    expect(entierEnMots(200)).toBe('deux cents');
    expect(entierEnMots(301)).toBe('trois cent un');
  });

  it('refuse hors bornes plutôt que de rendre une valeur fausse', () => {
    expect(() => entierEnMots(1000)).toThrow(RangeError);
    expect(() => entierEnMots(-1)).toThrow(RangeError);
    expect(() => entierEnMots(1.5)).toThrow(RangeError);
  });
});

describe('ordinalEnMots', () => {
  it('rend les ordinaux des siècles du corpus', () => {
    expect(ordinalEnMots(1)).toBe('premier');
    expect(ordinalEnMots(1, true)).toBe('première');
    expect(ordinalEnMots(3)).toBe('troisième');
    expect(ordinalEnMots(5)).toBe('cinquième');
    expect(ordinalEnMots(9)).toBe('neuvième');
    expect(ordinalEnMots(16)).toBe('seizième');
    expect(ordinalEnMots(19)).toBe('dix-neuvième');
    expect(ordinalEnMots(20)).toBe('vingtième');
    expect(ordinalEnMots(38)).toBe('trente-huitième');
    expect(ordinalEnMots(80)).toBe('quatre-vingtième');
  });
});

describe('recollage des nombres', () => {
  it('recolle les nombres écrits avec une espace', () => {
    // Le defaut le plus audible : sans cela on entend « deux » puis « zero
    // zero zero ».
    expect(versTexte('environ 200 000 morts')).toBe('environ 200000 morts');
    expect(versTexte('toutes les 2 016 blocs')).toBe('toutes les 2016 blocs');
    expect(versTexte('38 957 points')).toBe('38957 points');
  });

  it('recolle aussi les millions', () => {
    expect(versTexte('1 000 000 de personnes')).toBe('1000000 de personnes');
  });

  it('ne touche pas à un nombre suivi d’un mot', () => {
    expect(versTexte('35 questions')).toBe('35 questions');
    expect(versTexte('50 sujets')).toBe('50 sujets');
  });
});

describe('ordinaux et romains dans le texte', () => {
  it('développe les exposants', () => {
    expect(versTexte('au XIXᵉ siècle')).toBe('au dix-neuvième siècle');
    expect(versTexte('le XVIᵉ siècle')).toBe('le seizième siècle');
    expect(versTexte('Iᵉʳ janvier')).toBe('premier janvier');
    expect(versTexte('le 1ᵉʳ décembre')).toBe('le premier décembre');
    expect(versTexte('au 38ᵉ parallèle')).toBe('au trente-huitième parallèle');
  });

  it('convertit les romains isolés en nombres', () => {
    expect(versTexte('Louis XVI a régné')).toBe('Louis 16 a régné');
  });

  it('ne casse pas un sigle qui ressemble à du romain', () => {
    // « CIVIL » n'est pas un chiffre romain valide et doit rester intact.
    expect(versTexte('le code CIVIL')).toContain('CIVIL');
  });
});

describe('ères, fourchettes, unités', () => {
  it('développe les abréviations d’ère', () => {
    expect(versTexte('vers 301 av. J.-C.')).toBe('vers 301 avant Jésus-Christ');
    expect(versTexte('65 ap. J.-C.')).toBe('65 après Jésus-Christ');
  });

  it('transforme une fourchette d’années en formule dite', () => {
    expect(versTexte('la guerre froide 1947-1991')).toBe(
      'la guerre froide de 1947 à 1991'
    );
    expect(versTexte('de 1945 - 1949')).toContain('de 1945 à 1949');
  });

  it('développe les unités et les pourcentages', () => {
    expect(versTexte('environ 90 %')).toBe('environ 90 pour cent');
    expect(versTexte('600 km de long')).toBe('600 kilomètres de long');
    expect(versTexte('420 ppm')).toBe('420 parties par million');
    expect(versTexte('150 TWh par an')).toBe('150 térawattheures par an');
  });
});

describe('ponctuation pour l’oreille', () => {
  it('remplace le tiret cadratin par une virgule', () => {
    expect(versTexte('un fait — et non une opinion — compte')).toBe(
      'un fait, et non une opinion, compte'
    );
  });

  it('retire les guillemets', () => {
    expect(versTexte('le « Manuel » d’Épictète')).toBe('le Manuel d’Épictète');
    expect(versTexte('dans "La Peste"')).toBe('dans La Peste');
  });

  it('transforme les parenthèses en incise', () => {
    expect(versTexte('Dioclétien (284-305) réorganise')).toBe(
      'Dioclétien, de 284 à 305, réorganise'
    );
  });

  it('ne laisse ni ponctuation doublée ni espace avant ponctuation', () => {
    const sortie = versTexte('Alaric (410) — le sac de Rome — choque.');
    expect(sortie).not.toMatch(/,\s*,/);
    expect(sortie).not.toMatch(/\s+[,.]/);
    expect(sortie).not.toMatch(/,\./);
  });
});

describe('sigles', () => {
  it('épelle avec les noms de lettres français', () => {
    expect(epeler('ADN')).toBe('a dé enne');
    expect(epeler('ETF')).toBe('e té effe');
    expect(epeler('PIB')).toBe('pé i bé');
  });

  it('laisse les sigles prononçables comme des mots', () => {
    expect(versTexte("l'OTAN et l'ONU")).toContain('Otan');
    expect(versTexte('la NASA')).toContain('Nasa');
  });

  it('épelle en clair dans la sortie texte', () => {
    expect(versTexte('un ETF large')).toBe('un e té effe large');
  });

  it('utilise say-as dans la sortie SSML', () => {
    expect(versSsml('un ETF large')).toBe(
      'un <say-as interpret-as="characters">ETF</say-as> large'
    );
  });

  it('laisse intact un sigle absent de la table', () => {
    expect(versTexte('le format WXYZ')).toContain('WXYZ');
  });

  it('couvre chaque sigle du corpus par une règle explicite', () => {
    for (const [sigle, regle] of Object.entries(SIGLES)) {
      expect(sigle, 'les clés sont en capitales').toBe(sigle.toUpperCase());
      expect(['lettres', 'mot']).toContain(regle.mode);
      if (regle.mode === 'mot') {
        expect(regle.oral ?? sigle, `${sigle} : forme orale vide`).toBeTruthy();
      }
    }
    expect(Object.keys(SIGLES).length).toBeGreaterThanOrEqual(50);
  });
});

describe('SSML', () => {
  it('échappe ce qui casserait le XML', () => {
    const sortie = versSsml('Marshall & Cie <plan>');
    expect(sortie).toContain('&amp;');
    expect(sortie).toContain('&lt;plan&gt;');
  });

  it('reste équilibré en balises', () => {
    const sortie = versSsml("l'ETF, l'ADN et le PIB");
    const ouvrantes = (sortie.match(/<say-as/g) ?? []).length;
    const fermantes = (sortie.match(/<\/say-as>/g) ?? []).length;
    expect(ouvrantes).toBe(3);
    expect(ouvrantes).toBe(fermantes);
  });

  it('applique les mêmes transformations que la sortie texte', () => {
    // Seule la façon de rendre les sigles doit differer.
    const entree = 'Au XIXᵉ siècle, environ 200 000 personnes — soit 5 % — partent.';
    const texte = versTexte(entree);
    const ssml = versSsml(entree);
    expect(texte).toContain('dix-neuvième');
    expect(ssml).toContain('dix-neuvième');
    expect(texte).toContain('200000');
    expect(ssml).toContain('200000');
    expect(texte).toContain('pour cent');
    expect(ssml).toContain('pour cent');
  });
});
