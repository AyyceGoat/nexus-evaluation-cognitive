/**
 * Garde-fou du système visuel. Échoue si une valeur en dur réapparaît dans un composant.
 *
 * Lancé par `npm run verifie:design`, lui-même appelé par `npm run lint`. L'audit avait
 * relevé 353 couleurs codées en dur sur neuf familles ; ce script est ce qui empêche la
 * 354ᵉ d'arriver sans qu'on la voie.
 */

import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const TOKENS = ['noir', 'graphite', 'ardoise', 'brume', 'craie', 'mesure', 'alerte'];

const REGLES = [
  {
    nom: 'palette Tailwind par défaut',
    motif:
      /\b(?:bg|text|border|ring|fill|stroke|from|via|to|shadow|outline|decoration|divide|placeholder|caret|accent)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
    aide: 'Utiliser un token : ' + TOKENS.join(', '),
  },
  {
    nom: 'couleur hexadécimale en dur',
    motif: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    aide: 'Passer par une variable CSS var(--color-…)',
  },
  {
    nom: 'couleur rgb/hsl en dur',
    motif: /\b(?:rgba?|hsla?)\s*\(/g,
    aide: 'Passer par une variable CSS var(--color-…)',
  },
  {
    nom: 'blanc ou noir brut',
    motif: /\b(?:bg|text|border|ring|fill|stroke|placeholder)-(?:white|black)\b/g,
    aide: 'craie pour le texte clair, noir pour le fond',
  },
  {
    nom: 'ombre portée décorative',
    motif: /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g,
    aide: "L'élévation passe par la bordure. Une seule ombre existe : --ombre-dialogue",
  },
  {
    nom: 'halo flou décoratif',
    motif: /\bblur-(?:sm|md|lg|xl|2xl|3xl)\b/g,
    aide: 'Interdit par DESIGN.md §4.3',
  },
  {
    nom: 'dégradé de couleur',
    motif: /\bbg-gradient-to-/g,
    aide: 'Aucun dégradé décoratif dans le système',
  },
  {
    nom: 'monospace sur un libellé',
    motif: /\bfont-mono\b/g,
    aide: 'Utiliser la classe .nombres (chiffres tabulaires en Public Sans)',
  },
  {
    nom: 'focus supprimé sans remplacement',
    motif: /\bfocus:outline-none\b/g,
    aide: 'Le focus doit rester visible. Voir :focus-visible dans index.css',
  },
  {
    nom: 'texte clair sur fond accent plein (contraste 2,17 — échec AA)',
    // Sur une même chaîne de classes : bg-mesure/bg-alerte plein + texte clair.
    motif: /(?:"|'|`)[^"'`]*\bbg-(?:mesure|alerte)\b(?!\/)[^"'`]*\btext-(?:craie|brume)\b[^"'`]*(?:"|'|`)/g,
    aide: 'Sur mesure/alerte plein, le texte est text-noir (8,50 au lieu de 2,17)',
  },
];

function fichiers() {
  return globSync('src/**/*.{ts,tsx}', { cwd: process.cwd() }).filter(
    (p) => !p.replace(/\\/g, '/').includes('/data/')
  );
}

let violations = 0;

for (const chemin of fichiers()) {
  const contenu = readFileSync(chemin, 'utf8');
  const lignes = contenu.split('\n');

  for (const regle of REGLES) {
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
  console.error(`\n${violations} valeur(s) en dur. Le système visuel est la seule source de vérité.`);
  process.exit(1);
}

console.log('Systeme visuel : aucune valeur en dur dans les composants.');
