/**
 * Vérifie la substance des articles du Savoir.
 *
 * ── Le défaut que ce script empêche de revenir ──
 *
 * Chaque sujet du Savoir portait un résumé d'environ 180 signes et un « article
 * complet » d'environ 660 signes — une centaine de mots, livrée d'un bloc sous
 * un onglet qui promettait autre chose. Le reproche était juste : il n'y avait
 * que le résumé, deux fois.
 *
 * Un contrôle automatique est nécessaire parce que la régression est silencieuse.
 * Rien dans une compilation, un test de rendu ou une vérification de types ne
 * signale qu'un article est devenu court : le code continue de fonctionner
 * parfaitement en affichant trois lignes. Seul un seuil chiffré le détecte.
 *
 * ── Ce qui est contrôlé ──
 *
 *   1. chaque sujet de `extendedKnowledgeItems` a un article ;
 *   2. aucun article n'est orphelin — pas d'article sans sujet correspondant ;
 *   3. structure : au moins SECTIONS_MIN sections titrées, au moins un
 *      paragraphe par section, titres non vides et distincts ;
 *   4. substance : au moins SIGNES_MIN signes et MOTS_MIN mots par article, et
 *      au moins SIGNES_PARA_MIN signes par paragraphe — un paragraphe d'une
 *      ligne est un titre déguisé ;
 *   5. le résumé reste un résumé : plus court que l'article, et nettement ;
 *   6. le temps de lecture affiché sur les cartes correspond au texte réel,
 *      calculé par la même fonction que celle utilisée à l'écran.
 *
 * Le point 6 est celui qui a motivé le script autant que les autres : les
 * cartes annonçaient « 5 min de lecture » pour cent mots, soit trente secondes.
 * Un chiffre faux affiché avec assurance est pire que pas de chiffre.
 *
 * Usage : node scripts/verifie-savoir.mjs [--details] [--json <fichier>]
 */

import { writeFileSync } from 'node:fs';
import { minutesDeLecture, compterMots } from '../src/data/savoir/types.ts';
import { extendedKnowledgeItems, extendedDomains } from '../src/data/knowledgeExtended.ts';
import { articlesHistoire } from '../src/data/savoir/histoire.ts';
import { articlesEconomie } from '../src/data/savoir/economie.ts';
import { articlesScience } from '../src/data/savoir/science.ts';
import { articlesPensee } from '../src/data/savoir/pensee.ts';
import { articlesFigures } from '../src/data/savoir/figures.ts';

/* ── Seuils ────────────────────────────────────────────────────────────────
   Choisis sous le plus court des articles écrits, avec une marge : le but est
   d'attraper un effondrement, pas d'imposer un calibre. */

const SECTIONS_MIN = 5;
const MOTS_MIN = 700;
const SIGNES_MIN = 4500;
const SIGNES_PARA_MIN = 180;
/** L'article doit peser au moins ce multiple du résumé. */
const RAPPORT_RESUME_MIN = 15;

const PAR_DOMAINE = {
  history_geopolitics: articlesHistoire,
  economy_finance: articlesEconomie,
  science_tech: articlesScience,
  psychology_philosophy: articlesPensee,
  legendary_figures: articlesFigures,
};

const details = process.argv.includes('--details');
const iJson = process.argv.indexOf('--json');
const fichierJson = iJson !== -1 ? process.argv[iJson + 1] : null;

const problemes = [];
const mesures = {};

function exiger(condition, message) {
  if (!condition) problemes.push(message);
}

/* ── 1 et 2 : correspondance entre sujets et articles ───────────────────── */

const tousLesArticles = new Map();
for (const [domaine, articles] of Object.entries(PAR_DOMAINE)) {
  exiger(
    extendedDomains.some((d) => d.id === domaine),
    `le domaine « ${domaine} » a des articles mais n'existe pas dans extendedDomains`
  );
  for (const [id, sections] of Object.entries(articles)) {
    exiger(!tousLesArticles.has(id), `l'article « ${id} » est défini deux fois`);
    tousLesArticles.set(id, { domaine, sections });
  }
}

const idsSujets = new Set(extendedKnowledgeItems.map((i) => i.id));
for (const id of tousLesArticles.keys()) {
  exiger(idsSujets.has(id), `article orphelin : « ${id} » ne correspond à aucun sujet`);
}

/* ── 3 à 6 : un passage par sujet ───────────────────────────────────────── */

