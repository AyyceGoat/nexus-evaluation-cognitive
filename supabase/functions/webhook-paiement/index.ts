// Runtime Deno. Hors du périmètre de tsconfig et d'ESLint : voir eslint.config.js.
//
// Edge Function : webhook de paiement. C'est la SOURCE DE VÉRITÉ du déblocage.
//
// ÉCRITE MAIS JAMAIS DÉPLOYÉE : aucun projet Supabase, aucune clé marchand.
// Voir docs/RETOUR.md pour la mise en service.
//
// Ordre des opérations, et pourquoi il ne peut pas changer :
//
//  1. Vérifier la SIGNATURE avant de lire quoi que ce soit du corps. Un corps non
//     authentifié n'est pas une donnée, c'est une entrée hostile.
//  2. Comparer le MONTANT à celui enregistré. Le webhook annonce, la base fait foi.
//  3. Poser le VERROU D'IDEMPOTENCE. Sans lui, un rejeu crédite deux fois.
//  4. CONFIRMER auprès de l'API de l'agrégateur. Une notification peut être rejouée,
//     retardée, ou désordonnée ; l'appel serveur tranche.
//  5. Seulement alors, créer le DROIT D'ACCÈS.
//
// Toute erreur de signature est journalisée et n'accorde rien.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CHAMPS_HMAC = [
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
];

