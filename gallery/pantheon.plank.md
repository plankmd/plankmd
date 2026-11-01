---
plankmd: "0.3"
title: Pantheon
lang: en
inventory: 347
difficulty: 4
author: PlankMD contributors
license: CC0-1.0
date: 2026-10-31
tags: [dome, temple, rome, ring]
minutes: 90
view: front-right,25
palette:
  stone: "#cfc6b4"
  marble: "#efe9dd"
---

# Pantheon

A round temple under a dome open to the sky, behind a portico of eight
columns. The drum and the dome are rings of planks laid flat around the
centre, each one turned half a side from the one below. 347 planks.

## Step 1: the drum

Lay a ring of ten planks flat, their inner corners touching, all around a
centre. Lay seven more rings on it, the same size, each one turned half a
plank so that every plank bridges a joint.

```plank
flat-x -7.5 24 0 repeat=10 offset=0,0,0 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 1 repeat=10 offset=0,0,0 rot=18 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 2 repeat=10 offset=0,0,0 rot=36 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 3 repeat=10 offset=0,0,0 rot=54 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 4 repeat=10 offset=0,0,0 rot=72 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 5 repeat=10 offset=0,0,0 rot=90 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 6 repeat=10 offset=0,0,0 rot=108 rot-step=36 pivot=0,0 order=whole color=stone
flat-x -7.5 24 7 repeat=10 offset=0,0,0 rot=126 rot-step=36 pivot=0,0 order=whole color=stone
```

## Step 2: the lower dome

From now on, each ring is one third of a plank width smaller than the one
below, and still turned half a side. When a ring gets too small for its
planks, it takes fewer of them: nine, then eight, then six.

```plank view=front-right,35
flat-x -7.5 23 8 repeat=9 offset=0,0,0 rot=144 rot-step=40 pivot=0,0 order=whole
flat-x -7.5 22 9 repeat=9 offset=0,0,0 rot=164 rot-step=40 pivot=0,0 order=whole
flat-x -7.5 21 10 repeat=9 offset=0,0,0 rot=184 rot-step=40 pivot=0,0 order=whole
flat-x -7.5 20 11 repeat=8 offset=0,0,0 rot=204 rot-step=45 pivot=0,0 order=whole
flat-x -7.5 19 12 repeat=8 offset=0,0,0 rot=226.5 rot-step=45 pivot=0,0 order=whole
flat-x -7.5 18 13 repeat=6 offset=0,0,0 rot=249 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 17 14 repeat=6 offset=0,0,0 rot=279 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 16 15 repeat=6 offset=0,0,0 rot=309 rot-step=60 pivot=0,0 order=whole
```

## Step 3: the upper dome and the oculus

Carry on to the top, and stop while the hole in the middle is still wide
open: the oculus, the eye of the dome, lets the light in.

```plank view=front-right,50
flat-x -7.5 15 16 repeat=6 offset=0,0,0 rot=339 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 14 17 repeat=6 offset=0,0,0 rot=9 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 13 18 repeat=6 offset=0,0,0 rot=39 rot-step=60 pivot=0,0 order=whole
flat-x -7.5 12 19 repeat=5 offset=0,0,0 rot=69 rot-step=72 pivot=0,0 order=whole
flat-x -7.5 11 20 repeat=5 offset=0,0,0 rot=105 rot-step=72 pivot=0,0 order=whole
flat-x -7.5 10 21 repeat=4 offset=0,0,0 rot=141 rot-step=90 pivot=0,0 order=whole
flat-x -7.5 9 22 repeat=4 offset=0,0,0 rot=186 rot-step=90 pivot=0,0 order=whole
flat-x -7.5 8 23 repeat=4 offset=0,0,0 rot=231 rot-step=90 pivot=0,0 order=whole
```

## Step 4: the columns

Build eight columns in a row in front of the drum: each one a stack of
twelve planks lying along the depth of the portico, with two plank widths
between two columns.

```plank view=front,15
flat-y -22.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y -16.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y -10.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y -4.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y 1.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y 7.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y 13.5 -44 0 repeat=12 offset=0,0,1 color=marble
flat-y 19.5 -44 0 repeat=12 offset=0,0,1 color=marble
```

## Step 5: the beams

Lay three planks end to end across the fronts of the columns, and three
more across their backs.

```plank view=front,15
flat-x -22.5 -44 12 color=marble
flat-x -7.5 -44 12 color=marble
flat-x 7.5 -44 12 color=marble
flat-x -22.5 -32 12 color=marble
flat-x -7.5 -32 12 color=marble
flat-x 7.5 -32 12 color=marble
```

## Step 6: the roof of the portico

Cover the beams with planks laid side by side, from the front to the back.
Then build the pediment: each layer one plank narrower on each
side, up to a single plank at the ridge.

```plank view=front,20
flat-y -22.5 -44 13 repeat=15 offset=3,0,0 order=whole color=stone
flat-y -19.5 -44 14 repeat=13 offset=3,0,0 order=whole color=stone
flat-y -16.5 -44 15 repeat=11 offset=3,0,0 order=whole color=stone
flat-y -13.5 -44 16 repeat=9 offset=3,0,0 order=whole color=stone
flat-y -10.5 -44 17 repeat=7 offset=3,0,0 order=whole color=stone
flat-y -7.5 -44 18 repeat=5 offset=3,0,0 order=whole color=stone
flat-y -4.5 -44 19 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -1.5 -44 20 repeat=1 offset=3,0,0 order=whole color=stone
```
