/**
 * Génère la migration qui peuple `public.iq_items`.
 *
 * La banque d'items vit dans `src/data/iq/` : c'est elle qui rend les énoncés à
 * l'écran. Mais le SCORE, lui, est recalculé côté serveur, et le serveur ne peut
 * pas faire confiance au navigateur pour lui dire quels étaient les paramètres ni
 * quelle était la bonne réponse. Cette table est donc sa vérité.
 *
 * Le fichier SQL est généré, jamais écrit à la main : 120 lignes recopiées
 * dériveraient de la banque à la première modification, et un corrigé serveur
 * décalé d'un cran fausserait tous les scores sans qu'aucun test ne bronche.
 * `scripts/verifie-seed-items.mjs` échoue si le fichier ne correspond plus.
 *
 * Usage : node scripts/genere-seed-items.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const CHEMIN_SQL = 'supabase/migrations/20260921090100_banque_items.sql';

/** Compile la banque en un module importable par Node, et rend ses items. */
export async function chargerBanque() {
  const dossier = mkdtempSync(join(tmpdir(), 'nexus-banque-'));
  const sortie = join(dossier, 'banque.mjs');

  await build({
    entryPoints: ['src/data/iq/index.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: sortie,
    logLevel: 'error',
  });

  const module = await import(pathToFileURL(sortie).href);
  return module.itemBank;
}

/** Échappe une chaîne pour une insertion SQL littérale. */
const guillemets = (valeur) => `'${String(valeur).replace(/'/g, "''")}'`;

export function composerSql(items) {
  const lignes = items.map((item) =>
    '  (' +
    [
      guillemets(item.id),
      guillemets(item.aptitude),
      item.params.a,
      item.params.b,
      item.params.c,
      item.correctIndex,
      item.expectedSeconds,
      item.designDifficulty,
      guillemets(item.calibration?.version ?? 'design-1'),
    ].join(', ') +
    ')'
  );

  return `-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — banque d'items, côté serveur
--
-- FICHIER GÉNÉRÉ. Ne pas modifier à la main.
--   régénérer : node scripts/genere-seed-items.mjs
--   vérifier  : node scripts/verifie-seed-items.mjs
--
-- Source : src/data/iq/ (${items.length} items sur cinq aptitudes).
--
-- Ces lignes portent les paramètres du modèle 3PL et le corrigé. La table n'a
-- aucune politique RLS : elle est donc invisible depuis l'API, et seules les
-- fonctions serveur la lisent.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.iq_items
  (id, aptitude, param_a, param_b, param_c, correct_index, expected_seconds, design_difficulty, bank_version)
values
${lignes.join(',\n')}
on conflict (id) do update set
  aptitude          = excluded.aptitude,
  param_a           = excluded.param_a,
  param_b           = excluded.param_b,
  param_c           = excluded.param_c,
  correct_index     = excluded.correct_index,
  expected_seconds  = excluded.expected_seconds,
  design_difficulty = excluded.design_difficulty,
  bank_version      = excluded.bank_version;
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const items = await chargerBanque();
  const sql = composerSql(items);
  writeFileSync(CHEMIN_SQL, sql, 'utf8');
  console.log(`${CHEMIN_SQL} — ${items.length} items écrits`);
}
