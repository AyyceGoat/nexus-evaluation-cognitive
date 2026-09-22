-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS — correction : la politique des réponses ne pouvait jamais être remplie
--
-- La migration précédente exige, pour enregistrer une réponse, que l'item fasse
-- partie de ceux qui ont été servis :
--
--   and exists (select 1 from public.iq_session_items si where ...)
--
-- Or `iq_session_items` avait RLS activée et AUCUNE politique. La sous-requête
-- d'une politique s'exécute avec les droits de l'appelant, et RLS s'y applique :
-- elle ne rendait donc jamais aucune ligne, la condition était toujours fausse,
-- et TOUTE réponse était refusée. Constaté par `npm run verifie:rls`, qui a vu
-- une insertion légitime rejetée.
--
-- Correctif : autoriser chacun à lire les items de ses propres passations. Cela
-- n'expose rien de neuf — `items_de_passation()` lui sert déjà ces mêmes
-- identifiants — et surtout, cette table ne contient aucun corrigé.
-- ═══════════════════════════════════════════════════════════════════════════

create policy "items administres lisibles par le proprietaire de la passation"
  on public.iq_session_items for select
  using (
    exists (
      select 1 from public.iq_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- Aucune politique d'écriture n'est ajoutée : la composition d'une passation
-- reste décidée par `ouvrir_passation()`, et par elle seule.
