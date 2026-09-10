# JOURNAL DE BORD — session autonome

Session du 10 septembre 2026. Phases 3 à 7 menées sans validation intermédiaire.
À lire de haut en bas : les entrées sont chronologiques.

---

## [Phase 3] 19:43 — Git était disponible depuis le début, dans Bash
**Ce qui s'est passé :** `git` est absent du PATH PowerShell mais présent dans
l'environnement Bash, à `/mingw64/bin/git` (version 2.55.0.windows.5) — il est livré
avec Git Bash, lui-même déjà installé sur la machine. Les deux phases précédentes ont
donc été menées sans historique alors qu'un dépôt était possible.

**Ce que j'ai décidé :** dépôt initialisé sur `main`, commit de l'état actuel comme
point de retour (`b692436`, 58 fichiers). `.gitignore` écrit avant le premier `git add`,
donc `node_modules/`, `dist/`, `*.zip` et `.env` n'ont jamais été indexés. Une branche
par phase à partir de maintenant, conformément à la méthode d'origine.
Aucune tentative d'installation par `winget` : inutile.

**Pourquoi :** c'est la sauvegarde que tu demandais, en mieux que des archives zip.

**Ce qu'il reste à faire quand tu seras là :** créer le dépôt distant et le pousser
(`git remote add origin … && git push -u origin main`), puis lier Netlify au dépôt.
Je ne peux pas le faire : ça demande tes accès GitHub.

**Note :** j'ai quand même produit une archive
`../nexus-snapshots/20260910-1943-phase3-avant.zip` comme second filet, et j'en referai
avant chaque phase comme demandé.

---

## [Phase 3] 19:44 — Avertissements de fin de ligne au premier commit
**Ce qui s'est passé :** Git signale la conversion LF → CRLF sur 57 fichiers
(`core.autocrlf` par défaut sur Windows).

**Ce que j'ai décidé :** laisser tel quel pour l'instant, et ne pas ajouter de
`.gitattributes` qui réécrirait tous les fichiers juste avant une phase de migration
massive. À traiter en Phase 7, quand l'arbre sera stable.

**Pourquoi :** inoffensif localement, mais une normalisation maintenant produirait un
diff de 57 fichiers qui masquerait le vrai diff de la Phase 3.

---

## [Phase 3] 20:02 — Phase terminée, quatre gates verts
**Livré :** `docs/DESIGN.md` (palette de 6 couleurs + 1 fonctionnelle, contrastes tous
calculés par `scripts/contrast.mjs`, échelle typographique, rayons, élévations, motion,
écriture, wireframes landing et dashboard). Migration complète : plus une seule valeur de
couleur en dur dans les composants, vérifié par `scripts/verifie-tokens.mjs` désormais
branché sur `npm run lint`.

**Décisions prises à ta place :**

1. **Accent turquoise désaturé `#5FB3A8`.** Il fallait un accent hors violet, hors vert
   acide et hors vermillon. J'ai choisi une encre d'instrument : c'est la couleur des
   cadrans techniques, elle est calme, et elle donne 8,50 de contraste sur le noir.
2. **Sur fond accent, le texte est noir, pas blanc cassé.** Le calcul est sans appel :
   `craie` sur `mesure` donne 2,17 (échec AA), `noir` sur `mesure` donne 8,50. 31 endroits
   du code migré combinaient les deux ; corrigés par `scripts/corrige-contraste.py`, et le
   garde-fou refuse désormais cette combinaison.
3. **Les chiffres sont en Public Sans, pas en Bricolage Grotesque.** Bricolage reste sur
   les titres. Public Sans est dessinée pour les formulaires administratifs : chiffres
   désambiguïsés, grande hauteur d'x, tenue à petit corps. Or l'indice à trois positions
   est *le* chiffre du produit.
4. **Le radar en étoile est supprimé**, remplacé par `AptitudeProfile` : bandes
   horizontales, aucun chiffre par aptitude, axe relatif aux autres aptitudes du même
   répondant, largeur de bande = erreur type. Conforme à ta contrainte de Phase 3.
5. **Google Analytics retiré d'`index.html`** et le helper `trackQuizEvent` supprimé de
   `useQuizGame`. L'identifiant était `G-XXXXXXXXXX` et une garde empêchait toute
   initialisation : ce code n'a jamais rien envoyé. À rebrancher quand tu auras un vrai
   identifiant — noté dans `RETOUR.md`.
6. **`maximum-scale=5.0` retiré du viewport.** Plafonner le zoom utilisateur est un défaut
   d'accessibilité.

**Ce que je n'ai pas pu vérifier :** je n'ai pas pu regarder les polices s'afficher. Le
choix Public Sans / Bricolage repose sur la finalité de conception de chaque fonte, pas
sur une inspection visuelle. Tu demandais de changer si les chiffres à trois positions
rendaient mal — je ne peux pas en juger, donc j'ai pris l'option la plus sûre par
raisonnement et je te le signale ici. À valider d'un coup d'œil au retour.

**Hors périmètre, corrigé en chemin :** cinq `focus:outline-none` sans remplacement (le
focus clavier était invisible sur ces champs) ; le champ de particules de la landing
(30 boucles infinies + un violet en dur dans un `style` inline) ; les trois halos flous du
hero ; les dépendances mortes d'un `useCallback` du quiz, révélées par la suppression de
l'analytics.

**Ce qui reste :** la landing garde sa structure d'origine, seulement détokenisée. Sa
recomposition selon le wireframe de `DESIGN.md` §8 est le travail de la Phase 6, avec le
robot. `NexusAITutor` est toujours là : ta décision 6 le coupe de la v1, je le retire en
Phase 6 en même temps que la refonte de la landing qui le met en avant.

