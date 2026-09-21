-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — schéma complet
--
-- Principe directeur : l'autorisation vit dans la base, pas dans les écrans.
-- Une politique RLS ne peut pas être oubliée par un composant ; une vérification
-- écrite dans du code applicatif, si.
--
-- Conséquence assumée sur les écritures : le client N'A AUCUN DROIT d'écrire un
-- score. Il n'existe aucune politique d'INSERT ou d'UPDATE sur `iq_sessions` ni
-- sur `classement`. Ouvrir une passation, la clore et publier au classement
-- passent par des fonctions serveur. Un navigateur qui tenterait d'écrire
-- directement se voit refuser la ligne par PostgreSQL, pas par une condition dans
-- du JavaScript.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Niveau affiché au classement ───────────────────────────────────────────
-- Cinq bandes, volontairement larges. L'intervalle de confiance d'un indice
-- tourne autour de ±13 points : des bandes plus fines afficheraient une
-- précision que la mesure n'a pas.
create type public.niveau as enum (
  'fondamental',    -- indice < 85
  'intermediaire',  -- 85 à 99
  'avance',         -- 100 à 114
  'superieur',      -- 115 à 129
  'exceptionnel'    -- 130 et plus
);

create type public.validity_verdict as enum ('ok', 'low_precision', 'not_interpretable');

-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILS
-- ═══════════════════════════════════════════════════════════════════════════

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,

  -- Nom affiché dans l'application. Privé : ne paraît jamais au classement.
  display_name  text,
  -- Nom porté par l'attestation. Distinct du pseudonyme : un changement de
  -- pseudonyme ne doit pas réécrire une attestation déjà délivrée.
  legal_name    text,

  -- Pseudonyme du classement public. C'est la SEULE donnée nominative qui y
  -- paraît, et elle est choisie par la personne.
  pseudonyme    text,
  -- Chacun décide de figurer ou non. Par défaut : non.
  classement_visible boolean not null default false,

  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint display_name_longueur check (display_name is null or char_length(display_name) between 1 and 80),
  constraint legal_name_longueur   check (legal_name   is null or char_length(legal_name)   between 1 and 120),
  -- Le pseudonyme est contraint pour qu'on ne puisse pas y glisser une adresse
  -- e-mail ni une phrase : lettres, chiffres, tiret, tiret bas, 3 à 24 signes.
  constraint pseudonyme_forme check (pseudonyme is null or pseudonyme ~ '^[A-Za-z0-9_-]{3,24}$')
);

-- Unicité insensible à la casse, sans recourir à une extension.
create unique index profiles_pseudonyme_unique on public.profiles (lower(pseudonyme))
  where pseudonyme is not null;

comment on table public.profiles is
  'Données de profil. Une ligne par utilisateur, créée par déclencheur à l''inscription.';
comment on column public.profiles.classement_visible is
  'Consentement à figurer au classement public. Modifiable uniquement par definir_visibilite_classement().';

-- ═══════════════════════════════════════════════════════════════════════════
-- BANQUE D'ITEMS — vérité serveur
--
-- Cette table porte les paramètres calibrés ET la bonne réponse de chaque item.
-- Elle a RLS activée et AUCUNE politique : elle est donc totalement invisible
-- depuis l'API, pour `anon` comme pour `authenticated`. Seules les fonctions
-- serveur la lisent. C'est elle qui permet de recalculer un score sans faire
-- confiance au navigateur.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.iq_items (
  id                text primary key,
  aptitude          text not null check (aptitude in ('matrix', 'series', 'verbal', 'spatial', 'memory')),

  -- Paramètres du modèle 3PL.
  param_a           double precision not null,  -- discrimination
  param_b           double precision not null,  -- difficulté
  param_c           double precision not null,  -- pseudo-hasard

  correct_index     smallint not null,
  expected_seconds  integer not null,
  design_difficulty smallint not null,
  bank_version      text not null default 'design-1',

  constraint param_a_positif check (param_a > 0),
  constraint param_c_borne check (param_c >= 0 and param_c < 1),
  constraint correct_index_valide check (correct_index between 0 and 9),
  constraint expected_seconds_positif check (expected_seconds > 0)
);

