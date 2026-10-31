---
plankmd: "0.3"
title: Roman aqueduct
lang: en
inventory: 464
difficulty: 5
author: PlankMD contributors
license: CC0-1.0
date: 2026-10-31
tags: [aqueduct, arch, voussoir, rome, scaffold]
minutes: 120
view: front-right,18
palette:
  stone: "#cfc6b4"
  key: "#9c6b3c"
  water: "#3b6e8f"
---

# Roman aqueduct

Three true arches side by side, each one a fan of 37 planks on their edges
around the middle of its opening, with a keystone at the top. The water runs
on top, along a channel of blue planks. 358 planks, and a centring of
up to 106 planks that holds each arch while it is built.

## Step 1: the piers

Four piers of planks lying flat, stacked 6 high: a wide one at each end,
and a narrow one between two arches, just wide enough for the feet of both.

```plank
flat-y -23.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y -20.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y -17.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y -14.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 11.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 14.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 40.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 43.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 69.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 72.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 75.5 0 0 repeat=6 offset=0,0,1 color=stone
flat-y 78.5 0 0 repeat=6 offset=0,0,1 color=stone
```

## Step 2: the centring and the halves of arch 1

Build the centring between the two piers: a stepped stack of planks, as
wide as fits inside the arch. Then lay the arch from both feet at once, each
plank on its edge, a little more upright than the one below.

```plank view=front,10
scaffold flat-y -9 0 0 repeat=6 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 1 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 2 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 3 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 4 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 5 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 6 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 7 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 8 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 9 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -10.5 0 10 repeat=7 offset=3,0,0 until=key-1
scaffold flat-y -9 0 11 repeat=6 offset=3,0,0 until=key-1
scaffold flat-y -9 0 12 repeat=6 offset=3,0,0 until=key-1
scaffold flat-y -7.5 0 13 repeat=5 offset=3,0,0 until=key-1
scaffold flat-y -7.5 0 14 repeat=5 offset=3,0,0 until=key-1
scaffold flat-y -6 0 15 repeat=4 offset=3,0,0 until=key-1
scaffold flat-y -4.5 0 16 repeat=3 offset=3,0,0 until=key-1
scaffold flat-y -1.5 0 17 repeat=1 offset=3,0,0 until=key-1
edge-y -0.5 0 18 repeat=18 offset=0,0,0 tilt=x:-90 tilt-step=5 tilt-pivot=0,6.5
edge-y -0.5 0 18 repeat=18 offset=0,0,0 tilt=x:90 tilt-step=-5 tilt-pivot=0,6.5
```

## Step 3: the keystone of arch 1

Slide the keystone in, straight up: the arch is locked. Slide the centring
out along the length of its planks.

```plank view=front,10
edge-y -0.5 0 18 tilt=x:0 tilt-pivot=0,6.5 id=key-1 color=key
```

## Step 4: the centring and the halves of arch 2

Build the centring between the two piers: a stepped stack of planks, as
wide as fits inside the arch. Then lay the arch from both feet at once, each
plank on its edge, a little more upright than the one below.

```plank view=front,10
scaffold flat-y 20 0 0 repeat=6 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 1 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 2 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 3 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 4 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 5 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 6 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 7 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 8 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 9 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 18.5 0 10 repeat=7 offset=3,0,0 until=key-2
scaffold flat-y 20 0 11 repeat=6 offset=3,0,0 until=key-2
scaffold flat-y 20 0 12 repeat=6 offset=3,0,0 until=key-2
scaffold flat-y 21.5 0 13 repeat=5 offset=3,0,0 until=key-2
scaffold flat-y 21.5 0 14 repeat=5 offset=3,0,0 until=key-2
scaffold flat-y 23 0 15 repeat=4 offset=3,0,0 until=key-2
scaffold flat-y 24.5 0 16 repeat=3 offset=3,0,0 until=key-2
scaffold flat-y 27.5 0 17 repeat=1 offset=3,0,0 until=key-2
edge-y 28.5 0 18 repeat=18 offset=0,0,0 tilt=x:-90 tilt-step=5 tilt-pivot=29,6.5
edge-y 28.5 0 18 repeat=18 offset=0,0,0 tilt=x:90 tilt-step=-5 tilt-pivot=29,6.5
```

## Step 5: the keystone of arch 2

Slide the keystone in, straight up: the arch is locked. Slide the centring
out along the length of its planks.

```plank view=front,10
edge-y 28.5 0 18 tilt=x:0 tilt-pivot=29,6.5 id=key-2 color=key
```

## Step 6: the centring and the halves of arch 3

Build the centring between the two piers: a stepped stack of planks, as
wide as fits inside the arch. Then lay the arch from both feet at once, each
plank on its edge, a little more upright than the one below.