---

## [Phase 4] 20:20 — Docker absent : Supabase local impossible
**Ce qui s'est passé :** ni la CLI Supabase ni Docker ne sont installés. `supabase start`
exige Docker, donc la stack locale est hors de portée. Je n'ai pas tenté d'installer
Docker Desktop : c'est un installateur lourd qui demande une élévation et un redémarrage.

**Ce que j'ai décidé :** option 2 puis option 1 de ta politique de blocage, dans cet ordre.

1. **Construire jusqu'au mur.** Le schéma complet est écrit dans
   `supabase/migrations/20260910120000_schema_initial.sql` : six tables, deux types énumérés,
   RLS activée partout, politiques, déclencheurs, et une vue `v_mes_passations` en
   `security_invoker`. L'implémentation Supabase du port est écrite en entier
   (`src/lib/backend/supabase.ts`) mais **n'a jamais été exécutée**. `.env.example`
   documente chaque variable, en séparant ce qui va dans le bundle de ce qui doit rester
   côté serveur.
2. **Alternative locale équivalente.** `src/lib/backend/local.ts` permet de faire tourner
   et de vérifier l'application. Ce n'est pas présenté comme réel : un **bandeau permanent
   et non refermable** en haut de chaque page dit que la connexion ne vérifie aucun mot de
   passe et que rien ne quitte le navigateur. Le fichier lui-même s'ouvre sur un
   avertissement encadré.

**Deux points de conception qui survivront à la configuration :**
- La table `entitlements` n'a **aucune politique d'écriture**. Aucun client ne peut donc
  s'accorder un droit d'accès ; seules les fonctions serveur, via la clé de service, en
  créent. C'est la correction structurelle du défaut de l'audit, où
  `localStorage.setItem` suffisait à tout débloquer.
- `iq_responses` n'accepte que l'insertion, jamais la mise à jour ni la suppression, et
  seulement sur une passation ouverte dont on est propriétaire. Un journal réinscriptible
  ne vaut rien pour calibrer.

**Ce qu'il reste à faire quand tu seras là :** créer le projet Supabase, appliquer la
migration, renseigner les deux variables, puis écrire les deux Edge Functions que
l'adaptateur appelle (`cloturer-passation`, `lire-rapport`). Détaillé dans `RETOUR.md`.

---

## [Phase 4] 20:19 — Régression de performance attrapée au build
**Ce qui s'est passé :** après la migration du routage, le chunk d'entrée est passé de
**66 à 176 ko gzip**. Deux causes : les pages étaient importées statiquement dans
`main.tsx` — et `Rapport.tsx` tire la banque de 120 items plus le rendu SVG des matrices —
et `@supabase/supabase-js` entier, Realtime compris alors qu'on ne s'en sert pas, se
retrouvait dans le bundle initial.

**Ce que j'ai décidé :** toutes les pages passent en import dynamique, et
`src/lib/backend/index.ts` devient une façade qui charge l'implémentation Supabase au
premier appel réel. En mode local, la bibliothèque n'est **jamais** téléchargée.

**Résultat mesuré :** entrée à **89,4 ko gzip**, Supabase isolé dans son propre chunk de
60,4 ko, CSS à 10,6 ko. Soit 100 ko sur la landing, contre un budget de 200.

**Pourquoi je le note :** sans le build à chaque étape, cette régression passait
inaperçue jusqu'à la Phase 7, où elle aurait été bien plus coûteuse à démêler.

---

## [Phase 4] 20:21 — Décisions prises à ta place
1. **react-router installé et routage migré.** L'ancien routage écrit à la main ne
   permettait ni garde de route, ni retour à la page demandée, ni vraie 404 — trois
   exigences de la phase. Les écrans existants n'ont pas été réécrits : ils reçoivent
   toujours une prop `navigate(page)`, et `useNavigatePage` traduit en URL.
2. **URL francisées**, avec redirection des anciennes : `/iq` → `/evaluation`,
   `/knowledge` → `/savoir`, `/countries` → `/pays`. Le site est en production, ces
   chemins sont dans les signets et le sitemap ; `/knowledge/:id` conserve son domaine
   au passage.
3. **Nexus AI supprimé** (ta décision 6) : composant, route, entrée de navigation, carte
   de la landing, CTA de la bibliothèque, suggestion de l'omnisearch. Plus une référence.
4. **`/savoir/:domaine` fonctionne enfin.** L'audit avait relevé que la route transmettait
   un paramètre que le composant n'a jamais lu. Il est désormais honoré, et ignoré s'il ne
   correspond à aucun domaine.
5. **L'évaluation reste accessible sans compte.** Connecté, la passation est en plus
   enregistrée côté backend. Décision produit cohérente avec « gratuit, sans compte » de
   la landing.
6. **Métadonnées d'`index.html` réécrites** : le `<title>` statique annonçait encore
   « L'Univers du Savoir | Culture Générale ». Le JSON-LD annonçait une offre à 0 EUR ;
   il annonce maintenant 500 XOF.

**Ce que je n'ai pas pu vérifier :** je n'ai pas de navigateur dans cette session. J'ai
vérifié le typecheck, le lint, les 35 tests, le build, et que les onze routes répondent en
HTTP 200 sur le build de production. **Je n'ai pas vu une seule page s'afficher**, ni
cliqué un seul formulaire. Le parcours inscription → onboarding → tableau de bord est
écrit et typé, il n'est pas testé à la main.
