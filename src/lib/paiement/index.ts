import { accorderDroitLocal, enregistrerTransactionLocale } from '../backend/local';
import { modeDeveloppementLocal } from '../backend';
import { magasinLocal } from './magasin';
import { creerProviderSandbox } from './sandbox';
import { DEVISE, MONTANT_DEBLOCAGE, type StatutPaiement } from './types';

/**
 * Sélection du fournisseur de paiement côté navigateur.
 *
 * En mode développement local, le provider sandbox tourne dans le navigateur : c'est
 * le seul moyen de jouer le flux complet sans compte marchand ni serveur. L'écran de
 * paiement affiche alors, en toutes lettres, qu'il s'agit d'un guichet de test et que
 * rien n'est débité.
 *
 * Dès qu'un backend est configuré, le navigateur n'ouvre plus rien lui-même : il
 * appelle l'Edge Function `creer-paiement`, qui détient les clés, fixe le montant et
 * génère la référence. Le webhook, lui, n'a jamais de version navigateur — par
 * construction, puisqu'il doit vérifier une signature avec un secret serveur.
 */

const magasin = magasinLocal();

export const providerSandbox = creerProviderSandbox({ magasin });

export const paiementEnLocal = modeDeveloppementLocal;

export interface OuvertureCheckout {
  reference: string;
  redirectUrl: string;
}

/** Ouvre un paiement pour débloquer le rapport d'une passation. */
export async function ouvrirPaiement(
  userId: string,
  passationId: string
): Promise<OuvertureCheckout> {
  if (paiementEnLocal) {
    const checkout = await providerSandbox.createCheckout(
      userId,
      `rapport:${passationId}`,
      MONTANT_DEBLOCAGE,
      DEVISE
    );
    synchroniserTransaction(checkout.reference);
    return checkout;
  }

  // Le montant n'est pas transmis : c'est la fonction serveur qui le détermine.
  const reponse = await fetch('/api/creer-paiement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: passationId, plan_id: 'rapport_complet' }),
  });

  if (!reponse.ok) {
    const donnees = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
    throw new Error(
      donnees?.erreur ?? 'Le paiement n’a pas pu être ouvert. Réessayez dans un instant.'
    );
  }

  return (await reponse.json()) as OuvertureCheckout;
}

export async function etatPaiement(reference: string) {
  if (paiementEnLocal) return providerSandbox.verifyPayment(reference);

  const reponse = await fetch(`/api/etat-paiement?reference=${encodeURIComponent(reference)}`);
  if (!reponse.ok) throw new Error('L’état du paiement n’a pas pu être lu.');
  return (await reponse.json()) as Awaited<ReturnType<typeof providerSandbox.verifyPayment>>;
}

/**
 * Rejoue localement ce que fera l'agrégateur : un webhook signé.
 *
 * Réservé au mode sandbox. Le webhook est authentifié comme le vrai — signature HMAC
 * comprise — de sorte que le chemin de code exercé ici soit celui de la production.
 */
export async function simulerWebhookSandbox(
  reference: string,
  statut: StatutPaiement,
  motif?: string
): Promise<void> {
  if (!paiementEnLocal) {
    throw new Error('Le guichet de test n’existe qu’en mode développement local.');
  }

  const { rawBody, signature } = await providerSandbox.fabriquerWebhook({
    reference,
    statut,
    montant: MONTANT_DEBLOCAGE,
    devise: DEVISE,
    motif,
  });

  const evenement = await providerSandbox.handleWebhook(rawBody, signature);
  synchroniserTransaction(reference);

  // Le droit d'accès n'est créé que sur un succès effectivement appliqué. Un rejeu
  // repasse ici avec `dejaTraite`, et n'accorde donc rien de plus.
  if (evenement.statut === 'succeeded' && !evenement.dejaTraite) {
    const enregistrement = magasin.lire(reference);
    if (enregistrement?.sessionId) {
      accorderDroitLocal(enregistrement.sessionId, versTransaction(reference)!);
    }
  }
}

/** Envoie une signature volontairement fausse, pour exercer le cas de rejet. */
export async function simulerWebhookNonSigne(reference: string): Promise<void> {
  if (!paiementEnLocal) {
    throw new Error('Le guichet de test n’existe qu’en mode développement local.');
  }
  const { rawBody } = await providerSandbox.fabriquerWebhook({
    reference,
    statut: 'succeeded',
    montant: MONTANT_DEBLOCAGE,
    devise: DEVISE,
  });
  await providerSandbox.handleWebhook(rawBody, null);
}

/** Force l'expiration, pour exercer le cas du TTL sans attendre trente minutes. */
export function forcerExpirationSandbox(): string[] {
  const expirees = magasin.expirerLesDepassees(new Date(Date.now() + 60 * 60_000));
  expirees.forEach(synchroniserTransaction);
  return expirees;
}

export function transitionsSandbox(reference: string) {
  return magasin.transitions(reference);
}

function versTransaction(reference: string) {
  const enregistrement = magasin.lire(reference);
  if (!enregistrement) return null;
  return {
    id: enregistrement.reference,
    reference: enregistrement.reference,
    fournisseur: 'sandbox',
    montant: enregistrement.montant,
    devise: enregistrement.devise,
    statut: enregistrement.statut,
    creeeLe: enregistrement.creeLe,
    expireLe: enregistrement.expireLe,
    motifEchec: enregistrement.motif ?? null,
  };
}

/** Répercute l'état du magasin de paiement dans l'historique visible par l'utilisateur. */
function synchroniserTransaction(reference: string): void {
  const transaction = versTransaction(reference);
  if (transaction) enregistrerTransactionLocale(transaction);
}

export { MONTANT_DEBLOCAGE, DEVISE, TTL_MINUTES } from './types';
export type { EtatPaiement, StatutPaiement } from './types';
