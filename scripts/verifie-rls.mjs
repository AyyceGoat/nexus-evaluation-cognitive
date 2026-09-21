/**
 * Vérifie les règles d'accès sur un vrai projet Supabase, en tentant de les violer.
 *
 * Ce script ne relit pas le schéma pour vérifier qu'une politique existe : il se
 * connecte avec une clé anon, comme n'importe quel visiteur, et ESSAIE de tricher.
 * Une politique qu'on croit écrite et un refus qu'on a constaté ne sont pas la même
 * chose.
 *
 * Tentatives couvertes :
 *   - écrire un score à la main (INSERT et UPDATE sur iq_sessions) ;
 *   - s'inscrire au classement directement (INSERT, UPDATE, DELETE) ;
 *   - lire le corrigé de la banque d'items ;
 *   - lire les passations, réponses et profil d'un autre utilisateur ;
 *   - se déclarer visible au classement par un UPDATE direct du profil ;
 *   - déclarer soi-même qu'une réponse est juste ;
 *   - lire la table du classement sans passer par la vue publique.
 *
 * Prérequis : un fichier `.env` renseigné, avec VITE_SUPABASE_URL,
 * VITE_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY (cette dernière uniquement
 * pour créer et supprimer les comptes de test ; elle n'est jamais utilisée pour les
 * vérifications elles-mêmes).
 *
 * Usage : node scripts/verifie-rls.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';

/* ── Configuration ────────────────────────────────────────────────────────── */

function lireEnv() {
  const valeurs = { ...process.env };
  if (existsSync('.env')) {
    for (const ligne of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const trouve = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(ligne);
      if (!trouve) continue;
      const valeur = trouve[2].replace(/^["']|["']$/g, '').trim();
      if (valeur) valeurs[trouve[1]] = valeur;
    }
  }
  return valeurs;
}

const env = lireEnv();
const URL = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error('Variables manquantes. Renseignez .env :');
  console.error('  VITE_SUPABASE_URL        ', URL ? 'ok' : 'ABSENTE');
  console.error('  VITE_SUPABASE_ANON_KEY   ', ANON ? 'ok' : 'ABSENTE');
  console.error('  SUPABASE_SERVICE_ROLE_KEY', SERVICE ? 'ok' : 'ABSENTE');
  console.error('');
  console.error('Voir docs/SUPABASE.md. La cle de service sert uniquement a creer');
  console.error('les comptes de test, et ne doit jamais etre commitee.');
  process.exit(2);
}

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
    error ? `refus : ${String(error.message).slice(0, 70)}` : refuse ? 'aucune ligne écrite' : 'ECRITURE ACCEPTEE'
  );
}

/** Une lecture DOIT ne rien rendre. */
function doitEtreVide(nom, { error, data }) {
  const vide = Boolean(error) || !data || (Array.isArray(data) && data.length === 0);
  verifier(
    nom,
    vide,
    error ? `refus : ${String(error.message).slice(0, 70)}` : vide ? '0 ligne' : `${data.length} LIGNES LUES`
  );
}

/* ── Comptes de test ──────────────────────────────────────────────────────── */

const service = createClient(URL, SERVICE, { auth: { persistSession: false } });
const marque = Date.now().toString(36);
const comptes = [];

async function creerCompte(role) {
  const email = `rls-${role}-${marque}@nexus-test.invalid`;
  const motDePasse = `Test-${marque}-${role}!`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
    user_metadata: { display_name: `Test ${role}` },
  });
  if (error || !data.user) throw new Error(`Création du compte ${role} impossible : ${error?.message}`);
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

/* ── Vérifications ────────────────────────────────────────────────────────── */