comment on table public.iq_items is
  'Paramètres et corrigé de la banque d''items. Aucune politique RLS : inaccessible depuis l''API.';

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSATIONS
-- ═══════════════════════════════════════════════════════════════════════════

create table public.iq_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  item_count    integer not null default 0,
  correct_count integer not null default 0,

  -- Résultat calculé côté serveur, nul tant que la passation n'est pas close.
  theta            double precision,
  standard_error   double precision,
  scaled_point     integer,
  scaled_lower95   integer,
  scaled_upper95   integer,
  percentile       integer,
  verdict          public.validity_verdict,
  niveau           public.niveau,
  -- Détail par aptitude, tel que le serveur l'a calculé.
  aptitudes        jsonb,
  -- Message de validité destiné à l'écran.
  validity_message text,
  aberrant_count   integer,
  above_chance_p   double precision,
  expected_by_chance numeric(6, 2),

  bank_version  text not null default 'design-1',

  constraint bornes_percentile check (percentile is null or percentile between 1 and 99),
  constraint intervalle_coherent check (
    scaled_lower95 is null or scaled_upper95 is null or scaled_lower95 <= scaled_upper95
  )
);

create index iq_sessions_user_date on public.iq_sessions (user_id, started_at desc);

comment on column public.iq_sessions.theta is
  'Aptitude estimée par EAP. Écrite par la fonction serveur uniquement : un θ envoyé par un client n''est pas digne de confiance.';

-- ── Réponses ───────────────────────────────────────────────────────────────
-- Matière première de la recalibration. En ajout seul : un journal réécrivable
-- ne vaut rien pour étalonner une banque d'items.

create table public.iq_responses (
  id               bigint generated always as identity primary key,
  session_id       uuid not null references public.iq_sessions (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  item_id          text not null references public.iq_items (id),
  selected_index   smallint not null,
  -- NON fourni par le client : un déclencheur le calcule depuis iq_items.
  correct          boolean not null default false,
  response_seconds numeric(7, 2) not null,
  answered_at      timestamptz not null default now(),

  constraint une_reponse_par_item unique (session_id, item_id),
  constraint index_choisi_valide check (selected_index between -1 and 9),
  constraint duree_positive check (response_seconds >= 0)
);

create index iq_responses_item on public.iq_responses (item_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- CLASSEMENT PUBLIC
--
-- Une ligne par utilisateur, et non par passation : un classement où une même
-- personne occupe dix lignes n'informe personne. C'est la passation la PLUS
-- RÉCENTE qui figure, pas la meilleure — publier le maximum de N tentatives
-- reviendrait à publier de la chance, l'intervalle de confiance étant large.
--
-- La table a RLS activée et AUCUNE politique : ni lecture ni écriture directes.
-- La lecture publique passe par la vue `v_classement`, qui n'expose pas
-- `user_id`. L'écriture passe par les fonctions serveur.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.classement (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  session_id    uuid not null unique references public.iq_sessions (id) on delete cascade,

  pseudonyme    text not null,
  niveau        public.niveau not null,
  score         integer not null,
  borne_basse   integer not null,
  borne_haute   integer not null,
  centile       integer,
  aptitudes     jsonb not null,
  passee_le     timestamptz not null,
  publie_le     timestamptz not null default now(),

  constraint score_plausible check (score between 40 and 160),
  constraint bornes_ordonnees check (borne_basse <= borne_haute)
);

create index classement_score on public.classement (score desc, publie_le asc);

comment on table public.classement is
  'Classement public. Aucune politique RLS : écriture réservée aux fonctions serveur, lecture via v_classement.';

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Activée sur les cinq tables, sans exception.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles     enable row level security;
alter table public.iq_items     enable row level security;
alter table public.iq_sessions  enable row level security;
alter table public.iq_responses enable row level security;
alter table public.classement   enable row level security;

-- ── profiles : chacun ne voit et ne modifie que le sien ────────────────────

create policy "profil lisible par son proprietaire"
  on public.profiles for select using (auth.uid() = id);

create policy "profil modifiable par son proprietaire"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- RLS ne sait pas restreindre des COLONNES : les privilèges, si. Le pseudonyme
-- et le consentement au classement ne sont donc pas modifiables par un UPDATE
-- direct — seule definir_visibilite_classement() les écrit, après avoir vérifié
-- que l'adresse e-mail est confirmée.
revoke update on public.profiles from authenticated;
grant update (display_name, legal_name, onboarded_at) on public.profiles to authenticated;

-- ── iq_items : aucune politique. Table invisible depuis l'API. ─────────────

-- ── iq_sessions : lecture seule pour le propriétaire ──────────────────────
-- Aucune politique d'INSERT, d'UPDATE ni de DELETE. Un client ne peut donc pas
-- créer une passation avec un score préétabli, ni modifier un score écrit.

create policy "passations lisibles par leur proprietaire"
  on public.iq_sessions for select using (auth.uid() = user_id);

-- ── iq_responses : lecture de ses réponses, ajout sur sa passation ouverte ─
-- Ni UPDATE ni DELETE : le journal est en ajout seul.

create policy "reponses lisibles par leur proprietaire"
  on public.iq_responses for select using (auth.uid() = user_id);

create policy "reponses ajoutables sur sa passation ouverte"
  on public.iq_responses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.iq_sessions s
      where s.id = session_id and s.user_id = auth.uid() and s.finished_at is null
    )
  );

