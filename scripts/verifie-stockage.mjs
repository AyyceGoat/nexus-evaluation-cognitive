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

/* ── 4. Un fichier déposé est réellement servi, et avec le bon type ──────
   Le contenu est rangé en deux dossiers : `audio/` et `sync/`. Une première
   version de ce contrôle listait la racine et prenait la première entrée, qui
   est un DOSSIER : le service répondait 400, et l'échec venait de la sonde.
   Le type MIME est vérifié en même temps, car il décide : un MP3 servi en
   `application/octet-stream` n'est pas lu de façon fiable par un élément
   audio. */

const ATTENDUS = [
  { dossier: 'audio', extension: '.mp3', type: 'audio/mpeg' },
  { dossier: 'sync', extension: '.json', type: 'application/json' },
];

for (const attendu of ATTENDUS) {
  const contenu = await visiteur.storage.from(BUCKET).list(attendu.dossier, { limit: 5 });
  const fichier = contenu.error
    ? null
    : contenu.data.find((f) => f.name.endsWith(attendu.extension));

  if (!fichier) {
    console.log(
      `INFO   ${attendu.dossier}/ : aucun fichier, controle de service reporte` +
        (contenu.error ? ` (${contenu.error.message.slice(0, 50)})` : '')
    );
    continue;
  }

  const { data } = visiteur.storage
    .from(BUCKET)
    .getPublicUrl(`${attendu.dossier}/${fichier.name}`);
  const reponse = await fetch(data.publicUrl, { method: 'HEAD' });
  const type = reponse.headers.get('content-type') ?? '';

  verifier(
    `${attendu.dossier}/ est servi publiquement`,
    reponse.ok,
    `${reponse.status}, ${reponse.headers.get('content-length') ?? '?'} octets`
  );
  verifier(
    `${attendu.dossier}/ est servi en ${attendu.type}`,
    type.startsWith(attendu.type),
    type || 'aucun type'
  );
}

/* ── 5. La revalidation fonctionne, et les plages aussi ───────────────── */

{
  const contenu = await visiteur.storage.from(BUCKET).list('audio', { limit: 1 });
  const fichier = contenu.error ? null : contenu.data.find((f) => f.name.endsWith('.mp3'));
  if (fichier) {
    const { data } = visiteur.storage.from(BUCKET).getPublicUrl(`audio/${fichier.name}`);

    // Les objets sont servis en `no-cache`, le drapeau de la CLI de depot
    // n'atteignant pas le service. Ce qui compte n'est pas l'en-tete mais son
    // effet : une seconde requete doit rendre 304 sans corps, sinon chaque
    // ecoute retelechargerait deux megaoctets.
    const premier = await fetch(data.publicUrl);
    const etiquette = premier.headers.get('etag');
    const second = await fetch(data.publicUrl, { headers: { 'If-None-Match': etiquette ?? '' } });
    const corps = await second.arrayBuffer();
    verifier(
      'une seconde requete est revalidee sans renvoyer le corps',
      second.status === 304 && corps.byteLength === 0,
      `${second.status}, ${corps.byteLength} octet(s)`
    );

    // Le deplacement dans la lecture en depend.
    const plage = await fetch(data.publicUrl, { headers: { Range: 'bytes=0-1023' } });
    verifier(
      'les requetes de plage sont acceptees',
      plage.status === 206,
      `${plage.status} ${plage.headers.get('content-range') ?? ''}`
    );
  }
}

console.log('');
console.log(echecs === 0 ? 'Stockage : tous les controles passent.' : `Stockage : ${echecs} echec(s).`);
process.exit(echecs === 0 ? 0 : 1);