try {
  console.log(`Projet : ${URL}`);
  console.log('');

  const alice = await creerCompte('alice');
  const bob = await creerCompte('bob');
  const clientAlice = await clientConnecte(alice);
  const clientBob = await clientConnecte(bob);
  const anonyme = createClient(URL, ANON, { auth: { persistSession: false } });

  console.log('── 1. Chacun ne lit que ses propres données ──────────────────');

  // Une passation pour Alice, par la voie normale : la fonction serveur.
  const { data: items } = await service.from('iq_items').select('id').limit(5);
  const identifiants = (items ?? []).map((i) => i.id);
  if (identifiants.length < 5) {
    throw new Error('La banque d’items est vide : appliquez la migration 20260921090100.');
  }

  const { data: passationAlice, error: erreurOuverture } = await clientAlice.rpc(
    'ouvrir_passation',
    { p_item_ids: identifiants }
  );
  verifier(
    'Alice peut ouvrir une passation par la fonction serveur',
    !erreurOuverture && typeof passationAlice === 'string',
    erreurOuverture?.message ?? String(passationAlice).slice(0, 12)
  );

  const { data: siennes } = await clientAlice
    .from('iq_sessions')
    .select('id')
    .eq('id', passationAlice);
  verifier('Alice lit sa propre passation', (siennes ?? []).length === 1);

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

  console.log('');
  console.log('── 2. Le corrigé de la banque est inaccessible ───────────────');

  doitEtreVide(
    'Alice ne lit pas la banque d’items',
    await clientAlice.from('iq_items').select('id, correct_index').limit(5)
  );
  doitEtreVide(
    'Un visiteur anonyme ne lit pas la banque d’items',
    await anonyme.from('iq_items').select('id, correct_index').limit(5)
  );

  console.log('');
  console.log('── 3. Écrire un score à la main ──────────────────────────────');

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
      .update({ scaled_point: 160, niveau: 'exceptionnel', finished_at: new Date().toISOString() })
      .eq('id', passationAlice)
      .select('id')
  );

  doitEchouer(
    'Alice ne peut pas modifier la passation de Bob',
    await clientBob
      .from('iq_sessions')
      .update({ scaled_point: 160 })
      .eq('id', passationAlice)
      .select('id')
  );

  console.log('');
  console.log('── 4. Écrire directement au classement ───────────────────────');

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
    await clientAlice.from('classement').update({ score: 160 }).eq('user_id', alice.id).select('user_id')
  );

  doitEchouer(
    'Alice ne peut pas supprimer une ligne du classement',
    await clientAlice.from('classement').delete().neq('score', -1).select('user_id')
  );

  doitEtreVide(
    'Personne ne lit la table du classement directement',
    await clientAlice.from('classement').select('user_id').limit(5)
  );

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
  console.log('── 5. La vue publique du classement ──────────────────────────');

  const { error: erreurVue } = await anonyme.from('v_classement').select('pseudonyme').limit(5);
  verifier(
    'Un visiteur anonyme peut lire la vue du classement',
    !erreurVue,
    erreurVue?.message ?? ''
  );

  const { data: colonnes } = await anonyme.from('v_classement').select('*').limit(1);
  const champs = colonnes?.[0] ? Object.keys(colonnes[0]) : [];
  verifier(
    'La vue publique n’expose ni user_id ni e-mail',
    !champs.includes('user_id') && !champs.some((c) => c.includes('email')),
    champs.length > 0 ? champs.join(', ') : 'classement vide : colonnes non vérifiables'
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

  // Sa passation n'étant pas close, rien ne doit être publié.
  const { data: apresVisible } = await anonyme.from('v_classement').select('pseudonyme');
  verifier(
    'Aucune ligne n’est publiée sans passation close',
    !(apresVisible ?? []).some((l) => l.pseudonyme.startsWith('Alice')),
    `${(apresVisible ?? []).length} ligne(s) au classement`
  );

  console.log('');
  console.log('── 7. Déclarer soi-même qu’une réponse est juste ─────────────');

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

  // Réponse par la voie normale, sur un index volontairement faux.
  const { data: corrige } = await service
    .from('iq_items')
    .select('id, correct_index')
    .eq('id', identifiants[1])
    .single();
  const indexFaux = (corrige.correct_index + 1) % 5;

  const { error: erreurReponse } = await clientAlice.from('iq_responses').insert({
    session_id: passationAlice,
    user_id: alice.id,
    item_id: identifiants[1],
    selected_index: indexFaux,
    response_seconds: 40,
  });
  verifier('Alice peut enregistrer une réponse sur sa passation', !erreurReponse, erreurReponse?.message ?? '');

  const { data: relue } = await clientAlice
    .from('iq_responses')
    .select('correct')
    .eq('session_id', passationAlice)
    .eq('item_id', identifiants[1])
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
      .update({ selected_index: corrige.correct_index })
      .eq('session_id', passationAlice)
      .eq('item_id', identifiants[1])
      .select('id')
  );

  doitEchouer(
    'Alice ne peut pas répondre sur la passation de Bob',
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
  console.log('── 8. Compte non confirmé ────────────────────────────────────');

  const emailNonConfirme = `rls-nonconfirme-${marque}@nexus-test.invalid`;
  const motDePasseNonConfirme = `Test-${marque}-nc!`;
  const { data: creation } = await service.auth.admin.createUser({
    email: emailNonConfirme,
    password: motDePasseNonConfirme,
    email_confirm: false,
  });
  if (creation?.user) comptes.push(creation.user.id);

  const clientNonConfirme = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: erreurConnexionNc } = await clientNonConfirme.auth.signInWithPassword({
    email: emailNonConfirme,
    password: motDePasseNonConfirme,
  });
  verifier(
    'Un compte non confirmé ne peut pas se connecter',
    Boolean(erreurConnexionNc),
    erreurConnexionNc ? `refus : ${erreurConnexionNc.message.slice(0, 60)}` : 'CONNEXION ACCEPTEE'
  );
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
