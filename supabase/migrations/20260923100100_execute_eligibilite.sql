-- ═══════════════════════════════════════════════════════════════════════════
-- `a_une_passation_publiable()` : retirer le privilège implicite de PUBLIC
--
-- PostgreSQL accorde EXECUTE à PUBLIC sur toute fonction nouvellement créée.
-- Un `grant execute … to authenticated` ne referme donc rien : il ajoute un
-- privilège déjà détenu par tout le monde, `anon` compris.
--
-- Constaté par `scripts/verifie-classement.mjs`, qui a obtenu `false` au lieu
-- d'un refus en appelant la fonction sans session. Rien ne fuyait — sans
-- session, `auth.uid()` est nul et le `exists` est faux — mais une fonction
-- appelable par qui n'en a pas l'usage est une surface qu'on ne garde pas.
--
-- Les trois autres fonctions du schéma appliquent déjà ce retrait. Celle-ci
-- l'avait manqué.
-- ═══════════════════════════════════════════════════════════════════════════

revoke all on function public.a_une_passation_publiable() from public, anon;
grant execute on function public.a_une_passation_publiable() to authenticated;
