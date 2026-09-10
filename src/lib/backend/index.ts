import { backendLocal } from './local';
import type { BackendPort, ModeBackend } from './types';

/**
 * Choisit l'implémentation à partir de la configuration.
 *
 * Une seule règle : si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont présentes,
 * on parle au vrai backend. Sinon on retombe sur l'adaptateur local de développement,
 * et l'interface affiche un bandeau permanent qui le dit.
 *
 * Il n'y a volontairement pas de troisième cas : pas de « demi-configuration » qui
 * marcherait à moitié sans qu'on sache laquelle des deux moitiés répond.
 *
 * ── Pourquoi une façade et pas un simple `const` ──
 *
 * `@supabase/supabase-js` pèse une cinquantaine de kilo-octets compressés, Realtime
 * compris alors qu'on ne s'en sert pas. Importée statiquement, la bibliothèque
 * atterrissait dans le chunk d'entrée et faisait passer celui-ci de 66 à 150 ko gzip —
 * payé par tout visiteur de la landing, qui n'a besoin d'aucun backend pour la lire.
 *
 * La façade ci-dessous expose l'interface de façon synchrone tout en chargeant
 * l'implémentation au premier appel réel. En mode local, la bibliothèque n'est jamais
 * téléchargée du tout.
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const cleAnon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const configure = Boolean(url && cleAnon);

export const modeBackend: ModeBackend = configure ? 'supabase' : 'local';
export const modeDeveloppementLocal = modeBackend === 'local';

let cache: BackendPort | null = null;
let enCours: Promise<BackendPort> | null = null;

export function obtenirBackend(): Promise<BackendPort> {
  if (cache) return Promise.resolve(cache);
  if (enCours) return enCours;

  enCours = (async () => {
    if (!configure) {
      cache = backendLocal;
      return cache;
    }
    const { creerBackendSupabase, creerClientSupabase } = await import('./supabase');
    cache = creerBackendSupabase(creerClientSupabase(url as string, cleAnon as string));
    return cache;
  })();

  return enCours;
}

/** Toutes les méthodes du port sont asynchrones : la façade se contente de déléguer. */
const delegue =
  <A extends unknown[], R>(prendre: (port: BackendPort) => (...args: A) => Promise<R>) =>
  async (...args: A): Promise<R> =>
    prendre(await obtenirBackend())(...args);

export const backend: BackendPort = {
  mode: modeBackend,

  utilisateurCourant: delegue((p) => p.utilisateurCourant),
  inscrire: delegue((p) => p.inscrire),
  connecter: delegue((p) => p.connecter),
  deconnecter: delegue((p) => p.deconnecter),
  demanderReinitialisation: delegue((p) => p.demanderReinitialisation),
  lireProfil: delegue((p) => p.lireProfil),
  majProfil: delegue((p) => p.majProfil),
  marquerOnboarde: delegue((p) => p.marquerOnboarde),
  listerPassations: delegue((p) => p.listerPassations),
  ouvrirPassation: delegue((p) => p.ouvrirPassation),
  enregistrerReponse: delegue((p) => p.enregistrerReponse),
  cloturerPassation: delegue((p) => p.cloturerPassation),
  lireRapport: delegue((p) => p.lireRapport),
  itemsRecemmentVus: delegue((p) => p.itemsRecemmentVus),
  rapportDebloque: delegue((p) => p.rapportDebloque),
  listerTransactions: delegue((p) => p.listerTransactions),

  /**
   * Seule méthode synchrone du port : elle rend immédiatement une fonction de
   * désabonnement, alors que l'implémentation n'est peut-être pas encore chargée.
   * On s'abonne dès qu'elle l'est, et un désabonnement demandé entre-temps est
   * honoré à l'arrivée.
   */
  surChangementAuth(rappel) {
    let annule = false;
    let desabonner: (() => void) | null = null;

    void obtenirBackend().then((port) => {
      if (annule) return;
      desabonner = port.surChangementAuth(rappel);
    });

    return () => {
      annule = true;
      desabonner?.();
    };
  },
};

export type { BackendPort } from './types';
export * from './types';
