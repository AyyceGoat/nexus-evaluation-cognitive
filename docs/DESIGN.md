# DESIGN — Système visuel de NEXUS

Écrit avant toute ligne d'interface, comme prévu au plan. Les ratios de contraste sont
calculés par [`scripts/contrast.mjs`](../scripts/contrast.mjs) — `node scripts/contrast.mjs`
les reproduit. Aucune valeur de ce document n'a été estimée à l'œil.

---

## 1. La phrase

> NEXUS est reconnaissable parce qu'il montre toujours sa marge d'erreur : partout où le
> produit avance un chiffre, la barre d'incertitude est dessinée juste à côté, dans la
> seule couleur de la page.

Tout le reste du système découle de là. Le fond est noir et muet, la typographie est
celle des formulaires administratifs, et l'unique accent est réservé à la mesure et à son
intervalle. Ce n'est pas une décoration : c'est la thèse du produit rendue visible.

---

## 2. Palette

Six couleurs. Une septième, purement fonctionnelle, pour les erreurs.

| Token | Hex | Rôle |
|---|---|---|
| `--noir` | `#000000` | Fond de page. Noir vrai, pas un noir teinté. |
| `--graphite` | `#141414` | Surface posée sur le fond : panneaux, lignes de liste. |
| `--ardoise` | `#232323` | Bordures, séparateurs, surface de second niveau. |
| `--brume` | `#8A8A8A` | Texte secondaire, libellés, métadonnées. |
| `--craie` | `#F2F0EC` | Texte principal. Blanc cassé légèrement chaud. |
| `--mesure` | `#5FB3A8` | **Unique accent.** Valeur mesurée, intervalle, focus, CTA principal. |
| `--alerte` | `#E8877A` | Fonctionnel : erreurs de formulaire, réponse fausse. |

### 2.1 Contrastes vérifiés

| Paire | Ratio | Verdict texte normal |
|---|---|---|
| `craie` sur `noir` | **18,45** | AAA |
| `craie` sur `graphite` | **16,19** | AAA |
| `craie` sur `ardoise` | **13,81** | AAA |
| `brume` sur `noir` | **6,08** | AA |
| `brume` sur `graphite` | **5,34** | AA |
| `brume` sur `ardoise` | **4,55** | AA |
| `mesure` sur `noir` | **8,50** | AAA |
| `mesure` sur `graphite` | **7,46** | AAA |
| `mesure` sur `ardoise` | **6,36** | AA |
| `alerte` sur `noir` | **8,18** | AAA |
| `alerte` sur `graphite` | **7,17** | AAA |
| `noir` sur `mesure` | **8,50** | AAA |
| `noir` sur `alerte` | **8,18** | AAA |

Le point à retenir : **`brume` passe AA jusque sur la surface la plus claire du système**
(4,55 sur `ardoise`). C'est ce qui corrige le défaut structurel relevé à l'audit, où
`--nexus-muted` plafonnait à **4,26** sur le fond de page — donc échouait partout, pour
tout le texte secondaire du site, systématiquement composé en 11 ou 12 px.

### 2.2 Deux règles dures

**Sur l'accent, le texte est noir.** `craie` sur `mesure` donne **2,17** : échec net.
`noir` sur `mesure` donne 8,50. Tout bouton, badge ou pastille rempli en `mesure` porte
donc du texte noir. Même règle pour `alerte` (2,26 contre 8,18).

**`ardoise` n'est jamais du texte.** 1,34 sur `noir`. C'est une bordure et une surface,
rien d'autre.

### 2.3 Ce que la palette n'a pas

Aucun violet, aucun indigo, aucun dégradé de couleur. L'ancienne identité comptait
120 occurrences de violet **et 233 autres couleurs en dur réparties sur neuf familles**
(ambre, émeraude, cyan, rose, orange, jaune, rouge, vert, ardoise), dont aucune n'était
un token. Il n'y a désormais **qu'un seul accent**, et il ne sert qu'à la mesure.