```plank view=front,10
scaffold flat-y 49 0 0 repeat=6 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 1 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 2 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 3 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 4 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 5 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 6 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 7 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 8 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 9 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 47.5 0 10 repeat=7 offset=3,0,0 until=key-3
scaffold flat-y 49 0 11 repeat=6 offset=3,0,0 until=key-3
scaffold flat-y 49 0 12 repeat=6 offset=3,0,0 until=key-3
scaffold flat-y 50.5 0 13 repeat=5 offset=3,0,0 until=key-3
scaffold flat-y 50.5 0 14 repeat=5 offset=3,0,0 until=key-3
scaffold flat-y 52 0 15 repeat=4 offset=3,0,0 until=key-3
scaffold flat-y 53.5 0 16 repeat=3 offset=3,0,0 until=key-3
scaffold flat-y 56.5 0 17 repeat=1 offset=3,0,0 until=key-3
edge-y 57.5 0 18 repeat=18 offset=0,0,0 tilt=x:-90 tilt-step=5 tilt-pivot=58,6.5
edge-y 57.5 0 18 repeat=18 offset=0,0,0 tilt=x:90 tilt-step=-5 tilt-pivot=58,6.5
```

## Step 7: the keystone of arch 3

Slide the keystone in, straight up: the arch is locked. Slide the centring
out along the length of its planks.

```plank view=front,10
edge-y 57.5 0 18 tilt=x:0 tilt-pivot=58,6.5 id=key-3 color=key
```

## Step 8: the spandrels

Fill the space above the piers, between the backs of the arches, layer
after layer: each layer a little wider than the one below, as the arches
curve away.

```plank view=front,12
flat-y -23.5 0 6 color=stone
flat-y -17.55 0 6 color=stone
flat-y 72.55 0 6 color=stone
flat-y 78.5 0 6 color=stone
flat-y -23.5 0 7 color=stone
flat-y -17.5414 0 7 color=stone
flat-y 72.5414 0 7 color=stone
flat-y 78.5 0 7 color=stone
flat-y -23.5 0 8 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -17.4725 0 8 color=stone
flat-y 72.4725 0 8 color=stone
flat-y 75.5 0 8 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 9 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -17.3336 0 9 color=stone
flat-y 72.3336 0 9 color=stone
flat-y 75.5 0 9 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 10 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -17.1228 0 10 color=stone
flat-y 72.1228 0 10 color=stone
flat-y 75.5 0 10 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 11 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -16.8366 0 11 color=stone
flat-y 71.8366 0 11 color=stone
flat-y 75.5 0 11 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 12 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -16.4704 0 12 color=stone
flat-y 71.4704 0 12 color=stone
flat-y 75.5 0 12 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 13 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -16.0174 0 13 color=stone
flat-y 71.0174 0 13 color=stone
flat-y 75.5 0 13 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 14 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -15.4681 0 14 color=stone
flat-y 12.4681 0 14 color=stone
flat-y 41.4681 0 14 color=stone
flat-y 70.4681 0 14 color=stone
flat-y 75.5 0 14 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 15 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -14.809 0 15 color=stone
flat-y 11.809 0 15 color=stone
flat-y 40.809 0 15 color=stone
flat-y 69.809 0 15 color=stone
flat-y 75.5 0 15 repeat=2 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 16 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -14.0205 0 16 color=stone
flat-y 11.0205 0 16 repeat=2 offset=3,0,0 order=whole color=stone
flat-y 40.0205 0 16 repeat=2 offset=3,0,0 order=whole color=stone
flat-y 69.0205 0 16 color=stone
flat-y 72.5 0 16 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 17 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -13.0724 0 17 color=stone
flat-y 10.0724 0 17 repeat=2 offset=3,0,0 order=whole color=stone
flat-y 39.0724 0 17 repeat=2 offset=3,0,0 order=whole color=stone
flat-y 68.0724 0 17 color=stone
flat-y 72.5 0 17 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 18 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -11.9136 0 18 color=stone
flat-y 8.9136 0 18 repeat=3 offset=3,0,0 order=whole color=stone
flat-y 37.9136 0 18 repeat=3 offset=3,0,0 order=whole color=stone
flat-y 66.9136 0 18 color=stone
flat-y 72.5 0 18 repeat=3 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 19 repeat=4 offset=3,0,0 order=whole color=stone
flat-y -10.4466 0 19 color=stone
flat-y 7.4466 0 19 repeat=4 offset=3,0,0 order=whole color=stone
flat-y 36.4466 0 19 repeat=4 offset=3,0,0 order=whole color=stone
flat-y 65.4466 0 19 color=stone
flat-y 69.5 0 19 repeat=4 offset=3,0,0 order=whole color=stone
flat-y -23.5 0 20 repeat=5 offset=3,0,0 order=whole color=stone
flat-y -8.427 0 20 color=stone
flat-y 5.427 0 20 repeat=6 offset=3,0,0 order=whole color=stone
flat-y 34.427 0 20 repeat=6 offset=3,0,0 order=whole color=stone
flat-y 63.427 0 20 color=stone
flat-y 66.5 0 20 repeat=5 offset=3,0,0 order=whole color=stone
```

## Step 9: the water channel

Cover the whole length with planks laid side by side: the bed of the
channel, where the water would run.

```plank
flat-x -23.5 0 21 repeat=5 offset=0,3,0 color=water
flat-x -8.5 0 21 repeat=5 offset=0,3,0 color=water
flat-x 6.5 0 21 repeat=5 offset=0,3,0 color=water
flat-x 21.5 0 21 repeat=5 offset=0,3,0 color=water
flat-x 36.5 0 21 repeat=5 offset=0,3,0 color=water
flat-x 51.5 0 21 repeat=5 offset=0,3,0 color=water
flat-x 66.5 0 21 repeat=5 offset=0,3,0 color=water
```
