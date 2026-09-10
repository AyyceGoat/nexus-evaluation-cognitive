# AUDIT — NEXUS

Audit réalisé le 9 septembre 2026 à partir du code seul, sans hypothèse extérieure.
Toutes les mesures citées (tailles de bundle, nombres d'erreurs, ratios de contraste, occurrences)
ont été produites par exécution réelle sur le dépôt, pas estimées.

---

## 0. Ce que j'ai trouvé avant même de lire le code

Trois faits qui conditionnent la suite et qu'il faut lire en premier.

**1. Ce n'est pas un dépôt Git, et Git n'est pas installé sur cette machine.**
`git` n'est pas dans le PATH ; il n'y a pas de `.git/`. La méthode de travail demandée
(une branche par phase, deploy previews Netlify, jamais de commit direct sur la branche
déployée) est donc **actuellement impossible à exécuter**. C'est le seul point qui bloque
le démarrage. Détaillé en §7.

**2. Il n'y a pas de dossier `docs/`.** Aucune image de référence dans `docs/design/`.
La direction artistique devra être fondée sur le brief écrit seul.

**3. `tsc` ne peut pas s'exécuter sur ce projet.** `tsconfig.json:20` contient
`"ignoreDeprecations": "6.0"`, valeur invalide pour TypeScript 5.9 → `error TS5103`.
Le typecheck s'arrête avant d'avoir lu une seule ligne de source. Il n'existe par ailleurs
ni script `typecheck`, ni script `lint`, ni ESLint dans le projet. `vite build` ne
typecheque pas. **Conséquence : personne n'a jamais vu les erreurs de type de ce projet.**
En corrigeant la config, il y en a 60 (§4.2), dont une qui casse une fonctionnalité en production.

---

## 1. Le produit

### 1.1 La fonctionnalité centrale

**Le test de QI et son rapport psychométrique payant.** Sans lui, NEXUS est un site de
contenu gratuit sans modèle économique.

Le code le dit de six façons indépendantes :

| Signal | Où |
|---|---|
| C'est la seule chose payante | `IQResultsView.tsx` — 4 murs de paiement à 500 FCFA |
| C'est la seule chose avec un module de types dédié | `src/types/iq.ts` |
| C'est la seule chose avec un moteur de calcul | `src/utils/iqEngine.ts` |
| C'est la seule chose avec une persistance | `src/utils/paymentStorage.ts` |
| C'est le seul item de nav marqué `isSpecial`, avec badge « 500 F » | `App.tsx:229-243` |
| C'est le premier CTA du hero, et le premier `<title>` SEO | `HomePage.tsx:73-79`, `App.tsx:128` |

Le reste du produit — quiz, pays, bibliothèque — est un corpus de contenu gratuit qui sert
d'acquisition SEO (`sitemap.xml`, `robots.txt`, JSON-LD, OG tags : le SEO est la partie la
plus soignée du dépôt) et qui alimente le funnel vers le test.

### 1.2 Les fonctionnalités secondaires, par degré d'achèvement

**Abouti — Quiz du Savoir** (`QuizSection.tsx`, `useQuizGame.ts`, `quiz.ts`)
464 questions, 9 domaines, 6 modes de jeu (classique, chronométré, rapide, survie, défi,
apprentissage), système de combo, vies, raccourcis clavier 1-4/A-D, réglages de durée et
d'auto-avance. C'est de loin le module le plus complet et le mieux séparé (logique en hook,
présentation en composant). Trois bugs de logique quand même, voir §4.4.

**Abouti mais plat — 195 Pays** (`CountriesExplorer.tsx`, `countries.ts`)
Les 195 pays sont présents et complets (capitale, langue, monnaie, dirigeant, population,
superficie, 3 faits). Recherche et filtre par continent fonctionnels. Mais c'est une grille
de cartes → une fiche. Aucune profondeur : pas de comparaison, pas de carte, pas de lien
vers le quiz de géographie, pas de progression. Complet en données, inexistant en produit.

**Ébauche — Bibliothèque du Savoir**
Il y a **deux systèmes de contenu parallèles et non réconciliés** :
- `knowledgeExtended.ts` : 51 articles à plat, avec résumé, concepts clés, flashcards.
  Affiché par `KnowledgeExplorer.tsx`. C'est le système vivant.
- `knowledge.ts` : 9 catégories hiérarchiques (religions, histoire…), affiché par
  `ArticleView.tsx` via la route `/article/:cat/:section`. **Ce système est orphelin** :
  `KnowledgeExplorer` importe `knowledgeCategories` et ne s'en sert jamais (`ligne 3`,
  erreur TS6133), et sa prop `initialCategoryId` — celle que la route `/knowledge/:id`
  transmet — n'est jamais lue (`ligne 26`). Le seul chemin qui atteint encore `ArticleView`
  est l'omnisearch. 67 kB de données pour un écran quasi inaccessible.

**Ébauche, et problématique — Nexus AI** (`NexusAITutor.tsx`)
Ce n'est pas une IA. `generateAIResponse` (ligne 44) fait de la correspondance de mots-clés
sur `extendedKnowledgeItems`, attend 800 ms (`await new Promise(setTimeout)`, ligne 56) pour
simuler la frappe, et renvoie un gabarit de texte pré-écrit. Si rien ne correspond, elle
renvoie un paragraphe générique fixe (ligne 96) qui ne contient aucune réponse à la question.

