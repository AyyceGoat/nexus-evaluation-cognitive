import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IQReport, ItemResponse, ValidityVerdict } from '../iq/types';
import { assemblerRapport, type AptitudeServeur, type ResultatServeur } from './rapport';
import {
  echec,
  succes,
  type BackendPort,
  type CorrectionServeur,
  type EntreeClassement,
  type Niveau,
  type PassationOuverte,
  type PassationResume,
  type QuestionServeur,
  type RapportStocke,
  type Resultat,
  type Utilisateur,
} from './types';

/**
 * Implémentation Supabase. Seule implémentation du port.
 *
 * Ce qui tient, quelle que soit l'évolution du reste :
 *
 * - seule la clé « anon » est utilisée côté navigateur ; la clé de service ne figure
 *   jamais dans le bundle, et les politiques RLS sont ce qui protège les données ;
 * - le score n'est pas écrit par le client : `cloturerPassation` appelle une fonction
 *   serveur qui recalcule tout depuis le journal des réponses et le corrigé ;
 * - le pseudonyme et le consentement au classement passent par des fonctions serveur,
 *   parce que les privilèges de colonne interdisent de les modifier autrement.
 */

export function creerClientSupabase(url: string, cleAnon: string): SupabaseClient {
  return createClient(url, cleAnon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Nécessaire pour les liens de confirmation d'adresse et de réinitialisation :
      // le jeton arrive dans l'URL, et la session doit s'établir à l'arrivée.
      detectSessionInUrl: true,
    },
  });
}

