# PlankMD: Format Specification v0.2

> Status: Draft, October 2026
> License: MIT
>
> v0.2 adds [leaning planks](#leaning-planks-level-2),
> [scaffolds](#scaffolds-level-2), [view hints](#view-hints-level-2) and the
> [metadata of shared models](#metadata-of-shared-models). Every v0.1 file is
> a valid v0.2 file with the same meaning (see
> [Changes from v0.1](#changes-from-v0-1)).

---

## Core Principle

PlankMD describes **constructions made of identical wooden building planks**
(the thin rectangular planks used for free-form building) and the **order in
which to build them**. A `.plank.md` file is both a machine-readable model and
a human-readable instruction booklet: the prose between blocks is the booklet
text, the blocks are the planks, and the lines are written in the order the
builder places them.

PlankMD is brand-neutral. The plank's proportions are a parameter of the file,
with a default (15 : 3 : 1) that matches the most widely sold planks.

| Principle | Description |
|---|---|
| **Markdown-first** | A `.plank.md` file is valid Markdown, readable in any editor |
| **File-native** | The whole construction lives in the file, no database required |
| **Grid-friendly** | Positions are expressed in plank thicknesses, so most builds use small integers |
| **Booklet-shaped** | One block = one building step; prose between blocks = instructions; lines are written in placement order |
| **AI-native** | One plank per line, short and regular: easy to generate, diff and check |
| **Progressive** | Level 0 is four numbers per line; richer features are opt-in |

The key words MUST, SHOULD and MAY are to be read as in RFC 2119.

---

## Format Levels

| Level | Mechanism | Purpose |
|---|---|---|
| 0 | One ` ```plank ` block, one plank per line | A construction in a single step |
| 1 | YAML frontmatter; several blocks = several steps | Metadata, plank size, building steps |
| 2 | Per-line attributes (`color`, `id`, `repeat`, `rot`, `pivot`, `lean`…), guides, scaffolds and view hints | Colors, names, compact repetitions, free angles, leaning planks, measuring gaps, temporary supports, camera directions |

Each level is a strict superset of the previous one.

---

## Coordinate System

- **Unit `u`**: the plank **thickness**. With the default plank, `1 u = 7.8 mm`
  and a plank measures **15 u × 3 u × 1 u** (length × width × thickness).
- **Axes**: right-handed, **`z` points up**. `x` goes right, `y` goes away
  from the viewer. The ground is the plane `z = 0`.
- **Anchor**: a plank's position `(x, y, z)` is the **minimum corner** of its
  bounding box (the corner with the smallest `x`, `y` and `z`), before any
  rotation.
- Coordinates are decimal numbers. Integers are recommended; half units
  (`7.5`) are common for centred builds. Readers MUST accept decimals and
  negative values.

### Orientations

A plank lies in one of three **poses**, and in each pose its long dimension
(or, standing up, its width) runs along `x` or along `y`. That gives six
orientations:

| Orientation | Pose | Bounding box (x × y × z), default plank |
|---|---|---|
| `flat-x` | lying on its widest face, length along x | 15 × 3 × 1 |
| `flat-y` | lying on its widest face, length along y | 3 × 15 × 1 |
| `edge-x` | standing on its long edge, length along x | 15 × 1 × 3 |
| `edge-y` | standing on its long edge, length along y | 1 × 15 × 3 |
| `up-x` | standing on its end, width along x | 3 × 1 × 15 |
| `up-y` | standing on its end, width along y | 1 × 3 × 15 |

For a plank `[L, W, T]`, replace 15, 3 and 1 by `L`, `W` and `T`.

---

## Basic Syntax (Level 0)

````markdown
```plank
flat-x 0 0 0
flat-x 0 12 0
flat-y 0 0 1
flat-y 12 0 1
```
````

- One plank per line: `<orientation> <x> <y> <z>`, separated by whitespace.
- Blank lines are ignored. `#` starts a comment, to the end of the line.
- Line order is the **placement order** (see [Placement Order](#placement-order)).
- Only fenced blocks whose info string starts with the word `plank` are read.
  Any other fenced block, including a longer fence that quotes a `plank`
  block (as this document does), is ordinary Markdown.

---

## Frontmatter and Steps (Level 1)

```yaml
---
plankmd: "0.2"            # spec version (required at Level 1)
title: Small square tower # required at Level 1
lang: en                  # BCP 47, optional
plank: [15, 3, 1]         # L, W, T in units; default [15, 3, 1]
unit_mm: 7.8              # real size of 1 u, for rendering and print scale
inventory: 30             # planks the builder is expected to own (optional)
difficulty: 1             # 1 (toddler) to 5 (expert), optional
author: Jane Doe          # optional
license: CC-BY-4.0        # SPDX identifier of the model's license, optional
view: front-left,20       # where pictures of the model are taken from (Level 2)
palette:                  # optional named colors for `color=` (Level 2)
  roof: "#b03a2e"
---
```

Frontmatter is a flat YAML mapping, plus the one nested `palette` mapping.
Lists are written inline (`[15, 3, 1]`). Unknown keys are allowed and
ignored, so tools can add their own. The keys of
[shared models](#metadata-of-shared-models) are reserved.

**Steps.** Every ` ```plank ` block is **one building step**, in document
order. Steps are cumulative: step *n* shows everything placed in steps 1 to
*n*. The last Markdown heading before a block is that step's title; the text
between that heading and the block is that step's instructions.

A file with a single block and no frontmatter is a valid Level 0 file: one
step, the whole construction.

The opening fence of a block may carry attributes after the word `plank`
(` ```plank view=back-left,20 `): see [View Hints](#view-hints-level-2).

### Metadata of shared models

A file travels: it is published in a gist or a repository, opened in a
player, printed as a booklet. These optional keys say where it comes from
and what it is. Tools that show, list or print a model use them, and nothing
else, for these meanings.

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

| Key | Value | Meaning |
|---|---|---|
| `author` | text | The model's author. A name, with a site or a handle if wanted |
| `license` | SPDX identifier | The model's license. Without it, the model is all rights reserved. `CC0-1.0` and `CC-BY-4.0` are the ones to recommend for sharing |
| `url` | absolute `https:` URL | The page where this model lives: a gist, a file on GitHub, a web page. Where a copy points back to |
| `based-on` | absolute `https:` URL, or text | The model this one is derived from: a URL when it has one, else a title and an author. A credit, not a mechanism: tools do not fetch it |
| `date` | `YYYY-MM-DD` | The date of this version of the model |
| `image` | `https:` URL, or a relative path | A photograph of the built model. A relative path is resolved next to the file and MUST NOT leave its folder (no leading `/`, no `..`) |
| `tags` | inline list of lower-case words | Keywords for search and filters, without spaces inside a tag |
| `minutes` | positive integer | How long the build takes, about, for a builder of the stated `difficulty` |

A tool SHOULD load `image` only for a model that itself came from the
network, never for text that was pasted or dropped: a pasted file must not
make the reader's browser fetch a picture from a stranger's server.

---

## Line Attributes (Level 2)

After the four positional fields, a line may carry `key=value` attributes,
with no spaces around `=`:

| Attribute | Value | Meaning |
|---|---|---|
| `color` | CSS color or `palette` key | Plank color. Default: natural wood |
| `id` | slug (`[a-z0-9]` and `-`) | Names the plank, for references from the prose. Unique per file |
| `repeat` | integer ≥ 1 | Expands the line into `repeat` planks |
| `offset` | `dx,dy,dz` | Position shift between two repetitions (required with `repeat`) |
| `rot` | degrees | Rotation around a vertical axis, counter-clockwise seen from above. Default axis: the plank's centre |
| `rot-step` | degrees | Extra rotation added at each repetition (spirals) |
| `pivot` | `px,py` | Vertical axis for `rot` and `rot-step`, instead of the plank's centre. The plank turns around it, position included |
| `lean` | `<dir>:<degrees>` | Tips the plank over: see [Leaning Planks](#leaning-planks-level-2) |
| `until` | `id` | On a scaffold line only: the plank whose placement releases the scaffold. See [Scaffolds](#scaffolds-level-2) |

Repetition `i` (from 0) sits at `position + i × offset`, then is rotated by
`rot + i × rot-step` around its own centre, or around `pivot` when given.
The pivot does not move with `offset`, so a spiral staircase is one line.
A repeated line with `id=foo` yields `foo-1`, `foo-2`, …

````markdown
```plank
flat-x 0 0 0 repeat=5 offset=0,0,2                              # five planks, one every 2 u
flat-x 0 0 10 repeat=5 offset=0,3,0 color=roof                  # five planks side by side
flat-x 0 -1.5 0 repeat=36 offset=0,0,1 rot-step=10 pivot=0,0    # spiral staircase
```
````

`rot` only turns around a vertical axis. To tip a plank over, use `lean`.

---

## Leaning Planks (Level 2)

A ramp, a pitched roof, two planks leaning on each other, a plank propped
against a wall: these planks are neither level nor plumb. `lean` tips a
plank over towards a direction, by an angle:

````markdown
```plank
flat-x 0 0 0 lean=-x:20     # a ramp: the -x end stays down, the +x end rises
up-y 0 10 0 lean=+y:12      # a standing plank leaning against a wall at +y
```
````

| Value | Meaning |
|---|---|
| `<dir>:<degrees>` | `<dir>` is one of `+x`, `-x`, `+y`, `-y`, and `0 < degrees < 90` |

One rule for every orientation: *take the plank where the line puts it, then
tip it over towards `<dir>` by that angle, pivoting on the bottom edge of
its box on that side.* That edge does not move. A lying plank lifts its
other end (a ramp rising towards `+x` is tipped towards `-x`); a standing
plank leans its top over.

- The position `x y z` is still the minimum corner of the box **before**
  the lean. The low edge stays on the grid, and the author never computes a
  sine to put a ramp on the ground.
- `lean` applies before `rot`: the tipped plank then turns as a whole around
  the vertical axis through the centre of its box before the lean, or
  around `pivot`.
- `offset` moves every repetition, pivot edge included. There is no
  `lean-step`.
- `0` is not a lean: leave the attribute out. `90` is another orientation:
  write that orientation.

**Angles.** A leaning plank usually rests on a known edge, and its angle is
what the geometry gives: a ramp from the ground onto the top edge of a step
of height `h`, its foot `d` away from the step, leans by `atan(h / d)`. Write
the angle rounded to a tenth of a degree, or to the degree: validators
accept contacts within a tolerance (see [Validation](#validation)).

Guides may lean too, to measure a slope.

---

## Placement Order

A builder places planks one at a time, and the file says in which order:

1. **Steps** come in document order.
2. **Within a step**, lines come in the order they are written.
3. **Repeated lines are interleaved by round**: round 0 of every line, in
   line order, then round 1 of every line that still has repetitions, and so
   on. A line whose `repeat` is exhausted drops out of the following rounds.

Rule 3 matches how layered builds are described: the lines of a block are
one layer, and `repeat` stacks that layer. The block

````markdown
```plank
flat-x 0 0 2  repeat=4 offset=0,0,2   # A
flat-y 0 0 3  repeat=4 offset=0,0,2   # B
```
````

is placed A₀, B₀, A₁, B₁, A₂, B₂, A₃, B₃: layer after layer, each plank
resting on planks placed before it. To place every repetition of one line
before the next line, put them in two steps.

A [scaffold](#scaffolds-level-2) line is the exception: it is placed whole,
all its repetitions in a row, in round 0, at its place among the lines.

**Moves.** What the builder does, in order, is a sequence of **moves**: place
a plank, place a scaffold plank, or take scaffolds away. Without scaffolds,
the moves are the planks. Players MAY step through the moves.

**Plank number.** Every plank has a number: its 1-based rank in placement
order across the whole file. It is never written in the file, so inserting a
plank needs no renumbering. Tools use it to point at a plank ("plank 17
floats") and players MAY use it to replay a step plank by plank. It is stable
only as long as nothing before it changes: for a reference that must survive
edits, such as one from the prose, give the plank an `id`.

---

## Guides (Level 2)

Builders measure a gap with planks: to space two walls correctly, they lay
planks between them as a ruler, then take them away. A **guide** is such a
ruler plank. It shows the builder how much empty space to leave, and it lets
the validator check that the space is right.

A guide is a line that starts with the word `guide`. The rest of the line is
an ordinary plank line, attributes included (`color` excepted):

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

A guide is not part of the construction:

- **It is shown only during its own step**, as a ghost (translucent,
  outlined), and disappears from the next step on. Within its step, it is
  laid where its line stands: once the planks and scaffolds written above it
  in the step are placed. A player that shows a step plank by plank SHOULD
  show the guide from that point on.
- **It has no plank number and does not count** towards the plank total or
  the `inventory`.
- **It holds nothing up.** A plank resting only on a guide floats.
- **It is laid like a plank**: on the ground, on the planks and scaffolds
  placed before it, or on a guide of its step laid before it. A guide with
  nothing under it when it is laid (`W-guide-floating`) is shown hanging in
  the air: write it after the planks it lies on. A gap with nothing under it
  at all, such as the top of a corbelled arch, cannot be measured there:
  measure it lower down, or leave the guide out.

A guide is also an **assertion about the gap**: the planks of its step must
leave room for it. A guide that shares a volume with a real plank, placed
before it or anywhere in the same step, means the gap is too small
(`E-guide-overlap`). Guides of the same step that touch each other form
a **chain**, so that a gap can be measured with several rulers laid end to
end. A ruler measures *between* two things: every chain must touch at least
**two real planks** placed up to the end of its step, the two sides of the
gap. A chain that touches fewer (`W-guide-loose`) is misplaced, or the gap it
measures is too wide.

Guides can be mixed to measure any gap: lengths, widths and thicknesses.
The 33 u between the two piers of a bridge are two lengths and one width:

```plank
guide flat-x 15 0 0
guide flat-x 30 0 0
guide flat-y 45 0 0
```

Readers that do not support guides MUST skip guide lines (with a warning)
rather than build them, since a guide built as a plank changes the model.

---

## Scaffolds (Level 2)

Some constructions only stand once they are complete. Two beams that meet
over a gap tip over until their counterweights are on; an arch needs every
stone before it locks. Builders put up a temporary support first, then slide
it out. A **scaffold** is such a support: real planks from the builder's
set, which carry load, and are taken away.

A scaffold is a line that starts with the word `scaffold`. The rest of the
line is an ordinary plank line, attributes included:

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

A scaffold is removed **at the end of its step**: after the last plank of
the step. To keep it longer, or to remove it earlier, `until=<id>` names the
plank whose placement releases it. That plank MUST come later in placement
order; it may be in a later step.

```plank
scaffold flat-y 12 0 0 repeat=8 offset=0,0,1 until=key
```

- A scaffold is **placed in placement order** at its line's place in the
  step, all its repetitions in a row (see [Placement Order](#placement-order)).
- It **supports** what rests on it: a plank resting on a scaffold does not
  float. It **needs support** itself, like any plank.
- A scaffold **has no plank number**. Tools number scaffold planks apart,
  from 1, in the order they are placed ("scaffold 3"). The planks of the
  construction keep their numbers whether there are scaffolds or not.
- `color` is ignored: tools draw scaffolds their own way (grey, striped), so
  that the builder never takes one for part of the model.
- A **removal** is a move, right after the plank that releases it. Scaffolds
  released by the same plank are removed together, in line order.
- Scaffolds count towards `inventory` while they are in place.

The format does not say which way a scaffold comes out. Builders slide a
scaffold plank out sideways or along its length, wherever it is free; the
validator only checks that one side is free (`W-scaffold-wedged`).

Readers that do not support scaffolds MUST skip scaffold lines with a
warning rather than build them, as for guides, since a scaffold built as a
plank changes the model.

**Scaffold, guide or hold.** A guide measures a gap and holds nothing up. A
scaffold holds planks up for a step or more. A builder can also hold one
plank for a moment with a hand: the placement order should then be changed
instead, or the hand made explicit (see `docs/proposals/hold.md`).

---

## View Hints (Level 2)

Pictures of a model (booklet pages, gallery thumbnails, the first view of a
player) are taken from a default direction, the front right, a little above.
When the planks of a step go on inside walls or behind what is built, the
author says where to look from.

````markdown
## Step 4: the spiral staircase

The stairs climb the back of the tower, so turn it around.

```plank view=back-left,20 zoom=1.5 focus=step
flat-x 0 -1.5 0 repeat=36 offset=0,0,1 rot-step=10 pivot=0,0
```
````

The attributes go on the opening fence of the block, after the word
`plank`, in the same `key=value` form as on plank lines:

| Attribute | Value | Meaning |
|---|---|---|
| `view` | `<direction>[,<elevation>]` | Where the camera is. `<direction>` is a name (below) or an azimuth in degrees; `<elevation>` is in degrees above the horizon, `0` to `90`, default `28` |
| `zoom` | positive number, `1` is the whole model | How close: `2` frames about half of the model, around the focus |
| `focus` | `step`, or an `id` | What the picture is centred on: the planks of this step, or one plank placed by the end of the step. Without it, the whole model |

| Direction | Azimuth | The camera is |
|---|---|---|
| `front` | 0 | on the viewer's side (`-y`), looking towards `+y` |
| `right` | 90 | at `+x` |
| `back` | 180 | at `+y` |
| `left` | 270 | at `-x` |
| `front-right`, `back-right`, `back-left`, `front-left` | 45, 135, 225, 315 | in between |
| `top` | any | straight above (elevation 90, no elevation to give) |

The azimuth turns counter-clockwise seen from above, the same way as `rot`.
The usual default is `35,28`: from the front, a little to the right.

`view` in the frontmatter sets the **model's view**: the cover of a booklet,
a thumbnail, the first view of a player, where a video's orbit starts and
ends. It takes a `view` value only (no `zoom` or `focus`).

- A step's hints apply to that step only. A step without `view` uses the
  model's view, or the tool's default.
- Hints are hints: a tool MAY ignore them, and a viewer may always move the
  camera. A reader that ignores them loses nothing but the author's advice.
- A translation's empty blocks carry no hints: views come from the original.

---

## Validation

A validator expands every line, then places the planks **one by one, in
placement order**, and checks each plank at the moment it is placed: only the
planks placed before it exist. Two planks that share a face are touching, not
overlapping. Diagnostics SHOULD give the plank number and the source line
number in the file.

| Code | Severity | Rule |
|---|---|---|
| `E-parse` | error | A line or an attribute value does not match the grammar |
| `E-orientation` | error | Unknown orientation |
| `E-frontmatter` | error | A frontmatter value has the wrong type (`plank` not three positive numbers, `inventory` not an integer…) |
| `E-duplicate-id` | error | Two planks have the same `id` after expansion |
| `E-below-ground` | error | A plank has `z < 0` |
| `E-overlap` | error | A plank shares a volume with a plank placed before it |
| `W-frontmatter` | warning | Frontmatter without `plankmd` or `title` |
| `W-unknown-attribute` | warning | Unknown attribute key; the attribute is ignored |
| `W-floating` | warning | A plank with `z > 0` rests on nothing when it is placed: no plank placed before it has its top face touching the new plank's bottom face over a positive area. Side contact does not count, and neither does a plank placed later, even in the same step. For a leaning plank, see below |
| `W-inventory` | warning | More planks in place at once than `inventory`, scaffolds included |
| `E-lean` | error | A `lean` value is not `<dir>:<degrees>` with a direction among `+x`, `-x`, `+y`, `-y` and an angle strictly between 0 and 90 |
| `W-unchecked-lean` | warning | The validator cannot check a leaning plank exactly. It MUST say so rather than report the plank as valid |
| `W-scaffold-release` | warning | `until` names no plank, names a scaffold, or names a plank placed before the scaffold. The scaffold is removed at the end of its step |
| `W-scaffold-floating` | warning | Once scaffolds are removed, a plank that rested on them rests on nothing |
| `W-scaffold-wedged` | warning | A scaffold that carries a plank has planks against it on every side, when it is removed: it cannot slide out |
| `W-view` | warning | A view hint does not parse (unknown direction, elevation out of range, zoom not positive, `focus` naming no plank placed by the end of its step). The hint is ignored |
| `W-unchecked-rotation` | warning | The validator cannot check a rotated plank exactly. It MUST say so rather than report the plank as valid |
| `E-guide-overlap` | error | A guide shares a volume with a real plank placed before it or in the same step: the gap it measures is too small |
| `W-guide-floating` | warning | A guide rests on nothing when it is laid: on neither the ground, nor a plank or scaffold placed before it, nor a guide of its step laid before it |
| `W-guide-loose` | warning | A chain of guides touches fewer than two real planks placed up to the end of its step: misplaced, or the gap is too wide |

`W-floating` is a warning rather than an error because a builder can hold a
plank while placing its support, but the placement order should then be
fixed.

**Scaffolds.** A validator places scaffolds in the order of the moves and
checks them like planks (`E-overlap`, `E-below-ground`, `W-floating`). At a
removal, the scaffolds removed no longer exist: every plank that rested on
them must still rest on something.

`E-frontmatter` also covers the [metadata](#metadata-of-shared-models) keys:
`url` not an absolute `https:` URL, `date` not a calendar date, `minutes` not
a positive integer, `tags` not a list of words, `image` leaving the folder.

**Rotated planks.** Since `rot` only turns around a vertical axis, a level
plank's height range stays axis-aligned and every check reduces to rectangles
in the ground plane. An exact check (separating axis test on the two
footprints) is a few lines; validators SHOULD implement it rather than fall
back to `W-unchecked-rotation`.

**Leaning planks** are boxes turned in space. Overlaps are checked as boxes
(separating axis test on the fifteen axes of two boxes). A leaning plank
touches its supports along an edge or at a corner, at an angle the author
rounds, so when either plank leans, two planks overlap only if they share a
volume deeper than a **tolerance of 0.2 u** (about 1.6 mm), and they touch
when they are less than 0.2 u apart. A plank rests on something when it
touches the ground, or touches a plank placed before it that does not lie
entirely above it. Touching is weaker than resting: whether a leaning plank
stays is for a physics check.

**Stability is out of scope.** A construction can pass validation and still
fall over: centre of mass beyond the base, long cantilevers, a spiral turned
too fast. A tool MAY run a physics check and report it under its own code
(prefixed `I-`, for information), never as a spec error.

---

## Grammar

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

Unknown keys are ignored with `W-unknown-attribute`, so later versions can add
keys without breaking older readers.

---

## Open Questions

- **Mixed plank sizes** (half planks, cubes): one `plank:` per file for now.
- **Which way a scaffold comes out**: an `out=<direction>` attribute on a
  scaffold line, which the validator would check is free and the booklet
  would tell the builder.
- **Fans of leaning planks**: a `lean-step`, each repetition tipped a little
  more.
- **Translations and holding a plank**: proposals in `docs/proposals/`
  (`translations.md`, `hold.md`). The reference tools already read
  translations.
- **Embedding**: how another Markdown document references a model
  (`!ref plank:slug`, or a fenced block that points to a file).
- **Stability**: whether a shared, deterministic balance check belongs in the
  spec or stays a tool feature. The reference implementation has one
  (`src/physics.js`), reported under `I-` codes.

---

## Changes from v0.1

v0.2 only adds: a v0.1 file is a valid v0.2 file and means the same.

- **Leaning planks**: the `lean` attribute, `E-lean`, and the tolerance for
  contacts that involve a leaning plank.
- **Scaffolds**: `scaffold` lines, the `until` attribute, moves, and
  `W-scaffold-release`, `W-scaffold-floating`, `W-scaffold-wedged`.
  `W-inventory` counts the planks in place at once.
- **View hints**: `view`, `zoom` and `focus` on a block's opening fence, `view`
  in the frontmatter, and `W-view`.
- **Metadata of shared models**: the reserved keys `url`, `based-on`, `date`,
  `image`, `tags` and `minutes`, checked by `E-frontmatter`.

A file that uses one of these SHOULD say `plankmd: "0.2"`, so that a v0.1
reader warns about the version before it builds a leaning plank level.
