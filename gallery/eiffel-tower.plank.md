---
plankmd: "0.1"
title: Eiffel tower
lang: en
inventory: 180
difficulty: 4
license: CC0-1.0
palette:
  flag: "#b03a2e"
---

# Eiffel tower

A tapering iron tower inspired by the Eiffel Tower: four legs that lean towards each other, a first platform, a narrower upper section and a spire. 174 planks.

## Step 1: the foot of the legs

Build four square towers at the corners. Each tower is hollow: two planks along, then two planks across them, and so on, twice. To space the towers, lay one plank between them at the bottom as a ruler, then take it away, in both directions.

```plank
guide flat-x 15 0 0                         # gap between legs, along x: one length
guide flat-y 0 15 0                         # gap between legs, along y: one length
# leg from (0, 0)
flat-x 0 0 0 repeat=2 offset=0,0,2
flat-x 0 12 0 repeat=2 offset=0,0,2
flat-y 0 0 1 repeat=2 offset=0,0,2
flat-y 12 0 1 repeat=2 offset=0,0,2
# leg from (30, 0)
flat-x 30 0 0 repeat=2 offset=0,0,2
flat-x 30 12 0 repeat=2 offset=0,0,2
flat-y 30 0 1 repeat=2 offset=0,0,2
flat-y 42 0 1 repeat=2 offset=0,0,2
# leg from (0, 30)
flat-x 0 30 0 repeat=2 offset=0,0,2
flat-x 0 42 0 repeat=2 offset=0,0,2
flat-y 0 30 1 repeat=2 offset=0,0,2
flat-y 12 30 1 repeat=2 offset=0,0,2
# leg from (30, 30)
flat-x 30 30 0 repeat=2 offset=0,0,2
flat-x 30 42 0 repeat=2 offset=0,0,2
flat-y 30 30 1 repeat=2 offset=0,0,2
flat-y 42 30 1 repeat=2 offset=0,0,2
```

## Step 2: the legs lean in

Keep building the four legs together, layer by layer, but slide each tower half a plank width towards the middle of the base (both ways at once) on every new layer. five times. Build the four legs together so that they lean in step. At the top, a gap of one plank width must remain between neighbouring legs.

```plank
# leg from (0, 0)
flat-x 0 0 4 repeat=5 offset=1.5,1.5,2
flat-x 0 12 4 repeat=5 offset=1.5,1.5,2
flat-y 0 0 5 repeat=5 offset=1.5,1.5,2
flat-y 12 0 5 repeat=5 offset=1.5,1.5,2
# leg from (30, 0)
flat-x 30 0 4 repeat=5 offset=-1.5,1.5,2
flat-x 30 12 4 repeat=5 offset=-1.5,1.5,2
flat-y 30 0 5 repeat=5 offset=-1.5,1.5,2
flat-y 42 0 5 repeat=5 offset=-1.5,1.5,2
# leg from (0, 30)
flat-x 0 30 4 repeat=5 offset=1.5,-1.5,2
flat-x 0 42 4 repeat=5 offset=1.5,-1.5,2
flat-y 0 30 5 repeat=5 offset=1.5,-1.5,2
flat-y 12 30 5 repeat=5 offset=1.5,-1.5,2
# leg from (30, 30)
flat-x 30 30 4 repeat=5 offset=-1.5,-1.5,2
flat-x 30 42 4 repeat=5 offset=-1.5,-1.5,2
flat-y 30 30 5 repeat=5 offset=-1.5,-1.5,2
flat-y 42 30 5 repeat=5 offset=-1.5,-1.5,2
```

## Step 3: the first platform

Join the legs at the top. First lay ten planks along the width: five side by side over the two front legs, five over the two back legs, each one centred over the small gap between its two legs. Then lay five planks along the depth across them, to cover the gap between front and back.

```plank
flat-x 15 6 14
flat-x 15 9 14
flat-x 15 12 14
flat-x 15 15 14
flat-x 15 18 14
flat-x 15 24 14
flat-x 15 27 14
flat-x 15 30 14
flat-x 15 33 14
flat-x 15 36 14
flat-y 15 15 15
flat-y 18 15 15
flat-y 21 15 15
flat-y 24 15 15
flat-y 27 15 15
```

## Step 4: the main shaft

Build a hollow tower, one plank long and one plank deep, on the middle of the platform. Six times: two planks along, two across.

```plank
flat-x 15 15 16 repeat=6 offset=0,0,2
flat-x 15 27 16 repeat=6 offset=0,0,2
flat-y 15 15 17 repeat=6 offset=0,0,2
flat-y 27 15 17 repeat=6 offset=0,0,2
```

## Step 5: the second platform

Cover the shaft with five planks side by side.

```plank
flat-x 15 15 28
flat-x 15 18 28
flat-x 15 21 28
flat-x 15 24 28
flat-x 15 27 28
```

## Step 6: the upper section

The tower gets narrower: three planks side by side along the depth, stacked four layers high, in the middle of the platform.

```plank
flat-y 18 15 29 repeat=4 offset=0,0,1
flat-y 21 15 29 repeat=4 offset=0,0,1
flat-y 24 15 29 repeat=4 offset=0,0,1
```

## Step 7: the spire

Stack six planks on top of the middle column, and put a coloured plank at the very top.

```plank
flat-y 21 15 33
flat-y 21 15 34
flat-y 21 15 35
flat-y 21 15 36
flat-y 21 15 37
flat-y 21 15 38 color=flag
```
