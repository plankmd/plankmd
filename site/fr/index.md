---
layout: home
title: PlankMD
titleTemplate: Un format ouvert pour les constructions en planchettes de bois

hero:
  name: PlankMD
  text: Des constructions en planchettes de bois, en Markdown
  tagline: Une planchette par ligne, un bloc par étape de montage. Un modèle 3D et un livret de montage dans un seul fichier texte.
  image:
    src: /logo-wide.svg
    alt: PlankMD
  actions:
    - theme: brand
      text: Ouvrir le lecteur
      link: /player/?lang=fr
      target: _self
    - theme: alt
      text: Lire la spec
      link: /fr/spec
    - theme: alt
      text: Galerie
      link: /fr/gallery

features:
  - title: Markdown d'abord
    details: Un fichier .plank.md est du Markdown valide. Le texte entre les blocs est le livret de montage, les blocs sont les planchettes.
  - title: Dans l'ordre de pose
    details: Les lignes sont écrites dans l'ordre où l'on pose les planchettes, et le validateur vérifie chaque planchette à ce moment-là. Rien ne traverse rien, rien ne flotte.
  - title: Mesuré avec des planchettes
    details: Les positions se comptent en épaisseurs de planchette. Les gabarits sont des planchettes fantômes qui montrent l'espace à laisser, et le validateur vérifie l'écart.
  - title: Vérifié à l'équilibre
    details: Un calcul d'équilibre optionnel dit si la construction tient après chaque planchette, et quelle inclinaison chaque étape supporte. Un moteur physique rejoue le montage.
  - title: Pensé pour l'IA
    details: Des lignes courtes et régulières qu'un modèle de langage sait écrire et qu'un validateur sait vérifier, avec des diagnostics assez précis pour corriger le modèle.
  - title: Ouvert
    details: MIT pour la spécification et le code, CC0 pour les modèles. Indépendant de toute marque, avec les proportions de la planchette déclarées dans le fichier.
---

## Un premier modèle

````markdown
## Step 1: the first layer

Lay two planks flat and parallel, then two across them, on their ends.

```plank
flat-x 0 0 0
flat-x 0 12 0
flat-y 0 0 1
flat-y 12 0 1
```

## Step 2: build up the walls

```plank
flat-x 0 0 2  repeat=4 offset=0,0,2
flat-x 0 12 2 repeat=4 offset=0,0,2
flat-y 0 0 3  repeat=4 offset=0,0,2
flat-y 12 0 3 repeat=4 offset=0,0,2
```
````

Une planchette mesure 15 × 3 × 1 en épaisseurs de planchette : la plupart des
modèles n'utilisent donc que de petits entiers. `flat-x` pose une planchette à
plat le long de `x` ; les trois nombres sont son coin. Le texte du livret peut
être écrit dans n'importe quelle langue, seuls les mots-clés sont en anglais.
[Ouvrir cette tour dans le lecteur](/player/?lang=fr#square-tower){target="_self"}.

## Ce que vous trouverez ici

- **[La spécification](/fr/spec)**, PlankMD v0.1 (brouillon).
- **[Un lecteur 3D](/player/?lang=fr){target="_self"}**, en français ou en
  anglais : étapes, montage planchette par planchette, édition en direct,
  diagnostics, calcul d'équilibre et test de chute. Collez ou déposez un
  fichier `.plank.md`, ou ouvrez-en un depuis le web avec `?src=<url>`.
- **[Une galerie](/fr/gallery)** de modèles plus grands : un château, un phare,
  une pagode, un voilier, des monuments, et Notre-Dame de Paris en 1392
  planchettes.
- **[Un validateur et une bibliothèque](/fr/use)** pour Node et le navigateur,
  sans dépendance : `npx plankmd validate model.plank.md`.
- **[Des instructions pour les modèles de langage](/fr/llm)** : un prompt
  système qui écrit des modèles valides et constructibles.

## Compatibilité

<p class="notice">Compatible avec les planchettes KAPLA® : la taille de
planchette par défaut (<code>plank: [15, 3, 1]</code>, <code>unit_mm: 7.8</code>)
leur correspond. Toutes les autres planchettes conviennent aussi : déclarez
leurs proportions dans le frontmatter.<br>
KAPLA® est une marque déposée de son propriétaire. PlankMD est un projet
indépendant ; il n'est ni affilié au propriétaire de la marque, ni parrainé,
ni approuvé par lui.</p>

PlankMD suit les principes de conception de [LearnSpec](https://learnspec.org),
une suite ouverte de formats Markdown pour l'apprentissage.
