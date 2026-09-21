import type { BackendPort } from './types';

/**
 * Accès au backend.
 *
 * ── Une seule implémentation, volontairement ──
 *
 * Il n'existe plus d'adaptateur local. L'ancien acceptait n'importe quel mot de
 * passe et gardait tout dans le navigateur ; un bandeau l'annonçait, mais une fausse
 * authentification qui ressemble à une vraie n'a rien à faire dans un produit qu'on
 * met en ligne. Sans configuration Supabase, l'application ne propose donc PAS un
 * mode dégradé : elle affiche un écran de configuration et refuse de faire semblant.
 *
 * ── Pourquoi une façade et pas un simple `const` ──
 *
 * `@supabase/supabase-js` pèse une soixantaine de kilo-octets compressés, Realtime
 * compris alors qu'on ne s'en sert pas. Importée statiquement, la bibliothèque
 * atterrissait dans le chunk d'entrée et le faisait passer de 66 à 150 ko gzip —
 * payé par tout visiteur de la landing, qui n'a besoin d'aucun backend pour la lire.
 *
 * La façade expose l'interface de façon synchrone tout en chargeant l'implémentation
 * au premier appel réel.
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const cleAnon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** Vrai quand `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` manque. */
export const configurationManquante = !(url && cleAnon);

const MESSAGE_CONFIGURATION =
  'Le serveur n’est pas configuré : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.';

let cache: BackendPort | null = null;
let enCours: Promise<BackendPort> | null = null;

export function obtenirBackend(): Promise<BackendPort> {
  if (cache) return Promise.resolve(cache);
  if (enCours) return enCours;

  enCours = (async () => {
    if (configurationManquante) throw new Error(MESSAGE_CONFIGURATION);
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
  utilisateurCourant: delegue((p) => p.utilisateurCourant),
  inscrire: delegue((p) => p.inscrire),
  connecter: delegue((p) => p.connecter),
  deconnecter: delegue((p) => p.deconnecter),
  demanderReinitialisation: delegue((p) => p.demanderReinitialisation),
  changerMotDePasse: delegue((p) => p.changerMotDePasse),
  renvoyerConfirmation: delegue((p) => p.renvoyerConfirmation),
  lireProfil: delegue((p) => p.lireProfil),
  majProfil: delegue((p) => p.majProfil),
  marquerOnboarde: delegue((p) => p.marquerOnboarde),
  definirPseudonyme: delegue((p) => p.definirPseudonyme),
  definirVisibiliteClassement: delegue((p) => p.definirVisibiliteClassement),
  lireClassement: delegue((p) => p.lireClassement),
  listerPassations: delegue((p) => p.listerPassations),
  ouvrirPassation: delegue((p) => p.ouvrirPassation),
  enregistrerReponse: delegue((p) => p.enregistrerReponse),
  cloturerPassation: delegue((p) => p.cloturerPassation),
  lireRapport: delegue((p) => p.lireRapport),
  itemsRecemmentVus: delegue((p) => p.itemsRecemmentVus),

  /**
   * Seule méthode synchrone du port : elle rend immédiatement une fonction de
   * désabonnement, alors que l'implémentation n'est peut-être pas encore chargée.
   * On s'abonne dès qu'elle l'est, et un désabonnement demandé entre-temps est
   * honoré à l'arrivée.
   */
  surChangementAuth(rappel) {
    let annule = false;
    let desabonner: (() => void) | null = null;

    void obtenirBackend()
      .then((port) => {
        if (annule) return;
        desabonner = port.surChangementAuth(rappel);
      })
      .catch(() => {
        // Sans configuration, il n'y a pas de session à observer : on annonce
        // « personne n'est connecté » plutôt que de laisser l'écran en attente.
        if (!annule) rappel(null);
      });

    return () => {
      annule = true;
      desabonner?.();
    };
  },
};

export type { BackendPort } from './types';
export * from './types';
