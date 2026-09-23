-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — alertes de l'Advisor Supabase, traitées une par une
--
-- Cinq points, du plus grave au plus bénin.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CRITIQUE — `v_classement` en SECURITY DEFINER
--
-- Pourquoi elle l'était : la table `classement` n'avait AUCUNE politique de
-- lecture, pour que personne ne puisse lire `user_id` — le lien entre une ligne
-- publique et un compte. La vue devait donc s'exécuter avec les droits de son
-- propriétaire pour voir quoi que ce soit.
--
-- Pourquoi c'est un vrai problème malgré tout : une vue en SECURITY DEFINER
-- contourne les politiques de l'appelant. Ici la requête est figée et ne prend
-- aucun paramètre, donc rien ne fuit — mais la garantie repose sur la relecture
-- du corps de la vue, pas sur le moteur. Toute évolution future de cette vue
-- deviendrait un contournement silencieux de RLS. L'alerte a raison.
--
-- Le correctif atteint le même but par les PRIVILÈGES DE COLONNE, que RLS ne
-- sait pas exprimer mais que PostgreSQL applique, lui, sans condition :
--
--   - la vue repasse en `security_invoker` : elle s'exécute comme l'appelant ;
--   - `classement` reçoit une politique de lecture publique ;
--   - mais le privilège SELECT est retiré sur la table entière et rendu
--     colonne par colonne, en excluant `user_id` et `session_id`.
--
-- Résultat : `select pseudonyme from classement` fonctionne et rend exactement
-- ce que la vue expose ; `select user_id from classement` est refusé par le
-- moteur. La garantie ne dépend plus de la forme de la vue.
-- ═══════════════════════════════════════════════════════════════════════════

alter view public.v_classement set (security_invoker = true);

comment on view public.v_classement is
  'Classement public. S''exécute avec les droits de l''appelant ; ce sont les privilèges de colonne sur public.classement qui gardent user_id et session_id privés.';

create policy "classement lisible par tout le monde"
  on public.classement for select using (true);

-- Aucune politique d'écriture : la table reste écrite par les seules fonctions
-- serveur et par la clé de service.

revoke select on public.classement from anon, authenticated;

grant select (pseudonyme, niveau, score, borne_basse, borne_haute, centile, aptitudes, passee_le, publie_le)
  on public.classement to anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. AVERTISSEMENT — `touch_updated_at()` sans `search_path` fixé
--
-- Une fonction dont le `search_path` reste mutable peut être détournée : il
-- suffit qu'un appelant place un schéma devant `public` pour que les noms non
-- qualifiés résolvent vers ses propres objets. Les autres fonctions du schéma
-- fixent déjà le leur ; celle-ci avait été oubliée.
--
-- `search_path = ''` plutôt que `public` : le corps n'utilise que `now()`, qui
-- vit dans `pg_catalog`, toujours résolu. Rien à qualifier, et aucune latitude
-- laissée à l'appelant.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PERFORMANCE — `auth.uid()` réévalué à chaque ligne
--
-- Écrit `auth.uid() = user_id`, l'appel est réévalué pour CHAQUE ligne
-- examinée. Écrit `(select auth.uid()) = user_id`, PostgreSQL le reconnaît
-- comme un sous-plan initialisé une fois. Sur le journal des réponses, qui
-- grandira à chaque passation, la différence n'est pas théorique.
--
-- Les conditions sont autrement inchangées, à la lettre.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "profil lisible par son proprietaire" on public.profiles;
create policy "profil lisible par son proprietaire"
  on public.profiles for select using ((select auth.uid()) = id);

drop policy if exists "profil modifiable par son proprietaire" on public.profiles;
create policy "profil modifiable par son proprietaire"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "passations lisibles par leur proprietaire" on public.iq_sessions;
create policy "passations lisibles par leur proprietaire"
  on public.iq_sessions for select using ((select auth.uid()) = user_id);

drop policy if exists "reponses lisibles par leur proprietaire" on public.iq_responses;
create policy "reponses lisibles par leur proprietaire"
  on public.iq_responses for select using ((select auth.uid()) = user_id);

drop policy if exists "reponses ajoutables sur sa passation ouverte" on public.iq_responses;
create policy "reponses ajoutables sur sa passation ouverte"
  on public.iq_responses for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.iq_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
        and s.finished_at is null
    )
    and exists (
      select 1 from public.iq_session_items si
      where si.session_id = iq_responses.session_id
        and si.item_id = iq_responses.item_id
    )
  );

drop policy if exists "items administres lisibles par le proprietaire de la passation" on public.iq_session_items;
create policy "items administres lisibles par le proprietaire de la passation"
  on public.iq_session_items for select
  using (
    exists (
      select 1 from public.iq_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. PERFORMANCE — clés étrangères sans index
--
-- Une clé étrangère sans index rend coûteuse toute suppression dans la table
-- référencée : PostgreSQL doit balayer la table référençante pour vérifier la
-- contrainte. Ici, supprimer un compte supprime ses réponses en cascade.
--
-- `iq_responses.session_id` est déjà couverte par la contrainte d'unicité
-- (session_id, item_id), et `iq_sessions.user_id` par l'index (user_id,
-- started_at). Restent ces deux-là.
-- ═══════════════════════════════════════════════════════════════════════════

create index if not exists iq_responses_user on public.iq_responses (user_id);
create index if not exists iq_session_items_item on public.iq_session_items (item_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. INFORMATION — `iq_items` : RLS activée, aucune politique
--
-- L'Advisor le signale, et c'est VOULU : cette table porte le corrigé. Aucune
-- politique signifie qu'aucun client ne lit la moindre ligne, ce qui est
-- exactement l'intention. Le commentaire est là pour qu'on ne « corrige » pas
-- l'alerte en ajoutant une politique de lecture.
-- ═══════════════════════════════════════════════════════════════════════════

comment on table public.iq_items is
  'Paramètres, contenu et corrigé de la banque d''items. RLS activée SANS AUCUNE POLITIQUE, délibérément : aucun client ne doit lire cette table. N''y ajoutez pas de politique de lecture — les énoncés sont servis par items_de_passation(), le corrigé par corrige_de_passation() sur une passation close.';
