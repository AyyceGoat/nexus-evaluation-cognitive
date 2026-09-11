# NEXUS

Évaluation des aptitudes cognitives, restituée avec sa marge d'erreur.

35 questions, environ 25 minutes, sans compte obligatoire. Le résultat est un indice
estimé accompagné de son intervalle de confiance à 95 %, d'un profil sur cinq aptitudes,
et d'un centile dont la population de référence est nommée. Si les réponses ne se
distinguent pas d'un tirage au hasard, **aucun score n'est affiché**.

---

## Démarrer

```bash
npm install
npm run dev            # http://localhost:5173
```

**Sans configuration, l'application démarre en mode développement local** : aucune
authentification réelle, rien n'est envoyé à un serveur, et un bandeau permanent le dit à
l'écran. C'est prévu, ce n'est pas une panne. Voir la section suivante.

---

## Variables d'environnement

Copier `.env.example` en `.env`. Le fichier `.env` est ignoré par Git.

| Variable | Où | Rôle |
|---|---|---|
| `VITE_SUPABASE_URL` | navigateur | URL du projet Supabase. Absente, l'adaptateur local prend le relais. |
| `VITE_SUPABASE_ANON_KEY` | navigateur | Clé publiable. Ce sont les politiques RLS qui protègent les données, pas le secret de cette clé. |
| `SUPABASE_SERVICE_ROLE_KEY` | **serveur seulement** | Contourne RLS. C'est elle qui permet au webhook de créer un droit d'accès. |
| `CINETPAY_API_KEY` | **serveur seulement** | Compte marchand. Voir `docs/PAIEMENT.md`. |
| `CINETPAY_SITE_ID` | **serveur seulement** | — |
| `CINETPAY_SECRET_KEY` | **serveur seulement** | Vérification HMAC du webhook. |
| `PAYMENT_PROVIDER` | serveur | `sandbox` ou `cinetpay`. |
| `PUBLIC_SITE_URL` | serveur | Construction des URL de retour de paiement. |

Rien de préfixé `VITE_` n'est secret : le préfixe inclut la valeur dans le bundle.

---

## Commandes

```bash
npm run dev                  # serveur de développement
npm run build                # typecheck puis build de production
npm run preview              # sert le build

npm run verifie              # typecheck + lint + tests + build, d'un coup
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint + garde-fou du système visuel
npm run test                 # 71 tests (vitest)

npm run verifie:contraste    # ratios WCAG de la palette, calculés
npm run verifie:design       # refuse toute couleur en dur dans un composant
npm run verifie:rendu        # ouvre les pages dans Chrome et mesure
npm run verifie:lighthouse   # Lighthouse mobile, réellement lancé
```

Les deux dernières exigent un `npm run preview` en cours et Chrome ou Edge installé :

```bash
npm run preview -- --port 4300
npm run verifie:rendu http://localhost:4300
npm run verifie:lighthouse http://localhost:4300 "/,/evaluation,/inscription"
```

---

## Architecture

```
src/
  app/            routage, gardes de route, contexte d'authentification
  components/
    iq/           passation, rapport, barre d'intervalle, profil par aptitude
    robot/        hero 3D : détection de capacité, scène, poster de repli
    ui/           primitives : Button, Field, Dialog, Panel, états
  data/
    iq/           banque de 120 items sur cinq aptitudes
  lib/
    backend/      port + implémentations Supabase et locale
    iq/           moteur 3PL, sélection, calibration, validité
    paiement/     PaymentProvider + sandbox + CinetPay
  pages/          écrans, tous en import dynamique sauf la landing
supabase/
  migrations/     schéma et politiques RLS
  functions/      Edge Functions (Deno) : création de paiement, webhook
scripts/          vérification : contraste, tokens, rendu, Lighthouse
docs/             AUDIT, PLAN, SCORING, DESIGN, 3D, PAIEMENT, JOURNAL, RETOUR
```

