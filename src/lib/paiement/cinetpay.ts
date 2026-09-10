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
 * Provider CinetPay.
 *
 * ── État réel ──
 * Écrit en entier, **jamais exécuté** : aucun compte marchand n'existe, donc aucune
 * clé. Il n'attend que `CINETPAY_API_KEY`, `CINETPAY_SITE_ID` et
 * `CINETPAY_SECRET_KEY`. Voir `docs/PAIEMENT.md` pour l'ouverture du compte.
 *
 * ── Provenance des détails d'intégration ──
 * `docs.cinetpay.com` n'était pas résoluble depuis la machine de développement (DNS).
 * Les éléments ci-dessous viennent de la documentation officielle telle que citée par
 * la recherche, pas d'une page lue directement. Le niveau de certitude de chaque point
 * est consigné dans `docs/PAIEMENT.md` §5. **À relire sur la doc avant la mise en
 * production.**
 *
 * ── Ce provider ne tourne que côté serveur ──
 * `CINETPAY_SECRET_KEY` ne doit jamais atteindre le navigateur. L'implémentation vit
 * dans une Edge Function ; c'est pourquoi rien ici ne dépend de `window`.
 */

const BASE = 'https://api-checkout.cinetpay.com/v2';

export interface ConfigCinetPay {
  apiKey: string;
  siteId: string;
  /** Clé secrète du compte marchand, servant à vérifier le HMAC du webhook. */
  secretKey: string;
  /** URL publique recevant les webhooks. Doit être joignable depuis l'extérieur. */
  notifyUrl: string;
  /** URL de retour du navigateur après paiement. */
  returnUrl: string;
  /** Injectable pour les tests. */
  fetchImpl?: typeof fetch;
}

/**
 * Champs concaténés pour le calcul du HMAC, **dans cet ordre exact**.
 *
 * L'ordre est celui de la documentation CinetPay. Un champ absent compte comme chaîne
 * vide : c'est ce qui rend la concaténation reproductible malgré des corps de webhook
 * partiels.
 */
export const CHAMPS_HMAC = [
  'cpm_site_id',
  'cpm_trans_id',
  'cpm_trans_date',
  'cpm_amount',
  'cpm_currency',
  'signature',
  'payment_method',
  'cel_phone_num',
  'cpm_phone_prefixe',
  'cpm_language',
  'cpm_version',
  'cpm_payment_config',
  'cpm_page_action',
  'cpm_custom',
  'cpm_designation',
  'cpm_error_message',
] as const;

/** Reconstruit la chaîne signée à partir du corps du webhook. Fonction pure, testable. */
export function chaineASigner(champs: Record<string, string | undefined>): string {
  return CHAMPS_HMAC.map((nom) => champs[nom] ?? '').join('');
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const encodeur = new TextEncoder();
  const cle = await crypto.subtle.importKey(
    'raw',
    encodeur.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cle, encodeur.encode(message));
  return Array.from(new Uint8Array(signature), (o) => o.toString(16).padStart(2, '0')).join('');
}

/** Comparaison à temps constant. Une comparaison naïve fuit la signature octet par octet. */
export function egaliteConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return different === 0;
}

/**
 * Vérifie la signature d'un webhook CinetPay.
 *
 * Exportée séparément parce que c'est la partie critique et qu'elle doit être testable
 * sans réseau ni compte marchand : les tests la couvrent, y compris le rejet.
 */
export async function verifierSignatureCinetPay(
  corpsBrut: string,
  signatureRecue: string | null,
  secretKey: string
): Promise<Record<string, string>> {
  if (!signatureRecue) throw new SignatureInvalide('en-tête x-token absent');

  // Le webhook arrive en `application/x-www-form-urlencoded`.
  const champs = Object.fromEntries(new URLSearchParams(corpsBrut));
  const attendue = await hmacSha256Hex(chaineASigner(champs), secretKey);

  if (!egaliteConstante(signatureRecue.toLowerCase(), attendue)) {
    throw new SignatureInvalide('x-token ne correspond pas au corps reçu');
  }
  return champs;
}

/** Correspondance des statuts CinetPay vers les nôtres. */
function versStatut(code: string | undefined): StatutPaiement {
  switch (code) {
    case '00':
    case 'ACCEPTED':
      return 'succeeded';
    case '627':
    case 'REFUSED':
      return 'failed';
    case '623':
    case 'WAITING_FOR_CUSTOMER':
    case 'PENDING':
      return 'pending';
    case '662':
    case 'EXPIRED':
      return 'expired';
    default:
      return 'failed';
  }
}

/** Traduit les codes d'erreur en messages qui disent quoi faire. */
function motif(code: string | undefined, message: string | undefined): string {
  switch (code) {
    case '627':
    case 'REFUSED':
      return 'Le paiement a été refusé par l’opérateur. Vérifiez votre solde, puis réessayez.';
    case '662':
    case 'EXPIRED':
      return 'Le délai de paiement a expiré. Relancez un paiement pour obtenir une nouvelle référence.';
    case 'INSUFFICIENT_BALANCE':
      return 'Le solde de votre compte mobile money est insuffisant.';
    default:
      return message?.trim() || 'Le paiement n’a pas abouti. Vous pouvez réessayer.';
  }
}

