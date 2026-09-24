# Audit de sécurité — NEXUS

Audit du 23 septembre 2026, sur le projet Supabase réel et la preview Netlify.

Méthode : **tenter les violations**, pas relire le schéma. Une politique qu'on croit
écrite et un refus qu'on a constaté ne sont pas la même chose. Tout ce qui suit est
reproductible :

```bash
npm run verifie:schema    # le schéma appliqué correspond-il à ce qu'on croit
npm run verifie:rls       # 90 tentatives de violation, sur le projet réel
npm run verifie:auth      # chargement différé de l'authentification
npm run verifie:mobile    # 112 vérifications tactiles, deux tailles d'écran
npm run test              # 63 tests, dont la parité client/serveur du score
npm audit                 # dépendances
```

---

## 1. Alertes de l'Advisor Supabase

### 1.1 `v_classement` en SECURITY DEFINER — **corrigé**

**L'alerte avait raison, et je l'ai traitée plutôt que justifiée.**

Pourquoi la vue l'était : la table `classement` n'avait aucune politique de lecture,
afin que personne ne puisse lire `user_id` — le lien entre une ligne publique et un
compte. La vue devait donc s'exécuter avec les droits de son propriétaire pour voir
quoi que ce soit.

Pourquoi c'était un vrai problème : une vue en `SECURITY DEFINER` contourne les
politiques de l'appelant. La requête était figée et ne prenait aucun paramètre, donc
rien ne fuyait — mais la garantie reposait sur la relecture du corps de la vue, pas
sur le moteur. Toute évolution ultérieure en aurait fait un contournement silencieux.

Correctif : la vue repasse en `security_invoker = true`, la table reçoit une politique
de lecture publique, et le privilège `SELECT` est retiré sur la table entière puis
rendu **colonne par colonne**, en excluant `user_id` et `session_id`.

Ce que la vue expose exactement, constaté et non déclaré :

```
rang, pseudonyme, niveau, score, borne_basse, borne_haute, centile, aptitudes, passee_le
```

Vérifié par quatre tentatives distinctes, toutes refusées par le moteur :

| Tentative | Résultat |
|---|---|
| `select user_id from classement` (connecté) | refus : privilège de colonne |
| `select session_id from classement` (connecté) | refus |
| `select user_id from classement` (anonyme) | refus |
| `select * from classement` (anonyme) | refus, car l'étoile inclurait `user_id` |
| `select pseudonyme, score from classement` | autorisé — identique à la vue |

### 1.2 `touch_updated_at()` sans `search_path` fixé — **corrigé**

Une fonction dont le `search_path` reste mutable peut être détournée : un appelant qui
place un schéma devant `public` fait résoudre les noms non qualifiés vers ses propres
objets. Les sept autres fonctions du schéma fixaient déjà le leur ; celle-ci avait été
oubliée. Elle est passée à `search_path = ''` — son corps n'utilise que `now()`, qui
vit dans `pg_catalog`.

### 1.3 `auth.uid()` réévalué par ligne — **corrigé**

Alerte de performance. Écrit `auth.uid() = user_id`, l'appel est réévalué pour chaque
ligne examinée. Les six politiques concernées passent en `(select auth.uid())`, que
PostgreSQL reconnaît comme un sous-plan initialisé une fois. Les conditions sont
inchangées à la lettre — vérifié par les 90 tentatives de violation, qui donnent le
même résultat après.

### 1.4 Clés étrangères sans index — **corrigé**

Une clé étrangère sans index rend coûteuse toute suppression dans la table référencée.
Deux manquaient : `iq_responses.user_id` et `iq_session_items.item_id`. Les deux autres
étaient déjà couvertes par une contrainte d'unicité ou un index composite.

### 1.5 `iq_items` : RLS activée, aucune politique — **laissé tel quel, délibérément**

L'Advisor le signale en information. C'est **voulu** : cette table porte le corrigé, et
« aucune politique » signifie qu'aucun client ne lit la moindre ligne. Un commentaire
de table le dit désormais, pour qu'on ne « corrige » pas l'alerte en ajoutant une
politique de lecture.

### 1.6 Alertes d'authentification — **à vérifier par toi**

Je n'ai pas d'accès au tableau de bord de l'Advisor : la liste ci-dessus vient du jeu
de contrôles documenté de Supabase, appliqué au schéma réellement déployé. Les alertes
de niveau projet que je ne peux ni lire ni modifier depuis ici :