-- `correct` est renseigné par déclencheur : même si un client l'envoie, sa
-- valeur est écrasée. On retire tout de même le privilège, pour que l'intention
-- soit lisible dans le schéma.
revoke insert on public.iq_responses from authenticated;
grant insert (session_id, user_id, item_id, selected_index, response_seconds)
  on public.iq_responses to authenticated;

-- ── classement : aucune politique. Ni lecture ni écriture directes. ───────

-- ═══════════════════════════════════════════════════════════════════════════
-- DÉCLENCHEURS
-- ═══════════════════════════════════════════════════════════════════════════

-- Crée le profil à l'inscription. `security definer` est nécessaire : le
-- déclencheur s'exécute avant que l'utilisateur ait une session.
create or replace function public.creer_profil_a_inscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger creer_profil_apres_inscription
  after insert on auth.users
  for each row execute function public.creer_profil_a_inscription();

-- Détermine la justesse d'une réponse côté serveur.
--
-- C'est la pièce qui empêche de se déclarer bon : le client envoie l'index
-- choisi, jamais le verdict. Le corrigé vit dans `iq_items`, table qu'aucun
-- client ne peut lire.
create or replace function public.calculer_correction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_index smallint;
begin
  select correct_index into v_correct_index
  from public.iq_items where id = new.item_id;

  if v_correct_index is null then
    raise exception 'Item inconnu : %', new.item_id;
  end if;

  new.correct := (new.selected_index = v_correct_index);
  return new;
end;
$$;

create trigger reponses_calculer_correction
  before insert on public.iq_responses
  for each row execute function public.calculer_correction();

-- Horodate les mises à jour.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- FONCTIONS SERVEUR
-- ═══════════════════════════════════════════════════════════════════════════

