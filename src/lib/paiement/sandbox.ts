import { magasinLocal, type MagasinTransactions } from './magasin';
import {
  SignatureInvalide,
  genererReference,
  montantAcceptable,
  type Checkout,
  type EtatPaiement,
  type EvenementPaiement,
  type PaymentProvider,
  type StatutPaiement,
} from './types';

/**
 * Provider sandbox.
 *
 * Il implémente le flux complet — création, TTL, vérification, webhook signé,
 * idempotence, journal des transitions — sans déplacer un franc. Ce n'est pas un
 * simulacre d'interface : la machine à états est celle qui tournera en production, et
 * c'est elle que les tests couvrent.
 *
 * La seule chose qu'il n'a pas, c'est un opérateur mobile money au bout. L'écran de
 * paiement en mode sandbox demande donc explicitement quelle issue simuler, au lieu de
 * faire semblant d'attendre un téléphone qui ne sonnera pas.
 */

/** Secret de développement. En production, la clé vient de l'environnement serveur. */
const SECRET_SANDBOX = 'sandbox-secret-nexus';

export interface CorpsWebhookSandbox {
  reference: string;
  statut: StatutPaiement;
  montant: number;
  devise: string;
  motif?: string;
}

/** HMAC-SHA256 du corps brut. Même principe que la vérification CinetPay. */
export async function signerSandbox(corpsBrut: string, secret = SECRET_SANDBOX): Promise<string> {
  const encodeur = new TextEncoder();
  const cle = await crypto.subtle.importKey(
    'raw',
    encodeur.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cle, encodeur.encode(corpsBrut));
  return Array.from(new Uint8Array(signature), (o) => o.toString(16).padStart(2, '0')).join('');
}

/** Comparaison à temps constant : une comparaison naïve fuit la signature octet par octet. */
export function comparerConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let different = 0;
  for (let i = 0; i < a.length; i++) {
    different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return different === 0;
}

export interface OptionsSandbox {
  magasin?: MagasinTransactions;
  secret?: string;
  /** Injectable pour les tests. */
  reference?: () => string;
}

export function creerProviderSandbox(options: OptionsSandbox = {}): PaymentProvider & {
  magasin: MagasinTransactions;
  /** Fabrique un webhook signé, comme le ferait l'agrégateur. */
  fabriquerWebhook(corps: CorpsWebhookSandbox): Promise<{ rawBody: string; signature: string }>;
} {
  const magasin = options.magasin ?? magasinLocal();
  const secret = options.secret ?? SECRET_SANDBOX;

  return {
    nom: 'sandbox',
    magasin,

    async createCheckout(userId, planId, amount, currency) {
      if (!montantAcceptable(amount, currency)) {
        throw new Error(
          `Montant refusé : ${amount} ${currency}. Attendu un entier multiple de 5, au moins 100 XOF.`
        );
      }

      const reference = (options.reference ?? genererReference)();
      magasin.creer({
        reference,
        userId,
        sessionId: planId.startsWith('rapport:') ? planId.slice('rapport:'.length) : null,
        planId,
        montant: amount,
        devise: currency,
        statut: 'pending',
        creeLe: new Date().toISOString(),
      });

      const checkout: Checkout = {
        reference,
        // Guichet interne : aucun appel réseau, aucune redirection hors du site.
        redirectUrl: `/paiement/${encodeURIComponent(reference)}`,
      };
      return checkout;
    },

    async verifyPayment(reference) {
      // Le TTL est évalué à chaque lecture : sans cela, une transaction abandonnée
      // resterait « en attente » indéfiniment.
      magasin.expirerLesDepassees();

      const enregistrement = magasin.lire(reference);
      if (!enregistrement) {
        throw new Error(`Référence inconnue : ${reference}`);
      }

      const etat: EtatPaiement = {
        reference: enregistrement.reference,
        statut: enregistrement.statut,
        montant: enregistrement.montant,
        devise: enregistrement.devise,
        motif: enregistrement.motif,
        misAJourLe: enregistrement.misAJourLe,
      };
      return etat;
    },

    async handleWebhook(rawBody, signature) {
      if (!signature) {
        throw new SignatureInvalide('en-tête absent');
      }

      const attendue = await signerSandbox(rawBody, secret);
      if (!comparerConstant(signature, attendue)) {
        throw new SignatureInvalide('ne correspond pas au corps reçu');
      }

      let corps: CorpsWebhookSandbox;
      try {
        corps = JSON.parse(rawBody) as CorpsWebhookSandbox;
      } catch {
        throw new SignatureInvalide('corps illisible');
      }

      const enregistrement = magasin.lire(corps.reference);
      if (!enregistrement) {
        throw new SignatureInvalide(`référence inconnue : ${corps.reference}`);
      }

      // Le montant fait foi côté serveur : un webhook qui annoncerait un autre
      // montant que celui enregistré est rejeté, pas appliqué.
      if (corps.montant !== enregistrement.montant || corps.devise !== enregistrement.devise) {
        magasin.changerStatut(
          corps.reference,
          'rejected',
          'webhook',
          'Montant ou devise différents de la transaction enregistrée.'
        );
        throw new SignatureInvalide('montant ou devise incohérents');
      }

      // Verrou d'idempotence : un rejeu n'accorde rien une seconde fois, et le
      // webhook renvoie tout de même un succès pour que l'agrégateur cesse de réessayer.
      const premierPassage = magasin.marquerTraite(corps.reference);
      if (!premierPassage) {
        const evenement: EvenementPaiement = {
          reference: corps.reference,
          statut: enregistrement.statut,
          montant: enregistrement.montant,
          devise: enregistrement.devise,
          motif: enregistrement.motif,
          dejaTraite: true,
        };
        return evenement;
      }

      const apres = magasin.changerStatut(
        corps.reference,
        corps.statut,
        'webhook',
        corps.motif
      );

      return {
        reference: corps.reference,
        statut: apres?.statut ?? corps.statut,
        montant: enregistrement.montant,
        devise: enregistrement.devise,
        motif: apres?.motif,
        dejaTraite: false,
      };
    },

    async fabriquerWebhook(corps) {
      const rawBody = JSON.stringify(corps);
      return { rawBody, signature: await signerSandbox(rawBody, secret) };
    },
  };
}