Ni vert acide ni vermillon : `#5FB3A8` est un turquoise désaturé, choisi comme encre
d'instrument — la couleur des cadrans techniques et des bleus d'architecte. Il est à
l'opposé de l'ancien indigo sur la roue des teintes sans tomber dans l'un des deux
écueils interdits.

---

## 3. Typographie

Deux familles, auto-hébergées en `woff2` variable via `@fontsource-variable`. Plus aucune
requête vers `fonts.googleapis.com` : l'ancien `index.html` chargeait 12 graisses dans
une feuille de style bloquant le rendu.

| Usage | Famille | Fichier | Poids |
|---|---|---|---|
| Titres | **Bricolage Grotesque** (axe `wght`) | `bricolage-grotesque-latin-wght-normal.woff2` | 44 ko |
| Texte, interface, **tous les chiffres** | **Public Sans** (axe `wght`) | `public-sans-latin-wght-normal.woff2` | 28 ko |

Sous-ensemble `latin` uniquement : il couvre les diacritiques du français.

### 3.1 Décision — les chiffres sont en Public Sans, pas en Bricolage

Public Sans est dessinée pour les formulaires de l'administration américaine. Ses
chiffres sont désambiguïsés par conception, sa hauteur d'x est grande, et elle tient à
petit corps : exactement les contraintes d'un rapport dense en nombres et d'une
attestation. Bricolage Grotesque est une grotesque à caractère, très bonne en titre et
inutilement expressive sur un indice à trois positions qui est *le* chiffre du produit.

Donc : **Bricolage pour les titres, Public Sans partout ailleurs, chiffres compris**,
avec `font-variant-numeric: tabular-nums` sur toute donnée numérique, afin que les
colonnes s'alignent et qu'un score ne se décale pas en passant de 99 à 100.

*Réserve honnête : je n'ai pas pu regarder ces polices s'afficher dans cette session. Le
choix ci-dessus repose sur la finalité de conception de chaque fonte, pas sur une
inspection visuelle. Consigné au journal.*

### 3.2 Échelle

Base 16 px. Rapport d'environ 1,25 en bas d'échelle, plus large en haut.

| Token | Taille | Interligne | Graisse | Letter-spacing | Usage |
|---|---|---|---|---|---|
| `--pas-display` | 56 px | 1,04 | 600 | −0,03em | Titre du hero |
| `--pas-t1` | 36 px | 1,10 | 600 | −0,02em | Titre de page |
| `--pas-t2` | 24 px | 1,20 | 600 | −0,01em | Titre de section |
| `--pas-t3` | 18 px | 1,30 | 550 | 0 | Sous-titre |
| `--pas-corps` | 16 px | 1,60 | 400 | 0 | Texte courant |
| `--pas-petit` | 14 px | 1,50 | 400 | 0 | Texte secondaire |
| `--pas-micro` | 12 px | 1,40 | 500 | +0,01em | Libellés, métadonnées |

Le hero descend à 36 px sous 640 px de large. Aucun texte sous 12 px.

**Longueur de ligne : 66 caractères visés, 72 au maximum** (`max-width: 34rem` sur le
texte courant). L'ancienne mise en page laissait les paragraphes courir sur toute la
largeur disponible.

### 3.3 Les chiffres du rapport

C'est le cas d'usage le plus important du produit, il a donc ses propres règles.

```
Indice estimé            L'intervalle est aussi présent que le chiffre :
                         ni en petit, ni en gris, ni relégué en dessous.
  112     104 ─────── 120
   |            |
   |            +-- 16 px, tabulaire, couleur mesure
   +-- 48 px, Public Sans 600, tabular-nums
```

- L'indice : `--pas-display` réduit à 48 px, poids 600, `tabular-nums`.
- L'intervalle : `--pas-corps`, `tabular-nums`, en `mesure`, **immédiatement à côté** et
  jamais en note de bas de bloc.
- Le centile : `--pas-t3`, suivi de la population de référence en `--pas-petit` / `brume`.
- Tout tableau de données : `tabular-nums`, nombres alignés à droite.

