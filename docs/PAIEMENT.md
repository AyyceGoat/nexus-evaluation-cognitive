# PAIEMENT — encaisser 500 FCFA en Côte d'Ivoire

Rédigé en Phase 5. Aucun compte marchand n'existe, aucune clé n'a été utilisée : tout ce
qui suit est de la préparation et de la documentation.

**Chaque chiffre porte son niveau de certitude.** `docs.cinetpay.com` n'était pas
résoluble depuis la machine de développement — le DNS échoue — donc aucune page de la
documentation officielle n'a été lue directement. Ce qui est cité vient soit du dépôt
GitHub officiel de CinetPay, soit de la citation textuelle de leur documentation par le
moteur de recherche. C'est indiqué au cas par cas.

---

## 1. Réponse à ta question bloquante

> *« Confirme s'il existe un montant minimum fixe par transaction en plus des 3,5 %
> mobile money. Sur 500 FCFA, un plancher à 100 F représenterait 20 % et changerait la
> décision. »*

**Il n'existe pas de commission fixe par transaction. La décision tient.**

Ce que j'ai trouvé, précisément :

| Élément | Valeur | Certitude |
|---|---|---|
| Montant **minimum de transaction** en XOF | **100 XOF** | **Haute** — citation textuelle de `docs.cinetpay.com/api/1.0-fr/checkout/initialisation` |
| Le montant doit être un **multiple de 5** | oui, sauf en USD | **Haute** — même source |
| Commission entrante, Côte d'Ivoire | **3,5 %** | **Moyenne** — page de support, résumée par le moteur |
| Commission fixe s'ajoutant au pourcentage | **aucune trouvée** | **Moyenne** — absence de mention, pas une confirmation explicite |
| Minimum de **reversement** (payout) par opérateur | 200 à 500 FCFA selon l'opérateur | **Basse** — existence confirmée, grille exacte non lue |