-- Ouvre une passation.
--
-- Passe par une fonction plutôt que par une politique d'INSERT, pour qu'aucun
-- client ne puisse insérer une ligne en y glissant déjà un score.
create or replace function public.ouvrir_passation(p_item_ids text[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_connus integer;
begin
  if v_uid is null then
    raise exception 'Connectez-vous pour commencer une évaluation.';
  end if;

  if p_item_ids is null or array_length(p_item_ids, 1) is null then
    raise exception 'Aucun item fourni.';
  end if;

  if array_length(p_item_ids, 1) > 60 then
    raise exception 'Trop d''items pour une passation.';
  end if;

  -- Les items doivent exister : une passation portant des identifiants inventés
  -- ne serait pas calculable.
  select count(*) into v_connus
  from public.iq_items where id = any (p_item_ids);

  if v_connus <> array_length(p_item_ids, 1) then
    raise exception 'Un ou plusieurs items sont inconnus.';
  end if;

  insert into public.iq_sessions (user_id, item_count)
  values (v_uid, array_length(p_item_ids, 1))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.ouvrir_passation(text[]) from public, anon;
grant execute on function public.ouvrir_passation(text[]) to authenticated;

-- Déclare le consentement au classement, et publie ou retire en conséquence.
--
-- Trois garde-fous :
--   1. l'adresse e-mail doit être confirmée ;
--   2. un pseudonyme est obligatoire pour figurer ;
--   3. la ligne publiée est recopiée depuis `iq_sessions`, colonnes écrites par
--      le serveur — jamais depuis un argument fourni par l'appelant.
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

  update public.profiles set classement_visible = p_visible where id = v_uid;

  if not p_visible then
    delete from public.classement where user_id = v_uid;
    return;
  end if;

  -- Publication de la passation la plus récente qui soit exploitable.
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
end;
$$;

revoke all on function public.definir_visibilite_classement(boolean, text) from public, anon;
grant execute on function public.definir_visibilite_classement(boolean, text) to authenticated;

-- Réserve un pseudonyme sans toucher à la visibilité.
create or replace function public.definir_pseudonyme(p_pseudonyme text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Connectez-vous pour choisir un pseudonyme.';
  end if;

  update public.profiles set pseudonyme = p_pseudonyme where id = v_uid;

  -- Le classement porte une copie du pseudonyme : on la tient à jour.
  update public.classement set pseudonyme = p_pseudonyme where user_id = v_uid;
end;
$$;

revoke all on function public.definir_pseudonyme(text) from public, anon;
grant execute on function public.definir_pseudonyme(text) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- VUES
-- ═══════════════════════════════════════════════════════════════════════════

-- Ce que le tableau de bord lit. `security_invoker` fait respecter les
-- politiques de l'appelant : chacun ne voit que ses passations.
create view public.v_mes_passations
with (security_invoker = true)
as
select
  s.id,
  s.started_at,
  s.finished_at,
  s.item_count,
  s.correct_count,
  s.scaled_point,
  s.scaled_lower95,
  s.scaled_upper95,
  s.percentile,
  s.verdict,
  s.niveau
from public.iq_sessions s
where s.user_id = auth.uid();

-- Le classement public.
--
-- `security_invoker = false` est VOULU, contrairement à la vue précédente : la
-- table `classement` n'a aucune politique de lecture, donc la vue doit s'exécuter
-- avec les droits de son propriétaire pour être lisible. C'est ce qui permet
-- d'exposer le classement sans exposer la table, et sans jamais laisser filtrer
-- `user_id` — le lien vers un compte reste privé.
create view public.v_classement
with (security_invoker = false)
as
select
  row_number() over (order by c.score desc, c.publie_le asc) as rang,
  c.pseudonyme,
  c.niveau,
  c.score,
  c.borne_basse,
  c.borne_haute,
  c.centile,
  c.aptitudes,
  c.passee_le
from public.classement c
order by c.score desc, c.publie_le asc;

comment on view public.v_classement is
  'Classement public. N''expose ni user_id, ni adresse e-mail, ni aucune donnée nominative hors pseudonyme choisi.';

grant select on public.v_classement to anon, authenticated;
