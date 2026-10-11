---
title: Spécification
description: La spécification du format PlankMD v0.1, en français
---

<!--
  French translation of SPEC.md (PlankMD v0.1). SPEC.md is the reference:
  when it changes, update this page in the same pull request.
-->

# PlankMD : spécification du format v0.1

::: info Traduction
Cette page est une traduction. La version de référence est
[la spécification en anglais](/spec), qui fait foi en cas de différence.
:::

> Statut : brouillon, octobre 2026
> Licence : MIT

---

## Principe

PlankMD décrit des **constructions faites de planchettes de bois identiques**
(les fines planchettes rectangulaires qu'on empile librement) et **l'ordre
dans lequel les construire**. Un fichier `.plank.md` est à la fois un modèle
lisible par une machine et un livret de montage lisible par une personne : le
texte entre les blocs est le texte du livret, les blocs sont les planchettes,
et les lignes sont écrites dans l'ordre où l'on pose les planchettes.

PlankMD ne dépend d'aucune marque. Les proportions de la planchette sont un
paramètre du fichier, avec une valeur par défaut (15 : 3 : 1) qui correspond
aux planchettes les plus vendues.

| Principe | Description |
|---|---|
| **Markdown d'abord** | Un fichier `.plank.md` est du Markdown valide, lisible dans n'importe quel éditeur |
| **Tout dans le fichier** | Toute la construction tient dans le fichier, sans base de données |
| **Sur une grille** | Les positions se comptent en épaisseurs de planchette : la plupart des modèles n'utilisent que de petits entiers |
| **En forme de livret** | Un bloc = une étape de montage ; le texte entre les blocs = les instructions ; les lignes sont écrites dans l'ordre de pose |
| **Pensé pour l'IA** | Une planchette par ligne, des lignes courtes et régulières : faciles à générer, à comparer et à vérifier |
| **Progressif** | Le niveau 0, c'est quatre valeurs par ligne ; le reste est optionnel |

Les mots-clés DOIT (MUST), DEVRAIT (SHOULD) et PEUT (MAY) s'entendent au sens
de la RFC 2119.

---

## Niveaux du format

| Niveau | Mécanisme | Usage |
|---|---|---|
| 0 | Un bloc ` ```plank `, une planchette par ligne | Une construction en une seule étape |
| 1 | Frontmatter YAML ; plusieurs blocs = plusieurs étapes | Métadonnées, taille de planchette, étapes de montage |
| 2 | Attributs par ligne (`color`, `id`, `repeat`, `rot`, `pivot`…) et gabarits | Couleurs, noms, répétitions compactes, angles libres, mesure des écarts |

Chaque niveau contient strictement le précédent.

---

## Système de coordonnées

- **Unité `u`** : l'**épaisseur** de la planchette. Avec la planchette par
  défaut, `1 u = 7,8 mm` et une planchette mesure **15 u × 3 u × 1 u**
  (longueur × largeur × épaisseur).
- **Axes** : repère direct, **`z` vers le haut**. `x` va vers la droite, `y`
  s'éloigne de l'observateur. Le sol est le plan `z = 0`.
- **Ancre** : la position `(x, y, z)` d'une planchette est le **coin
  minimal** de sa boîte englobante (le coin aux plus petits `x`, `y` et `z`),
  avant toute rotation.
- Les coordonnées sont des nombres décimaux, écrits avec un point. Les entiers
  sont recommandés ; les demi-unités (`7.5`) sont courantes pour centrer un
  modèle. Les lecteurs DOIVENT accepter les décimaux et les valeurs négatives.

### Orientations

Une planchette est posée dans l'une de trois **positions**, et dans chacune sa
grande dimension (ou, debout, sa largeur) suit l'axe `x` ou l'axe `y`. Cela
donne six orientations :

| Orientation | Position | Boîte englobante (x × y × z), planchette par défaut |
|---|---|---|
| `flat-x` | à plat sur sa grande face, longueur selon x | 15 × 3 × 1 |
| `flat-y` | à plat sur sa grande face, longueur selon y | 3 × 15 × 1 |
| `edge-x` | sur la tranche, longueur selon x | 15 × 1 × 3 |
| `edge-y` | sur la tranche, longueur selon y | 1 × 15 × 3 |
| `up-x` | debout sur un bout, largeur selon x | 3 × 1 × 15 |
| `up-y` | debout sur un bout, largeur selon y | 1 × 3 × 15 |

Pour une planchette `[L, W, T]`, remplacer 15, 3 et 1 par `L`, `W` et `T`.

---

## Syntaxe de base (niveau 0)

````markdown
```plank
flat-x 0 0 0
flat-x 0 12 0
flat-y 0 0 1
flat-y 12 0 1
```
````

- Une planchette par ligne : `<orientation> <x> <y> <z>`, séparés par des
  espaces.
- Les lignes vides sont ignorées. `#` ouvre un commentaire, jusqu'à la fin de
  la ligne.
- L'ordre des lignes est l'**ordre de pose** (voir [Ordre de pose](#ordre-de-pose)).
- Seuls les blocs de code dont l'info string commence par le mot `plank` sont
  lus. Tout autre bloc de code, y compris une clôture plus longue qui cite un
  bloc `plank` (comme dans ce document), est du Markdown ordinaire.

---

## Frontmatter et étapes (niveau 1)

```yaml
---
plankmd: "0.1"            # version de la spec (obligatoire au niveau 1)
title: Small square tower # obligatoire au niveau 1
lang: en                  # BCP 47, optionnel
plank: [15, 3, 1]         # L, W, T en unités ; par défaut [15, 3, 1]
unit_mm: 7.8              # taille réelle de 1 u, pour le rendu et l'échelle d'impression
inventory: 30             # planchettes que le constructeur est censé avoir (optionnel)
difficulty: 1             # de 1 (tout-petit) à 5 (expert), optionnel
author: Jane Doe          # optionnel
license: CC-BY-4.0        # identifiant SPDX de la licence du modèle, optionnel
palette:                  # couleurs nommées pour `color=` (niveau 2), optionnel
  roof: "#b03a2e"
---
```

Le frontmatter est un dictionnaire YAML plat, plus le seul dictionnaire
imbriqué `palette`. Les clés inconnues sont permises et ignorées, pour que les
outils puissent ajouter les leurs.

**Étapes.** Chaque bloc ` ```plank ` est **une étape de montage**, dans
l'ordre du document. Les étapes se cumulent : l'étape *n* montre tout ce qui
a été posé aux étapes 1 à *n*. Le dernier titre Markdown avant un bloc est le
titre de l'étape ; le texte entre ce titre et le bloc en est l'instruction.

Un fichier avec un seul bloc et sans frontmatter est un fichier de niveau 0
valide : une étape, toute la construction.

---

## Attributs de ligne (niveau 2)

Après les quatre champs de position, une ligne peut porter des attributs
`clé=valeur`, sans espace autour du `=` :

| Attribut | Valeur | Signification |
|---|---|---|
| `color` | couleur CSS ou clé de `palette` | Couleur de la planchette. Par défaut : bois naturel |
| `id` | slug (`[a-z0-9]` et `-`) | Nomme la planchette, pour y renvoyer depuis le texte. Unique dans le fichier |
| `repeat` | entier ≥ 1 | Développe la ligne en `repeat` planchettes |
| `offset` | `dx,dy,dz` | Décalage entre deux répétitions (obligatoire avec `repeat`) |
| `rot` | degrés | Rotation autour d'un axe vertical, dans le sens inverse des aiguilles d'une montre vu du dessus. Axe par défaut : le centre de la planchette |
| `rot-step` | degrés | Rotation ajoutée à chaque répétition (spirales) |
| `pivot` | `px,py` | Axe vertical de `rot` et `rot-step`, à la place du centre de la planchette. La planchette tourne autour, position comprise |

La répétition `i` (à partir de 0) se place en `position + i × offset`, puis
tourne de `rot + i × rot-step` autour de son propre centre, ou autour de
`pivot` s'il est donné. Le pivot ne suit pas `offset` : un escalier en
colimaçon tient donc en une ligne. Une ligne répétée avec `id=foo` donne
`foo-1`, `foo-2`, …

````markdown
```plank
flat-x 0 0 0 repeat=5 offset=0,0,2                              # cinq planchettes, une tous les 2 u
flat-x 0 0 10 repeat=5 offset=0,3,0 color=roof                  # cinq planchettes côte à côte
flat-x 0 -1.5 0 repeat=36 offset=0,0,1 rot-step=10 pivot=0,0    # escalier en colimaçon
```
````

Les rotations ne tournent qu'autour d'un axe vertical : les planchettes
restent toujours de niveau ou d'aplomb. Les planchettes inclinées ne font pas
partie de la v0.1.

---

## Ordre de pose

On pose les planchettes une par une, et le fichier dit dans quel ordre :

1. Les **étapes** viennent dans l'ordre du document.
2. **Dans une étape**, les lignes viennent dans l'ordre où elles sont écrites.
3. **Les lignes répétées s'entrelacent par tour** : le tour 0 de chaque
   ligne, dans l'ordre des lignes, puis le tour 1 de chaque ligne qui a encore
   des répétitions, et ainsi de suite. Une ligne dont le `repeat` est épuisé
   sort des tours suivants.

La règle 3 suit la façon dont on décrit un montage par couches : les lignes
d'un bloc forment une couche, et `repeat` empile cette couche. Le bloc

````markdown
```plank
flat-x 0 0 2  repeat=4 offset=0,0,2   # A
flat-y 0 0 3  repeat=4 offset=0,0,2   # B
```
````

se pose A₀, B₀, A₁, B₁, A₂, B₂, A₃, B₃ : couche après couche, chaque planchette
reposant sur des planchettes posées avant elle. Pour poser toutes les
répétitions d'une ligne avant la ligne suivante, les mettre dans deux étapes.

**Numéro de planchette.** Chaque planchette a un numéro : son rang, à partir
de 1, dans l'ordre de pose sur tout le fichier. Il n'est jamais écrit dans le
fichier, donc insérer une planchette ne demande aucune renumérotation. Les
outils s'en servent pour désigner une planchette (« la planchette 17 flotte »)
et les lecteurs PEUVENT s'en servir pour rejouer une étape planchette par
planchette. Il ne reste stable que tant que rien ne change avant lui : pour
une référence qui doit survivre aux modifications, comme un renvoi depuis le
texte, donner un `id` à la planchette.

---

## Gabarits (niveau 2)

On mesure un écart avec des planchettes : pour bien espacer deux murs, on pose
des planchettes entre eux comme une règle, puis on les retire. Un **gabarit**
(`guide`) est une telle planchette-règle. Il montre au constructeur combien
d'espace laisser, et il permet au validateur de vérifier que l'espace est le
bon.

Un gabarit est une ligne qui commence par le mot `guide`. Le reste de la ligne
est une ligne de planchette ordinaire, attributs compris (sauf `color`) :

````markdown
## Step 1: the first layer

Lay two planks flat and parallel. To space them, lay three planks side by
side between them, then take those three away.

```plank
guide flat-x 0 3 0 repeat=3 offset=0,3,0
flat-x 0 0 0
flat-x 0 12 0
flat-y 0 0 1
flat-y 12 0 1
```
````

Un gabarit ne fait pas partie de la construction :

- **Il n'est montré que pendant son étape**, en fantôme (translucide, avec
  ses arêtes), et disparaît dès l'étape suivante.
- **Il n'a pas de numéro et ne compte pas** dans le total des planchettes ni
  dans `inventory`.
- **Il ne porte rien.** Une planchette qui ne repose que sur un gabarit
  flotte.
- **Il n'a pas besoin d'appui** : il peut rester en l'air pour mesurer
  l'écart entre deux murs en hauteur.

Un gabarit est aussi une **affirmation sur l'écart** : les planchettes de son
étape doivent lui laisser la place. Un gabarit qui partage un volume avec une
vraie planchette, posée avant lui ou n'importe où dans la même étape, signifie
que l'écart est trop petit (`E-guide-overlap`). Les gabarits d'une même étape
qui se touchent forment une **chaîne**, pour qu'un écart puisse se mesurer
avec plusieurs règles mises bout à bout. Une règle mesure *entre* deux
choses : chaque chaîne doit toucher au moins **deux vraies planchettes**
posées jusqu'à la fin de son étape, les deux bords de l'écart. Une chaîne qui
en touche moins (`W-guide-loose`) est mal placée, ou l'écart qu'elle mesure
est trop large.

On peut combiner les gabarits pour mesurer n'importe quel écart : longueurs,
largeurs et épaisseurs. Les 33 u entre les deux piles d'un pont font deux
longueurs et une largeur :

```plank
guide flat-x 15 0 0
guide flat-x 30 0 0
guide flat-y 45 0 0
```

Les lecteurs qui ne gèrent pas les gabarits DOIVENT ignorer les lignes
`guide` (avec un avertissement) plutôt que de les construire, car un gabarit
construit comme une planchette change le modèle.

---

## Validation

Un validateur développe chaque ligne, puis pose les planchettes **une par
une, dans l'ordre de pose**, et vérifie chacune au moment où elle est posée :
seules existent les planchettes posées avant elle. Deux planchettes qui
partagent une face se touchent, elles ne se chevauchent pas. Les diagnostics
DEVRAIENT donner le numéro de la planchette et le numéro de la ligne dans le
fichier.

| Code | Gravité | Règle |
|---|---|---|
| `E-parse` | erreur | Une ligne ou une valeur d'attribut ne respecte pas la grammaire |
| `E-orientation` | erreur | Orientation inconnue |
| `E-frontmatter` | erreur | Une valeur du frontmatter a le mauvais type (`plank` qui n'est pas trois nombres positifs, `inventory` qui n'est pas un entier…) |
| `E-duplicate-id` | erreur | Deux planchettes ont le même `id` après développement |
| `E-below-ground` | erreur | Une planchette a `z < 0` |
| `E-overlap` | erreur | Une planchette partage un volume avec une planchette posée avant elle |
| `W-frontmatter` | avertissement | Frontmatter sans `plankmd` ou sans `title` |
| `W-unknown-attribute` | avertissement | Clé d'attribut inconnue ; l'attribut est ignoré |
| `W-floating` | avertissement | Une planchette avec `z > 0` ne repose sur rien quand elle est posée : aucune planchette posée avant elle n'a sa face du dessus en contact avec la face du dessous de la nouvelle, sur une surface non nulle. Un contact sur le côté ne compte pas, ni une planchette posée après, même dans la même étape |
| `W-inventory` | avertissement | Plus de planchettes que `inventory` |
| `W-unchecked-rotation` | avertissement | Le validateur ne sait pas vérifier exactement une planchette tournée. Il DOIT le dire plutôt que de déclarer la planchette valide |
| `E-guide-overlap` | erreur | Un gabarit partage un volume avec une vraie planchette posée avant lui ou dans la même étape : l'écart qu'il mesure est trop petit |
| `W-guide-loose` | avertissement | Une chaîne de gabarits touche moins de deux vraies planchettes posées jusqu'à la fin de son étape : mal placée, ou écart trop large |

`W-floating` est un avertissement et non une erreur, parce qu'on peut tenir
une planchette pendant qu'on pose son appui ; mais il vaut mieux alors
corriger l'ordre de pose.

**Planchettes tournées.** Comme les rotations ne tournent qu'autour d'un axe
vertical, la plage de hauteur d'une planchette reste alignée sur les axes, et
chaque vérification se ramène à des rectangles dans le plan du sol. Un test
exact (théorème de l'axe séparateur sur les deux emprises) tient en quelques
lignes ; les validateurs DEVRAIENT l'implémenter plutôt que de se rabattre
sur `W-unchecked-rotation`.

**La stabilité est hors du périmètre.** Une construction peut passer la
validation et tomber quand même : centre de gravité hors de la base, porte-à-faux
trop longs, spirale qui tourne trop vite. Un outil PEUT faire un calcul
physique et le signaler sous son propre code (préfixé `I-`, pour
information), jamais comme une erreur de la spec.

---

## Grammaire

```
line        = [ "guide" ws ] orientation ws num ws num ws num { ws attribute } [ ws? comment ]
            | [ ws? comment ] ;
orientation = ( "flat" | "edge" | "up" ) "-" ( "x" | "y" ) ;
attribute   = key "=" value ;
key         = "color" | "id" | "repeat" | "offset" | "rot" | "rot-step" | "pivot" ;
num         = [ "-" ] digit { digit } [ "." digit { digit } ] ;
comment     = "#" { any character } ;
```

Les clés inconnues sont ignorées avec `W-unknown-attribute`, pour que les
versions suivantes puissent ajouter des clés sans casser les lecteurs plus
anciens.

---

## Questions ouvertes

- **Planchettes de tailles différentes** (demi-planchettes, cubes) : un seul
  `plank:` par fichier pour l'instant.
- **Planchettes inclinées** : rotations autour d'axes horizontaux, pour les
  rampes et les charpentes en A.
- **Inclusion** : comment un autre document Markdown fait référence à un
  modèle (`!ref plank:slug`, ou un bloc de code qui pointe vers un fichier).
- **Stabilité** : savoir si un calcul d'équilibre commun et déterministe a sa
  place dans la spec ou reste une fonction des outils. L'implémentation de
  référence en a un (`src/physics.js`), signalé sous des codes `I-`.
