# PlankMD: Format Specification v0.1

> Status: Draft, October 2026
> License: MIT

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
| 2 | Per-line attributes (`color`, `id`, `repeat`, `rot`, `pivot`…) and guides | Colors, names, compact repetitions, free angles, measuring gaps |

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
plankmd: "0.1"            # spec version (required at Level 1)
title: Small square tower # required at Level 1
lang: en                  # BCP 47, optional
plank: [15, 3, 1]         # L, W, T in units; default [15, 3, 1]
unit_mm: 7.8              # real size of 1 u, for rendering and print scale
inventory: 30             # planks the builder is expected to own (optional)
difficulty: 1             # 1 (toddler) to 5 (expert), optional
author: Jane Doe          # optional
license: CC-BY-4.0        # SPDX identifier of the model's license, optional
palette:                  # optional named colors for `color=` (Level 2)
  roof: "#b03a2e"
---
```

Frontmatter is a flat YAML mapping, plus the one nested `palette` mapping.
Unknown keys are allowed and ignored, so tools can add their own.

**Steps.** Every ` ```plank ` block is **one building step**, in document
order. Steps are cumulative: step *n* shows everything placed in steps 1 to
*n*. The last Markdown heading before a block is that step's title; the text
between that heading and the block is that step's instructions.

A file with a single block and no frontmatter is a valid Level 0 file: one
step, the whole construction.

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

Rotations only turn around a vertical axis: planks always stay level or
plumb. Leaning planks are out of scope for v0.1.

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
  outlined), and disappears from the next step on.
- **It has no plank number and does not count** towards the plank total or
  the `inventory`.
- **It holds nothing up.** A plank resting only on a guide floats.
- **It needs no support itself**: it may hang in the air to measure a gap
  between two upper walls.

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
| `W-floating` | warning | A plank with `z > 0` rests on nothing when it is placed: no plank placed before it has its top face touching the new plank's bottom face over a positive area. Side contact does not count, and neither does a plank placed later, even in the same step |
| `W-inventory` | warning | More planks than `inventory` |
| `W-unchecked-rotation` | warning | The validator cannot check a rotated plank exactly. It MUST say so rather than report the plank as valid |
| `E-guide-overlap` | error | A guide shares a volume with a real plank placed before it or in the same step: the gap it measures is too small |
| `W-guide-loose` | warning | A chain of guides touches fewer than two real planks placed up to the end of its step: misplaced, or the gap is too wide |

`W-floating` is a warning rather than an error because a builder can hold a
plank while placing its support, but the placement order should then be
fixed.

**Rotated planks.** Since rotations only turn around a vertical axis, a
plank's height range stays axis-aligned and every check reduces to rectangles
in the ground plane. An exact check (separating axis test on the two
footprints) is a few lines; validators SHOULD implement it rather than fall
back to `W-unchecked-rotation`.

**Stability is out of scope.** A construction can pass validation and still
fall over: centre of mass beyond the base, long cantilevers, a spiral turned
too fast. A tool MAY run a physics check and report it under its own code
(prefixed `I-`, for information), never as a spec error.

---

## Grammar

```
line        = [ "guide" ws ] orientation ws num ws num ws num { ws attribute } [ ws? comment ]
            | [ ws? comment ] ;
orientation = ( "flat" | "edge" | "up" ) "-" ( "x" | "y" ) ;
attribute   = key "=" value ;
key         = "color" | "id" | "repeat" | "offset" | "rot" | "rot-step" | "pivot" ;
num         = [ "-" ] digit { digit } [ "." digit { digit } ] ;
comment     = "#" { any character } ;
```

Unknown keys are ignored with `W-unknown-attribute`, so later versions can add
keys without breaking older readers.

---

## Open Questions

- **Mixed plank sizes** (half planks, cubes): one `plank:` per file for now.
- **Leaning planks**: rotations around horizontal axes, for ramps and
  A-frames.
- **Embedding**: how another Markdown document references a model
  (`!ref plank:slug`, or a fenced block that points to a file).
- **Stability**: whether a shared, deterministic balance check belongs in the
  spec or stays a tool feature. The reference implementation has one
  (`src/physics.js`), reported under `I-` codes.
