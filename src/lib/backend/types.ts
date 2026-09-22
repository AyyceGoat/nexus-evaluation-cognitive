import type { Aptitude, IQReport, ValidityVerdict } from '../iq/types';
import type { MatrixItemData } from '../../types/matrix';

export interface Utilisateur {
  id: string;
  email: string;
  /**
   * Adresse confirmée ou non.
   *
   * La confirmation est obligatoire : sans elle, aucune session n'est délivrée. Le
   * drapeau est tout de même exposé, parce que le classement public s'y adosse et
   * qu'une vérification écrite deux fois vaut mieux qu'une supposition.
   */
  emailConfirme: boolean;
}

export interface Profil {
  id: string;
  nomAffiche: string | null;
  /** Nom porté par l'attestation. Distinct du pseudonyme : une attestation déjà
   *  délivrée ne doit pas être réécrite par un changement de pseudonyme. */
  nomLegal: string | null;
  /** Pseudonyme du classement public. La seule donnée nominative qui y paraisse. */
  pseudonyme: string | null;
  /** Consentement à figurer au classement. Faux par défaut. */
  classementVisible: boolean;
  onboardeLe: string | null;
}

/** Cinq bandes larges, calculées côté serveur depuis l'indice. */
export type Niveau =
  | 'fondamental'
  | 'intermediaire'
  | 'avance'
  | 'superieur'
  | 'exceptionnel';

export const LIBELLE_NIVEAU: Record<Niveau, string> = {
  fondamental: 'Fondamental',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  superieur: 'Supérieur',
  exceptionnel: 'Exceptionnel',
};

export interface PassationResume {
  id: string;
  commenceeLe: string;
  termineeLe: string | null;
  nombreItems: number;
  nombreReussites: number;
  indice: number | null;
  borneBasse: number | null;
  borneHaute: number | null;
  centile: number | null;
  verdict: ValidityVerdict | null;
  niveau: Niveau | null;
}

/** Détail par aptitude tel que le serveur l'a calculé. */
export interface AptitudePubliee {
  aptitude: Aptitude;
  scaledPoint: number;
  radarValue: number;
  itemCount: number;
  correctCount: number;
}

/**
 * Une ligne du classement public.
 *
 * Ce que cette forme NE contient pas est aussi important que ce qu'elle contient :
 * ni identifiant de compte, ni adresse e-mail, ni nom. La vue `v_classement` ne les
 * expose pas, donc ils ne peuvent pas arriver ici par inadvertance.
 */
export interface EntreeClassement {
  rang: number;
  pseudonyme: string;
  niveau: Niveau;
  score: number;
  borneBasse: number;
  borneHaute: number;
  centile: number | null;
  aptitudes: AptitudePubliee[];
  passeeLe: string;
}

/**
 * Résultat d'une opération.
 *
 * Le message est destiné à l'écran et doit dire quoi faire, pas s'excuser
 * (cf. DESIGN.md §6). Il n'y a jamais de « une erreur est survenue ».
 */
export type Resultat<T = void> =
  | { ok: true; valeur: T }
  | { ok: false; message: string };

export const echec = (message: string): Resultat<never> => ({ ok: false, message });
export const succes = <T>(valeur: T): Resultat<T> => ({ ok: true, valeur });

/** Rapport rechargé depuis le serveur, accompagné des questions et du corrigé. */
export interface RapportStocke {
  rapport: IQReport;
  questions: QuestionServeur[];
  corrections: CorrectionServeur[];
}

/**
 * Une question, telle que le serveur la sert.
 *
 * Ce que cette forme NE contient pas est l'essentiel : ni bonne réponse, ni
 * explication, ni raisonnement. Le navigateur ne peut donc pas les afficher avant
 * d'avoir répondu, ni les lire dans son propre bundle — la banque d'items n'y est
 * plus.
 */
export interface QuestionServeur {
  id: string;
  aptitude: Aptitude;
  prompt: string;
  options: string[] | null;
  visual: MatrixItemData | null;
  expectedSeconds: number;
}

/** Le corrigé, servi seulement une fois la passation close. */
export interface CorrectionServeur {
  itemId: string;
  correctIndex: number;
  explanation: string;
  reasoning: string[];
}

/**
 * Ce que le navigateur transmet pour une réponse.
 *
 * Il n'y a délibérément pas de champ « correct » : la justesse est déterminée par
 * un déclencheur PostgreSQL depuis le corrigé, et le privilège d'écriture sur cette
 * colonne est retiré au client.
 */