Interdit : le monospace pour les petits libellés. C'est un marqueur de gabarit généré, et
Public Sans tabulaire règle le problème d'alignement sans changer de famille.

---

## 4. Espacement, rayons, élévation

### 4.1 Espacement — base 4 px

`--esp-1` 4 · `--esp-2` 8 · `--esp-3` 12 · `--esp-4` 16 · `--esp-6` 24 · `--esp-8` 32 ·
`--esp-12` 48 · `--esp-16` 64 · `--esp-24` 96 · `--esp-32` 128

Rythme vertical des sections : `--esp-24` en mobile, `--esp-32` au-delà de 768 px.
Beaucoup d'espace négatif : c'est lui qui porte le calme, pas les couleurs.

### 4.2 Rayons — quatre valeurs, et une hiérarchie réelle

| Token | Valeur | Usage |
|---|---|---|
| `--rayon-0` | 0 | Surfaces de données : lignes de tableau, cellules de matrice, barres |
| `--rayon-1` | 2 px | Champs, boutons, pastilles |
| `--rayon-2` | 4 px | Panneaux, cartes |
| `--rayon-3` | 8 px | Conteneurs de dialogue uniquement |

L'ancien code appliquait `rounded-2xl` et `rounded-3xl` indifféremment partout : c'est le
premier marqueur du « kit cartes SaaS ». Ici le rayon **encode le niveau**, et les
surfaces de données sont franchement carrées.

### 4.3 Élévation — par la bordure, pas par l'ombre

**Aucune ombre grise douce sous les panneaux.** C'est le marqueur le plus reconnaissable
du design généré. La profondeur vient de l'empilement fond → surface → bordure :

| Niveau | Fond | Bordure |
|---|---|---|
| 0 — page | `noir` | — |
| 1 — panneau | `graphite` | `ardoise`, 1 px |
| 2 — panneau dans panneau | `ardoise` | `ardoise` éclaircie |
| 3 — survol | inchangé | la bordure passe à `brume` |

Une seule vraie ombre dans tout le système, réservée au calque de dialogue :
`0 24px 64px -12px rgb(0 0 0 / 0.8)`. Elle sépare le modal de la page, elle ne décore rien.

Pas de halo flou, pas de dégradé de fond, pas d'orbe : l'ancien `index.css` avait
`.bg-mesh` (quatre dégradés radiaux), `.glow-border`, `.particle` et sept `blur-3xl`.
Tout disparaît.

---

## 5. Motion

| Token | Durée | Usage |
|---|---|---|
| `--duree-1` | 120 ms | Changement d'état : survol, focus, appui |
| `--duree-2` | 200 ms | Entrée et sortie d'un élément : dialogue, panneau |
| `--duree-3` | 320 ms | Grand déplacement : ouverture de tiroir |

Courbe unique : `cubic-bezier(0.2, 0, 0, 1)`. Départ franc, arrivée douce.

### La règle du quand animer

**On anime ce que l'utilisateur vient de provoquer. Jamais autre chose.**

- Autorisé : le focus qui se pose, un dialogue qui s'ouvre, une bascule, une barre de
  progression qui avance, un squelette qui pulse pendant un chargement réel.
- Interdit : les entrées au défilement. L'ancien code déclenchait `fadeIn` / `slideUp`
  plus `stagger-1..8` sur presque chaque section. Rien n'apparaît au scroll.
- Interdit : les boucles infinies décoratives (`animate-float`, `animate-pulse-glow`,
  30 particules). Elles consomment la batterie d'un téléphone d'entrée de gamme sans rien
  apporter.

### `prefers-reduced-motion: reduce`

Toutes les durées passent à 0,01 ms, toutes les translations sont supprimées, et la scène
3D adopte une pose fixe sans boucle de rendu. Appliqué par une règle globale unique, pas
composant par composant.

---

## 6. Écriture

Voix active, phrases courtes, casse de phrase. Français, ton adapté au public ivoirien —
pas un SaaS américain traduit.

