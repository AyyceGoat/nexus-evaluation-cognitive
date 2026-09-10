/** Montant du déblocage, en unité mineure. Le franc CFA n'a pas de subdivision. */
export const MONTANT_DEBLOCAGE = 500;
export const DEVISE = 'XOF';

/**
 * Durée de vie d'une transaction. Passé ce délai elle bascule en `expired` et sa
 * référence devient inutilisable — ce qui empêche un webhook très tardif de créditer
 * un rapport que l'utilisateur a peut-être déjà repayé.
 */
export const TTL_MINUTES = 30;

/**
 * Contrainte CinetPay sur le montant, relevée dans la documentation officielle :
 * minimum 100 XOF, et le montant doit être un multiple de 5. 500 satisfait les deux.
 * Vérifié par test, pour qu'un changement de prix ne casse pas l'intégration en silence.
 */
export const MONTANT_MINIMUM_XOF = 100;
export const MULTIPLE_REQUIS = 5;

export type StatutPaiement =
  | 'pending'
  /** État intermédiaire du verrou d'idempotence, côté serveur. Jamais affiché. */
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'expired'
  | 'rejected';

/** Les six cas que le flux doit traiter, chacun avec son écran et son état en base. */
export type CasPaiement =
  | 'reussi'
  | 'echoue'
  | 'en_attente'
  | 'expire'
  | 'rejeu'
  | 'signature_invalide';

export interface Checkout {
  /** Référence unique, générée côté serveur. Jamais fournie par le client. */
  reference: string;
  /** URL du guichet de l'agrégateur, vers laquelle rediriger. */
  redirectUrl: string;
}

export interface EtatPaiement {
  reference: string;
  statut: StatutPaiement;
  montant: number;
  devise: string;
  /** Renseigné pour `failed` et `rejected`. Destiné à l'écran, dit quoi faire. */
  motif?: string;
  /** Horodatage de la dernière transition connue. */
  misAJourLe: string;
}

/**
 * Événement issu d'un webhook, après vérification de signature.
 *
 * `traite` vaut `true` quand la référence a déjà été traitée : c'est l'idempotence.
 * Le webhook renvoie alors un succès à l'agrégateur — qui cesse de réessayer — sans
 * accorder de droit une seconde fois.
 */
export interface EvenementPaiement {
  reference: string;
  statut: StatutPaiement;
  montant: number;
  devise: string;
  motif?: string;
  dejaTraite: boolean;
}

export class SignatureInvalide extends Error {
  constructor(detail: string) {
    super(`Signature de webhook invalide : ${detail}`);
    this.name = 'SignatureInvalide';
  }
}

/**
 * Couche d'abstraction du paiement.
 *
 * Deux implémentations : `sandbox`, complète et locale, qui ne déplace pas d'argent ;
 * et `cinetpay`, dont la logique est écrite et qui n'attend que les clés du compte
 * marchand.
 */
export interface PaymentProvider {
  readonly nom: string;

  /**
   * Ouvre un paiement.
   *
   * `montant` et `planId` sont passés par l'appelant serveur, qui les tient de sa
   * propre table de plans — jamais du client. Un client qui enverrait « 5 FCFA »
   * n'aurait aucun effet.
   */
  createCheckout(
    userId: string,
    planId: string,
    amount: number,
    currency: string
  ): Promise<Checkout>;

  /** Interroge l'agrégateur. C'est cette réponse qui fait foi, pas le retour navigateur. */
  verifyPayment(reference: string): Promise<EtatPaiement>;

  /**
   * Traite un webhook.
   *
   * `rawBody` doit être le corps **brut**, non reparsé : un JSON réencodé change
   * d'octets et invalide la signature. Lève `SignatureInvalide` si la vérification
   * échoue — aucun droit n'est alors accordé.
   */
  handleWebhook(rawBody: string, signature: string | null): Promise<EvenementPaiement>;
}

/** Valide le montant contre les contraintes de l'agrégateur avant tout appel réseau. */
export function montantAcceptable(montant: number, devise: string): boolean {
  if (devise !== 'XOF') return montant > 0;
  return (
    Number.isInteger(montant) &&
    montant >= MONTANT_MINIMUM_XOF &&
    montant % MULTIPLE_REQUIS === 0
  );
}

/**
 * Référence unique et non devinable.
 *
 * L'unicité est portée par une contrainte en base ; ce préfixe lisible sert au support
 * client, et les 128 bits d'aléa empêchent d'énumérer les transactions d'autrui.
 */
export function genererReference(aleatoire: () => string = alea): string {
  const horodatage = Date.now().toString(36).toUpperCase();
  return `NX-${horodatage}-${aleatoire()}`;
}

function alea(): string {
  const octets = new Uint8Array(16);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => o.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24)
    .toUpperCase();
}
