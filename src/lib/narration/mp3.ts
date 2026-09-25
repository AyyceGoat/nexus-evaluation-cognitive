/**
 * Lecture des en-têtes de trames MP3, pour connaître une durée exacte.
 *
 * ── Pourquoi ce module existe ──
 *
 * L'audio d'un article est produit segment par segment — introduction, titre de
 * section, paragraphe — puis concaténé en un seul fichier. Pour surligner le
 * passage en cours, il faut savoir à quelle seconde commence chaque segment
 * dans le fichier final. Donc il faut la durée exacte de chacun.
 *
 * Trois façons de l'obtenir, et une seule est juste :
 *
 *   - diviser le poids par le débit : faux dès qu'une trame est rembourrée, et
 *     faux si l'encodeur insère une en-tête d'information ;
 *   - prendre la fin du dernier repère de mot : omet le silence final, donc
 *     l'erreur s'accumule à chaque concaténation et le surlignage dérive ;
 *   - compter les trames : exact, et c'est ce que fait ce module.
 *
 * `ffmpeg` donnerait la réponse, mais il n'est pas installé sur la machine de
 * génération et ce calcul ne justifie pas une dépendance : un décodeur
 * d'en-têtes MP3 tient en cinquante lignes.
 *
 * ── Ce qui est lu ──
 *
 * Seules les en-têtes de trames, jamais les données audio. Une en-tête fait
 * quatre octets et commence par onze bits à 1.
 */

/** Débits en kb/s, indexés par version MPEG puis par indice d'en-tête. */
const DEBITS: Record<1 | 2, ReadonlyArray<number>> = {
  // MPEG 1, Layer III
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  // MPEG 2 et 2.5, Layer III
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
};

/** Fréquences d'échantillonnage, par version MPEG puis par indice. */
const FREQUENCES: Record<1 | 2 | 3, ReadonlyArray<number>> = {
  1: [44100, 48000, 32000, 0], // MPEG 1
  2: [22050, 24000, 16000, 0], // MPEG 2
  3: [11025, 12000, 8000, 0], // MPEG 2.5
};

export interface InfoMp3 {
  /** Durée totale, en secondes. */
  duree: number;
  /** Nombre de trames reconnues. */
  trames: number;
  /** Fréquence d'échantillonnage de la première trame, en hertz. */
  frequence: number;
  /** Débit de la première trame, en kb/s. */
  debit: number;
  /** Vrai si toutes les trames partagent fréquence et débit. */
  homogene: boolean;
}

/**
 * Analyse un MP3 et rend sa durée exacte.
 *
 * Lève si aucune trame n'est reconnue : un fichier qu'on ne sait pas mesurer ne
 * doit pas passer pour un fichier de durée nulle, sans quoi tous les décalages
 * suivants seraient faux sans le moindre signal.
 */
export function analyserMp3(donnees: Uint8Array): InfoMp3 {
  let position = 0;
  let trames = 0;
  let echantillons = 0;
  let frequence = 0;
  let debit = 0;
  let homogene = true;

  while (position + 4 <= donnees.length) {
    const a = donnees[position];
    const b = donnees[position + 1];

    // Onze bits de synchronisation.
    if (a !== 0xff || (b & 0xe0) !== 0xe0) {
      // Sauter les blocs non audio : étiquettes ID3 en tête, octets isolés.
      if (
        trames === 0 &&
        a === 0x49 &&
        b === 0x44 &&
        donnees[position + 2] === 0x33 &&
        position + 10 <= donnees.length
      ) {
        // ID3v2 : taille sur quatre octets à sept bits utiles.
        const taille =
          (donnees[position + 6] << 21) |
          (donnees[position + 7] << 14) |
          (donnees[position + 8] << 7) |
          donnees[position + 9];
        position += 10 + taille;
        continue;
      }
      position += 1;
      continue;
    }

    const versionBits = (b >> 3) & 0x03;
    const coucheBits = (b >> 1) & 0x03;
    if (versionBits === 1 || coucheBits === 0) {
      position += 1;
      continue;
    }

    // 3 = MPEG 1, 2 = MPEG 2, 0 = MPEG 2.5.
    const versionFrequence = versionBits === 3 ? 1 : versionBits === 2 ? 2 : 3;
    const versionDebit = versionBits === 3 ? 1 : 2;

    const c = donnees[position + 2];
    const indiceDebit = (c >> 4) & 0x0f;
    const indiceFrequence = (c >> 2) & 0x03;
    const rembourrage = (c >> 1) & 0x01;

    const debitTrame = DEBITS[versionDebit][indiceDebit];
    const frequenceTrame = FREQUENCES[versionFrequence][indiceFrequence];
    if (debitTrame === 0 || frequenceTrame === 0) {
      position += 1;
      continue;
    }

    // Layer III : 1152 échantillons par trame en MPEG 1, 576 sinon.
    const parTrame = versionDebit === 1 ? 1152 : 576;
    const longueur =
      Math.floor(((parTrame / 8) * debitTrame * 1000) / frequenceTrame) + rembourrage;
    if (longueur <= 4) {
      position += 1;
      continue;
    }

    if (trames === 0) {
      frequence = frequenceTrame;
      debit = debitTrame;
    } else if (frequenceTrame !== frequence || debitTrame !== debit) {
      homogene = false;
    }

    trames += 1;
    echantillons += parTrame;
    position += longueur;
  }

  if (trames === 0) throw new Error('Aucune trame MP3 reconnue.');

  return {
    duree: echantillons / frequence,
    trames,
    frequence,
    debit,
    homogene,
  };
}

/**
 * Concatène des MP3 homogènes, et rend le décalage de départ de chacun.
 *
 * La concaténation brute de trames MP3 est licite quand la fréquence et le
 * nombre de canaux sont identiques — c'est le cas ici, tous les segments
 * sortant du même moteur avec les mêmes réglages. Aucun réencodage, donc aucune
 * perte.
 *
 * Les étiquettes ID3 éventuelles de chaque segment sont conservées telles
 * quelles : les lecteurs les ignorent au milieu d'un flux, et les retirer
 * demanderait de réécrire les octets sans bénéfice audible.
 */
export function concatenerMp3(segments: ReadonlyArray<Uint8Array>): {
  donnees: Uint8Array;
  decalages: number[];
  duree: number;
} {
  const decalages: number[] = [];
  let cumul = 0;
  let taille = 0;

  for (const segment of segments) {
    decalages.push(cumul);
    cumul += analyserMp3(segment).duree;
    taille += segment.length;
  }

  const donnees = new Uint8Array(taille);
  let position = 0;
  for (const segment of segments) {
    donnees.set(segment, position);
    position += segment.length;
  }

  return { donnees, decalages, duree: cumul };
}
