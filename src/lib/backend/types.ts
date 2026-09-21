import type { Aptitude, IQReport, ItemResponse, ValidityVerdict } from '../iq/types';

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

/** Rapport rechargé depuis le serveur, accompagné des identifiants d'items servis. */
export interface RapportStocke {
  rapport: IQReport;
  itemIds: string[];
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
  ouvrirPassation(itemIds: string[]): Promise<Resultat<string>>;
  enregistrerReponse(passationId: string, reponse: ItemResponse): Promise<Resultat>;
  /**
   * Clôture la passation.
   *
   * Le rapport calculé par le navigateur n'est PAS transmis comme résultat : la
   * fonction serveur recalcule tout à partir du journal des réponses et du corrigé,
   * que le client ne possède pas côté base. C'est ce qui empêche d'afficher un score
   * inventé au classement.
   */
  cloturerPassation(passationId: string, items: readonly { id: string }[]): Promise<Resultat<IQReport>>;
  lireRapport(passationId: string): Promise<RapportStocke | null>;
  /** Identifiants servis lors des dernières passations, pour le contrôle d'exposition. */
  itemsRecemmentVus(nombrePassations: number): Promise<string[]>;
}
