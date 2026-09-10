import type { IQReport, ItemResponse } from '../iq/types';
import {
  echec,
  succes,
  type BackendPort,
  type PassationResume,
  type Profil,
  type RapportStocke,
  type Transaction,
  type Utilisateur,
} from './types';

/**
 * Implémentation locale, réservée au développement.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ CE N'EST PAS UNE AUTHENTIFICATION.                                       │
 * │                                                                          │
 * │ Aucun mot de passe n'est vérifié, aucune donnée ne quitte le navigateur, │
 * │ aucun droit d'accès n'est contrôlé côté serveur — il n'y a pas de        │
 * │ serveur. Cet adaptateur existe pour une seule raison : permettre de      │
 * │ faire tourner et de vérifier l'application alors qu'aucun projet         │
 * │ Supabase n'est configuré.                                                │
 * │                                                                          │
 * │ Il ne s'active que si VITE_SUPABASE_URL est absente, et l'interface      │
 * │ affiche alors un bandeau permanent qui le dit à l'utilisateur.           │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Les rapports produits dans ce mode sont calculés dans le navigateur. Ils sont
 * exacts — le moteur est le même — mais rien n'empêcherait de les falsifier. C'est
 * précisément ce que le mode Supabase corrige.
 */

const CLE = 'nexus.dev.v1';

interface EtatLocal {
  utilisateur: Utilisateur | null;
  profil: Profil | null;
  passations: Record<
    string,
    {
      resume: PassationResume;
      itemIds: string[];
      reponses: ItemResponse[];
      rapport: IQReport | null;
    }
  >;
  droits: string[];
  transactions: Transaction[];
}

const etatVide = (): EtatLocal => ({
  utilisateur: null,
  profil: null,
  passations: {},
  droits: [],
  transactions: [],
});

function lire(): EtatLocal {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return etatVide();
    return { ...etatVide(), ...(JSON.parse(brut) as EtatLocal) };
  } catch {
    return etatVide();
  }
}

function ecrire(etat: EtatLocal): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Navigation privée, quota saturé : on continue sans persister plutôt que de
    // faire échouer l'écran.
  }
}

const abonnes = new Set<(u: Utilisateur | null) => void>();

function notifier(utilisateur: Utilisateur | null): void {
  abonnes.forEach((rappel) => rappel(utilisateur));
}

