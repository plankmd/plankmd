---
title: Use it
description: Validate, expand and check PlankMD models from the command line, or use the reference implementation as a library
---

# Use it

The reference implementation is on npm as
[`plankmd`](https://www.npmjs.com/package/plankmd). It needs Node 18 or later
and has no runtime dependencies. The balance check and the drop test use two
optional solvers.

## Command line

Without installing anything:

```bash
npx plankmd validate model.plank.md
```

```
✓ model.plank.md: 45 planks, 3 steps, 0 errors, 0 warnings
```

Or install it in a project, or globally:

```bash
npm install plankmd
npm install --global plankmd
```

| Command | What it does |
|---|---|
| `plankmd validate <files…>` | Checks each file. Every diagnostic names its line and its plank number. |
| `plankmd validate <files…> --strict` | Fails on warnings too. |
| `plankmd validate <files…> --json` | Machine-readable output. |
| `plankmd validate <files…> --physics` | Adds the balance check: does it stand after every plank, and how much tilt does each step withstand? |
| `plankmd expand <file>` | Lists every plank in placement order. |
| `plankmd drop <files…>` | Drop test in a physics engine. |

### Balance check and drop test

The balance check models planks as rigid blocks resting on each other, with
friction, and solves a linear program with [HiGHS](https://highs.dev). HiGHS
is an optional dependency of the package, installed with it unless you pass
`--no-optional`. Its findings are information (`I-unstable`, `I-fragile`),
never errors: they are not part of the format.

The drop test uses the [Rapier](https://rapier.rs) physics engine, which you
install next to the package:

```bash
npm install @dimforge/rapier3d-compat@0.20.0
npx plankmd drop model.plank.md
```

## Library

```js
const PlankMD = require('plankmd')

const { valid, planks, steps, diagnostics } = PlankMD.validate(text)
for (const d of diagnostics) console.log(`${d.line}: ${d.code} ${d.message}`)
```

The same file works in the browser, where it defines `window.PlankMD`:

```html
<script src="https://cdn.jsdelivr.net/npm/plankmd@0.1.0/src/plankmd.js"></script>
```

The balance check and the drop test are separate modules, which take the
solver as an argument:

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

## Player

The [player](/player/){target="_self"} runs in the browser, with nothing to
install. It is also in the npm package and in the repository: open
`player/index.html` from the disk, it works offline except for three.js and
the optional solvers, which load from a CDN.

| Address | What it opens |
|---|---|
| `/player/` | The first sample |
| `/player/#corbel-bridge` | A bundled sample or gallery model, by name |
| `/player/?src=<url>` | A `.plank.md` file from the web (served with CORS) |
| `/player/#code=<base64url>` | A model given in the link itself (UTF-8 text, base64url) |
| `/p?repo=<GitHub address>` | The models of a GitHub repository, folder, file or gist (see below) |
| `/player/?lang=fr` | The player in French (`en` for English) |

You can also paste a model into the source panel, or drop a file on the scene.

## Booklets and videos

Every model can become a printable building booklet and a building video,
in the browser, from the links at the bottom of the player:

| Page | What it makes |
|---|---|
| `/player/booklet.html#<sample>` | An A4 booklet: a cover, then each step with its instructions, a large view and small views of the order of its planks. Print it, or save it as PDF. |
| `/player/video.html#<sample>` | A building video: a title, each step's card, the planks dropping in one by one. Play it, or record it (MP4 or WebM, depending on the browser). |

Both take the same addresses as the player (`?src=<url>`, `#code=<base64url>`)
and `?lang=fr`. In another language (`?lang=fr`, `--lang fr`), the texts come
from the model's translation when it has one (`castle.fr.plank.md` next to
`castle.plank.md`). From a clone of the repository, with Chrome and ffmpeg
installed, two scripts make the files:

```bash
npm run booklet -- gallery/castle.plank.md            # castle.pdf
npm run video -- gallery/castle.plank.md              # castle.mp4, 1920 x 1080
npm run video -- gallery/castle.plank.md --vertical   # 1080 x 1920, for Shorts
```

The video script renders frame by frame, so the MP4 is smooth whatever the
speed of the machine: H.264, 30 frames a second, ready for YouTube.

## Share your models from GitHub

Put your `.plank.md` files in a public GitHub repository, and share one link:

```
https://plankmd.org/p?repo=https://github.com/you/your-models
```

It opens a gallery of every `.plank.md` file in the repository, or straight
the player when there is only one. The address can also be a folder
(`.../tree/main/castles`), one file (`.../blob/main/castle.plank.md`), a gist,
or just `you/your-models`. Add `&file=<path>` to open one model of the
repository in the player.

Everything happens in the visitor's browser: the files are read from GitHub
directly, nothing is stored by plankmd.org. GitHub allows 60 listings an hour
per visitor without an account; files themselves are not limited.

## Source

Everything is on GitHub:
[github.com/plankmd/plankmd](https://github.com/plankmd/plankmd). Issues and
pull requests are welcome; open an issue before proposing a change to the
format.
