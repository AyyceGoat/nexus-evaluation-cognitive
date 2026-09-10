// Runtime Deno. Hors du périmètre de tsconfig et d'ESLint : voir eslint.config.js.
//
// Edge Function : ouvre un paiement.
//
// ÉCRITE MAIS JAMAIS DÉPLOYÉE : aucun projet Supabase n'existe. Voir docs/RETOUR.md.
//
// Ce qui se joue ici, et pourquoi ça ne peut pas vivre côté navigateur :
//
// 1. Le MONTANT et le PLAN sont déterminés ici, à partir d'une table de plans côté
//    serveur. Le client n'envoie que l'identifiant de la passation à débloquer. Un
//    client qui enverrait « montant : 5 » n'aurait aucun effet.
// 2. La RÉFÉRENCE est générée ici. Son unicité est portée par une contrainte de base,
//    et c'est elle qui rend le webhook idempotent.
// 3. Les CLÉS de l'agrégateur ne quittent jamais le serveur.
// 4. Le RATE LIMITING empêche d'ouvrir des milliers de transactions en attente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MONTANT_PAR_PLAN: Record<string, { montant: number; devise: string }> = {
  // Un seul plan : déblocage unique du rapport complet.
  rapport_complet: { montant: 500, devise: 'XOF' },
};

const TTL_MINUTES = 30;

/** Nombre maximal de transactions ouvertes par utilisateur et par fenêtre. */
const LIMITE_PAR_FENETRE = 5;
const FENETRE_MINUTES = 10;