function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export const backendLocal: BackendPort = {
  mode: 'local',

  async utilisateurCourant() {
    return lire().utilisateur;
  },

  surChangementAuth(rappel) {
    abonnes.add(rappel);
    return () => abonnes.delete(rappel);
  },

  async inscrire(email, motDePasse, nomAffiche) {
    if (!emailValide(email)) {
      return echec('Saisissez une adresse e-mail valide, par exemple nom@exemple.ci.');
    }
    if (motDePasse.length < 8) {
      return echec('Le mot de passe doit compter au moins 8 caractères.');
    }

    const etat = lire();
    const utilisateur: Utilisateur = { id: `dev-${Date.now()}`, email: email.trim() };
    etat.utilisateur = utilisateur;
    etat.profil = {
      id: utilisateur.id,
      nomAffiche: nomAffiche.trim() || null,
      nomLegal: null,
      onboardeLe: null,
    };
    ecrire(etat);
    notifier(utilisateur);
    return succes(undefined);
  },

  async connecter(email, motDePasse) {
    if (!emailValide(email)) {
      return echec('Saisissez une adresse e-mail valide, par exemple nom@exemple.ci.');
    }
    if (motDePasse.length < 8) {
      return echec('Le mot de passe doit compter au moins 8 caractères.');
    }

    // Aucun mot de passe n'est vérifié : il n'y a personne pour le vérifier.
    const etat = lire();
    const utilisateur: Utilisateur =
      etat.utilisateur ?? { id: `dev-${Date.now()}`, email: email.trim() };
    etat.utilisateur = utilisateur;
    etat.profil ??= {
      id: utilisateur.id,
      nomAffiche: null,
      nomLegal: null,
      onboardeLe: null,
    };
    ecrire(etat);
    notifier(utilisateur);
    return succes(undefined);
  },

  async deconnecter() {
    const etat = lire();
    etat.utilisateur = null;
    ecrire(etat);
    notifier(null);
  },

  async demanderReinitialisation(email) {
    if (!emailValide(email)) {
      return echec('Saisissez une adresse e-mail valide, par exemple nom@exemple.ci.');
    }
    return echec(
      'Le mode développement local n’envoie pas d’e-mail. Configurez Supabase pour activer la réinitialisation du mot de passe.'
    );
  },

  async lireProfil() {
    return lire().profil;
  },

  async majProfil(patch) {
    const etat = lire();
    if (!etat.profil) return echec('Connectez-vous pour modifier votre profil.');
    etat.profil = { ...etat.profil, ...patch };
    ecrire(etat);
    return succes(undefined);
  },

  async marquerOnboarde() {
    const etat = lire();
    if (!etat.profil) return echec('Connectez-vous pour continuer.');
    etat.profil = { ...etat.profil, onboardeLe: new Date().toISOString() };
    ecrire(etat);
    return succes(undefined);
  },

  async listerPassations() {
    const etat = lire();
    return Object.values(etat.passations)
      .map((p) => ({ ...p.resume, rapportDebloque: etat.droits.includes(p.resume.id) }))
      .sort((a, b) => b.commenceeLe.localeCompare(a.commenceeLe));
  },

  async ouvrirPassation(itemIds) {
    const etat = lire();
    if (!etat.utilisateur) return echec('Connectez-vous pour commencer une évaluation.');

    const id = `sess-${Date.now()}`;
    etat.passations[id] = {
      resume: {
        id,
        commenceeLe: new Date().toISOString(),
        termineeLe: null,
        nombreItems: itemIds.length,
        nombreReussites: 0,
        indice: null,
        borneBasse: null,
        borneHaute: null,
        centile: null,
        verdict: null,
        rapportDebloque: false,
      },
      itemIds,
      reponses: [],
      rapport: null,
    };
    ecrire(etat);
    return succes(id);
  },

  async enregistrerReponse(passationId, reponse) {
    const etat = lire();
    const passation = etat.passations[passationId];
    if (!passation) return echec('Cette évaluation n’existe pas.');
    if (passation.resume.termineeLe) return echec('Cette évaluation est déjà clôturée.');

    passation.reponses = [
      ...passation.reponses.filter((r) => r.itemId !== reponse.itemId),
      reponse,
    ];
    ecrire(etat);
    return succes(undefined);
  },

  async cloturerPassation(passationId, rapport) {
    const etat = lire();
    const passation = etat.passations[passationId];
    if (!passation) return echec('Cette évaluation n’existe pas.');

    passation.rapport = rapport;
    passation.resume = {
      ...passation.resume,
      termineeLe: rapport.createdAt,
      nombreItems: rapport.itemCount,
      nombreReussites: rapport.correctCount,
      indice: rapport.validity.verdict === 'not_interpretable' ? null : rapport.scaled.point,
      borneBasse: rapport.validity.verdict === 'not_interpretable' ? null : rapport.scaled.lower95,
      borneHaute: rapport.validity.verdict === 'not_interpretable' ? null : rapport.scaled.upper95,
      centile: rapport.percentile,
      verdict: rapport.validity.verdict,
    };
    ecrire(etat);
    return succes(rapport);
  },

  async lireRapport(passationId): Promise<RapportStocke | null> {
    const passation = lire().passations[passationId];
    if (!passation?.rapport) return null;
    return { rapport: passation.rapport, itemIds: passation.itemIds };
  },

  async itemsRecemmentVus(nombrePassations) {
    const etat = lire();
    return Object.values(etat.passations)
      .sort((a, b) => b.resume.commenceeLe.localeCompare(a.resume.commenceeLe))
      .slice(0, nombrePassations)
      .flatMap((p) => p.itemIds);
  },

  async rapportDebloque(passationId) {
    return lire().droits.includes(passationId);
  },

  async listerTransactions() {
    return lire()
      .transactions.slice()
      .sort((a, b) => b.creeeLe.localeCompare(a.creeeLe));
  },
};

/** Réservé au provider de paiement sandbox : accorde un droit d'accès en mode local. */
export function accorderDroitLocal(passationId: string, transaction: Transaction): void {
  const etat = lire();
  if (!etat.droits.includes(passationId)) etat.droits.push(passationId);
  etat.transactions = [
    ...etat.transactions.filter((t) => t.reference !== transaction.reference),
    transaction,
  ];
  ecrire(etat);
}

/** Réservé au provider de paiement sandbox : enregistre ou met à jour une transaction. */
export function enregistrerTransactionLocale(transaction: Transaction): void {
  const etat = lire();
  etat.transactions = [
    ...etat.transactions.filter((t) => t.reference !== transaction.reference),
    transaction,
  ];
  ecrire(etat);
}

export function transactionLocale(reference: string): Transaction | null {
  return lire().transactions.find((t) => t.reference === reference) ?? null;
}
