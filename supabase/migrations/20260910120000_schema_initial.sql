-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — schéma initial
--
-- Écrit sans projet Supabase disponible (ni CLI ni Docker sur la machine de
-- développement), donc APPLIQUÉ NULLE PART à ce jour. Voir docs/RETOUR.md pour la
-- marche à suivre.
--
-- Principe directeur : l'autorisation vit dans la base, pas dans les endpoints.
-- Une politique RLS ne peut pas être oubliée par un écran ; une vérification écrite
-- dans du code applicatif, si.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profils ────────────────────────────────────────────────────────────────
-- Prolonge auth.users, qui reste la source de vérité de l'identité.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  -- Le nom porté par l'attestation. Distinct du pseudo d'affichage : on ne veut pas
  -- qu'un changement de pseudo réécrive une attestation déjà délivrée.
  legal_name    text,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint display_name_longueur check (display_name is null or char_length(display_name) between 1 and 80),
  constraint legal_name_longueur   check (legal_name   is null or char_length(legal_name)   between 1 and 120)
);

comment on table public.profiles is
  'Données de profil. Une ligne par utilisateur, créée par déclencheur à l''inscription.';

-- ── Passations ─────────────────────────────────────────────────────────────

create type public.validity_verdict as enum ('ok', 'low_precision', 'not_interpretable');

create table public.iq_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  item_count    integer not null default 0,
  correct_count integer not null default 0,

  -- Résultat calculé côté serveur. Nullable tant que la passation n'est pas finie.
  theta            double precision,
  standard_error   double precision,
  scaled_point     integer,
  scaled_lower95   integer,
  scaled_upper95   integer,
  percentile       integer,
  verdict          public.validity_verdict,

  -- Version de la banque d'items ayant servi. Deux passations calibrées
  -- différemment ne sont comparables que si l'on sait laquelle a servi.
  bank_version  text not null default 'design-1',

  constraint bornes_percentile check (percentile is null or percentile between 1 and 99),
  constraint intervalle_coherent check (
    scaled_lower95 is null or scaled_upper95 is null or scaled_lower95 <= scaled_upper95
  )
);

create index iq_sessions_user_date on public.iq_sessions (user_id, started_at desc);

comment on column public.iq_sessions.theta is
  'Aptitude estimée par EAP. Calculée serveur : un θ envoyé par le client n''est pas digne de confiance.';

-- ── Réponses ───────────────────────────────────────────────────────────────
-- C'est la matière première de la recalibration : sans ce journal, la banque
-- d'items reste étalonnée à vue pour toujours.

create table public.iq_responses (
  id               bigint generated always as identity primary key,
  session_id       uuid not null references public.iq_sessions (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  item_id          text not null,
  selected_index   smallint not null,
  correct          boolean not null,
  response_seconds numeric(7, 2) not null,
  answered_at      timestamptz not null default now(),

  -- Une réponse par item et par passation.
  constraint une_reponse_par_item unique (session_id, item_id),
  constraint index_choisi_valide check (selected_index between -1 and 9),
  constraint duree_positive check (response_seconds >= 0)
);

create index iq_responses_item on public.iq_responses (item_id);

-- ── Droits d'accès ─────────────────────────────────────────────────────────
-- Le déblocage du rapport. Vérifié serveur, jamais lu depuis le client.

create table public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- Le déblocage porte sur une passation précise, pas sur le compte : c'est un
  -- achat unique par rapport, conformément au modèle économique retenu.
  session_id  uuid not null references public.iq_sessions (id) on delete cascade,
  granted_at  timestamptz not null default now(),
  -- Transaction qui l'a ouvert. Nullable pour un octroi manuel (geste commercial).
  transaction_id uuid,

  constraint un_droit_par_passation unique (user_id, session_id)
);

comment on table public.entitlements is
  'Un droit d''accès au rapport complet. Seul un webhook vérifié ou un administrateur en crée.';

-- ── Transactions ───────────────────────────────────────────────────────────
-- Détail du flux et des six cas traités : voir la migration de la Phase 5.

