/**
 * Clôture une passation et calcule son score.
 *
 * C'est la seule voie par laquelle un score peut être écrit. Le navigateur n'envoie
 * qu'un identifiant de passation : ni score, ni θ, ni justesse de réponse. Tout est
 * recalculé ici depuis `public.iq_responses` (les index choisis) et
 * `public.iq_items` (les paramètres et le corrigé), deux tables qu'aucun client ne
 * peut écrire — et, pour la seconde, qu'aucun client ne peut même lire.
 *
 * Conséquence : forger un score exige de compromettre cette fonction ou la base, pas
 * seulement d'ouvrir les outils de développement du navigateur.
 *
 * Déploiement : voir docs/SUPABASE.md.
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import { calculerResultat, type ItemServeur, type ReponseServeur } from './scoring.ts';

const ENTETES_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...ENTETES_CORS, 'Content-Type': 'application/json' },
  });
}

/** Erreur destinée à l'écran : elle dit quoi faire, pas « une erreur est survenue ». */
function erreur(message: string, statut: number): Response {
  return json({ message }, statut);
}

Deno.serve(async (requete: Request) => {
  if (requete.method === 'OPTIONS') {
    return new Response('ok', { headers: ENTETES_CORS });
  }
  if (requete.method !== 'POST') {
    return erreur('Méthode non autorisée.', 405);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const cleAnon = Deno.env.get('SUPABASE_ANON_KEY');
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !cleAnon || !cleService) {
    console.error('Variables SUPABASE_* absentes de l’environnement de la fonction.');
    return erreur('Le service est mal configuré. Réessayez plus tard.', 500);
  }

  const autorisation = requete.headers.get('Authorization') ?? '';
  if (!autorisation.startsWith('Bearer ')) {
    return erreur('Connectez-vous pour enregistrer votre résultat.', 401);
  }

  // Client « appelant » : sert uniquement à identifier l'utilisateur à partir de son
  // jeton. Il n'écrit rien.
  const clientAppelant = createClient(url, cleAnon, {
    global: { headers: { Authorization: autorisation } },
    auth: { persistSession: false },
  });

  const { data: donneesUtilisateur, error: erreurAuth } = await clientAppelant.auth.getUser();
  const utilisateur = donneesUtilisateur?.user;
  if (erreurAuth || !utilisateur) {
    return erreur('Votre session a expiré. Reconnectez-vous.', 401);
  }

  let corps: { sessionId?: unknown };
  try {
    corps = await requete.json();
  } catch {
    return erreur('Requête illisible.', 400);
  }

  const sessionId = typeof corps.sessionId === 'string' ? corps.sessionId : '';
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return erreur('Identifiant de passation invalide.', 400);
  }

  // Client de service : contourne RLS. C'est lui, et lui seul, qui écrit un score.
  const service = createClient(url, cleService, { auth: { persistSession: false } });

  const { data: passation, error: erreurPassation } = await service
    .from('iq_sessions')
    .select('id, user_id, finished_at, item_count')
    .eq('id', sessionId)
    .maybeSingle();

  if (erreurPassation) {
    console.error('Lecture de la passation impossible', erreurPassation);
    return erreur('Votre résultat n’a pas pu être enregistré. Réessayez.', 500);
  }
  if (!passation || passation.user_id !== utilisateur.id) {
    // Message identique dans les deux cas : ne pas révéler l'existence d'une
    // passation appartenant à quelqu'un d'autre.
    return erreur('Cette passation est introuvable.', 404);
  }

  // Déjà close : on rend le résultat enregistré sans le recalculer. Un double appel
  // ne doit pas produire deux scores, ni republier au classement.
  if (passation.finished_at) {
    const { data: deja } = await service
      .from('iq_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    return json({ dejaClose: true, resultat: versReponse(deja) });
  }

  const { data: reponses, error: erreurReponses } = await service
    .from('iq_responses')
    .select('item_id, selected_index, response_seconds')
    .eq('session_id', sessionId);

  if (erreurReponses || !reponses || reponses.length === 0) {
    return erreur('Aucune réponse enregistrée pour cette passation.', 400);
  }

  const identifiants = [...new Set(reponses.map((r) => r.item_id as string))];
  const { data: items, error: erreurItems } = await service
    .from('iq_items')
    .select('id, aptitude, param_a, param_b, param_c, correct_index, expected_seconds')
    .in('id', identifiants);

  if (erreurItems || !items || items.length !== identifiants.length) {
    console.error('Banque d’items incomplète', { attendus: identifiants.length, trouves: items?.length });
    return erreur('Le calcul du score est indisponible. Réessayez plus tard.', 500);
  }

  const itemsServeur: ItemServeur[] = items.map((i) => ({
    id: i.id as string,
    aptitude: i.aptitude as ItemServeur['aptitude'],
    a: Number(i.param_a),
    b: Number(i.param_b),
    c: Number(i.param_c),
    correctIndex: Number(i.correct_index),
    expectedSeconds: Number(i.expected_seconds),
  }));

  const reponsesServeur: ReponseServeur[] = reponses.map((r) => ({
    itemId: r.item_id as string,
    selectedIndex: Number(r.selected_index),
    responseSeconds: Number(r.response_seconds),
  }));

  const resultat = calculerResultat(itemsServeur, reponsesServeur);

  const { data: close, error: erreurEcriture } = await service
    .from('iq_sessions')
    .update({
      finished_at: new Date().toISOString(),
      item_count: resultat.itemCount,
      correct_count: resultat.correctCount,
      theta: resultat.theta,
      standard_error: resultat.standardError,
      scaled_point: resultat.scaledPoint,
      scaled_lower95: resultat.scaledLower95,
      scaled_upper95: resultat.scaledUpper95,
      percentile: resultat.percentile,
      verdict: resultat.verdict,
      niveau: resultat.niveau,
      aptitudes: resultat.aptitudes,
      validity_message: resultat.validityMessage,
      aberrant_count: resultat.aberrantCount,
      above_chance_p: resultat.aboveChanceP,
      expected_by_chance: resultat.expectedByChance,
    })
    // Verrou : la ligne n'est mise à jour que si elle est encore ouverte. Deux
    // appels concurrents ne peuvent donc pas écrire deux fois.
    .eq('id', sessionId)
    .is('finished_at', null)
    .select('*')
    .maybeSingle();

  if (erreurEcriture) {
    console.error('Écriture du résultat impossible', erreurEcriture);
    return erreur('Votre résultat n’a pas pu être enregistré. Réessayez.', 500);
  }
  if (!close) {
    // Une autre requête a clos la passation entre-temps.
    const { data: deja } = await service
      .from('iq_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    return json({ dejaClose: true, resultat: versReponse(deja) });
  }

  // ── Publication au classement ──────────────────────────────────────────
  //
  // Trois conditions, vérifiées ici et non côté client :
  //   1. l'adresse e-mail est confirmée ;
  //   2. la personne a consenti à figurer et a choisi un pseudonyme ;
  //   3. la passation est exploitable — publier un profil indiscernable du hasard
  //      reviendrait à classer du bruit.
  let publie = false;
  if (utilisateur.email_confirmed_at && resultat.verdict !== 'not_interpretable') {
    const { data: profil } = await service
      .from('profiles')
      .select('pseudonyme, classement_visible')
      .eq('id', utilisateur.id)
      .maybeSingle();

    if (profil?.classement_visible && profil.pseudonyme) {
      const { error: erreurClassement } = await service.from('classement').upsert(
        {
          user_id: utilisateur.id,
          session_id: sessionId,
          pseudonyme: profil.pseudonyme,
          niveau: resultat.niveau,
          score: resultat.scaledPoint,
          borne_basse: resultat.scaledLower95,
          borne_haute: resultat.scaledUpper95,
          centile: resultat.percentile,
          aptitudes: resultat.aptitudes,
          passee_le: close.finished_at,
          publie_le: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (erreurClassement) {
        // Un échec de publication ne doit pas faire perdre le résultat.
        console.error('Publication au classement impossible', erreurClassement);
      } else {
        publie = true;
      }
    }
  }

  return json({ dejaClose: false, publie, resultat: versReponse(close) });
});

/** Forme rendue au client. Aucune donnée d'un autre utilisateur n'y figure. */
function versReponse(ligne: Record<string, unknown> | null) {
  if (!ligne) return null;
  return {
    sessionId: ligne.id,
    startedAt: ligne.started_at,
    finishedAt: ligne.finished_at,
    itemCount: ligne.item_count,
    correctCount: ligne.correct_count,
    theta: ligne.theta,
    standardError: ligne.standard_error,
    scaledPoint: ligne.scaled_point,
    scaledLower95: ligne.scaled_lower95,
    scaledUpper95: ligne.scaled_upper95,
    percentile: ligne.percentile,
    verdict: ligne.verdict,
    niveau: ligne.niveau,
    aptitudes: ligne.aptitudes,
    validityMessage: ligne.validity_message,
    aberrantCount: ligne.aberrant_count,
    aboveChanceP: ligne.above_chance_p,
    expectedByChance: ligne.expected_by_chance,
  };
}
