# RETOUR — où en est NEXUS

Session autonome du 10 au 11 septembre 2026. À lire en premier.

---

## 1. En une page

**Les cinq phases sont terminées.** Phases 3 à 7 : système de couleur, comptes,
paiement, landing et robot, finition et vérification.

**Ce qui est fini et vérifié dans un navigateur réel**

- Le **système visuel** existe pour la première fois : palette de six couleurs aux
  contrastes calculés, échelle typographique, rayons, élévations, motion. Plus une seule
  valeur de couleur en dur dans un composant, et un garde-fou refuse la prochaine.
- Le **parcours complet** fonctionne : inscription → onboarding → tableau de bord →
  évaluation de 35 questions → refus de score sur réponses aléatoires → rapport →
  paiement sandbox → rejet d'un webhook non signé → succès → rejeu sans double crédit →
  corrections et attestation débloquées → transaction à l'historique → déconnexion.
  **36 vérifications sur 36**, en cliquant réellement (`npm run verifie:parcours`).
- **Lighthouse mobile** atteint toutes les cibles sur cinq pages : performance ≥ 97,
  accessibilité **100**, bonnes pratiques 100, SEO 100, CLS **0,000**, LCP < 2,5 s.
- **Aucun débordement horizontal** de 320 à 2560 px, sur 8 pages × 7 largeurs.
  Aucune cible tactile sous 44 px. Focus visible partout.
- Le site est **parfait sans WebGL** : 0 canvas, le poster SVG prend le relais, tout le
  texte est là.
- **Le paiement** : couche d'abstraction, provider sandbox complet, squelette CinetPay
  avec la vérification HMAC réelle. Six cas couverts par 27 tests.
- **71 tests** au total. `typecheck`, `lint`, `build` verts.

**Ce qui est partiel**

- **Supabase n'a jamais tourné.** Ni CLI ni Docker sur la machine. Schéma, politiques RLS,
  client typé et deux Edge Functions sont écrits en entier, **jamais exécutés**.
  L'application tourne grâce à un adaptateur local, annoncé par un bandeau permanent.
- **CinetPay n'a jamais été appelé.** Aucun compte marchand, aucune clé.
- **Le robot a été regardé et repris cinq fois.** Chrome était installé : j'ai rendu la
  page, constaté qu'il était quasi invisible puis mal cadré puis trop trapu, et corrigé à
  chaque fois. La version livrée lit comme un buste. **Mais son mouvement n'a pas été
  observé** : une capture est fixe.
- **Aucun modèle GLB n'est livré.** Trois candidats sont sourcés avec des chiffres
  vérifiés par API dans `docs/3D.md`. Le repli procédural est le livrable de la v1, comme
  tu l'avais accepté.

**Ce qui n'a pas pu être fait**

- **Aucun deploy preview.** La CLI Netlify n'est ni installée ni authentifiée. Comme
  demandé, je n'ai pas cherché à contourner.
- **Rien n'est mergé sur `main`.** Ta règle est qu'aucun merge ne se fait sans preview
  validé. `main` porte donc toujours l'état d'avant la refonte : **la production ne
  risque rien.** Les six branches de phase attendent ta relecture, la dernière étant
  `refonte/08-corrections-visuelles`.
- **Rien n'est poussé.** Il n'y a pas de dépôt distant : cela demande tes accès GitHub.

---

## 2. Vérifier en 20 minutes

À suivre dans l'ordre, sans réfléchir.

### Étape 1 — Voir le travail (2 min)

```bash
cd "C:\Users\HP\Desktop\building-immersive-knowledge-platform (2)"
git log --oneline
git branch
```

**Attendu :** neuf commits, et six branches dont `main`. `main` est intact.

```bash
git checkout refonte/08-corrections-visuelles
```

### Étape 2 — Les quatre gates (3 min)

```bash
npm install
npm run verifie
```

**Attendu :** typecheck silencieux, lint qui affiche
`Systeme visuel : aucune valeur en dur` plus une dérogation, **71 tests passés**, build
réussi. Aucun avertissement.

### Étape 3 — Le parcours complet, automatisé (4 min)

```bash
npm run build
npm run preview -- --port 4300
```

Puis, dans un second terminal :

```bash
npm run verifie:parcours http://localhost:4300
```

**Attendu :** `36/36 vérifications passées`, et `AUCUNE` erreur de console. Les captures
de chaque étape sont écrites dans `verification/`.

### Étape 4 — Lighthouse (4 min)

