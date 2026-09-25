/**
 * Génère l'audio d'un ou plusieurs articles, avec les repères de surlignage.
 *
 * ── Comment ──
 *
 * Un segment par introduction, par titre de section et par paragraphe. Chacun
 * est synthétisé séparément, puis les MP3 sont concaténés dans l'ordre. Le
 * décalage de départ de chaque segment est ainsi exact par construction — c'est
 * nous qui découpons — et le surlignage ne peut pas dériver. Le détail du
 * raisonnement est dans `src/lib/narration/script.ts`.
 *
 * ── Ce que produit le script ──
 *
 * Pour chaque article et chaque voix :
 *
 *   <id>-<voix>.mp3    l'audio complet
 *   <id>-<voix>.json   les segments avec leur décalage, leur durée, le texte
 *                      affiché, et les repères de mots ramenés au temps du
 *                      fichier complet
 *
 * ── Refus volontaires ──
 *
 * Un article sans phrase d'introduction écrite à la main est refusé. Fabriquer
 * une introduction par gabarit s'entendrait dès le deuxième article, et c'est
 * précisément ce que la demande écarte.
 *
 * Usage :
 *   node scripts/genere-audio.mjs --voix fr-FR-VivienneMultilingualNeural --articles hist_chute_rome,psy_dopamine
 *   node scripts/genere-audio.mjs --voix ... --tous
 *   node scripts/genere-audio.mjs --voix ... --articles ... --a-blanc
 *   node scripts/genere-audio.mjs --voix ... --tous --sortie audio-genere
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { construireNarration, signesDits } from '../src/lib/narration/script.ts';
import { concatenerMp3, analyserMp3 } from '../src/lib/narration/mp3.ts';
import { INTRODUCTIONS } from '../src/data/savoir/introductions.ts';
import { extendedKnowledgeItems } from '../src/data/knowledgeExtended.ts';
import { articlesHistoire } from '../src/data/savoir/histoire.ts';
import { articlesEconomie } from '../src/data/savoir/economie.ts';
import { articlesScience } from '../src/data/savoir/science.ts';
import { articlesPensee } from '../src/data/savoir/pensee.ts';
import { articlesFigures } from '../src/data/savoir/figures.ts';

const PONT = 'scripts/edge_tts_pont.py';
const DEBIT = '-4%';

/**
 * Dossier de sortie, HORS de `public/`.
 *
 * Les 281 Mo des trois voix ne doivent pas se trouver sous `public/` : Vite y
 * copie tout dans `dist/`, et chaque déploiement embarquerait l'intégralité de
 * l'audio. La destination réelle est Supabase Storage, servi par CDN ; ce
 * dossier n'est qu'une étape de fabrication, ignorée par Git.
 *
 * `--sortie public/ecoute/articles` reste possible pour alimenter la page
 * d'écoute avec quelques articles de démonstration.
 */
const SORTIE_DEFAUT = 'audio-genere';

const TOUS_LES_ARTICLES = new Map();
for (const articles of [
  articlesHistoire,
  articlesEconomie,
  articlesScience,
  articlesPensee,
  articlesFigures,
]) {
  for (const [id, sections] of Object.entries(articles)) TOUS_LES_ARTICLES.set(id, sections);
}

const META = new Map(extendedKnowledgeItems.map((s) => [s.id, s]));

/* ── Arguments ────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const lire = (nom) => {
  const i = args.indexOf(nom);
  return i !== -1 ? args[i + 1] : null;
};

const VOIX = lire('--voix');
const SORTIE = lire('--sortie') ?? SORTIE_DEFAUT;
const A_BLANC = args.includes('--a-blanc');
const TOUS = args.includes('--tous');
const demandes = TOUS
  ? [...TOUS_LES_ARTICLES.keys()]
  : (lire('--articles') ?? '').split(',').map((x) => x.trim()).filter(Boolean);

if (!VOIX) {
  console.error('Il faut une voix : --voix fr-FR-VivienneMultilingualNeural');
  process.exit(2);
}
if (demandes.length === 0) {
  console.error('Il faut des articles : --articles id1,id2  ou  --tous');
  process.exit(2);
}

/* ── Contrôles avant de parler ────────────────────────────────────────── */

const ignores = [];
const problemes = [];
for (const id of demandes) {
  if (!TOUS_LES_ARTICLES.has(id)) problemes.push(`« ${id} » : aucun article`);
  else if (!INTRODUCTIONS[id]) problemes.push(`« ${id} » : aucune phrase d'introduction`);
}
if (problemes.length > 0) {
  console.error('Rien n a ete genere :');
  for (const p of problemes) console.error('  - ' + p);
  process.exit(1);
}

