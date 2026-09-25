/**
 * Dépose la narration audio sur Supabase Storage.
 *
 * ── Aucune clé n'est nécessaire ──
 *
 * Le dépôt passe par la CLI Supabase, déjà authentifiée sur cette machine pour
 * les migrations. La clé de service n'est donc pas requise, ce qui compte :
 * elle contourne toutes les politiques RLS, et mieux vaut ne pas avoir à la
 * sortir pour un transfert de fichiers.
 *
 * ── Un fichier par appel, et pourquoi ──
 *
 * Trois approches ont été essayées dans cet ordre, et les deux premières ont
 * échoué pour des raisons qu'il vaut la peine de consigner :
 *
 *   1. `cp -r <dossier> ss:///narration/` : refusé par la CLI, qui répond
 *      « Unsupported operation » et croit copier entre deux dossiers locaux.
 *      Idem avec un dossier distant nommé. La copie récursive vers le stockage
 *      ne fonctionne pas dans cette version.
 *   2. Appel de `npx.cmd` sans shell : refusé par Node 24 sous Windows,
 *      `EINVAL`, au titre d'un durcissement de sécurité sur les `.cmd`. Avec
 *      shell, les arguments sont redécoupés sur les espaces et la valeur de
 *      `--cache-control` se retrouve éclatée en trois.
 *   3. Appel direct du point d'entrée JavaScript de la CLI par `node`. Aucune
 *      des deux limites précédentes ne s'applique : pas de shell, donc pas de
 *      redécoupage ni de restriction sur les `.cmd`, et pas de résolution npx
 *      à chaque fichier.
 *
 * L'envoi fichier par fichier a d'ailleurs un avantage sur le lot : le type
 * MIME est exact pour chacun. C'est déterminant — un MP3 servi en
 * `application/octet-stream` n'est pas lu de façon fiable par un élément
 * audio, et c'est précisément ce que la CLI envoie en détection automatique.
 *
 * ── Cache : ce qui est demandé, et ce qui arrive ──
 *
 * Un fichier de narration ne change jamais sous un nom donné, donc un cache
 * immuable d'un an est demandé. Il n'est pas appliqué : le drapeau
 * `--cache-control` de la CLI n'atteint pas le service, et les objets sont
 * servis en `no-cache`. Vérifié, et laissé en place pour le jour où la CLI le
 * transmettra.
 *
 * La conséquence a été mesurée avant d'être acceptée, plutôt que supposée.
 * `no-cache` n'est pas `no-store` : une seconde requête avec `If-None-Match`
 * reçoit un 304 et zéro octet de corps, et les requêtes de plage répondent en
 * 206 — ce dont le déplacement dans la lecture a besoin. Le coût réel est donc
 * un aller-retour de revalidation, pas un téléchargement. Avec un trafic
 * sortant à 0,003 Go sur 5 Go, cela ne justifie pas de sortir la clé de service
 * pour reposer l'en-tête.
 *
 * Usage :
 *   node scripts/depose-narration.mjs
 *   node scripts/depose-narration.mjs --source public/ecoute/articles
 *   node scripts/depose-narration.mjs --a-blanc
 */

import { execFile } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const executer = promisify(execFile);

const BUCKET = 'narration';
const CACHE = 'public,max-age=31536000,immutable';

/** Envois simultanés. */
const PARALLELE = 6;

/** Sous-dossiers du bucket, par type de fichier. */
const LOTS = [
  { extension: '.mp3', type: 'audio/mpeg', prefixe: 'audio' },
  { extension: '.json', type: 'application/json', prefixe: 'sync' },
];

const args = process.argv.slice(2);
const lire = (nom) => {
  const i = args.indexOf(nom);
  return i !== -1 ? args[i + 1] : null;
};

const SOURCE = lire('--source') ?? 'audio-genere';
const A_BLANC = args.includes('--a-blanc');

/* ── Localisation de la CLI ───────────────────────────────────────────── */

/**
 * Trouve le point d'entrée JavaScript de la CLI Supabase.
 *
 * Elle n'est pas une dépendance du projet : `npx` la conserve dans son cache.
 * On y cherche donc le module, et l'on retombe sur `npx` si le cache a été
 * vidé — moins rapide, mais fonctionnel.
 */
function trouverCli() {
  const cache = join(homedir(), 'AppData', 'Local', 'npm-cache', '_npx');
  if (!existsSync(cache)) return null;
  for (const dossier of readdirSync(cache)) {
    const candidat = join(cache, dossier, 'node_modules', 'supabase', 'dist', 'supabase.js');
    if (existsSync(candidat)) return candidat;
  }
  return null;
}

const CLI = trouverCli();

