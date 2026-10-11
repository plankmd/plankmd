---
plankmd: "0.1"
title: Step pyramid
lang: en
inventory: 180
difficulty: 3
license: CC0-1.0
palette:
  roof: "#b5532f"
---

# Step pyramid

A stepped pyramid inspired by the ziggurats and temple pyramids of the ancient world: four terraces, a stair up the front and a small temple on top. 173 planks.

## Step 1: the platform

Lay a big square of nine blocks, three by three. Each block is made of five planks side by side, touching. This single layer is the platform.

```plank
flat-x 0 0 0
flat-x 0 3 0
flat-x 0 6 0
flat-x 0 9 0
flat-x 0 12 0
flat-x 0 15 0
flat-x 0 18 0
flat-x 0 21 0
flat-x 0 24 0
flat-x 0 27 0
flat-x 0 30 0
flat-x 0 33 0
flat-x 0 36 0
flat-x 0 39 0
flat-x 0 42 0
flat-x 15 0 0
flat-x 15 3 0
flat-x 15 6 0
flat-x 15 9 0
flat-x 15 12 0
flat-x 15 15 0
flat-x 15 18 0
flat-x 15 21 0
flat-x 15 24 0
flat-x 15 27 0
flat-x 15 30 0
flat-x 15 33 0
flat-x 15 36 0
flat-x 15 39 0
flat-x 15 42 0
flat-x 30 0 0
flat-x 30 3 0
flat-x 30 6 0
flat-x 30 9 0
flat-x 30 12 0
flat-x 30 15 0
flat-x 30 18 0
flat-x 30 21 0
flat-x 30 24 0
flat-x 30 27 0
flat-x 30 30 0
flat-x 30 33 0
flat-x 30 36 0
flat-x 30 39 0
flat-x 30 42 0
```

## Step 2: the great terrace

Lay a smaller square in the middle of the platform, half a plank length from each edge: four blocks of five planks. Then lay a second layer with the planks turned across, and a third like the first. Keep the corners aligned.

```plank
# layer 1, z = 1
flat-x 7.5 7.5 1
flat-x 7.5 10.5 1
flat-x 7.5 13.5 1
flat-x 7.5 16.5 1
flat-x 7.5 19.5 1
flat-x 22.5 7.5 1
flat-x 22.5 10.5 1
flat-x 22.5 13.5 1
flat-x 22.5 16.5 1
flat-x 22.5 19.5 1
flat-x 7.5 22.5 1
flat-x 7.5 25.5 1
flat-x 7.5 28.5 1
flat-x 7.5 31.5 1
flat-x 7.5 34.5 1
flat-x 22.5 22.5 1
flat-x 22.5 25.5 1
flat-x 22.5 28.5 1
flat-x 22.5 31.5 1
flat-x 22.5 34.5 1
# layer 2, z = 2
flat-y 7.5 7.5 2
flat-y 10.5 7.5 2
flat-y 13.5 7.5 2
flat-y 16.5 7.5 2
flat-y 19.5 7.5 2
flat-y 22.5 7.5 2
flat-y 25.5 7.5 2
flat-y 28.5 7.5 2
flat-y 31.5 7.5 2
flat-y 34.5 7.5 2
flat-y 7.5 22.5 2
flat-y 10.5 22.5 2
flat-y 13.5 22.5 2
flat-y 16.5 22.5 2
flat-y 19.5 22.5 2
flat-y 22.5 22.5 2
flat-y 25.5 22.5 2
flat-y 28.5 22.5 2
flat-y 31.5 22.5 2
flat-y 34.5 22.5 2
# layer 3, z = 3
flat-x 7.5 7.5 3
flat-x 7.5 10.5 3
flat-x 7.5 13.5 3
flat-x 7.5 16.5 3
flat-x 7.5 19.5 3
flat-x 22.5 7.5 3
flat-x 22.5 10.5 3
flat-x 22.5 13.5 3
flat-x 22.5 16.5 3
flat-x 22.5 19.5 3
flat-x 7.5 22.5 3
flat-x 7.5 25.5 3
flat-x 7.5 28.5 3
flat-x 7.5 31.5 3
flat-x 7.5 34.5 3
flat-x 22.5 22.5 3
flat-x 22.5 25.5 3
flat-x 22.5 28.5 3
flat-x 22.5 31.5 3
flat-x 22.5 34.5 3
```