- **protection contre les mots de passe divulgués** : à activer dans
  Authentication → Policies si ton offre le permet ;
- **durée de validité des codes à usage unique** et **longueur du code** : ta
  configuration affiche déjà 8 signes, ce qui est au-dessus du défaut ;
- **options d'authentification à plusieurs facteurs** : TOTP est actif chez toi.

Si l'Advisor affiche autre chose, envoie-moi la liste : je la traiterai ligne par ligne.

---

## 2. Ce qui a été éprouvé, et comment

**90 tentatives de violation** sur le projet réel, avec une clé publique, comme
n'importe quel visiteur. Aucune n'a abouti.

### 2.1 Lire les données d'un autre

| Tentative | Refus par |
|---|---|
| Lire la passation d'autrui | politique RLS |
| Lire le profil d'autrui | politique RLS |
| Lire les réponses d'autrui | politique RLS |
| Lire les items administrés à autrui | politique RLS |
| Lire une passation sans compte | politique RLS |
| Demander les questions de la passation d'autrui | fonction serveur |
| Demander le corrigé de la passation d'autrui | fonction serveur |
| Clore la passation d'autrui | fonction serveur (404, message identique pour ne pas révéler l'existence) |

### 2.2 Accéder au corrigé

| Tentative | Refus par |
|---|---|
| Lire `iq_items` (connecté ou non) | RLS sans politique |
| Obtenir le corrigé d'une passation **ouverte** | fonction serveur |
| Trouver un énoncé ou une bonne réponse dans le bundle | absent : vérifié sur le fichier servi |

Le dernier point est le plus important : les énoncés et le corrigé ne sont plus dans
le JavaScript. Le serveur choisit les items, sert les énoncés, et ne sert la bonne
réponse qu'après la clôture.

### 2.3 Écrire un score

| Tentative | Refus par |
|---|---|
| Créer une passation avec un score | RLS : aucune politique d'INSERT |
| Modifier le score de sa passation | RLS : aucune politique d'UPDATE |
| Modifier la passation d'autrui | RLS |
| S'ajouter des items | RLS |
| Déclarer soi-même qu'une réponse est juste | privilège de colonne retiré, **et** déclencheur qui recalcule |
| Réécrire une réponse déjà donnée | RLS : aucune politique d'UPDATE |
| Répondre à un item non administré | RLS |
| Écrire une réponse au nom d'un autre | RLS |

### 2.4 Manipuler le classement

| Tentative | Refus par |
|---|---|
| S'insérer au classement | RLS : aucune politique d'INSERT |
| Modifier une ligne | RLS |
| Supprimer une ligne | RLS |
| Écrire au classement sans compte | RLS |
| Se rendre visible par un UPDATE direct du profil | privilège de colonne |
| Écrire son pseudonyme par un UPDATE direct | privilège de colonne |
| Prendre le pseudonyme d'un autre | index unique |
| Figurer au classement avec un compte anonyme | fonction serveur : adresse non confirmée |
| Publier une passation au score refusé | fonction serveur |

### 2.4 bis Publication au classement — deux défauts corrigés le 24 septembre 2026

Les deux sont des défauts de **cohérence**, non de confidentialité : rien ne fuitait,
rien ne pouvait être écrit indûment. Ils sont consignés ici parce qu'un système qui
répond « c'est fait » sans avoir rien fait est un problème de sécurité au sens large —
l'utilisateur ne peut plus se fier à ce que l'interface lui dit.

**Succès silencieux de `definir_visibilite_classement`.** La fonction posait
`classement_visible = true`, puis exécutait un `insert … select` sur la passation la
plus récente exploitable. Sans passation éligible, ce `select` ne rend aucune ligne :
l'`insert` n'insérait rien, aucune erreur n'était levée, la fonction rendait `void`, et
le client concluait au succès. Le consentement était enregistré, la publication non.

Correction : la condition d'éligibilité est vérifiée **avant** toute écriture et lève
une exception nommée, ce qui annule l'appel en entier — `classement_visible` reste donc
à sa valeur d'avant. Un `get diagnostics` contrôle ensuite le nombre de lignes écrites,
en ceinture. La condition est écrite une seule fois, dans
`public.a_une_passation_publiable()`, pour que le refus et la publication ne puissent
pas se désaccorder au fil des évolutions.

