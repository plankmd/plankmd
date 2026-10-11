---
title: Utiliser PlankMD
description: Valider, développer et vérifier des modèles PlankMD en ligne de commande, ou utiliser l'implémentation de référence comme bibliothèque
---

# Utiliser PlankMD

L'implémentation de référence est sur npm sous le nom
[`plankmd`](https://www.npmjs.com/package/plankmd). Elle demande Node 18 ou
plus récent et n'a aucune dépendance à l'exécution. Le calcul d'équilibre et
le test de chute utilisent deux solveurs optionnels. Les messages de l'outil
sont en anglais.

## En ligne de commande

Sans rien installer :

```bash
npx plankmd validate model.plank.md
```

```
✓ model.plank.md: 45 planks, 3 steps, 0 errors, 0 warnings
```

Ou installez-le dans un projet, ou globalement :

```bash
npm install plankmd
npm install --global plankmd
```

| Commande | Ce qu'elle fait |
|---|---|
| `plankmd validate <fichiers…>` | Vérifie chaque fichier. Chaque diagnostic donne sa ligne et son numéro de planchette. |
| `plankmd validate <fichiers…> --strict` | Échoue aussi sur les avertissements. |
| `plankmd validate <fichiers…> --json` | Sortie lisible par une machine. |
| `plankmd validate <fichiers…> --physics` | Ajoute le calcul d'équilibre : est-ce que ça tient après chaque planchette, et quelle inclinaison chaque étape supporte ? |
| `plankmd expand <fichier>` | Liste toutes les planchettes dans l'ordre de pose. |
| `plankmd drop <fichiers…>` | Test de chute dans un moteur physique. |

### Calcul d'équilibre et test de chute

Le calcul d'équilibre modélise les planchettes comme des blocs rigides posés
les uns sur les autres, avec frottement, et résout un programme linéaire avec
[HiGHS](https://highs.dev). HiGHS est une dépendance optionnelle du paquet,
installée avec lui sauf si vous passez `--no-optional`. Ses résultats sont des
informations (`I-unstable`, `I-fragile`), jamais des erreurs : ils ne font pas
partie du format.

Le test de chute utilise le moteur physique [Rapier](https://rapier.rs), à
installer à côté du paquet :

```bash
npm install @dimforge/rapier3d-compat@0.20.0
npx plankmd drop model.plank.md
```

## Comme bibliothèque

```js
const PlankMD = require('plankmd')

const { valid, planks, steps, diagnostics } = PlankMD.validate(text)
for (const d of diagnostics) console.log(`${d.line}: ${d.code} ${d.message}`)
```

Le même fichier fonctionne dans le navigateur, où il définit `window.PlankMD` :

```html
<script src="https://cdn.jsdelivr.net/npm/plankmd@0.1.0/src/plankmd.js"></script>
```

Le calcul d'équilibre et le test de chute sont des modules séparés, qui
reçoivent le solveur en argument :

```js
const PlankMDPhysics = require('plankmd/src/physics.js')
const highs = await require('highs')()
const analysis = PlankMDPhysics.analyse(highs, PlankMD.validate(text))
```

```js
const RAPIER = require('@dimforge/rapier3d-compat')
await RAPIER.init()
const { createDrop } = require('plankmd/src/drop.js')
```

## Le lecteur

Le [lecteur](/player/?lang=fr){target="_self"} tourne dans le navigateur, sans rien
installer. Il est aussi dans le paquet npm et dans le dépôt : ouvrez
`player/index.html` depuis le disque, il fonctionne hors ligne, sauf three.js
et les solveurs optionnels, chargés depuis un CDN.

Il s'affiche en français ou en anglais : le bouton EN/FR de son en-tête
retient le choix. Les diagnostics y sont expliqués en français, avec le même
code et les mêmes numéros de ligne et de planchette qu'en ligne de commande.

| Adresse | Ce qu'elle ouvre |
|---|---|
| `/player/` | Le premier exemple |
| `/player/#corbel-bridge` | Un exemple ou un modèle de la galerie, par son nom |
| `/player/?src=<url>` | Un fichier `.plank.md` sur le web (servi avec CORS) |
| `/player/#code=<base64url>` | Un modèle contenu dans le lien lui-même (texte UTF-8 en base64url) |
| `/player/?lang=fr` | Le lecteur en français (`en` pour l'anglais) |

Vous pouvez aussi coller un modèle dans le panneau de source, ou déposer un
fichier sur la scène.

## Le code source

Tout est sur GitHub :
[github.com/plankmd/plankmd](https://github.com/plankmd/plankmd). Les issues
et les pull requests sont les bienvenues ; ouvrez une issue avant de proposer
une modification du format.
