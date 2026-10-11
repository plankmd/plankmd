---
plankmd: "0.1"
title: Diving board
lang: en
inventory: 30
difficulty: 1
license: CC0-1.0
expect: falls
palette:
  board: "#3b6e8f"
  weight: "#b03a2e"
---

# Diving board

A model that falls on purpose, to see how balance works. A small tower, then
a diving board that reaches out over the edge. One board holds. Two boards do
not. 20 planks.

## Step 1: the tower

Build a small square tower, four layers high: two planks one way, two planks
across them, four times.

```plank
guide flat-x 0 3 0 repeat=3 offset=0,3,0   # three widths between the first two planks
flat-x 0 0 0  repeat=4 offset=0,0,2
flat-x 0 12 0 repeat=4 offset=0,0,2
flat-y 0 0 1  repeat=4 offset=0,0,2
flat-y 12 0 1 repeat=4 offset=0,0,2
```

## Step 2: the first board

Lay a plank on top, so that it sticks out almost half its length beyond the
tower. It holds: its middle is still above the tower, just inside the edge.

```plank
flat-x 7 0 8 color=board
```

## Step 3: the second board, a step too far

Lay a second plank on the first one, sticking out even further. Each plank
sits well on the one below, but together their middle is now beyond the edge
of the tower: the whole board tips over.

```plank
flat-x 14 0 9 color=board
```

## Step 4: the weights that would have saved it

Too late! Placed before the second board, these two planks across the first
board, just inside the tower, would have held everything down. Try it: move
this step before step 3. One weight is not enough: too far back, it tips the
first board backwards; further forward, it cannot hold the second board.

```plank
flat-y 10 -6 9  color=weight
flat-y 10 -6 10 color=weight
```
