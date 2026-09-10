import type { IQReport, ItemResponse, ValidityVerdict } from '../iq/types';

export interface Utilisateur {
  id: string;
  email: string;
}

export interface Profil {
  id: string;
  nomAffiche: string | null;
  /** Nom porté par l'attestation. Distinct du pseudo : une attestation déjà délivrée
   *  ne doit pas être réécrite par un changement de pseudo. */
  nomLegal: string | null;
  onboardeLe: string | null;
}

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
  rapportDebloque: boolean;
}

export type StatutPaiement = 'pending' | 'succeeded' | 'failed' | 'expired' | 'rejected';

export interface Transaction {
  id: string;
  reference: string;
  fournisseur: string;
  montant: number;
  devise: string;
  statut: StatutPaiement;
  creeeLe: string;
  expireLe: string;
  motifEchec: string | null;
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

/** Rapport rechargé depuis le stockage, accompagné des identifiants d'items servis. */
export interface RapportStocke {
  rapport: IQReport;
  itemIds: string[];
}

export type ModeBackend = 'supabase' | 'local';

export interface BackendPort {
  /** Quelle implémentation est active. Affiché à l'utilisateur en mode local. */
  readonly mode: ModeBackend;

  // ── Authentification ────────────────────────────────────────────────────
  utilisateurCourant(): Promise<Utilisateur | null>;
  /** S'abonne aux changements de session. Renvoie la fonction de désabonnement. */
  surChangementAuth(rappel: (utilisateur: Utilisateur | null) => void): () => void;
  inscrire(email: string, motDePasse: string, nomAffiche: string): Promise<Resultat>;
  connecter(email: string, motDePasse: string): Promise<Resultat>;
  deconnecter(): Promise<void>;
  demanderReinitialisation(email: string): Promise<Resultat>;

  // ── Profil ──────────────────────────────────────────────────────────────
  lireProfil(): Promise<Profil | null>;
  majProfil(patch: Partial<Pick<Profil, 'nomAffiche' | 'nomLegal'>>): Promise<Resultat>;
  marquerOnboarde(): Promise<Resultat>;

  // ── Passations ──────────────────────────────────────────────────────────
  listerPassations(): Promise<PassationResume[]>;
  ouvrirPassation(itemIds: string[]): Promise<Resultat<string>>;
  enregistrerReponse(passationId: string, reponse: ItemResponse): Promise<Resultat>;
  /**
   * Clôture la passation.
   *
   * En mode Supabase, le rapport passé ici n'est PAS la source de vérité : la
   * fonction serveur recalcule le score à partir du journal des réponses. Le client
   * n'a pas les paramètres d'items calibrés et ne doit pas décider du résultat.
   */
  cloturerPassation(passationId: string, rapport: IQReport): Promise<Resultat<IQReport>>;
  lireRapport(passationId: string): Promise<RapportStocke | null>;
  /** Identifiants servis lors des dernières passations, pour le contrôle d'exposition. */
  itemsRecemmentVus(nombrePassations: number): Promise<string[]>;

  // ── Droits d'accès ──────────────────────────────────────────────────────
  /** Vérifié serveur. Un booléen côté client n'autorise rien. */
  rapportDebloque(passationId: string): Promise<boolean>;

  // ── Transactions ────────────────────────────────────────────────────────
  listerTransactions(): Promise<Transaction[]>;
}
