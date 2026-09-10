// Calcule les ratios de contraste WCAG 2.1 de la palette. Sert de garde-fou :
// aucune valeur de DESIGN.md n'est écrite sans être passée ici.
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

const P = {
  noir: '#000000',
  graphite: '#141414',
  ardoise: '#232323',
  brume: '#8A8A8A',
  craie: '#F2F0EC',
  mesure: '#5FB3A8',
  alerte: '#E8877A',
};

const pairs = [
  ['craie', 'noir'], ['craie', 'graphite'], ['craie', 'ardoise'],
  ['brume', 'noir'], ['brume', 'graphite'], ['brume', 'ardoise'],
  ['mesure', 'noir'], ['mesure', 'graphite'], ['mesure', 'ardoise'],
  ['alerte', 'noir'], ['alerte', 'graphite'],
  ['noir', 'mesure'], ['craie', 'mesure'],
  ['noir', 'alerte'], ['craie', 'alerte'],
  ['ardoise', 'noir'], ['ardoise', 'graphite'],
];

const verdict = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'ECHEC');
console.log('couleur sur fond              ratio   verdict (texte normal)');
for (const [fg, bg] of pairs) {
  const r = ratio(P[fg], P[bg]);
  console.log(`${(fg + ' / ' + bg).padEnd(28)} ${r.toFixed(2).padStart(5)}   ${verdict(r)}`);
}
console.log('\n-- rappel de l\'ancienne palette --');
console.log('nexus-muted #64748b / #050510 :', ratio('#64748b', '#050510').toFixed(2));
console.log('nexus-accent bg + blanc       :', ratio('#ffffff', '#6366f1').toFixed(2));
