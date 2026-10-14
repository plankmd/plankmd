# Proposal: scaffolding planks

> Status: accepted, part of PlankMD v0.2 (`SPEC.md`), and implemented in
> the reference tools. This page keeps the reasons and the alternatives.

## The problem

Some constructions only stand once they are complete. An arch needs every
stone before the keystone locks them; a dome, a vault or a wide lintel are
the same. Real builders put up a temporary support first, a stack of planks
that carries the arch while it is laid, then they slide it out. Masons call
it centring; here it is scaffolding.

The format has two neighbours of this idea, and neither fits:

- a **guide** is a ruler. It holds nothing up, on purpose: it is an
  assertion that a gap is empty;
- **`hold`** ([hold.md](hold.md)) is a hand. It fixes one plank for a
  moment, two at most, and only within a step.

A scaffold is neither: it is made of real planks from the builder's set, it
carries load, it stays for a whole step or several, and it is taken away.
Today an author can only describe it in prose, and every tool then disagrees
with the prose: the validator reports `W-floating` on the arch, the balance
check reports `I-unstable`, the replay shows the arch collapsing, and the
booklet never says to build the support or to remove it.

## Proposed syntax

A line that starts with the word `scaffold`, like `guide`. The rest of the
line is an ordinary plank line, attributes included. A corbel bridge: two
beams meet over the gap, each one tips until the counterweights pin its
other end down, so a stack carries them meanwhile:

````markdown
## Step 2: the span

Build a flat stack of four planks in the middle of the gap: the beams will
rest on it. Lay the two beams from the piers to meet over the stack, then
weigh their outer ends down with five planks each. Slide the stack out.

```plank
scaffold flat-x 7.5 6 0 repeat=4 offset=0,0,1
flat-x 0 6 4
flat-x 15 6 4
flat-y 0 0 5 repeat=5 offset=0,0,1
flat-y 27 0 5 repeat=5 offset=0,0,1
```
````

(The piers are two stacks of four `flat-y` planks at `x = 0` and `x = 27`,
placed in step 1. Checked with the v0.1 tools: with the stack in place
every plank stands as it is placed; without it the beams fall from their
placement until the fifth counterweight; the finished bridge stands and
withstands the drop test.)

A scaffold is removed **at the end of its step** by default. To keep it
longer, `until=<id>` names the plank whose placement releases it:

```plank
scaffold flat-y 12 0 0 repeat=8 offset=0,0,1 until=key
```

| Attribute | Value | Meaning |
|---|---|---|
| `until` | an `id` | The scaffold is removed right after the plank with this `id` is placed. The plank named must come later in placement order; it may be in a later step. Without `until`, the scaffold is removed after the last plank of its step. |

Rules:

- A scaffold is **placed in placement order** like any plank, at its line's
  position in the step, and it takes planks from the builder's set.
- A scaffold line with `repeat` is **placed whole**: all its repetitions in
  a row, before the next line. Scaffolding is built as a unit, so it does
  not interleave by round with the planks it will carry. (Otherwise the
  example above would lay the beams on a stack one plank high.)
- It **supports** what rests on it: a real plank resting on a scaffold does
  not float.
- It **needs support itself**, like a real plank: a scaffold in the air
  floats.
- A scaffold **has no plank number**: the numbers of real planks do not
  change when scaffolding is added or removed. Tools refer to it by its
  step and line, or by its `id`.
- `color` is ignored: tools draw scaffolds in their own way, so that the
  builder always tells them from the model.
- A removal is an **event in the placement order**, after the plank that
  releases it. Several scaffolds released by the same plank are removed
  together, in line order.

## Meaning for tools

- **Validator.**
  - A scaffold is placed and checked like a real plank: `E-overlap`,
    `E-below-ground`, `W-floating`.
  - A real plank resting only on scaffolds is supported: no `W-floating`.
  - At each removal, every plank that rested on the removed scaffold must
    still rest on something (the ground, a real plank, or a scaffold that
    stays). Otherwise `W-scaffold-floating`, on the plank left in the air.
  - `W-scaffold-release`: `until` names a plank that does not exist, or that
    comes before the scaffold in placement order.
  - `W-scaffold-wedged`: at removal, a scaffold has a plank resting on it and
    planks against it on every side, so it cannot slide out, neither along
    its length nor sideways. This is a warning rather than an error because
    a builder can lift the plank above a little; the design should avoid it.
    (A first draft only looked at the two ends; but a builder pulls a
    scaffold out sideways from under a beam, which is often the easy way.)
  - Scaffolds count towards `inventory` while they are in place:
    `W-inventory` compares the inventory with the **peak** number of planks
    present at once, real and scaffold, not with the final count.
- **Balance check.** A scaffold is an ordinary body until its removal. Every
  removal is a check point: the construction must stand without it. An
  `I-unstable` at a removal reads "the arch does not stand on its own once
  the scaffolding is removed".
- **Drop test replay.** Scaffold bodies are placed like the others and
  deleted from the world at their removal; the simulation goes on and shows
  whether the model holds.
- **Player.** Scaffolds are drawn in a distinct look (grey, hatched or
  translucent, but solid: they are real planks, not ghosts like guides).
  The plank-by-plank slider counts each removal as one move, so that the
  reader sees the construction before and after.
- **Booklet and video.** The step text gets generated lines: "Build a
  support of 6 planks (they will be removed)" where the scaffold is placed,
  and "Take away the 6 support planks" at the removal. The video shows the
  scaffold sliding out.
- **Translations.** Scaffold lines are geometry: they stay in the original,
  nothing to translate.
- **Readers that do not support scaffolds** (v0.1) MUST skip scaffold lines
  with a warning rather than build them, as for guides, since a scaffold
  built as a plank changes the model. The planks that rested on it are then
  reported `W-floating`, which is the truth for that reader.

## Recommendations

- Scaffolds a builder can slide out: planks lying flat on the ground or on a
  flat stack, with nothing against their ends. Not planks wedged between
  two walls.
- Keep scaffolds low and simple: a flat stack is the normal case. A scaffold
  that is itself a construction needs its own instructions.
- Use `hold` for one plank for a moment, a scaffold for a whole step. Do not
  use scaffolds to hide a bad placement order: a wall never needs one.
- The LLM instructions should say: a scaffold is for arches, vaults, bridges
  and wide lintels; say in the prose what it is for and when it goes away.

## Alternatives considered

- **Guides that bear load.** It would make a guide two things at once: an
  assertion that a space is empty and a thing that fills it. `E-guide-overlap`
  would no longer mean anything.
- **`hold` with many hands.** A hand is not a plank: it takes nothing from
  the set, it needs no support, and two is the limit for a reason.
- **An explicit removal line** (`remove <id>` in a later block). Every
  scaffold would need an `id` and its removal would be far from its
  placement. `until` keeps one line per scaffold, with the default (end of
  step) needing nothing at all.
- **Scaffolds with plank numbers.** Adding a support would renumber the
  planks of the model, and the booklet would count planks that are not in
  the finished construction.

## Open questions

- Should a scaffold be allowed to rest on a real plank placed later, in the
  way `hold` allows? No for now: a scaffold is built before what it carries.
- Which way a scaffold comes out. The format does not say: tools pick a
  free side (the reference video slides it out sideways, towards the
  front). An `out=<direction>` attribute (`out=-y`) would let the author say
  it; the validator would check that side is free, and the booklet would
  tell the builder.
