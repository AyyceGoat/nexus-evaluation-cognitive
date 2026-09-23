/**
 * Vérifie les règles d'accès sur un vrai projet Supabase, en tentant de les violer.
 *
 * Ce script ne relit pas le schéma pour vérifier qu'une politique existe : il se
 * connecte avec une clé anon, comme n'importe quel visiteur, et ESSAIE de tricher.
 * Une politique qu'on croit écrite et un refus qu'on a constaté ne sont pas la même
 * chose.
 *
 * Tentatives couvertes :
 *   - lire les passations, réponses et profil d'un autre utilisateur ;
 *   - lire le corrigé de la banque d'items, directement ou par la fonction ;
 *   - obtenir le corrigé d'une passation encore ouverte ;
 *   - écrire un score à la main (INSERT et UPDATE sur iq_sessions) ;
 *   - s'inscrire au classement directement (INSERT, UPDATE, DELETE) ;
 *   - se déclarer visible au classement par un UPDATE direct du profil ;
 *   - déclarer soi-même qu'une réponse est juste ;
 *   - répondre à un item qui n'a pas été servi ;
 *   - figurer au classement avec un compte anonyme.
 *
 * Prérequis : un fichier `.env` renseigné, avec VITE_SUPABASE_URL,
 * VITE_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY (cette dernière uniquement
 * pour créer les comptes de test et lire le corrigé côté harnais ; elle n'est
 * jamais utilisée pour les vérifications elles-mêmes).
 *
 * Usage : node scripts/verifie-rls.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { exigerEnv } from './env.mjs';

/* ── Configuration ────────────────────────────────────────────────────────── */

const env = exigerEnv(
  ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  'Voir docs/SUPABASE.md. La cle de service sert uniquement au harnais de test,\net ne doit jamais etre commitee.'
);

const URL = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

/* ── Journal ──────────────────────────────────────────────────────────────── */

let echecs = 0;
const resultats = [];

function verifier(nom, reussi, detail = '') {
  if (!reussi) echecs++;
  resultats.push({ nom, reussi, detail });
  console.log(`${reussi ? 'OK     ' : 'ECHEC  '} ${nom}${detail ? '  — ' + detail : ''}`);
}

/** Une tentative d'écriture DOIT échouer. Un succès est une faille. */
function doitEchouer(nom, { error, data }) {
  const refuse = Boolean(error) || data === null || (Array.isArray(data) && data.length === 0);
  verifier(
    nom,
    refuse,
    error
      ? `refus : ${String(error.message).slice(0, 70)}`
      : refuse
        ? 'aucune ligne écrite'
        : 'ECRITURE ACCEPTEE'
  );
}

/** Une lecture DOIT ne rien rendre. */
function doitEtreVide(nom, { error, data }) {
  const vide = Boolean(error) || !data || (Array.isArray(data) && data.length === 0);
  verifier(
    nom,
    vide,
    error
      ? `refus : ${String(error.message).slice(0, 70)}`
      : vide
        ? '0 ligne'
        : `${data.length} LIGNES LUES`
  );
}

/** Un appel DOIT être refusé par le serveur. */
function appelRefuse(nom, { error }) {
  verifier(
    nom,
    Boolean(error),
    error ? `refus : ${String(error.message).slice(0, 70)}` : 'APPEL ACCEPTE'
  );
}

/* ── Comptes de test ──────────────────────────────────────────────────────── */

const service = createClient(URL, SERVICE, { auth: { persistSession: false } });
const marque = Date.now().toString(36);
const comptes = [];

async function creerCompte(role, confirme = true) {
  const email = `rls-${role}-${marque}@nexus-test.invalid`;
  const motDePasse = `Test-${marque}-${role}!`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: confirme,
    user_metadata: { display_name: `Test ${role}` },
  });
  if (error || !data.user) {
    throw new Error(`Création du compte ${role} impossible : ${error?.message}`);
  }
  comptes.push(data.user.id);
  return { id: data.user.id, email, motDePasse };
}

