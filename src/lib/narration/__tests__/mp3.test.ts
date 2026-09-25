import { describe, expect, it } from 'vitest';
import { analyserMp3, concatenerMp3 } from '../mp3';

/**
 * Ce que ces tests protègent.
 *
 * La durée sert à placer chaque segment dans le fichier concaténé, donc à
 * surligner le bon passage. Une erreur de quelques dixièmes par segment
 * s'accumule : sur quatorze paragraphes, le surlignage finirait plusieurs
 * secondes en avance. Les valeurs attendues sont donc calculées à la main et
 * non recopiées d'une exécution.
 *
 * Le format réellement produit par edge-tts est MPEG 2 Layer III, 24 kHz,
 * 48 kb/s, mono — vérifié sur les vingt-trois échantillons. C'est celui que ces
 * tests reproduisent.
 */

/** Longueur d'une trame MPEG 2 Layer III à 24 kHz et 48 kb/s. */
const LONGUEUR_TRAME = Math.floor(((576 / 8) * 48 * 1000) / 24000); // 144

/** Échantillons par trame, MPEG 2 Layer III. */
const PAR_TRAME = 576;

/**
 * Fabrique une trame MPEG 2 Layer III, 24 kHz, 48 kb/s, mono.
 *
 * Octet 0 : 0xFF. Octet 1 : 0xF3 — synchronisation, MPEG 2, Layer III, pas de
 * CRC. Octet 2 : indice de débit 6 et indice de fréquence 1 (24 kHz).
 * Octet 3 : mono.
 *
 * L'indice 6 et non 4 : la table des débits de MPEG 2 n'est pas celle de
 * MPEG 1. L'indice 4 y vaut 32 kb/s, et une première version de ce générateur
 * s'en servait en croyant produire du 48 — le test a échoué en annonçant 32,
 * ce qui était la bonne lecture d'une trame mal fabriquée.
 */
const INDICE_48_KBPS = 6;

function trame(rembourrage = 0): Uint8Array {
  const octets = new Uint8Array(LONGUEUR_TRAME + rembourrage);
  octets[0] = 0xff;
  octets[1] = 0xf3;
  octets[2] = (INDICE_48_KBPS << 4) | (1 << 2) | (rembourrage ? 1 << 1 : 0);
  octets[3] = 0xc4;
  return octets;
}

function fichier(nombreDeTrames: number): Uint8Array {
  const morceaux: Uint8Array[] = [];
  for (let i = 0; i < nombreDeTrames; i++) morceaux.push(trame());
  const total = morceaux.reduce((n, m) => n + m.length, 0);
  const sortie = new Uint8Array(total);
  let position = 0;
  for (const m of morceaux) {
    sortie.set(m, position);
    position += m.length;
  }
  return sortie;
}

describe('analyserMp3', () => {
  it('rend la durée exacte, calculée à la main', () => {
    const info = analyserMp3(fichier(100));
    expect(info.trames).toBe(100);
    expect(info.frequence).toBe(24000);
    expect(info.debit).toBe(48);
    expect(info.homogene).toBe(true);
    // 100 trames x 576 echantillons / 24000 Hz = 2,4 s exactement.
    expect(info.duree).toBeCloseTo((100 * PAR_TRAME) / 24000, 10);
    expect(info.duree).toBeCloseTo(2.4, 10);
  });

  it('compte une seconde de son au bon nombre de trames', () => {
    // 24000 / 576 = 41,666… trames par seconde.
    const trames = 1000;
    const info = analyserMp3(fichier(trames));
    expect(info.duree).toBeCloseTo(24, 10);
  });

  it('tient compte du rembourrage sans fausser la durée', () => {
    // Une trame rembourrée est plus longue d'un octet mais dure pareil.
    const avec = new Uint8Array(LONGUEUR_TRAME + 1 + LONGUEUR_TRAME);
    avec.set(trame(1), 0);
    avec.set(trame(0), LONGUEUR_TRAME + 1);
    const info = analyserMp3(avec);
    expect(info.trames).toBe(2);
    expect(info.duree).toBeCloseTo((2 * PAR_TRAME) / 24000, 10);
  });

  it('saute une étiquette ID3v2 en tête', () => {
    const audio = fichier(50);
    const tailleId3 = 300;
    const entete = new Uint8Array(10 + tailleId3);
    entete[0] = 0x49; // I
    entete[1] = 0x44; // D
    entete[2] = 0x33; // 3
    // Taille sur quatre octets a sept bits utiles.
    entete[6] = (tailleId3 >> 21) & 0x7f;
    entete[7] = (tailleId3 >> 14) & 0x7f;
    entete[8] = (tailleId3 >> 7) & 0x7f;
    entete[9] = tailleId3 & 0x7f;

    const complet = new Uint8Array(entete.length + audio.length);
    complet.set(entete, 0);
    complet.set(audio, entete.length);

    const info = analyserMp3(complet);
    expect(info.trames).toBe(50);
    expect(info.duree).toBeCloseTo((50 * PAR_TRAME) / 24000, 10);
  });

  it('lève plutôt que de rendre une durée nulle', () => {
    // Un fichier qu'on ne sait pas mesurer ne doit pas passer pour muet : tous
    // les décalages suivants seraient faux sans le moindre signal.
    expect(() => analyserMp3(new Uint8Array(0))).toThrow(/trame/i);
    expect(() => analyserMp3(new Uint8Array([1, 2, 3, 4, 5]))).toThrow(/trame/i);
  });

  it('signale un fichier hétérogène au lieu de l’ignorer', () => {
    // Trame a 48 kb/s suivie d'une trame a 64 kb/s (indice 8 en MPEG 2).
    const autre = trame();
    autre[2] = (8 << 4) | (1 << 2);
    const melange = new Uint8Array(LONGUEUR_TRAME + autre.length);
    melange.set(trame(), 0);
    melange.set(autre, LONGUEUR_TRAME);

    const info = analyserMp3(melange);
    expect(info.homogene).toBe(false);
  });
});

describe('concatenerMp3', () => {
  it('rend les décalages cumulés exacts', () => {
    const a = fichier(100); // 2,4 s
    const b = fichier(50); //  1,2 s
    const c = fichier(25); //  0,6 s

    const { decalages, duree, donnees } = concatenerMp3([a, b, c]);

    expect(decalages).toHaveLength(3);
    expect(decalages[0]).toBeCloseTo(0, 10);
    expect(decalages[1]).toBeCloseTo(2.4, 10);
    expect(decalages[2]).toBeCloseTo(3.6, 10);
    expect(duree).toBeCloseTo(4.2, 10);
    expect(donnees.length).toBe(a.length + b.length + c.length);
  });

  it('produit un fichier dont la durée mesurée égale la somme annoncée', () => {
    // Le contrôle qui compte : on relit le resultat plutot que de croire
    // l'addition. C'est ce qui garantit l'absence de derive du surlignage.
    const segments = [fichier(30), fichier(70), fichier(11), fichier(200)];
    const { donnees, duree } = concatenerMp3(segments);
    expect(analyserMp3(donnees).duree).toBeCloseTo(duree, 10);
  });

  it('conserve l’ordre des segments', () => {
    const a = fichier(10);
    const b = fichier(20);
    const { donnees } = concatenerMp3([a, b]);
    expect(donnees.subarray(0, a.length)).toEqual(a);
    expect(donnees.subarray(a.length)).toEqual(b);
  });

  it('accepte une liste vide sans lever', () => {
    const { decalages, duree, donnees } = concatenerMp3([]);
    expect(decalages).toEqual([]);
    expect(duree).toBe(0);
    expect(donnees.length).toBe(0);
  });
});