for (const sujet of extendedKnowledgeItems) {
  const entree = tousLesArticles.get(sujet.id);

  if (!entree) {
    problemes.push(`« ${sujet.id} » (${sujet.title}) n'a aucun article`);
    continue;
  }

  const prefixe = `« ${sujet.id} »`;
  const { sections, domaine } = entree;

  exiger(
    domaine === sujet.domainId,
    `${prefixe} est rangé dans ${domaine} alors que le sujet déclare ${sujet.domainId}`
  );

  // Structure.
  exiger(
    sections.length >= SECTIONS_MIN,
    `${prefixe} n'a que ${sections.length} section(s), minimum ${SECTIONS_MIN}`
  );

  const titres = new Set();
  for (const [index, section] of sections.entries()) {
    const ou = `${prefixe} section ${index + 1}`;
    exiger(
      typeof section.titre === 'string' && section.titre.trim().length >= 8,
      `${ou} : titre absent ou trop court`
    );
    exiger(!titres.has(section.titre), `${ou} : titre en doublon (« ${section.titre} »)`);
    titres.add(section.titre);

    exiger(
      Array.isArray(section.paragraphes) && section.paragraphes.length >= 1,
      `${ou} : aucun paragraphe`
    );

    for (const [k, paragraphe] of (section.paragraphes ?? []).entries()) {
      exiger(
        typeof paragraphe === 'string' && paragraphe.trim().length >= SIGNES_PARA_MIN,
        `${ou} paragraphe ${k + 1} : ${String(paragraphe).trim().length} signes, minimum ${SIGNES_PARA_MIN}`
      );
    }
  }

  // Substance.
  const mots = compterMots(sections);
  const signes = sections.reduce(
    (n, s) => n + s.paragraphes.reduce((k, p) => k + p.length, 0),
    0
  );
  const minutes = minutesDeLecture(sections);
  const paragraphes = sections.reduce((n, s) => n + s.paragraphes.length, 0);

  exiger(mots >= MOTS_MIN, `${prefixe} : ${mots} mots, minimum ${MOTS_MIN}`);
  exiger(signes >= SIGNES_MIN, `${prefixe} : ${signes} signes, minimum ${SIGNES_MIN}`);

  // Le résumé doit rester un résumé.
  const tailleResume = (sujet.summary ?? '').length;
  exiger(tailleResume > 0, `${prefixe} : résumé absent`);
  exiger(
    tailleResume === 0 || signes >= tailleResume * RAPPORT_RESUME_MIN,
    `${prefixe} : l'article ne fait que ${(signes / tailleResume).toFixed(1)} fois le résumé, minimum ${RAPPORT_RESUME_MIN}`
  );

  // Le temps de lecture annoncé doit être celui du texte réel.
  exiger(
    sujet.readTimeMinutes === minutes,
    `${prefixe} : la carte annonce ${sujet.readTimeMinutes} min alors que l'article en fait ${minutes}`
  );

  mesures[sujet.id] = { domaine, sections: sections.length, paragraphes, mots, signes, minutes };
}

/* ── Rapport ───────────────────────────────────────────────────────────── */

const valeurs = Object.values(mesures);
const trier = (cle) => valeurs.map((m) => m[cle]).sort((a, b) => a - b);

function resume(cle, unite) {
  const t = trier(cle);
  if (t.length === 0) return `${cle} : aucune mesure`;
  const total = t.reduce((a, b) => a + b, 0);
  return (
    `${cle.padEnd(12)} min ${String(t[0]).padStart(6)}   ` +
    `median ${String(t[t.length >> 1]).padStart(6)}   ` +
    `max ${String(t[t.length - 1]).padStart(6)}   ` +
    `total ${total} ${unite}`
  );
}

if (details) {
  for (const [id, m] of Object.entries(mesures)) {
    console.log(
      `  ${id.padEnd(30)} ${String(m.sections).padStart(2)} sect  ` +
        `${String(m.paragraphes).padStart(2)} para  ${String(m.mots).padStart(5)} mots  ${m.minutes} min`
    );
  }
  console.log('');
}

console.log(`Savoir : ${valeurs.length} article(s) pour ${extendedKnowledgeItems.length} sujet(s).`);
console.log('  ' + resume('sections', 'sections'));
console.log('  ' + resume('paragraphes', 'paragraphes'));
console.log('  ' + resume('mots', 'mots'));
console.log('  ' + resume('signes', 'signes'));

if (fichierJson) {
  writeFileSync(fichierJson, JSON.stringify(mesures, null, 1), 'utf8');
  console.log(`  mesures ecrites dans ${fichierJson}`);
}

if (problemes.length > 0) {
  console.error('');
  console.error(`${problemes.length} probleme(s) :`);
  for (const p of problemes) console.error('  - ' + p);
  process.exit(1);
}

console.log('Tous les controles passent.');