Deux aggravations :
- Il reste `customApiKey` / `showKeyModal` en état mort (lignes 40-41) : quelqu'un a prévu
  de brancher une vraie API et ne l'a pas fait.
- Les réponses contiennent du Markdown (`###`, `**`) rendu dans un `whitespace-pre-line`
  (ligne 211). **Les dièses et les astérisques s'affichent littéralement à l'écran.**

C'est l'élément le plus coûteux du produit en crédibilité : il est mis en avant comme pilier
(nav, hero, 1 des 4 cartes de la home) et il ne fonctionne pas.

**Ébauche — Omnisearch** (`OmnisearchModal.tsx`)
Ctrl+K, navigation clavier ↑↓/Entrée, agrégation sur 3 sources. Mais :
- **Aucun résultat ne mène au résultat.** Chercher « Einstein » et valider fait
  `navigate({ type: 'knowledge' })` (ligne 122) : on atterrit sur la grille, à l'utilisateur
  de rechercher à nouveau. Idem pour les pays (ligne 145). Seuls les articles legacy
  ciblent vraiment (ligne 163).
- **Ligne 138 : `country.flag` n'existe pas.** L'interface `Country` déclare `flagCode`.
  C'est la seule vraie erreur de type du projet (`TS2339`), et comme rien ne typecheque,
  elle est en production : tout résultat « pays » s'affiche « **undefined Algérie** ».
- Le `useEffect` du clavier (ligne 38-58) n'a pas de tableau de dépendances : il détache et
  rattache un listener global à chaque rendu.

### 1.3 À qui ça s'adresse

Le code désigne un public précis : **jeunes adultes et étudiants ivoiriens, francophones,
sur mobile.** Ce n'est pas une déduction généreuse, c'est écrit partout :

- Prix en **FCFA**, moyens de paiement **Wave / Orange Money / MTN MoMo / Moov** avec les
  codes USSD ivoiriens `#144#`, `*133#`, `*155#` (`PaymentModal.tsx:161-199`).
- Placeholder de nom : `« Ex : Koffi Kouamé »` (`IQTestRunner.tsx:253`).
- Placeholder de téléphone : `« 07 00 00 00 00 »`, format ivoirien (`PaymentModal.tsx:229`).
- Signature de pied de page : *« Conçu pour l'Afrique et le Monde »* (`App.tsx:367`).
- Le contenu privilégie les empires africains, l'« économie mobile », et le prompt suggéré
  *« Comment ce concept s'applique-t-il en Afrique ? »* (`NexusAITutor.tsx:75`).
- `lang="fr"`, `og:locale=fr_FR`, tout le contenu en français.
- Le mot « certificat » revient 11 fois. Le test est vendu comme quelque chose qu'on montre.

Le registre, en revanche, ne colle pas au public : *« banc d'épreuve psychométrique »*,
*« toile psychométrique à 6 dimensions »*, *« efficience intellectuelle »*. C'est du
vocabulaire de laboratoire posé sur un produit grand public. Voir §6.4.

### 1.4 Ce qui justifie un abonnement — et le découpage que je propose

**Le découpage actuel ne tient pas.** Il vend 500 FCFA **une fois**, « accès à vie, sans
abonnement » (`PaymentModal.tsx:112-116`), un rapport qu'on consulte une fois. Ça donne :
un revenu unique par utilisateur, aucune récurrence, et un backend à financer avec ça.
Le brief §5 demande pourtant un écran « Abonnement & facturation » : les deux sont
contradictoires. Il faut trancher, et je recommande de basculer sur l'abonnement.

**L'argument produit :** un score de QI isolé est un produit à consommation unique. Une
**progression** est un produit à consommation répétée. Le seul actif capable de justifier
un paiement mensuel ici, c'est l'historique : « votre raisonnement spatial est passé du
41ᵉ au 63ᵉ percentile en six semaines ». C'est aussi la seule chose qu'un backend permet et
qu'un site statique ne permettait pas — donc la seule chose qui justifie le chantier.

**Découpage proposé :**

| | Gratuit | NEXUS Plus — 500 FCFA / mois |
|---|---|---|
| Bibliothèque, 195 pays, quiz | illimité | illimité |
| Test de QI | 1 tous les 30 jours | illimité |
| Score global + percentile | ✅ | ✅ |
| **Radar 6 dimensions** | ✅ **visible** | ✅ |
| Corrections détaillées | 3 questions ratées | toutes, pas-à-pas |
| Plan d'entraînement 14 j | ❌ | ✅ (vraiment personnalisé) |
| Certificat vérifiable | ❌ | ✅ |
| **Historique et courbe de progression** | ❌ | ✅ |
| Statistiques quiz, sujets faibles | ❌ | ✅ |
| Export PDF | ❌ | ✅ |

Deux choix à justifier :

- **Le radar passe en gratuit.** Aujourd'hui il est affiché *flouté* derrière un cadenas
  (`IQResultsView.tsx:220-238`). Flouter le résultat que l'utilisateur vient de produire
  par 20 minutes d'effort est un dark pattern, et c'est précisément ce qui fait « produit
  cheap ». Le radar est ce qui donne envie de revenir ; il doit être l'appât, pas l'otage.
  Ce qu'on vend, c'est le *pourquoi* (corrections), le *comment progresser* (plan), la
  *preuve* (certificat) et la *durée* (historique).
