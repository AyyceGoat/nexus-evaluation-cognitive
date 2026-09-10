/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL du projet Supabase. Absente => adaptateur local de développement. */
  readonly VITE_SUPABASE_URL?: string;
  /** Clé « anon » (publiable). La clé de service ne doit JAMAIS figurer ici. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
