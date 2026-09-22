-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — les questions sont servies par le serveur, sans leur corrigé
--
-- Ce que cette migration corrige, et pourquoi elle existe :
--
-- Jusqu'ici, la banque d'items vivait dans le bundle JavaScript, corrigé compris.
-- Le score, lui, était déjà recalculé côté serveur, donc personne ne pouvait
-- INVENTER un chiffre. Mais n'importe qui pouvait ouvrir les outils de
-- développement, lire la bonne réponse de chaque question, et répondre
-- parfaitement. Le score obtenu était alors authentiquement calculé — et
-- authentiquement faux.
--
-- Désormais :
--   - `iq_items` porte aussi l'énoncé, les options et le rendu visuel ;
--   - le SERVEUR choisit les items d'une passation et les enregistre ;
--   - `items_de_passation()` sert énoncés et options, JAMAIS `correct_index`,
--     `explanation` ni `reasoning` ;
--   - `corrige_de_passation()` ne rend le corrigé qu'une fois la passation
--     close, et seulement à son propriétaire.
--
-- Le navigateur ne reçoit donc la bonne réponse qu'après avoir répondu.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Contenu des items ──────────────────────────────────────────────────────
-- Ces colonnes sont du contenu : les servir n'affaiblit rien. Ce qui reste
-- secret, ce sont `correct_index`, `explanation` et `reasoning`.

alter table public.iq_items
  add column if not exists prompt      text,
  add column if not exists options     jsonb,
  add column if not exists visual      jsonb,
  add column if not exists explanation text,
  add column if not exists reasoning   jsonb;

comment on column public.iq_items.prompt is 'Énoncé. Servi par items_de_passation().';
comment on column public.iq_items.explanation is
  'Explication de la bonne réponse. Servie uniquement par corrige_de_passation(), sur une passation close.';

-- ── Items administrés ──────────────────────────────────────────────────────
-- Enregistrer la liste des items servis est ce qui permet au serveur de
-- recalculer un score sans faire confiance au client sur ce qu'il a reçu, et de
-- compter comme échoué un item resté sans réponse.
--
-- RLS activée, AUCUNE politique : la table n'est accessible que par les
-- fonctions `security definer` et par la clé de service.

create table public.iq_session_items (
  session_id uuid    not null references public.iq_sessions (id) on delete cascade,
  item_id    text    not null references public.iq_items (id),
  ordre      smallint not null,
  primary key (session_id, item_id),
  constraint ordre_positif check (ordre >= 1)
);

create index iq_session_items_session on public.iq_session_items (session_id, ordre);

alter table public.iq_session_items enable row level security;

comment on table public.iq_session_items is
  'Items administrés d''une passation. Aucune politique RLS : réservée aux fonctions serveur.';

-- ═══════════════════════════════════════════════════════════════════════════
-- OUVERTURE D'UNE PASSATION
--
-- L'ancienne signature prenait la liste des items choisie par le CLIENT. C'est
-- désormais le serveur qui choisit : un client qui désignerait ses items pourrait
-- se composer une passation de 35 questions faciles.
-- ═══════════════════════════════════════════════════════════════════════════

drop function if exists public.ouvrir_passation(text[]);

create or replace function public.ouvrir_passation(p_longueur integer default 35)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_session uuid;
  v_par_aptitude integer;
  v_complement integer;
  v_recents text[];
  v_servis integer;
