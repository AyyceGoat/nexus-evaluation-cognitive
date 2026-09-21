import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IQReport, ItemResponse, ValidityVerdict } from '../iq/types';
import {
  echec,
  succes,
  type BackendPort,
  type PassationResume,
  type RapportStocke,
  type Utilisateur,
} from './types';

/**
 * Implémentation Supabase.
 *
 * Écrite en entier mais JAMAIS EXÉCUTÉE : aucun projet Supabase n'existait au moment
 * de l'écriture (ni CLI ni Docker sur la machine). Le schéma qu'elle attend est dans
 * `supabase/migrations/`. La marche à suivre pour la mettre en service est dans
 * `docs/RETOUR.md`.
 *
 * Ce qui reste vrai quel que soit l'état de configuration :
 * - seule la clé « anon » est utilisée côté navigateur ; la clé de service ne doit
 *   jamais figurer dans le bundle ;
 * - le score n'est pas écrit par le client : `cloturerPassation` appelle une fonction
 *   serveur qui recalcule à partir du journal des réponses.
 */

export function creerClientSupabase(url: string, cleAnon: string): SupabaseClient {
  return createClient(url, cleAnon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/** Traduit les erreurs Supabase en messages qui disent quoi faire. */
function message(erreur: { message?: string; code?: string } | null): string {
  const brut = (erreur?.message ?? '').toLowerCase();

  if (brut.includes('invalid login credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect. Vérifiez les deux, puis réessayez.';
  }
  if (brut.includes('user already registered') || erreur?.code === '23505') {
    return 'Un compte existe déjà avec cette adresse. Connectez-vous plutôt.';
  }
  if (brut.includes('email not confirmed')) {
    return 'Confirmez votre adresse e-mail : le lien vous a été envoyé à l’inscription.';
  }
  if (brut.includes('password should be at least')) {
    return 'Le mot de passe doit compter au moins 8 caractères.';
  }
  if (brut.includes('rate limit') || brut.includes('too many requests')) {
    return 'Trop de tentatives. Patientez une minute avant de réessayer.';
  }
  if (brut.includes('failed to fetch') || brut.includes('network')) {
    return 'La connexion au serveur a échoué. Vérifiez votre réseau, puis réessayez.';
  }
  return 'Le serveur a refusé la demande. Réessayez ; si cela persiste, signalez-le.';
}

interface LigneProfil {
  id: string;
  display_name: string | null;
  legal_name: string | null;
  onboarded_at: string | null;
}

interface LignePassation {
  id: string;
  started_at: string;
  finished_at: string | null;
  item_count: number;
  correct_count: number;
  scaled_point: number | null;
  scaled_lower95: number | null;
  scaled_upper95: number | null;
  percentile: number | null;
  verdict: ValidityVerdict | null;
}

export function creerBackendSupabase(client: SupabaseClient): BackendPort {
  const versUtilisateur = (u: { id: string; email?: string } | null): Utilisateur | null =>
    u ? { id: u.id, email: u.email ?? '' } : null;

  async function idUtilisateur(): Promise<string | null> {
    const { data } = await client.auth.getUser();
    return data.user?.id ?? null;
  }

  return {
    mode: 'supabase',

    async utilisateurCourant() {
      const { data } = await client.auth.getUser();
      return versUtilisateur(data.user);
    },

    surChangementAuth(rappel) {
      const { data } = client.auth.onAuthStateChange((_evenement, session) => {
        rappel(versUtilisateur(session?.user ?? null));
      });
      return () => data.subscription.unsubscribe();
    },

    async inscrire(email, motDePasse, nomAffiche) {
      const { error } = await client.auth.signUp({
        email: email.trim(),
        password: motDePasse,
        options: { data: { display_name: nomAffiche.trim() } },
      });
      return error ? echec(message(error)) : succes(undefined);
    },

    async connecter(email, motDePasse) {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: motDePasse,
      });
      return error ? echec(message(error)) : succes(undefined);
    },

    async deconnecter() {
      await client.auth.signOut();
    },

    async demanderReinitialisation(email) {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/mot-de-passe/nouveau`,
      });
      return error ? echec(message(error)) : succes(undefined);
    },

    async lireProfil() {
      const uid = await idUtilisateur();
      if (!uid) return null;

      const { data, error } = await client
        .from('profiles')
        .select('id, display_name, legal_name, onboarded_at')
        .eq('id', uid)
        .maybeSingle<LigneProfil>();

      if (error || !data) return null;
      return {
        id: data.id,
        nomAffiche: data.display_name,
        nomLegal: data.legal_name,
        onboardeLe: data.onboarded_at,
      };
    },

    async majProfil(patch) {
      const uid = await idUtilisateur();
      if (!uid) return echec('Connectez-vous pour modifier votre profil.');

      const { error } = await client
        .from('profiles')
        .update({
          ...(patch.nomAffiche !== undefined ? { display_name: patch.nomAffiche } : {}),
          ...(patch.nomLegal !== undefined ? { legal_name: patch.nomLegal } : {}),
        })
        .eq('id', uid);

      return error ? echec(message(error)) : succes(undefined);
    },

    async marquerOnboarde() {
      const uid = await idUtilisateur();
      if (!uid) return echec('Connectez-vous pour continuer.');

      const { error } = await client
        .from('profiles')
        .update({ onboarded_at: new Date().toISOString() })
        .eq('id', uid);

      return error ? echec(message(error)) : succes(undefined);
    },

    async listerPassations(): Promise<PassationResume[]> {
      const { data, error } = await client
        .from('v_mes_passations')
        .select('*')
        .order('started_at', { ascending: false })
        .returns<LignePassation[]>();

      if (error || !data) return [];
      return data.map((l) => ({
        id: l.id,
        commenceeLe: l.started_at,
        termineeLe: l.finished_at,
        nombreItems: l.item_count,
        nombreReussites: l.correct_count,
        indice: l.scaled_point,
        borneBasse: l.scaled_lower95,
        borneHaute: l.scaled_upper95,
        centile: l.percentile,
        verdict: l.verdict,
      }));
    },

    async ouvrirPassation(itemIds) {
      const uid = await idUtilisateur();
      if (!uid) return echec('Connectez-vous pour commencer une évaluation.');

      const { data, error } = await client
        .from('iq_sessions')
        .insert({ user_id: uid, item_count: itemIds.length })
        .select('id')
        .single<{ id: string }>();

      if (error || !data) return echec(message(error));
      return succes(data.id);
    },

    async enregistrerReponse(passationId, reponse: ItemResponse) {
      const uid = await idUtilisateur();
      if (!uid) return echec('Votre session a expiré. Reconnectez-vous.');

      // `upsert` sur (session_id, item_id) : revenir sur une question remplace la
      // réponse au lieu d'en ajouter une seconde.
      const { error } = await client.from('iq_responses').upsert(
        {
          session_id: passationId,
          user_id: uid,
          item_id: reponse.itemId,
          selected_index: reponse.selectedIndex,
          correct: reponse.correct,
          response_seconds: reponse.responseSeconds,
        },
        { onConflict: 'session_id,item_id' }
      );

      return error ? echec(message(error)) : succes(undefined);
    },

    async cloturerPassation(passationId, _rapportClient: IQReport) {
      // Le rapport calculé dans le navigateur n'est pas transmis comme résultat : la
      // fonction serveur recalcule à partir du journal des réponses, avec les
      // paramètres d'items calibrés que le client ne possède pas.
      void _rapportClient;

      const { data, error } = await client.functions.invoke<{ rapport: IQReport }>(
        'cloturer-passation',
        { body: { session_id: passationId } }
      );

      if (error || !data?.rapport) {
        return echec(
          'Le calcul du résultat a échoué côté serveur. Vos réponses sont enregistrées : rouvrez la page pour réessayer.'
        );
      }
      return succes(data.rapport);
    },

    async lireRapport(passationId): Promise<RapportStocke | null> {
      const { data, error } = await client.functions.invoke<RapportStocke>('lire-rapport', {
        body: { session_id: passationId },
      });
      if (error || !data) return null;
      return data;
    },

    async itemsRecemmentVus(nombrePassations) {
      const { data } = await client
        .from('iq_sessions')
        .select('id')
        .order('started_at', { ascending: false })
        .limit(nombrePassations)
        .returns<{ id: string }[]>();

      if (!data?.length) return [];

      const { data: reponses } = await client
        .from('iq_responses')
        .select('item_id')
        .in(
          'session_id',
          data.map((s) => s.id)
        )
        .returns<{ item_id: string }[]>();

      return reponses?.map((r) => r.item_id) ?? [];
    },
  };
}
