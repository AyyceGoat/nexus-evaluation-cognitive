/**
 * Échoue si la migration de la banque d'items ne correspond plus à la banque.
 *
 * Ce contrôle existe pour une raison précise : le serveur corrige les réponses
 * depuis `public.iq_items`, et le navigateur affiche les énoncés depuis
 * `src/data/iq/`. Si les deux divergent d'un seul index de bonne réponse, les
 * scores deviennent faux et RIEN d'autre ne le signale — ni le typecheck, ni le
 * lint, ni les tests, puisque chacun des deux côtés reste cohérent avec lui-même.
 *
 * Usage : node scripts/verifie-seed-items.mjs
 */

import { readFileSync } from 'node:fs';
import { CHEMIN_SQL, chargerBanque, composerSql } from './genere-seed-items.mjs';

const items = await chargerBanque();
const attendu = composerSql(items);
const present = readFileSync(CHEMIN_SQL, 'utf8').replace(/\r\n/g, '\n');

if (present === attendu) {
  console.log(`Banque d'items : la migration correspond aux ${items.length} items de src/data/iq.`);
  process.exit(0);
}

// Localiser la première divergence est plus utile qu'un simple « ça diffère ».
const lignesPresentes = present.split('\n');
const lignesAttendues = attendu.split('\n');
const ecart = lignesAttendues.findIndex((ligne, i) => ligne !== lignesPresentes[i]);

console.error("ECHEC : la migration de la banque d'items ne correspond plus a src/data/iq.");
console.error(`Premiere divergence a la ligne ${ecart + 1} :`);
console.error(`  fichier : ${lignesPresentes[ecart] ?? '(fin de fichier)'}`);
console.error(`  attendu : ${lignesAttendues[ecart] ?? '(fin de fichier)'}`);
console.error('');
console.error('Regenerer avec : node scripts/genere-seed-items.mjs');
process.exit(1);
