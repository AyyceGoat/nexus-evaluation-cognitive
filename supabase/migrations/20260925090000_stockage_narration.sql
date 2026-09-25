-- ═══════════════════════════════════════════════════════════════════════════
-- Stockage de la narration audio
--
-- Les cinquante articles, lus par trois voix, représentent environ 281 Mo et
-- 300 fichiers — un MP3 et un fichier de synchronisation par article et par
-- voix. Ils ne sont ni dans Git ni dans le déploiement Netlify :
--
--   dans Git, 281 Mo resteraient définitivement dans l'historique et seraient
--   téléchargés à chaque clone du dépôt, qui est public ;
--
--   dans `public/`, Vite les copierait dans `dist/` et chaque déploiement de
--   prévisualisation embarquerait l'intégralité de l'audio.
--
-- Ils vivent donc dans Supabase Storage, servi par CDN : coût ponctuel à la
-- génération, aucune latence à l'écoute, même voix sur tous les appareils.
-- Mesure relevée dans le tableau de bord avant cette migration : 0,003 Go de
-- trafic sortant consommé sur les 5 Go de l'offre, et 281 Mo occuperont 28 %
-- du gigaoctet de stockage.
--
-- ── Le régime d'accès ──
--
-- Lecture publique, écriture par personne. C'est volontaire et symétrique du
-- reste du schéma : ce qui est servi au visiteur est public par nature — le
-- contenu des articles l'est déjà — mais un client ne doit pouvoir ni déposer,
-- ni remplacer, ni supprimer un fichier. Les dépôts se font depuis la machine
-- de génération avec la clé de service, qui contourne RLS par construction.
--
-- Conséquence à connaître : un fichier de ce bucket est lisible par quiconque
-- en connaît l'URL, sans compte. Aucune donnée personnelle n'y figure, et il
-- n'y en aura jamais — ce bucket ne contient que de l'audio d'articles
-- publics. La règle est écrite ici pour qu'elle ne se perde pas.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'narration',
  'narration',
  true,
  -- 8 Mo par fichier : le plus long article mesure 2,5 Mo, la marge couvre une
  -- voix plus lente ou un débit relevé sans avoir à rejouer cette migration.
  8388608,
  array['audio/mpeg', 'application/json']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── Lecture ───────────────────────────────────────────────────────────────
-- `public = true` suffit à rendre le bucket lisible par l'API publique, mais
-- une politique explicite est posée malgré tout : elle nomme l'intention dans
-- le catalogue, et elle survit à un basculement accidentel du drapeau.

drop policy if exists "narration lisible par tout le monde" on storage.objects;

create policy "narration lisible par tout le monde"
  on storage.objects for select
  using (bucket_id = 'narration');

-- ── Écriture ──────────────────────────────────────────────────────────────
-- Aucune politique d'INSERT, d'UPDATE ni de DELETE n'est créée pour ce bucket.
-- RLS étant active sur `storage.objects`, l'absence de politique vaut refus :
-- ni `anon` ni `authenticated` ne peuvent écrire. Seule la clé de service, qui
-- contourne RLS, dépose les fichiers.
--
-- Si une politique d'écriture apparaît un jour sur ce bucket, c'est une
-- régression : n'importe qui pourrait remplacer la narration d'un article par
-- le fichier de son choix, servi ensuite sous notre domaine.
--
-- Aucun `comment on table storage.objects` ici : le rôle qui applique les
-- migrations n'est pas propriétaire de cette table, et l'instruction est
-- refusée — ce qui faisait échouer toute la migration, bucket compris. La
-- documentation vit donc dans ce fichier, où elle est de toute façon plus
-- utile qu'un commentaire de catalogue.
