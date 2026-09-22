/**
 * Vérifie que le schéma a bien été appliqué sur le projet distant.
 *
 * Contrôle la présence des tables, de la vue publique, des fonctions serveur, et
 * surtout que la banque d'items est complète : un corrigé serveur incomplet ferait
 * calculer des scores sur une partie des items seulement, sans qu'aucune erreur
 * n'apparaisse.
 *
 * Usage : node scripts/verifie-schema.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { exigerEnv } from './env.mjs';

const env = exigerEnv([
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]);

const service = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const anonyme = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const ITEMS_ATTENDUS = 120;
const APTITUDES_ATTENDUES = { matrix: 24, series: 24, verbal: 24, spatial: 24, memory: 24 };

let echecs = 0;
function verifier(nom, ok, detail = '') {
  if (!ok) echecs++;
  console.log(`${ok ? 'OK     ' : 'ECHEC  '} ${nom}${detail ? '  — ' + detail : ''}`);
}

console.log('── Tables ────────────────────────────────────────────────────');

for (const table of [
  'profiles',
  'iq_items',
  'iq_sessions',
  'iq_session_items',
  'iq_responses',
  'classement',
]) {
  const { error } = await service.from(table).select('*', { count: 'exact', head: true });
  verifier(`table ${table}`, !error, error ? error.message.slice(0, 60) : '');
}

console.log('');
console.log("── Banque d'items ───────────────────────────────────────────");

const { count, error: erreurCompte } = await service
  .from('iq_items')
  .select('*', { count: 'exact', head: true });

verifier(
  `la banque contient ${ITEMS_ATTENDUS} items`,
  !erreurCompte && count === ITEMS_ATTENDUS,
  erreurCompte ? erreurCompte.message.slice(0, 60) : `${count} trouvés`
);

const { data: lignes } = await service
  .from('iq_items')
  .select(
    'aptitude, correct_index, param_a, param_b, param_c, expected_seconds, prompt, options, visual, explanation, reasoning'
  );

if (lignes) {
  verifier(
    'chaque item a un énoncé',
    lignes.every((l) => typeof l.prompt === 'string' && l.prompt.length > 0),
    `${lignes.filter((l) => !l.prompt).length} sans énoncé`
  );
  verifier(
    'chaque item est affichable (options ou rendu visuel)',
    lignes.every((l) => l.options !== null || l.visual !== null),
    `${lignes.filter((l) => l.options === null && l.visual === null).length} inaffichables`
  );
  verifier(
    'chaque item a une explication et un raisonnement',
    lignes.every((l) => l.explanation && Array.isArray(l.reasoning) && l.reasoning.length > 0)
  );
  const textuels = lignes.filter((l) => Array.isArray(l.options)).length;
  const visuels = lignes.filter((l) => l.visual !== null).length;
  console.log(`         ${textuels} items textuels, ${visuels} items visuels`);
}

if (lignes) {
  const parAptitude = {};
  for (const l of lignes) parAptitude[l.aptitude] = (parAptitude[l.aptitude] ?? 0) + 1;

  for (const [aptitude, attendu] of Object.entries(APTITUDES_ATTENDUES)) {
    verifier(
      `${aptitude} : ${attendu} items`,
      parAptitude[aptitude] === attendu,
      `${parAptitude[aptitude] ?? 0} trouvés`
    );
  }

  verifier(
    'aucun paramètre absurde',
    lignes.every(
      (l) =>
        l.param_a > 0 &&
        l.param_c >= 0 &&
        l.param_c < 1 &&
        l.correct_index >= 0 &&
        l.expected_seconds > 0
    )
  );
}

console.log('');
console.log('── Vue publique et fonctions serveur ────────────────────────');

const { error: erreurVue } = await anonyme.from('v_classement').select('pseudonyme').limit(1);
verifier('v_classement lisible sans compte', !erreurVue, erreurVue?.message.slice(0, 60) ?? '');

// Les fonctions doivent exister et refuser un appel anonyme : on distingue
// « fonction absente » (PGRST202) d'un refus d'autorisation, qui est le bon signe.
for (const [fonction, args] of [
  ['ouvrir_passation', { p_longueur: 35 }],
  ['items_de_passation', { p_session_id: '00000000-0000-0000-0000-000000000000' }],
  ['corrige_de_passation', { p_session_id: '00000000-0000-0000-0000-000000000000' }],
  ['definir_pseudonyme', { p_pseudonyme: 'Sonde' }],
  ['definir_visibilite_classement', { p_visible: false, p_pseudonyme: null }],
]) {
  const { error } = await anonyme.rpc(fonction, args);
  const absente = error?.code === 'PGRST202';
  verifier(
    `fonction ${fonction} déployée`,
    !absente,
    absente ? 'INTROUVABLE' : `refus attendu : ${String(error?.message ?? 'aucune erreur').slice(0, 45)}`
  );
}

console.log('');
console.log(echecs === 0 ? 'Schéma conforme.' : `${echecs} vérification(s) en échec.`);
process.exit(echecs > 0 ? 1 : 0);
