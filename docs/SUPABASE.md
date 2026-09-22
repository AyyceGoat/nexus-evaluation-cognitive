# Mise en service de Supabase — pas à pas

À suivre dans l'ordre. Compter 30 à 40 minutes, dont une attente de deux minutes
pendant la création du projet.

Tout ce qui suit tient dans l'offre gratuite : deux projets, 500 Mo de base,
50 000 utilisateurs actifs par mois, 500 000 appels de fonction. Aucune carte
bancaire n'est demandée.

---

## Étape 1 — Créer le projet (5 min)

1. Aller sur **supabase.com**, cliquer **Start your project**, se connecter avec
   GitHub.
2. **New project**. Renseigner :

   | Champ | Valeur |
   |---|---|
   | Name | `nexus` |
   | Database Password | En générer un et **le coller dans un gestionnaire de mots de passe**. Il ne sert pas à l'application, mais il est irrécupérable. |
   | Region | **West EU (Ireland)** ou **Central EU (Frankfurt)** |
   | Plan | Free |

   Le choix de la région n'est pas neutre : depuis Abidjan, la latence vers
   l'Europe tourne autour de 60 à 90 ms, contre 130 à 160 ms vers l'est des
   États-Unis. C'est perceptible à chaque enregistrement de réponse.

3. Attendre la fin de la mise en service (environ deux minutes).

---

## Étape 2 — Appliquer le schéma (5 min)

Deux fichiers, **dans cet ordre**.

1. Dans le menu de gauche : **SQL Editor** → **New query**.
2. Ouvrir `supabase/migrations/20260921090000_schema.sql`, copier **tout** le
   contenu, le coller dans l'éditeur, cliquer **Run**.
   Résultat attendu : `Success. No rows returned`.
3. **New query** de nouveau. Ouvrir
   `supabase/migrations/20260921090100_banque_items.sql`, copier tout, coller,
   **Run**. Ce fichier insère les 120 items.
4. Vérifier :

   ```sql
   select count(*) from public.iq_items;
   ```

   Résultat attendu : **120**.

Si la première requête échoue à mi-parcours, la plus simple des reprises est de
supprimer le projet et d'en créer un autre : le schéma est conçu pour être appliqué
sur une base vierge.

---

## Étape 3 — Vérifier que la confirmation d'e-mail est exigée (2 min)

1. **Authentication** → **Sign In / Providers** → **Email**.
2. **Confirm email** doit être **activé**. C'est le réglage par défaut ; vérifiez-le
   tout de même, car sans lui l'inscription ouvre une session immédiatement et la
   condition « seuls les comptes confirmés figurent au classement » tombe.
3. **Authentication** → **URL Configuration** :

   | Champ | Valeur à saisir |
   |---|---|
   | Site URL | `https://nexus-evaluation-cognitive.netlify.app` |
   | Redirect URLs | Ajouter ces trois lignes, une par une : `https://nexus-evaluation-cognitive.netlify.app/**`, `http://localhost:5173/**`, `https://*--nexus-evaluation-cognitive.netlify.app/**` |

   La troisième ligne couvre les adresses de prévisualisation Netlify, qui portent
   un préfixe différent à chaque déploiement. Sans elle, un lien de confirmation
   ouvert depuis une preview est refusé.

**Sur les e-mails :** l'offre gratuite envoie les messages par un service partagé,
limité à **deux e-mails par heure**. C'est suffisant pour essayer, pas pour ouvrir au
public. Le jour où vous ouvrez, il faudra brancher un fournisseur SMTP
(**Project Settings** → **Authentication** → **SMTP Settings**) ; Resend et Brevo ont
tous deux une offre gratuite qui convient.

---

## Étape 4 — Relever les deux valeurs du navigateur (2 min)

**Project Settings** → **API**.

| Sur la page Supabase | Nom de la variable | Où la coller |
|---|---|---|
| **Project URL** (`https://xxxxxxxx.supabase.co`) | `VITE_SUPABASE_URL` | `.env` **et** Netlify |
| **Project API keys** → `anon` `public` | `VITE_SUPABASE_ANON_KEY` | `.env` **et** Netlify |

Ces deux valeurs partent dans le bundle envoyé au navigateur, et **c'est prévu**. La
clé `anon` identifie le projet sans rien autoriser : ce sont les politiques RLS qui
protègent les données. La voir dans le code source de la page n'est pas une fuite.

### En local

```bash
cp .env.example .env
```

