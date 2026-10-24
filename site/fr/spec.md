---
title: Spécification
description: La spécification du format PlankMD v0.2, en français
---

<!--
  French translation of SPEC.md (PlankMD v0.2). SPEC.md is the reference:
  when it changes, update this page in the same pull request.
-->

# PlankMD : spécification du format v0.2

::: info Traduction
Cette page est une traduction. La version de référence est
[la spécification en anglais](/spec), qui fait foi en cas de différence.
:::

> Statut : brouillon, octobre 2026
> Licence : MIT
>
> La v0.2 ajoute les [planchettes inclinées](#planchettes-inclinees-niveau-2),
> les [étais](#etais-niveau-2), les [indications de vue](#indications-de-vue-niveau-2)
> et les [métadonnées des modèles partagés](#metadonnees-des-modeles-partages).
> Tout fichier v0.1 est un fichier v0.2 valide, de même sens (voir
> [Changements depuis la v0.1](#changements-depuis-la-v0-1)).

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
| 2 | Attributs par ligne (`color`, `id`, `repeat`, `rot`, `pivot`, `lean`…), gabarits, étais et indications de vue | Couleurs, noms, répétitions compactes, angles libres, planchettes inclinées, mesure des écarts, soutiens provisoires, points de vue |

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
plankmd: "0.2"            # version de la spec (obligatoire au niveau 1)
title: Small square tower # obligatoire au niveau 1
lang: en                  # BCP 47, optionnel
plank: [15, 3, 1]         # L, W, T en unités ; par défaut [15, 3, 1]
unit_mm: 7.8              # taille réelle de 1 u, pour le rendu et l'échelle d'impression
inventory: 30             # planchettes que le constructeur est censé avoir (optionnel)
difficulty: 1             # de 1 (tout-petit) à 5 (expert), optionnel
author: Jane Doe          # optionnel
license: CC-BY-4.0        # identifiant SPDX de la licence du modèle, optionnel
view: front-left,20       # d'où sont prises les images du modèle (niveau 2)
palette:                  # couleurs nommées pour `color=` (niveau 2), optionnel
  roof: "#b03a2e"
---
```

Le frontmatter est un dictionnaire YAML plat, plus le seul dictionnaire
imbriqué `palette`. Les listes s'écrivent sur une ligne (`[15, 3, 1]`). Les
clés inconnues sont permises et ignorées, pour que les outils puissent
ajouter les leurs. Les clés des
[modèles partagés](#metadonnees-des-modeles-partages) sont réservées.

**Étapes.** Chaque bloc ` ```plank ` est **une étape de montage**, dans
l'ordre du document. Les étapes se cumulent : l'étape *n* montre tout ce qui
a été posé aux étapes 1 à *n*. Le dernier titre Markdown avant un bloc est le
titre de l'étape ; le texte entre ce titre et le bloc en est l'instruction.

Un fichier avec un seul bloc et sans frontmatter est un fichier de niveau 0
valide : une étape, toute la construction.

La ligne d'ouverture d'un bloc peut porter des attributs après le mot
`plank` (` ```plank view=back-left,20 `) : voir les
[indications de vue](#indications-de-vue-niveau-2).

### Métadonnées des modèles partagés

Un fichier voyage : on le publie dans un gist ou un dépôt, on l'ouvre dans un
lecteur, on l'imprime en notice. Ces clés optionnelles disent d'où il vient
et ce qu'il est. Les outils qui affichent, listent ou impriment un modèle
s'en servent, et de rien d'autre, pour ces sens-là.

```yaml
author: Jane Doe
license: CC-BY-4.0
url: https://gist.github.com/jane/0e9490ed9226cb4e23929637af0cfa68
based-on: https://github.com/someone/castles/blob/main/castle.plank.md
date: 2026-10-14
image: castle.jpg
tags: [castle, medieval, bridge]
minutes: 45
```

| Clé | Valeur | Signification |
|---|---|---|
| `author` | texte | L'auteur du modèle. Un nom, avec un site ou un pseudo si on veut |
| `license` | identifiant SPDX | La licence du modèle. Sans elle, tous droits réservés. `CC0-1.0` et `CC-BY-4.0` sont celles à recommander pour partager |
| `url` | adresse `https:` complète | La page où vit ce modèle : un gist, un fichier sur GitHub, une page web. Là où une copie renvoie |
| `based-on` | adresse `https:` complète, ou texte | Le modèle dont celui-ci est dérivé : une adresse s'il en a une, sinon un titre et un auteur. Un crédit, pas un mécanisme : les outils ne vont pas le chercher |
| `date` | `AAAA-MM-JJ` | La date de cette version du modèle |
| `image` | adresse `https:`, ou chemin relatif | Une photo du modèle construit. Un chemin relatif se lit à côté du fichier et NE DOIT PAS sortir de son dossier (pas de `/` au début, pas de `..`) |
| `tags` | liste de mots en minuscules | Des mots-clés pour la recherche et les filtres, sans espace dans un mot-clé |
| `minutes` | entier positif | La durée du montage, environ, pour quelqu'un du niveau de `difficulty` |

Un outil DEVRAIT charger `image` seulement pour un modèle venu lui-même du
réseau, jamais pour un texte collé ou déposé : un fichier collé ne doit pas
faire télécharger au navigateur du lecteur une image sur le serveur d'un
inconnu.

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
| `lean` | `<dir>:<degrés>` | Incline la planchette : voir les [planchettes inclinées](#planchettes-inclinees-niveau-2) |
| `until` | `id` | Sur une ligne d'étai seulement : la planchette dont la pose libère l'étai. Voir les [étais](#etais-niveau-2) |

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

`rot` ne tourne qu'autour d'un axe vertical. Pour incliner une planchette,
utiliser `lean`.

---

## Planchettes inclinées (niveau 2)

Une rampe, un toit en pente, deux planchettes appuyées l'une contre l'autre,
une planchette calée contre un mur : ces planchettes ne sont ni de niveau ni
d'aplomb. `lean` fait basculer une planchette vers une direction, d'un angle :

````markdown
```plank
flat-x 0 0 0 lean=-x:20     # une rampe : le bout -x reste en bas, le bout +x monte
up-y 0 10 0 lean=+y:12      # une planchette debout appuyée contre un mur en +y
```
````

| Valeur | Signification |
|---|---|
| `<dir>:<degrés>` | `<dir>` est `+x`, `-x`, `+y` ou `-y`, et `0 < degrés < 90` |

Une seule règle pour toutes les orientations : *prendre la planchette là où
la ligne la place, puis la faire basculer vers `<dir>` de cet angle, en
pivotant sur l'arête du bas de sa boîte, de ce côté.* Cette arête ne bouge
pas. Une planchette couchée soulève son autre bout (une rampe qui monte vers
`+x` bascule vers `-x`) ; une planchette debout penche son sommet.

- La position `x y z` reste le coin minimum de la boîte **avant** la
  bascule. L'arête basse reste sur la grille, et l'auteur ne calcule jamais
  de sinus pour poser une rampe au sol.
- `lean` s'applique avant `rot` : la planchette inclinée tourne ensuite d'un
  bloc autour de l'axe vertical qui passe par le centre de sa boîte avant la
  bascule, ou autour de `pivot`.
- `offset` déplace chaque répétition, arête de pivot comprise. Il n'y a pas
  de `lean-step`.
- `0` n'est pas une inclinaison : ne pas mettre l'attribut. `90` est une
  autre orientation : écrire cette orientation.

**Les angles.** Une planchette inclinée repose en général sur une arête
connue, et son angle est celui que donne la géométrie : une rampe qui part du
sol et s'appuie sur l'arête du haut d'une marche de hauteur `h`, son pied à
`d` de la marche, s'incline de `atan(h / d)`. Écrire l'angle arrondi au
dixième de degré, ou au degré : les validateurs acceptent les contacts avec
une tolérance (voir [Validation](#validation)).

Les gabarits peuvent aussi être inclinés, pour mesurer une pente.

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

Une ligne d'[étai](#etais-niveau-2) fait exception : elle se pose d'un bloc,
toutes ses répétitions à la suite, au tour 0, à sa place parmi les lignes.

**Gestes.** Ce que fait le constructeur, dans l'ordre, est une suite de
**gestes** : poser une planchette, poser un étai, ou retirer des étais. Sans
étai, les gestes sont les planchettes. Les lecteurs PEUVENT parcourir les
gestes un par un.

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
  ses arêtes), et disparaît dès l'étape suivante. Dans son étape, il est posé
  là où se trouve sa ligne : une fois posées les planchettes et les étais
  écrits au-dessus de lui dans l'étape. Un lecteur qui montre une étape
  planchette par planchette DEVRAIT montrer le gabarit à partir de là.
- **Il n'a pas de numéro et ne compte pas** dans le total des planchettes ni
  dans `inventory`.
- **Il ne porte rien.** Une planchette qui ne repose que sur un gabarit
  flotte.
- **Il se pose comme une planchette** : sur le sol, sur les planchettes et
  les étais posés avant lui, ou sur un gabarit de son étape posé avant lui.
  Un gabarit qui ne repose sur rien quand il est posé (`W-guide-floating`)
  apparaît suspendu en l'air : écris-le après les planchettes sur lesquelles
  il repose. Un écart sous lequel il n'y a rien du tout, comme le haut d'un
  arc en encorbellement, ne se mesure pas là : mesure-le plus bas, ou ne mets
  pas de gabarit.

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

## Étais (niveau 2)

Certaines constructions ne tiennent qu'une fois finies. Deux poutres qui se
rejoignent au-dessus d'un vide basculent tant que leurs contrepoids ne sont
pas posés ; une arche a besoin de toutes ses pierres avant de se bloquer. On
monte d'abord un soutien provisoire, qu'on fait ensuite glisser dehors. Un
**étai** (en anglais *scaffold*) est ce soutien : de vraies planchettes de la
boîte, qui portent une charge, et qu'on retire.

Un étai est une ligne qui commence par le mot `scaffold`. Le reste de la
ligne est une ligne de planchette ordinaire, attributs compris :

````markdown
## Step 2: the span

Build a stack of four planks in the middle of the gap. Lay a beam from each
pier, meeting over the stack, then weigh their outer ends down with five
planks each. Slide the stack out.

```plank
scaffold flat-x 7.5 6 0 repeat=4 offset=0,0,1
flat-x 0 6 4
flat-x 15 6 4
flat-y 0 0 5 repeat=5 offset=0,0,1
flat-y 27 0 5 repeat=5 offset=0,0,1
```
````

Un étai est retiré **à la fin de son étape** : après la dernière planchette
de l'étape. Pour le garder plus longtemps, ou le retirer plus tôt,
`until=<id>` nomme la planchette dont la pose le libère. Cette planchette
DOIT venir plus tard dans l'ordre de pose ; elle peut être dans une étape
suivante.

```plank
scaffold flat-y 12 0 0 repeat=8 offset=0,0,1 until=key
```

- Un étai **se pose dans l'ordre de pose**, à la place de sa ligne dans
  l'étape, toutes ses répétitions à la suite (voir l'[ordre de pose](#ordre-de-pose)).
- Il **porte** ce qui repose sur lui : une planchette posée sur un étai ne
  flotte pas. Il **doit reposer** sur quelque chose lui-même, comme toute
  planchette.
- Un étai **n'a pas de numéro de planchette**. Les outils numérotent les
  étais à part, à partir de 1, dans l'ordre où ils sont posés (« l'étai 3 »).
  Les planchettes de la construction gardent leur numéro, qu'il y ait des
  étais ou non.
- `color` est ignoré : les outils dessinent les étais à leur façon (gris,
  rayés), pour qu'on ne les prenne jamais pour une partie du modèle.
- Un **retrait** est un geste, juste après la planchette qui le déclenche.
  Les étais libérés par la même planchette sont retirés ensemble, dans
  l'ordre des lignes.
- Les étais comptent dans `inventory` tant qu'ils sont en place.

Le format ne dit pas par où sort un étai. On fait glisser un étai de côté ou
dans sa longueur, là où c'est libre ; le validateur vérifie seulement qu'un
côté est libre (`W-scaffold-wedged`).

Les lecteurs qui ne gèrent pas les étais DOIVENT ignorer les lignes
`scaffold` avec un avertissement plutôt que de les construire, comme pour
les gabarits, car un étai construit comme une planchette change le modèle.

**Étai, gabarit ou main.** Un gabarit mesure un écart et ne porte rien. Un
étai porte des planchettes pendant une étape ou plus. On peut aussi tenir une
planchette un instant à la main : il vaut mieux alors changer l'ordre de
pose, ou rendre la main explicite (voir `docs/proposals/hold.md`).

---

## Indications de vue (niveau 2)

Les images d'un modèle (pages d'une notice, vignettes de la galerie, premier
coup d'œil d'un lecteur) sont prises d'une direction par défaut : de face, à
droite, un peu au-dessus. Quand les planchettes d'une étape se posent à
l'intérieur des murs ou derrière ce qui est construit, l'auteur dit d'où
regarder.

````markdown
## Step 4: the spiral staircase

The stairs climb the back of the tower, so turn it around.

```plank view=back-left,20 zoom=1.5 focus=step
flat-x 0 -1.5 0 repeat=36 offset=0,0,1 rot-step=10 pivot=0,0
```
````

Les attributs se placent sur la ligne d'ouverture du bloc, après le mot
`plank`, sous la même forme `clé=valeur` que sur les lignes de planchettes :

| Attribut | Valeur | Signification |
|---|---|---|
| `view` | `<direction>[,<élévation>]` | Où est la caméra. `<direction>` est un nom (ci-dessous) ou un azimut en degrés ; `<élévation>` est en degrés au-dessus de l'horizon, de `0` à `90`, `28` par défaut |
| `zoom` | nombre positif, `1` pour tout le modèle | De combien s'approcher : `2` cadre environ la moitié du modèle, autour du centre visé |
| `focus` | `step`, ou un `id` | Sur quoi l'image est centrée : les planchettes de cette étape, ou une planchette posée avant la fin de l'étape. Sans lui, tout le modèle |

| Direction | Azimut | La caméra est |
|---|---|---|
| `front` | 0 | du côté du spectateur (`-y`), tournée vers `+y` |
| `right` | 90 | en `+x` |
| `back` | 180 | en `+y` |
| `left` | 270 | en `-x` |
| `front-right`, `back-right`, `back-left`, `front-left` | 45, 135, 225, 315 | entre les deux |
| `top` | quelconque | juste au-dessus (élévation 90, pas d'élévation à donner) |

L'azimut tourne dans le sens inverse des aiguilles d'une montre vu du dessus,
comme `rot`. Le défaut habituel est `35,28` : de face, un peu à droite.

`view` dans le frontmatter fixe la **vue du modèle** : la couverture d'une
notice, une vignette, le premier coup d'œil d'un lecteur, le début et la fin
du tour de caméra d'une vidéo. Il ne prend qu'une valeur de `view` (pas de
`zoom` ni de `focus`).

- Les indications d'une étape ne valent que pour elle. Une étape sans `view`
  prend la vue du modèle, ou celle de l'outil.
- Ce ne sont que des indications : un outil PEUT les ignorer, et le
  spectateur peut toujours tourner la caméra. Un lecteur qui les ignore ne
  perd que le conseil de l'auteur.
- Les blocs vides d'une traduction ne portent pas d'indications : les vues
  viennent de l'original.

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
| `W-floating` | avertissement | Une planchette avec `z > 0` ne repose sur rien quand elle est posée : aucune planchette posée avant elle n'a sa face du dessus en contact avec la face du dessous de la nouvelle, sur une surface non nulle. Un contact sur le côté ne compte pas, ni une planchette posée après, même dans la même étape. Pour une planchette inclinée, voir plus bas |
| `W-inventory` | avertissement | Plus de planchettes en place en même temps que `inventory`, étais compris |
| `E-lean` | erreur | Une valeur de `lean` n'est pas `<dir>:<degrés>` avec une direction parmi `+x`, `-x`, `+y`, `-y` et un angle strictement entre 0 et 90 |
| `W-unchecked-lean` | avertissement | Le validateur ne sait pas vérifier exactement une planchette inclinée. Il DOIT le dire plutôt que de déclarer la planchette valide |
| `W-scaffold-release` | avertissement | `until` ne nomme aucune planchette, nomme un étai, ou nomme une planchette posée avant l'étai. L'étai est retiré à la fin de son étape |
| `W-scaffold-floating` | avertissement | Une fois des étais retirés, une planchette qui reposait dessus ne repose plus sur rien |
| `W-scaffold-wedged` | avertissement | Un étai qui porte une planchette a des planchettes contre lui de tous les côtés au moment de le retirer : il ne peut pas glisser dehors |
| `W-view` | avertissement | Une indication de vue est illisible (direction inconnue, élévation hors limites, zoom non positif, `focus` qui ne nomme aucune planchette posée avant la fin de son étape). L'indication est ignorée |
| `W-unchecked-rotation` | avertissement | Le validateur ne sait pas vérifier exactement une planchette tournée. Il DOIT le dire plutôt que de déclarer la planchette valide |
| `E-guide-overlap` | erreur | Un gabarit partage un volume avec une vraie planchette posée avant lui ou dans la même étape : l'écart qu'il mesure est trop petit |
| `W-guide-floating` | avertissement | Un gabarit ne repose sur rien quand il est posé : ni sur le sol, ni sur une planchette ou un étai posé avant lui, ni sur un gabarit de son étape posé avant lui |
| `W-guide-loose` | avertissement | Une chaîne de gabarits touche moins de deux vraies planchettes posées jusqu'à la fin de son étape : mal placée, ou écart trop large |

`W-floating` est un avertissement et non une erreur, parce qu'on peut tenir
une planchette pendant qu'on pose son appui ; mais il vaut mieux alors
corriger l'ordre de pose.

**Étais.** Un validateur pose les étais dans l'ordre des gestes et les
vérifie comme des planchettes (`E-overlap`, `E-below-ground`, `W-floating`).
Au retrait, les étais retirés n'existent plus : chaque planchette qui
reposait dessus doit encore reposer sur quelque chose.

`E-frontmatter` couvre aussi les clés de
[métadonnées](#metadonnees-des-modeles-partages) : `url` qui n'est pas une
adresse `https:` complète, `date` qui n'est pas une date du calendrier,
`minutes` qui n'est pas un entier positif, `tags` qui n'est pas une liste de
mots, `image` qui sort du dossier.

**Planchettes tournées.** Comme `rot` ne tourne qu'autour d'un axe
vertical, la plage de hauteur d'une planchette de niveau reste alignée sur les axes, et
chaque vérification se ramène à des rectangles dans le plan du sol. Un test
exact (théorème de l'axe séparateur sur les deux emprises) tient en quelques
lignes ; les validateurs DEVRAIENT l'implémenter plutôt que de se rabattre
sur `W-unchecked-rotation`.

**Les planchettes inclinées** sont des boîtes tournées dans l'espace. Les
chevauchements se vérifient comme entre boîtes (théorème de l'axe séparateur
sur les quinze axes de deux boîtes). Une planchette inclinée touche ses
appuis le long d'une arête ou par un coin, sous un angle que l'auteur
arrondit : quand l'une des deux planchettes est inclinée, elles ne se
chevauchent que si elles partagent un volume plus profond qu'une **tolérance
de 0,2 u** (environ 1,6 mm), et elles se touchent quand elles sont à moins de
0,2 u l'une de l'autre. Une planchette repose sur quelque chose quand elle
touche le sol, ou une planchette posée avant elle qui n'est pas entièrement
au-dessus d'elle. Toucher n'est pas tenir : savoir si une planchette
inclinée reste en place relève d'un calcul physique.

**La stabilité est hors du périmètre.** Une construction peut passer la
validation et tomber quand même : centre de gravité hors de la base, porte-à-faux
trop longs, spirale qui tourne trop vite. Un outil PEUT faire un calcul
physique et le signaler sous son propre code (préfixé `I-`, pour
information), jamais comme une erreur de la spec.

---

## Grammaire

```
line        = [ ( "guide" | "scaffold" ) ws ] orientation ws num ws num ws num { ws attribute } [ ws? comment ]
            | [ ws? comment ] ;
orientation = ( "flat" | "edge" | "up" ) "-" ( "x" | "y" ) ;
attribute   = key "=" value ;
key         = "color" | "id" | "repeat" | "offset" | "rot" | "rot-step" | "pivot" | "lean" | "until" ;
lean        = ( "+" | "-" ) ( "x" | "y" ) ":" num ;
num         = [ "-" ] digit { digit } [ "." digit { digit } ] ;
comment     = "#" { any character } ;

fence       = "```" "plank" { ws block-attr } ;
block-attr  = ( "view" | "zoom" | "focus" ) "=" value ;
view        = ( direction | num ) [ "," num ] | "top" ;
direction   = "front" | "back" | "left" | "right"
            | "front-right" | "back-right" | "back-left" | "front-left" ;
```

Les clés inconnues sont ignorées avec `W-unknown-attribute`, pour que les
versions suivantes puissent ajouter des clés sans casser les lecteurs plus
anciens.

---

## Questions ouvertes

- **Planchettes de tailles différentes** (demi-planchettes, cubes) : un seul
  `plank:` par fichier pour l'instant.
- **Par où sort un étai** : un attribut `out=<direction>` sur une ligne
  d'étai, dont le validateur vérifierait qu'il est libre, et que la notice
  dirait au constructeur.
- **Éventails de planchettes inclinées** : un `lean-step`, chaque répétition
  un peu plus inclinée.
- **Traductions et planchette tenue à la main** : des propositions dans
  `docs/proposals/` (`translations.md`, `hold.md`). Les outils de référence
  lisent déjà les traductions.
- **Inclusion** : comment un autre document Markdown fait référence à un
  modèle (`!ref plank:slug`, ou un bloc de code qui pointe vers un fichier).
- **Stabilité** : savoir si un calcul d'équilibre commun et déterministe a sa
  place dans la spec ou reste une fonction des outils. L'implémentation de
  référence en a un (`src/physics.js`), signalé sous des codes `I-`.

---

## Changements depuis la v0.1

La v0.2 ne fait qu'ajouter : un fichier v0.1 est un fichier v0.2 valide, de
même sens.

- **Planchettes inclinées** : l'attribut `lean`, `E-lean`, et la tolérance
  pour les contacts où une planchette est inclinée.
- **Étais** : les lignes `scaffold`, l'attribut `until`, les gestes, et
  `W-scaffold-release`, `W-scaffold-floating`, `W-scaffold-wedged`.
  `W-inventory` compte les planchettes en place en même temps.
- **Indications de vue** : `view`, `zoom` et `focus` sur la ligne d'ouverture
  d'un bloc, `view` dans le frontmatter, et `W-view`.
- **Métadonnées des modèles partagés** : les clés réservées `url`,
  `based-on`, `date`, `image`, `tags` et `minutes`, vérifiées par
  `E-frontmatter`.

Un fichier qui utilise l'un de ces ajouts DEVRAIT indiquer `plankmd: "0.2"`,
pour qu'un lecteur v0.1 signale la version avant de construire à plat une
planchette inclinée.