```bash
npm run verifie:lighthouse http://localhost:4300 "/,/evaluation,/inscription,/pays,/quiz"
```

**Attendu :** `OK` sur les quatre catégories des cinq pages, CLS à `0.000`, LCP sous
2,50 s.

*Sous Git Bash, préfixe la commande par `MSYS_NO_PATHCONV=1` : sinon les chemins avec un
slash initial sont réécrits en chemins Windows.*

### Étape 5 — Le responsive et le focus (2 min)

```bash
npm run verifie:rendu http://localhost:4300
```

**Attendu :** `AUCUN` débordement sur 56 combinaisons, `AUCUNE` cible sous 44 px,
`VISIBLE` sur les huit tabulations, et sans WebGL : `canvas: 0`, `svgPoster: 1`.

### Étape 6 — À l'œil, dans ton navigateur (5 min)

Ouvre `http://localhost:4300`.

1. **La landing.** Bouge la souris : le robot doit apparaître après un fondu et suivre le
   curseur avec du retard. **C'est le point à juger** — j'ai vu son apparence sur capture
   et l'ai corrigée cinq fois, mais jamais son mouvement.
2. **Survole le bouton « Commencer l'évaluation ».** Le regard du robot doit s'y porter.
3. **Réduis la fenêtre à 360 px de large.** Rien ne doit déborder.
4. **Active « réduire les animations »** dans les réglages système. Recharge : le robot
   doit se figer, sans boucle de rendu.
5. **Passe l'évaluation en cliquant au hasard.** Attendu : *« Aucun score ne peut être
   calculé »*, avec le nombre de bonnes réponses face à celui attendu par hasard. C'est le
   comportement central du produit.
6. **Crée un compte**, va sur un rapport, clique « Débloquer pour 500 XOF ». Sur l'écran
   de paiement, essaie **« Envoyer sans signature »** : rien ne doit se débloquer. Puis
   **« Simuler un succès »**, puis **« Rejouer le webhook »** : le rejeu ne doit rien
   créditer deux fois.
7. **Désactive WebGL** (`chrome://flags` → WebGL → Disabled) et recharge la landing : le
   poster SVG doit s'afficher et la page rester complète.

---

## 3. Ce que tu dois faire toi-même

Par ordre de priorité, avec le temps que ça prend.

| # | À faire | Temps | Pourquoi je ne peux pas |
|---|---|---|---|
| 1 | **Relire et merger les branches** après avoir suivi le §2 | 30 min | Ta règle : aucun merge sans preview validé |
| 2 | **Créer le dépôt distant et pousser** | 10 min | Demande tes accès GitHub |
| 3 | **Lier Netlify au dépôt** (Site settings → Build & deploy → Link repository) | 10 min | Demande ton dashboard Netlify |
| 4 | **Regarder le robot bouger** et décider : garder le procédural, ou prendre un des trois modèles de `docs/3D.md` | 15 min | Une capture ne montre pas le mouvement |
| 5 | **Créer le projet Supabase**, appliquer la migration, renseigner les deux variables | 45 min | Demande un compte |
| 6 | **Écrire les deux Edge Functions de lecture** (`cloturer-passation`, `lire-rapport`) | 2 h | Elles supposent le projet créé pour être testées |
| 7 | **Ouvrir le compte marchand CinetPay** et relever les trois clés | 1 h + validation | Demande ton identité et tes documents |
| 8 | **Relire l'ordre des 16 champs du HMAC** sur la doc officielle | 15 min | `docs.cinetpay.com` ne résout pas depuis cette machine |
| 9 | `deno check supabase/functions/**/*.ts` | 15 min | Deno n'est pas installé ; ces fichiers ne sont ni typecheckés ni lintés |
| 10 | **Décider pour Google Analytics** : un vrai identifiant, ou rien | 10 min | Le bloc mort a été retiré |

### Détail de l'étape 5, Supabase

```bash
# 1. Créer le projet sur supabase.com, région Europe (Paris ou Irlande) :
#    la latence depuis Abidjan y est d'environ 60 à 90 ms, contre 130 à 160 vers us-east.

# 2. Appliquer le schéma : SQL Editor, puis coller le contenu de
#    supabase/migrations/20260910120000_schema_initial.sql

# 3. Relever l'URL et la clé anon dans Project Settings > API, puis :
cp .env.example .env
#    renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Relancer : le bandeau « Mode développement local » doit DISPARAITRE.
npm run dev
```

