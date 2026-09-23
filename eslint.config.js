import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// Périmètre volontairement restreint à la correction (Phase 1 « assainissement ») :
// règles JS/TS de base + règles des hooks React.
//
// `eslint-plugin-jsx-a11y` n'est PAS activé ici. Le code contient aujourd'hui des
// défauts d'accessibilité connus et documentés (cartes en <div onClick>, modales sans
// piège de focus, labels non associés — voir docs/AUDIT.md §4.3). Les activer maintenant
// produirait une liste d'erreurs que cette phase n'a pas mandat de corriger. Le plugin
// sera ajouté dans la phase qui traite réellement l'accessibilité, en même temps que
// les corrections.
export default tseslint.config(
  {
    // `supabase/functions/**` cible le runtime Deno : globals différents (Deno.env,
    // Deno.serve), imports par URL, et ces fichiers sont hors du `include` de
    // tsconfig.json. Les linter ici produirait du bruit sans rien vérifier d'utile.
    //
    // ANGLE MORT ASSUMÉ ET CONSIGNÉ : ces fichiers ne sont donc ni typecheckés ni
    // lintés par ce dépôt. Ils le seront par `deno check` au déploiement. Voir
    // docs/JOURNAL.md et docs/RETOUR.md.
    ignores: ['dist/**', 'node_modules/**', 'public/**', 'supabase/functions/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // `noUnusedLocals` / `noUnusedParameters` de tsconfig couvrent déjà ce terrain,
      // et le typecheck fait foi. On évite le doublon de diagnostic.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['vite.config.ts', 'eslint.config.js', 'scripts/**/*.{mjs,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Ce script pilote un navigateur : le code passé à `page.evaluate()` s'exécute
    // dans la page, pas dans Node. Les deux jeux de globals sont donc légitimes.
    files: ['scripts/verifie-rendu.mjs', 'scripts/verifie-auth-differee.mjs', 'scripts/parcours-complet.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  }
);