Deno.serve(async (requete: Request) => {
  if (requete.method !== 'POST') {
    return reponse({ erreur: 'Méthode non autorisée.' }, 405);
  }

  const jeton = requete.headers.get('Authorization');
  if (!jeton) {
    return reponse({ erreur: 'Connectez-vous pour effectuer un paiement.' }, 401);
  }

  // Client « utilisateur » : sert uniquement à identifier l'appelant, sous RLS.
  const clientUtilisateur = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: jeton } } }
  );

  const { data: auth } = await clientUtilisateur.auth.getUser();
  const utilisateur = auth?.user;
  if (!utilisateur) {
    return reponse({ erreur: 'Votre session a expiré. Reconnectez-vous.' }, 401);
  }

  let corps: { session_id?: string; plan_id?: string };
  try {
    corps = await requete.json();
  } catch {
    return reponse({ erreur: 'Corps de requête illisible.' }, 400);
  }

  const planId = corps.plan_id ?? 'rapport_complet';
  const plan = MONTANT_PAR_PLAN[planId];
  if (!plan) {
    return reponse({ erreur: 'Plan inconnu.' }, 400);
  }

  // Contrainte de l'agrégateur : au moins 100 XOF, et multiple de 5.
  if (plan.devise === 'XOF' && (plan.montant < 100 || plan.montant % 5 !== 0)) {
    return reponse({ erreur: 'Configuration de plan invalide.' }, 500);
  }

  // Client « service » : contourne RLS. Nécessaire pour écrire dans `transactions`,
  // qui n'a aucune politique d'insertion — précisément pour qu'aucun client ne puisse
  // s'y créer une ligne.
  const clientService = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // ── Rate limiting ───────────────────────────────────────────────────────
  const depuis = new Date(Date.now() - FENETRE_MINUTES * 60_000).toISOString();
  const { count } = await clientService
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', utilisateur.id)
    .gte('created_at', depuis);

  if ((count ?? 0) >= LIMITE_PAR_FENETRE) {
    return reponse(
      {
        erreur: `Trop de paiements ouverts. Patientez ${FENETRE_MINUTES} minutes avant de réessayer.`,
      },
      429
    );
  }

  // ── La passation doit appartenir à l'appelant ────────────────────────────
  if (corps.session_id) {
    const { data: passation } = await clientService
      .from('iq_sessions')
      .select('id, user_id')
      .eq('id', corps.session_id)
      .maybeSingle();

    if (!passation || passation.user_id !== utilisateur.id) {
      return reponse({ erreur: 'Cette évaluation ne vous appartient pas.' }, 403);
    }

    // Déjà débloqué : on ne fait pas payer deux fois.
    const { data: droit } = await clientService
      .from('entitlements')
      .select('id')
      .eq('user_id', utilisateur.id)
      .eq('session_id', corps.session_id)
      .maybeSingle();

    if (droit) {
      return reponse({ erreur: 'Ce rapport est déjà débloqué.' }, 409);
    }
  }

  // ── Création de la transaction, avant tout appel à l'agrégateur ──────────
  const reference = genererReference();
  const expireLe = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();
  const fournisseur = Deno.env.get('PAYMENT_PROVIDER') ?? 'sandbox';

  const { error: erreurInsertion } = await clientService.from('transactions').insert({
    user_id: utilisateur.id,
    session_id: corps.session_id ?? null,
    reference,
    provider: fournisseur,
    amount: plan.montant,
    currency: plan.devise,
    status: 'pending',
    expires_at: expireLe,
  });

  if (erreurInsertion) {
    return reponse({ erreur: 'La transaction n’a pas pu être ouverte. Réessayez.' }, 500);
  }

  await journaliser(clientService, reference, null, 'pending', 'creation');

  // ── Ouverture chez l'agrégateur ─────────────────────────────────────────
  if (fournisseur === 'sandbox') {
    // Guichet interne : le flux complet est jouable sans compte marchand.
    return reponse({
      reference,
      redirectUrl: `/paiement/${encodeURIComponent(reference)}`,
    });
  }

  const site = Deno.env.get('PUBLIC_SITE_URL')!;
  const reponseCinetPay = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: Deno.env.get('CINETPAY_API_KEY'),
      site_id: Deno.env.get('CINETPAY_SITE_ID'),
      transaction_id: reference,
      amount: plan.montant,
      currency: plan.devise,
      description: 'NEXUS — déblocage du rapport complet',
      notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-paiement`,
      return_url: `${site}/paiement/${encodeURIComponent(reference)}`,
      channels: 'MOBILE_MONEY',
      lang: 'fr',
    }),
  });

  const donnees = await reponseCinetPay.json();

  if (donnees?.code !== '201' || !donnees?.data?.payment_url) {
    await appliquerStatut(
      clientService,
      reference,
      'failed',
      'creation',
      `L’agrégateur a refusé l’ouverture : ${donnees?.message ?? 'réponse inattendue'}`
    );
    return reponse(
      { erreur: 'Le service de paiement est indisponible. Réessayez dans quelques minutes.' },
      502
    );
  }

  return reponse({ reference, redirectUrl: donnees.data.payment_url });
});

function reponse(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  });
}

function genererReference(): string {
  const horodatage = Date.now().toString(36).toUpperCase();
  const octets = new Uint8Array(16);
  crypto.getRandomValues(octets);
  const aleatoire = Array.from(octets, (o) => o.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24)
    .toUpperCase();
  return `NX-${horodatage}-${aleatoire}`;
}

async function journaliser(
  client: ReturnType<typeof createClient>,
  reference: string,
  de: string | null,
  vers: string,
  source: string,
  detail?: string
): Promise<void> {
  const { data } = await client
    .from('transactions')
    .select('id')
    .eq('reference', reference)
    .maybeSingle();
  if (!data) return;

  await client.from('transaction_events').insert({
    transaction_id: data.id,
    from_status: de,
    to_status: vers,
    source,
    detail: detail ? { message: detail } : null,
  });
}

async function appliquerStatut(
  client: ReturnType<typeof createClient>,
  reference: string,
  statut: string,
  source: string,
  motif?: string
): Promise<void> {
  const { data } = await client
    .from('transactions')
    .select('id, status')
    .eq('reference', reference)
    .maybeSingle();
  if (!data) return;

  await client
    .from('transactions')
    .update({ status: statut, failure_reason: motif ?? null })
    .eq('id', data.id);

  await client.from('transaction_events').insert({
    transaction_id: data.id,
    from_status: data.status,
    to_status: statut,
    source,
    detail: motif ? { message: motif } : null,
  });
}