Deno.serve(async (requete: Request) => {
  if (requete.method !== 'POST') {
    return new Response('Méthode non autorisée', { status: 405 });
  }

  const client = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Corps BRUT : un JSON reparsé puis réencodé change d'octets et invalide la signature.
  const corpsBrut = await requete.text();
  const fournisseur = Deno.env.get('PAYMENT_PROVIDER') ?? 'sandbox';

  let reference: string | null = null;
  let montantAnnonce = 0;
  let deviseAnnoncee = 'XOF';
  let statutAnnonce = 'pending';

  try {
    if (fournisseur === 'cinetpay') {
      const signature = requete.headers.get('x-token');
      const champs = await verifierCinetPay(
        corpsBrut,
        signature,
        Deno.env.get('CINETPAY_SECRET_KEY')!
      );
      reference = champs.cpm_trans_id ?? null;
      montantAnnonce = Number(champs.cpm_amount ?? '0');
      deviseAnnoncee = champs.cpm_currency ?? 'XOF';
      statutAnnonce = champs.cpm_error_message === 'SUCCES' ? 'succeeded' : 'pending';
    } else {
      const signature = requete.headers.get('x-signature');
      const champs = await verifierSandbox(
        corpsBrut,
        signature,
        Deno.env.get('SANDBOX_WEBHOOK_SECRET') ?? 'sandbox-secret-nexus'
      );
      reference = champs.reference ?? null;
      montantAnnonce = Number(champs.montant ?? 0);
      deviseAnnoncee = champs.devise ?? 'XOF';
      statutAnnonce = champs.statut ?? 'pending';
    }
  } catch (erreur) {
    // Journalisé sans référence : on ne sait pas de quelle transaction il s'agit, et on
    // ne va pas le déduire d'un corps non authentifié.
    await client.from('transaction_events').insert({
      transaction_id: null,
      from_status: null,
      to_status: 'rejected',
      source: 'webhook',
      detail: {
        message: 'Signature invalide, notification rejetée',
        erreur: String(erreur),
        fournisseur,
      },
    });
    // 401 plutôt que 200 : l'agrégateur doit voir que sa notification est refusée.
    return new Response('Signature invalide', { status: 401 });
  }

  if (!reference) {
    return new Response('Référence absente', { status: 400 });
  }

  // ── La base fait foi sur le montant ─────────────────────────────────────
  const { data: transaction } = await client
    .from('transactions')
    .select('id, status, amount, currency, session_id, user_id, expires_at')
    .eq('reference', reference)
    .maybeSingle();

  if (!transaction) {
    return new Response('Référence inconnue', { status: 404 });
  }

  if (montantAnnonce !== transaction.amount || deviseAnnoncee !== transaction.currency) {
    await appliquer(
      client,
      transaction,
      'rejected',
      'Montant ou devise différents de la transaction enregistrée.'
    );
    return new Response('Incohérence de montant', { status: 409 });
  }

  // ── Idempotence ─────────────────────────────────────────────────────────
  // `status = 'pending'` dans le WHERE : la mise à jour ne passe qu'une fois, parce que
  // le second appel ne trouve plus de ligne au statut attendu. C'est le verrou, et il
  // est atomique côté base — pas une vérification puis une écriture.
  const { data: verrou } = await client
    .from('transactions')
    .update({ status: 'processing' })
    .eq('id', transaction.id)
    .eq('status', 'pending')
    .select('id');

  if (!verrou || verrou.length === 0) {
    // Déjà traitée. On renvoie 200 pour que l'agrégateur cesse de réessayer, sans
    // rien accorder une seconde fois.
    await client.from('transaction_events').insert({
      transaction_id: transaction.id,
      from_status: transaction.status,
      to_status: transaction.status,
      source: 'webhook',
      detail: { message: 'Rejeu ignoré : transaction déjà traitée' },
    });
    return new Response('Déjà traitée', { status: 200 });
  }

  // ── TTL ─────────────────────────────────────────────────────────────────
  if (new Date(transaction.expires_at) < new Date()) {
    await appliquer(client, transaction, 'expired', 'Le délai de paiement a expiré.');
    return new Response('Expirée', { status: 200 });
  }

  // ── Confirmation auprès de l'agrégateur : c'est cet appel qui décide ────
  let statutFinal = statutAnnonce;
  let motif: string | undefined;

  if (fournisseur === 'cinetpay') {
    const verification = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: Deno.env.get('CINETPAY_API_KEY'),
        site_id: Deno.env.get('CINETPAY_SITE_ID'),
        transaction_id: reference,
      }),
    });
    const donnees = await verification.json();

    if (donnees?.code === '00') {
      statutFinal = 'succeeded';
    } else if (donnees?.code === '623') {
      statutFinal = 'pending';
    } else {
      statutFinal = 'failed';
      motif =
        donnees?.code === '627'
          ? 'Le paiement a été refusé par l’opérateur. Vérifiez votre solde, puis réessayez.'
          : 'Le paiement n’a pas abouti. Vous pouvez réessayer.';
    }
  }

  await appliquer(client, transaction, statutFinal, motif);

  // ── Droit d'accès ───────────────────────────────────────────────────────
  // Créé ici et nulle part ailleurs. La table n'a aucune politique d'écriture, donc
  // seule cette fonction — avec la clé de service — peut en insérer un.
  if (statutFinal === 'succeeded' && transaction.session_id) {
    const { error } = await client.from('entitlements').insert({
      user_id: transaction.user_id,
      session_id: transaction.session_id,
      transaction_id: transaction.id,
    });

    // La contrainte d'unicité (user_id, session_id) rend l'insertion inoffensive si
    // elle existe déjà : c'est la seconde barrière contre le double crédit.
    if (error && error.code !== '23505') {
      await client.from('transaction_events').insert({
        transaction_id: transaction.id,
        from_status: statutFinal,
        to_status: statutFinal,
        source: 'webhook',
        detail: { message: 'Droit non créé', erreur: error.message },
      });
      return new Response('Droit non créé', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
});

async function appliquer(
  client: ReturnType<typeof createClient>,
  transaction: { id: string; status: string },
  statut: string,
  motif?: string
): Promise<void> {
  await client
    .from('transactions')
    .update({ status: statut, failure_reason: motif ?? null })
    .eq('id', transaction.id);

  await client.from('transaction_events').insert({
    transaction_id: transaction.id,
    from_status: transaction.status,
    to_status: statut,
    source: 'webhook',
    detail: motif ? { message: motif } : null,
  });
}

async function hmacHex(message: string, secret: string): Promise<string> {
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

/** Comparaison à temps constant : une comparaison naïve fuit la signature octet par octet. */
function egal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return different === 0;
}

async function verifierCinetPay(
  corpsBrut: string,
  signature: string | null,
  secret: string
): Promise<Record<string, string>> {
  if (!signature) throw new Error('en-tête x-token absent');
  const champs = Object.fromEntries(new URLSearchParams(corpsBrut));
  const chaine = CHAMPS_HMAC.map((nom) => champs[nom] ?? '').join('');
  const attendue = await hmacHex(chaine, secret);
  if (!egal(signature.toLowerCase(), attendue)) throw new Error('x-token ne correspond pas');
  return champs;
}

async function verifierSandbox(
  corpsBrut: string,
  signature: string | null,
  secret: string
): Promise<Record<string, string>> {
  if (!signature) throw new Error('en-tête x-signature absent');
  const attendue = await hmacHex(corpsBrut, secret);
  if (!egal(signature.toLowerCase(), attendue)) throw new Error('x-signature ne correspond pas');
  return JSON.parse(corpsBrut);
}