| Au lieu de | Écrire |
|---|---|
| « Commencer » | « Commencer l'évaluation » |
| « Une erreur est survenue » | « Le numéro doit comporter 10 chiffres. » |
| « Oups, rien ici ! » | « Vous n'avez pas encore passé d'évaluation. En commencer une. » |
| « Traitement sécurisé en cours… » | « Confirmez le paiement sur votre téléphone. » |

Un CTA dit ce qui se passe. Une erreur dit quoi faire, ne s'excuse pas, ne reste pas
vague. Un état vide propose l'action qui le remplit.

Interdits d'écriture, tous présents dans l'ancien code : les eyebrows en MAJUSCULES
espacées au-dessus de chaque section ; les chaînes méta au point médian ; la flèche `→`
collée à la fin des liens ; un mot du titre coloré pour « accentuer ».

---

## 7. Le radar : aucun chiffre par aptitude

Contrainte imposée par le modèle, pas par le goût.

L'erreur type mesurée par aptitude est de **0,619** sur l'échelle de θ, soit un intervalle
de confiance d'environ **36 points**. Un sous-score chiffré par aptitude serait donc du
bruit habillé en mesure — et cinq sous-scores alignés inviteraient à les classer, ce que
les données ne permettent pas.

Le graphique montre donc un **profil relatif** : quelles aptitudes ressortent chez ce
répondant *par rapport à ses autres aptitudes*, en bandes dont la largeur est
l'incertitude.

```
   Matrices logiques
   +--------------------------------------+
   |            [======]                  |   <- la bande EST la mesure
   +--------------------------------------+
   Séries numériques
   +--------------------------------------+
   |                  [======]            |
   +--------------------------------------+
   Analogies verbales
   +--------------------------------------+
   |   [======]                           |
   +--------------------------------------+
    plus faible                 plus fort
    que vos autres              que vos autres

   Le détail par aptitude est indicatif. Seul l'indice global est estimé
   avec une précision suffisante pour être lu comme un nombre.
```

Décisions de rendu qui en découlent :

- Bandes horizontales empilées, pas une toile en étoile : une toile suggère une surface et
  invite à comparer des aires, ce qui amplifie visuellement des écarts non significatifs.
- Aucun pourcentage, aucun centile, aucun rang affiché par aptitude.
- L'axe n'est pas gradué en valeurs absolues mais en « plus faible / plus fort que vos
  autres aptitudes ».
- Une aptitude n'est nommée « point fort » que si l'écart survit à 1,645 erreur type
  (règle du moteur, cf. `SCORING.md` §6). Sinon rien n'est affirmé.

---

## 8. Wireframe — landing

```
+------------------------------------------------------------------------+
| NEXUS              Évaluation  Savoir  Pays  Quiz      [ S'inscrire ]  |  56px, graphite
+------------------------------------------------------------------------+
|                                                                        |
|                                          +------------------+          |
|  Mesurez vos aptitudes                   |                  |          |
|  cognitives. Avec la                     |    ROBOT 3D      |          |
|  marge d'erreur.                         |                  |          |  seul endroit
|                                          | canvas différé,  |          |  audacieux
|  35 questions, 25 minutes.               | poster WebP en   |          |
|  Gratuit, sans compte.                   | repli            |          |
|                                          |                  |          |
|  [ Commencer l'évaluation ]              +------------------+          |
|    ^ fond mesure, texte noir                                           |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|  Ce que vous obtenez                                                   |  t2
|                                                                        |
|  Un indice estimé      Un profil par        Un centile dont la         |  3 colonnes
|  112  104 --- 120      aptitude, en         population est nommée.     |  séparées par
|  L'intervalle fait     bandes larges.                                  |  des filets,
|  partie du résultat.                                                   |  pas 3 cartes
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|  Si vos réponses ne se distinguent pas d'un tirage au hasard,          |  bloc graphite
|  aucun score n'est affiché. Un chiffre inventé ne vous                 |  filet mesure
|  apprendrait rien.                                                     |  à gauche
|                                                                        |
+------------------------------------------------------------------------+
|  Explorer aussi                                                        |
|    195 pays                                                            |  vraie liste
|    Bibliothèque du savoir                                              |  verticale
|    464 questions de quiz                                               |
+------------------------------------------------------------------------+
|  NEXUS          Méthode   Mentions   Contact                           |
+------------------------------------------------------------------------+
```

