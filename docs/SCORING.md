# SCORING — Le moteur d'estimation d'aptitude de NEXUS

Rédigé en Phase 2. Décrit le modèle, les formules, les hypothèses, les limites assumées
et la procédure de recalibration.

Tous les chiffres cités sous « comportement mesuré » proviennent de simulations
exécutées sur le code de ce dépôt, avec générateur pseudo-aléatoire à graine fixe. Ils
sont reproductibles par `npm test`.

---

## 1. Ce qui est remplacé, et pourquoi

L'ancien moteur (`src/utils/iqEngine.ts`, supprimé) calculait :

```js
const baseIQ = Math.round(75 + (weightedRate * 70));   // commenté « Courbe Gaussienne standard »
const globalPercentile = Math.round(weightedRate * 98 + 1);
```

Deux droites. Conséquences arithmétiques, sur un QCM à quatre options :

| Comportement | Ancien résultat |
|---|---|
| Répondre au hasard (≈ 25 % de réussite) | **≈ 92**, qualifié « Moyen » |
| Ne rien répondre du tout | **75** |
| Sans-faute | 145, plafond dur |

Le problème n'est pas l'imprécision, c'est l'absence de modèle : rien dans ce calcul ne
distingue une réussite obtenue par raisonnement d'une réussite obtenue par chance, et
rien ne produit de marge d'erreur. Le certificat imprimait pourtant « QI Standard
(σ = 15) » au-dessus de ces nombres.

---

## 2. Le modèle

### 2.1 Réponse à l'item, modèle 3PL

Pour un item *i* et une aptitude θ :

```
P_i(θ) = c_i + (1 − c_i) · 1 / (1 + exp(−D · a_i · (θ − b_i)))
```

- **`a`** — pouvoir discriminant. Pente de la courbe : à quel point l'item sépare deux
  niveaux voisins.
- **`b`** — difficulté, sur la même échelle que θ (centrée 0, écart-type 1).
- **`c`** — asymptote basse, dite pseudo-chance. **C'est le terme qui traite la
  correction du hasard**, dans le modèle et non en post-traitement.
- **`D = 1,702`** — constante d'échelle qui aligne le modèle logistique sur le modèle à
  ogive normale, afin que `a` et `b` se lisent avec les conventions usuelles.

**Pourquoi 5 options et pas 4.** `c = 1 / nombre d'options`. Avec cinq options,
`c = 0,20`. Toute la banque impose cinq options, et un test le vérifie : le modèle a
besoin de connaître cette valeur exactement, elle ne peut pas varier d'un item à
l'autre sans être déclarée.

Implémentation : [`src/lib/iq/irt.ts`](../src/lib/iq/irt.ts).

### 2.2 Estimation de θ par espérance a posteriori (EAP)

Quadrature sur une grille de θ allant de −4 à +4 par pas de 0,05 (161 points), avec
a priori normal centré réduit.

```
w(θ) = φ(θ) · Π_i P_i(θ)^{u_i} · (1 − P_i(θ))^{1−u_i}
θ̂    = Σ θ·w(θ) / Σ w(θ)
SE   = √( Σ (θ − θ̂)²·w(θ) / Σ w(θ) )
```

La vraisemblance est accumulée en logarithmes puis ramenée par soustraction du maximum,
pour éviter les sous-dépassements sur 35 facteurs.

**Pourquoi l'EAP plutôt que le maximum de vraisemblance.** Le MV diverge vers ±∞ pour un
sans-faute ou un zéro pointé — situations courantes sur un test court. L'EAP reste
toujours fini, et fournit l'erreur type dont l'intervalle de confiance a besoin.

**Contrepartie assumée :** l'EAP contracte les estimations vers la moyenne de l'a priori.
Un candidat de θ vrai = 1,5 sera estimé légèrement en dessous. Le test de recouvrement
de paramètres borne cet écart à 0,35 sur l'échelle de θ, soit environ 5 points.

### 2.3 Échelle de restitution

```
Indice        = 100 + 15 · θ̂
Intervalle 95 % = Indice ± 1,96 · 15 · SE
```

Implémentation : [`src/lib/iq/scale.ts`](../src/lib/iq/scale.ts).

### 2.4 Percentile

Deux régimes, et la restitution **nomme toujours lequel s'applique** :

