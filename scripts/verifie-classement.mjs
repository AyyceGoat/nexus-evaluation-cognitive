/**
 * Vérifie la publication au classement, avec la seule clé publique.
 *
 * ── Pourquoi un script séparé de `verifie-rls.mjs` ──
 *
 * Celui-là exige `SUPABASE_SERVICE_ROLE_KEY` pour fabriquer des comptes confirmés.
 * Celui-ci n'a besoin que de la clé anon : il teste ce qu'un visiteur et une session
 * anonyme obtiennent réellement. Il tourne donc toujours, y compris après une
 * rotation de secrets, et couvre le défaut corrigé le 23 septembre 2026 :
 *
 *   `definir_visibilite_classement` enregistrait le consentement puis exécutait un
 *   `insert … select` qui, faute de passation exploitable, n'insérait aucune ligne
 *   sans lever d'erreur. L'écran annonçait « vous figurez au classement » et le
 *   classement restait vide.
 *
 * Ce que ce script établit :
 *
 *   1. la vue publique est lisible sans compte, et n'expose aucun identifiant ;
 *   2. les deux fonctions refusent un appelant non authentifié ;
 *   3. `a_une_passation_publiable()` rend `false` pour une session sans passation —
 *      c'est exactement la condition que la fonction de visibilité teste désormais
 *      AVANT d'écrire quoi que ce soit ;
 *   4. une session non confirmée est refusée, et son profil n'est pas modifié : le
 *      refus annule bien l'appel en entier.
 *
 * Ce qu'il n'établit pas, et pourquoi : le refus pour « aucune passation
 * exploitable » sur un compte CONFIRMÉ exige de confirmer une adresse, donc la clé
 * de service. Il est vérifié ici par sa condition (point 3), et le chemin complet
 * reste couvert par `verifie-rls.mjs` quand la clé est disponible.
 */

import { createClient } from '@supabase/supabase-js';
import { exigerEnv } from './env.mjs';

const env = exigerEnv(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);
const URL = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;

let echecs = 0;

function verifier(nom, reussi, detail = '') {
  if (!reussi) echecs++;
  console.log(`${reussi ? 'OK     ' : 'ECHEC  '} ${nom}${detail ? '  — ' + detail : ''}`);
}

function client() {
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ── 1. La vue publique ───────────────────────────────────────────────────── */

const visiteur = client();

const vue = await visiteur.from('v_classement').select('*');
verifier(
  'v_classement lisible sans compte',
  !vue.error,
  vue.error ? vue.error.message.slice(0, 70) : `${vue.data.length} ligne(s)`
);

if (!vue.error) {
  const colonnes = vue.data.length > 0 ? Object.keys(vue.data[0]) : [];
  const interdites = colonnes.filter((c) => c === 'user_id' || c === 'session_id');
  verifier(
    'la vue n expose ni user_id ni session_id',
    interdites.length === 0,
    colonnes.length === 0 ? 'classement vide : verifie par les privileges ci-dessous' : colonnes.join(', ')
  );
}

// Le contrôle qui vaut même sur un classement vide : le privilège de colonne.
const colonneInterdite = await visiteur.from('classement').select('user_id');
verifier(
  'classement.user_id refuse par le moteur',
  Boolean(colonneInterdite.error),
  colonneInterdite.error ? colonneInterdite.error.message.slice(0, 70) : 'LECTURE ACCEPTEE'
);

/* ── 2. Les fonctions, sans authentification ──────────────────────────────── */

const sansCompte = await visiteur.rpc('definir_visibilite_classement', {
  p_visible: true,
  p_pseudonyme: 'AnonTest',
});
verifier(
  'definir_visibilite_classement refuse un appelant sans compte',
  Boolean(sansCompte.error),
  sansCompte.error ? sansCompte.error.message.slice(0, 70) : 'APPEL ACCEPTE'
);

const eligibiliteSansCompte = await visiteur.rpc('a_une_passation_publiable');
verifier(
  'a_une_passation_publiable refuse un appelant sans compte',
  Boolean(eligibiliteSansCompte.error),
  eligibiliteSansCompte.error
    ? eligibiliteSansCompte.error.message.slice(0, 70)
    : `APPEL ACCEPTE (${String(eligibiliteSansCompte.data)})`
);

/* ── 3. Session anonyme : éligibilité et refus ────────────────────────────── */

const anonyme = client();
const session = await anonyme.auth.signInAnonymously();

if (session.error || !session.data.user) {
  verifier('ouverture d une session anonyme', false, session.error?.message.slice(0, 70) ?? 'aucun utilisateur');
} else {
  verifier('ouverture d une session anonyme', true, 'session ouverte');

  const estAnonyme = session.data.user.is_anonymous === true;
  verifier(
    'la session est marquee anonyme',
    estAnonyme,
    `is_anonymous = ${String(session.data.user.is_anonymous)}`
  );

  // Point 3 : la condition testée par la fonction de visibilité.
  const eligible = await anonyme.rpc('a_une_passation_publiable');
  verifier(
    'a_une_passation_publiable rend false sans passation',
    !eligible.error && eligible.data === false,
    eligible.error ? eligible.error.message.slice(0, 70) : `rend ${String(eligible.data)}`
  );

  // Point 4 : le refus, et l'absence d'effet de bord.
  const refus = await anonyme.rpc('definir_visibilite_classement', {
    p_visible: true,
    p_pseudonyme: 'AnonTest',
  });
  verifier(
    'visibilite refusee a une adresse non confirmee',
    Boolean(refus.error),
    refus.error ? refus.error.message.slice(0, 70) : 'APPEL ACCEPTE'
  );

  const profil = await anonyme.from('profiles').select('pseudonyme, classement_visible').maybeSingle();
  const inchange =
    !profil.error &&
    profil.data !== null &&
    profil.data.classement_visible === false &&
    (profil.data.pseudonyme === null || profil.data.pseudonyme === '');
  verifier(
    'le refus n a laisse aucune trace dans le profil',
    inchange,
    profil.error
      ? profil.error.message.slice(0, 70)
      : profil.data === null
        ? 'aucun profil lisible'
        : `visible = ${String(profil.data.classement_visible)}, pseudonyme = ${
            profil.data.pseudonyme ? 'renseigne' : 'vide'
          }`
  );

  await anonyme.auth.signOut();
}

console.log('');
console.log(echecs === 0 ? 'Classement : tous les controles passent.' : `Classement : ${echecs} echec(s).`);
process.exit(echecs === 0 ? 0 : 1);
