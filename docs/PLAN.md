# PLAN — Refonte NEXUS

Fait suite à [`AUDIT.md`](./AUDIT.md). Rien de ce document n'est engagé tant que les
décisions du §4 ne sont pas tranchées.

---

## 1. Le blocage à lever avant toute chose

**Git n'est pas installé sur cette machine et le projet n'est pas un dépôt Git.**

La méthode de travail demandée — une branche par phase, commits atomiques, deploy previews
Netlify pour valider avant merge, production jamais cassée — repose entièrement sur Git.
Aucune de ces garanties n'est disponible aujourd'hui. Si je modifiais le code maintenant,
je modifierais directement les fichiers qui produisent la production, sans historique et
sans retour arrière.

Ce qu'il faut, dans l'ordre :

1. Installer Git (`winget install --id Git.Git -e`).
2. `git init`, ajouter un `.gitignore` (`node_modules/`, `dist/`, `.env`, `*.zip`),
   commit initial de l'état actuel — ce commit devient le point de retour.
3. Créer le dépôt distant (GitHub) et le pousser.
4. Lier le site Netlify existant à ce dépôt (Site settings → Build & deploy → Link
   repository), avec `main` comme branche de production. Les deploy previews s'activent
   alors automatiquement sur chaque pull request.

**Les points 3 et 4 nécessitent tes accès** (compte GitHub, dashboard Netlify) : je peux
préparer les commandes, pas les exécuter à ta place. Tant que ce n'est pas fait, je peux
produire de la documentation mais pas modifier le code en sécurité.

Un détail à vérifier de ton côté au moment du lien : le site déployé aujourd'hui l'a
probablement été par glisser-déposer d'un dossier (`dist.zip` traîne à la racine du
projet). Lier le dépôt changera le mode de déploiement — c'est ce qu'on veut, mais il faut
s'assurer que le premier build Netlify passe avant de basculer.

---

## 2. Les phases

Une branche par phase. Chaque phase se termine par `typecheck` + `lint` + `build` verts, une
preview Netlify à valider, et un résumé court : ce qui a changé, ce qui reste, ce qui est cassé.

### Phase 0 — Fondations du chantier
`refonte/00-fondations` · **aucun changement visible pour l'utilisateur**

Rendre le projet vérifiable avant de le modifier.

