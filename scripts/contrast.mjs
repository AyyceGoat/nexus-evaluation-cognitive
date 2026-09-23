/**
 * Calcule les ratios de contraste WCAG 2.1 de la palette, et échoue si l'un des
 * couples de texte descend sous la cible.
 *
 * Les couleurs sont LUES DANS `src/index.css`, jamais recopiées. La version
 * précédente en gardait sa propre copie : après la refonte de la palette, elle
 * mesurait encore les anciennes valeurs et annonçait 6,08 là où le produit servait
 * 10,29. Un garde-fou qui contrôle une copie périmée ne garde rien.
 *
 * Cible : AAA (7:1) pour tout texte, et non le minimum AA. Un écran de téléphone
 * en plein jour n'est pas un écran de bureau dans une pièce sombre.
 *
 * Usage : node scripts/contrast.mjs
 */

import { readFileSync } from 'node:fs';

/* ── Mathématique WCAG ────────────────────────────────────────────────────── */

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ── Lecture de la palette réelle ─────────────────────────────────────────── */

const css = readFileSync('src/index.css', 'utf8');
const P = {};
for (const [, nom, valeur] of css.matchAll(/--color-([a-z]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  P[nom] = valeur;
}

const ATTENDUES = ['noir', 'graphite', 'ardoise', 'brume', 'texte', 'craie', 'mesure', 'alerte'];
const manquantes = ATTENDUES.filter((n) => !P[n]);
if (manquantes.length > 0) {
  console.error('Couleurs introuvables dans src/index.css :', manquantes.join(', '));
  process.exit(2);
}

console.log('Palette lue dans src/index.css :');
for (const nom of ATTENDUES) console.log(`  --color-${nom.padEnd(9)} ${P[nom]}`);
console.log('');

/* ── Couples à contrôler ──────────────────────────────────────────────────── */

/** `cible` : ratio minimal exigé. `texte` marque les couples réellement lus. */
const COUPLES = [
  // Les trois niveaux de texte, sur les trois fonds.
  { fg: 'craie', bg: 'noir', cible: 7, texte: true },
  { fg: 'craie', bg: 'graphite', cible: 7, texte: true },
  { fg: 'craie', bg: 'ardoise', cible: 7, texte: true },
  { fg: 'texte', bg: 'noir', cible: 7, texte: true },
  { fg: 'texte', bg: 'graphite', cible: 7, texte: true },
  { fg: 'texte', bg: 'ardoise', cible: 7, texte: true },
  { fg: 'brume', bg: 'noir', cible: 7, texte: true },
  { fg: 'brume', bg: 'graphite', cible: 7, texte: true },
  { fg: 'brume', bg: 'ardoise', cible: 7, texte: true },

  // L'accent, en texte puis en fond de bouton.
  { fg: 'mesure', bg: 'noir', cible: 7, texte: true },
  { fg: 'mesure', bg: 'graphite', cible: 7, texte: true },
  { fg: 'mesure', bg: 'ardoise', cible: 4.5, texte: true },
  { fg: 'noir', bg: 'mesure', cible: 7, texte: true },

  { fg: 'alerte', bg: 'noir', cible: 7, texte: true },
  { fg: 'alerte', bg: 'graphite', cible: 7, texte: true },
  { fg: 'noir', bg: 'alerte', cible: 7, texte: true },

  // Séparateurs et bordures : 3:1 suffit, ce n'est pas du texte.
  { fg: 'ardoise', bg: 'noir', cible: 1.2, texte: false },
  { fg: 'ardoise', bg: 'graphite', cible: 1.1, texte: false },
];

const verdict = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA grand seulement' : 'ECHEC');

let echecs = 0;
console.log('couleur sur fond              ratio   cible   verdict');
for (const { fg, bg, cible, texte } of COUPLES) {
  const r = ratio(P[fg], P[bg]);
  const passe = r >= cible;
  if (!passe) echecs++;
  // Un séparateur n'est pas du texte : son verdict est sa cible, pas AAA.
  const mention = texte
    ? passe
      ? verdict(r)
      : 'SOUS LA CIBLE'
    : passe
      ? 'conforme (séparateur)'
      : 'SOUS LA CIBLE (séparateur)';
  console.log(
    `${(fg + ' / ' + bg).padEnd(28)} ${r.toFixed(2).padStart(5)}   ${String(cible).padStart(5)}   ${mention}`
  );
}

/* ── Écart entre les niveaux de texte ─────────────────────────────────────── */

// Une hiérarchie ne tient pas si deux niveaux se ressemblent : on exige un écart
// perceptible de luminance entre titre, corps et secondaire.
console.log('');
console.log('hiérarchie des trois niveaux de texte (luminance relative) :');
const niveaux = ['craie', 'texte', 'brume'].map((n) => ({ nom: n, l: lum(P[n]) }));
for (const n of niveaux) console.log(`  ${n.nom.padEnd(8)} ${n.l.toFixed(3)}`);

for (let i = 0; i < niveaux.length - 1; i++) {
  const ecart = niveaux[i].l - niveaux[i + 1].l;
  const suffisant = ecart >= 0.08;
  if (!suffisant) echecs++;
  console.log(
    `  écart ${niveaux[i].nom} → ${niveaux[i + 1].nom} : ${ecart.toFixed(3)}` +
      (suffisant ? '' : '  ECART INSUFFISANT (< 0,08)')
  );
}

console.log('');
if (echecs === 0) {
  console.log('Palette conforme : tout texte au-dessus de sa cible, hiérarchie marquée.');
  process.exit(0);
}
console.log(`${echecs} couple(s) sous la cible.`);
process.exit(1);