Il y a un piège de vocabulaire qu'il faut nommer : les « montants minimums » que l'on
trouve chez CinetPay concernent les **reversements** (payout, l'argent qui sort vers ton
compte), pas les **encaissements** (pay-in, l'argent qui rentre). Ce sont deux grilles
distinctes. Le 100 XOF ci-dessus est bien la contrainte d'encaissement.

**Conséquence sur 500 FCFA :**

```
Encaissement    500,00 FCFA
Commission 3,5 % −17,50 FCFA
                ───────────
Net              482,50 FCFA     soit 96,5 % conservés
```

À comparer avec ce qu'une composante fixe ferait :

| Grille | Coût sur 500 F | Part prélevée |
|---|---|---|
| CinetPay, 3,5 % | 17,50 F | **3,5 %** |
| PayDunya, 1,5 – 3 % | 7,50 – 15 F | 1,5 – 3 % |
| Semoa, 2 – 3,5 % | 10 – 17,50 F | 2 – 3,5 % |
| **1 % + 100 F fixes** (ex. GeniusPay) | **105 F** | **21 %** |

C'est ce dernier cas qui était éliminatoire, et c'est bien celui qu'il faut continuer
d'écarter. Aucune grille comportant une part fixe n'est viable à ce prix.

**Deux points à vérifier toi-même à l'ouverture du compte**, parce qu'ils ne sont pas
publics : le taux réellement appliqué à ton volume (3,5 % est le tarif affiché, il se
négocie), et le délai de reversement.

### Et Wave en direct ?

Tu demandais aussi de comparer Wave seul, à environ 1,5 %.

| | Wave en direct | Agrégateur |
|---|---|---|
| Commission | ~1,5 % (7,50 F sur 500) | 3,5 % (17,50 F) |
| Opérateurs couverts | Wave uniquement | Wave, Orange, MTN, Moov, cartes |
| Intégrations à maintenir | 1 | 1 |
| Part de marché adressée | partielle | quasi totale |

**Mon avis : ne commence pas par Wave seul.** L'économie est de 10 FCFA par transaction.
Le coût, c'est de refuser le paiement à tout utilisateur qui n'a pas Wave — et en Côte
d'Ivoire, Orange Money reste très installé. Dix francs de marge en plus ne compensent pas
un client sur deux qui ne peut pas payer. L'architecture livrée permet d'ajouter Wave en
direct plus tard comme second `PaymentProvider`, si les volumes justifient d'optimiser la
commission.

---

## 2. Recommandation

**CinetPay**, comme décidé en Phase 0, et la vérification ci-dessus ne change rien :

1. Basé à Abidjan et figurant parmi les établissements de paiement licenciés en Côte
   d'Ivoire.
2. Couvre Wave, Orange Money, MTN MoMo, Moov et les cartes derrière une seule intégration.
3. Grille en pourcentage pur, sans part fixe — le seul point qui compte à 500 F.
4. Documentation webhook qui traite explicitement la vérification de signature et la
   protection contre le rejeu, c'est-à-dire les deux mécanismes exigés.

Repli si l'ouverture de compte échoue : **PayDunya** (1,5 – 3 %, couvre aussi Wave).

---

## 3. Ce que tu dois faire, étape par étape

Je ne peux rien faire de cette liste : elle demande ton identité et tes documents.

1. **Créer le compte** sur `cinetpay.com`, en mode marchand.
2. **Réunir les pièces.** D'après les usages du secteur — à confirmer sur leur formulaire,
   je n'ai pas pu lire la liste officielle : pièce d'identité du dirigeant, justificatif
   d'immatriculation de l'activité, RIB ou compte mobile money de reversement, et l'URL du
   site. *Certitude basse : liste à vérifier au moment de l'inscription.*
3. **Faire valider le compte.** Compter quelques jours ouvrés.
4. **Récupérer trois valeurs** dans l'espace marchand : `API_KEY`, `SITE_ID`, et surtout
   la **clé secrète** (Paramètres du compte), qui sert à vérifier le HMAC des webhooks.
5. **Déclarer l'URL de notification** :
   `https://<projet>.supabase.co/functions/v1/webhook-paiement`.
6. **Renseigner les secrets** dans Supabase (Dashboard → Edge Functions → Secrets), pas
   dans un fichier du dépôt : `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`,
   `CINETPAY_SECRET_KEY`, puis `PAYMENT_PROVIDER=cinetpay`.
7. **Tester d'abord avec un vrai paiement de 100 FCFA** sur ton propre numéro, avant
   d'ouvrir aux utilisateurs. C'est le seul test de bout en bout qui vaille.

---

## 4. Ce qui est construit et fonctionne déjà

### La couche d'abstraction

```ts
interface PaymentProvider {
  createCheckout(userId, planId, amount, currency): Promise<{ reference, redirectUrl }>
  verifyPayment(reference): Promise<PaymentStatus>
  handleWebhook(rawBody, signature): Promise<PaymentEvent>
}
```

Deux implémentations, dans [`src/lib/paiement/`](../src/lib/paiement/) :

- **`sandbox.ts`** — complet et opérationnel. Machine à états, TTL, webhook réellement
  signé en HMAC-SHA256, contrôle du montant, verrou d'idempotence, journal des
  transitions. Il ne déplace pas d'argent, et c'est sa seule différence.
- **`cinetpay.ts`** — écrit en entier, jamais exécuté. N'attend que les clés.

### Le flux

```
Déblocage demandé depuis le rapport
  → Edge Function `creer-paiement` : vérifie le compte, la propriété de la passation,
    l'absence de droit existant, applique le rate limiting, FIXE LE MONTANT d'après sa
    table de plans, GÉNÈRE LA RÉFÉRENCE, insère la transaction en `pending`
  → redirection vers le guichet de l'agrégateur
  → l'utilisateur confirme sur son téléphone
  → webhook signé reçu ───────┐
  → vérification de signature │
  → contrôle du montant       │  source de vérité
  → verrou d'idempotence      │
  → confirmation par l'API    │
  → création du droit d'accès ┘
  → écran de résultat
```

### Les six cas, et ce qui les couvre

Tous testés dans [`src/lib/paiement/__tests__/flux.test.ts`](../src/lib/paiement/__tests__/flux.test.ts) —
**27 tests, tous verts**.

| Cas | État en base | Écran | Tests |
|---|---|---|---|
| **Réussi** | `succeeded` + ligne dans `entitlements` | « Paiement confirmé », accès au rapport et au reçu | 2 |
| **Échoué** | `failed` + `failure_reason` | motif affiché, nouvel essai avec **nouvelle** référence | 2 |
| **En attente** | `pending` | « Confirmez sur votre téléphone », dit que quitter la page ne perd rien | 2 |
| **Expiré** | `expired` par TTL de 30 min | délai dépassé, référence inutilisable | 3 |
| **Rejeu / double** | inchangé, `dejaTraite: true` | — | 2 |
| **Signature invalide** | `rejected` ou aucun changement, journalisé | « Paiement rejeté », invite à donner la référence au support | 4 |

Plus 12 tests sur les contraintes de montant, l'unicité des références, la comparaison à
temps constant et la vérification HMAC de CinetPay.

### Sécurité

- **Signature vérifiée avant toute lecture du corps.** Un corps non authentifié n'est
  pas une donnée, c'est une entrée hostile.
- **Comparaison à temps constant.** Une comparaison naïve fuit la signature octet par
  octet.
- **Montant et plan déterminés serveur.** Le client n'envoie que l'identifiant de la
  passation ; un client qui enverrait « montant : 5 » n'a aucun effet.
- **Idempotence atomique.** `UPDATE … WHERE status = 'pending'` : le second appel ne
  trouve plus de ligne au statut attendu. Ce n'est pas une lecture suivie d'une écriture,
  donc deux webhooks simultanés ne peuvent pas passer tous les deux.
- **Double barrière contre le double crédit.** Le verrou ci-dessus, plus une contrainte
  d'unicité `(user_id, session_id)` sur `entitlements`.
- **`entitlements` n'a aucune politique d'écriture RLS.** Aucun client ne peut s'accorder
  un droit ; seule une fonction serveur munie de la clé de service en crée.
- **Rate limiting** : cinq transactions ouvertes par utilisateur et par dix minutes.
- **Journal horodaté** de chaque transition dans `transaction_events`, y compris les
  refus de transition et les signatures rejetées.
- **Aucun secret dans le dépôt.** `.env` est ignoré par Git, `.env.example` documente
  chaque variable en séparant ce qui va dans le bundle de ce qui reste serveur.

---

## 5. Détails d'intégration CinetPay, avec leur provenance

### Contraintes de montant

Minimum **100 XOF**, montant **multiple de 5**. *Certitude haute — citation textuelle de
la documentation officielle par le moteur de recherche ; page non lue directement.*
Encodé dans `montantAcceptable()` et vérifié par test, pour qu'un changement de prix ne
casse pas l'intégration en silence.

### Vérification du webhook

En-tête **`x-token`**, **HMAC-SHA256** avec la clé secrète du compte marchand, calculé
sur la concaténation des champs du corps **dans cet ordre exact** :

```
cpm_site_id + cpm_trans_id + cpm_trans_date + cpm_amount + cpm_currency
+ signature + payment_method + cel_phone_num + cpm_phone_prefixe
+ cpm_language + cpm_version + cpm_payment_config + cpm_page_action
+ cpm_custom + cpm_designation + cpm_error_message
```

*Certitude haute pour le mécanisme et l'ordre — citation textuelle de
`docs.cinetpay.com/api/1.0-en/checkout/hmac`. **À relire sur la page avant la mise en
production** : un champ mal ordonné donne une signature qui ne correspond jamais, et le
symptôme serait « tous les webhooks sont rejetés ».*

Implémenté dans `chaineASigner()` et `verifierSignatureCinetPay()`, avec des tests qui
couvrent le cas valide et quatre cas de rejet.

### Endpoints

- Ouverture : `POST https://api-checkout.cinetpay.com/v2/payment`
- Vérification : `POST https://api-checkout.cinetpay.com/v2/payment/check`

*Certitude moyenne — cohérents avec le SDK officiel et la documentation citée.*

### Mode test

Le SDK PHP officiel expose un mode sandbox et des bundles JS distincts
(`cinetpay.sandbox.min.js` / `cinetpay.prod.min.js`). *Certitude moyenne — vu dans le
dépôt GitHub officiel, modalités exactes non vérifiées.* Le provider sandbox livré ici ne
dépend pas de ce mode : il est autonome.

---

## 6. Ce qui reste ouvert

1. **Rien n'a été exécuté contre CinetPay.** Aucune requête, aucun webhook réel. Le code
   est écrit et testé contre ses propres suppositions, ce qui n'est pas la même chose
   qu'être testé contre le service.
2. **L'ordre des champs du HMAC est à relire** sur la page officielle. C'est le point de
   défaillance le plus probable.
3. **Les Edge Functions ne sont ni typecheckées ni lintées** par ce dépôt : elles ciblent
   Deno et sont exclues d'ESLint et de `tsconfig`. Elles le seront par `deno check` au
   déploiement. Angle mort assumé, consigné au journal.
4. **L'expiration par TTL dépend d'une lecture.** En sandbox, elle est évaluée à chaque
   `verifyPayment`. En production, il faudra une tâche planifiée (`pg_cron`) pour que les
   transactions abandonnées basculent en `expired` sans attendre qu'on les consulte.
5. **Pas de reçu PDF.** L'historique des transactions tient lieu de reçu. À voir si tu en
   veux un vrai.
6. **La grille tarifaire réelle est à confirmer** à l'ouverture du compte, ainsi que le
   délai de reversement et la liste des pièces exigées.

---

## Sources

- [CinetPay — tarifications des paiements entrants et sortants](https://support.cinetpay.com/d/52-tarifications-des-paiements-entrants-et-sortants)
- [CinetPay — montant minimum de payout par opérateur et par pays](https://support.cinetpay.com/d/53-cinetpay-montant-minimum-pay-out-par-operateur-et-par-pays)
- [CinetPay — initialisation d'un paiement](https://docs.cinetpay.com/api/1.0-fr/checkout/initialisation)
- [CinetPay — X-TOKEN HMAC](https://docs.cinetpay.com/api/1.0-en/checkout/hmac)
- [CinetPay — préparez une page de notification](https://docs.cinetpay.com/api/1.0-fr/checkout/notification)
- [CinetPay — SDK PHP officiel](https://github.com/cinetpay/cinetpay-php-sdk)
- [Passerelles de paiement en Côte d'Ivoire, 2026](https://boldrails.com/blog/best-payment-gateways-cote-divoire)
- [GeniusPay — tarifs (1 % + 100 XOF)](https://pay.genius.ci/pricing)