### Trois principes qui expliquent la structure

**Le score est calculé serveur.** Le client ne possède pas les paramètres d'items
calibrés et ne doit pas décider du résultat. En mode Supabase, `cloturerPassation`
appelle une fonction serveur qui recalcule à partir du journal des réponses.

**L'autorisation vit dans la base.** La table `entitlements` n'a **aucune politique
d'écriture** : aucun client ne peut s'accorder un droit d'accès. Une politique RLS ne peut
pas être oubliée par un écran ; une vérification écrite dans du code applicatif, si.

**Le système visuel est la seule source de vérité.** `scripts/verifie-tokens.mjs`, branché
sur `npm run lint`, refuse toute couleur, ombre ou dégradé codé en dur dans un composant.

---

## Déploiement

Le site est hébergé sur Netlify. Voir `docs/RETOUR.md` pour la marche à suivre complète.

```bash
npm run build
# puis, si la CLI Netlify est authentifiée :
netlify deploy --dir=dist            # aperçu sur une URL temporaire
netlify deploy --dir=dist --prod     # production
```

`netlify.toml` porte la commande de build, la redirection SPA et les en-têtes de sécurité.

---

## Configurer le paiement

Résumé ; le détail et les démarches sont dans `docs/PAIEMENT.md`.

1. Ouvrir un compte marchand CinetPay et le faire valider.
2. Relever `API_KEY`, `SITE_ID` et la clé secrète.
3. Déclarer l'URL de notification :
   `https://<projet>.supabase.co/functions/v1/webhook-paiement`.
4. Renseigner les secrets côté Supabase (Edge Functions → Secrets), jamais dans le dépôt.
5. Passer `PAYMENT_PROVIDER` à `cinetpay`.
6. Tester avec un vrai paiement de 100 FCFA avant d'ouvrir aux utilisateurs.

Sans compte marchand, le provider sandbox joue le flux complet — signature, idempotence,
TTL, six cas — sans déplacer d'argent.

---

## État mesuré

Lighthouse mobile, 3G rapide simulé, sur le build de production. Chiffres relevés, pas
estimés ; reproductibles par `npm run verifie:lighthouse`.

| Page | Perf. | Access. | Bonnes pratiques | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 100 | 2,48 s | 0,000 |
| `/evaluation` | 97 | 100 | 100 | 100 | 2,45 s | 0,000 |
| `/inscription` | 98 | 100 | 100 | 100 | 2,29 s | 0,000 |
| `/pays` | 99 | 100 | 100 | 100 | 2,12 s | 0,000 |
| `/quiz` | 98 | 100 | 100 | 100 | 2,27 s | 0,000 |

Bundle d'entrée : **91 ko gzip**, hors 3D. Le chunk de la scène (246 ko gzip) n'est
téléchargé qu'au premier signe d'interaction, sur un appareil jugé capable.

Aucun débordement horizontal de 320 à 2560 px, sur 8 pages et 7 largeurs.
Aucune cible tactile sous 44 px à 360 px. Focus visible sur tous les éléments testés.

**Ce qui n'a pas été vérifié est listé sans détour dans `docs/RETOUR.md` §5.**

---

## Documentation

| Fichier | Contenu |
|---|---|
| `docs/AUDIT.md` | État du code avant refonte, mesuré |
| `docs/PLAN.md` | Découpage en phases et décisions à trancher |
| `docs/SCORING.md` | Modèle 3PL, formules, limites, recalibration |
| `docs/DESIGN.md` | Palette avec contrastes, typographie, motion, wireframes |
| `docs/3D.md` | Robot : comportement, pipeline, sourcing de modèles |
| `docs/PAIEMENT.md` | Agrégateurs comparés, démarches, six cas |
| `docs/JOURNAL.md` | Journal de bord : blocages, décisions, désaccords |
| `docs/RETOUR.md` | **À lire en premier** : où en est le projet, comment vérifier |
