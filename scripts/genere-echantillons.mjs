/**
 * Génère les échantillons de voix à comparer, et remplit la page d'écoute.
 *
 * ── Le service retenu ──
 *
 * edge-tts, qui s'adresse au moteur de lecture à voix haute du navigateur Edge.
 * Mêmes voix neuronales que le service payant de Microsoft — Éloïse et Denise
 * comprises — sans compte, sans clé, sans facturation.
 *
 * La seule réserve, et elle est réelle : cet accès n'est pas une API publiée
 * sous contrat, et Microsoft peut le modifier sans préavis. La conséquence est
 * limitée par la forme du produit : les fichiers sont produits une fois et
 * servis ensuite depuis notre propre stockage. Une rupture côté Microsoft
 * empêcherait une nouvelle génération, pas l'écoute de ce qui existe.
 *
 * ── Ce que ce script fait ──
 *
 * Il prend UN extrait — une phrase d'introduction suivie d'un paragraphe réel —
 * et le fait lire par chaque voix française du catalogue. Le texte est
 * identique d'une voix à l'autre : c'est la seule façon de comparer autre chose
 * que le contenu.
 *
 * L'extrait n'est pas choisi au hasard. Il contient un ordinal en exposant
 * (« XVIᵉ »), deux dates, des guillemets français et deux tirets cadratins,
 * c'est-à-dire précisément ce que le normaliseur doit corriger. On entend donc
 * la voix et le traitement du texte en même temps.
 *
 * ── Pourquoi le texte simple et non du SSML ──
 *
 * edge-tts n'accepte pas de SSML arbitraire : il construit le sien à partir du
 * texte, du débit, du volume et de la hauteur. Les sigles passent donc par la
 * sortie `versTexte` du normaliseur, où ils sont épelés en clair — « e té
 * effe » — au lieu d'être confiés à `say-as`. C'est la contrepartie de
 * l'absence de compte, et elle est mesurable : le résultat s'entend dans les
 * échantillons.
 *
 * ── Ce qu'il ne fait pas ──
 *
 * Il ne génère pas les cinquante articles. Cette étape vient après le choix de
 * la voix.
 *
 * Usage :
 *   node scripts/genere-echantillons.mjs
 *   node scripts/genere-echantillons.mjs --liste-seulement
 *   node scripts/genere-echantillons.mjs --locale fr-FR
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { versTexte } from '../src/lib/narration/normaliser.ts';

const SORTIE = 'public/ecoute';
const PONT = 'scripts/edge_tts_pont.py';

/** Débit de lecture. Légèrement ralenti : une narration n'est pas un bulletin. */
const DEBIT = '-4%';

/* ── L'extrait ────────────────────────────────────────────────────────── */

const INTRODUCTION =
  'Voici l’histoire de la chute de l’Empire romain. Ce n’est pas celle qu’on raconte d’habitude.';

const PARAGRAPHE =
  'On parle couramment de la chute de l’Empire romain en 476, comme d’un évènement unique et ' +
  'daté. La réalité est plus embarrassante : ce qui disparaît cette année-là, c’est la fonction ' +
  'd’empereur d’Occident, et elle disparaît sans bataille. L’Empire romain d’Orient, lui, ' +
  'continue depuis Constantinople pendant près de mille ans encore, jusqu’en 1453. Pendant tout ' +
  'ce temps, ses habitants ne s’appellent pas « Byzantins » — ce mot est une invention ' +
  'd’érudits du XVIᵉ siècle — mais Romains.';

const EXTRAIT_BRUT = `${INTRODUCTION}\n\n${PARAGRAPHE}`;
const EXTRAIT_DIT = versTexte(EXTRAIT_BRUT);

/* ── Arguments ────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const LISTE_SEULEMENT = args.includes('--liste-seulement');
const SANS_MULTILINGUES = args.includes('--sans-multilingues');
const iLocale = args.indexOf('--locale');
const LOCALE = iLocale !== -1 ? args[iLocale + 1] : null;

/* ── Appel du pont Python ─────────────────────────────────────────────── */

