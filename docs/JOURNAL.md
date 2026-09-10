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