**Privilège implicite de `PUBLIC` sur la nouvelle fonction.** PostgreSQL accorde
`EXECUTE` à `PUBLIC` sur toute fonction nouvellement créée : le `grant execute … to
authenticated` qui accompagnait `a_une_passation_publiable()` ne refermait donc rien, et
`anon` pouvait l'appeler. Sans session, `auth.uid()` est nul et la fonction rend `false`,
donc rien ne fuitait — mais une fonction appelable par qui n'en a pas l'usage est une
surface qu'on ne garde pas. Les trois autres fonctions du schéma appliquaient déjà le
`revoke all … from public, anon` ; celle-ci l'avait manqué.

Trouvé par `scripts/verifie-classement.mjs`, et non par relecture : le script attendait
un refus et a obtenu `false`.

| Tentative | Refus par |
|---|---|
| Se rendre visible sans passation exploitable | fonction serveur : exception, appel annulé |
| Appeler `a_une_passation_publiable()` sans compte | `revoke all … from public, anon` |
| Lire `classement.user_id` | privilège de colonne |

### 2.5 Rejouer, forger, injecter

| Tentative | Résultat |
|---|---|
| Appeler la fonction de clôture deux fois | second appel : `dejaClose`, aucun recalcul, aucune republication |
| Appeler la fonction sans en-tête d'autorisation | HTTP 401 |
| Appeler la fonction avec la seule clé publique | HTTP 401 |
| Méthode GET sur la fonction | HTTP 405 |
| `sessionId` valant `' or 1=1 --` | refusé avant toute requête |
| `sessionId` valant `../../etc/passwd` | refusé |
| `sessionId` vide ou malformé | refusé |
| Passation de longueur 1, 7, 120, 10000, −5, nulle | refusée : trois longueurs autorisées |
| Pseudonyme vide, trop court, trop long, avec espace, ressemblant à une adresse | refusé par contrainte |
| Index de réponse hors bornes, durée négative | refusé par contrainte |
| Supprimer ses réponses, ses passations, son profil | refusé : aucune politique DELETE |

### 2.6 Session, en-têtes, redirections

| Point | État |
|---|---|
| Confirmation d'adresse obligatoire | vérifié : l'inscription n'ouvre aucune session, la connexion d'un compte non confirmé est refusée |
| Jeton de session | `localStorage`, via `@supabase/supabase-js`. Voir la réserve §4.2 |
| `Content-Security-Policy` | posée, chaque directive justifiée dans `netlify.toml` |
| `Strict-Transport-Security` | servi par Netlify, un an, sous-domaines compris, `preload` |
| `Permissions-Policy` | caméra, micro, position, paiement, USB refusés ; accéléromètre et gyroscope limités à l'origine |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Frame-Options` / `frame-ancestors` | `DENY` / `'none'` |
| Redirection ouverte | aucune : le retour après connexion vient de `location.state`, jamais d'un paramètre d'URL |
| Erreurs de console | aucune, sur neuf pages et deux tailles d'écran |

La politique de contenu a été vérifiée **en usage**, pas seulement posée : sans
l'origine `flagcdn.com` en `img-src`, les 195 drapeaux de la page Pays étaient
bloqués. Le défaut a été trouvé avant le déploiement, pas après.

### 2.7 Secrets

| Contrôle | Résultat |
|---|---|
| Jeton JWT dans les fichiers suivis | aucun |
| Clé `sb_secret_` ou `sb_publishable_` dans les fichiers suivis | aucune |
| Secret dans les 26 commits de l'historique | aucun |
| `.env` commité, même une fois | jamais |
| Clé de service dans le bundle servi | absente |
| Variables sur Netlify | deux, toutes deux `VITE_`, aucune sensible |
| `npm audit` | 0 vulnérabilité |

---

## 3. Tests ajoutés par cet audit

| Test | Ce qu'il empêche |
|---|---|
| Privilèges de colonne sur `classement` (4 cas) | qu'une future modification de la vue laisse fuir `user_id` |
| Suppressions refusées (4 cas) | qu'une politique DELETE apparaisse par inadvertance |
| Contraintes de longueur de passation (6 cas) | qu'on puisse demander 10 000 items, ou 7 |
| Contraintes de pseudonyme (6 cas) | qu'une adresse e-mail ou une phrase devienne un pseudonyme public |
| Contraintes sur les réponses (2 cas) | des données de calibration aberrantes |
| Usurpation d'identité en écriture | qu'on écrive au nom d'un autre |
| Clôture par un tiers | qu'on fabrique un score à quelqu'un, ou qu'on lise son corrigé |
| Appel sans autorisation, identifiants malformés (5 cas) | qu'un appel non authentifié ou une injection atteigne la base |
| Parité client/serveur du score | que les deux moteurs divergent sans que personne le voie |
| Dérive des couleurs de la scène 3D | que le robot rende des couleurs qui ne sont plus celles du produit |
| Dérive du corrigé serveur | qu'un index de bonne réponse décalé fausse tous les scores |

