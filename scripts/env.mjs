/**
 * Lecture de `.env` pour les scripts de vérification.
 *
 * Pourquoi ne pas simplement faire `source .env` dans un shell : le fichier peut
 * contenir un espace après le signe égal et des fins de ligne Windows. Dans ce cas,
 * `sh` prend la valeur pour une commande à exécuter et la recrache dans son message
 * d'erreur — donc dans les journaux. Un secret ne doit jamais dépendre du bon vouloir
 * d'un analyseur syntaxique de shell.
 *
 * Ce module parse lui-même, ne journalise jamais une valeur, et n'expose que les
 * longueurs quand il faut prouver qu'une variable est renseignée.
 */

import { existsSync, readFileSync } from 'node:fs';

const LIGNE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;

/** Retire les guillemets encadrants, simples ou doubles. */
function denuder(valeur) {
  if (valeur.length >= 2) {
    const premier = valeur[0];
    if ((premier === '"' || premier === "'") && valeur.endsWith(premier)) {
      return valeur.slice(1, -1);
    }
  }
  return valeur;
}

/**
 * Rend les variables d'environnement, complétées par celles de `.env`.
 * Les variables déjà présentes dans l'environnement gardent la priorité.
 */
export function lireEnv(chemin = '.env') {
  const valeurs = { ...process.env };
  if (!existsSync(chemin)) return valeurs;

  for (const brute of readFileSync(chemin, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    if (!brute.trim() || brute.trim().startsWith('#')) continue;
    const trouve = LIGNE.exec(brute);
    if (!trouve) continue;
    const valeur = denuder(trouve[2]);
    if (valeur) valeurs[trouve[1]] = valeur;
  }
  return valeurs;
}

/**
 * Exige les variables données, et interrompt proprement si l'une manque.
 *
 * N'affiche que le nom et la présence, jamais la valeur ni un fragment de valeur.
 */
export function exigerEnv(noms, aide = 'Voir docs/SUPABASE.md.') {
  const env = lireEnv();
  const manquantes = noms.filter((nom) => !env[nom]);

  if (manquantes.length > 0) {
    console.error('Variables absentes de .env :');
    for (const nom of noms) {
      console.error(`  ${nom.padEnd(26)} ${env[nom] ? 'ok' : 'ABSENTE'}`);
    }
    console.error('');
    console.error(aide);
    process.exit(2);
  }

  return env;
}
