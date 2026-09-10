/**
 * Garde-fou du système visuel. Échoue si une valeur en dur réapparaît dans un composant.
 *
 * Lancé par `npm run verifie:design`, lui-même appelé par `npm run lint`. L'audit avait
 * relevé 353 couleurs codées en dur sur neuf familles ; ce script est ce qui empêche la
 * 354ᵉ d'arriver sans qu'on la voie.
 */

import { globSync, readFileSync } from 'node:fs';

const TOKENS = ['noir', 'graphite', 'ardoise', 'brume', 'craie', 'mesure', 'alerte'];

const REGLES = [
  {
    cle: 'palette-tailwind',
    nom: 'palette Tailwind par défaut',
    motif:
      /\b(?:bg|text|border|ring|fill|stroke|from|via|to|shadow|outline|decoration|divide|placeholder|caret|accent)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
    aide: 'Utiliser un token : ' + TOKENS.join(', '),
  },
  {
    cle: 'hex',
    nom: 'couleur hexadécimale en dur',
    motif: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    aide: 'Passer par une variable CSS var(--color-…)',
  },
  {
    cle: 'rgb',
    nom: 'couleur rgb/hsl en dur',
    motif: /\b(?:rgba?|hsla?)\s*\(/g,
    aide: 'Passer par une variable CSS var(--color-…)',
  },
  {
    cle: 'blanc-noir',
    nom: 'blanc ou noir brut',
    motif: /\b(?:bg|text|border|ring|fill|stroke|placeholder)-(?:white|black)\b/g,
    aide: 'craie pour le texte clair, noir pour le fond',
  },
  {
    cle: 'ombre',
    nom: 'ombre portée décorative',
    motif: /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g,
    aide: "L'élévation passe par la bordure. Une seule ombre existe : --ombre-dialogue",
  },
  {
    cle: 'flou',
    nom: 'halo flou décoratif',
    motif: /\bblur-(?:sm|md|lg|xl|2xl|3xl)\b/g,
    aide: 'Interdit par DESIGN.md §4.3',
  },
  {
    cle: 'degrade',
    nom: 'dégradé de couleur',
    motif: /\bbg-gradient-to-/g,
    aide: 'Aucun dégradé décoratif dans le système',
  },
  {
    cle: 'monospace',
    nom: 'monospace sur un libellé',
    motif: /\bfont-mono\b/g,
    aide: 'Utiliser la classe .nombres (chiffres tabulaires en Public Sans)',
  },
  {
    cle: 'focus',
    nom: 'focus supprimé sans remplacement',
    motif: /\bfocus:outline-none\b/g,
    aide: 'Le focus doit rester visible. Voir :focus-visible dans index.css',
  },
  {
    cle: 'contraste-accent',
    nom: 'texte clair sur fond accent plein (contraste 2,17 — échec AA)',
    motif: /(?:"|'|`)[^"'`]*\bbg-(?:mesure|alerte)\b(?!\/)[^"'`]*\btext-(?:craie|brume)\b[^"'`]*(?:"|'|`)/g,
    aide: 'Sur mesure/alerte plein, le texte est text-noir (8,50 au lieu de 2,17)',
  },
];

/**
 * Dérogation par fichier.
 *
 * Un fichier peut s'exempter d'une règle en portant un commentaire de la forme
 * `verifie-tokens: derogation <cle> — <raison>`. La raison est obligatoire et doit être
 * substantielle : sans elle la dérogation est refusée, pour qu'aucune exception ne
 * s'installe en silence.
 *
 * Une seule existe aujourd'hui : `src/components/robot/theme.ts`, dont les valeurs de
 * repli sont indispensables parce que three.js n'accepte pas une variable CSS.
 */
const MARQUEUR = /verifie-tokens:\s*derogation\s+([a-z-]+)\s+[—-]\s*(.+)/g;
const RAISON_MINIMALE = 30;

function derogations(contenu) {
  const accordees = new Map();
  for (const trouve of contenu.matchAll(MARQUEUR)) {
    const regle = trouve[1];
    const raison = (trouve[2] ?? '').trim();
    if (raison.length >= RAISON_MINIMALE) accordees.set(regle, raison);
  }
  return accordees;
}

function fichiers() {
  return globSync('src/**/*.{ts,tsx}', { cwd: process.cwd() }).filter(
    (chemin) => !chemin.replace(/\\/g, '/').includes('/data/')
  );
}

let violations = 0;
const exemptionsUtilisees = [];

for (const chemin of fichiers()) {
  const contenu = readFileSync(chemin, 'utf8');
  const lignes = contenu.split('\n');
  const exemptions = derogations(contenu);

  for (const regle of REGLES) {
    if (exemptions.has(regle.cle)) {
      exemptionsUtilisees.push(`${chemin} — ${regle.cle} : ${exemptions.get(regle.cle)}`);
      continue;
    }

    lignes.forEach((ligne, index) => {
      // Les commentaires documentent souvent les valeurs interdites : on les ignore.
      const nu = ligne.trim();
      if (nu.startsWith('*') || nu.startsWith('//') || nu.startsWith('/*')) return;

      const trouves = ligne.match(regle.motif);
      if (!trouves) return;

      violations += trouves.length;
      console.error(
        `${chemin}:${index + 1}  ${regle.nom}\n    ${trouves.slice(0, 3).join(', ')}\n    → ${regle.aide}`
      );
    });
  }
}

if (violations > 0) {
  console.error(
    `\n${violations} valeur(s) en dur. Le système visuel est la seule source de vérité.`
  );
  process.exit(1);
}

console.log('Systeme visuel : aucune valeur en dur dans les composants.');
if (exemptionsUtilisees.length > 0) {
  console.log(`Derogations accordees (${exemptionsUtilisees.length}) :`);
  for (const ligne of exemptionsUtilisees) console.log(`  - ${ligne}`);
}