Puis remplir les deux lignes :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<collez-la-cle-anon-ici>
```

`.env` est ignoré par Git. Vérifiable à tout moment :

```bash
git check-ignore -v .env
```

### Sur Netlify

**Site configuration** → **Environment variables** → **Add a variable** →
**Add a single variable**, deux fois :

| Key | Value | Scopes |
|---|---|---|
| `VITE_SUPABASE_URL` | l'URL du projet | All |
| `VITE_SUPABASE_ANON_KEY` | la clé `anon` | All |

Ces variables sont lues **à la compilation**. Après les avoir ajoutées, il faut
relancer un déploiement pour qu'elles prennent effet : un site déjà construit ne les
voit pas.

---

## Étape 5 — La clé `service_role` : ce qu'il faut en faire, et surtout pas

Sur la même page **API**, sous `anon`, se trouve la clé **`service_role`**. Elle
**contourne toutes les politiques RLS**. Elle équivaut à un accès administrateur
complet à la base.

**Elle ne doit jamais :**

- figurer dans le code ;
- être commitée, même dans un fichier d'exemple ;
- être préfixée `VITE_` — le préfixe l'inclurait dans le bundle public ;
- être déclarée dans les variables d'environnement **Netlify**.

**Elle n'a besoin d'être nulle part.** Les Edge Functions Supabase la reçoivent
automatiquement dans leur environnement, sous le nom `SUPABASE_SERVICE_ROLE_KEY` :
vous n'avez aucune variable à créer pour elles.

Le seul cas où vous la collerez vous-même est le script de vérification des règles
d'accès (étape 7), qui a besoin de créer des comptes de test confirmés. Vous la
mettrez alors dans `.env`, qui est ignoré par Git, et vous l'en retirerez ensuite.

Si elle a fui, la rotation se fait en un clic : **Project Settings** → **API** →
**Generate new `service_role` key**.

---

## Étape 6 — Déployer la fonction de clôture (10 min)

C'est elle qui calcule les scores. Sans elle, une passation reste ouverte et aucun
résultat n'est enregistré.

### Option A — Sans rien installer, par le tableau de bord

1. **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nom de la fonction : exactement `cloturer-passation`.
3. L'éditeur propose un fichier `index.ts`. Remplacer tout son contenu par celui de
   `supabase/functions/cloturer-passation/index.ts`.
4. Ajouter un second fichier nommé exactement `scoring.ts` (bouton **+** dans
   l'arborescence de l'éditeur), et y coller le contenu de
   `supabase/functions/cloturer-passation/scoring.ts`.
5. **Deploy function**.

Les deux fichiers sont nécessaires : `index.ts` importe `./scoring.ts`.

### Option B — Avec la CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref <la-reference-de-votre-projet>
supabase functions deploy cloturer-passation
```

La référence du projet est la partie `xxxxxxxx` de l'URL, et figure aussi dans
**Project Settings** → **General** → **Reference ID**.

### Vérifier

**Edge Functions** → `cloturer-passation` → **Logs**. Après votre première passation
complète, une invocation `200` doit y apparaître. Un `401` signifie que l'appel est
parti sans session ; un `500` que les variables d'environnement manquent — mais elles
sont injectées automatiquement, donc ce cas ne devrait pas se produire.

---

## Étape 7 — Vérifier les règles d'accès (5 min)

Ce script ne relit pas le schéma : il se connecte comme un visiteur et **essaie de
tricher**. Écrire un score à la main, s'inscrire au classement, lire les données d'un
autre, lire le corrigé.

1. Ajouter temporairement la clé `service_role` dans `.env` :

   ```
   SUPABASE_SERVICE_ROLE_KEY=<collez-la-cle-service_role-ici>
   ```

   Elle sert uniquement à créer et supprimer les comptes de test.

2. Lancer :

   ```bash
   npm run verifie:rls
   ```

   Attendu : **toutes les vérifications passées**, et la ligne
   `X/X vérifications passées`. Toute ligne `ECHEC` signale une écriture ou une
   lecture qui aurait dû être refusée : il faut la corriger avant d'ouvrir le site.

3. **Retirer la clé de `.env`** une fois le script passé.

Les comptes de test sont supprimés par le script lui-même, y compris s'il échoue en
cours de route.

---

## Étape 8 — Essayer pour de vrai (10 min)

```bash
npm run build
npm run preview
```

1. Créer un compte avec une adresse à laquelle vous avez réellement accès.
2. Attendu : l'écran « Vérifiez votre boîte mail ». **Aucune session n'est ouverte.**
3. Essayer de se connecter sans avoir cliqué le lien. Attendu : refus explicite, avec
   un bouton de renvoi.
4. Ouvrir le lien reçu, puis se connecter.
5. Passer l'évaluation. À la fin, le score affiché est d'abord celui calculé dans le
   navigateur, puis il est **remplacé** par celui du serveur. Les deux doivent être
   identiques : c'est ce que garantit le test de parité (`npm run test`).
6. **Paramètres** → choisir un pseudonyme → **Figurer au classement**.
7. Ouvrir `/classement` dans une fenêtre privée, sans compte. Votre pseudonyme doit y
   être, votre adresse e-mail nulle part.
8. **Me retirer du classement** : la ligne doit disparaître.

---

## Ce qui reste à faire un autre jour

- **Un fournisseur SMTP**, avant toute ouverture au public : deux e-mails par heure
  ne suffisent pas.
- **La suppression de compte depuis l'application.** Elle demande une fonction
  serveur avec la clé de service ; l'écran des paramètres dit aujourd'hui que la
  demande se fait par courrier électronique.
- **Le référentiel empirique des percentiles.** Tant que 300 passations complètes ne
  sont pas enregistrées, le rapport situe le résultat sur une distribution théorique,
  et il le dit explicitement.
