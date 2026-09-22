import { echec, type BackendPort } from './types';

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

/**
 * Port utilisé quand la configuration manque.
 *
 * Il ne lève pas d'exception, et ce n'est pas de la complaisance : une façade qui
 * jette à chaque appel produisait une erreur non rattrapée sur les neuf pages du
 * site, y compris les pages publiques qui n'ont besoin d'aucun serveur. Constaté sur
 * un vrai navigateur, pas déduit.
 *
 * Les lectures rendent donc « rien », et les actions rendent un refus **affichable**,
 * porteur de la marche à suivre. Ce qui n'est pas simulé pour autant : `connecter`
 * refuse, il ne laisse pas entrer.
 */
const portNonConfigure: BackendPort = {
  async utilisateurCourant() {
    return null;
  },
  surChangementAuth(rappel) {
    // Personne n'est connecté, et personne ne le sera : on l'annonce une fois plutôt
    // que de laisser les écrans en attente indéfinie.
    rappel(null);
    return () => {};
  },
  async inscrire() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async connecter() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async deconnecter() {},
  async demanderReinitialisation() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async connecterAnonyme() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async changerMotDePasse() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async renvoyerConfirmation() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async lireProfil() {
    return null;
  },
  async majProfil() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async marquerOnboarde() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async definirPseudonyme() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async definirVisibiliteClassement() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async lireClassement() {
    return [];
  },
  async listerPassations() {
    return [];
  },
  async ouvrirPassation() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async enregistrerReponse() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async cloturerPassation() {
    return echec(MESSAGE_CONFIGURATION);
  },
  async lireRapport() {
    return null;
  },
  async lireCorrige() {
    return [];
  },
};

let cache: BackendPort | null = null;
let enCours: Promise<BackendPort> | null = null;

export function obtenirBackend(): Promise<BackendPort> {
  if (cache) return Promise.resolve(cache);
  if (enCours) return enCours;

  enCours = (async () => {
    if (configurationManquante) {
      cache = portNonConfigure;
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
  utilisateurCourant: delegue((p) => p.utilisateurCourant),
  inscrire: delegue((p) => p.inscrire),
  connecter: delegue((p) => p.connecter),
  deconnecter: delegue((p) => p.deconnecter),
  demanderReinitialisation: delegue((p) => p.demanderReinitialisation),
  connecterAnonyme: delegue((p) => p.connecterAnonyme),
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
  lireCorrige: delegue((p) => p.lireCorrige),

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