function pont(...arguments_) {
  try {
    return execFileSync('python', [PONT, ...arguments_], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
  } catch (erreur) {
    console.error('');
    console.error('Le pont Python a echoue.');
    console.error('Si edge-tts n est pas installe :  python -m pip install edge-tts');
    throw erreur;
  }
}

/* ── Exécution ────────────────────────────────────────────────────────── */

console.log('Service : edge-tts (voix neuronales Microsoft, sans compte ni cle)');
console.log(
  `Extrait : ${EXTRAIT_BRUT.length} signes bruts, ${EXTRAIT_DIT.length} apres normalisation.`
);
console.log('');

let voix = JSON.parse(pont('voix'));
if (LOCALE) voix = voix.filter((v) => v.locale === LOCALE);
if (SANS_MULTILINGUES) voix = voix.filter((v) => v.groupe === 'francaise');

const francaises = voix.filter((v) => v.groupe === 'francaise');
const multilingues = voix.filter((v) => v.groupe === 'multilingue');

console.log(
  `${voix.length} voix candidates : ${francaises.length} de langue francaise, ` +
    `${multilingues.length} multilingues d'une autre langue de base.`
);

for (const [titre, liste] of [
  ['Langue francaise', francaises],
  ['Multilingues, autre langue de base', multilingues],
]) {
  if (liste.length === 0) continue;
  console.log('');
  console.log(`  ${titre} (${liste.length})`);
  const parLocale = new Map();
  for (const v of liste) {
    if (!parLocale.has(v.locale)) parLocale.set(v.locale, []);
    parLocale.get(v.locale).push(v);
  }
  for (const [locale, groupe] of parLocale) {
    for (const v of groupe) {
      console.log(
        `    ${v.id.padEnd(34)} ${locale.padEnd(7)} ${v.genre.padEnd(10)} ` +
          `${(v.multilingue ? 'multilingue' : '').padEnd(12)} ${v.personnalites.join(', ')}`
      );
    }
  }
}
console.log('');

if (LISTE_SEULEMENT) {
  console.log('Liste seulement : aucune synthese.');
  process.exit(0);
}

/* ── Synthèse ─────────────────────────────────────────────────────────── */

mkdirSync(SORTIE, { recursive: true });

// Les anciens échantillons sont retirés : garder un fichier orphelin dont
// aucune voix ne parle plus donnerait une page d'écoute trompeuse.
for (const fichier of readdirSync(SORTIE)) {
  if (/\.(mp3|reperes\.json)$/.test(fichier) || fichier === 'manifeste.json') {
    rmSync(join(SORTIE, fichier));
  }
}

const travail = {
  sortie: SORTIE,
  debit: DEBIT,
  taches: voix.map((v) => ({
    voix: v.id,
    fichier: v.id,
    texte: EXTRAIT_DIT,
    // Les repères ne sont demandés que pour la voix retenue par défaut : ils
    // pèsent, leur structure est identique d'une voix à l'autre, et ils ne
    // servent ici qu'à prouver que le surlignage est réalisable.
    reperes: v.id === 'fr-FR-VivienneMultilingualNeural',
  })),
};

const fichierTravail = join(tmpdir(), `nexus-echantillons-${process.pid}.json`);
writeFileSync(fichierTravail, JSON.stringify(travail), 'utf8');

console.log(`Synthese de ${voix.length} echantillons, debit ${DEBIT} :`);
let resultats;
try {
  resultats = JSON.parse(pont('synthese', fichierTravail));
} finally {
  rmSync(fichierTravail, { force: true });
}

/* ── Manifeste ────────────────────────────────────────────────────────── */

const reussis = resultats.filter((r) => !r.erreur);

const manifeste = {
  service: 'edge-tts (voix neuronales Microsoft, sans compte)',
  genere: new Date().toISOString(),
  debit: DEBIT,
  extrait: {
    introduction: INTRODUCTION,
    paragraphe: PARAGRAPHE,
    normalise: EXTRAIT_DIT,
  },
  voix: reussis.map((r) => {
    const descripteur = voix.find((v) => v.id === r.voix);
    return {
      id: r.voix,
      nom: descripteur.nom,
      locale: descripteur.locale,
      genre: descripteur.genre,
      multilingue: descripteur.multilingue,
      groupe: descripteur.groupe,
      personnalites: descripteur.personnalites,
      fichier: r.fichier,
      octets: r.octets,
      reperesFichier: r.reperesFichier ?? null,
      mots: r.mots,
      phrases: r.phrases,
    };
  }),
};

writeFileSync(`${SORTIE}/manifeste.json`, JSON.stringify(manifeste, null, 1), 'utf8');

const octets = reussis.reduce((n, r) => n + r.octets, 0);
console.log('');
console.log(
  `${reussis.length} echantillon(s) sur ${voix.length}, ${(octets / 1024).toFixed(0)} ko au total, dans ${SORTIE}/`
);
const echoues = resultats.filter((r) => r.erreur);
if (echoues.length > 0) {
  console.log(`${echoues.length} echec(s) :`);
  for (const r of echoues) console.log(`  ${r.voix} — ${r.erreur}`);
}
console.log('Page d ecoute : /ecoute/');
