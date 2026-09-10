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