## Step 3: the middle terrace

Build a smaller terrace one plank width in from each edge (use a plank as a ruler, then take it away). Each layer is four groups of three planks that turn around a small empty square in the middle. On the next layer, mirror the groups. Three layers again.

```plank
# layer 1, z = 4
guide flat-y 7.5 10.5 4                     # one width in from the edge
flat-x 10.5 10.5 4
flat-x 10.5 13.5 4
flat-x 10.5 16.5 4
flat-y 25.5 10.5 4
flat-y 28.5 10.5 4
flat-y 31.5 10.5 4
flat-x 19.5 25.5 4
flat-x 19.5 28.5 4
flat-x 19.5 31.5 4
flat-y 10.5 19.5 4
flat-y 13.5 19.5 4
flat-y 16.5 19.5 4
# layer 2, z = 5
flat-x 19.5 10.5 5
flat-x 19.5 13.5 5
flat-x 19.5 16.5 5
flat-y 10.5 10.5 5
flat-y 13.5 10.5 5
flat-y 16.5 10.5 5
flat-x 10.5 25.5 5
flat-x 10.5 28.5 5
flat-x 10.5 31.5 5
flat-y 25.5 19.5 5
flat-y 28.5 19.5 5
flat-y 31.5 19.5 5
# layer 3, z = 6
flat-x 10.5 10.5 6
flat-x 10.5 13.5 6
flat-x 10.5 16.5 6
flat-y 25.5 10.5 6
flat-y 28.5 10.5 6
flat-y 31.5 10.5 6
flat-x 19.5 25.5 6
flat-x 19.5 28.5 6
flat-x 19.5 31.5 6
flat-y 10.5 19.5 6
flat-y 13.5 19.5 6
flat-y 16.5 19.5 6
```

## Step 4: the stair

Build the stair up the middle of the front: two planks stacked on the platform, against the great terrace, then two more planks stacked on the great terrace, against the middle terrace.

```plank
flat-x 15 4.5 1 repeat=2 offset=0,0,1
flat-x 15 7.5 4 repeat=2 offset=0,0,1
```

## Step 5: the temple walls

Build the temple on the top terrace. The walls are one plank thick, turning around like a pinwheel: three planks in each layer, mirrored on the next layer. The front stays open: that is the doorway. The last layer has one plank at each side and one at the back.

```plank
# layer 1, z = 7
flat-y 28.5 13.5 7
flat-x 16.5 28.5 7
flat-y 13.5 16.5 7
# layer 2, z = 8
flat-y 13.5 13.5 8
flat-x 13.5 28.5 8
flat-y 28.5 16.5 8
# layer 3, z = 9
flat-y 28.5 13.5 9
flat-x 16.5 28.5 9
flat-y 13.5 16.5 9
# layer 4, z = 10
flat-y 13.5 13.5 10
flat-x 13.5 28.5 10
flat-y 28.5 16.5 10
# layer 5, z = 11
flat-y 28.5 13.5 11
flat-x 16.5 28.5 11
flat-y 13.5 16.5 11
# layer 6, z = 12
flat-y 13.5 13.5 12
flat-y 28.5 13.5 12
flat-x 15 28.5 12
```

## Step 6: the roof

Cover the temple with a roof of coloured planks: six planks side by side, then three, then one on top.

```plank
flat-x 15 13.5 13 color=roof
flat-x 15 16.5 13 color=roof
flat-x 15 19.5 13 color=roof
flat-x 15 22.5 13 color=roof
flat-x 15 25.5 13 color=roof
flat-x 15 28.5 13 color=roof
flat-x 15 16.5 14 color=roof
flat-x 15 19.5 14 color=roof
flat-x 15 22.5 14 color=roof
flat-x 15 19.5 15 color=roof
```