---

### 3 bis Contrôles ajoutés le 24 septembre 2026

`scripts/verifie-classement.mjs` — dix contrôles, avec la seule clé publique, donc
exécutables sans la clé de service et après n'importe quelle rotation de secrets :

- `v_classement` lisible sans compte, et `classement.user_id` refusé par le moteur ;
- `definir_visibilite_classement` et `a_une_passation_publiable` refusées à `anon` ;
- ouverture d'une session anonyme, et vérification qu'elle est bien marquée comme telle ;
- `a_une_passation_publiable()` rend `false` sans passation ;
- visibilité refusée à une adresse non confirmée ;
- le refus ne laisse **aucune trace** dans le profil — c'est le contrôle qui atteste que
  l'exception annule bien l'appel en entier.

## 4. Ce qui reste faible, et pourquoi

### 4.1 Les deux fonctions serveur ne sont pas typées à la compilation

`supabase/functions/cloturer-passation/index.ts` cible le runtime Deno : ni `tsc` ni
ESLint ne l'analysent, faute de pouvoir résoudre `Deno.env` et les imports `npm:`.
Son module de calcul, lui, **est** typé et couvert par le test de parité.

Pourquoi ça reste en l'état : installer Deno pour typer un seul fichier ajoute une
dépendance d'outillage à tout le projet. La commande est `deno check
supabase/functions/**/*.ts` si tu veux fermer ce trou.

### 4.2 Le jeton de session vit dans `localStorage`

C'est le comportement par défaut de `@supabase/supabase-js`, et il est vulnérable à un
script injecté : un XSS pourrait lire le jeton. La politique de contenu réduit
fortement ce risque — `script-src 'self'`, aucun script tiers, aucun `eval` — mais ne
l'annule pas.

L'alternative est un cookie `HttpOnly`, qui demande un intermédiaire serveur pour
l'échange de jetons. C'est un chantier à part, et il change l'architecture
d'authentification.

### 4.3 Aucune limitation de cadence propre à l'application

Un compte peut ouvrir des passations en boucle. Les limites en place sont celles de
Supabase (inscriptions, e-mails, requêtes), pas les nôtres. Rien ne plafonne le nombre
de passations par heure et par compte.

Ce n'est pas exploitable pour fausser un score — le classement ne retient qu'une ligne
par personne, la plus récente — mais c'est exploitable pour remplir la base. Le
correctif serait une contrainte dans `ouvrir_passation()`.

### 4.4 Le quiz de culture générale embarque ses réponses

Les 465 questions du quiz partent dans le navigateur avec leur bonne réponse. C'est
assumé : ce quiz ne produit aucun score, n'alimente pas le classement, et n'est pas
une mesure. La distinction avec l'évaluation est nette, mais elle mérite d'être dite.

### 4.5 Les comptes anonymes s'accumulent

Chaque passation « sans compte » crée un utilisateur anonyme. Rien ne les purge. Sur
l'offre gratuite, cela consommera le quota d'utilisateurs actifs mensuels avant l'espace
disque. Un travail planifié de suppression des comptes anonymes sans passation close
depuis trente jours serait la réponse.

### 4.6 La suppression de compte n'existe pas dans l'application

L'écran des paramètres dit que la demande se fait par courrier électronique. Ce n'est
pas une faille, mais c'est une obligation à laquelle le produit ne répond pas encore
par lui-même. Elle demande une fonction serveur avec la clé de service.

### 4.7 Ce que je n'ai pas pu vérifier du tout

- **Les liens reçus par e-mail** : confirmation d'adresse et réinitialisation de mot de
  passe. Je ne peux pas cliquer dans une boîte mail. Le refus d'un compte non confirmé
  est vérifié ; le parcours du lien lui-même ne l'est pas.
- **Safari iOS**, et le comportement d'un vrai clavier logiciel.
- **La fluidité sur un GPU de téléphone.** C'est précisément pourquoi la 3D est
  désactivée sur tactile : servir une animation dont je ne peux pas garantir la
  fluidité sur l'appareil où elle compte le plus serait un pari.
