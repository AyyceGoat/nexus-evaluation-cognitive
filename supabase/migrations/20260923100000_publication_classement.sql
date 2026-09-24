-- ═══════════════════════════════════════════════════════════════════════════
-- Publication au classement : rendre les refus explicites
--
-- Défaut constaté en exploitation : quelqu'un active sa visibilité, l'écran
-- répond « vous figurez au classement », et aucune ligne n'apparaît.
--
-- Cause : la fonction posait `classement_visible = true` puis exécutait un
-- `insert … select` sur la passation la plus récente exploitable. Quand il n'y
-- en a aucune, ce select rend zéro ligne. L'insert n'insère rien, aucune erreur
-- n'est levée, la fonction rend `void`, et le client conclut au succès. Le
-- consentement était enregistré, la publication non — deux états incohérents.
--
-- Deux corrections :
--
--   1. la condition d'éligibilité est VÉRIFIÉE AVANT toute écriture. Si aucune
--      passation ne la satisfait, la fonction lève une exception : l'appel est
--      annulé en entier, donc `classement_visible` reste à sa valeur d'avant.
--      L'écran reçoit une phrase qui dit quoi faire.
--
--   2. après l'insert, on vérifie qu'une ligne existe réellement. C'est une
--      ceinture en plus de la bretelle : si l'éligibilité et l'insert venaient à
--      divergeaient lors d'une évolution future, on veut une erreur, pas un succès muet.
--
-- La condition d'éligibilité est écrite une seule fois, dans une fonction
-- dédiée, pour que les deux usages ne puissent pas se désaccorder.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Éligibilité ───────────────────────────────────────────────────────────
-- Miroir exact du filtre de publication. `stable` : lecture seule.
-- En SECURITY INVOKER (défaut) : la politique de lecture de `iq_sessions`
-- restreint déjà à son propriétaire, donc rien n'est contourné ici.

create or replace function public.a_une_passation_publiable()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.iq_sessions s
    where s.user_id = (select auth.uid())
      and s.finished_at is not null
      and s.verdict is distinct from 'not_interpretable'
      and s.scaled_point is not null
      and s.niveau is not null
  );
$$;

comment on function public.a_une_passation_publiable() is
  'Vrai si l''appelant possède au moins une passation close, interprétable et scorée — donc publiable au classement.';

grant execute on function public.a_une_passation_publiable() to authenticated;


-- ── Visibilité ────────────────────────────────────────────────────────────

create or replace function public.definir_visibilite_classement(
  p_visible boolean,
  p_pseudonyme text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_confirme timestamptz;
  v_pseudo text;
  v_publiees integer;
begin
  if v_uid is null then
    raise exception 'Connectez-vous pour modifier votre visibilité.';
  end if;

  select email_confirmed_at into v_confirme from auth.users where id = v_uid;
  if v_confirme is null then
    raise exception 'Confirmez votre adresse e-mail avant de figurer au classement.';
  end if;

  if p_pseudonyme is not null then
    update public.profiles set pseudonyme = p_pseudonyme where id = v_uid;
  end if;

  select pseudonyme into v_pseudo from public.profiles where id = v_uid;

  if p_visible and (v_pseudo is null or v_pseudo = '') then
    raise exception 'Choisissez un pseudonyme avant de figurer au classement.';
  end if;

  -- ── Le refus, AVANT d'enregistrer le consentement ──────────────────────
  -- Cette fonction est en SECURITY DEFINER, donc `auth.uid()` de
  -- `a_une_passation_publiable()` désigne toujours l'appelant : c'est bien sa
  -- propre éligibilité qu'on teste.
  if p_visible and not public.a_une_passation_publiable() then
    raise exception 'Passez d''abord l''évaluation : aucune passation exploitable n''est rattachée à ce compte.';
  end if;

  update public.profiles set classement_visible = p_visible where id = v_uid;

  if not p_visible then
    delete from public.classement where user_id = v_uid;
    return;
  end if;

  insert into public.classement (
    user_id, session_id, pseudonyme, niveau, score,
    borne_basse, borne_haute, centile, aptitudes, passee_le
  )
  select
    s.user_id, s.id, v_pseudo, s.niveau, s.scaled_point,
    s.scaled_lower95, s.scaled_upper95, s.percentile,
    coalesce(s.aptitudes, '[]'::jsonb), s.finished_at
  from public.iq_sessions s
  where s.user_id = v_uid
    and s.finished_at is not null
    and s.verdict is distinct from 'not_interpretable'
    and s.scaled_point is not null
    and s.niveau is not null
  order by s.finished_at desc
  limit 1
  on conflict (user_id) do update set
    session_id  = excluded.session_id,
    pseudonyme  = excluded.pseudonyme,
    niveau      = excluded.niveau,
    score       = excluded.score,
    borne_basse = excluded.borne_basse,
    borne_haute = excluded.borne_haute,
    centile     = excluded.centile,
    aptitudes   = excluded.aptitudes,
    passee_le   = excluded.passee_le,
    publie_le   = now();

  -- Ceinture : un succès sans ligne publiée est un bogue, pas un succès.
  get diagnostics v_publiees = row_count;
  if v_publiees = 0 then
    raise exception 'La publication a échoué : aucune ligne écrite au classement.';
  end if;
end;
$$;

comment on function public.definir_visibilite_classement(boolean, text) is
  'Consentement au classement. Refuse explicitement, et sans rien enregistrer, si l''adresse n''est pas confirmée, si le pseudonyme manque, ou si aucune passation n''est publiable.';