async function clientConnecte(compte) {
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({
    email: compte.email,
    password: compte.motDePasse,
  });
  if (error) throw new Error(`Connexion impossible : ${error.message}`);
  return client;
}

async function nettoyer() {
  for (const id of comptes) {
    await service.auth.admin.deleteUser(id).catch(() => {});
  }
}

/** Le corrigé, lu par le harnais avec la clé de service. Aucun client ne peut. */
async function corrigeHarnais(identifiants) {
  const { data } = await service
    .from('iq_items')
    .select('id, correct_index, expected_seconds')
    .in('id', identifiants);
  return new Map((data ?? []).map((i) => [i.id, i]));
}

/* ── Vérifications ────────────────────────────────────────────────────────── */

try {
  console.log('Projet : configure depuis .env');
  console.log('');

  const alice = await creerCompte('alice');
  const bob = await creerCompte('bob');
  const clientAlice = await clientConnecte(alice);
  const clientBob = await clientConnecte(bob);
  const anonyme = createClient(URL, ANON, { auth: { persistSession: false } });

  // Passation d'Alice, ouverte par la voie normale : c'est le SERVEUR qui choisit
  // les items, le client ne les désigne plus.
  const { data: passationAlice, error: erreurOuverture } = await clientAlice.rpc(
    'ouvrir_passation',
    { p_longueur: 30 }
  );

  console.log('── 1. Ouverture et lecture de ses seules données ─────────────');

  verifier(
    'Alice ouvre une passation par la fonction serveur',
    !erreurOuverture && typeof passationAlice === 'string',
    erreurOuverture?.message ?? ''
  );

  const { data: siennes } = await clientAlice
    .from('iq_sessions')
    .select('id, item_count')
    .eq('id', passationAlice);
  verifier(
    'Alice lit sa propre passation',
    (siennes ?? []).length === 1,
    `${siennes?.[0]?.item_count} items administrés`
  );
  verifier(
    'Le serveur a servi les 30 items demandés',
    siennes?.[0]?.item_count === 30,
    `${siennes?.[0]?.item_count}`
  );

  doitEtreVide(
    'Bob ne lit pas la passation d’Alice',
    await clientBob.from('iq_sessions').select('id').eq('id', passationAlice)
  );
  doitEtreVide(
    'Bob ne lit pas le profil d’Alice',
    await clientBob.from('profiles').select('id').eq('id', alice.id)
  );
  doitEtreVide(
    'Bob ne lit pas les réponses d’Alice',
    await clientBob.from('iq_responses').select('id').eq('user_id', alice.id)
  );
  doitEtreVide(
    'Un visiteur anonyme ne lit aucune passation',
    await anonyme.from('iq_sessions').select('id').limit(5)
  );
  doitEtreVide(
    'Un visiteur anonyme ne lit aucun profil',
    await anonyme.from('profiles').select('id').limit(5)
  );
  const { data: siensItems } = await clientAlice
    .from('iq_session_items')
    .select('item_id')
    .eq('session_id', passationAlice);
  verifier(
    'Alice lit les items de sa propre passation',
    (siensItems ?? []).length === 30,
    `${siensItems?.length} items`
  );
  doitEtreVide(
    'Bob ne lit pas les items administrés à Alice',
    await clientBob.from('iq_session_items').select('item_id').eq('session_id', passationAlice)
  );
  doitEtreVide(
    'Un visiteur anonyme ne lit aucun item administré',
    await anonyme.from('iq_session_items').select('item_id').limit(5)
  );

  console.log('');
  console.log('── 2. Les questions servies ne portent pas le corrigé ────────');

  const { data: questions, error: erreurQuestions } = await clientAlice.rpc(
    'items_de_passation',
    { p_session_id: passationAlice }
  );

  verifier(
    'Alice reçoit les questions de sa passation',
    !erreurQuestions && Array.isArray(questions) && questions.length === 30,
    erreurQuestions?.message ?? `${questions?.length} questions`
  );

  const champsServis = questions?.[0] ? Object.keys(questions[0]).sort() : [];
  verifier(
    'Les questions servies ne contiennent NI correct_index, NI explication, NI raisonnement',
    champsServis.length > 0 &&
      !champsServis.includes('correct_index') &&
      !champsServis.includes('explanation') &&
      !champsServis.includes('reasoning'),
    champsServis.join(', ')
  );
  verifier(
    'Les questions servies contiennent de quoi les afficher',
    (questions ?? []).every(
      (q) => typeof q.prompt === 'string' && q.prompt.length > 0 && (q.options || q.visual)
    )
  );
  verifier(
    'Aucune valeur servie ne laisse fuir un indice de bonne réponse',
    !JSON.stringify(questions ?? []).match(/correct|reponse_juste|answer/i)
  );

  doitEtreVide(
    'Alice ne lit pas la banque d’items directement',
    await clientAlice.from('iq_items').select('id, correct_index').limit(5)
  );
  doitEtreVide(
    'Un visiteur anonyme ne lit pas la banque d’items',
    await anonyme.from('iq_items').select('id, correct_index').limit(5)
  );
  appelRefuse(
    'Bob ne peut pas demander les questions de la passation d’Alice',
    await clientBob.rpc('items_de_passation', { p_session_id: passationAlice })
  );

  console.log('');
  console.log('── 3. Le corrigé d’une passation ouverte est refusé ──────────');

  appelRefuse(
    'Alice ne peut pas obtenir le corrigé avant d’avoir terminé',
    await clientAlice.rpc('corrige_de_passation', { p_session_id: passationAlice })
  );
  appelRefuse(
    'Bob ne peut pas obtenir le corrigé d’Alice',
    await clientBob.rpc('corrige_de_passation', { p_session_id: passationAlice })
  );

  console.log('');
  console.log('── 4. Écrire un score à la main ──────────────────────────────');

  doitEchouer(
    'Alice ne peut pas créer une passation avec un score',
    await clientAlice
      .from('iq_sessions')
      .insert({
        user_id: alice.id,
        item_count: 35,
        correct_count: 35,
        scaled_point: 145,
        scaled_lower95: 140,
        scaled_upper95: 150,
        theta: 3,
        standard_error: 0.1,
        verdict: 'ok',
        niveau: 'exceptionnel',
        finished_at: new Date().toISOString(),
      })
      .select('id')
  );
  doitEchouer(
    'Alice ne peut pas modifier le score de sa passation',
    await clientAlice
      .from('iq_sessions')
      .update({
        scaled_point: 160,
        niveau: 'exceptionnel',
        finished_at: new Date().toISOString(),
      })
      .eq('id', passationAlice)
      .select('id')
  );
  doitEchouer(
    'Bob ne peut pas modifier la passation d’Alice',
    await clientBob
      .from('iq_sessions')
      .update({ scaled_point: 160 })
      .eq('id', passationAlice)
      .select('id')
  );
  doitEchouer(
    'Alice ne peut pas s’ajouter des items',
    await clientAlice
      .from('iq_session_items')
      .insert({ session_id: passationAlice, item_id: 'mat-01', ordre: 99 })
      .select('item_id')
  );

  console.log('');
  console.log('── 5. Écrire directement au classement ───────────────────────');

  doitEchouer(
    'Alice ne peut pas s’insérer au classement',
    await clientAlice
      .from('classement')
      .insert({
        user_id: alice.id,
        session_id: passationAlice,
        pseudonyme: 'TricheurA',
        niveau: 'exceptionnel',
        score: 160,
        borne_basse: 155,
        borne_haute: 160,
        centile: 99,
        aptitudes: [],
        passee_le: new Date().toISOString(),
      })
      .select('user_id')
  );
  doitEchouer(
    'Alice ne peut pas modifier une ligne du classement',
    await clientAlice
      .from('classement')
      .update({ score: 160 })
      .eq('user_id', alice.id)
      .select('user_id')
  );
  doitEchouer(
    'Alice ne peut pas supprimer une ligne du classement',
    await clientAlice.from('classement').delete().neq('score', -1).select('user_id')
  );
  // La vue est repassee en `security_invoker` pour satisfaire l'Advisor : ce sont
  // desormais les PRIVILEGES DE COLONNE qui gardent user_id prive, et non
  // l'absence de politique de lecture. On verifie donc le privilege, pas le vide.
  appelRefuse(
    'Alice ne peut pas lire user_id dans le classement',
    await clientAlice.from('classement').select('user_id').limit(5)
  );
  appelRefuse(
    'Alice ne peut pas lire session_id dans le classement',
    await clientAlice.from('classement').select('session_id').limit(5)
  );
  appelRefuse(
    'Un visiteur anonyme ne peut pas lire user_id dans le classement',
    await anonyme.from('classement').select('user_id').limit(5)
  );
  appelRefuse(
    'Une etoile sur le classement est refusee, car elle inclurait user_id',
    await anonyme.from('classement').select('*').limit(1)
  );
  {
    const { error: e } = await anonyme.from('classement').select('pseudonyme, score').limit(1);
    verifier(
      'Les colonnes publiques du classement restent lisibles',
      !e,
      e?.message.slice(0, 60) ?? ''
    );
  }
  doitEchouer(
    'Un visiteur anonyme ne peut pas écrire au classement',
    await anonyme
      .from('classement')
      .insert({
        user_id: alice.id,
        session_id: passationAlice,
        pseudonyme: 'Anonyme',
        niveau: 'exceptionnel',
        score: 160,
        borne_basse: 155,
        borne_haute: 160,
        aptitudes: [],
        passee_le: new Date().toISOString(),
      })
      .select('user_id')
  );

  console.log('');
  console.log('── 6. Consentement et pseudonyme ─────────────────────────────');

  doitEchouer(
    'Alice ne peut pas se rendre visible par un UPDATE direct',
    await clientAlice
      .from('profiles')
      .update({ classement_visible: true })
      .eq('id', alice.id)
      .select('id')
  );
  doitEchouer(
    'Alice ne peut pas écrire son pseudonyme par un UPDATE direct',
    await clientAlice
      .from('profiles')
      .update({ pseudonyme: 'Contournement' })
      .eq('id', alice.id)
      .select('id')
  );

  const { error: erreurPseudo } = await clientAlice.rpc('definir_pseudonyme', {
    p_pseudonyme: `Alice${marque.slice(-4)}`,
  });
  verifier(
    'Alice peut choisir un pseudonyme par la fonction serveur',
    !erreurPseudo,
    erreurPseudo?.message ?? ''
  );

  const { error: erreurVisible } = await clientAlice.rpc('definir_visibilite_classement', {
    p_visible: true,
    p_pseudonyme: null,
  });
  verifier(
    'Alice peut demander à figurer au classement',
    !erreurVisible,
    erreurVisible?.message ?? ''
  );

  const { data: avantCloture } = await anonyme.from('v_classement').select('pseudonyme');
  verifier(
    'Aucune ligne n’est publiée sans passation close',
    !(avantCloture ?? []).some((l) => l.pseudonyme.startsWith('Alice')),
    `${(avantCloture ?? []).length} ligne(s) au classement`
  );

  console.log('');
  console.log('── 7. Déclarer soi-même qu’une réponse est juste ─────────────');

  const identifiants = (questions ?? []).map((q) => q.id);
  const corrige = await corrigeHarnais(identifiants);

  const { error: erreurColonne } = await clientAlice.from('iq_responses').insert({
    session_id: passationAlice,
    user_id: alice.id,
    item_id: identifiants[0],
    selected_index: 0,
    correct: true,
    response_seconds: 40,
  });
  verifier(
    'Alice ne peut pas écrire la colonne « correct »',
    Boolean(erreurColonne),
    erreurColonne ? `refus : ${erreurColonne.message.slice(0, 60)}` : 'COLONNE ACCEPTEE'
  );

  // Réponse volontairement fausse, par la voie normale.
  const cible = identifiants[1];
  const indexFaux = (corrige.get(cible).correct_index + 1) % 5;
  const { error: erreurReponse } = await clientAlice.from('iq_responses').insert({
    session_id: passationAlice,
    user_id: alice.id,
    item_id: cible,
    selected_index: indexFaux,
    response_seconds: 40,
  });
  verifier(
    'Alice peut enregistrer une réponse sur sa passation',
    !erreurReponse,
    erreurReponse?.message ?? ''
  );

  const { data: relue } = await clientAlice
    .from('iq_responses')
    .select('correct')
    .eq('session_id', passationAlice)
    .eq('item_id', cible)
    .single();
  verifier(
    'Le serveur corrige lui-même : réponse fausse enregistrée comme fausse',
    relue?.correct === false,
    `correct = ${relue?.correct}`
  );

  doitEchouer(
    'Alice ne peut pas réécrire une réponse déjà donnée',
    await clientAlice
      .from('iq_responses')
      .update({ selected_index: corrige.get(cible).correct_index })
      .eq('session_id', passationAlice)
      .eq('item_id', cible)
      .select('id')
  );

  // Un item qui n'a PAS été servi : c'est la parade contre le choix de ses propres
  // questions faciles.
  const { data: horsPassation } = await service
    .from('iq_items')
    .select('id')
    .not('id', 'in', `(${identifiants.map((i) => `"${i}"`).join(',')})`)
    .limit(1);
  doitEchouer(
    'Alice ne peut pas répondre à un item qui ne lui a pas été servi',
    await clientAlice
      .from('iq_responses')
      .insert({
        session_id: passationAlice,
        user_id: alice.id,
        item_id: horsPassation?.[0]?.id,
        selected_index: 0,
        response_seconds: 40,
      })
      .select('id')
  );

  doitEchouer(
    'Bob ne peut pas répondre sur la passation d’Alice',
    await clientBob
      .from('iq_responses')
      .insert({
        session_id: passationAlice,
        user_id: bob.id,
        item_id: identifiants[2],
        selected_index: 0,
        response_seconds: 40,
      })
      .select('id')
  );

  console.log('');
  console.log('── 8. Compte non confirmé et compte anonyme ──────────────────');

  const nonConfirme = await creerCompte('nonconfirme', false);
  const clientNc = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: erreurNc } = await clientNc.auth.signInWithPassword({
    email: nonConfirme.email,
    password: nonConfirme.motDePasse,
  });
  verifier(
    'Un compte non confirmé ne peut pas se connecter',
    Boolean(erreurNc),
    erreurNc ? `refus : ${erreurNc.message.slice(0, 60)}` : 'CONNEXION ACCEPTEE'
  );

  // « Sans compte » repose désormais sur une session anonyme : sans elle, aucune
  // politique RLS ne pourrait s'appliquer à une passation.
  const clientAnon = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: sessionAnon, error: erreurAnon } = await clientAnon.auth.signInAnonymously();
  verifier(
    'Une session anonyme peut être ouverte',
    !erreurAnon && Boolean(sessionAnon?.user),
    erreurAnon?.message ?? ''
  );
  if (sessionAnon?.user) comptes.push(sessionAnon.user.id);

  const { data: passationAnon, error: erreurPassationAnon } = await clientAnon.rpc(
    'ouvrir_passation',
    { p_longueur: 30 }
  );
  verifier(
    'Un compte anonyme peut passer l’évaluation',
    !erreurPassationAnon && typeof passationAnon === 'string',
    erreurPassationAnon?.message ?? ''
  );

  appelRefuse(
    'Un compte anonyme ne peut pas figurer au classement',
    await clientAnon.rpc('definir_visibilite_classement', {
      p_visible: true,
      p_pseudonyme: `Anon${marque.slice(-4)}`,
    })
  );

  console.log('');
  console.log('── 9. Chaîne complète : clôture serveur et publication ───────');

  const { data: passationComplete } = await clientAlice.rpc('ouvrir_passation', {
    p_longueur: 30,
  });
  const { data: questions2 } = await clientAlice.rpc('items_de_passation', {
    p_session_id: passationComplete,
  });
  const corrige2 = await corrigeHarnais((questions2 ?? []).map((q) => q.id));

  // Réponses justes, avec des durées plausibles : sous le seuil, le moteur
  // refuserait le score pour réponses expédiées, et il aurait raison.
  const { error: erreurLot } = await clientAlice.from('iq_responses').insert(
    (questions2 ?? []).map((q) => ({
      session_id: passationComplete,
      user_id: alice.id,
      item_id: q.id,
      selected_index: corrige2.get(q.id).correct_index,
      response_seconds: corrige2.get(q.id).expected_seconds,
    }))
  );
  verifier(
    'Les 30 réponses sont enregistrées',
    !erreurLot,
    erreurLot?.message.slice(0, 60) ?? ''
  );

  const { data: cloture, error: erreurCloture } = await clientAlice.functions.invoke(
    'cloturer-passation',
    { body: { sessionId: passationComplete } }
  );
  verifier(
    'La fonction serveur clôt la passation',
    !erreurCloture && Boolean(cloture?.resultat),
    erreurCloture ? String(erreurCloture.message).slice(0, 70) : ''
  );

  const resultat = cloture?.resultat;
  verifier(
    'Le serveur a calculé un indice',
    typeof resultat?.scaledPoint === 'number' && resultat.scaledPoint > 0,
    `indice ${resultat?.scaledPoint}, intervalle ${resultat?.scaledLower95}–${resultat?.scaledUpper95}, verdict ${resultat?.verdict}`
  );
  verifier(
    'Le serveur compte les 30 bonnes réponses',
    resultat?.correctCount === 30,
    `${resultat?.correctCount} sur ${resultat?.itemCount}`
  );
  verifier(
    'Le serveur attribue un niveau',
    typeof resultat?.niveau === 'string' && resultat.niveau.length > 0,
    String(resultat?.niveau)
  );

  const { data: rejeu } = await clientAlice.functions.invoke('cloturer-passation', {
    body: { sessionId: passationComplete },
  });
  verifier(
    'Un second appel ne recalcule pas',
    rejeu?.dejaClose === true,
    `dejaClose = ${rejeu?.dejaClose}`
  );

  // Le corrigé devient disponible, et seulement maintenant.
  const { data: corrigeApres, error: erreurCorrigeApres } = await clientAlice.rpc(
    'corrige_de_passation',
    { p_session_id: passationComplete }
  );
  verifier(
    'Le corrigé est servi une fois la passation close',
    !erreurCorrigeApres && Array.isArray(corrigeApres) && corrigeApres.length === 30,
    erreurCorrigeApres?.message ?? `${corrigeApres?.length} corrections`
  );
  verifier(
    'Le corrigé contient les bonnes réponses et les explications',
    // `every` sur un tableau vide rend `true` : sans ce contrôle de longueur,
    // l'assertion passerait alors que rien n'a été servi.
    Array.isArray(corrigeApres) &&
      corrigeApres.length === 30 &&
      corrigeApres.every(
        (c) =>
          typeof c.correct_index === 'number' &&
          typeof c.explanation === 'string' &&
          Array.isArray(c.reasoning)
      ),
    `${corrigeApres?.length ?? 0} corrections`
  );
  appelRefuse(
    'Bob n’obtient pas le corrigé de la passation close d’Alice',
    await clientBob.rpc('corrige_de_passation', { p_session_id: passationComplete })
  );

  const { error: erreurPublication } = await clientAlice.rpc('definir_visibilite_classement', {
    p_visible: true,
    p_pseudonyme: null,
  });
  verifier(
    'La publication au classement aboutit',
    !erreurPublication,
    erreurPublication?.message ?? ''
  );

  const { data: publie } = await anonyme.from('v_classement').select('*').limit(5);
  verifier(
    'La ligne publiée est visible sans compte',
    (publie ?? []).length === 1,
    `${(publie ?? []).length} ligne(s)`
  );

  const champsPublies = publie?.[0] ? Object.keys(publie[0]) : [];
  verifier(
    'Les colonnes publiées ne contiennent ni user_id ni e-mail',
    champsPublies.length > 0 &&
      !champsPublies.includes('user_id') &&
      !champsPublies.some((c) => c.toLowerCase().includes('email')),
    champsPublies.join(', ')
  );
  verifier(
    'Aucune valeur publiée ne contient l’adresse e-mail',
    publie?.[0] ? !JSON.stringify(publie[0]).includes(alice.email) : false
  );
  verifier(
    'Le détail par aptitude est publié',
    Array.isArray(publie?.[0]?.aptitudes) && publie[0].aptitudes.length === 5,
    `${publie?.[0]?.aptitudes?.length ?? 0} aptitude(s)`
  );
  verifier(
    'Le score publié est celui calculé par le serveur',
    // Comparer deux `undefined` les rend égaux : on exige un nombre des deux côtés.
    typeof publie?.[0]?.score === 'number' &&
      typeof resultat?.scaledPoint === 'number' &&
      publie[0].score === resultat.scaledPoint,
    `classement ${publie?.[0]?.score} / serveur ${resultat?.scaledPoint}`
  );

  await clientAlice.rpc('definir_visibilite_classement', {
    p_visible: false,
    p_pseudonyme: null,
  });
  const { data: apresRetrait } = await anonyme.from('v_classement').select('pseudonyme');
  verifier(
    'Le retrait supprime la ligne du classement',
    (apresRetrait ?? []).length === 0,
    `${(apresRetrait ?? []).length} ligne(s) restante(s)`
  );
  console.log('');
  console.log('── 10. Suppressions, contraintes et fonctions ────────────────');

  // Aucune politique DELETE n'existe nulle part : un journal qu'on peut effacer
  // ne vaut rien pour calibrer, et un classement qu'on peut vider n'est pas un
  // classement.
  doitEchouer(
    'Alice ne peut pas supprimer ses reponses',
    await clientAlice.from('iq_responses').delete().eq('session_id', passationAlice).select('id')
  );
  doitEchouer(
    'Alice ne peut pas supprimer ses passations',
    await clientAlice.from('iq_sessions').delete().eq('id', passationAlice).select('id')
  );
  doitEchouer(
    'Alice ne peut pas supprimer son profil',
    await clientAlice.from('profiles').delete().eq('id', alice.id).select('id')
  );
  doitEchouer(
    'Alice ne peut pas supprimer des items administres',
    await clientAlice
      .from('iq_session_items')
      .delete()
      .eq('session_id', passationAlice)
      .select('item_id')
  );

  // Les colonnes de profil non accordees restent inecrivables.
  doitEchouer(
    'Alice ne peut pas reecrire l identifiant de son profil',
    await clientAlice.from('profiles').update({ id: bob.id }).eq('id', alice.id).select('id')
  );

  // Longueur de passation : trois valeurs, et pas une valeur libre.
  for (const longueur of [1, 7, 120, 10000, -5, null]) {
    appelRefuse(
      `Une passation de longueur ${longueur} est refusee`,
      await clientAlice.rpc('ouvrir_passation', { p_longueur: longueur })
    );
  }

  // Contraintes de forme du pseudonyme : ni adresse, ni phrase, ni doublon.
  for (const pseudo of ['a', 'avec espace', 'contact@exemple.ci', 'x'.repeat(30), '']) {
    appelRefuse(
      `Le pseudonyme « ${pseudo.slice(0, 18)} » est refuse`,
      await clientAlice.rpc('definir_pseudonyme', { p_pseudonyme: pseudo })
    );
  }

  const { data: pseudoAlice } = await clientAlice
    .from('profiles')
    .select('pseudonyme')
    .eq('id', alice.id)
    .maybeSingle();
  appelRefuse(
    'Bob ne peut pas prendre le pseudonyme d Alice',
    await clientBob.rpc('definir_pseudonyme', { p_pseudonyme: pseudoAlice?.pseudonyme ?? 'Inconnu' })
  );

  // Contraintes sur les reponses.
  const itemLibre = (questions ?? [])[5]?.id;
  for (const [nom, ligne] of [
    ['un index de reponse hors bornes', { selected_index: 42, response_seconds: 30 }],
    ['une duree negative', { selected_index: 0, response_seconds: -10 }],
  ]) {
    doitEchouer(
      `Une reponse avec ${nom} est refusee`,
      await clientAlice
        .from('iq_responses')
        .insert({
          session_id: passationAlice,
          user_id: alice.id,
          item_id: itemLibre,
          ...ligne,
        })
        .select('id')
    );
  }

  // Usurpation d identite dans une insertion de reponse.
  doitEchouer(
    'Alice ne peut pas ecrire une reponse au nom de Bob',
    await clientAlice
      .from('iq_responses')
      .insert({
        session_id: passationAlice,
        user_id: bob.id,
        item_id: itemLibre,
        selected_index: 0,
        response_seconds: 30,
      })
      .select('id')
  );

  console.log('');
  console.log('── 11. La fonction serveur, vue par un tiers ─────────────────');

  // Clore la passation de quelqu'un d'autre : c'est la tentative la plus directe
  // pour lui fabriquer un score, ou pour obtenir son corrige.
  const { data: tentativeBob, error: erreurTentativeBob } =
    await clientBob.functions.invoke('cloturer-passation', {
      body: { sessionId: passationAlice },
    });
  verifier(
    'Bob ne peut pas clore la passation d Alice',
    Boolean(erreurTentativeBob) || !tentativeBob?.resultat,
    erreurTentativeBob ? 'refus' : JSON.stringify(tentativeBob).slice(0, 60)
  );

  // Appel sans jeton du tout.
  {
    const reponse = await fetch(`${URL}/functions/v1/cloturer-passation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: passationAlice }),
    });
    verifier(
      'La fonction refuse un appel sans en-tete d autorisation',
      reponse.status === 401,
      `HTTP ${reponse.status}`
    );
  }

  // Identifiant malformé : ne doit pas atteindre la base.
  for (const identifiant of ['', 'pas-un-uuid', "' or 1=1 --", '../../etc/passwd']) {
    const { data, error } = await clientAlice.functions.invoke('cloturer-passation', {
      body: { sessionId: identifiant },
    });
    verifier(
      `La fonction refuse l identifiant « ${identifiant.slice(0, 14)} »`,
      Boolean(error) || !data?.resultat,
      error ? 'refus' : JSON.stringify(data).slice(0, 40)
    );
  }

} catch (erreur) {
  console.error('');
  console.error('INTERROMPU :', erreur instanceof Error ? erreur.message : String(erreur));
  echecs++;
} finally {
  await nettoyer();
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`${resultats.length - echecs}/${resultats.length} vérifications passées`);
if (echecs > 0) {
  console.log('');
  console.log('A CORRIGER :');
  for (const r of resultats.filter((x) => !x.reussi)) {
    console.log(`  - ${r.nom}${r.detail ? ' (' + r.detail + ')' : ''}`);
  }
}
process.exit(echecs > 0 ? 1 : 0);
