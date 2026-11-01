---
plankmd: "0.3"
title: Ring dome
lang: en
inventory: 122
difficulty: 3
author: PlankMD contributors
license: CC0-1.0
date: 2026-10-31
tags: [dome, ring, corbel]
minutes: 30
view: front-right,30
---

# Ring dome

A corbelled dome, the way builders make one by hand: rings of planks laid
flat around a centre, each ring a little smaller than the one below and
turned half a side, so that every plank bridges a joint. 122 planks.

## Step 1: the first rings

Lay a ring of ten planks flat on the table, their inner corners just touching, all around a centre. Lay the next ring on it, a little smaller, and turned so that each plank bridges a joint of the ring below.

```plank
flat-x -7.5 24 0 repeat=10 offset=0,0,0 rot-step=36 pivot=0,0 order=whole
flat-x -7.5 23 1 repeat=9 offset=0,0,0 rot=18 rot-step=40 pivot=0,0 order=whole
flat-x -7.5 22 2 repeat=9 offset=0,0,0 rot=38 rot-step=40 pivot=0,0 order=whole
flat-x -7.5 21 3 repeat=9 offset=0,0,0 rot=58 rot-step=40 pivot=0,0 order=whole
flat-x -7.5 20 4 repeat=8 offset=0,0,0 rot=78 rot-step=45 pivot=0,0 order=whole
flat-x -7.5 19 5 repeat=8 offset=0,0,0 rot=100.5 rot-step=45 pivot=0,0 order=whole
```

## Step 2: the shoulders

Each ring now takes fewer planks: six, then five. Keep closing in by about a third of a plank width on every ring.

```plank
flat-x -7.5 18 6 repeat=6 offset=0,0,0 rot=123 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 17 7 repeat=6 offset=0,0,0 rot=153 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 16 8 repeat=6 offset=0,0,0 rot=183 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 15 9 repeat=6 offset=0,0,0 rot=213 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 14 10 repeat=6 offset=0,0,0 rot=243 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 13 11 repeat=6 offset=0,0,0 rot=273 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 12 12 repeat=5 offset=0,0,0 rot=303 rot-step=72 pivot=0,0 order=whole
flat-x -7.5 11 13 repeat=5 offset=0,0,0 rot=339 rot-step=72 pivot=0,0 order=whole
```

## Step 3: the top

The last rings are squares, then triangles.

```plank
flat-x -7.5 10 14 repeat=4 offset=0,0,0 rot=15 rot-step=90 pivot=0,0 order=whole
flat-x -7.5 9 15 repeat=4 offset=0,0,0 rot=60 rot-step=90 pivot=0,0 order=whole
flat-x -7.5 8 16 repeat=4 offset=0,0,0 rot=105 rot-step=90 pivot=0,0 order=whole
flat-x -7.5 7 17 repeat=3 offset=0,0,0 rot=150 rot-step=120 pivot=0,0 order=whole
flat-x -7.5 6 18 repeat=3 offset=0,0,0 rot=210 rot-step=120 pivot=0,0 order=whole
flat-x -7.5 5 19 repeat=3 offset=0,0,0 rot=270 rot-step=120 pivot=0,0 order=whole
```

## Step 4: the cap

Close the top with two planks side by side.

```plank
flat-x -7.5 -3 20
flat-x -7.5 0 20
```
