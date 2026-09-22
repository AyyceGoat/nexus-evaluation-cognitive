/**
 * Génère la migration qui peuple `public.iq_items`.
 *
 * La banque d'items est écrite en TypeScript dans `src/data/iq/` — c'est là qu'on la
 * relit et qu'on la corrige. Mais elle ne part plus dans le navigateur : le serveur
 * sert les énoncés, et ne sert le corrigé qu'une fois la passation close. Cette table
 * est donc la seule source de vérité à l'exécution.
 *
 * Le fichier SQL est généré, jamais écrit à la main : 120 lignes recopiées
 * dériveraient de la banque à la première modification, et un corrigé serveur décalé
 * d'un cran fausserait tous les scores sans qu'aucun test ne bronche.
 * `scripts/verifie-seed-items.mjs` échoue si le fichier ne correspond plus.
 *
 * Usage : node scripts/genere-seed-items.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const CHEMIN_SQL = 'supabase/migrations/20260922100100_banque_items_contenu.sql';

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

/** Échappe une chaîne pour un littéral SQL. */
const texte = (valeur) =>
  valeur === null || valeur === undefined
    ? 'null'
    : `'${String(valeur).replace(/'/g, "''")}'`;

/** Sérialise une valeur en littéral `jsonb`. */
const json = (valeur) =>
  valeur === null || valeur === undefined
    ? 'null'
    : `${texte(JSON.stringify(valeur))}::jsonb`;

export function composerSql(items) {
  const lignes = items.map((item) =>
    '  (' +
    [
      texte(item.id),
      texte(item.aptitude),
      item.params.a,
      item.params.b,
      item.params.c,
      item.correctIndex,
      item.expectedSeconds,
      item.designDifficulty,
      texte(item.calibration?.version ?? 'design-1'),
      texte(item.prompt),
      json(item.options ?? null),
      json(item.visual ?? null),
      texte(item.explanation),
      json(item.reasoning ?? null),
    ].join(', ') +
    ')'
  );

  return `-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — banque d'items, contenu et corrigé
--
-- FICHIER GÉNÉRÉ. Ne pas modifier à la main.
--   régénérer : node scripts/genere-seed-items.mjs
--   vérifier  : node scripts/verifie-seed-items.mjs
--
-- Source : src/data/iq/ (${items.length} items sur cinq aptitudes).
--
-- Cette migration supersède la précédente : elle écrit toutes les colonnes, les
-- paramètres du modèle 3PL comme le contenu. La table n'a aucune politique RLS,
-- donc rien de tout cela n'est lisible depuis l'API. Les énoncés et les options
-- sont servis par \`items_de_passation()\`, le corrigé par
-- \`corrige_de_passation()\` et seulement sur une passation close.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.iq_items
  (id, aptitude, param_a, param_b, param_c, correct_index, expected_seconds,
   design_difficulty, bank_version, prompt, options, visual, explanation, reasoning)
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
  bank_version      = excluded.bank_version,
  prompt            = excluded.prompt,
  options           = excluded.options,
  visual            = excluded.visual,
  explanation       = excluded.explanation,
  reasoning         = excluded.reasoning;

-- Une fois le contenu en place, il devient obligatoire : un item sans énoncé ne
-- peut pas être affiché, et mieux vaut le refuser à l'insertion que le découvrir
-- à l'écran.
alter table public.iq_items
  alter column prompt      set not null,
  alter column explanation set not null;

-- Un item est soit textuel, soit visuel, jamais ni l'un ni l'autre.
alter table public.iq_items
  add constraint item_affichable check (options is not null or visual is not null);
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const items = await chargerBanque();
  const sql = composerSql(items);
  writeFileSync(CHEMIN_SQL, sql, 'utf8');
  console.log(`${CHEMIN_SQL} — ${items.length} items écrits, contenu compris`);
}