create type public.payment_status as enum (
  'pending', 'succeeded', 'failed', 'expired', 'rejected'
);

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  session_id  uuid references public.iq_sessions (id) on delete set null,

  -- Référence générée serveur. L'unicité est ce qui rend le webhook idempotent :
  -- un rejeu ne peut pas créditer deux fois.
  reference   text not null unique,

  provider    text not null,
  -- Montant en unité mineure. Le franc CFA n'a pas de subdivision, donc 500 = 500 F.
  -- Fixé serveur d'après le plan, jamais lu depuis le client.
  amount      integer not null,
  currency    char(3) not null default 'XOF',
  status      public.payment_status not null default 'pending',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Au-delà, la transaction passe à `expired` et sa référence devient inutilisable.
  expires_at  timestamptz not null default now() + interval '30 minutes',

  failure_reason text,

  constraint montant_positif check (amount > 0)
);

create index transactions_user_date on public.transactions (user_id, created_at desc);
create index transactions_statut on public.transactions (status) where status = 'pending';

-- Journal des transitions d'état. Horodaté, en ajout seul.
create table public.transaction_events (
  id             bigint generated always as identity primary key,
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  from_status    public.payment_status,
  to_status      public.payment_status not null,
  source         text not null,
  detail         jsonb,
  occurred_at    timestamptz not null default now()
);

create index transaction_events_tx on public.transaction_events (transaction_id, occurred_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Activée sur toutes les tables. La règle « un utilisateur ne lit que ses propres
-- données » est écrite ici une fois, et non dans chaque écran.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles           enable row level security;
alter table public.iq_sessions        enable row level security;
alter table public.iq_responses       enable row level security;
alter table public.entitlements       enable row level security;
alter table public.transactions       enable row level security;
alter table public.transaction_events enable row level security;

-- Profils : lecture et mise à jour de son seul profil. Pas de suppression :
-- elle suit celle du compte, par cascade.
create policy "profil lisible par son proprietaire"
  on public.profiles for select using (auth.uid() = id);

create policy "profil modifiable par son proprietaire"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Passations : lecture et création par leur propriétaire.
create policy "passations lisibles par leur proprietaire"
  on public.iq_sessions for select using (auth.uid() = user_id);

create policy "passations creees par leur proprietaire"
  on public.iq_sessions for insert with check (auth.uid() = user_id);

-- Mise à jour permise tant que la passation n'est pas clôturée : le client peut
-- signaler la fin, mais le score, lui, est écrit par une fonction serveur.
create policy "passations ouvertes modifiables"
  on public.iq_sessions for update
  using (auth.uid() = user_id and finished_at is null)
  with check (auth.uid() = user_id);

-- Réponses : ajout seul, sur une passation qui vous appartient et reste ouverte.
-- Ni update ni delete : un journal qu'on peut réécrire ne vaut rien pour calibrer.
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

-- Droits d'accès : lecture seule pour l'utilisateur. Aucune politique d'écriture,
-- donc AUCUN client ne peut s'en octroyer un. Seules les fonctions serveur, qui
-- contournent RLS via la clé de service, en créent.
create policy "droits lisibles par leur proprietaire"
  on public.entitlements for select using (auth.uid() = user_id);

-- Transactions : lecture seule. La création passe par une fonction serveur, pour que
-- le montant et le plan soient déterminés serveur et non envoyés par le client.
create policy "transactions lisibles par leur proprietaire"
  on public.transactions for select using (auth.uid() = user_id);

create policy "evenements lisibles par le proprietaire de la transaction"
  on public.transaction_events for select
  using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id and t.user_id = auth.uid()
    )
  );

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
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger creer_profil_apres_inscription
  after insert on auth.users
  for each row execute function public.creer_profil_a_inscription();

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

create trigger transactions_touch
  before update on public.transactions
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- VUES
-- ═══════════════════════════════════════════════════════════════════════════

-- Ce que le dashboard lit : une passation par ligne, avec son droit d'accès résolu.
-- `security_invoker` fait respecter les politiques RLS de l'appelant.
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
  (e.id is not null) as rapport_debloque
from public.iq_sessions s
left join public.entitlements e on e.session_id = s.id and e.user_id = s.user_id
where s.user_id = auth.uid();