---

## 9. Wireframe — dashboard

Trois niveaux de lecture, pas une grille de cartes identiques.

```
+------------------------------------------------------------------------+
| NEXUS                                                    Kouassi  v    |
+------------------------------------------------------------------------+
|                                                                        |
| NIVEAU 1 — ce qui doit sauter aux yeux                                 |
| +--------------------------------------------------------------------+ |
| | Votre dernière évaluation                    9 septembre 2026      | |
| |                                                                    | |
| |    112       104 ------------ 120                                  | |  48px / 16px
| |    indice    intervalle 95 %                                       | |  couleur mesure
| |                                                                    | |
| |    68e centile — sur une distribution théorique de référence       | |
| |                                                                    | |
| |    [ Voir le rapport ]     [ Repasser une évaluation ]             | |
| +--------------------------------------------------------------------+ |
|                                                                        |
| NIVEAU 2 — ce qui se consulte                                          |
|   Profil par aptitude                                                  |
|     Matrices logiques    +--------[======]------------+                |
|     Séries numériques    +--------------[======]------+                |
|     Analogies verbales   +---[======]-----------------+                |
|     Rotation spatiale    +----------[======]----------+                |
|     Mémoire de travail   +------------[======]--------+                |
|     Indicatif — seul l'indice global est estimé précisément            |
|                                                                        |
|   Vos évaluations                                        3 passations  |
|     9 sept. 2026   112   104-120   35 questions      Rapport           |
|     2 sept. 2026   108   100-116   35 questions      Rapport           |
|     28 août 2026    —    profil non interprétable    Détail            |
|                                                                        |
| NIVEAU 3 — ce qui se cherche rarement                                  |
|     Transactions    Profil    Paramètres      liens discrets, bas      |
+------------------------------------------------------------------------+
```

### Mobile 360 px — le tableau devient une liste

Un tableau à cinq colonnes est illisible à 360 px, et le faire défiler horizontalement
est un aveu d'échec. Chaque passation devient un bloc :

```
+----------------------------------+
| 9 septembre 2026                 |
|                                  |
| 112      104 ---- 120            |
| indice   intervalle 95 %         |
|                                  |
| 35 questions                     |
| [ Voir le rapport ]              |   44px de haut minimum
+----------------------------------+
+----------------------------------+
| 28 août 2026                     |
| Profil non interprétable         |
| [ Voir le détail ]               |
+----------------------------------+
```

---

## 10. États obligatoires

Tout écran affichant des données en a quatre. Aucun n'est facultatif.

| État | Règle |
|---|---|
| **Chargement** | Squelette qui reprend la forme du contenu attendu. Jamais un spinner centré. |
| **Vide** | Conçu : une phrase qui explique, un bouton qui remplit l'écran. |
| **Erreur** | Ce qui s'est passé, et un bouton qui réessaie. Jamais « une erreur est survenue ». |
| **Succès** | Le contenu. |

---

## 11. Focus et cible tactile

- **Focus visible partout** : `outline: 2px solid var(--mesure)` avec
  `outline-offset: 2px`, posé via `:focus-visible`. L'ancien code mettait
  `focus:outline-none` sur les huit champs de saisie sans rien en remplacement : le focus
  clavier était invisible sur tous les formulaires.
- **Cible tactile ≥ 44 px** sur les commandes réelles, obtenue par le padding du
  composant. L'ancien `index.css` forçait `min-height: 44px` sur *tous* les `button, a`
  sous 640 px, ce qui étirait aussi les liens en ligne du pied de page.
- Un seul système d'icônes : `lucide-react`, avec `aria-hidden` quand l'icône double un
  libellé. Plus aucun emoji comme icône structurelle — un emoji change de dessin à chaque
  système d'exploitation, on ne construit pas une identité dessus.