Si le bandeau disparaît, l'adaptateur Supabase est actif. Il n'a jamais tourné : attends-toi
à corriger des détails.

---

## 4. Décisions prises à ta place — à valider ou annuler

Toutes sont réversibles, sauf mention contraire.

| # | Décision | Pourquoi | Comment annuler |
|---|---|---|---|
| 1 | **Accent turquoise désaturé `#5FB3A8`** | Il fallait un accent hors violet, hors vert acide, hors vermillon. Encre d'instrument, 8,50 de contraste sur le noir. | Une ligne dans `src/index.css` |
| 2 | **Sur fond accent, texte noir** | Calcul : `craie` sur `mesure` = 2,17, échec AA. `noir` = 8,50. | Non négociable : le garde-fou le refuse |
| 3 | **Chiffres en Public Sans, titres en Bricolage** | Public Sans est dessinée pour les formulaires administratifs. **Je n'ai pas pu voir le rendu.** | Deux lignes dans `index.css` |
| 4 | **Radar en étoile supprimé**, remplacé par des bandes sans chiffre | Erreur type par aptitude de 0,619, soit 36 points d'intervalle : un sous-score chiffré serait du bruit. Ta contrainte de Phase 3. | `AptitudeProfile.tsx` |
| 5 | **react-router installé, URL francisées** | L'ancien routage ne permettait ni garde, ni retour à la page demandée, ni 404. Anciennes URL redirigées. | Lourd à annuler |
| 6 | **Nexus AI supprimé sans reste** | Ta décision 6. | `git revert` du commit de Phase 4 |
| 7 | **La landing n'est pas en import paresseux** | En 3G, son chargement différé faisait sauter le pied de page : CLS de 0,484 pour une cible de 0,1. Elle pèse 4 ko. | Une ligne dans `main.tsx` |
| 8 | **Le canvas 3D se monte au premier mouvement de souris**, ou après 3,2 s | three.js représente 627 ms de travail sur le fil principal. Pendant le chargement, il faisait tomber la performance à 53. | `DELAI_MONTAGE_MS` dans `RobotHero.tsx` |
| 9 | **Repli statique en SVG, pas en WebP** | Aucun navigateur ici pour rendre puis exporter la scène. Un WebP aurait été une image inventée. Le SVG pèse moins de 2 ko et suit le thème. | `PosterRobot.tsx` |
| 10 | **TTL de paiement à 30 min, rate limiting à 5 par 10 min** | Assez long pour un paiement USSD, assez court pour qu'un webhook tardif ne crédite pas un rapport déjà repayé. | Constantes de `src/lib/paiement/types.ts` |
| 11 | **Google Analytics retiré** | Identifiant `G-XXXXXXXXXX` et garde empêchant l'initialisation : ce code n'a jamais rien envoyé. | À rebrancher avec un vrai identifiant |
| 12 | **`maximum-scale=5.0` retiré du viewport** | Plafonner le zoom est un défaut d'accessibilité. | Une ligne dans `index.html` |
| 13 | **`public/llms.txt` ajouté** | Audit Lighthouse en échec sans lui. Décrit le produit et la méthode. | Supprimer le fichier |
| 14 | **`.gitattributes` en fin de parcours** | Normalise les fins de ligne. Ajouté en Phase 7 pour ne pas polluer les diffs des phases précédentes. | Supprimer le fichier |

---

## 5. Ce que je n'ai pas pu vérifier

Sans euphémisme.

1. **Le mouvement du robot n'a pas été observé.** Son apparence, oui : cinq rendus, cinq
   corrections, captures dans `verification/`. Mais une capture est fixe — le suivi du
   curseur, le clignement, la respiration et le regard vers le CTA ne s'y voient pas. Le
   ressort est vérifié par neuf tests numériques ; le rendu du mouvement, par rien.
   **C'est la première chose à regarder**, et cela prend dix secondes : ouvre la landing
   et bouge la souris.
2. **Je n'ai pas d'avis sur le goût.** Le buste ne ressemble plus à un jouet, ce qui était
   la contrainte. S'il te déplaît quand même, `docs/3D.md` §1 donne trois modèles de
   remplacement avec des chiffres vérifiés.
3. **`deviceorientation` et le flux d'autorisation iOS n'ont pas été testés.** Aucun
   appareil mobile réel.
4. **La détection de capacité n'a pas été exercée sur un appareil d'entrée de gamme.**
   Le chemin sans WebGL, lui, est vérifié.
