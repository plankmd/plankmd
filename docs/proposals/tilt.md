# Proposal: tilted planks

> Status: accepted, part of PlankMD v0.3 (`SPEC.md`), and implemented in
> the reference tools. This page keeps the reasons and the alternatives.

## The problem

Builders make true arches: planks on their edges, set like the rays of a fan
around the middle of the opening, each one turned a few degrees further than
the one before, the last one in the middle locking the arch like a keystone.
Aqueducts, bridges, vaults and sun patterns are built this way, and they are
among the most photographed plank constructions.

v0.2 cannot write them in a useful way:

- `rot` turns a plank around a **vertical** axis only.
- `lean` tips a plank over, but it pivots on the **plank's own** bottom edge,
  and its angle is between 0 and 90. A fan turns every plank around **one
  common** axis, by angles that go from -90 to +90. With `lean`, each
  voussoir is a line of its own, with a position worked out by hand from
  sines and cosines, and the half beyond the crown leans "backwards", which
  `lean` cannot say without changing direction.
- The spec listed it as an open question: "Fans of leaning planks: a
  `lean-step`, each repetition tipped a little more".

## Proposed syntax

Three line attributes, built like `rot`, `rot-step` and `pivot`:

```plank
edge-y -0.5 0 12 repeat=19 offset=0,0,0 tilt=x:-90 tilt-step=5 tilt-pivot=0,0.5
```

| Attribute | Value | Meaning |
|---|---|---|
| `tilt` | `<axis>:<degrees>` | The top of the plank goes towards `+x` (`x`) or `+y` (`y`) by that angle, around a horizontal axis. Any angle |
| `tilt-step` | degrees | Added at each repetition |
| `tilt-pivot` | `h,z` | The axis passes through `x = h` (or `y = h`) at height `z`. Default: the centre of the box |

The line above is half an arch: 19 planks on their edges, 11.5 u from the
axis, from lying on the table to upright, every 5°.

## Semantics

- The position is the box before the tilt, as for `lean` and `rot`.
- Repetition `i` turns by `tilt + i × tilt-step` around the axis, which does
  not move with `offset` (like `pivot`).
- `tilt` applies before `rot`, which turns the tilted plank as a whole.
- `lean` and `tilt` on the same line is an error (`E-tilt`): two ways to tip
  the same plank would need an order between them, for no construction that
  needs both.

## Validation

A tilted plank is a box turned in space, like a leaning plank: overlaps and
contacts are checked as boxes, within the same tolerance of 0.2 u. A plank
rests on a tilted plank it touches, unless the tilted plank is entirely
above it. So each half of an arch rests on itself as it rises, and the
keystone needs both halves: it goes in a step of its own, after the two
halves have been raised together, round by round.

The balance check does not model edge contacts; it skips models with tilted
planks (`I-unchecked-lean`), as it skips leaning planks, and the drop test
checks them.

**Valid is not standing.** A stone voussoir is a wedge that touches its
neighbours over a whole face. Planks are rectangles: in a fan, two of them
touch only along their inner edges, with a gap that opens outwards, so every
joint is a hinge with a few degrees of play. In the drop test, semicircular
fans of 37 planks fall once their centring is removed, bare, between high
abutments, under a filled spandrel and a deck, and with a friction of 0.8:
the keystone slips down and the halves fold in. The sample `fan-arch` falls
on purpose to show it. `tilt` describes such arches exactly; whether one
stands is a question for the physics, as for any model.

## Alternatives considered

- **`lean-step`**: each repetition leans a little more. The pivot edge of a
  leaning plank moves with its lean, so a fan needs a rule for where each
  plank goes, and the angles still stop at 90°. A fan is a rotation around
  one axis: saying so is simpler.
- **`rot-x` and `rot-y`**: rotations around the two horizontal axes, through
  the centre of the plank. Two attributes with an order between them, and
  free rotations nobody builds. `tilt` has one axis per line, which is what
  a fan needs.
- **Free rotations (Euler angles, quaternions)**: complete, and impossible to
  read or write by hand.
