---
plankmd: "0.2"
title: Bridge on a scaffold
lang: en
inventory: 30
difficulty: 2
author: PlankMD contributors
license: CC0-1.0
date: 2026-10-14
tags: [bridge, scaffold, counterweight]
minutes: 10
view: front-right,22
---

# Bridge on a scaffold

Two beams meet over a gap that neither could cross alone. Each beam tips
over until a counterweight holds its other end, so a stack of planks carries
them while they go on, then slides out. 20 planks, and 4 more for the
scaffold.

## Step 1: the piers

Build two stacks of four planks, lying flat and parallel, with eight plank
widths between them.

```plank
flat-y 0 0 0  repeat=4 offset=0,0,1
flat-y 27 0 0 repeat=4 offset=0,0,1
```

## Step 2: the span

Build a stack of four planks in the middle of the gap: the scaffold. Lay a
beam from each pier, so that the two beams meet over the scaffold. Weigh the
outer end of each beam down with five planks. Then slide the scaffold out:
the bridge stands on its own.

```plank view=front,12
scaffold flat-x 7.5 6 0 repeat=4 offset=0,0,1
flat-x 0 6 4
flat-x 15 6 4
flat-y 0 0 5  repeat=5 offset=0,0,1
flat-y 27 0 5 repeat=5 offset=0,0,1
```
