# Proposal: leaning planks

> Status: accepted, part of PlankMD v0.2 (`SPEC.md`), and implemented in
> the reference tools. This page keeps the reasons and the alternatives.

## The problem

In v0.1 a plank is level or plumb: `rot` turns it around a vertical axis,
nothing tilts it. The spec lists leaning planks as an open question, and it
is the limit builders meet first:

- a ramp or a staircase slope: a plank with one end on the ground and the
  other on a step;
- a pitched roof: planks resting on a ridge and on the walls;
- an A-frame or a tent: two standing planks leaning on each other;
- a plank propped against a wall, a buttress, a drawbridge;
- the fan patterns builders love: planks tipped in sequence.

An author can only approximate these with level planks, and the result does
not look like what was built.

## Proposed syntax

A line attribute, `lean`, with a direction and an angle:

```plank
flat-x 0 0 0 lean=-x:20        # a ramp: the -x end stays down, the +x end rises
up-y 0 10 0 lean=+y:12         # a standing plank leaning against a wall at +y
flat-x 0 0 6 lean=-y:30        # a roof slab, raised on its +y side
```

| Attribute | Value | Meaning |
|---|---|---|
| `lean` | `<dir>:<degrees>`, with `<dir>` one of `+x`, `-x`, `+y`, `-y` and `0 < degrees < 90` | The plank is tipped over towards `<dir>` by that angle, turning around the **bottom edge on its `<dir>` side**. That edge does not move. |

One mental model for every pose: *take the plank where the line puts it,
then tip it towards `<dir>` by so many degrees, pivoting on the bottom edge
of that side.* For a lying plank the opposite end rises (a ramp rising
towards `+x` is tipped towards `-x`); for a standing plank the top leans
over (towards the wall it rests on).

Rules:

- `lean` applies before `rot`: the plank is tipped in the frame of its
  orientation, then the whole thing turns around the vertical axis through
  the centre of its box before the lean (or around `pivot`).
- `offset` moves the pivot edge with every repetition. `rot-step` still
  turns each repetition a little more; there is no `lean-step` (see Open
  questions).
- The position `x y z` is still the minimum corner of the box **before**
  the lean, so the author never computes a sine: the low edge is on the
  grid, the rest follows.
- `0` is not a lean: leave the attribute out. `90` is another orientation:
  write that orientation.

## Meaning for tools

- **Geometry.** A leaning plank is an oriented box. Its ground footprint is
  still a convex quadrilateral, but its height varies across it, so the
  v0.1 shortcut (rectangles in the ground plane plus a height range) no
  longer applies. Tools MUST treat it as a box in space.
- **Validator.**
  - `E-lean`: the value does not match `<dir>:<degrees>`, the direction is
    not one of the four, or the angle is not strictly between 0 and 90.
  - `E-overlap` and `E-guide-overlap` use an exact box-box test (separating
    axis theorem, fifteen axes), within a tolerance of 0.2 u (about 1.6 mm)
    when either plank leans: the author rounds the angle. A validator that
    cannot MUST report `W-unchecked-lean` rather than call the plank valid,
    as `W-unchecked-rotation` does for `rot`.
  - `E-below-ground`: the lowest point of the tipped box is below `z = 0`.
    This cannot happen with the pivot rule when `z ≥ 0`, but a reader that
    computes the box must still check.
  - `W-floating`: a leaning plank is supported when it **touches** the
    ground or a plank placed before it: an edge or a corner within the
    tolerance of a top face, a side face, or another leaning plank's face.
    Touching is weaker than resting: a plank that touches at one point will
    still fall. Validation says whether the plank is in contact; whether it
    stays is for the balance check.
- **Balance check.** The v0.1 check builds contact polygons from footprints
  of level planks. Leaning planks need general contact manifolds between
  boxes (corner on face, edge on face, face on face at an angle, edge on
  edge). Until the reference implementation has them, it MUST report
  `I-unchecked-lean` for any model with a leaning plank, and not a verdict.
- **Drop test.** The physics engine handles oriented boxes natively: set
  the body's rotation and the test is exact. For v0.2 this is the stability
  tool for leaning models, and the player should say so when the balance
  check declines.
- **Player, booklet, video.** The plank is drawn with its rotation. Nothing
  else changes.
- **Guides** may lean too (`guide flat-x 0 0 0 lean=-x:20` measures a slope).
- **Readers that ignore `lean`** (v0.1) report `W-unknown-attribute` and
  build the plank level, which is a different model, usually with overlaps.
  A file that uses `lean` SHOULD say `plankmd: "0.2"` so that old readers
  can warn on the version before they get the geometry wrong.

## Recommendations

- Leaning planks fall more easily than level ones. Always run the drop test
  on a model that uses them, and say in the prose what the plank rests on.
- Prefer angles a builder can set by eye and by touch: a plank whose end
  rests on a known ledge, two planks leaning on each other. The angle in
  the file is then the one that geometry gives, and the author should write
  it rounded to the degree; the tolerance of the checks absorbs the rest.
- Models for children should not use `lean`.
- The LLM instructions should say: `lean` is for ramps, roofs and props;
  never for a plank that rests only on the ground.

## Alternatives considered

- **Rotation around the centre**, like `rot`. The low end then drops below
  the line's `z`, and the author must compute `z = (L / 2) sin θ` to put a
  ramp on the ground. The pivot-edge rule keeps the grid.
- **A rise in units** (`rise=4`: the far end is 4 u higher). Grid-friendly,
  no trigonometry, but an A-frame or a fan is thought of in angles, and two
  conventions for one thing is one too many. It could come later as sugar.
- **Signed rotations about the world axes** (`tilt-x=20`, `tilt-y=-20`).
  Compact, but every author has to remember the right-hand rule; `rot`
  got away with it because there is only one vertical axis.
- **Rotations about the plank's own axes** (tilt and roll). Which of the
  plank's axes is horizontal depends on the pose (an `edge-x` plank's width
  is vertical), so the meaning would change with the orientation.

## Open questions

- `lean-step`, for fans: each repetition tipped a little more. Natural, but
  the pivot edge moves with the lean, so the fan geometry needs a rule.
- Whether to allow leaning towards a direction along the plank's length for
  `edge` planks (`edge-x` tipped towards `+x` stands on one corner), or to
  reject it as unbuildable.
- The tolerance for "touching" in the validator, which is now a point or an
  edge rather than a face. Probably the same `EPS` as today.
