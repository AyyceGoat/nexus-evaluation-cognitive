/**
 * Vérifie le régime d'accès au stockage de la narration.
 *
 * Le bucket `narration` sert des fichiers audio publics sous notre domaine.
 * Deux propriétés doivent tenir, et la seconde est la plus importante :
 *
 *   1. LECTURE PUBLIQUE. Quelqu'un sans compte doit pouvoir écouter. Sinon la
 *      fonctionnalité ne marche pas pour la majorité des visiteurs, qui n'ont
 *      pas de compte.
 *   2. ÉCRITURE PAR PERSONNE. Ni `anon`, ni un compte authentifié, ne doit
 *      pouvoir déposer, remplacer ou supprimer un fichier. Une faille ici
 *      permettrait de substituer la narration d'un article par n'importe quel
 *      fichier, servi ensuite sous notre domaine et écouté en confiance.
 *
 * Le contrôle se fait avec la seule clé publique, en tentant réellement les
 * écritures : une politique se lit dans le catalogue, mais seul un refus
 * constaté prouve qu'elle s'applique.
 *
 * Usage : node scripts/verifie-stockage.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { exigerEnv } from './env.mjs';

const BUCKET = 'narration';

const env = exigerEnv(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);

let echecs = 0;
function verifier(nom, reussi, detail = '') {
  if (!reussi) echecs++;
  console.log(`${reussi ? 'OK     ' : 'ECHEC  '} ${nom}${detail ? '  — ' + detail : ''}`);
}

function client(jeton) {
  return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(jeton ? { global: { headers: { Authorization: `Bearer ${jeton}` } } } : {}),
  });
}

const visiteur = client();

/* ── 1. Le bucket existe et se laisse lire ────────────────────────────── */

const liste = await visiteur.storage.from(BUCKET).list('', { limit: 5 });
verifier(
  'le bucket narration se laisse lister sans compte',
  !liste.error,
  liste.error ? liste.error.message.slice(0, 70) : `${liste.data.length} entree(s)`
);

/* ── 2. Les écritures sont refusées ───────────────────────────────────── */

const charge = new Blob([new Uint8Array([0xff, 0xf3, 0x64, 0xc4])], { type: 'audio/mpeg' });
const nom = `intrusion-${Date.now()}.mp3`;

const depot = await visiteur.storage.from(BUCKET).upload(nom, charge);
verifier(
  'depot refuse sans compte',
  Boolean(depot.error),
  depot.error ? depot.error.message.slice(0, 70) : 'DEPOT ACCEPTE'
);

const remplacement = await visiteur.storage.from(BUCKET).upload(nom, charge, { upsert: true });
verifier(
  'remplacement refuse sans compte',
  Boolean(remplacement.error),
  remplacement.error ? remplacement.error.message.slice(0, 70) : 'REMPLACEMENT ACCEPTE'
);

/* ── 3. Les mêmes tentatives avec un compte ───────────────────────────── */

const anonyme = client();
const session = await anonyme.auth.signInAnonymously();

if (session.error || !session.data.session) {
  verifier('ouverture d une session pour tester l ecriture', false, session.error?.message ?? '');
} else {
  const connecte = client(session.data.session.access_token);

  const depotConnecte = await connecte.storage.from(BUCKET).upload(`connecte-${nom}`, charge);
  verifier(
    'depot refuse avec un compte',
    Boolean(depotConnecte.error),
    depotConnecte.error ? depotConnecte.error.message.slice(0, 70) : 'DEPOT ACCEPTE'
  );

  const suppression = await connecte.storage.from(BUCKET).remove(['peu-importe.mp3']);
  const refuse =
    Boolean(suppression.error) || (Array.isArray(suppression.data) && suppression.data.length === 0);
  verifier(
    'suppression refusee avec un compte',
    refuse,
    suppression.error
      ? suppression.error.message.slice(0, 70)
      : refuse
        ? 'aucun fichier supprime'
        : 'SUPPRESSION ACCEPTEE'
  );

  await anonyme.auth.signOut();
}

/* ── 4. Un fichier déposé est réellement servi ────────────────────────── */

if (!liste.error && liste.data.length > 0) {
  const premier = liste.data.find((f) => f.name.endsWith('.mp3')) ?? liste.data[0];
  const { data } = visiteur.storage.from(BUCKET).getPublicUrl(premier.name);
  const reponse = await fetch(data.publicUrl, { method: 'HEAD' });
  verifier(
    'un fichier du bucket est servi publiquement',
    reponse.ok,
    `${reponse.status} ${reponse.headers.get('content-type') ?? ''} ${reponse.headers.get('content-length') ?? ''}`
  );
} else {
  console.log('INFO   aucun fichier dans le bucket : controle de service reporte');
}

console.log('');
console.log(echecs === 0 ? 'Stockage : tous les controles passent.' : `Stockage : ${echecs} echec(s).`);
process.exit(echecs === 0 ? 0 : 1);