5. **Supabase n'a jamais tourné.** Le schéma n'a jamais été appliqué, les politiques RLS
   jamais évaluées, l'adaptateur jamais exécuté contre un vrai serveur. Attends-toi à des
   ajustements.
6. **CinetPay n'a jamais été appelé.** Les 27 tests valident le code contre ses propres
   suppositions, ce qui n'est pas la même chose que le valider contre le service. **Le
   point de défaillance le plus probable est l'ordre des 16 champs du HMAC** : s'il est
   faux, tous les webhooks seront rejetés.
7. **Les deux Edge Functions ne sont ni typecheckées ni lintées.** Elles ciblent Deno et
   sont exclues du périmètre. Ce sont les seuls fichiers du dépôt que rien ne vérifie.
   J'y ai déjà trouvé un bug par relecture : le verrou d'idempotence écrivait un statut
   absent de l'énumération.
8. **Aucun lecteur d'écran.** L'accessibilité à 100 sur Lighthouse est un audit
   automatisé : il attrape les contrastes, les libellés et l'ordre des titres, pas la
   qualité de l'expérience au lecteur d'écran.
9. **Aucun test sur navigateur réel autre que Chrome.** Ni Firefox, ni Safari, ni un
   Android d'entrée de gamme.
10. **Le mode local n'est pas une authentification.** Le parcours vérifié en §2 passe par
    lui : il prouve que les écrans, les gardes de route et le flux de paiement
    s'enchaînent, pas que l'authentification est sûre — elle ne l'est pas, et le bandeau
    le dit.
11. **La recalibration n'a aucune matière.** Les fonctions existent et sont testées sur
    données synthétiques. Aucune passation réelle n'a jamais été enregistrée.
12. **Aucun des trois modèles Sketchfab n'a été ouvert.** Chiffres vérifiés par API,
    apparence non.

---

## 6. Commandes de déploiement, prêtes à copier

**La CLI Netlify n'est ni installée ni authentifiée sur cette machine.** Aucun deploy
preview n'a donc été produit, et rien n'a été déployé.

### Une fois les branches relues et mergées

```bash
cd "C:\Users\HP\Desktop\building-immersive-knowledge-platform (2)"

# 1. Merger les phases dans l'ordre, après avoir validé chacune.
git checkout main
git merge --no-ff refonte/03-design-system
git merge --no-ff refonte/04-auth
git merge --no-ff refonte/05-paiement
git merge --no-ff refonte/06-landing-robot
git merge --no-ff refonte/07-finition
git merge --no-ff refonte/08-corrections-visuelles

# 2. Vérifier une dernière fois sur main.
npm run verifie
```

### Dépôt distant

```bash
git remote add origin https://github.com/<ton-compte>/nexus.git
git push -u origin main
git push origin --all
```

### Déploiement Netlify

```bash
npm install -g netlify-cli
netlify login          # ouvre le navigateur
netlify link           # rattacher au site existant

npm run build

# Aperçu sur une URL temporaire — À FAIRE EN PREMIER.
netlify deploy --dir=dist

# Production, seulement après avoir validé l'aperçu.
netlify deploy --dir=dist --prod
```

**Mieux encore :** lie le dépôt à Netlify (§3 étape 3). Chaque pull request produit alors
son propre deploy preview, et `main` déploie en production automatiquement. C'est la
méthode que le plan prévoyait depuis le début.

### Variables à déclarer côté Netlify

Site settings → Environment variables :

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Les secrets serveur (`SUPABASE_SERVICE_ROLE_KEY`, les trois clés CinetPay) se déclarent
côté **Supabase**, dans Edge Functions → Secrets. Jamais sur Netlify, jamais dans le dépôt.

---

## 7. Un dernier mot

Ce rapport dit **cinq phases sur cinq terminées, et douze choses non vérifiées**. Les deux
moitiés comptent autant.

Le produit fait maintenant ce qu'il annonce : il mesure, il montre sa marge d'erreur, et
il refuse de donner un chiffre quand il n'a rien mesuré. Le faux paiement a disparu, le
score linéaire a disparu, le certificat ne se dit plus officiel. C'était l'essentiel.

Ce qui reste est surtout de la mise en service : trois comptes à ouvrir, un modèle 3D à
regarder, et un ordre de champs à relire dans une documentation que je n'ai pas pu
atteindre. Rien de cela ne demande de redéfaire quoi que ce soit.

Le journal de bord (`docs/JOURNAL.md`) contient le détail de chaque blocage et de chaque
désaccord, dans l'ordre où ils sont survenus.