export interface ReponseDonnee {
  itemId: string;
  selectedIndex: number;
  responseSeconds: number;
}

/** Ce que rend l'ouverture d'une passation : son identifiant et ses questions. */
export interface PassationOuverte {
  passationId: string;
  questions: QuestionServeur[];
}

export interface BackendPort {
  // ── Authentification ────────────────────────────────────────────────────
  utilisateurCourant(): Promise<Utilisateur | null>;
  /** S'abonne aux changements de session. Renvoie la fonction de désabonnement. */
  surChangementAuth(rappel: (utilisateur: Utilisateur | null) => void): () => void;
  inscrire(email: string, motDePasse: string, nomAffiche: string): Promise<Resultat>;
  connecter(email: string, motDePasse: string): Promise<Resultat>;
  deconnecter(): Promise<void>;
  demanderReinitialisation(email: string): Promise<Resultat>;
  /**
   * Ouvre une session anonyme.
   *
   * C'est ce qui permet de passer l'évaluation « sans compte » depuis que les
   * questions viennent du serveur : une passation doit avoir une session pour que
   * les politiques RLS s'appliquent. L'utilisateur ne fournit ni adresse ni mot de
   * passe, et un compte anonyme ne peut pas figurer au classement.
   */
  connecterAnonyme(): Promise<Resultat>;
  /** Après avoir suivi le lien de réinitialisation : choisir le nouveau mot de passe. */
  changerMotDePasse(nouveau: string): Promise<Resultat>;
  /** Renvoie le message de confirmation à une adresse restée non confirmée. */
  renvoyerConfirmation(email: string): Promise<Resultat>;

  // ── Profil ──────────────────────────────────────────────────────────────
  lireProfil(): Promise<Profil | null>;
  majProfil(patch: Partial<Pick<Profil, 'nomAffiche' | 'nomLegal'>>): Promise<Resultat>;
  marquerOnboarde(): Promise<Resultat>;

  // ── Classement public ───────────────────────────────────────────────────
  /**
   * Choisit un pseudonyme. Passe par une fonction serveur : la colonne n'est pas
   * modifiable par un UPDATE direct.
   */
  definirPseudonyme(pseudonyme: string): Promise<Resultat>;
  /**
   * Déclare si l'on souhaite figurer au classement.
   *
   * Le serveur refuse si l'adresse n'est pas confirmée ou si aucun pseudonyme n'est
   * choisi, et publie ou retire la ligne en conséquence.
   */
  definirVisibiliteClassement(visible: boolean, pseudonyme?: string): Promise<Resultat>;
  /** Lecture publique. Accessible sans compte. */
  lireClassement(limite?: number): Promise<EntreeClassement[]>;

  // ── Passations ──────────────────────────────────────────────────────────
  listerPassations(): Promise<PassationResume[]>;
  /**
   * Ouvre une passation et rend ses questions.
   *
   * Le client ne choisit plus les items : il demande une longueur, le serveur
   * compose la passation. Un client qui désignerait ses items pourrait se
   * composer trente-cinq questions faciles.
   */
  ouvrirPassation(longueur: number): Promise<Resultat<PassationOuverte>>;
  /**
   * Enregistre toutes les réponses d'une passation, en une seule requête.
   *
   * Une par une, il fallait trente-cinq allers-retours : lent, et surtout fragile —
   * un onglet fermé au mauvais moment laissait une passation à demi enregistrée,
   * que la fonction serveur refusait ensuite de clore.
   */
  enregistrerReponses(passationId: string, reponses: ReponseDonnee[]): Promise<Resultat>;
  /**
   * Clôture la passation.
   *
   * Le rapport calculé par le navigateur n'est PAS transmis comme résultat : la
   * fonction serveur recalcule tout à partir du journal des réponses et du corrigé,
   * que le client ne possède pas côté base. C'est ce qui empêche d'afficher un score
   * inventé au classement.
   */
  cloturerPassation(passationId: string): Promise<Resultat<IQReport>>;
  lireRapport(passationId: string): Promise<RapportStocke | null>;
  /** Le corrigé d'une passation close. Refusé tant qu'elle est ouverte. */
  lireCorrige(passationId: string): Promise<CorrectionServeur[]>;
}
