import { TTL_MINUTES, type StatutPaiement } from './types';

/**
 * Magasin de transactions.
 *
 * Cette interface est ce que le provider sandbox et les fonctions serveur partagent :
 * en local elle est portée par `localStorage`, en production par Postgres, où l'unicité
 * de la référence et le journal des transitions sont des contraintes de schéma.
 *
 * L'idempotence n'est pas une politesse : sans elle, un webhook rejoué crédite deux
 * fois. Elle repose ici sur `marquerTraite`, qui échoue si la référence l'est déjà.
 */

export interface Enregistrement {
  reference: string;
  userId: string;
  sessionId: string | null;
  planId: string;
  montant: number;
  devise: string;
  statut: StatutPaiement;
  creeLe: string;
  misAJourLe: string;
  expireLe: string;
  motif?: string;
  /** Vrai dès qu'un webhook a été appliqué. Ce qui rend le rejeu inoffensif. */
  traite: boolean;
}

export interface Transition {
  reference: string;
  de: StatutPaiement | null;
  vers: StatutPaiement;
  source: string;
  survenuLe: string;
  detail?: string;
}

export interface MagasinTransactions {
  creer(entree: Omit<Enregistrement, 'misAJourLe' | 'expireLe' | 'traite'>): Enregistrement;
  lire(reference: string): Enregistrement | null;
  changerStatut(
    reference: string,
    statut: StatutPaiement,
    source: string,
    motif?: string
  ): Enregistrement | null;
  /** Renvoie `false` si la référence a déjà été traitée. C'est le verrou d'idempotence. */
  marquerTraite(reference: string): boolean;
  /** Bascule en `expired` toute transaction en attente dont le TTL est dépassé. */
  expirerLesDepassees(maintenant?: Date): string[];
  transitions(reference: string): Transition[];
  toutes(): Enregistrement[];
}

const CLE = 'nexus.paiements.v1';

interface Etat {
  enregistrements: Record<string, Enregistrement>;
  journal: Transition[];
}

function vide(): Etat {
  return { enregistrements: {}, journal: [] };
}

/**
 * Implémentation sur `localStorage`, pour le développement et les tests.
 *
 * En mémoire lorsque `localStorage` est indisponible (environnement de test Node),
 * ce qui rend les tests indépendants de tout navigateur.
 */
export function magasinLocal(): MagasinTransactions {
  let memoire: Etat | null = null;

  const lireEtat = (): Etat => {
    if (typeof localStorage === 'undefined') return (memoire ??= vide());
    try {
      const brut = localStorage.getItem(CLE);
      return brut ? { ...vide(), ...(JSON.parse(brut) as Etat) } : vide();
    } catch {
      return vide();
    }
  };

  const ecrireEtat = (etat: Etat): void => {
    if (typeof localStorage === 'undefined') {
      memoire = etat;
      return;
    }
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {
      memoire = etat;
    }
  };

  const journaliser = (etat: Etat, transition: Transition): void => {
    etat.journal.push(transition);
  };

  return {
    creer(entree) {
      const etat = lireEtat();
      const maintenant = new Date();
      const enregistrement: Enregistrement = {
        ...entree,
        misAJourLe: maintenant.toISOString(),
        expireLe: new Date(maintenant.getTime() + TTL_MINUTES * 60_000).toISOString(),
        traite: false,
      };
      etat.enregistrements[entree.reference] = enregistrement;
      journaliser(etat, {
        reference: entree.reference,
        de: null,
        vers: entree.statut,
        source: 'creation',
        survenuLe: maintenant.toISOString(),
      });
      ecrireEtat(etat);
      return enregistrement;
    },

    lire(reference) {
      return lireEtat().enregistrements[reference] ?? null;
    },

    changerStatut(reference, statut, source, motif) {
      const etat = lireEtat();
      const existant = etat.enregistrements[reference];
      if (!existant) return null;

      // Un état terminal ne se rouvre pas : c'est ce qui protège des webhooks
      // désordonnés, où un « échoué » tardif suivrait un « réussi ».
      const terminal: StatutPaiement[] = ['succeeded', 'failed', 'expired', 'rejected'];
      if (terminal.includes(existant.statut) && existant.statut !== statut) {
        journaliser(etat, {
          reference,
          de: existant.statut,
          vers: statut,
          source,
          survenuLe: new Date().toISOString(),
          detail: 'transition refusée : état déjà terminal',
        });
        ecrireEtat(etat);
        return existant;
      }

      const maintenant = new Date().toISOString();
      journaliser(etat, {
        reference,
        de: existant.statut,
        vers: statut,
        source,
        survenuLe: maintenant,
        detail: motif,
      });

      etat.enregistrements[reference] = {
        ...existant,
        statut,
        motif: motif ?? existant.motif,
        misAJourLe: maintenant,
      };
      ecrireEtat(etat);
      return etat.enregistrements[reference];
    },

    marquerTraite(reference) {
      const etat = lireEtat();
      const existant = etat.enregistrements[reference];
      if (!existant || existant.traite) return false;
      etat.enregistrements[reference] = { ...existant, traite: true };
      ecrireEtat(etat);
      return true;
    },

    expirerLesDepassees(maintenant = new Date()) {
      const etat = lireEtat();
      const expirees: string[] = [];

      for (const enregistrement of Object.values(etat.enregistrements)) {
        if (enregistrement.statut !== 'pending') continue;
        if (new Date(enregistrement.expireLe) > maintenant) continue;

        expirees.push(enregistrement.reference);
        journaliser(etat, {
          reference: enregistrement.reference,
          de: 'pending',
          vers: 'expired',
          source: 'ttl',
          survenuLe: maintenant.toISOString(),
          detail: `délai de ${TTL_MINUTES} minutes dépassé`,
        });
        etat.enregistrements[enregistrement.reference] = {
          ...enregistrement,
          statut: 'expired',
          motif: 'Le délai de paiement a expiré.',
          misAJourLe: maintenant.toISOString(),
        };
      }

      if (expirees.length > 0) ecrireEtat(etat);
      return expirees;
    },

    transitions(reference) {
      return lireEtat().journal.filter((t) => t.reference === reference);
    },

    toutes() {
      return Object.values(lireEtat().enregistrements).sort((a, b) =>
        b.creeLe.localeCompare(a.creeLe)
      );
    },
  };
}