- **Une limite de 1 test / 30 jours en gratuit** est cohérente avec la nature du produit
  (repasser un test cognitif tous les jours n'a pas de sens psychométrique) et rend la
  limite justifiable plutôt qu'arbitraire.

**Blocage préalable, non négociable :** le score actuel n'est pas vendable. Voir §4.5.

---

## 2. Inventaire technique

### 2.1 Stack

| | |
|---|---|
| Build | Vite 7.3.2, `@vitejs/plugin-react` 5.1.1 |
| UI | React 19.2.6 |
| Langage | TypeScript 5.9.3, `strict: true` |
| Styles | Tailwind CSS 4.1.17 via `@tailwindcss/vite` (approche CSS-first, bloc `@theme`) |
| Icônes | `lucide-react` 1.38 **+ emojis Unicode** (deux systèmes d'icônes coexistants) |
| Divers | `canvas-confetti`, `clsx`, `tailwind-merge` (ces deux derniers jamais importés) |
| Hébergement | Netlify, `taupe-lily-ac2081.netlify.app` |
| Tests | **aucun** |
| Lint | **aucun** |
| Router | **aucun** — routing écrit à la main dans `App.tsx` |
| Backend | **aucun** |
| Auth | **aucune** |

`vite-plugin-singlefile` est en devDependency et n'est référencé nulle part.

### 2.2 Routes

Il n'y a pas de librairie de routing. `App.tsx` implémente `pageToPath` (l.24),
`pathToPage` (l.47), un `useState<Page>` initialisé depuis `window.location.pathname`,
un listener `popstate` et des `history.pushState`. Le SPA fallback est assuré par
`public/_redirects` et `netlify.toml`.

| Route | Écran | Composant |
|---|---|---|
| `/` | Accueil | `HomePage` |
| `/iq` | Test de QI (3 états internes : config / passation / résultats) | `IQTestRunner` |
| `/ai` | Tuteur « IA » | `NexusAITutor` |
| `/knowledge`, `/knowledge/:categoryId` | Bibliothèque (le `:categoryId` est **ignoré**) | `KnowledgeExplorer` |
| `/countries` | 195 pays (+ fiche pays en état interne) | `CountriesExplorer` |
| `/quiz` | Quiz (3 états internes) | `QuizSection` |
| `/article/:cat/:sec[/:sub]` | Article legacy | `ArticleView` |
| tout le reste | → Accueil silencieusement | — |

Limites de cette approche : pas de 404 (tout chemin inconnu rend l'accueil avec l'URL
d'origine dans la barre), pas de restauration de scroll, pas de garde de route, pas de
`<Link>` donc **aucune navigation n'est un `<a href>`** — impossible d'ouvrir dans un
nouvel onglet, invisible pour les crawlers qui ne suivent pas le JS, et non annoncé aux
lecteurs d'écran comme un changement de page.

### 2.3 Composants (14 fichiers, 2 hooks/utils)

| Fichier | Taille | Verdict | Justification |
|---|---|---|---|
| `App.tsx` | 17 kB | **Refondre** | Contient shell + nav + footer + routing + SEO. À éclater ; le routing passe à `react-router`. |
| `main.tsx` | 0,2 kB | **Garder** | Point d'entrée standard. |
| `ErrorBoundary.tsx` | 1,7 kB | **Garder, retoucher** | Logique correcte. Redirige en dur vers `/` et le style est violet ; à re-styler. |
| `HomePage.tsx` | 15 kB | **Supprimer et réécrire** | C'est la landing à refondre entièrement. Contient `ParticleField` (30 particules animées à l'infini) à supprimer. |
| `KnowledgeExplorer.tsx` | 18 kB | **Refondre** | Bonne logique de filtrage (`useMemo` l.35). Mais cartes en `<div onClick>` (l.305) non accessibles au clavier, et 3 imports morts. |
| `CountriesExplorer.tsx` | 8 kB | **Refondre** | Le plus propre du lot. Refonte visuelle + `width`/`height` sur les 195 `<img>` (CLS). |
| `ArticleView.tsx` | 7,5 kB | **Supprimer** | Écran orphelin (§1.2) ; contient un parseur Markdown maison de 55 lignes (`renderContent` l.12) qui ne gère que 4 cas. |
| `QuizSection.tsx` | 22 kB | **Refondre** | Présentation pure, bien séparée du hook. Refonte visuelle seulement. |
| `useQuizGame.ts` | 12 kB | **Garder, corriger** | Bonne architecture. 3 bugs de logique à corriger (§4.4). |
| `OmnisearchModal.tsx` | 9,6 kB | **Refondre** | Bonne idée, exécution cassée (§1.2). À reconstruire sur un vrai composant Dialog accessible. |
| `iq/IQTestRunner.tsx` | 19 kB | **Refondre** | Le cœur du produit. Machine à 3 états à extraire ; chronométrage bugué (§4.4). |
| `iq/IQResultsView.tsx` | 24 kB | **Refondre** | Les 4 murs de paiement passent côté serveur ; le flou du radar disparaît. |
| `iq/IQCertificate.tsx` | 8 kB | **Refondre** | L'ID n'est pas vérifiable, le « QR code » promis n'existe pas (l.458 le vend, l.150-170 ne le rend pas). L'« impression » est `window.print()`. |
| `iq/CognitiveRadarChart.tsx` | 8 kB | **Garder, corriger** | SVG bien construit et sans dépendance. À détokeniser (`#818cf8` en dur l.64-117) et à rendre accessible (aucun `<title>`/`role`). |
| `iq/MatrixRenderer.tsx` | 11 kB | **Garder, corriger** | Vrai travail : 8 primitives SVG paramétriques. Couleur par défaut `#818cf8` en dur (l.22) et `rgba(99,102,241,…)` (l.205, 213). |
| `payment/PaymentModal.tsx` | 14 kB | **Supprimer** | Faux paiement. Détaillé en §4.6. |
| `utils/paymentStorage.ts` | 3 kB | **Supprimer aux 3/4** | Le déblocage passe côté serveur. Seuls les helpers de reprise de test survivent. |
| `utils/iqEngine.ts` | 6,6 kB | **Refondre, déplacer serveur** | Le calcul de score est faux (§4.5) et doit être serveur. |
| `types/iq.ts` | 2,8 kB | **Garder** | Typage propre et bien pensé. Base solide du schéma de base de données. |

### 2.4 Données

| Fichier | Taille source | Contenu réel |
|---|---|---|
| `quiz.ts` | 135 kB | 464 questions, 9 catégories, 6 modes |
| `knowledgeExtended.ts` | 100 kB | 51 articles, ~55 domaines déclarés |
| `countries.ts` | 93 kB | 195 pays |
| `knowledge.ts` | 67 kB | 9 catégories hiérarchiques (**orphelin**) |
| `iqQuestions.ts` | 29 kB | **24 questions**, dont **5 seulement** avec matrice visuelle |

**423 kB de données en modules TypeScript importés statiquement.** C'est la cause racine du
problème de performance (§4.1) et le premier chantier technique.

Le déséquilibre le plus grave est là : 464 questions pour le quiz **gratuit**, 24 pour le
test **payant**. Voir §4.5.

### 2.5 Auth, persistance, backend

**Il n'y en a aucun.** C'est un site 100 % statique servi par Netlify. La seule persistance
est `localStorage`, dans `paymentStorage.ts` :

```
nexus_unlocked_iq_reports_v1   → tableau des rapports « payés »
nexus_iq_result_<id>            → résultat complet
nexus_last_iq_result_id
nexus_iq_test_progress_v1
```

**Ce que ça implique, concrètement :**

1. **Le produit payant n'est pas protégé.** Ouvrir la console et taper
   `localStorage.setItem('nexus_unlocked_iq_reports_v1','["x"]')` — en adaptant l'id —
   débloque le rapport, le certificat et le plan. Gratuitement, définitivement.
2. **Un client qui paie perd son achat** en changeant de navigateur, de téléphone, ou en
   vidant son cache. Il n'existe aucun moyen de le lui restituer : il n'y a pas de compte.
3. Aucune trace des transactions. Aucun moyen de savoir combien a été vendu, à qui, ni de
   traiter une réclamation.
4. Aucun webhook n'est recevable : il n'y a pas d'URL serveur.

Donc : **auth, abonnement et paiement exigent un serveur.** Il n'y a pas de contournement.
La comparaison des solutions est en §5 de `PLAN.md`.

### 2.6 Configuration

- **`netlify.toml`** — build correct, SPA fallback correct, cache assets correct. En-têtes
  de sécurité présents mais incomplets : pas de `Content-Security-Policy`, pas de
  `Strict-Transport-Security`, pas de `Permissions-Policy`. `X-XSS-Protection` est obsolète.
- **`vite.config.ts`** — minimal, alias `@` → `src`. Aucun `manualChunks`, aucun budget.
- **`tsconfig.json`** — **invalide** (§0.3). `strict`, `noUnusedLocals`, `noUnusedParameters`
  sont activés, ce qui est bien, mais inopérant puisque `tsc` ne tourne pas.
- **`package.json`** — nom générique `react-vite-tailwind`, version `0.0.0`. 3 scripts
  seulement. Manquent : `typecheck`, `lint`, `format`, `test`.
- **Variables d'environnement** — **il n'y en a aucune.** Pas de `.env`, pas de
  `.env.example`, aucun `import.meta.env` dans le code. Tout est en dur.
- **`index.html:80`** — `const GA_ID = 'G-XXXXXXXXXX'` : Google Analytics est du code mort
  entouré d'une garde qui l'empêche de s'initialiser. `window.trackEvent` est appelé depuis
  `useQuizGame.ts` et ne fait donc rien.
- **`public/sitemap.xml`** et les balises canoniques pointent en dur vers
  `taupe-lily-ac2081.netlify.app`. À générer au build.
- **Artefacts commités** : `dist/` (le build) et `dist.zip` (1,0 Mo) sont à la racine.

---

## 3. Le design actuel

### 3.1 Où vit l'identité violette, et quelle est l'ampleur réelle

**Mesuré, pas estimé.** 120 occurrences de `#6366f1|#818cf8|#8b5cf6|#a855f7|#a78bfa|indigo-|purple-|violet-|fuchsia-`
dans les 16 fichiers `.ts/.tsx` hors données :

| Fichier | Occurrences |
|---|---|
| `iq/IQTestRunner.tsx` | 23 |
| `iq/IQResultsView.tsx` | 14 |
| `KnowledgeExplorer.tsx` | 14 |
| `HomePage.tsx` | 13 |
| `QuizSection.tsx` | 12 |
| `ai/NexusAITutor.tsx` | 11 |
| `payment/PaymentModal.tsx` | 8 |
| `iq/CognitiveRadarChart.tsx` | 6 |
| `App.tsx` | 6 |
| `iq/MatrixRenderer.tsx` | 4 |
| `iq/IQCertificate.tsx` | 3 |
| `ArticleView.tsx`, `CountriesExplorer.tsx`, `ErrorBoundary.tsx` | 2 chacun |

Le violet vit à **quatre niveaux**, et c'est ce qui fait l'ampleur du chantier :

1. **Tokens** — `src/index.css:8-9` : `--color-nexus-accent: #6366f1`, `--color-nexus-glow: #818cf8`.
   *Deux lignes.* Trivial.
2. **CSS en dur dans les utilitaires** — `index.css` contient `rgba(99,102,241,…)` ou
   `#818cf8` dans 8 blocs : `::selection` (l.36), `@keyframes pulse-glow` (l.46-47),
   `.glass` (l.94), `.glass-strong` (l.101), `.glow-border::before` (l.113),
   `.text-gradient` (l.124), `.bg-mesh` (l.139-142), `.card-hover:hover` (l.152),
   `.particle` (l.182). Ces classes sont utilisées partout : les toucher touche tout.
3. **Classes Tailwind littérales dans les composants** — les 120 occurrences ci-dessus.
   `from-indigo-500 via-purple-600`, `border-indigo-500/30`, `shadow-indigo-500/25`…
4. **Couleurs dans la couche de données** — le point qu'on oublie :
   - `iqQuestions.ts` : `DIMENSION_METADATA` porte 6 hex en dur (`#818cf8`, `#a855f7`…)
   - `knowledge.ts`, `knowledgeExtended.ts`, `quiz.ts` stockent des **chaînes de classes
     Tailwind comme données** : `color: 'from-indigo-500 to-purple-600'`.
   - `MatrixRenderer.tsx:22` : `const stroke = shape.stroke || '#818cf8'` — la couleur par
     défaut des figures du test de QI.

**Ampleur réelle : environ 2 jours.** Mais le vrai constat est ailleurs.

### 3.2 Le vrai problème n'est pas le violet

Éliminer le violet ne représente qu'un tiers du travail, parce qu'**il n'y a pas de système
de couleur du tout**. À côté des 120 occurrences violettes, j'ai compté :

```
amber-    95      emerald-  39      cyan-     36      rose-     21
red-      14      orange-   13      yellow-    8      green-     7      slate-  7
```

**233 occurrences supplémentaires de couleurs codées en dur, dont aucune n'est un token.**
Neuf familles chromatiques cohabitent sans règle. L'ambre a même un rôle sémantique
concurrent du violet (il marque « premium ») sans être déclaré nulle part.

Autrement dit : la refonte n'est pas « remplacer le violet par autre chose », c'est
**créer le premier système de couleur du projet**. Toute valeur en dur doit disparaître,
y compris hors du violet. C'est ce que `DESIGN.md` devra fixer.

### 3.3 Les composants qui trahissent le template généré

Chacun de ces marqueurs est présent, avec sa localisation :

| Marqueur | Où, et combien |
|---|---|
| **Kit « cartes SaaS »** — même rayon, même verre, même ombre partout | `.glass` / `.glass-strong` sur tous les écrans ; `rounded-2xl` et `rounded-3xl` sans distinction hiérarchique |
| **Halos flous décoratifs** | `blur-3xl` × 7 : `HomePage.tsx:49-51` (3 orbes), `PaymentModal.tsx:74-75`, `HomePage.tsx:117`, `KnowledgeExplorer.tsx:67` |
| **Dégradé de fond en maillage** | `.bg-mesh` (4 radial-gradients) appliqué au `<div>` racine, `App.tsx:202` |
| **Un mot du titre coloré** | `.text-gradient` sur un mot de *chaque* titre : « Savoir », « Frontières », « QI », « Psychométriques », « Complète », « Monde », « Savoir Universel »… |
| **Eyebrows en MAJUSCULES espacées** | `uppercase tracking-wider` au-dessus de presque chaque section : `IQTestRunner.tsx:167`, `:262`, `:302`, `IQResultsView.tsx:87`, `:248`, `PaymentModal.tsx:122`, `MatrixRenderer.tsx:250`… |
| **Chaînes méta au point médian** | `App.tsx:358-363` (footer), `KnowledgeExplorer.tsx:82`, `:160`, `OmnisearchModal.tsx:139`, `:254`, `IQResultsView.tsx:331`, `CognitiveRadarChart.tsx:207`, `CountriesExplorer.tsx:162` |
| **Flèche `→` collée aux liens** | 10 occurrences : `HomePage.tsx:224`, `:245`, `:266`, `:287`, `QuizSection.tsx:205`, `:432` (×2), `ArticleView.tsx:142`, `:169`, `KnowledgeExplorer.tsx:194` |
| **Monospace sur les petits labels** | `font-mono` × 10 : badge « 2.0 » (`App.tsx:221`), badge « 500 F » (`:242`), kbd (`:274`), compteurs de domaine (`KnowledgeExplorer.tsx:285`), chrono (`IQTestRunner.tsx:311`), numéros d'option (`QuizSection.tsx:405`) |
| **Noir teinté au lieu du noir** | `--color-nexus-bg: #050510` — bleu-violet, exactement le marqueur cité. Idem `#0a0a1a`, `#0f0f23`, `#1a1a3e`. Et `<meta name="theme-color" content="#050510">` |
| **Fade-and-slide-up au scroll** | `.animate-fadeIn` / `.animate-slideUp` + `.stagger-1..8` sur presque chaque section |
| **Accent vif sur fond quasi-noir** | l'ambre `#f59e0b` joue exactement ce rôle |

Deux marqueurs supplémentaires que le brief ne liste pas mais qui sont tout aussi datants :

- **Deux systèmes d'icônes simultanés.** `lucide-react` *et* des emojis Unicode comme
  icônes structurelles : la nav mélange `◈ 🧠 ✨ 📚 🌍 🎮` (`App.tsx:193-198`), les onglets
  du rapport mélangent `📊 🔍 🎯` avec une icône Lucide (`IQResultsView.tsx:166-202`), les
  6 dimensions cognitives sont des emojis (`iqQuestions.ts`). Un emoji rend différemment sur
  chaque OS : on ne peut pas construire une identité visuelle dessus.
- **Le confetti à la validation du paiement** (`PaymentModal.tsx:50`). Signal fort de
  produit non sérieux sur un acte d'achat.

### 3.4 Typographie actuelle

Inter (7 graisses : 300 à 900) + Space Grotesk (5 graisses), chargées via
`fonts.googleapis.com` en `<link rel="stylesheet">` **bloquant le rendu**
(`index.html:103`), sans `preload`, sans `font-display` maîtrisé au-delà du `&display=swap`.
12 graisses téléchargées pour un site qui en utilise 5.

C'est le couple par défaut de tous les templates de 2023-2024. Le brief l'exclut
explicitement, à raison.

---

## 4. Dette technique bloquante

### 4.1 Performance — mesures réelles

`npm run build`, exécuté :

```
dist/assets/index-DPfEhpMZ.js     455,40 kB │ gzip: 150,46 kB   ← chunk d'entrée
dist/assets/QuizSection.js        140,39 kB │ gzip:  37,78 kB
dist/assets/IQTestRunner.js        93,07 kB │ gzip:  26,25 kB
dist/assets/index.css              89,47 kB │ gzip:  12,95 kB
dist/index.html                     5,74 kB │ gzip:   1,96 kB
```

**Le chunk d'entrée pèse 150 kB gzip. La cause est identifiable précisément :**

`App.tsx:4` importe `OmnisearchModal` **statiquement** (tous les autres écrans sont en
`lazy()`). Or `OmnisearchModal` importe `knowledgeExtended` (100 kB), `knowledge` (67 kB) et
`countries` (93 kB). **Environ 260 kB de données brutes atterrissent dans le bundle initial
pour une modale que la majorité des visiteurs n'ouvrira jamais.**

Corollaires :
- `QuizSection` embarque les 464 questions (135 kB) pour en jouer 10.
- `public/og-image.png` pèse **803 kB** — jamais servi aux visiteurs, mais dans le dépôt et
  dans `dist/`.
- Les 195 `<img>` de drapeaux (`CountriesExplorer.tsx:154`) n'ont ni `width` ni `height` :
  décalage de mise en page garanti au chargement (CLS).
- `body { overflow-x: hidden }` (`index.css:30`) : les débordements horizontaux sont
  masqués, pas corrigés. On ne sait pas ce qui déborde aujourd'hui.

**Position par rapport au budget de 200 kB gzip :** 150 (JS) + 13 (CSS) = 163 kB, avant
d'ajouter router, auth, client Supabase et 3D. Le budget est déjà quasi consommé. Bonne
nouvelle : sortir les données du chunk d'entrée libère ~100 kB à lui seul.

### 4.2 Typage

- La config est invalide, `tsc` ne démarre pas (§0.3).
- Config corrigée : **60 erreurs**.
  - **1 vraie** : `OmnisearchModal.tsx:138` — `TS2339: Property 'flag' does not exist on
    type 'Country'`. En production, casse l'affichage des résultats « pays ».
  - **59 `TS6133`** (symbole déclaré, jamais lu) : 40 imports morts (surtout des icônes
    Lucide importées et abandonnées), 5 props non lues, 4 états morts, 2 variables locales
    mortes. `React` est importé sans être utilisé dans 9 fichiers (inutile depuis le
    transform JSX automatique).
- Aucun ESLint : aucune règle sur les dépendances de hooks, les clés de liste, l'a11y JSX.

### 4.3 Accessibilité

Mesuré sur l'ensemble du `src/` : **1 attribut `aria-*`** (le `aria-label` du bouton menu),
**0 `role=`**, **0 `tabIndex`**, **2 `alt=`**.

**Contrastes — calculés, pas estimés** (WCAG 2.1, sur le fond `#050510`) :

| Couleur | Usage | Ratio | Verdict |
|---|---|---|---|
| `--nexus-text` `#e2e8f0` | texte principal | **16,4:1** | ✅ AAA |
| `--nexus-muted` `#64748b` | **tout le texte secondaire, en `text-xs` (12 px)** | **4,26:1** | ❌ échoue AA (4,5 requis) |
| `--nexus-accent` `#6366f1` | texte accentué | **4,54:1** | ⚠️ passe de justesse |
| `#6366f1` + texte blanc | boutons `bg-nexus-accent text-white` | **4,47:1** | ❌ échoue AA |
| `text-nexus-muted/70` | pied de page (`App.tsx:366`) | **2,60:1** | ❌ échec net |

Ce n'est pas un accident ponctuel : `nexus-muted` est la couleur de *tout* le texte
secondaire du site, systématiquement en 11-12 px. **La palette échoue AA par construction.**

Autres points bloquants :
- **`focus:outline-none` sur les 8 champs de saisie**, sans style de remplacement. Le focus
  clavier est **invisible** sur tous les formulaires. Aucun `focus-visible` nulle part.
- **Cartes cliquables en `<div onClick>`** : `KnowledgeExplorer.tsx:305`, `HomePage.tsx:209/230/251/272`.
  Non atteignables au clavier, non annoncées comme interactives.
- **Les deux modales** (`PaymentModal`, `OmnisearchModal`) n'ont ni `role="dialog"`, ni
  `aria-modal`, ni piège de focus, ni restauration du focus, ni blocage du scroll.
  `PaymentModal` ne se ferme même pas à Échap.
- **Labels non associés** : `PaymentModal.tsx:224`, `IQTestRunner.tsx:248`,
  `IQCertificate.tsx` — des `<label>` sans `htmlFor`, à côté d'`<input>` sans `id`.
  Aucun message d'erreur n'est lié à son champ (`aria-describedby`), aucun n'est annoncé
  (`role="alert"`).
- **`.text-gradient` pose `-webkit-text-fill-color: transparent`.** En mode contrastes
  forcés / haut contraste Windows, **les titres disparaissent**.
- **Aucune gestion de `prefers-reduced-motion`**, alors que tournent en permanence :
  30 particules animées, 3 orbes `animate-float`, `animate-pulse-glow`, `timer-pulse`,
  `combo-pop`, et un `fadeIn`/`slideUp` sur chaque section.
- **Le radar cognitif** — le livrable premium — est un `<svg>` sans `<title>`, sans `role`,
  sans alternative textuelle. Invisible pour un lecteur d'écran.
- **`maximum-scale=5.0`** dans le viewport (`index.html:5`) limite le zoom utilisateur.
- Les emojis porteurs de sens (nav, dimensions cognitives) n'ont aucun nom accessible.

### 4.4 Responsive, et bugs de logique

**Responsive :**
- `index.css:210-214` applique `min-height: 44px` à **tous** les `button, a` sous 640 px.
  Instrument trop grossier : il étire les liens en ligne du pied de page et les badges,
  et ne corrige pas la largeur des cibles.
- `py-0.2` (`App.tsx:273`, `KnowledgeExplorer.tsx:285`) n'est pas une classe Tailwind
  valide. Sans effet, silencieusement.
- Les 4 onglets du rapport de QI défilent horizontalement à 360 px (`IQResultsView.tsx:157`).
- Les 9 catégories de quiz en `grid-cols-3` à 360 px : cellules d'environ 100 px, libellés
  tronqués (`QuizSection.tsx:77`).
- `overflow-x: hidden` sur `<body>` masque tout débordement existant.

**Bugs de logique confirmés par lecture :**

1. **`useQuizGame.ts:158`** — `filtered.filter((_, i) => !seenQuestions.current.has(i))`.
   `seenQuestions` stocke des index de `quizQuestions` (l.177), mais on filtre avec des
   index de `filtered`. Les deux espaces d'index ne coïncident pas : la logique
   « ne pas répéter les questions » est fausse dès qu'un filtre est actif.
2. **`useQuizGame.ts:56-62`** — `setLives` est un *updater* qui contient un effet de bord
   (`setTimeout(() => setGameOver(true))`). Sous StrictMode, React double-invoque les
   updaters : la vie est décrémentée deux fois.
3. **`IQTestRunner.tsx:95-98` + `:106-110`** — `questionSeconds` est additionné au
   compteur à *chaque changement de réponse*, puis **encore une fois** au passage à la
   question suivante. Le temps par question est surévalué dès que l'utilisateur se ravise.
   Ce temps figure sur le certificat vendu.
4. **`IQTestRunner.tsx:66`** — `[...iqQuestions].sort(() => 0.5 - Math.random())` : mélange
   biaisé, non uniforme. (Le quiz, lui, utilise un Fisher-Yates correct l.167-170.)
5. **`IQTestRunner.tsx:40-45`** — un `useEffect` charge le dernier résultat dans une
   variable puis n'en fait rien (bloc `if` vide avec un commentaire).
6. **`OmnisearchModal.tsx:38-58`** — `useEffect` sans tableau de dépendances.

### 4.5 Le test de QI ne peut pas être vendu en l'état

C'est le point le plus important de cet audit, parce qu'il touche à la fois le produit,
l'éthique et le risque juridique.

**a. Le score n'est pas ce qu'il prétend être.**
`iqEngine.ts:59` : `const baseIQ = Math.round(75 + (weightedRate * 70))`. C'est une
**application linéaire**, commentée « Courbe Gaussienne standard : Moyenne = 100,
Écart-type = 15 » (l.57) — ce qu'elle n'est pas. Conséquences arithmétiques :
- Répondre **au hasard** (≈ 25 % sur 4 options) donne un QI d'environ **92**, qualifié
  de « Moyen ».
- Ne rien répondre du tout donne **75**.
- Un score parfait plafonne à 145.

Le percentile (l.65) est lui aussi linéaire : `weightedRate * 98 + 1`. Un percentile est par
définition une position dans une distribution ; celle-ci n'existe nulle part dans le code.
Et le certificat imprime « QI Standard (σ=15) » (`IQCertificate.tsx:129`) au-dessus de
chiffres qui n'ont pas d'écart-type.

**Vendre 500 FCFA un « Certificat Officiel d'Aptitude Cognitive » portant ces nombres est
indéfendable.** Le disclaimer présent (`IQResultsView.tsx:71-80`) est correctement rédigé,
mais il ne couvre pas un document appelé « officiel », « certifié », validé par un
« Comité d'Intelligence Artificielle & Psychométrie » (l.166) qui n'existe pas.

**b. Le plan d'entraînement « personnalisé » est une constante.**
`iqEngine.ts:136` : `generateTrainingPlan(improvements)` **ignore son paramètre**
(erreur TS6133 confirmée) et retourne toujours les mêmes 4 blocs. Il est vendu comme
« sur-mesure ciblant précisément vos dimensions » (`IQResultsView.tsx:418`).

**c. La banque d'items est trop petite pour le produit vendu.**
24 questions au total. Le mode Expert en annonce 25 et en sert 24 (`IQTestRunner.tsx:63`,
silencieusement clampé). Le mode Standard en tire 20 sur 24 : **deux passations
consécutives partagent ~83 % des questions.** Un abonnement « tests illimités » est
impossible sur cette base. Et 5 questions sur 24 seulement ont un rendu matriciel, alors
que le marketing promet « matrices de Raven vectorielles » et « 100 % SVG ».

**d. Le certificat promet ce qu'il ne fait pas.**
`IQResultsView.tsx:458` vend un « identifiant cryptographique unique et QR code
vérifiable ». Le composant (`IQCertificate.tsx`) affiche `result.id`, c'est-à-dire
`iq_res_<timestamp>_<5 caractères aléatoires>` généré côté client (`iqEngine.ts:112`).
Aucun QR code. Rien à vérifier, nulle part.

### 4.6 Le paiement est entièrement simulé

`PaymentModal.tsx:39` :
```js
await new Promise((resolve) => setTimeout(resolve, 1800));
```
C'est tout le « paiement ». Aucun appel réseau. Puis `unlockReport()` écrit dans
`localStorage` et le succès est **inconditionnel** — il ne peut pas échouer.

Autour de ce `setTimeout`, l'interface affiche : « Traitement sécurisé en cours »,
« Chiffrement SSL 256-bit » (l.280), « Paiement Instantané », les logos des quatre
opérateurs, un champ de téléphone dont la saisie n'est jamais transmise, et une promesse
de QR code Wave qui n'est pas rendu. Puis des confettis.

Le fichier est à supprimer, pas à refondre.

---

## 5. Synthèse : garder / refondre / supprimer

**Garder tel quel** — `main.tsx`, `types/iq.ts`, la structure de `netlify.toml`, le corpus
de données (`countries`, `quiz`, `knowledgeExtended`), le SEO d'`index.html` (à
re-paramétrer), la logique de `useQuizGame` (3 correctifs), `MatrixRenderer` et
`CognitiveRadarChart` (détokenisation + a11y).

**Refondre** — `App.tsx` (éclatement + vrai router), les 6 écrans, `iqEngine` (déplacé
serveur), `IQCertificate`, `OmnisearchModal`, `ErrorBoundary` (style).

**Supprimer** — `PaymentModal.tsx`, `NexusAITutor.tsx`, `ArticleView.tsx` +
`data/knowledge.ts`, les 3/4 de `paymentStorage.ts`, `dist/`, `dist.zip`, le bloc GA4,
`vite-plugin-singlefile`, `ParticleField`, et l'intégralité des utilitaires décoratifs de
`index.css` (`.bg-mesh`, `.glow-border`, `.text-gradient`, `.particle`, `.stagger-*`,
`animate-pulse-glow`). Argumenté ligne à ligne en §2.3 et repris comme décision n°6 dans
`PLAN.md`.

---

## 6. Ce que je retiens, en quatre phrases

1. **NEXUS est un produit d'évaluation cognitive** entouré d'un corpus de contenu gratuit
   qui lui sert d'acquisition — et c'est une bonne idée, mal exécutée.
2. **Les deux briques qui portent la valeur — le score et le paiement — sont l'une fausse
   et l'autre simulée.** Tout le reste du chantier passe après.
3. **Le problème de design n'est pas le violet, c'est l'absence de système** : 353
   couleurs codées en dur sur 9 familles, deux systèmes d'icônes, une palette qui échoue
   AA par construction.
4. **La performance a une cause unique et corrigible** : 260 kB de données statiques dans
   le chunk d'entrée à cause d'un seul import non paresseux.

---

Suite : [`PLAN.md`](./PLAN.md).