export interface CrochetsCinetPay {
  /** Enregistre la transaction avant tout appel réseau, et rend sa référence. */
  ouvrirTransaction(entree: {
    reference: string;
    userId: string;
    planId: string;
    montant: number;
    devise: string;
  }): Promise<void>;
  /** Renvoie `false` si la référence a déjà été traitée : verrou d'idempotence. */
  marquerTraite(reference: string): Promise<boolean>;
  lireStatut(reference: string): Promise<StatutPaiement | null>;
  appliquerStatut(
    reference: string,
    statut: StatutPaiement,
    source: string,
    motif?: string
  ): Promise<void>;
  /** Montant enregistré, pour refuser un webhook qui annoncerait autre chose. */
  montantAttendu(reference: string): Promise<{ montant: number; devise: string } | null>;
}

export function creerProviderCinetPay(
  config: ConfigCinetPay,
  crochets: CrochetsCinetPay
): PaymentProvider {
  const appeler = config.fetchImpl ?? fetch;

  return {
    nom: 'cinetpay',

    async createCheckout(userId, planId, amount, currency) {
      // Contrainte de l'agrégateur : minimum 100 XOF et montant multiple de 5.
      // Vérifiée avant l'appel réseau, pour échouer clairement plutôt que par un 4xx.
      if (!montantAcceptable(amount, currency)) {
        throw new Error(
          `Montant refusé par CinetPay : ${amount} ${currency}. Attendu un entier multiple de 5, au moins 100 XOF.`
        );
      }

      const reference = genererReference();
      await crochets.ouvrirTransaction({ reference, userId, planId, montant: amount, devise: currency });

      const reponse = await appeler(`${BASE}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: config.apiKey,
          site_id: config.siteId,
          transaction_id: reference,
          amount,
          currency,
          description: 'NEXUS — déblocage du rapport complet',
          notify_url: config.notifyUrl,
          return_url: `${config.returnUrl}/${encodeURIComponent(reference)}`,
          channels: 'MOBILE_MONEY',
          lang: 'fr',
        }),
      });

      const donnees = (await reponse.json()) as {
        code?: string;
        message?: string;
        data?: { payment_url?: string };
      };

      if (donnees.code !== '201' || !donnees.data?.payment_url) {
        await crochets.appliquerStatut(
          reference,
          'failed',
          'creation',
          `CinetPay a refusé l’ouverture du paiement : ${donnees.message ?? 'réponse inattendue'}`
        );
        throw new Error(`Ouverture du paiement refusée : ${donnees.message ?? donnees.code}`);
      }

      const checkout: Checkout = { reference, redirectUrl: donnees.data.payment_url };
      return checkout;
    },

    async verifyPayment(reference) {
      const reponse = await appeler(`${BASE}/payment/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: config.apiKey,
          site_id: config.siteId,
          transaction_id: reference,
        }),
      });

      const donnees = (await reponse.json()) as {
        code?: string;
        message?: string;
        data?: { status?: string; amount?: string; currency?: string };
      };

      const statut = versStatut(donnees.data?.status ?? donnees.code);
      const etat: EtatPaiement = {
        reference,
        statut,
        montant: Number(donnees.data?.amount ?? 0),
        devise: donnees.data?.currency ?? 'XOF',
        motif: statut === 'succeeded' ? undefined : motif(donnees.code, donnees.message),
        misAJourLe: new Date().toISOString(),
      };
      return etat;
    },

    async handleWebhook(rawBody, signature) {
      // 1. Signature d'abord. Rien n'est lu du corps avant qu'elle soit validée.
      const champs = await verifierSignatureCinetPay(rawBody, signature, config.secretKey);
      const reference = champs.cpm_trans_id;
      if (!reference) throw new SignatureInvalide('cpm_trans_id absent');

      // 2. Le montant enregistré fait foi, jamais celui du webhook.
      const attendu = await crochets.montantAttendu(reference);
      if (!attendu) throw new SignatureInvalide(`référence inconnue : ${reference}`);

      const montantAnnonce = Number(champs.cpm_amount ?? '0');
      if (montantAnnonce !== attendu.montant || champs.cpm_currency !== attendu.devise) {
        await crochets.appliquerStatut(
          reference,
          'rejected',
          'webhook',
          'Montant ou devise différents de la transaction enregistrée.'
        );
        throw new SignatureInvalide('montant ou devise incohérents');
      }

      // 3. Idempotence : un rejeu ne crédite pas deux fois.
      const premierPassage = await crochets.marquerTraite(reference);
      if (!premierPassage) {
        const statutCourant = (await crochets.lireStatut(reference)) ?? 'pending';
        return {
          reference,
          statut: statutCourant,
          montant: attendu.montant,
          devise: attendu.devise,
          dejaTraite: true,
        } satisfies EvenementPaiement;
      }

      // 4. La notification annonce, l'API confirme. C'est l'appel serveur qui décide.
      const confirme = await this.verifyPayment(reference);
      await crochets.appliquerStatut(reference, confirme.statut, 'webhook', confirme.motif);

      return {
        reference,
        statut: confirme.statut,
        montant: attendu.montant,
        devise: attendu.devise,
        motif: confirme.motif,
        dejaTraite: false,
      } satisfies EvenementPaiement;
    },
  };
}