/** Traduit les erreurs du serveur en messages qui disent quoi faire. */
function message(erreur: { message?: string; code?: string } | null): string {
  const brut = (erreur?.message ?? '').toLowerCase();

  if (brut.includes('invalid login credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect. Vérifiez les deux, puis réessayez.';
  }
  if (brut.includes('user already registered') || erreur?.code === '23505') {
    return 'Un compte existe déjà avec cette adresse. Connectez-vous plutôt.';
  }
  if (brut.includes('email not confirmed')) {
    return 'Confirmez votre adresse e-mail : ouvrez le lien reçu à l’inscription. Vous pouvez le faire renvoyer ci-dessous.';
  }
  if (brut.includes('password should be at least')) {
    return 'Le mot de passe doit compter au moins 8 caractères.';
  }
  if (brut.includes('new password should be different')) {
    return 'Choisissez un mot de passe différent de l’ancien.';
  }
  if (brut.includes('rate limit') || brut.includes('too many requests')) {
    return 'Trop de tentatives. Patientez une minute avant de réessayer.';
  }
  if (brut.includes('auth session missing') || brut.includes('session_not_found')) {
    return 'Le lien a expiré. Demandez-en un nouveau.';
  }
  // Messages remontés par nos propres fonctions serveur : ils sont déjà rédigés pour
  // l'écran, on les laisse passer tels quels.
  if (brut.includes('confirmez votre adresse') || brut.includes('pseudonyme')) {
    return erreur?.message ?? '';
  }
  if (brut.includes('profiles_pseudonyme_unique') || brut.includes('duplicate key')) {
    return 'Ce pseudonyme est déjà pris. Choisissez-en un autre.';
  }
  if (brut.includes('pseudonyme_forme') || brut.includes('violates check constraint')) {
    return 'Le pseudonyme accepte 3 à 24 lettres, chiffres, tirets ou tirets bas.';
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
  pseudonyme: string | null;
  classement_visible: boolean;
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
  niveau: Niveau | null;
}

interface LigneQuestion {
  id: string;
  aptitude: QuestionServeur['aptitude'];
  prompt: string;
  options: string[] | null;
  visual: QuestionServeur['visual'];
  expected_seconds: number;
  ordre: number;
}

interface LigneCorrection {
  item_id: string;
  correct_index: number;
  explanation: string;
  reasoning: string[] | null;
}

const versQuestion = (l: LigneQuestion): QuestionServeur => ({
  id: l.id,
  aptitude: l.aptitude,
  prompt: l.prompt,
  options: l.options,
  visual: l.visual,
  expectedSeconds: l.expected_seconds,
});

const versCorrection = (l: LigneCorrection): CorrectionServeur => ({
  itemId: l.item_id,
  correctIndex: l.correct_index,
  explanation: l.explanation,
  reasoning: l.reasoning ?? [],
});

interface LigneClassement {
  rang: number;
  pseudonyme: string;
  niveau: Niveau;
  score: number;
  borne_basse: number;
  borne_haute: number;
  centile: number | null;
  aptitudes: AptitudeServeur[] | null;
  passee_le: string;
}

/** Ligne complète d'une passation, telle que la fonction serveur l'écrit. */
interface LigneResultat extends LignePassation {
  theta: number | null;
  standard_error: number | null;
  validity_message: string | null;
  aberrant_count: number | null;
  above_chance_p: number | null;
  expected_by_chance: number | null;
  aptitudes: AptitudeServeur[] | null;
}

const CHAMPS_RESULTAT =
  'id, started_at, finished_at, item_count, correct_count, theta, standard_error, ' +
  'scaled_point, scaled_lower95, scaled_upper95, percentile, verdict, niveau, ' +
  'aptitudes, validity_message, aberrant_count, above_chance_p, expected_by_chance';

function versResultatServeur(ligne: LigneResultat): ResultatServeur {
  return {
    sessionId: ligne.id,
    startedAt: ligne.started_at,
    finishedAt: ligne.finished_at,
    itemCount: ligne.item_count,
    correctCount: ligne.correct_count,
    theta: ligne.theta,
    standardError: ligne.standard_error,
    scaledPoint: ligne.scaled_point,
    scaledLower95: ligne.scaled_lower95,
    scaledUpper95: ligne.scaled_upper95,
    percentile: ligne.percentile,
    verdict: ligne.verdict,
    validityMessage: ligne.validity_message,
    aberrantCount: ligne.aberrant_count,
    aboveChanceP: ligne.above_chance_p,
    expectedByChance: ligne.expected_by_chance,
    aptitudes: ligne.aptitudes,
  };
}

export function creerBackendSupabase(client: SupabaseClient): BackendPort {
  const versUtilisateur = (
    u: { id: string; email?: string; email_confirmed_at?: string | null } | null
  ): Utilisateur | null =>
    u
      ? {
          id: u.id,
          email: u.email ?? '',
          emailConfirme: Boolean(u.email_confirmed_at),
        }
      : null;

  async function idUtilisateur(): Promise<string | null> {
    const { data } = await client.auth.getUser();
    return data.user?.id ?? null;
  }

  /**
   * Le corrigé d'une passation close.
   *
   * Fonction locale, et non méthode : la façade extrait les méthodes du port puis
   * les appelle sans les lier, donc `this` y vaut `undefined`. Un `this.lireCorrige`
   * levait une exception et laissait la page de rapport vide.
   */
  async function lireCorrigeInterne(passationId: string): Promise<CorrectionServeur[]> {
    const { data, error } = await client.rpc('corrige_de_passation', {
      p_session_id: passationId,
    });
    if (error || !data) return [];
    return (data as LigneCorrection[]).map(versCorrection);
  }

  /** Nom porté par l'attestation, si l'utilisateur en a renseigné un. */
  async function nomLegal(): Promise<string | null> {
    const uid = await idUtilisateur();
    if (!uid) return null;
    const { data } = await client
      .from('profiles')
      .select('legal_name')
      .eq('id', uid)
      .maybeSingle<{ legal_name: string | null }>();
    return data?.legal_name ?? null;
  }

  return {
    // ── Authentification ──────────────────────────────────────────────────

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
        options: {
          data: { display_name: nomAffiche.trim() },
          // Le lien de confirmation ramène sur le site, où la session s'établit.
          emailRedirectTo: `${window.location.origin}/connexion`,
        },
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

    async connecterAnonyme() {
      // Aucune adresse, aucun mot de passe : c'est ce qui préserve la passation
      // « sans compte ». La session n'en est pas moins réelle, donc les politiques
      // RLS s'appliquent et le corrigé reste hors de portée.
      const { error } = await client.auth.signInAnonymously();
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

    async changerMotDePasse(nouveau) {
      const { error } = await client.auth.updateUser({ password: nouveau });
      return error ? echec(message(error)) : succes(undefined);
    },

    async renvoyerConfirmation(email) {
      const { error } = await client.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/connexion` },
      });
      return error ? echec(message(error)) : succes(undefined);
    },

    // ── Profil ────────────────────────────────────────────────────────────

    async lireProfil() {
      const uid = await idUtilisateur();
      if (!uid) return null;

      const { data, error } = await client
        .from('profiles')
        .select('id, display_name, legal_name, pseudonyme, classement_visible, onboarded_at')
        .eq('id', uid)
        .maybeSingle<LigneProfil>();

      if (error || !data) return null;
      return {
        id: data.id,
        nomAffiche: data.display_name,
        nomLegal: data.legal_name,
        pseudonyme: data.pseudonyme,
        classementVisible: data.classement_visible,
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

    // ── Classement public ─────────────────────────────────────────────────

    async definirPseudonyme(pseudonyme) {
      const { error } = await client.rpc('definir_pseudonyme', {
        p_pseudonyme: pseudonyme.trim(),
      });
      return error ? echec(message(error)) : succes(undefined);
    },

    async definirVisibiliteClassement(visible, pseudonyme) {
      const { error } = await client.rpc('definir_visibilite_classement', {
        p_visible: visible,
        p_pseudonyme: pseudonyme?.trim() ?? null,
      });
      return error ? echec(message(error)) : succes(undefined);
    },

    async lireClassement(limite = 100): Promise<EntreeClassement[]> {
      const { data, error } = await client
        .from('v_classement')
        .select('rang, pseudonyme, niveau, score, borne_basse, borne_haute, centile, aptitudes, passee_le')
        .order('score', { ascending: false })
        .limit(limite)
        .returns<LigneClassement[]>();

      if (error || !data) return [];
      return data.map((l) => ({
        rang: l.rang,
        pseudonyme: l.pseudonyme,
        niveau: l.niveau,
        score: l.score,
        borneBasse: l.borne_basse,
        borneHaute: l.borne_haute,
        centile: l.centile,
        aptitudes: (l.aptitudes ?? []).map((a) => ({
          aptitude: a.aptitude,
          scaledPoint: a.scaledPoint,
          radarValue: a.radarValue,
          itemCount: a.itemCount,
          correctCount: a.correctCount,
        })),
        passeeLe: l.passee_le,
      }));
    },

    // ── Passations ────────────────────────────────────────────────────────

    async listerPassations() {
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
        niveau: l.niveau,
      })) satisfies PassationResume[];
    },

    async ouvrirPassation(longueur): Promise<Resultat<PassationOuverte>> {
      // Deux appels serveur, et aucun choix laissé au client : il demande une
      // longueur, le serveur compose la passation puis sert les énoncés. Aucune
      // politique d'INSERT n'existe sur `iq_sessions`, donc cette voie est la seule.
      const { data: passationId, error } = await client.rpc('ouvrir_passation', {
        p_longueur: longueur,
      });
      if (error || typeof passationId !== 'string') return echec(message(error));

      // `rpc` type son retour comme une valeur unique : une fonction qui rend
      // plusieurs lignes demande une conversion explicite.
      const { data: brutes, error: erreurQuestions } = await client.rpc('items_de_passation', {
        p_session_id: passationId,
      });
      const lignes = (brutes ?? []) as LigneQuestion[];

      if (erreurQuestions || lignes.length === 0) {
        return echec(
          'Les questions n’ont pas pu être chargées. Vérifiez votre connexion, puis réessayez.'
        );
      }

      return succes({ passationId, questions: lignes.map(versQuestion) });
    },

    async lireCorrige(passationId): Promise<CorrectionServeur[]> {
      // Refusé par le serveur tant que la passation n'est pas close : il ne suffit
      // donc pas d'ouvrir une passation pour en obtenir les réponses.
      return lireCorrigeInterne(passationId);
    },

    async enregistrerReponses(passationId, reponses) {
      const uid = await idUtilisateur();
      if (!uid) return echec('Votre session a expiré. Reconnectez-vous.');
      if (reponses.length === 0) return succes(undefined);

      // `correct` n'est PAS transmis : un déclencheur le calcule depuis le corrigé
      // serveur. Le privilège d'écriture sur cette colonne est d'ailleurs retiré.
      // Insertion simple, et non `upsert` : le journal est en ajout seul.
      const { error } = await client.from('iq_responses').insert(
        reponses.map((reponse) => ({
          session_id: passationId,
          user_id: uid,
          item_id: reponse.itemId,
          selected_index: reponse.selectedIndex,
          response_seconds: reponse.responseSeconds,
        }))
      );

      return error ? echec(message(error)) : succes(undefined);
    },

    async cloturerPassation(passationId) {
      const { data, error } = await client.functions.invoke<{
        resultat: LigneResultat | null;
      }>('cloturer-passation', { body: { sessionId: passationId } });

      if (error || !data?.resultat) {
        return echec(
          'Le calcul du résultat a échoué côté serveur. Vos réponses sont enregistrées : rouvrez la page pour réessayer.'
        );
      }

      // Les réponses sont relues depuis la base : leur champ `correct` vient du
      // corrigé serveur, pas du navigateur.
      const { data: lignes } = await client
        .from('iq_responses')
        .select('item_id, selected_index, correct, response_seconds')
        .eq('session_id', passationId)
        .returns<
          Array<{
            item_id: string;
            selected_index: number;
            correct: boolean;
            response_seconds: number;
          }>
        >();

      const reponses: ItemResponse[] = (lignes ?? []).map((l) => ({
        itemId: l.item_id,
        selectedIndex: l.selected_index,
        correct: l.correct,
        responseSeconds: Number(l.response_seconds),
      }));

      const rapport = assemblerRapport(
        // La fonction serveur rend déjà les champs en camelCase.
        data.resultat as unknown as ResultatServeur,
        reponses,
        await nomLegal()
      );
      return succes(rapport satisfies IQReport);
    },

    async lireRapport(passationId): Promise<RapportStocke | null> {
      // Lecture directe des tables : les politiques RLS restreignent déjà chacune
      // aux lignes de leur propriétaire, donc aucune fonction serveur n'est
      // nécessaire pour relire son propre rapport.
      const { data: passation, error } = await client
        .from('iq_sessions')
        .select(CHAMPS_RESULTAT)
        .eq('id', passationId)
        .maybeSingle<LigneResultat>();

      if (error || !passation || !passation.finished_at) return null;

      const { data: lignes } = await client
        .from('iq_responses')
        .select('item_id, selected_index, correct, response_seconds')
        .eq('session_id', passationId)
        .order('answered_at', { ascending: true })
        .returns<
          Array<{
            item_id: string;
            selected_index: number;
            correct: boolean;
            response_seconds: number;
          }>
        >();

      const reponses: ItemResponse[] = (lignes ?? []).map((l) => ({
        itemId: l.item_id,
        selectedIndex: l.selected_index,
        correct: l.correct,
        responseSeconds: Number(l.response_seconds),
      }));

      // Questions et corrigé viennent du serveur : le navigateur ne détient plus
      // ni les énoncés ni les bonnes réponses.
      const [{ data: lignesQuestions }, corrections] = await Promise.all([
        client.rpc('items_de_passation', { p_session_id: passationId }),
        lireCorrigeInterne(passationId),
      ]);

      return {
        rapport: assemblerRapport(versResultatServeur(passation), reponses, await nomLegal()),
        questions: ((lignesQuestions ?? []) as LigneQuestion[]).map(versQuestion),
        corrections,
      };
    },
  };
}