begin
  if v_uid is null then
    raise exception 'Connectez-vous pour commencer une évaluation.';
  end if;

  -- Trois longueurs, et pas une valeur libre : 500 items demandés d'un coup
  -- seraient un déni de service, et 3 items ne mesurent rien.
  if p_longueur is null or p_longueur not in (30, 35, 40) then
    raise exception 'Longueur de passation non autorisée.';
  end if;

  v_par_aptitude := p_longueur / 5;
  v_complement := v_par_aptitude - 5;

  -- Contrôle d'exposition : les items vus lors des trois dernières passations
  -- passent en dernier dans le tirage. Sans cela, repasser l'évaluation
  -- reviendrait à réviser.
  select coalesce(array_agg(distinct si.item_id), '{}'::text[])
    into v_recents
  from public.iq_session_items si
  where si.session_id in (
    select s.id from public.iq_sessions s
    where s.user_id = v_uid
    order by s.started_at desc
    limit 3
  );

  insert into public.iq_sessions (user_id, item_count)
  values (v_uid, p_longueur)
  returning id into v_session;

  -- Sélection équilibrée : un item de chaque niveau de difficulté pour chaque
  -- aptitude, puis le complément tiré au hasard dans la même aptitude. Les cinq
  -- niveaux sont donc toujours représentés, ce qu'un tirage purement aléatoire
  -- ne garantit pas.
  with candidats as (
    select
      i.id,
      i.aptitude,
      row_number() over (
        partition by i.aptitude, i.design_difficulty
        order by (i.id = any (v_recents)), random()
      ) as rang_dans_difficulte
    from public.iq_items i
  ),
  un_par_difficulte as (
    select id, aptitude from candidats where rang_dans_difficulte = 1
  ),
  complement as (
    select
      c.id,
      c.aptitude,
      row_number() over (
        partition by c.aptitude
        order by (c.id = any (v_recents)), random()
      ) as rang
    from candidats c
    where c.rang_dans_difficulte > 1
  ),
  choisis as (
    select id from un_par_difficulte
    union all
    select id from complement where rang <= v_complement
  )
  insert into public.iq_session_items (session_id, item_id, ordre)
  select v_session, id, row_number() over (order by random())
  from choisis;

  -- Le nombre réellement servi fait foi : si une aptitude manquait un niveau de
  -- difficulté, la passation serait plus courte, et le dire vaut mieux que de
  -- promettre 35 questions et en poser 34.
  select count(*) into v_servis
  from public.iq_session_items where session_id = v_session;

  if v_servis = 0 then
    raise exception 'La banque d''items est vide.';
  end if;

  update public.iq_sessions set item_count = v_servis where id = v_session;

  return v_session;
end;
$$;

revoke all on function public.ouvrir_passation(integer) from public, anon;
grant execute on function public.ouvrir_passation(integer) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- SERVIR LES QUESTIONS
--
-- La liste des colonnes rendues est la garantie centrale de cette migration :
-- `correct_index`, `explanation` et `reasoning` n'y figurent pas.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.items_de_passation(p_session_id uuid)
returns table (
  id               text,
  aptitude         text,
  prompt           text,
  options          jsonb,
  visual           jsonb,
  expected_seconds integer,
  ordre            smallint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.iq_sessions s
    where s.id = p_session_id and s.user_id = auth.uid()
  ) then
    -- Message identique qu'il s'agisse d'une passation inexistante ou de celle
    -- d'autrui : ne pas révéler l'existence de la seconde.
    raise exception 'Cette passation est introuvable.';
  end if;

  return query
    select i.id, i.aptitude, i.prompt, i.options, i.visual, i.expected_seconds, si.ordre
    from public.iq_session_items si
    join public.iq_items i on i.id = si.item_id
    where si.session_id = p_session_id
    order by si.ordre;
end;
$$;

revoke all on function public.items_de_passation(uuid) from public, anon;
grant execute on function public.items_de_passation(uuid) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- SERVIR LE CORRIGÉ, APRÈS COUP
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.corrige_de_passation(p_session_id uuid)
returns table (
  item_id       text,
  correct_index smallint,
  explanation   text,
  reasoning     jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Deux conditions, et la seconde est celle qui compte : une passation encore
  -- ouverte ne rend pas son corrigé, sinon il suffirait d'ouvrir une passation
  -- et de demander les réponses avant de répondre.
  if not exists (
    select 1 from public.iq_sessions s
    where s.id = p_session_id
      and s.user_id = auth.uid()
      and s.finished_at is not null
  ) then
    raise exception 'Le corrigé n''est disponible qu''une fois l''évaluation terminée.';
  end if;

  return query
    select i.id, i.correct_index, i.explanation, i.reasoning
    from public.iq_session_items si
    join public.iq_items i on i.id = si.item_id
    where si.session_id = p_session_id
    order by si.ordre;
end;
$$;

revoke all on function public.corrige_de_passation(uuid) from public, anon;
grant execute on function public.corrige_de_passation(uuid) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- RÉPONSES : uniquement sur un item réellement administré
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "reponses ajoutables sur sa passation ouverte" on public.iq_responses;

create policy "reponses ajoutables sur sa passation ouverte"
  on public.iq_responses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.iq_sessions s
      where s.id = session_id and s.user_id = auth.uid() and s.finished_at is null
    )
    -- Nouveau : l'item doit faire partie de ceux qui ont été servis. Sans cette
    -- condition, on pourrait répondre à des items faciles choisis soi-même.
    and exists (
      select 1 from public.iq_session_items si
      where si.session_id = iq_responses.session_id and si.item_id = iq_responses.item_id
    )
  );
