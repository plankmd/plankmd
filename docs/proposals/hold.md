# Proposal: holding a plank while the next ones go on

> Status: proposal for PlankMD v0.2, not part of the format yet.

## The problem

A builder places planks one at a time, and every plank should stand the
moment it is placed. Some constructions cannot be built that way: a plank
tips over until a later plank pins it down (the first stone of an arch, a
cantilever whose counterweight goes on just after, a lintel laid before the
plank that locks it). Real builders hold such a plank with one hand while
the other places the next one.

Today the format cannot say so:

- the validator reports `W-floating` for a plank that rests on nothing when
  it is placed, and its text already says the builder may hold it;
- the balance check reports `I-unstable` ("it stands again afterwards: hold
  it, or change the placement order");
- the build replay in the player shows the plank falling;
- the booklet, the video and the player never tell the builder to hold
  anything, so the builder is surprised.

## Proposed syntax

A line attribute, `hold`, on the plank to hold:

```plank
flat-x 0 0 6 hold=step          # hold it until the end of this step
flat-x 0 12 6 hold=lid          # hold it until the plank named "lid" is placed
flat-y 0 0 7 id=lid
```

| Value | Meaning |
|---|---|
| `step` | Hold the plank until the last plank of its step is placed. |
| an `id` | Hold the plank until the plank with this `id` is placed. The plank named must come later in placement order, in the same step. |

With `repeat`, every repetition is held, each one until its own release
(`hold=lid` with `id=lid` on a repeated line pairs `foo-1` with `lid-1`, and
so on).

## Meaning for tools

- **Validator.** A held plank that rests on nothing when it is placed is not
  reported `W-floating`, as long as it rests on something when it is
  released. New warnings:
  - `W-hold-release`: the plank named by `hold` does not exist, or comes
    before the held plank, or in another step;
  - `W-hold-floating`: the plank still rests on nothing when it is released;
  - `W-hands`: more than two planks are held at the same time.
- **Balance check.** A held plank is fixed in place until its release: the
  check already supports this (`balance(..., { hold })` in `src/physics.js`).
  An `I-unstable` that holding solves is no longer reported.
- **Drop test replay.** A held plank is kinematic (does not move) until its
  release.
- **Player, booklet, video.** The held plank is marked (a hand icon, an
  outline), and the step text gets a generated line: "Hold plank 50 until
  plank 51 is on."
- **Readers that ignore `hold`** (v0.1) report `W-unknown-attribute` and
  build the same planks: the model is unchanged, only the advice is lost.

## Recommendations

- Models for children should not need `hold`: change the placement order
  first (counterweight before overhang), or the design.
- `hold` is for the constructions that need it: arches, bridges, cantilevers.
- The LLM instructions should say: use `hold` only when no placement order
  avoids it, and never more than two at a time.

## Alternatives considered

- **Prose only** ("hold the plank until..."): tools cannot check it, and the
  player and the replay still show a fall.
- **A step-level flag** ("this step needs holding"): too coarse, it does not
  say which plank.
- **Let the checks ignore instability during a step**: hides real mistakes,
  such as the Eiffel tower legs in the v0.1 gallery, whose outer planks sat
  half a width over the edge and tipped (fixed by changing the design).
