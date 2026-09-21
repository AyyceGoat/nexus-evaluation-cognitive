import { describeNorm } from '../iq/scale';
import { APTITUDES, APTITUDE_DESCRIPTION, APTITUDE_LABEL } from '../iq/types';
import type {
  Aptitude,
  AptitudeResult,
  IQReport,
  ItemResponse,
  ValidityVerdict,
} from '../iq/types';

/**
 * Assemble un rapport affichable à partir du résultat calculé par le serveur.
 *
 * Aucun chiffre n'est recalculé ici : θ, l'erreur type, l'indice, l'intervalle, le
 * percentile, le verdict et le détail par aptitude arrivent tels que la fonction
 * serveur les a écrits. Ce module ne fait que replacer ces valeurs dans la forme
 * qu'attendent les composants, et y adjoindre ce qui relève du contenu — libellés et
 * descriptions d'aptitudes — qui n'a aucune incidence sur la mesure.
 *
 * La seule dérivation est celle des forces et faiblesses, obtenue de θ et de son
 * erreur type par la marge de signification. C'est une lecture du résultat, pas une
 * réécriture : la formule est la même des deux côtés, et le test de parité la couvre.
 */

/** Marge exigée pour déclarer une aptitude forte ou faible, en erreurs types. */
const MARGE_SIGNIFICATION = 1.645;

/** Forme de la colonne `aptitudes` telle que le serveur l'écrit. */
export interface AptitudeServeur {
  aptitude: Aptitude;
  theta: number;
  standardError: number;
  scaledPoint: number;
  scaledLower95: number;
  scaledUpper95: number;
  correctCount: number;
  itemCount: number;
  radarValue: number;
}

/** Forme du résultat rendu par la fonction serveur, ou relu depuis `iq_sessions`. */
export interface ResultatServeur {
  sessionId: string;
  finishedAt: string | null;
  startedAt?: string | null;
  itemCount: number;
  correctCount: number;
  theta: number | null;
  standardError: number | null;
  scaledPoint: number | null;
  scaledLower95: number | null;
  scaledUpper95: number | null;
  percentile: number | null;
  verdict: ValidityVerdict | null;
  validityMessage: string | null;
  aberrantCount: number | null;
  aboveChanceP: number | null;
  expectedByChance: number | null;
  aptitudes: AptitudeServeur[] | null;
}

function aptitudeVide(aptitude: Aptitude): AptitudeResult {
  return {
    aptitude,
    label: APTITUDE_LABEL[aptitude],
    description: APTITUDE_DESCRIPTION[aptitude],
    estimate: { theta: 0, standardError: 1, itemCount: 0 },
    scaled: { point: 100, lower95: 71, upper95: 129 },
    correctCount: 0,
    itemCount: 0,
    radarValue: 50,
  };
}

export function assemblerRapport(
  serveur: ResultatServeur,
  reponses: readonly ItemResponse[],
  nomCandidat: string | null
): IQReport {
  const parAptitude = new Map(
    (serveur.aptitudes ?? []).map((a) => [a.aptitude, a] as const)
  );

  const aptitudes: AptitudeResult[] = APTITUDES.map((aptitude) => {
    const brut = parAptitude.get(aptitude);
    if (!brut) return aptitudeVide(aptitude);
    return {
      aptitude,
      label: APTITUDE_LABEL[aptitude],
      description: APTITUDE_DESCRIPTION[aptitude],
      estimate: {
        theta: brut.theta,
        standardError: brut.standardError,
        itemCount: brut.itemCount,
      },
      scaled: {
        point: brut.scaledPoint,
        lower95: brut.scaledLower95,
        upper95: brut.scaledUpper95,
      },
      correctCount: brut.correctCount,
      itemCount: brut.itemCount,
      radarValue: brut.radarValue,
    };
  });

  const strengths: Aptitude[] = [];
  const weaknesses: Aptitude[] = [];
  for (const resultat of aptitudes) {
    if (resultat.itemCount === 0) continue;
    const marge = MARGE_SIGNIFICATION * resultat.estimate.standardError;
    if (resultat.estimate.theta - marge > 0) strengths.push(resultat.aptitude);
    else if (resultat.estimate.theta + marge < 0) weaknesses.push(resultat.aptitude);
  }

  const theta = serveur.theta ?? 0;
  const standardError = serveur.standardError ?? 1;

  return {
    sessionId: serveur.sessionId,
    createdAt: serveur.finishedAt ?? new Date().toISOString(),
    candidateName: nomCandidat?.trim() || null,
    overall: { theta, standardError, itemCount: serveur.itemCount },
    scaled: {
      point: serveur.scaledPoint ?? 100,
      lower95: serveur.scaledLower95 ?? 100,
      upper95: serveur.scaledUpper95 ?? 100,
    },
    percentile: serveur.percentile,
    // Le référentiel empirique demande 300 passations enregistrées ; tant qu'il n'est
    // pas atteint, le rapport nomme explicitement la distribution théorique.
    norm: describeNorm(0),
    aptitudes,
    strengths,
    weaknesses,
    validity: {
      verdict: serveur.verdict ?? 'ok',
      aberrantCount: serveur.aberrantCount ?? 0,
      // Le détail des items expédiés n'est pas renvoyé : seul le nombre est affiché.
      aberrantItemIds: [],
      correctCount: serveur.correctCount,
      expectedByChance: serveur.expectedByChance ?? 0,
      aboveChanceP: serveur.aboveChanceP ?? 0,
      message: serveur.validityMessage,
    },
    totalSeconds: reponses.reduce((somme, r) => somme + r.responseSeconds, 0),
    itemCount: serveur.itemCount,
    correctCount: serveur.correctCount,
    responses: [...reponses],
  };
}
