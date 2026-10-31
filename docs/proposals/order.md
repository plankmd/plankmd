# Proposal: whole lines

> Status: accepted, part of PlankMD v0.3 (`SPEC.md`), and implemented in
> the reference tools. This page keeps the reasons and the alternatives.

## The problem

A ring of planks lying flat around a centre is one line since v0.1:
`repeat`, no `offset`, `rot-step` and a `pivot`. Drums, turrets, domes and
spheres are stacks of such rings, each one turned half a side from the one
below. It is how builders make a round dome by hand.

But the lines of a block are interleaved by round (Placement Order, rule 3):
the first plank of every line, then the second of every line. For layers
stacked with `repeat`, that is right. For rings, it is not: the first plank
of each ring comes first, one above the other, a column that rests on
nothing. A dome in one block gets a `W-floating` for every ring, and a
booklet that tells the builder to stack a column.

The only way out in v0.2 is one step per ring: 21 steps for a small dome, and
a booklet of 21 pages that say "the next ring".

## Proposed syntax

One line attribute:

```plank
flat-x -7.5 13 0 repeat=6 offset=0,0,0 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 13 1 repeat=6 offset=0,0,0 rot=30 rot-step=60 pivot=0,0 order=whole
```

| Value | Meaning |
|---|---|
| `round` | The default: the line goes by rounds, interleaved with the other lines |
| `whole` | The line is placed whole, all its repetitions in a row, in round 0, at its place among the lines; it drops out of the following rounds |

This is exactly how a scaffold line is already placed: `order=whole` lets
any line be placed that way.

## Where it helps

- Rings and domes, in one block per part of the build instead of one step
  per ring.
- Any row that must be laid completely before what goes on it: the planks of
  a floor laid side by side, then the walls on it, in the same step.
- Layers of different widths in one block (a stepped roof, the spandrels of
  an aqueduct): each layer whole, then the next.

## Alternatives considered

- **One step per ring**: valid today, and a booklet of near-empty pages.
- **A block attribute** (` ```plank order=line `): every line of the block
  whole. Simpler for domes, but it cannot mix rounds and whole lines in one
  step, and a fence already carries the view.
- **Nested repetition** (rings × layers in one line, with a radius step and a
  count that drops): one line for a whole dome, and a much harder grammar
  and placement order. Left as an open question.