- Git + `.gitignore` + dépôt distant + lien Netlify (§1).
- Corriger `tsconfig.json:20` (`ignoreDeprecations` invalide) — sans quoi rien n'est vérifiable.
- Ajouter ESLint (flat config) + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y`,
  Prettier, et les scripts `typecheck`, `lint`, `format`, `test`.
- Corriger les 60 erreurs de type, dont `OmnisearchModal.tsx:138` (`country.flag` →
  `country.flagCode`) : **c'est un bug visible en production, il part tout de suite.**
- Supprimer `dist/`, `dist.zip`, le bloc GA4 mort, `vite-plugin-singlefile`.
- Installer Vitest + Testing Library + Playwright (structure vide, pas de tests encore).
- Durcir les en-têtes Netlify (CSP, HSTS, Permissions-Policy).

*Fin de phase : le projet se typecheque, se lint et se build proprement pour la première fois.*

### Phase 1 — Direction artistique
`refonte/01-design-system` · **livrable : `docs/DESIGN.md`, puis les tokens**

`DESIGN.md` d'abord, validé, avant la moindre ligne d'interface : palette (5-6 hex nommés,
rôles, ratios AA **calculés**), typographie (échelle complète), espacement / rayons /
élévations, motion (durées, courbes, règle du quand-animer), wireframes ASCII de la landing
et du dashboard, et la phrase qui dit ce qui rend NEXUS reconnaissable.

Puis, seulement ensuite :
- Réécriture du bloc `@theme` de `index.css`. Suppression de `.bg-mesh`, `.glow-border`,
  `.text-gradient`, `.text-gradient-gold`, `.particle`, `.stagger-*`, `animate-pulse-glow`,
  `animate-float`.
- Auto-hébergement des polices (`woff2`, `preload`, `font-display: swap`) — fin de la
  requête bloquante vers Google Fonts.
- Primitives : `Button`, `Field` (label + erreur + `aria-describedby`), `Dialog` (piège de
  focus, Échap, restauration du focus, blocage du scroll), `Skeleton`, `EmptyState`,
  `ErrorState`.
- `prefers-reduced-motion` traité globalement.
- Un seul système d'icônes. Les emojis structurels disparaissent.

*Contrainte : aucune valeur de couleur, d'espacement ou de rayon en dur dans un composant,
à partir de cette phase et pour toujours. Une règle ESLint le vérifie.*

### Phase 2 — Landing et coquille applicative
`refonte/02-landing`

- `react-router` remplace le routing manuel. Vraies balises `<a>`, vraie 404, restauration
  de scroll, `<title>`/meta par route.
- Nouvelle landing (sans le canvas 3D, qui arrive en phase 3 : un `poster` statique tient
  la place).
- Nouvelle nav, nouveau pied de page. `App.tsx` éclaté.
- **Éradication du violet et des 233 autres couleurs en dur** sur tout ce qui est touché.
- Suppression de `ParticleField`.
- Découpage des données : `OmnisearchModal` en import dynamique, index de recherche séparé
  et léger. **Objectif chiffré : chunk d'entrée sous 120 kB gzip** (contre 150 aujourd'hui).

### Phase 3 — Le robot 3D
`refonte/03-robot` · **livrable : `docs/3D.md`**

- Géométrie procédurale de repli d'abord : buste robotique en primitives, matériaux PBR
  sombres, une arête lumineuse. Le composant est utilisable et fini sans aucun GLB.
- `@react-three/fiber` + `@react-three/drei`, prop `modelUrl` pour brancher n'importe quel
  GLB sans toucher à la logique d'interaction.
- Interpolation par ressort (`maath/easing`), jamais d'affectation directe de rotation.
- Comportements : suivi du curseur amorti, buste à ~30 % de l'angle de la tête, inertie,
  retour à la pose neutre après 4 s, respiration, clignement irrégulier, regard vers le CTA
  au survol.
- `prefers-reduced-motion` → pose fixe, pas de boucle. Mobile → `deviceorientation` puis
  toucher puis animation autonome, `dpr` réduit, ombres coupées. Détection de capacité
  (`hardwareConcurrency`, échec du contexte WebGL) → rendu WebP statique.
- Import dynamique, `frameloop="demand"`, `IntersectionObserver`.
- **Le LCP ne doit pas dépendre du modèle.** Vérifié, pas supposé.

### Phase 4 — Backend, comptes, parcours
`refonte/04-auth`

- Projet Supabase (sous réserve de la décision n°1), schéma + RLS :
  `profiles`, `subscriptions`, `transactions`, `iq_results`, `iq_answers`, `iq_items`.
- Inscription, connexion, mot de passe oublié, vérification e-mail.
- Onboarding en 3 étapes maximum, passable.
- Routes protégées, redirection vers la connexion, **retour à la page demandée après
  connexion**.
- `.env.example` documenté. Aucune clé secrète dans le bundle.

### Phase 5 — Le test de QI, refondu
`refonte/05-iq`

La phase la plus importante, et celle qui conditionne le droit de vendre.

- **Le calcul de score passe côté serveur** et devient honnête : abandon de la formule
  linéaire, normalisation sur une distribution explicite, correction pour le hasard,
  intervalle de confiance affiché comme tel. Le mot « officiel » disparaît du certificat ;
  la formulation devient exacte et le disclaimer devient structurel, pas décoratif.
- **Élargissement de la banque d'items** : 24 → 120 minimum, dont une majorité de matrices.
  Sans ça, « tests illimités » n'est pas un argument commercial mais un mensonge.
- Correctifs de chronométrage et de mélange (`AUDIT.md` §4.4).
- Plan d'entraînement réellement dérivé des dimensions faibles.
- Certificat à identifiant vérifiable côté serveur (page publique `/verify/:id`).
- Les droits d'accès sont vérifiés **serveur**. Plus rien dans `localStorage` n'autorise quoi que ce soit.
- Le radar sort du flou et devient gratuit.

### Phase 6 — Paiement
`refonte/06-paiement` · **livrable : `docs/PAIEMENT.md`**

- `PAIEMENT.md` : comparatif chiffré des agrégateurs, démarches d'ouverture de compte
  marchand pas à pas, recommandation argumentée. Les tarifs seront revérifiés sur la
  documentation vivante au moment de la rédaction.
- Interface `PaymentProvider` + **deux implémentations** : provider sandbox local
  (développement et tests) et squelette du provider réel, prêt à recevoir les clés.
- Fonction serveur webhook : vérification de signature, idempotence par référence,
  contrainte d'unicité en base, journalisation horodatée de chaque transition d'état.
- Montant et plan déterminés **serveur**. Rate limiting sur la création de transaction.
- **Les 6 cas du brief, chacun avec son écran, son état en base et son test automatisé** :
  réussi, échoué, en attente, expiré (TTL), double paiement / webhook rejoué, signature
  invalide.
- Suppression de `PaymentModal.tsx`.

### Phase 7 — Application connectée
`refonte/07-app`

Dashboard (hiérarchie à trois niveaux, pas une grille de cartes), profil, abonnement et
facturation, historique des transactions (**repensé en liste sur mobile**, pas un tableau
qui défile), paramètres. Chargement / vide / erreur avec récupération / succès sur chaque
écran affichant des données.

### Phase 8 — Modules de contenu
`refonte/08-contenu`

Quiz, 195 pays, bibliothèque passés sur le design system. Suppression de `ArticleView` et
`data/knowledge.ts`. Découpage des données de quiz (chargement par catégorie).
Omnisearch reconstruit — et les résultats mènent enfin au résultat.

### Phase 9 — Qualité et livraison
`refonte/09-qualite`

Audit a11y complet au clavier et au lecteur d'écran, Lighthouse mobile, vérification
320 px → 2560 px, budgets de bundle en échec de build, README à jour (installation,
variables d'environnement, déploiement, configuration du paiement), vérification une à une
des critères d'acceptation du brief.

### Ordre, et pourquoi

`DESIGN.md` avant toute interface, sinon on repeint deux fois. Le backend avant le paiement,
parce qu'un paiement sans utilisateur ni base n'a rien à activer. Le paiement avant l'écran
de facturation, qui n'a de sens qu'avec de vraies transactions. Le contenu en dernier :
c'est le plus volumineux et le moins risqué, il ne doit pas retarder la mise en vente.

Le seul parallélisme utile : la phase 3 (robot) est indépendante des phases 4-7 et peut
être décalée si tu préfères sortir la monétisation d'abord. **C'est mon conseil**, d'ailleurs :
le robot est ce qui rend le produit mémorable, mais l'auth et le paiement sont ce qui le
rend vendable.

---

## 3. Un désaccord, formulé maintenant

Le brief demande un robot 3D très travaillé et une refonte visuelle complète, ce qui est
juste : NEXUS a un vrai problème d'apparence. Mais l'audit montre que **le produit vendu
est actuellement défectueux au fond**, pas seulement en surface : le QI est calculé par une
formule linéaire présentée comme gaussienne, le plan « personnalisé » est une constante,
le certificat « vérifiable » n'est vérifiable nulle part, et le paiement est un
`setTimeout` habillé en « chiffrement SSL 256-bit ».

Si on refond le visuel sans corriger ça, on obtient un produit qui *paraît* professionnel
tout en vendant 500 FCFA un chiffre arbitraire — ce qui est plus risqué que le produit
actuel, pas moins, parce que la belle apparence supprime le doute qui protège aujourd'hui
l'utilisateur.

Je ne propose pas de retarder la refonte visuelle : je propose que **la phase 5 soit
non-négociable avant toute mise en vente**, et que le mot « officiel » disparaisse du
certificat quoi qu'il arrive. Le reste du brief, je l'exécute tel qu'écrit.

---

## 4. Les décisions qui te reviennent

### Décision 1 — Backend et authentification

**Ma recommandation : Supabase.**

| | Supabase | Netlify Functions + base gérée | Firebase |
|---|---|---|---|
| Auth | incluse, avec reset e-mail, OAuth, sessions | **à assembler soi-même** | incluse |
| Base | Postgres + RLS | Postgres (Neon/Supabase quand même) | NoSQL |
| Autorisation | RLS au niveau ligne, dans la base | à écrire dans chaque fonction | règles propriétaires |
| Fonctions serveur | Edge Functions (Deno), région choisie | oui, `us-east-1` par défaut sur l'offre gratuite | oui |
| Latence depuis Abidjan | région Paris / Irlande → ~60-90 ms | `us-east-1` → ~130-160 ms | Europe possible |
| Coût à faible volume | gratuit largement suffisant | gratuit + coût de la base | gratuit |
| Compatibilité Netlify | totale, le front reste sur Netlify | native | totale |
| Pour un développeur seul | 1 service, 1 dashboard, 1 doc | ≥ 2 services à recoller | verrouillage produit |

Les deux arguments qui tranchent : **l'auth**, qui est la partie qu'on rate le plus
facilement quand on la fait soi-même, et **RLS**, qui met la règle « un utilisateur ne lit
que ses propres résultats » *dans la base* plutôt que dans chaque endpoint — donc une règle
qu'on ne peut pas oublier d'écrire. La latence depuis l'Afrique de l'Ouest départage
ensuite : région européenne contre `us-east-1`.

Netlify reste l'hébergeur du front. Rien ne change pour le déploiement existant.

*Note : Netlify Identity est déprécié, ce n'est pas une option.*

**Ta décision : Supabase, ou une autre solution ?**

### Décision 2 — Agrégateur de paiement

**Ma recommandation : CinetPay, avec PayDunya en solution de repli.**

Le point économique décisif, que le montant de 500 FCFA rend brutal : **il faut un
tarif purement en pourcentage.** Sur 500 FCFA —

| Structure tarifaire | Coût réel sur 500 F | Reste |
|---|---|---|
| 1,5 – 2 % (CinetPay, PayDunya) | 7,50 – 10 F | ~98 % |
| 2 – 3,5 % (Semoa) | 10 – 17,50 F | ~97 % |
| **1 % + 100 F fixes** (ex. GeniusPay) | **105 F, soit 21 %** | 79 % |

Toute grille comportant une composante fixe est éliminatoire à ce prix.

| | CinetPay | PayDunya | Semoa |
|---|---|---|---|
| Wave CI | ✅ | ✅ | ✅ |
| Orange / MTN / Moov CI | ✅ | ✅ | ✅ |
| Cartes | ✅ | ✅ | ✅ |
| Commission entrante | ~1,5 – 2 % | 1,5 – 3 % | 2 – 3,5 % |
| Licence d'établissement de paiement en CI | ✅ (CinetPay Africa) | ✅ (Dunya) | non listée |
| Base | Abidjan | Dakar | Lomé |
| Doc + SDK | doc publique, SDK JS et PHP, intégration « seamless » | doc publique | plus succincte |
| Mode test | oui (bundle sandbox distinct, jeu de clés de test) | oui | à confirmer |

CinetPay l'emporte sur trois points : c'est le seul des trois basé en Côte d'Ivoire et
figurant nommément parmi les établissements licenciés du pays, sa documentation webhook
traite explicitement la vérification du jeton et la protection contre le rejeu (exactement
les deux mécanismes exigés au §6 du brief), et sa grille est en pourcentage pur.

**Deux réserves que je dois poser :**
1. Les taux ci-dessus proviennent de sources publiques secondaires : la documentation
   officielle de CinetPay n'était pas joignable depuis cette machine au moment de l'audit.
   **Les chiffres exacts, le ticket minimum et le délai de reversement seront reconfirmés
   sur les sources primaires au moment de rédiger `PAIEMENT.md`** — et ils se négocient
   au volume, donc ta grille réelle sortira de l'ouverture de compte.
2. À 500 FCFA l'unité, la marge absolue est mince quel que soit le prestataire. Un
   abonnement mensuel (décision 5) amortit mieux le coût fixe d'exploitation qu'un
   paiement unique.

**Ta décision : CinetPay, PayDunya, ou un autre ?** (Et as-tu déjà un compte marchand
quelque part ? Ça changerait la réponse.)

### Décision 3 — Typographie

Deux propositions complètes, ni l'une ni l'autre n'étant Inter. Les deux sont sous licence
SIL OFL, donc auto-hébergeables sans coût ni requête tierce, et couvrent intégralement les
diacritiques du français.

**Proposition A — « Éditorial »**
`Instrument Serif` (titres) + `Instrument Sans` (interface et corps)

Un serif éditorial pour les titres, une grotesque neutre et chaude pour le reste. Registre :
publication, institution, chose qu'on lit et qu'on garde. C'est le couple qui donne le plus
de crédit à un certificat et à un rapport d'évaluation. Risque : le serif demande une
composition disciplinée pour ne pas virer « blog littéraire », et Instrument Serif n'a
qu'une graisse (romain + italique) — contrainte utile, mais contrainte.

**Proposition B — « Institutionnel »** ← *ma recommandation*
`Bricolage Grotesque` (titres, variable, axe optique) + `Public Sans` (interface et corps)

Public Sans est dessinée pour les formulaires administratifs américains : grande hauteur
d'x, chiffres non ambigus, lisibilité à petite taille — exactement les contraintes d'un
rapport psychométrique dense en chiffres et d'un certificat. Bricolage Grotesque donne aux
titres une voix identifiable (son axe optique permet des titres serrés et vivants) sans
verser dans le décoratif.

**Pourquoi je recommande B :** le problème principal de NEXUS n'est pas d'être ennuyeux,
c'est d'être *pas crédible*. Une typographie dont l'ADN est la lisibilité de documents
officiels règle ce problème mieux qu'un serif esthétique. Et le gros du produit, c'est
du texte petit et dense : le corps compte plus que le titre.

**Ta décision : A, B, ou autre chose ?**

### Décision 4 — Modèle 3D

**Je dois être franc ici : je ne peux pas te donner les trois options avec poids et nombre
de polygones vérifiés dès maintenant.** J'ai identifié les filières de sourcing et vérifié
les licences, mais les pages d'assets précises n'étaient pas toutes joignables depuis cette
machine (une URL candidate a répondu 404, et je refuse d'inventer des chiffres de poids ou
de polycount).

Ce que j'ai **vérifié** :

| Option | Licence | Source | État |
|---|---|---|---|
| **1. RobotExpressive** — Tomás Laulhé | **CC0 1.0**, vérifiée | `github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive` | licence certaine, poids et polycount à mesurer. **Réserve : ce modèle est stylisé / cartoon**, ce que ton brief exclut. Utile comme référence de rig et d'animations, pas comme robot final. |
| **2. Filière CC0 / CC-BY** — Sketchfab (filtre CC0), Poly Haven, Quaternius, Kenney | CC0 ou CC-BY selon l'asset | catalogues vérifiés comme sources CC0 fiables | il faut sélectionner l'asset précis et relever poids / polycount / présence d'un rig sur sa fiche |
| **3. Achat** — Sketchfab Store, CGTrader, TurboSquid, « humanoid robot bust » en licence Royalty Free | achat, licence commerciale explicite | catalogues établis | c'est la filière la plus susceptible de donner le niveau de finition « cinématographique » que tu vises, pour ~20-60 $ |

**Ce que je propose :** la phase 3 construit d'abord le **repli procédural**, qui est un
livrable fini et suffisant en soi et qui ne dépend d'aucun asset. En parallèle, je te
remonte une sélection de 3 candidats précis, chacun avec son URL, son poids réel mesuré,
son polycount, sa licence et une capture — chiffres relevés sur les fiches, pas estimés.
Tu choisis à ce moment-là. Le composant acceptant n'importe quel GLB par une prop, ce choix
n'est bloquant pour rien.

**Ta décision : d'accord pour trancher le modèle en phase 3 sur des candidats vérifiés,
plutôt que maintenant sur des chiffres que j'aurais inventés ?** Et : plutôt gratuit
(CC0/CC-BY, finition moyenne) ou plutôt achat (~20-60 $, finition supérieure) ?

### Décision 5 — Découpage gratuit / payant

**Ma recommandation : abonnement mensuel à 500 FCFA, et le radar cognitif passe en gratuit.**
Le tableau détaillé et les arguments sont en `AUDIT.md` §1.4. Les trois points à valider :

1. **Abonnement mensuel plutôt que paiement unique.** Le code actuel vend « accès à vie,
   sans abonnement » ; ton brief demande un écran « Abonnement & facturation ». Les deux
   sont incompatibles. Je recommande l'abonnement : un score isolé se consomme une fois,
   une **progression** se consomme tous les mois, et c'est la seule chose que le nouveau
   backend rend possible et que l'ancien site ne permettait pas.
2. **Le radar 6 dimensions devient gratuit.** Il est aujourd'hui affiché flouté derrière un
   cadenas. Flouter le résultat que l'utilisateur vient de produire en 20 minutes d'effort
   est le geste qui fait « produit cheap ». On vend le *pourquoi* (corrections), le
   *comment progresser* (plan), la *preuve* (certificat) et la *durée* (historique).
3. **Gratuit : 1 test par 30 jours.** Limite défendable psychométriquement, donc non
   perçue comme arbitraire.

**Ta décision : abonnement mensuel, paiement unique, ou les deux (unique en entrée +
abonnement) ?** Sachant que « les deux » double la complexité de facturation, et que je
recommande de ne pas le faire en v1.

### Décision 6 — Ce qui doit être supprimé plutôt que refondu

**Ma recommandation, par ordre décroissant d'importance :**

| À supprimer | Pourquoi supprimer plutôt que refondre |
|---|---|
| **`payment/PaymentModal.tsx`** | Faux paiement : un `setTimeout(1800)` habillé en « chiffrement SSL 256-bit », qui ne peut pas échouer. Rien n'est réutilisable, l'architecture réelle n'a pas la même forme. |
| **`ai/NexusAITutor.tsx`** — et la fonctionnalité avec | Ce n'est pas une IA : correspondance de mots-clés + 800 ms de fausse frappe, et le Markdown s'affiche brut à l'écran. La refondre voudrait dire brancher un vrai modèle côté serveur — c'est un autre produit, avec un autre coût par requête. **Je recommande de couper la fonctionnalité de la v1** et de la reconstruire correctement plus tard si tu la veux. Garder un faux tuteur IA sur une plateforme qui vend de l'évaluation cognitive coûte plus en crédibilité que ça ne rapporte. |
| **`ArticleView.tsx` + `data/knowledge.ts` + route `/article/*`** | Système de contenu orphelin, doublonné par `knowledgeExtended`, atteignable seulement par l'omnisearch, et 67 kB de données. Contient un parseur Markdown maison de 55 lignes à ne pas maintenir. |
| **3/4 de `utils/paymentStorage.ts`** | `unlockReport` / `isReportUnlocked` / `getUnlockedReportIds` : le déblocage passe côté serveur. Seuls les helpers de reprise de test survivent. |
| **`dist/` et `dist.zip`** (1 Mo) | Artefacts de build commités à la racine. |
| **Bloc Google Analytics d'`index.html`** | ID placeholder `G-XXXXXXXXXX`, garde qui empêche l'initialisation : code mort, plus un `window.trackEvent` global appelé pour rien. |
| **`ParticleField`, `.bg-mesh`, `.glow-border`, `.text-gradient`, `.particle`, `.stagger-*`, `animate-pulse-glow`, `animate-float`** | Marqueurs de template générés, listés un à un dans ton brief. `.text-gradient` fait en plus disparaître les titres en mode contrastes forcés. |
| **`vite-plugin-singlefile`** | Dépendance jamais utilisée. |

**Cas limite, à trancher par toi : la fonctionnalité « Nexus AI ».** Les autres suppressions
sont techniques et sans effet visible ; celle-là retire un pilier annoncé sur la home et
dans la nav. Trois options : (a) couper maintenant, (b) couper maintenant et reconstruire
en vrai plus tard, (c) brancher un vrai modèle dès la v1 — ce qui ajoute une phase, un coût
par requête et une décision de fournisseur.

**Ta décision : (a), (b) ou (c) ? Et valides-tu le reste de la liste ?**

---

## 5. Livrables documentaires

| Fichier | Phase | État |
|---|---|---|
| `docs/AUDIT.md` | 0 | ✅ écrit |
| `docs/PLAN.md` | 0 | ✅ ce document |
| `docs/DESIGN.md` | 1 | à écrire, avant toute interface |
| `docs/3D.md` | 3 | à écrire |
| `docs/PAIEMENT.md` | 6 | à écrire |
| `README.md` | 9 | à écrire (il n'en existe aucun aujourd'hui) |

---

## 6. Ce que j'attends de toi pour démarrer

1. Les **six décisions** du §4.
2. L'**installation de Git et le lien du dépôt à Netlify** (§1) — sans quoi je ne peux pas
   toucher au code en sécurité.

Dès que ces deux points sont réglés, j'enchaîne Phase 0 puis `DESIGN.md`.