async function cli(...arguments_) {
  if (CLI) {
    const { stdout } = await executer(process.execPath, [CLI, ...arguments_], {
      maxBuffer: 64 * 1024 * 1024,
    });
    return stdout;
  }
  const proteger = (a) => (/[\s,"]/.test(a) ? `"${a}"` : a);
  const { stdout } = await executer('npx', ['supabase', ...arguments_].map(proteger), {
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
  });
  return stdout;
}

/* ── Inventaire ───────────────────────────────────────────────────────── */

if (!existsSync(SOURCE)) {
  console.error(`Dossier introuvable : ${SOURCE}`);
  console.error('Genere d abord l audio :  node scripts/genere-audio.mjs --voix ... --tous');
  process.exit(1);
}

const aDeposer = [];
for (const fichier of readdirSync(SOURCE)) {
  const lot = LOTS.find((l) => fichier.endsWith(l.extension));
  if (!lot) continue;
  // Le manifeste est un outil de la page d'ecoute locale, pas une donnee
  // servie : le lecteur construit ses URL a partir de l'article et de la voix.
  if (fichier === 'manifeste.json') continue;
  aDeposer.push({
    local: join(SOURCE, fichier),
    nom: fichier,
    distant: `${lot.prefixe}/${fichier}`,
    type: lot.type,
    prefixe: lot.prefixe,
    octets: statSync(join(SOURCE, fichier)).size,
  });
}

if (aDeposer.length === 0) {
  console.error(`Aucun fichier a deposer dans ${SOURCE}.`);
  process.exit(1);
}

const octets = aDeposer.reduce((n, f) => n + f.octets, 0);

console.log(`Source   : ${SOURCE}`);
console.log(`Bucket   : ${BUCKET}`);
console.log(`CLI      : ${CLI ? 'point d entree direct' : 'npx (repli)'}`);
console.log(`Fichiers : ${aDeposer.length}, ${(octets / 1024 / 1024).toFixed(1)} Mo`);
for (const lot of LOTS) {
  const n = aDeposer.filter((f) => f.type === lot.type).length;
  console.log(`  ${lot.prefixe.padEnd(6)} ${String(n).padStart(4)} fichier(s)  ${lot.type}`);
}
console.log('');

if (A_BLANC) {
  console.log('A blanc : aucun depot.');
  process.exit(0);
}

/* ── Dépôt ────────────────────────────────────────────────────────────── */

const depart = Date.now();
let faits = 0;
const echecs = [];

async function deposer(fichier) {
  try {
    await cli(
      'storage',
      'cp',
      fichier.local,
      `ss:///${BUCKET}/${fichier.distant}`,
      '--content-type',
      fichier.type,
      '--cache-control',
      CACHE,
      '--experimental'
    );
  } catch (erreur) {
    echecs.push({
      fichier: fichier.distant,
      message: String(erreur.stdout || erreur.message).slice(0, 160),
    });
  } finally {
    faits++;
    if (faits % 20 === 0 || faits === aDeposer.length) {
      const ecoule = (Date.now() - depart) / 1000;
      const restant = (ecoule / faits) * (aDeposer.length - faits);
      console.log(
        `  ${String(faits).padStart(4)}/${aDeposer.length}  ` +
          `${Math.round(ecoule)} s ecoulees, ~${Math.round(restant)} s restantes`
      );
    }
  }
}

console.log(`Depot, ${PARALLELE} fichier(s) a la fois :`);

const file = [...aDeposer];
await Promise.all(
  Array.from({ length: PARALLELE }, async () => {
    for (;;) {
      const fichier = file.shift();
      if (!fichier) return;
      await deposer(fichier);
    }
  })
);

const secondes = (Date.now() - depart) / 1000;
console.log('');

/* ── Vérification par relecture ───────────────────────────────────────── */

console.log('── Verification ───────────────────────────────────────────────');

let problemes = echecs.length;

for (const lot of LOTS) {
  const attendus = aDeposer.filter((f) => f.prefixe === lot.prefixe).map((f) => f.nom);
  if (attendus.length === 0) continue;

  let distants;
  try {
    const sortie = await cli('storage', 'ls', `ss:///${BUCKET}/${lot.prefixe}/`, '--experimental');
    distants = JSON.parse(sortie).paths ?? [];
  } catch (erreur) {
    problemes++;
    console.error(`  ${lot.prefixe} : listing impossible — ${String(erreur.message).slice(0, 90)}`);
    continue;
  }

  const presents = new Set(distants);
  const absents = attendus.filter((f) => !presents.has(f));
  console.log(
    `  ${lot.prefixe.padEnd(6)} ${attendus.length - absents.length} sur ${attendus.length} retrouve(s)`
  );
  if (absents.length > 0) {
    problemes++;
    console.error(
      `    absents : ${absents.slice(0, 4).join(', ')}${absents.length > 4 ? ` (+${absents.length - 4})` : ''}`
    );
  }
}

if (echecs.length > 0) {
  console.error('');
  console.error(`${echecs.length} echec(s) de depot :`);
  for (const e of echecs.slice(0, 6)) console.error(`  ${e.fichier} — ${e.message}`);
}

console.log('');
console.log(
  `Duree : ${Math.floor(secondes / 60)} min ${String(Math.round(secondes % 60)).padStart(2, '0')}, ` +
    `${(octets / 1024 / 1024 / secondes).toFixed(2)} Mo/s`
);
console.log(problemes === 0 ? 'Depot termine sans erreur.' : `${problemes} probleme(s).`);
process.exit(problemes === 0 ? 0 : 1);