/* ── Préparation ──────────────────────────────────────────────────────── */

const REPRENDRE = !args.includes('--refaire');

const plan = demandes
  .filter((id) => {
    // Reprise apres interruption.
    //
    // La generation des trois voix dure des heures et s'interrompt : un flux
    // suspendu, une coupure, un arret volontaire. Refaire ce qui est deja
    // produit coute autant que de le produire, donc on saute les articles dont
    // les deux fichiers existent deja. `--refaire` force la regeneration.
    if (!REPRENDRE) return true;
    const base = join(SORTIE, `${id}-${VOIX}`);
    const dejaLa = existsSync(`${base}.mp3`) && existsSync(`${base}.json`);
    if (dejaLa) ignores.push(id);
    return !dejaLa;
  })
  .map((id) => {
    const segments = construireNarration(TOUS_LES_ARTICLES.get(id), INTRODUCTIONS[id]);
    return { id, segments, signes: signesDits(segments) };
  });

const totalSegments = plan.reduce((n, a) => n + a.segments.length, 0);
const totalSignes = plan.reduce((n, a) => n + a.signes, 0);

console.log(`Voix   : ${VOIX}`);
console.log(`Debit  : ${DEBIT}`);
console.log(`Plan   : ${plan.length} article(s), ${totalSegments} segments, ${totalSignes.toLocaleString('fr-FR')} signes`);
if (ignores.length > 0) {
  console.log(`Deja fait : ${ignores.length} article(s) ignore(s). --refaire pour les reprendre.`);
}
if (plan.length === 0) {
  console.log('Rien a faire : tous les articles demandes existent deja pour cette voix.');
  process.exit(0);
}
for (const a of plan) {
  console.log(`  ${a.id.padEnd(30)} ${String(a.segments.length).padStart(3)} segments  ${String(a.signes).padStart(6)} signes`);
}
console.log('');

if (A_BLANC) {
  console.log('A blanc : aucune synthese.');
  process.exit(0);
}

mkdirSync(SORTIE, { recursive: true });

/* ── Synthèse, article par article ────────────────────────────────────── */

