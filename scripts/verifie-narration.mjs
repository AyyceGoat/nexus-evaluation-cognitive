/**
 * Chiffre le texte à synthétiser, et contrôle ce qui se lirait mal.
 *
 * Sert deux usages :
 *
 *   - AVANT la génération, il donne le nombre exact de caractères facturés, la
 *     durée d'écoute estimée et le poids des fichiers. Ces trois chiffres
 *     décident du service et du budget, donc ils ne s'estiment pas au doigt
 *     mouillé.
 *   - APRÈS, il garde le corpus lisible à voix haute : tout sigle apparaissant
 *     dans un article sans règle de prononciation est signalé. Sans ce
 *     contrôle, un sigle ajouté plus tard serait lu au hasard par le moteur, et
 *     personne ne s'en apercevrait avant de l'entendre.
 *
 * Usage : node scripts/verifie-narration.mjs [--exemple <id>] [--liste-sigles]
 */

import { SIGLES, versSsml, versTexte } from '../src/lib/narration/normaliser.ts';
import { extendedKnowledgeItems } from '../src/data/knowledgeExtended.ts';
import { articlesHistoire } from '../src/data/savoir/histoire.ts';
import { articlesEconomie } from '../src/data/savoir/economie.ts';
import { articlesScience } from '../src/data/savoir/science.ts';
import { articlesPensee } from '../src/data/savoir/pensee.ts';
import { articlesFigures } from '../src/data/savoir/figures.ts';

const PAR_DOMAINE = {
  history_geopolitics: articlesHistoire,
  economy_finance: articlesEconomie,
  science_tech: articlesScience,
  psychology_philosophy: articlesPensee,
  legendary_figures: articlesFigures,
};

/** Débit de narration retenu, en mots par minute. */
const MOTS_PAR_MINUTE = 150;

/** Débits envisagés pour l'encodage, en kilobits par seconde. */
const DEBITS = [
  { nom: 'Opus 24 kb/s', kbps: 24, conteneur: '.opus' },
  { nom: 'AAC 40 kb/s', kbps: 40, conteneur: '.m4a' },
  { nom: 'AAC 48 kb/s', kbps: 48, conteneur: '.m4a' },
  { nom: 'MP3 48 kb/s', kbps: 48, conteneur: '.mp3' },
  { nom: 'MP3 64 kb/s', kbps: 64, conteneur: '.mp3' },
];

const args = process.argv.slice(2);
const iExemple = args.indexOf('--exemple');
const exemple = iExemple !== -1 ? args[iExemple + 1] : null;

/* ── Parcours ─────────────────────────────────────────────────────────── */

const tousLesArticles = new Map();
for (const articles of Object.values(PAR_DOMAINE)) {
  for (const [id, sections] of Object.entries(articles)) tousLesArticles.set(id, sections);
}

let signesBruts = 0;
let signesTexte = 0;
let signesSsml = 0;
let mots = 0;
const siglesTrouves = new Map();
const problemes = [];

/** Tout mot en capitales d'au moins deux signes, hors chiffres romains traités. */
const MOTIF_SIGLE = /\b[A-Z][A-Z0-9]{1,6}\b/g;

for (const sujet of extendedKnowledgeItems) {
  const sections = tousLesArticles.get(sujet.id);
  if (!sections) {
    problemes.push(`« ${sujet.id} » : aucun article`);
    continue;
  }

  for (const section of sections) {
    for (const source of [section.titre, ...section.paragraphes]) {
      signesBruts += source.length;

      const clair = versTexte(source);
      signesTexte += clair.length;
      signesSsml += versSsml(source).length;
      mots += clair.trim().split(/\s+/).filter(Boolean).length;

      // Les sigles restants dans la sortie texte n'ont pas été traités.
      for (const sigle of clair.match(MOTIF_SIGLE) ?? []) {
        if (SIGLES[sigle]) continue;
        siglesTrouves.set(sigle, (siglesTrouves.get(sigle) ?? 0) + 1);
      }
    }
  }
}

/* ── Rapport ──────────────────────────────────────────────────────────── */

const minutes = mots / MOTS_PAR_MINUTE;

console.log('── Volume a synthetiser, par voix ──────────────────────────────');
console.log(`articles                   ${tousLesArticles.size}`);
console.log(`signes bruts               ${signesBruts.toLocaleString('fr-FR')}`);
console.log(`signes apres normalisation ${signesTexte.toLocaleString('fr-FR')}`);
console.log(`signes en SSML             ${signesSsml.toLocaleString('fr-FR')}   (balises comprises)`);
console.log(`mots prononces             ${mots.toLocaleString('fr-FR')}`);
console.log(
  `duree estimee              ${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, '0')}   a ${MOTS_PAR_MINUTE} mots/min`
);
console.log(
  `par article                ${Math.round(minutes / tousLesArticles.size)} min en moyenne`
);
console.log('');

console.log('── Poids des fichiers ──────────────────────────────────────────');
for (const debit of DEBITS) {
  const octetsParSeconde = (debit.kbps * 1000) / 8;
  const total = minutes * 60 * octetsParSeconde;
  const parArticle = total / tousLesArticles.size;
  console.log(
    `${debit.nom.padEnd(14)} ${debit.conteneur.padEnd(6)} ` +
      `${(parArticle / 1024 / 1024).toFixed(2)} Mo/article   ` +
      `${(total / 1024 / 1024).toFixed(0)} Mo pour une voix   ` +
      `${((total * 2) / 1024 / 1024).toFixed(0)} Mo pour deux`
  );
}
console.log('');

console.log('── Sigles sans regle de prononciation ──────────────────────────');
if (siglesTrouves.size === 0) {
  console.log('Aucun : tous les sigles du corpus ont une regle.');
} else {
  const tries = [...siglesTrouves.entries()].sort((a, b) => b[1] - a[1]);
  for (const [sigle, n] of tries) console.log(`  ${sigle.padEnd(10)} ${n} occurrence(s)`);
  problemes.push(`${siglesTrouves.size} sigle(s) sans regle de prononciation`);
}
console.log('');

if (exemple) {
  const sections = tousLesArticles.get(exemple);
  if (!sections) {
    console.error(`Sujet inconnu : ${exemple}`);
    process.exit(1);
  }
  console.log(`── Avant / apres, premier paragraphe de ${exemple} ─────────────`);
  const source = sections[0].paragraphes[0];
  console.log('');
  console.log('AVANT :');
  console.log(source);
  console.log('');
  console.log('APRES :');
  console.log(versTexte(source));
  console.log('');
}

if (problemes.length > 0) {
  console.error(`${problemes.length} probleme(s) :`);
  for (const p of problemes) console.error('  - ' + p);
  process.exit(1);
}

console.log('Corpus lisible a voix haute : aucun signalement.');