- **Sans référentiel suffisant** (aujourd'hui) : percentile lu sur la loi normale
  centrée réduite. Libellé affiché : *« situé sur une distribution théorique de
  référence (moyenne 100, écart-type 15), faute de passations enregistrées en nombre
  suffisant »*.
- **À partir de 300 passations complètes** : proportion des passations de référence dont
  le θ est inférieur à celui du candidat. Libellé : *« calculé sur les N passations
  complètes enregistrées sur NEXUS »*.

Le seuil de 300 est un compromis : en dessous, un centile représenterait moins de trois
personnes, et un percentile « mesuré » serait plus trompeur que le théorique.

---

## 3. La banque d'items

120 items, [`src/data/iq/`](../src/data/iq/).

| Aptitude | Items | Rendu |
|---|---|---|
| Matrices logiques | 24 | grilles 3×3, SVG |
| Séries numériques | 24 | texte |
| Analogies verbales | 24 | texte |
| Rotation spatiale | 24 | séquences, SVG |
| Mémoire de travail | 24 | texte |

Chaque aptitude couvre les cinq niveaux de difficulté de conception. Chaque item porte
son explication et son raisonnement pas à pas.

### 3.1 Difficulté a priori

Aucune donnée de passation n'existe encore. Chaque item reçoit donc une difficulté de
conception de 1 à 5, convertie ainsi :

| Difficulté | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| `b` | −1,8 | −0,9 | 0,0 | +0,9 | +1,8 |

Les cinq niveaux couvrent environ du 4ᵉ au 96ᵉ centile. Étaler davantage produirait des
items que presque personne ne réussit ou ne rate, donc peu informatifs.

Pouvoir discriminant par défaut : **`a = 1,0`** pour tous les items, faute de données.
C'est l'hypothèse la plus neutre : elle suppose que tous les items séparent également,
ce qui est certainement faux dans le détail mais ne privilégie aucun item arbitrairement.
La recalibration corrige ce point en premier.

### 3.2 Intégrité vérifiée par tests

[`src/lib/iq/__tests__/bank.test.ts`](../src/lib/iq/__tests__/bank.test.ts) vérifie :
identifiants uniques ; exactement cinq options ; indice de bonne réponse valide ;
`c = 0,2` partout ; item textuel **ou** visuel, jamais les deux ; cinq niveaux de
difficulté par aptitude ; explication et raisonnement non vides ; aucune option dupliquée
au sein d'un item ; et **aucune position de bonne réponse dominante** — un test dont la
bonne réponse serait toujours au même rang serait réussissable sans être résolu.

### 3.3 Contrainte de rendu qui a façonné les items visuels

Le moteur de rendu ne distingue pas plus de cinq points, et un faisceau de traits est
invariant par rotation de 180°, un triangle par rotation de 120°. Aucun item ne repose
sur une distinction que le rendu ne produit pas ; les séries de rotation ne franchissent
jamais la période de symétrie de leur figure. Sans cette contrainte, des items auraient
eu deux réponses correctes visuellement identiques.

---

## 4. Composition d'une passation

[`src/lib/iq/selection.ts`](../src/lib/iq/selection.ts).

- 30, 35 ou 40 items au choix ; 35 par défaut, soit **7 par aptitude**.
- Répartition sur les cinq niveaux de difficulté, en partant du milieu de l'échelle :
  les items moyens informent le plus sur un candidat dont on ne sait rien.
- Présentation par difficulté croissante, ordre aléatoire à difficulté égale.
- Mélange de Fisher-Yates, uniforme — l'ancien code utilisait
  `sort(() => 0.5 - Math.random())`, qui est biaisé.

### Contrôle d'exposition

Les items des cinq dernières passations sont écartés en priorité. Avec 24 items par
aptitude et 7 servis, **trois passations consécutives peuvent être entièrement
disjointes**. Un test vérifie sur 50 tirages que deux passations consécutives partagent
moins de 20 % de leurs items ; en pratique la valeur observée est nulle.

Pour mémoire, l'ancien moteur tirait 20 items sur une banque de 24 : deux passations
partageaient environ 83 % de leur contenu.

---

## 5. Temps de réponse et validité

[`src/lib/iq/validity.ts`](../src/lib/iq/validity.ts).

### 5.1 Réponses aberrantes

Une réponse est signalée si son temps est inférieur à `max(3 s, 20 % du temps attendu)`.
Le seuil est relatif à l'item, pas absolu : cinq secondes sont plausibles sur une
analogie facile, pas sur une matrice 3×3.

### 5.2 Trois verdicts

| Verdict | Déclenchement | Effet sur la restitution |
|---|---|---|
| `not_interpretable` | le score ne se distingue pas du hasard (test binomial unilatéral, α = 5 %), **ou** plus de 30 % des réponses expédiées | **aucun score, aucun percentile** ; l'écran explique ce qui a été observé et propose de recommencer |
| `low_precision` | SE > 0,45, ou au moins une réponse expédiée | score affiché, avec mise en avant de l'intervalle |
| `ok` | — | restitution normale |

Le test binomial compare le nombre de réussites à ce que produirait un tirage au hasard
(`P(X ≥ observé)` sous `X ~ B(n, c̄)`).

---

## 6. Points forts et points faibles

Une aptitude n'est déclarée forte ou faible que si `|θ̂| > 1,645 · SE`, soit le seuil
unilatéral à 5 %.

**Ce seuil a été choisi sur mesure, pas au jugé.** À une erreur type, un candidat
d'aptitude vraie nulle recevait en moyenne **1,00 signalement par passation** : une
affirmation inventée à chaque rapport. À 1,645, un test vérifie que ce taux reste sous
0,5 signalement par passation.

Conséquence acceptée : beaucoup de rapports ne dégagent aucune force marquée, et le
rapport le dit franchement. Avec sept items par aptitude, **c'est la conclusion juste** —
un classement des cinq aptitudes serait dicté par le bruit.

C'est aussi pourquoi le radar affiche une **bande d'incertitude** plutôt qu'un simple
tracé : la marge d'erreur par aptitude est large et doit se voir.

---

## 7. Comportement mesuré

Simulations sur 300 à 400 candidats, graines fixes, passations de 35 items.

| Grandeur | Valeur mesurée |
|---|---|
| Erreur type globale | **0,316** → intervalle de confiance d'environ **19 points** |
| Erreur type par aptitude (7 items) | **0,619** → intervalle d'environ 36 points |
| Candidat de θ vrai = 0 : indice moyen | **99,6** (écart-type 4,7) |
| Recouvrement de θ vrai (θ ∈ {−1 ; 0 ; 1}) | écart moyen < 0,35 |
| **Répondeur au hasard : indice brut moyen** | **65,6** |
| **Répondeur au hasard : largeur d'intervalle** | **27,4 points** |
| **Répondeur au hasard : passations refusées** | **96,5 %** |

---

## 8. Un désaccord, argumenté et chiffré

Le critère d'acceptation demandait :

> *Une simulation de réponses aléatoires produit un score centré sur ~100 avec un IC
> large, pas sur 92 « Moyen ».*

**Je n'ai pas pu satisfaire ce critère, et je pense qu'il ne doit pas l'être.**

Le modèle 3PL pose `P(θ → −∞) = c = 0,20`. Une réussite de 20 % sur des items à cinq
options est donc exactement ce que prédit une aptitude arbitrairement faible : c'est une
observation informative, pas une absence d'information. La vraisemblance pousse θ vers le
bas, l'a priori la retient, et l'estimation se stabilise à **65,6** en moyenne.

Obtenir 100 exigerait que le modèle ignore les données pour ne restituer que l'a priori —
autrement dit qu'il ne mesure rien. Et 100 est la moyenne exacte de l'échelle : annoncer
100 à un répondeur au hasard serait un compliment, soit précisément le défaut reproché à
l'ancien 92 « Moyen ».

**Ce qui est implémenté à la place, et qui répond je crois à l'intention :** le moteur
**refuse de produire un score**. Dans 96,5 % des simulations, le test binomial conclut que
le profil ne se distingue pas du hasard, le verdict passe à `not_interpretable`, aucun
indice ni percentile n'est affiché, et l'écran indique le nombre de bonnes réponses
observées face à ce qu'un tirage au hasard produirait.

Ni 92, ni 100 : **pas de chiffre du tout**, parce qu'il n'y a rien à mesurer.

Les 3,5 % restants sont des répondeurs au hasard chanceux (12 réussites ou plus sur 35).
Ils reçoivent un indice bas assorti d'un intervalle large — ce qui est le comportement
correct : à ce niveau de réussite, on ne peut plus exclure statistiquement une aptitude
faible mais réelle.

---

## 9. Recalibration

[`src/lib/iq/calibration.ts`](../src/lib/iq/calibration.ts). Fonctions pures, sans
dépendance au stockage : elles tournent aujourd'hui côté client et tourneront à
l'identique côté serveur en Phase 4.

### 9.1 Données collectées

Chaque réponse est journalisée : item, réussite, temps de réponse, session.
Structures dans [`src/lib/iq/storage.ts`](../src/lib/iq/storage.ts), calquées sur le
schéma visé (`iq_sessions`, `iq_responses`, `iq_reports`) pour que la migration soit une
recopie.

### 9.2 Seuils proposés

| Seuil | Valeur | Justification |
|---|---|---|
| Réponses par item avant recalibration | **200** | En dessous d'environ 150, l'erreur type sur la difficulté empirique dépasse l'écart entre deux niveaux de conception : « mesurer » ajouterait du bruit à une estimation déjà raisonnable. |
| Passations avant re-normage des percentiles | **300** | Un centile doit représenter au moins trois personnes. |

Ces seuils sont volontairement modestes. Un étalonnage publiable en exigerait bien
davantage ; l'objectif ici est de faire mieux qu'un barème posé à vue, pas de prétendre à
une norme nationale.

### 9.3 Formules

**Difficulté empirique**, à partir de la proportion de réussite `p`, corrigée du hasard :

```
p*  = clamp( (p − c) / (1 − c), 0,01 , 0,99 )
b   = clamp( −Φ⁻¹(p*) / (D · a) , −3 , +3 )
```

La correction est indispensable : sans elle, un item que personne ne résout afficherait
`p = 0,20` et serait lu comme « difficile » plutôt que comme « jamais résolu ».

**Pouvoir discriminant**, à partir de la corrélation item-total `r` :

```
a = clamp( |r| / √(1 − r²) , 0,4 , 2,5 )
```

Un item qui ne corrèle pas avec le reste du test ne mesure pas la même chose que lui ;
sa pente s'effondre et son poids dans l'estimation diminue d'autant.

`Φ⁻¹` est l'approximation rationnelle de Peter Acklam (erreur relative < 1,15·10⁻⁹).

### 9.4 Re-normage

`computeNormingStats` résume la distribution des θ observés (effectif, moyenne,
écart-type, valeurs triées). Si la population réelle de NEXUS est plus forte ou plus
faible que la loi de référence, les percentiles s'appuient sur elle. **Le test devient
donc plus juste avec l'usage** — c'est ce qui le sépare d'un test en ligne figé.

### 9.5 Procédure

1. Exporter les passations complètes.
2. `recalibrateBank(bank, sessions)` — seuls les items au-delà de 200 réponses changent.
3. Contrôler les items dont `a` s'effondre sous 0,5 ou dont `b` bute sur une borne :
   ce sont des candidats à la réécriture, pas à la recalibration.
4. `computeNormingStats(thetas)` et bascule du percentile en régime empirique au-delà
   de 300 passations.
5. Versionner la banque : deux passations calibrées différemment ne sont comparables que
   si l'on sait laquelle a servi.

---

## 10. Limites assumées

1. **Les items n'ont jamais été pré-testés.** Les difficultés sont des estimations de
   conception. Tant que la recalibration n'a pas tourné, l'estimation est cohérente mais
   son étalonnage reste hypothétique.
2. **« Mémoire de travail » mesure la manipulation, pas l'empan.** L'énoncé reste affiché
   pendant la réponse. Un empan mnésique exigerait une présentation chronométrée puis
   masquée, mécanique d'interface qui n'existe pas encore. Prétendre mesurer l'empan
   serait faux ; c'est écrit dans le code, au-dessus des items concernés.
3. **Un seul pouvoir discriminant pour toute la banque** (`a = 1,0`) tant qu'aucune
   donnée n'existe.
4. **Aucun test adaptatif.** Les items sont choisis avant la passation, pas ajustés au
   fil des réponses. Un test adaptatif atteindrait la même précision avec moins d'items ;
   il suppose une banque calibrée, donc il vient après la recalibration.
5. **Aucune analyse de fonctionnement différentiel.** On ne vérifie pas encore qu'un item
   ne désavantage pas systématiquement un groupe à aptitude égale. Cela exige des données
   démographiques que le produit ne collecte pas.
6. **Le stockage est local.** Rien n'est vérifiable côté serveur, le journal de réponses
   ne quitte pas l'appareil, et la recalibration n'a donc pas encore de matière réelle.
   Levée en Phase 4.
7. **Les omissions comptent comme des échecs.** C'est le parti pris le plus défavorable au
   candidat, et le seul qui empêche d'améliorer son score en sautant les items difficiles.
8. **Ce n'est pas un test clinique.** Aucune passation supervisée, aucune identité
   vérifiée, aucune condition standardisée. L'attestation ne porte plus le mot
   « officiel » et ne mentionne un écart-type que si le référentiel est réellement mesuré.