function pont(...arguments_) {
  return execFileSync('python', [PONT, ...arguments_], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

const departGlobal = Date.now();
const resume = [];

for (const article of plan) {
  const debut = Date.now();
  const dossierTemporaire = join(tmpdir(), `nexus-audio-${process.pid}-${article.id}`);
  mkdirSync(dossierTemporaire, { recursive: true });

  const travail = {
    sortie: dossierTemporaire,
    debit: DEBIT,
    taches: article.segments.map((segment, rang) => ({
      voix: VOIX,
      fichier: String(rang).padStart(3, '0'),
      texte: segment.dit,
      reperes: true,
    })),
  };

  const fichierTravail = join(tmpdir(), `nexus-travail-${process.pid}.json`);
  writeFileSync(fichierTravail, JSON.stringify(travail), 'utf8');

  console.log(`── ${article.id} : ${article.segments.length} segments ──`);
  let resultats;
  try {
    resultats = JSON.parse(pont('synthese', fichierTravail));
  } finally {
    rmSync(fichierTravail, { force: true });
  }

  const echoues = resultats.filter((r) => r.erreur);
  if (echoues.length > 0) {
    console.error(`  ${echoues.length} segment(s) en echec : article abandonne.`);
    for (const r of echoues.slice(0, 3)) console.error(`    ${r.erreur}`);
    rmSync(dossierTemporaire, { recursive: true, force: true });
    continue;
  }

  // Concaténation dans l'ordre du plan, jamais dans l'ordre du dossier.
  const morceaux = article.segments.map((_, rang) =>
    readFileSync(join(dossierTemporaire, `${String(rang).padStart(3, '0')}.mp3`))
  );
  const { donnees, decalages, duree } = concatenerMp3(morceaux);

  const nomBase = `${article.id}-${VOIX}`;
  writeFileSync(join(SORTIE, `${nomBase}.mp3`), donnees);

  // Les repères de chaque segment sont ramenés au temps du fichier complet.
  const segments = article.segments.map((segment, rang) => {
    const reperes = JSON.parse(
      readFileSync(join(dossierTemporaire, `${String(rang).padStart(3, '0')}.reperes.json`), 'utf8')
    );
    const decalage = decalages[rang];
    return {
      type: segment.type,
      section: segment.section,
      paragraphe: segment.paragraphe,
      affiche: segment.affiche,
      debut: Number(decalage.toFixed(3)),
      duree: Number(analyserMp3(morceaux[rang]).duree.toFixed(3)),
      mots: reperes.mots.map((m) => ({
        texte: m.texte,
        debut: Number((decalage + m.debut).toFixed(3)),
        duree: Number(m.duree.toFixed(3)),
      })),
    };
  });

  const meta = META.get(article.id);
  writeFileSync(
    join(SORTIE, `${nomBase}.json`),
    JSON.stringify(
      {
        article: article.id,
        titre: meta?.title ?? article.id,
        voix: VOIX,
        debit: DEBIT,
        duree: Number(duree.toFixed(3)),
        octets: donnees.length,
        genere: new Date().toISOString(),
        segments,
      },
      null,
      1
    ),
    'utf8'
  );

  rmSync(dossierTemporaire, { recursive: true, force: true });

  const secondes = (Date.now() - debut) / 1000;
  const mots = article.segments.reduce(
    (n, s) => n + s.dit.trim().split(/\s+/).filter(Boolean).length,
    0
  );
  resume.push({
    id: article.id,
    segments: article.segments.length,
    signes: article.signes,
    mots,
    duree,
    octets: donnees.length,
    secondes,
  });

  console.log(
    `  ${Math.floor(duree / 60)} min ${String(Math.round(duree % 60)).padStart(2, '0')} d audio, ` +
      `${(donnees.length / 1024 / 1024).toFixed(2)} Mo, ` +
      `${Math.round((mots / duree) * 60)} mots/min, ` +
      `genere en ${secondes.toFixed(0)} s`
  );
  console.log('');
}

/* ── Manifeste ────────────────────────────────────────────────────────── */

// Reconstruit à partir des fichiers présents, et non des seuls articles
// produits à l'instant : la génération se fait par lots, et le manifeste doit
// décrire tout ce qui est écoutable, pas la dernière commande.
{
  const entrees = [];
  for (const fichier of readdirSync(SORTIE).filter((f) => f.endsWith('.json'))) {
    if (fichier === 'manifeste.json') continue;
    const j = JSON.parse(readFileSync(join(SORTIE, fichier), 'utf8'));
    entrees.push({
      article: j.article,
      titre: j.titre,
      voix: j.voix,
      duree: j.duree,
      octets: j.octets,
      segments: j.segments.length,
      donnees: fichier,
      audio: fichier.replace(/\.json$/, '.mp3'),
    });
  }
  entrees.sort((a, b) => a.article.localeCompare(b.article) || a.voix.localeCompare(b.voix));
  writeFileSync(
    join(SORTIE, 'manifeste.json'),
    JSON.stringify({ genere: new Date().toISOString(), articles: entrees }, null, 1),
    'utf8'
  );
  console.log(`Manifeste : ${entrees.length} enregistrement(s) ecoutable(s).`);
  console.log('');
}

/* ── Synthèse chiffrée, pour extrapoler ──────────────────────────────── */

if (resume.length === 0) process.exit(1);

const totalDuree = resume.reduce((n, r) => n + r.duree, 0);
const totalOctets = resume.reduce((n, r) => n + r.octets, 0);
const totalMots = resume.reduce((n, r) => n + r.mots, 0);
const totalTemps = (Date.now() - departGlobal) / 1000;

console.log('── Mesures ─────────────────────────────────────────────────────');
console.log(`articles generes      ${resume.length}`);
console.log(`audio produit         ${Math.floor(totalDuree / 60)} min ${String(Math.round(totalDuree % 60)).padStart(2, '0')}`);
console.log(`poids                 ${(totalOctets / 1024 / 1024).toFixed(2)} Mo`);
console.log(`cadence de lecture    ${Math.round((totalMots / totalDuree) * 60)} mots/min`);
console.log(`temps de generation   ${Math.floor(totalTemps / 60)} min ${String(Math.round(totalTemps % 60)).padStart(2, '0')}`);
console.log(`                      soit ${(totalTemps / totalDuree).toFixed(2)} s de calcul par seconde d audio`);
console.log('');

// Extrapolation aux cinquante articles, a partir du mesure et non du suppose.
const parArticleTemps = totalTemps / resume.length;
const parArticleOctets = totalOctets / resume.length;
console.log('── Extrapolation aux 50 articles ──────────────────────────────');
for (const voix of [1, 3]) {
  const minutes = (parArticleTemps * 50 * voix) / 60;
  const mo = (parArticleOctets * 50 * voix) / 1024 / 1024;
  console.log(
    `${voix} voix : ${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, '0')} de generation, ${mo.toFixed(0)} Mo`
  );
}
